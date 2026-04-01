import { isSmsDeliveryConfigured, sendVerificationSms } from "@/lib/verification-sms";

/** Реєстрація: потрібен лише SMS (email не підтверджується кодом). */
export function isRegistrationSmsConfigured(): boolean {
  return isSmsDeliveryConfigured();
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: "sms"; message: string };

export async function deliverRegistrationSmsOnly(params: {
  phone: string;
  phoneCode: string;
}): Promise<DeliveryResult> {
  try {
    await sendVerificationSms(params.phone, params.phoneCode);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[verification-sms]", e);
    return { ok: false, reason: "sms", message };
  }
}
