/** Публічне посилання на сторінку застосунку в Google Play (NEXT_PUBLIC_PLAY_STORE_URL). */

export function getPlayStoreUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hasApkDownloadConfigured(): boolean {
  const raw = process.env.ANDROID_APK_DOWNLOAD_URL?.trim();
  return Boolean(raw);
}
