"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  looksLikeHttpUrl,
  parseYouTubeEmbed,
  type ChatMessageKind,
} from "@/lib/chat-media";
import { useSession } from "./SessionProvider";

type Msg = {
  id: string;
  kind: string;
  text: string;
  mediaData: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

type PendingMedia = {
  kind: ChatMessageKind;
  dataUrl: string;
};

export function ChatPanel() {
  const t = useTranslations("chat");
  const { user } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<PendingMedia | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const audRef = useRef<HTMLInputElement>(null);

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

  async function readFilesAsDataUrl(
    files: FileList | null,
    kind: ChatMessageKind,
  ) {
    const f = files?.[0];
    if (!f) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setPending({ kind, dataUrl });
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
          kind: pending.kind,
          text: trimmed,
          mediaData: pending.dataUrl,
        }),
      });
      if (r.ok) {
        setText("");
        setPending(null);
        load();
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
          ? { kind: "link", text: trimmed }
          : { kind: "text", text: trimmed },
      ),
    });
    if (r.ok) {
      setText("");
      load();
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
    <div className="pda-panel flex flex-col overflow-hidden">
      <div className="border-b border-zone-edge/70 px-4 py-3">
        <h1 className="text-lg font-semibold text-zone-fog">{t("title")}</h1>
        <p className="text-sm text-zone-muted">{t("room")}</p>
        <p className="mt-2 text-xs leading-relaxed text-zone-muted/90">
          {t("composerHint")}
        </p>
      </div>
      <div className="h-[420px] overflow-y-auto px-4 py-3">
        {messages.map((m) => (
          <div key={m.id} className="pda-chat-bubble mb-3 text-sm">
            <span className="font-medium text-archi-400">
              {m.user.name || m.user.email}
            </span>
            <span className="text-zone-muted/70">
              {" "}
              {new Date(m.createdAt).toLocaleTimeString()}
            </span>
            <MessageBody m={m} />
          </div>
        ))}
        <div ref={bottom} />
      </div>
      {user ? (
        <form
          onSubmit={send}
          className="border-t border-zone-edge/70 p-3"
        >
          {pending ? (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-archi-700/40 bg-zone-deep/50 p-2 text-xs text-zone-muted">
              <span className="font-medium text-archi-400">
                {pending.kind === "image"
                  ? t("pendingImage")
                  : pending.kind === "video"
                    ? t("pendingVideo")
                    : t("pendingAudio")}
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
          <div className="mb-2 flex flex-wrap gap-2">
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                readFilesAsDataUrl(e.target.files, "image");
                e.target.value = "";
              }}
            />
            <input
              ref={vidRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                readFilesAsDataUrl(e.target.files, "video");
                e.target.value = "";
              }}
            />
            <input
              ref={audRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                readFilesAsDataUrl(e.target.files, "audio");
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
            <button
              type="button"
              onClick={() => vidRef.current?.click()}
              className="rounded-md border border-zone-edge/80 bg-zone-panel px-2.5 py-1.5 text-xs font-medium text-zone-fog hover:border-archi-600/50"
            >
              {t("attachVideo")}
            </button>
            <button
              type="button"
              onClick={() => audRef.current?.click()}
              className="rounded-md border border-zone-edge/80 bg-zone-panel px-2.5 py-1.5 text-xs font-medium text-zone-fog hover:border-archi-600/50"
            >
              {t("attachAudio")}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 pda-input"
              placeholder={t("placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
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
        <p className="border-t border-zone-edge/70 p-3 text-sm text-zone-muted">
          {t("loginToPost")}
        </p>
      )}
    </div>
  );
}
