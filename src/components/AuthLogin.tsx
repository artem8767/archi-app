"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { PasswordField } from "./PasswordField";
import { useSession } from "./SessionProvider";

type LoginJson = {
  error?: string;
  needVerification?: boolean;
  parseFailed?: boolean;
};

async function parseLoginResponse(r: Response): Promise<LoginJson> {
  const text = await r.text();
  if (!text) {
    return r.ok ? {} : { error: `HTTP ${r.status}` };
  }
  try {
    return JSON.parse(text) as LoginJson;
  } catch {
    return { parseFailed: true };
  }
}

function LoginInner() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setVerifyEmail(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const j = await parseLoginResponse(r);
    if (!r.ok) {
      if (r.status === 403 && j.needVerification) {
        setVerifyEmail(email.trim());
        setErr(t("needVerification"));
        return;
      }
      if (j.parseFailed) {
        setErr(t("unexpectedLoginResponse"));
        return;
      }
      setErr(j.error ?? tCommon("error"));
      return;
    }
    await refresh();
    router.push("/");
  }

  return (
    <div className="pda-panel mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">{t("login")}</h1>
      {verified && (
        <p className="mt-2 text-sm text-archi-300">{t("verified")}</p>
      )}
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-zone-muted">{t("email")}</span>
          <input
            type="email"
            className="mt-1 w-full pda-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        {verifyEmail && (
          <p className="text-sm">
            <Link
              href={`/auth/verify?email=${encodeURIComponent(verifyEmail)}`}
              className="font-medium text-archi-400 underline hover:text-archi-300"
            >
              {t("verifyTitle")} →
            </Link>
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-archi-600 py-2.5 font-medium text-black hover:bg-archi-500"
        >
          {t("submitLogin")}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zone-muted">
        <Link href="/auth/register" className="text-archi-400 underline hover:text-archi-300">
          {t("needAccount")}
        </Link>
      </p>
    </div>
  );
}

export function AuthLogin() {
  return (
    <Suspense fallback={<p className="text-zone-muted">…</p>}>
      <LoginInner />
    </Suspense>
  );
}
