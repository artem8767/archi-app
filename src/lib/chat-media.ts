const MAX_MEDIA_CHARS = 1_200_000;
const MAX_TEXT = 8000;

export const CHAT_KINDS = ["text", "image", "video", "link", "audio"] as const;
export type ChatMessageKind = (typeof CHAT_KINDS)[number];

export function isChatKind(v: string): v is ChatMessageKind {
  return (CHAT_KINDS as readonly string[]).includes(v);
}

/** Витягує id відео YouTube з URL для вбудовування. */
export function parseYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (
      u.hostname === "youtube.com" ||
      u.hostname === "www.youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      if (u.pathname.startsWith("/watch")) {
        const id = u.searchParams.get("v");
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
      if (u.pathname.startsWith("/embed/")) {
        const id = u.pathname.split("/")[2];
        return id && /^[\w-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function looksLikeHttpUrl(s: string): boolean {
  const t = s.trim();
  if (!t.startsWith("http://") && !t.startsWith("https://")) return false;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export { MAX_MEDIA_CHARS, MAX_TEXT };
