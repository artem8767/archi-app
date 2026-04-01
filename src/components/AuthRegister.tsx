"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { PasswordField } from "./PasswordField";

type RegisterApiJson = {
  ok?: boolean;
  error?: string;
  detail?: string;
  devCodes?: { phone: string };
};

async function parseApiResponse(r: Response): Promise<RegisterApiJson> {
  const text = await r.text();
  if (!text) {
    return r.ok ? {} : { error: `Помилка ${r.status}` };
  }
  try {
    return JSON.parse(text) as RegisterApiJson;
  } catch {
    return {
      error: "Сервер повернув неочікувану відповідь. Спробуйте ще раз.",
    };
  }
}

export function AuthRegister() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [devCodes, setDevCodes] = useState<{ phone: string } | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          password,
          name: name.trim() || undefined,
        }),
      });
      const j = await parseApiResponse(r);
      if (!r.ok) {
        let msg = j.error ?? `Помилка ${r.status}`;
        if (process.env.NODE_ENV === "development" && j.detail) {
          msg += ` (${j.detail})`;
        }
        setErr(msg);
        return;
      }
      if (j.devCodes) setDevCodes(j.devCodes);
      setDone(true);
    } catch {
      setErr("Не вдалося з’єднатися з сервером. Перевірте інтернет.");
    } finally {
      setSubmitting(false);
    }
  }

  function goVerify() {
    router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`);
  }

  if (done) {
    return (
      <div className="pda-panel mx-auto max-w-md p-6">
        <h1 className="text-xl font-bold">{t("verifyTitle")}</h1>
        <p className="mt-2 text-sm text-zone-muted">
          {devCodes ? t("codesShownBelow") : t("checkSms")}
        </p>
        {devCodes && (
          <div className="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/40 p-3 text-sm text-amber-200/90">
            SMS: {devCodes.phone}
          </div>
        )}
        <button
          type="button"
          onClick={goVerify}
          className="mt-4 w-full rounded-lg bg-archi-600 py-2.5 font-medium text-black hover:bg-archi-500"
        >
          {t("verifyTitle")} →
        </button>
      </div>
    );
  }

  return (
    <div className="pda-panel mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">{t("register")}</h1>
      <p className="mt-2 text-sm text-zone-muted">{t("devHintSms")}</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-zone-muted">{t("email")}</span>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full pda-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-zone-muted">{t("phone")}</span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+380501234567"
            className="mt-1 w-full pda-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          minLength={8}
        />
        <label className="block">
          <span className="text-sm text-zone-muted">{t("name")}</span>
          <input
            type="text"
            autoComplete="name"
            className="mt-1 w-full pda-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-archi-600 py-2.5 font-medium text-black hover:bg-archi-500 disabled:opacity-60"
        >
          {submitting ? "…" : t("submitRegister")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zone-muted">
        <Link href="/auth/login" className="text-archi-400 underline hover:text-archi-300">
          {t("haveAccount")}
        </Link>
      </p>
    </div>
  );
}
