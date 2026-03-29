"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export function CommentThread({
  targetType,
  targetId,
}: {
  targetType: "news" | "listing" | "job";
  targetId: string;
}) {
  const t = useTranslations("news");
  const tList = useTranslations("listing");
  const tAuth = useTranslations("auth");
  const { user } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch(
      `/api/comments?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`
    );
    const j = await r.json();
    setComments(j.comments ?? []);
  }, [targetType, targetId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    const r = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType, targetId, body: text.trim() }),
    });
    if (r.ok) {
      setText("");
      load();
    }
  }

  const label = targetType === "news" ? t("comments") : tList("comments");

  return (
    <div className="pda-inset mt-4 p-4">
      <h4 className="mb-2 font-medium text-zone-fog">{label}</h4>
      {loading ? (
        <p className="text-sm text-zone-muted">…</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="text-sm">
              <span className="font-medium text-archi-400">
                {c.user.name || c.user.email}
              </span>
              <span className="text-zone-muted">
                {" "}
                · {new Date(c.createdAt).toLocaleString()}
              </span>
              <p className="mt-0.5 text-zone-fog/95">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      {user ? (
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            className="flex-1 pda-input text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("addComment")}
          />
          <button
            type="submit"
            className="rounded-lg bg-archi-600 px-4 py-2 text-sm font-medium text-black hover:bg-archi-500"
          >
            {t("send")}
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-zone-muted">
          {t("addComment")} —{" "}
          <Link href="/auth/login" className="text-archi-400 underline hover:text-archi-300">
            {tAuth("login")}
          </Link>
        </p>
      )}
    </div>
  );
}
