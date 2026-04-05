import { sendVerificationEmail } from "@/lib/verification-email";

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: "email"; message: string };

export async function deliverRegistrationEmail(params: {
  email: string;
  code: string;
  name?: string | null;
}): Promise<DeliveryResult> {
  try {
    await sendVerificationEmail(params.email, params.code, params.name);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[verification-email]", e);
    return { ok: false, reason: "email", message };
  }
}
