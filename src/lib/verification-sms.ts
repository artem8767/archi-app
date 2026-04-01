import { APP_BRAND_NAME } from "@/lib/brand";

/**
 * SMS для кодів підтвердження: Twilio або Vonage (Nexmo).
 * Номер у форматі E.164 (+380…). Без «+» у полі вводу — додається код країни з
 * SMS_DEFAULT_COUNTRY_CODE або (для сумісності) TWILIO_DEFAULT_COUNTRY_CODE.
 */

function defaultCountryCode(): string {
  const fromSms = process.env.SMS_DEFAULT_COUNTRY_CODE?.replace(/\D/g, "");
  if (fromSms) return fromSms;
  return (process.env.TWILIO_DEFAULT_COUNTRY_CODE || "").replace(/\D/g, "");
}

export function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const ms = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  return Boolean(sid && token && (from || ms));
}

export function isVonageConfigured(): boolean {
  const key = process.env.VONAGE_API_KEY?.trim();
  const secret = process.env.VONAGE_API_SECRET?.trim();
  const from =
    process.env.VONAGE_FROM?.trim() || process.env.VONAGE_BRAND?.trim();
  return Boolean(key && secret && from);
}

export function isSmsDeliveryConfigured(): boolean {
  return isTwilioConfigured() || isVonageConfigured();
}

export function normalizePhoneE164(raw: string): string {
  const trimmed = raw.replace(/\s/g, "");
  if (trimmed.startsWith("+")) return trimmed;

  const cc = defaultCountryCode();
  if (!cc) {
    return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
  }

  const digits = trimmed.replace(/\D/g, "").replace(/^0+/, "");
  return `+${cc}${digits}`;
}

type SmsBackend = "twilio" | "vonage";

function resolveSmsBackend(): SmsBackend {
  const explicit = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (explicit === "twilio") {
    if (!isTwilioConfigured()) {
      throw new Error("SMS_PROVIDER=twilio, але змінні Twilio не заповнені");
    }
    return "twilio";
  }
  if (explicit === "vonage") {
    if (!isVonageConfigured()) {
      throw new Error("SMS_PROVIDER=vonage, але змінні Vonage не заповнені");
    }
    return "vonage";
  }
  if (explicit) {
    throw new Error(`Невідомий SMS_PROVIDER="${explicit}" (очікується twilio або vonage)`);
  }
  if (isTwilioConfigured()) return "twilio";
  if (isVonageConfigured()) return "vonage";
  throw new Error("SMS не налаштовано (Twilio або Vonage)");
}

function smsText(code: string): string {
  return `${APP_BRAND_NAME}: код підтвердження телефону ${code}. Дійсний 15 хв.`;
}

async function sendViaTwilio(phone: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const messagingSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (!sid || !token || (!from && !messagingSid)) {
    throw new Error("Twilio env vars incomplete");
  }

  const to = normalizePhoneE164(phone);
  const body = smsText(code);

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("Body", body);
  if (messagingSid) {
    params.set("MessagingServiceSid", messagingSid);
  } else if (from) {
    params.set("From", from);
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`Twilio ${r.status}: ${errText}`);
  }
}

/** Vonage SMS API (класичний REST). https://developer.vonage.com/messaging/sms/overview */
async function sendViaVonage(phone: string, code: string): Promise<void> {
  const apiKey = process.env.VONAGE_API_KEY?.trim();
  const apiSecret = process.env.VONAGE_API_SECRET?.trim();
  const from =
    process.env.VONAGE_FROM?.trim() || process.env.VONAGE_BRAND?.trim();
  if (!apiKey || !apiSecret || !from) {
    throw new Error("VONAGE_API_KEY / VONAGE_API_SECRET / VONAGE_FROM missing");
  }

  const e164 = normalizePhoneE164(phone);
  const to = e164.replace(/^\+/, "");
  const text = smsText(code);

  const params = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    to,
    from,
    text,
  });

  const r = await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error(`Vonage HTTP ${r.status}: ${errText}`);
  }

  const j = (await r.json()) as {
    messages?: Array<{ status?: string; "error-text"?: string }>;
  };
  const m = j.messages?.[0];
  if (!m || m.status !== "0") {
    const err = m?.["error-text"] ?? m?.status ?? "unknown";
    throw new Error(`Vonage: ${err}`);
  }
}

export async function sendVerificationSms(
  phone: string,
  code: string
): Promise<void> {
  const backend = resolveSmsBackend();
  if (backend === "twilio") {
    await sendViaTwilio(phone, code);
    return;
  }
  await sendViaVonage(phone, code);
}
