import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, randomDigits } from "@/lib/auth";
import { registerRequestSchema } from "@/lib/schemas/register";
import { exposeVerificationCodesInApiResponse } from "@/lib/verification-flags";
import {
  deliverRegistrationSmsOnly,
  isRegistrationSmsConfigured,
} from "@/lib/verification-delivery";

function shouldSendSms(): boolean {
  if (isRegistrationSmsConfigured()) {
    return true;
  }
  if (process.env.NODE_ENV !== "production") {
    return process.env.SEND_OTP_IN_DEV === "true";
  }
  return false;
}

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

    const parsed = registerRequestSchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "Перевірте введені дані";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, phone, password, name } = parsed.data;

    if (process.env.NODE_ENV === "production") {
      const allowWithoutProviders =
        process.env.SHOW_VERIFICATION_CODES === "true";
      if (!allowWithoutProviders && !isRegistrationSmsConfigured()) {
        return NextResponse.json(
          {
            error:
              "Реєстрація тимчасово недоступна: налаштуйте відправку SMS (Twilio/Vonage, див. .env.example) або SHOW_VERIFICATION_CODES=true.",
          },
          { status: 503 }
        );
      }
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Цей email або телефон уже зареєстровані" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const phoneCode = randomDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          name: name ?? null,
          emailVerified: true,
          verificationCodes: {
            create: [{ kind: "phone", code: phoneCode, expiresAt }],
          },
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Цей email або телефон уже зареєстровані" },
          { status: 409 }
        );
      }
      throw e;
    }

    const sendSms = shouldSendSms();
    const showCodes = exposeVerificationCodesInApiResponse();

    if (sendSms) {
      const delivery = await deliverRegistrationSmsOnly({
        phone,
        phoneCode,
      });
      if (!delivery.ok) {
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          {
            error:
              "Не вдалося надіслати SMS. Перевірте Twilio або Vonage (.env), SMS_PROVIDER, формат номера (+380…).",
            ...(process.env.NODE_ENV !== "production"
              ? { detail: delivery.message }
              : {}),
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      ...(showCodes
        ? {
            devCodes: { phone: phoneCode },
            message: sendSms
              ? "Код надіслано в SMS. (У відповіді також показано для зручності.)"
              : "Код підтвердження телефону (режим розробки): введіть його на сторінці підтвердження.",
          }
        : {
            message: "На телефон надіслано код підтвердження.",
          }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
