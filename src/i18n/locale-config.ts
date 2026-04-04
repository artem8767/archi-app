/**
 * Єдине джерело підтримуваних мов. Перша — англійська (routing.defaultLocale, порядок у перемикачах).
 */
export const LOCALE_CODES = [
  "en",
  "cs",
  "uk",
  "pl",
  "de",
  "sk",
  "vi",
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
  en: "English",
  cs: "Čeština",
  uk: "Українська (Україна)",
  pl: "Polski",
  de: "Deutsch",
  sk: "Slovenčina",
  vi: "Tiếng Việt",
  fr: "Français",
  ru: "Русский",
};
