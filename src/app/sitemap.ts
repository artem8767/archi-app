import type { MetadataRoute } from "next";
import { LOCALE_CODES } from "@/i18n/locale-config";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

/** Public routes (per locale prefix), excluding API and downloads. */
const PATHS = [
  "",
  "/about",
  "/privacy",
  "/terms",
  "/news",
  "/chat",
  "/sell",
  "/buy",
  "/rent",
  "/service-offer",
  "/service-seek",
  "/jobs",
  "/settings",
  "/auth/login",
  "/auth/register",
  "/auth/verify",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    for (const locale of LOCALE_CODES) {
      const url = `${base}/${locale}${path}`;
      const languages: Record<string, string> = Object.fromEntries(
        LOCALE_CODES.map((l) => [l, `${base}/${l}${path}`])
      );
      languages["x-default"] = `${base}/${routing.defaultLocale}${path}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/about" ? 0.9 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
