"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  postId: string;
  title: string;
  bodyExcerpt: string;
};

export function ShareNewsPost({ postId, title, bodyExcerpt }: Props) {
  const t = useTranslations("news");
  const locale = useLocale();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/${locale}/news#post-${postId}`);
  }, [locale, postId]);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(t("linkCopied"));
    } catch {
      alert(t("shareFailed"));
    }
  }

  async function nativeShare() {
    if (!shareUrl) return;
    const text = `${title}\n\n${bodyExcerpt}`.slice(0, 2000);
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (e) {
        if ((e as Error).name !== "AbortError") await copyLink();
      }
    } else {
      await copyLink();
    }
  }

  const encUrl = shareUrl ? encodeURIComponent(shareUrl) : "";
  const encTitle = encodeURIComponent(title);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zone-line/40 pt-4">
      <span className="text-xs uppercase tracking-wide text-zone-muted">
        {t("share")}
      </span>
      <button
        type="button"
        onClick={() => void nativeShare()}
        className="rounded-md border border-archi-600/50 bg-archi-900/30 px-3 py-1.5 text-sm text-archi-300 hover:bg-archi-800/40"
      >
        {t("shareSystem")}
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-md border border-zone-line px-3 py-1.5 text-sm text-zone-fog hover:bg-zone-deep"
      >
        {t("copyLink")}
      </button>
      {shareUrl ? (
        <>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zone-line px-3 py-1.5 text-sm text-zone-fog hover:bg-zone-deep"
          >
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encUrl}&text=${encTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zone-line px-3 py-1.5 text-sm text-zone-fog hover:bg-zone-deep"
          >
            Telegram
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zone-line px-3 py-1.5 text-sm text-zone-fog hover:bg-zone-deep"
          >
            X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zone-line px-3 py-1.5 text-sm text-zone-fog hover:bg-zone-deep"
          >
            Facebook
          </a>
        </>
      ) : null}
    </div>
  );
}
