import { NextResponse } from "next/server";
import { z } from "zod";
import { randomDigits } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exposeVerificationCodesInApiResponse } from "@/lib/verification-flags";
import {
  isSmsDeliveryConfigured,
  sendVerificationSms,
} from "@/lib/verification-sms";

const RESEND_COOLDOWN_MS = 60_000;

const bodySchema = z.object({
  email: z.string().trim().email("Некоректний email"),
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Некоректне тіло запиту (очікується JSON)" },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "Перевірте дані запиту";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Користувача з таким email не знайдено" },
        { status: 404 }
      );
    }

    if (user.phoneVerified) {
      return NextResponse.json(
        { error: "Обліковий запис уже підтверджено" },
        { status: 400 }
      );
    }

    const kind = "phone" as const;
    const now = new Date();
    const last = await prisma.verificationCode.findFirst({
      where: { userId: user.id, kind },
      orderBy: { createdAt: "desc" },
    });

    if (last) {
      const elapsed = now.getTime() - last.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const retryAfterSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Занадто часто. Спробуйте ще раз через ${retryAfterSec} с.`,
            retryAfterSec,
          },
          { status: 429 }
        );
      }
    }

    const newCode = randomDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const showDevCode = exposeVerificationCodesInApiResponse();

    if (isSmsDeliveryConfigured()) {
      try {
        await sendVerificationSms(user.phone, newCode);
      } catch (e) {
        console.error("[resend-code sms]", e);
        return NextResponse.json(
          {
            error:
              "Не вдалося надіслати SMS. Перевірте Twilio/Vonage та номер телефону.",
            ...(process.env.NODE_ENV !== "production" && e instanceof Error
              ? { detail: e.message }
              : {}),
          },
          { status: 502 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Відправка SMS не налаштована. Додайте Twilio або Vonage у .env.",
        },
        { status: 503 }
      );
    }

    await prisma.$transaction([
      prisma.verificationCode.deleteMany({
        where: { userId: user.id, kind },
      }),
      prisma.verificationCode.create({
        data: {
          userId: user.id,
          kind,
          code: newCode,
          expiresAt,
        },
      }),
    ]);

    const payload: Record<string, unknown> = {
      ok: true,
      message: "Новий код надіслано в SMS.",
    };

    if (showDevCode && !isSmsDeliveryConfigured()) {
      payload.devCode = newCode;
      payload.message =
        "Провайдер не налаштовано — код для тесту в відповіді API.";
    }

    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
