import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPlayStoreUrl } from "@/lib/app-stores";
import { APP_BRAND_NAME } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  const playUrl = getPlayStoreUrl();

  const appId = playUrl ? extractPlayAppId(playUrl) : undefined;

  return {
    name: APP_BRAND_NAME,
    short_name: APP_BRAND_NAME,
    description: "News, classifieds, chat",
    start_url: `/${routing.defaultLocale}`,
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#059669",
    lang: routing.defaultLocale,
    ...(playUrl
      ? {
          related_applications: [
            {
              platform: "play",
              url: playUrl,
              ...(appId ? { id: appId } : {}),
            },
          ],
        }
      : {}),
  };
}

/** Google очікує id пакета для Android; витягуємо з query ?id= якщо є. */
function extractPlayAppId(playUrl: string): string | undefined {
  try {
    const id = new URL(playUrl).searchParams.get("id");
    return id ?? undefined;
  } catch {
    return undefined;
  }
}
