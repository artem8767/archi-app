/**
 * Підпис і контакти розробника (підвал, «Про застосунок», meta authors).
 * Усі значення лише з .env / .env.local — див. .env.example (не комітьте справжні дані в git).
 */
export type SiteDeveloperCredit = {
  name: string;
  url?: string;
  email?: string;
  phone?: string;
};

export function getSiteDeveloperCredit(): SiteDeveloperCredit | null {
  const name = process.env.NEXT_PUBLIC_SITE_DEVELOPER?.trim();
  if (!name) return null;

  const url = process.env.NEXT_PUBLIC_SITE_DEVELOPER_URL?.trim();
  const email = process.env.NEXT_PUBLIC_SITE_DEVELOPER_EMAIL?.trim();
  const phone = process.env.NEXT_PUBLIC_SITE_DEVELOPER_PHONE?.trim();

  return {
    name,
    ...(url ? { url } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };
}
