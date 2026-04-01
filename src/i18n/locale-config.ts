/**
 * Єдине джерело підтримуваних мов (cs, uk, pl, de, sk, vi, en, fr, ru).
 * Основна мова — англійська (див. routing.defaultLocale).
 */
export const LOCALE_CODES = [
  "cs",
  "uk",
  "pl",
  "de",
  "sk",
  "vi",
  "en",
  "fr",
  "ru",
] as const;

export type AppLocale = (typeof LOCALE_CODES)[number];

/** Для z.enum (потрібен кортеж мінімум з одного елемента) */
export const LOCALE_CODES_FOR_ZOD = LOCALE_CODES as unknown as [
  AppLocale,
  ...AppLocale[],
];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  cs: "Čeština",
  uk: "Українська (Україна)",
  pl: "Polski",
  de: "Deutsch",
  sk: "Slovenčina",
  vi: "Tiếng Việt",
  en: "English",
  fr: "Français",
  ru: "Русский",
};
