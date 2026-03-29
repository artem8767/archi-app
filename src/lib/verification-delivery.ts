import {
  isEmailDeliveryConfigured,
  sendVerificationEmail,
} from "@/lib/verification-email";
import { isSmsDeliveryConfigured, sendVerificationSms } from "@/lib/verification-sms";

export function isOtpDeliveryFullyConfigured(): boolean {
  return isEmailDeliveryConfigured() && isSmsDeliveryConfigured();
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: "email" | "sms" | "both"; message: string };

export async function deliverRegistrationCodes(params: {
  email: string;
  phone: string;
  emailCode: string;
  phoneCode: string;
  name?: string | null;
}): Promise<DeliveryResult> {
  const { email, phone, emailCode, phoneCode, name } = params;

  let emailErr: Error | null = null;
  let smsErr: Error | null = null;

  const [emailSettled, smsSettled] = await Promise.allSettled([
    sendVerificationEmail(email, emailCode, name),
    sendVerificationSms(phone, phoneCode),
  ]);

  if (emailSettled.status === "rejected") {
    const e = emailSettled.reason;
    emailErr = e instanceof Error ? e : new Error(String(e));
    console.error("[verification-email]", emailErr);
  }
  if (smsSettled.status === "rejected") {
    const e = smsSettled.reason;
    smsErr = e instanceof Error ? e : new Error(String(e));
    console.error("[verification-sms]", smsErr);
  }

  if (emailErr && smsErr) {
    return {
      ok: false,
      reason: "both",
      message: `${emailErr.message}; ${smsErr.message}`,
    };
  }
  if (emailErr) {
    return { ok: false, reason: "email", message: emailErr.message };
  }
  if (smsErr) {
    return { ok: false, reason: "sms", message: smsErr.message };
  }
  return { ok: true };
}
