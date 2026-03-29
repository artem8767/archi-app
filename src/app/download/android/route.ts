import { NextResponse } from "next/server";
import { getPlayStoreUrl } from "@/lib/app-stores";

/**
 * Стабільне посилання для QR: https://your-domain/download/android
 * 1) Якщо задано NEXT_PUBLIC_PLAY_STORE_URL — редирект у Google Play.
 * 2) Інакше ANDROID_APK_DOWNLOAD_URL — прямий APK (EAS, S3…).
 */
export async function GET() {
  const play = getPlayStoreUrl();
  if (play) {
    return NextResponse.redirect(play, 302);
  }

  const raw = process.env.ANDROID_APK_DOWNLOAD_URL?.trim() ?? "";
  if (!raw) {
    return new NextResponse(
      "Не налаштовано: задай NEXT_PUBLIC_PLAY_STORE_URL (Google Play) або ANDROID_APK_DOWNLOAD_URL (APK) на сервері.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return new NextResponse("Некоректний ANDROID_APK_DOWNLOAD_URL.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (url.protocol !== "https:") {
    return new NextResponse("Дозволено лише https:// посилання для APK.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.redirect(url.toString(), 302);
}
