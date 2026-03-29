import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, randomDigits } from "@/lib/auth";
import { registerRequestSchema } from "@/lib/schemas/register";
import { exposeVerificationCodesInApiResponse } from "@/lib/verification-flags";
import {
  deliverRegistrationCodes,
  isOtpDeliveryFullyConfigured,
} from "@/lib/verification-delivery";

/**
 * Справжня відправка email + SMS, якщо обидва канали налаштовані в .env.
 * У development раніше потрібно було ще й SEND_OTP_IN_DEV=true — тепер достатньо ключів.
 * SEND_OTP_IN_DEV=true лишається для спроби відправки, коли провайдери ще не повністю задані
 * (може повернути 502, якщо один із каналів впаде).
 */
function shouldSendOtp(): boolean {
  if (isOtpDeliveryFullyConfigured()) {
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
      if (!allowWithoutProviders && !isOtpDeliveryFullyConfigured()) {
        return NextResponse.json(
          {
            error:
              "Реєстрація тимчасово недоступна: налаштуйте відправку email та SMS (див. .env.example) або SHOW_VERIFICATION_CODES=true.",
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
    const emailCode = randomDigits(6);
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
          verificationCodes: {
            create: [
              { kind: "email", code: emailCode, expiresAt },
              { kind: "phone", code: phoneCode, expiresAt },
            ],
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

    const sendOtp = shouldSendOtp();
    const showCodes = exposeVerificationCodesInApiResponse();

    if (sendOtp) {
      const delivery = await deliverRegistrationCodes({
        email,
        phone,
        emailCode,
        phoneCode,
        name,
      });
      if (!delivery.ok) {
        await prisma.user.delete({ where: { id: user.id } });
        const hint =
          delivery.reason === "email"
            ? "Не вдалося надіслати лист. Перевірте Resend/SMTP та EMAIL_FROM."
            : delivery.reason === "sms"
              ? "Не вдалося надіслати SMS. Перевірте Twilio або Vonage (.env), SMS_PROVIDER, формат номера (+380…)."
              : "Не вдалося надіслати коди на email і телефон.";
        return NextResponse.json(
          {
            error: hint,
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
            devCodes: { email: emailCode, phone: phoneCode },
            message: sendOtp
              ? "Коди надіслано на email та SMS. (У відповіді також показано для зручності.)"
              : "Коди підтвердження (режим розробки): введіть їх на сторінці підтвердження.",
          }
        : {
            message: "На email та телефон надіслано коди підтвердження.",
          }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
