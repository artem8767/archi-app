import { isEmailDeliveryConfigured } from "@/lib/verification-email";

/**
 * Підтвердження реєстрації лише через email (Resend / SMTP).
 */
export function resolveRegistrationVerificationChannel(): "email" | null {
  return isEmailDeliveryConfigured() ? "email" : null;
}

export function canCompleteRegistrationInProduction(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.SHOW_VERIFICATION_CODES === "true") return true;
  return resolveRegistrationVerificationChannel() !== null;
}
