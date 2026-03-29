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
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailResendSec, setEmailResendSec] = useState(0);
  const [smsResendSec, setSmsResendSec] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    if (emailResendSec <= 0) return;
    const t = setInterval(() => {
      setEmailResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [emailResendSec]);

  useEffect(() => {
    if (smsResendSec <= 0) return;
    const t = setInterval(() => {
      setSmsResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [smsResendSec]);

  const startCooldown = useCallback((channel: "email" | "sms", sec: number) => {
    const s = Math.min(Math.max(sec, 1), RESEND_COOLDOWN_SEC);
    if (channel === "email") setEmailResendSec(s);
    else setSmsResendSec(s);
  }, []);

  async function resend(channel: "email" | "sms") {
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
        body: JSON.stringify({ email, channel }),
      });
      const j = await parseApiResponse(r);
      if (!r.ok) {
        if (r.status === 429 && j.retryAfterSec) {
          startCooldown(channel, j.retryAfterSec);
        }
        setErr(j.error ?? "Помилка");
        return;
      }
      startCooldown(channel, RESEND_COOLDOWN_SEC);
      if (j.devCode) {
        if (channel === "email") setEmailCode(j.devCode);
        else setPhoneCode(j.devCode);
        setResendMsg(
          channel === "email"
            ? `${t("resendDevHintEmail")}: ${j.devCode}`
            : `${t("resendDevHintSms")}: ${j.devCode}`
        );
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
    const ec = digitsOnly(emailCode, 6);
    const pc = digitsOnly(phoneCode, 6);
    if (ec.length !== 6 || pc.length !== 6) {
      setErr("Обидва коди мають містити по 6 цифр");
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
        body: JSON.stringify({ email, emailCode: ec, phoneCode: pc }),
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
      <p className="mt-2 break-all text-sm text-zone-muted">{emailParam.trim() || "—"}</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-zone-muted">{t("emailCode")}</span>
          <input
            className="mt-1 w-full pda-input"
            value={emailCode}
            onChange={(e) => setEmailCode(digitsOnly(e.target.value, 6))}
            required
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
          />
          <button
            type="button"
            disabled={emailResendSec > 0}
            onClick={() => resend("email")}
            className="mt-2 text-sm font-medium text-archi-400 underline decoration-archi-600/50 hover:text-archi-300 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            {emailResendSec > 0
              ? t("resendWait", { seconds: emailResendSec })
              : t("resendEmail")}
          </button>
        </label>
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
            onClick={() => resend("sms")}
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
