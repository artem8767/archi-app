"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import { CommentThread } from "./CommentThread";

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
  const { user } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [city, setCity] = useState("");
  const [vacancy, setVacancy] = useState("");
  const [pay, setPay] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setCity("");
      setVacancy("");
      setPay("");
      setPhone("");
      setPhoto(null);
      load();
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold tracking-wide text-archi-100">
        {t("title")}
      </h1>

      {user && (
        <form
          onSubmit={publish}
          className="pda-panel p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">{t("new")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-sm text-zone-muted">{t("city")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("vacancy")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={vacancy}
                onChange={(e) => setVacancy(e.target.value)}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("pay")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
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
              <input
                type="file"
                accept="image/*"
                className="pda-file"
                onChange={onPhoto}
              />
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
                  {new Date(job.createdAt).toLocaleString()}
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
