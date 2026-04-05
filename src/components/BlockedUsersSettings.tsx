"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type BlockRow = {
  id: string;
  blockedId: string;
  user: { id: string; name: string | null; email: string };
  createdAt: string;
};

export function BlockedUsersSettings() {
  const t = useTranslations("settings");
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<"ok" | "err" | null>(null);
  const [errCode, setErrCode] = useState<string | null>(null);
  const [verifyFirst, setVerifyFirst] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/user/blocks", { credentials: "include" });
    if (!r.ok) {
      setBlocks([]);
      setVerifyFirst(r.status === 403);
      setLoading(false);
      return;
    }
    setVerifyFirst(false);
    const j = (await r.json()) as { blocks?: BlockRow[] };
    setBlocks(j.blocks ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErrCode(null);
    const r = await fetch("/api/user/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim() }),
    });
    setBusy(false);
    if (r.ok) {
      setEmail("");
      setMsg("ok");
      setTimeout(() => setMsg(null), 2000);
      void load();
      return;
    }
    const j = (await r.json().catch(() => ({}))) as { code?: string };
    setMsg("err");
    setErrCode(j.code ?? "generic");
  }

  async function unblock(blockedId: string) {
    setBusy(true);
    const r = await fetch(
      `/api/user/blocks?blockedId=${encodeURIComponent(blockedId)}`,
      { method: "DELETE", credentials: "include" },
    );
    setBusy(false);
    if (r.ok) void load();
  }

  if (verifyFirst) {
    return (
      <p className="text-sm text-amber-400/90">{t("blockUserVerifyFirst")}</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-zone-muted">{t("blockUserHint")}</p>
      <form onSubmit={(e) => void addBlock(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="text-xs text-zone-muted">{t("blockUserEmailLabel")}</span>
          <input
            type="email"
            className="mt-0.5 w-full pda-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={busy}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="shrink-0 rounded-lg border border-zone-edge/80 px-4 py-2 text-sm font-medium text-zone-fog hover:border-archi-500/60 hover:text-archi-200 disabled:opacity-50"
        >
          {t("blockUserAdd")}
        </button>
      </form>
      {msg === "ok" ? (
        <p className="text-sm text-emerald-400/90">{t("blockUserAdded")}</p>
      ) : null}
      {msg === "err" ? (
        <p className="text-sm text-red-400/90" role="alert">
          {errCode === "not_found"
            ? t("blockUserNotFound")
            : errCode === "self"
              ? t("blockUserSelf")
              : errCode === "already"
                ? t("blockUserAlready")
                : t("blockUserError")}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-zone-muted">…</p>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-zone-muted">{t("blockUserEmpty")}</p>
      ) : (
        <ul className="divide-y divide-zone-edge/40 rounded-lg border border-zone-edge/40">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zone-fog">
                  {b.user.name || b.user.email}
                </p>
                <p className="truncate text-xs text-zone-muted">{b.user.email}</p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void unblock(b.blockedId)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-archi-400 underline hover:text-archi-300 disabled:opacity-50"
              >
                {t("blockUserUnblock")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
