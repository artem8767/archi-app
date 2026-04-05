import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, randomDigits } from "@/lib/auth";
import { registerRequestSchema } from "@/lib/schemas/register";
import {
  canCompleteRegistrationInProduction,
  resolveRegistrationVerificationChannel,
} from "@/lib/registration-verification";
import { exposeVerificationCodesInApiResponse } from "@/lib/verification-flags";
import { deliverRegistrationEmail } from "@/lib/verification-delivery";
import { DEFAULT_UI_THEME } from "@/lib/ui-theme";

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

    if (!canCompleteRegistrationInProduction()) {
      return NextResponse.json(
        {
          error:
            "Реєстрація тимчасово недоступна: у Vercel → Environment Variables для Production додайте RESEND_API_KEY (одного ключа достатньо — лист піде через Resend). Або SMTP_HOST + EMAIL_FROM. Див. .env.example. Тест: SHOW_VERIFICATION_CODES=true (не для продакшену).",
        },
        { status: 503 }
      );
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
    const code = randomDigits(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const showCodes = exposeVerificationCodesInApiResponse();
    const channel = resolveRegistrationVerificationChannel();

    let user;

    if (channel === "email") {
      try {
        user = await prisma.user.create({
          data: {
            email,
            phone,
            passwordHash,
            name: name ?? null,
            emailVerified: false,
            phoneVerified: false,
            uiTheme: DEFAULT_UI_THEME,
            verificationCodes: {
              create: [{ kind: "email", code, expiresAt }],
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

      const delivery = await deliverRegistrationEmail({
        email,
        code,
        name,
      });
      if (!delivery.ok) {
        await prisma.user.delete({ where: { id: user.id } });
        return NextResponse.json(
          {
            error:
              "Не вдалося надіслати лист із кодом. Перевірте RESEND_API_KEY / SMTP у .env та EMAIL_FROM.",
            ...(process.env.NODE_ENV !== "production"
              ? { detail: delivery.message }
              : {}),
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        userId: user.id,
        verificationChannel: "email" as const,
        ...(showCodes
          ? {
              devCodes: { code },
              message:
                "Код надіслано на email. (У відповіді також показано для зручності.)",
            }
          : {
              message: "Код підтвердження надіслано на вашу електронну пошту.",
            }),
      });
    }

    /* Немає email-провайдера: лише dev або prod із SHOW_VERIFICATION_CODES */
    try {
      user = await prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          name: name ?? null,
          emailVerified: false,
          phoneVerified: false,
          uiTheme: DEFAULT_UI_THEME,
          verificationCodes: {
            create: [{ kind: "email", code, expiresAt }],
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

    const noChannelHint =
      process.env.NODE_ENV !== "production"
        ? " Додайте Resend/SMTP у .env, щоб код приходив на пошту."
        : "";

    return NextResponse.json({
      ok: true,
      userId: user.id,
      verificationChannel: "none" as const,
      ...(showCodes
        ? {
            devCodes: { code },
            message: `Провайдер листа не налаштовано — використайте код з відповіді.${noChannelHint}`,
          }
        : {
            message: `Обліковий запис створено.${noChannelHint}`,
          }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
