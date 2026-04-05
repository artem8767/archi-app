import nodemailer from "nodemailer";
import { APP_BRAND_NAME } from "@/lib/brand";

/**
 * Якщо задано лише `RESEND_API_KEY`, Resend дозволяє слати з тестового адреса без власного домену.
 * Для продакшену з власним доменом задайте `EMAIL_FROM` (верифікований у Resend).
 */
const RESEND_FALLBACK_FROM = `${APP_BRAND_NAME} <onboarding@resend.dev>`;

function subject() {
  return `${APP_BRAND_NAME} — код підтвердження email`;
}

function htmlBody(code: string, name?: string | null) {
  const greet = name ? `Вітаємо, ${name}!` : "Вітаємо!";
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b;">
  <p>${greet}</p>
  <p>Ваш код підтвердження email для <strong>${APP_BRAND_NAME}</strong>:</p>
  <p style="font-size: 28px; font-weight: bold; letter-spacing: 0.2em;">${code}</p>
  <p style="color: #64748b; font-size: 14px;">Код дійсний 15 хвилин. Якщо ви не реєструвалися — проігноруйте лист.</p>
</body>
</html>`;
}

function textBody(code: string, name?: string | null) {
  const greet = name ? `Вітаємо, ${name}!` : "Вітаємо!";
  return `${greet}\n\nКод підтвердження email для ${APP_BRAND_NAME}: ${code}\n\nДійсний 15 хвилин.`;
}

export type EmailEnv = Record<string, string | undefined>;

/**
 * SMTP без логіна/пароля майже ніколи не працює в хмарі (Brevo, Gmail тощо).
 * Для рідкісного relay без auth: SMTP_ALLOW_NO_AUTH=true.
 */
export function isEmailDeliveryConfiguredFromEnv(env: EmailEnv): boolean {
  if (env.RESEND_API_KEY?.trim()) return true;
  const smtpHost = env.SMTP_HOST?.trim();
  const fromSmtp = env.EMAIL_FROM?.trim();
  if (!smtpHost || !fromSmtp) return false;
  if (env.SMTP_ALLOW_NO_AUTH === "true") return true;
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASSWORD?.trim();
  return Boolean(user && pass);
}

export function isEmailDeliveryConfigured(): boolean {
  return isEmailDeliveryConfiguredFromEnv(process.env);
}

async function sendViaResend(
  to: string,
  code: string,
  name?: string | null
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || RESEND_FALLBACK_FROM;
  if (!key) throw new Error("RESEND_API_KEY missing");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: subject(),
      html: htmlBody(code, name),
      text: textBody(code, name),
    }),
  });

  if (!r.ok) {
    const errText = await r.text();
    let detail = errText;
    try {
      const j = JSON.parse(errText) as { message?: string };
      if (j?.message) detail = j.message;
    } catch {
      /* raw text */
    }
    throw new Error(`Resend ${r.status}: ${detail}`);
  }
}

async function sendViaSmtp(
  to: string,
  code: string,
  name?: string | null
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!host || !from) throw new Error("SMTP_HOST / EMAIL_FROM missing");

  const port = Number(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim() ?? "";
  const pass = process.env.SMTP_PASSWORD?.trim() ?? "";
  if (!user || !pass) {
    if (process.env.SMTP_ALLOW_NO_AUTH !== "true") {
      throw new Error(
        "SMTP_USER і SMTP_PASSWORD обов’язкові (для Brevo — логін і SMTP-ключ з консолі). Або додайте RESEND_API_KEY.",
      );
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    subject: subject(),
    text: textBody(code, name),
    html: htmlBody(code, name),
  });
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  name?: string | null
): Promise<void> {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend(to, code, name);
    return;
  }
  if (process.env.SMTP_HOST?.trim()) {
    await sendViaSmtp(to, code, name);
    return;
  }
  throw new Error("Email delivery not configured (Resend or SMTP)");
}
