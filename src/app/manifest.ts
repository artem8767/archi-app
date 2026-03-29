import type { MetadataRoute } from "next";
import { getPlayStoreUrl } from "@/lib/app-stores";
import { routing } from "@/i18n/routing";

export default function manifest(): MetadataRoute.Manifest {
  const playUrl = getPlayStoreUrl();

  const appId = playUrl ? extractPlayAppId(playUrl) : undefined;

  return {
    name: "АРЧІ",
    short_name: "АРЧІ",
    description: "News, classifieds, chat",
    start_url: `/${routing.defaultLocale}`,
    display: "standalone",
    background_color: "#12150e",
    theme_color: "#6c7a42",
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
