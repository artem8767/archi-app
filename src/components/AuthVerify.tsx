"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

function digitsOnly(s: string, max = 6): string {
  return s.replace(/\D/g, "").slice(0, max);
}

const RESEND_COOLDOWN_SEC = 60;

async function parseApiResponse(r: Response): Promise<{
  error?: string;
  retryAfterSec?: number;
  devCode?: string;
  message?: string;
}> {
  const text = await r.text();
  if (!text) return { error: `Помилка ${r.status}` };
  try {
    return JSON.parse(text) as {
      error?: string;
      retryAfterSec?: number;
      devCode?: string;
      message?: string;
    };
  } catch {
    return { error: "Неочікувана відповідь сервера" };
  }
}

function VerifyInner() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [phoneCode, setPhoneCode] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [smsResendSec, setSmsResendSec] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (smsResendSec <= 0) return;
    const id = setInterval(() => {
      setSmsResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [smsResendSec]);

  const startCooldown = useCallback((sec: number) => {
    const s = Math.min(Math.max(sec, 1), RESEND_COOLDOWN_SEC);
    setSmsResendSec(s);
  }, []);

  async function resend() {
    setErr("");
    setResendMsg("");
    const email = emailParam.trim();
    if (!email) {
      setErr("Не вказано email. Поверніться до реєстрації.");
      return;
    }
    try {
      const r = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await parseApiResponse(r);
      if (!r.ok) {
        if (r.status === 429 && j.retryAfterSec) {
          startCooldown(j.retryAfterSec);
        }
        setErr(j.error ?? "Помилка");
        return;
      }
      startCooldown(RESEND_COOLDOWN_SEC);
      if (j.devCode) {
        setPhoneCode(j.devCode);
        setResendMsg(`${t("resendDevHintSms")}: ${j.devCode}`);
      } else {
        setResendMsg(j.message ?? t("resendOk"));
      }
    } catch {
      setErr("Не вдалося з’єднатися з сервером.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const email = emailParam.trim();
    const pc = digitsOnly(phoneCode, 6);
    if (pc.length !== 6) {
      setErr(t("phoneCodeLength"));
      return;
    }
    if (!email) {
      setErr("Не вказано email. Поверніться до реєстрації.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneCode: pc }),
      });
      const j = await parseApiResponse(r);
      if (!r.ok) {
        setErr(j.error ?? "Помилка підтвердження");
        return;
      }
      router.push("/auth/login?verified=1");
    } catch {
      setErr("Не вдалося з’єднатися з сервером.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pda-panel mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">{t("verifyTitle")}</h1>
      <p className="mt-2 text-sm text-zone-muted">{t("verifyPhoneOnlyHint")}</p>
      <p className="mt-1 break-all text-sm text-zone-muted">
        {emailParam.trim() || "—"}
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-zone-muted">{t("phoneCode")}</span>
          <input
            className="mt-1 w-full pda-input"
            value={phoneCode}
            onChange={(e) => setPhoneCode(digitsOnly(e.target.value, 6))}
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
          />
          <button
            type="button"
            disabled={smsResendSec > 0}
            onClick={() => resend()}
            className="mt-2 text-sm font-medium text-archi-400 underline decoration-archi-600/50 hover:text-archi-300 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {smsResendSec > 0
              ? t("resendWait", { seconds: smsResendSec })
              : t("resendSms")}
          </button>
        </label>
        {resendMsg && (
          <p className="text-sm text-archi-300/95">{resendMsg}</p>
        )}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-archi-600 py-2.5 font-medium text-black hover:bg-archi-500 disabled:opacity-60"
        >
          {submitting ? "…" : t("submitVerify")}
        </button>
      </form>
    </div>
  );
}

export function AuthVerify() {
  return (
    <Suspense fallback={<p className="text-zone-muted">…</p>}>
      <VerifyInner />
    </Suspense>
  );
}
