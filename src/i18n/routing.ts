import { defineRouting } from "next-intl/routing";
import { LOCALE_CODES, LOCALE_LABELS, type AppLocale } from "./locale-config";

export const routing = defineRouting({
  locales: [...LOCALE_CODES],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = AppLocale;

export const localeNames = LOCALE_LABELS;
