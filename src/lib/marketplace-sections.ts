/** Стабільні ідентифікатори розділів (зберігаються в БД). */
export const LISTING_SECTION_IDS = [
  "general",
  "auto_moto",
  "real_estate",
  "electronics",
  "home_garden",
  "fashion",
  "sport_hobby",
  "kids",
  "pets",
  "business_industrial",
] as const;

export type ListingSectionId = (typeof LISTING_SECTION_IDS)[number];

export function isListingSectionId(v: string): v is ListingSectionId {
  return (LISTING_SECTION_IDS as readonly string[]).includes(v);
}
