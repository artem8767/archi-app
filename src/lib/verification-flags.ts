/** Чи показувати коди в JSON відповіді API (dev або SHOW_VERIFICATION_CODES). */
export function exposeVerificationCodesInApiResponse(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SHOW_VERIFICATION_CODES === "true";
}
