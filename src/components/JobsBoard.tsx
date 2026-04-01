"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import { CommentThread } from "./CommentThread";
import { FilePickerInput } from "./FilePickerInput";

type Job = {
  id: string;
  city: string;
  vacancy: string;
  pay: string;
  phone: string;
  photo: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export function JobsBoard() {
  const t = useTranslations("job");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [city, setCity] = useState("");
  const [vacancy, setVacancy] = useState("");
  const [pay, setPay] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = useCallback(async () => {
    const r = await fetch("/api/jobs");
    const j = await r.json();
    setJobs(j.jobs ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPhoto(null);
      return;
    }
    const b = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    setPhoto(b);
    setPostError(null);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const r = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ city, vacancy, pay, phone, photo }),
    });
    if (r.ok) {
      setPostError(null);
      setCity("");
      setVacancy("");
      setPay("");
      setPhone("");
      setPhoto(null);
      setFileInputKey((k) => k + 1);
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

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-semibold leading-snug tracking-normal text-archi-100 sm:text-2xl">
        {t("title")}
      </h1>

      {user && (
        <form
          onSubmit={publish}
          className="pda-panel p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">{t("new")}</h2>
          {postError ? (
            <p className="mb-3 text-sm text-red-400/90" role="alert">
              {postError}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm text-zone-muted">{t("city")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPostError(null);
                }}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("vacancy")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={vacancy}
                onChange={(e) => {
                  setVacancy(e.target.value);
                  setPostError(null);
                }}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("pay")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={pay}
                onChange={(e) => {
                  setPay(e.target.value);
                  setPostError(null);
                }}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("phone")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm text-zone-muted">{t("photo")}</span>
              <FilePickerInput key={fileInputKey} accept="image/*" onChange={onPhoto} />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-archi-600 px-6 py-2 font-medium text-black hover:bg-archi-500"
          >
            {t("publish")}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-zone-muted">…</p>
      ) : (
        <ul className="space-y-8">
          {jobs.map((job) => (
            <li key={job.id} className="pda-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-zone-fog">{job.vacancy}</h3>
                <p className="mt-1 text-sm text-zone-muted">
                  {job.user.name || job.user.email} ·{" "}
                  {format.dateTime(new Date(job.createdAt), {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-3 text-zone-fog/95">
                  {t("city")}: {job.city}
                </p>
                <p className="text-archi-400">
                  {t("pay")}: {job.pay}
                </p>
                <p className="text-zone-fog/90">
                  {t("phone")}: {job.phone}
                </p>
                {job.photo && (
                  <div className="relative mt-3 h-48 max-w-md overflow-hidden rounded-lg bg-zone-deep">
                    <Image
                      src={job.photo}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <CommentThread targetType="job" targetId={job.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
