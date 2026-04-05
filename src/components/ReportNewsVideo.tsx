"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSession } from "./SessionProvider";

export function ReportNewsVideo({
  postId,
  authorUserId,
}: {
  postId: string;
  authorUserId: string;
}) {
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="mt-2 text-xs text-zone-muted">
        <Link
          href={`/${locale}/auth/login`}
          className="text-archi-400 underline hover:text-archi-300"
        >
          {t("reportVideoLogin")}
        </Link>
      </p>
    );
  }

  if (user.id === authorUserId) {
    return null;
  }

  if (status === "sent") {
    return (
      <p className="mt-2 text-sm text-zone-muted" role="status">
        {t("reportVideoSent")}
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-zone-edge/40 pt-3">
      {!open ? (
        <button
          type="button"
          className="text-sm text-zone-muted underline decoration-zone-edge hover:text-archi-300"
          onClick={() => {
            setOpen(true);
            setErrorKey(null);
            setStatus("idle");
          }}
        >
          {t("reportVideo")}
        </button>
      ) : (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("sending");
            setErrorKey(null);
            const r = await fetch(`/api/news/${postId}/report-video`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ reason: reason.trim() || undefined }),
            });
            if (r.ok) {
              setStatus("sent");
              setOpen(false);
              return;
            }
            const j = (await r.json().catch(() => ({}))) as { code?: string };
            setStatus("error");
            if (r.status === 409 && j.code === "already_reported") {
              setErrorKey("already");
              return;
            }
            if (r.status === 422 && j.code === "moderation") {
              setErrorKey("moderation");
              return;
            }
            setErrorKey("generic");
          }}
        >
          <label className="block">
            <span className="text-xs text-zone-muted">{t("reportVideoDetails")}</span>
            <textarea
              className="mt-1 w-full max-w-xl pda-input"
              rows={2}
              value={reason}
              disabled={status === "sending"}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              placeholder={t("reportVideoPlaceholder")}
            />
          </label>
          {errorKey === "already" ? (
            <p className="text-sm text-amber-400/90">{t("reportVideoAlready")}</p>
          ) : null}
          {errorKey === "moderation" ? (
            <p className="text-sm text-red-400/90">{tCommon("moderationBlocked")}</p>
          ) : null}
          {errorKey === "generic" ? (
            <p className="text-sm text-red-400/90">{t("reportVideoFailed")}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg border border-zone-edge/80 px-3 py-1.5 text-sm text-zone-fog hover:border-archi-500/60 hover:text-archi-200 disabled:opacity-50"
            >
              {status === "sending" ? "…" : t("reportVideoSubmit")}
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm text-zone-muted hover:text-zone-fog"
              onClick={() => {
                setOpen(false);
                setReason("");
                setErrorKey(null);
                setStatus("idle");
              }}
            >
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
