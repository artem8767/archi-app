/**
 * Єдине джерело підтримуваних мов. Основна мова — англійська (див. routing.defaultLocale).
 */
export const LOCALE_CODES = [
  "en",
  "uk",
  "cs",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "pl",
  "sk",
  "ru",
  "tr",
  "vi",
  "ja",
  "zh",
  "mn",
] as const;

export type AppLocale = (typeof LOCALE_CODES)[number];

/** Для z.enum (потрібен кортеж мінімум з одного елемента) */
export const LOCALE_CODES_FOR_ZOD = LOCALE_CODES as unknown as [
  AppLocale,
  ...AppLocale[],
];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  uk: "Українська (Україна)",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  cs: "Čeština",
  sk: "Slovenčina",
  ru: "Русский",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  ja: "日本語",
  zh: "中文（简体）",
  mn: "Монгол",
};
