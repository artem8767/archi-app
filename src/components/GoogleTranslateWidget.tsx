"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { BRAND_NO_TRANSLATE_SELECTOR } from "@/lib/brand";
import { LOCALE_CODES } from "@/i18n/locale-config";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          opts: { pageLanguage: string; includedLanguages?: string },
          id: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const SUPPORTED = [...LOCALE_CODES].join(",");

export function GoogleTranslateWidget({
  enabled,
  pageLanguage = "en",
}: {
  enabled: boolean;
  pageLanguage?: string;
}) {
  const t = useTranslations("common");
  const injected = useRef(false);

  /** Google Translate змінює DOM; повторно фіксуємо маркери «не перекладати» для бренду. */
  useEffect(() => {
    if (!enabled) return;
    const mark = () => {
      document.querySelectorAll(BRAND_NO_TRANSLATE_SELECTOR).forEach((el) => {
        el.classList.add("notranslate");
        el.setAttribute("translate", "no");
        if (el instanceof HTMLElement && !el.getAttribute("lang")) {
          el.setAttribute("lang", "en");
        }
      });
    };
    mark();
    const mo = new MutationObserver(() => mark());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || injected.current) return;
    injected.current = true;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const el = document.getElementById("google_translate_element");
      if (!el) return;
      const lang = SUPPORTED.split(",").includes(pageLanguage)
        ? pageLanguage
        : "en";
      new window.google.translate.TranslateElement(
        {
          pageLanguage: lang,
          includedLanguages: SUPPORTED,
        },
        "google_translate_element"
      );
    };

    const s = document.createElement("script");
    s.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);

    return () => {
      s.remove();
    };
  }, [enabled, pageLanguage]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-2 right-2 z-[9999] max-w-[200px] rounded-lg border border-zone-edge bg-zone-panel p-2">
      <p className="mb-1 text-xs text-zone-muted">{t("googleTranslateLabel")}</p>
      <div id="google_translate_element" />
    </div>
  );
}
