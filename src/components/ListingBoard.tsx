"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  LISTING_SECTION_IDS,
  type ListingSectionId,
} from "@/lib/marketplace-sections";
import { useSession } from "./SessionProvider";
import { CommentThread } from "./CommentThread";
import { FilePickerInput } from "./FilePickerInput";

type Listing = {
  id: string;
  section: string;
  title: string;
  description: string;
  price: string;
  phone: string;
  photosJson: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

const catMap = {
  sell: "sell",
  buy: "buy",
  rent: "rent",
  service_offer: "service_offer",
  service_seek: "service_seek",
} as const;

export type ListingCategory = keyof typeof catMap;

const navTitleKey: Record<
  ListingCategory,
  "sell" | "buy" | "rent" | "serviceOffer" | "serviceSeek"
> = {
  sell: "sell",
  buy: "buy",
  rent: "rent",
  service_offer: "serviceOffer",
  service_seek: "serviceSeek",
};

export function ListingBoard({ category }: { category: ListingCategory }) {
  const t = useTranslations("listing");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useSession();
  const [items, setItems] = useState<Listing[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<"all" | ListingSectionId>(
    "all",
  );
  const [newSection, setNewSection] = useState<ListingSectionId>("general");
  const [postError, setPostError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const apiCat = catMap[category];

  const load = useCallback(async () => {
    const q =
      sectionFilter === "all"
        ? `category=${apiCat}`
        : `category=${apiCat}&section=${sectionFilter}`;
    const r = await fetch(`/api/listings?${q}`);
    const j = await r.json();
    setItems(j.listings ?? []);
  }, [apiCat, sectionFilter]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const arr = Array.from(files).slice(0, 8);
    const results = await Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(f);
          })
      )
    );
    setPhotos(results);
    setPostError(null);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const r = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        category: apiCat,
        section: newSection,
        title,
        description,
        price,
        phone,
        photos,
      }),
    });
    if (r.ok) {
      setPostError(null);
      setTitle("");
      setDescription("");
      setPrice("");
      setPhone("");
      setPhotos([]);
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

  function sectionLabel(id: string): string {
    switch (id) {
      case "general":
        return t("sec_general");
      case "auto_moto":
        return t("sec_auto_moto");
      case "real_estate":
        return t("sec_real_estate");
      case "electronics":
        return t("sec_electronics");
      case "home_garden":
        return t("sec_home_garden");
      case "fashion":
        return t("sec_fashion");
      case "sport_hobby":
        return t("sec_sport_hobby");
      case "kids":
        return t("sec_kids");
      case "pets":
        return t("sec_pets");
      case "business_industrial":
        return t("sec_business_industrial");
      default:
        return id;
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-semibold leading-snug tracking-normal text-archi-100 sm:text-2xl">
        {tNav(navTitleKey[category])}
      </h1>

      <div className="rounded-xl border border-zone-edge/70 bg-zone-deep/40 p-4 md:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-archi-400/90 md:text-xs">
          {t("marketplaceSections")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSectionFilter("all")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
              sectionFilter === "all"
                ? "border-archi-500 bg-archi-900/50 text-archi-100"
                : "border-zone-edge/80 bg-zone-panel/70 text-zone-muted hover:border-archi-700/50 hover:text-zone-fog"
            }`}
          >
            {t("allSections")}
          </button>
          {LISTING_SECTION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSectionFilter(id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                sectionFilter === id
                  ? "border-archi-500 bg-archi-900/50 text-archi-100"
                  : "border-zone-edge/80 bg-zone-panel/70 text-zone-muted hover:border-archi-700/50 hover:text-zone-fog"
              }`}
            >
              {sectionLabel(id)}
            </button>
          ))}
        </div>
      </div>

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
            <label className="block sm:col-span-2">
              <span className="text-sm text-zone-muted">
                {t("sectionField")}
              </span>
              <select
                className="mt-1 w-full pda-input"
                value={newSection}
                onChange={(e) =>
                  setNewSection(e.target.value as ListingSectionId)
                }
              >
                {LISTING_SECTION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {sectionLabel(id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm text-zone-muted">{t("itemTitle")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setPostError(null);
                }}
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm text-zone-muted">{t("description")}</span>
              <textarea
                className="mt-1 w-full pda-input"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setPostError(null);
                }}
                required
              />
            </label>
            <label>
              <span className="text-sm text-zone-muted">{t("price")}</span>
              <input
                className="mt-1 w-full pda-input"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
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
              <span className="text-sm text-zone-muted">{t("photos")}</span>
              <FilePickerInput
                key={fileInputKey}
                accept="image/*"
                multiple
                onChange={onFiles}
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
          {items.map((item) => {
            let photosParsed: string[] = [];
            try {
              photosParsed = JSON.parse(item.photosJson || "[]") as string[];
            } catch {
              photosParsed = [];
            }
            return (
              <li key={item.id} className="pda-card">
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-archi-400/95">
                    {sectionLabel(item.section || "general")}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-zone-fog">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-zone-muted">
                    {item.user.name || item.user.email} ·{" "}
                    {format.dateTime(new Date(item.createdAt), {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-zone-fog/95">
                    {item.description}
                  </p>
                  <p className="mt-2 font-medium text-archi-400">
                    {t("price")}: {item.price}
                  </p>
                  <p className="text-zone-fog/90">
                    {t("phone")}: {item.phone}
                  </p>
                  {photosParsed.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {photosParsed.map((src, i) => (
                        <div
                          key={i}
                          className="relative h-32 w-32 overflow-hidden rounded-lg bg-zone-deep"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <CommentThread targetType="listing" targetId={item.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
