"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { looksLikeHttpUrl, parseYouTubeEmbed } from "@/lib/chat-media";
import { ReplyToBar } from "./ReplyToBar";
import { useSession } from "./SessionProvider";

type Msg = {
  id: string;
  kind: string;
  text: string;
  mediaData: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

type PendingImage = { dataUrl: string };

export function ChatPanel() {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<PendingImage | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ label: string } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) setReplyTo(null);
  }, [user]);

  function withReplyPrefix(trimmed: string): string {
    if (!replyTo) return trimmed;
    return `${replyTo.label}, ${trimmed}`;
  }
  const imgRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/chat/messages");
    const j = await r.json();
    const raw = j.messages ?? [];
    setMessages(
      raw.map((m: Msg) => ({
        ...m,
        kind: m.kind || "text",
        mediaData: m.mediaData || "",
        text: m.text ?? "",
      })),
    );
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function readImageAsDataUrl(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setPending({ dataUrl });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = text.trim();

    if (pending) {
      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind: "image" as const,
          text: withReplyPrefix(trimmed),
          mediaData: pending.dataUrl,
        }),
      });
      if (r.ok) {
        setPostError(null);
        setText("");
        setPending(null);
        setReplyTo(null);
        load();
      } else if (r.status === 422) {
        const j = (await r.json()) as { code?: string };
        setPostError(
          j.code === "moderation" ? tCommon("moderationBlocked") : null,
        );
      } else {
        setPostError(null);
      }
      return;
    }

    if (!trimmed) return;

    const asLink = looksLikeHttpUrl(trimmed);
    const r = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(
        asLink
          ? { kind: "link", text: withReplyPrefix(trimmed) }
          : { kind: "text", text: withReplyPrefix(trimmed) },
      ),
    });
    if (r.ok) {
      setPostError(null);
      setText("");
      setReplyTo(null);
      load();
    } else if (r.status === 422) {
      const j = (await r.json()) as { code?: string };
      setPostError(
        j.code === "moderation" ? tCommon("moderationBlocked") : null,
      );
    } else {
      setPostError(null);
    }
  }

  function MessageBody({ m }: { m: Msg }) {
    const k = m.kind || "text";
    if (k === "link") {
      const yt = parseYouTubeEmbed(m.text);
      return (
        <div className="mt-1 space-y-2">
          <a
            href={m.text}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-archi-400 underline decoration-archi-600/50 underline-offset-2 hover:text-archi-300"
          >
            {m.text}
          </a>
          {yt ? (
            <div className="max-w-md overflow-hidden rounded-lg border border-zone-edge/60">
              <iframe
                title="YouTube"
                className="aspect-video w-full bg-black"
                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>
      );
    }
    if (k === "image" && m.mediaData.startsWith("data:")) {
      return (
        <div className="mt-1 space-y-1">
          <div className="relative max-h-72 max-w-md overflow-hidden rounded-lg border border-zone-edge/60">
            <Image
              src={m.mediaData}
              alt=""
              width={640}
              height={480}
              className="h-auto max-h-72 w-full object-contain"
              unoptimized
            />
          </div>
          {m.text ? (
            <p className="text-zone-fog/95 leading-relaxed">{m.text}</p>
          ) : null}
        </div>
      );
    }
    if (k === "video" && m.mediaData.startsWith("data:")) {
      return (
        <div className="mt-1 space-y-1">
          <video
            controls
            className="max-h-72 max-w-full rounded-lg border border-zone-edge/60"
            src={m.mediaData}
          />
          {m.text ? (
            <p className="text-zone-fog/95 leading-relaxed">{m.text}</p>
          ) : null}
        </div>
      );
    }
    if (k === "audio" && m.mediaData.startsWith("data:")) {
      return (
        <div className="mt-1 space-y-2">
          <audio controls className="w-full max-w-md" src={m.mediaData} />
          {m.text ? (
            <p className="text-sm text-zone-fog/90">{m.text}</p>
          ) : null}
        </div>
      );
    }
    return <p className="mt-1 text-zone-fog/95 leading-relaxed">{m.text}</p>;
  }

  return (
    <div className="pda-panel flex min-h-[min(72vh,640px)] flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {messages.map((m) => (
          <div key={m.id} className="pda-chat-bubble mb-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-medium text-archi-400">
                  {m.user.name || m.user.email}
                </span>
                <span className="text-zone-muted/70">
                  {" "}
                  {format.dateTime(new Date(m.createdAt), { timeStyle: "short" })}
                </span>
              </div>
              {user && user.id !== m.user.id ? (
                <button
                  type="button"
                  onClick={() =>
                    setReplyTo({ label: m.user.name || m.user.email })
                  }
                  className="shrink-0 text-xs text-archi-500 hover:text-archi-300 hover:underline"
                >
                  {tCommon("reply")}
                </button>
              ) : null}
            </div>
            <MessageBody m={m} />
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <div className="shrink-0 border-t border-zone-edge/70 px-4 py-2.5">
        <h1 className="text-base font-semibold text-zone-fog">{t("title")}</h1>
        <p className="text-xs text-zone-muted">{t("room")}</p>
        <p className="mt-1 text-[11px] leading-snug text-zone-muted/90">
          {t("composerHint")}
        </p>
      </div>
      {user ? (
        <form
          onSubmit={send}
          className="shrink-0 border-t border-zone-edge/70 p-3"
        >
          {pending ? (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-archi-700/40 bg-zone-deep/50 p-2 text-xs text-zone-muted">
              <span className="font-medium text-archi-400">
                {t("pendingImage")}
              </span>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded border border-zone-edge px-2 py-0.5 text-zone-fog hover:bg-zone-edge/30"
              >
                {t("clearAttachment")}
              </button>
            </div>
          ) : null}
          {replyTo ? (
            <ReplyToBar
              label={replyTo.label}
              onCancel={() => setReplyTo(null)}
            />
          ) : null}
          <div className="mb-2 flex flex-wrap gap-2">
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void readImageAsDataUrl(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className="rounded-md border border-zone-edge/80 bg-zone-panel px-2.5 py-1.5 text-xs font-medium text-zone-fog hover:border-archi-600/50"
            >
              {t("attachPhoto")}
            </button>
          </div>
          {postError ? (
            <p className="mb-2 text-sm text-red-400/90" role="alert">
              {postError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <input
              className="flex-1 pda-input"
              placeholder={t("placeholder")}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPostError(null);
              }}
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-archi-600 px-4 py-2 font-medium text-black hover:bg-archi-500"
            >
              {t("send")}
            </button>
          </div>
        </form>
      ) : (
        <p className="shrink-0 border-t border-zone-edge/70 p-3 text-sm text-zone-muted">
          {t("loginToPost")}
        </p>
      )}
    </div>
  );
}
