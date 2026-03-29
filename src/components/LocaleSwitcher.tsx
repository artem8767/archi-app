"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[10rem]">
      <label htmlFor="locale-switcher" className="sr-only">
        {t("language")}
      </label>
      <select
        id="locale-switcher"
        className="w-full cursor-pointer rounded-md border border-zone-edge bg-zone-deep/90 px-2 py-1.5 text-sm text-zone-fog transition hover:border-archi-700/50 focus:border-archi-500 focus:outline-none focus:ring-2 focus:ring-archi-400/50 sm:max-w-[13rem]"
        value={locale}
        aria-label={t("language")}
        onChange={(e) => {
          const next = e.target.value as (typeof routing.locales)[number];
          router.replace(pathname, { locale: next });
        }}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
