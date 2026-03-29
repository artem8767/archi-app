/** YouTube video id from common URL shapes, or null. */
export function parseYoutubeVideoId(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embed) return embed[1];
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];
    }
    return null;
  } catch {
    return null;
  }
}

export function isDirectVideoUrl(url: string): boolean {
  try {
    const p = new URL(url.trim()).pathname.toLowerCase();
    return /\.(mp4|webm|ogg)(\?|$)/i.test(p);
  } catch {
    return false;
  }
}
