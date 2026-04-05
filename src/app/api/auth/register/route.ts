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

    const { email, password, name } = parsed.data;

    if (!canCompleteRegistrationInProduction()) {
      return NextResponse.json(
        {
          error:
            "Реєстрація тимчасово недоступна: у Vercel → Environment Variables (Production) налаштуйте пошту. Варіант без Resend: SMTP_HOST, EMAIL_FROM, SMTP_USER, SMTP_PASSWORD (порт 587, див. .env.example — Brevo, Gmail тощо). Якщо SMTP — приберіть або не задавайте RESEND_API_KEY. Або Resend: лише RESEND_API_KEY. Тест: SHOW_VERIFICATION_CODES=true (не для продакшену).",
        },
        { status: 503 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Цей email уже зареєстрований" },
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
            phone: null,
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
            { error: "Цей email уже зареєстрований" },
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
          phone: null,
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
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "База даних недоступна. На Vercel SQLite (file:…) не підходить — підключіть Postgres (Neon, Supabase, Vercel Postgres), задайте DATABASE_URL у Environment Variables і виконайте prisma db push до цієї БД.",
        },
        { status: 503 },
      );
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const conn = new Set([
        "P1000",
        "P1001",
        "P1002",
        "P1003",
        "P1011",
        "P1017",
      ]);
      if (conn.has(e.code)) {
        return NextResponse.json(
          {
            error: `Не вдається з’єднатися з базою (${e.code}). Перевірте DATABASE_URL і доступність сервера БД.`,
          },
          { status: 503 },
        );
      }
    }
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
