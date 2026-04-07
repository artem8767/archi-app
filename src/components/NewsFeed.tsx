"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isListingSectionId } from "@/lib/marketplace-sections";
import { CommentThread } from "./CommentThread";

type ListingInFeed = {
  id: string;
  category: string;
  section: string;
  title: string;
  description: string;
  price: string;
  phone: string;
  photosJson: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

const LISTING_CAT = [
  "sell",
  "buy",
  "rent",
  "service_offer",
  "service_seek",
] as const;

type ListingCat = (typeof LISTING_CAT)[number];

const NAV_KEY: Record<
  ListingCat,
  "sell" | "buy" | "rent" | "serviceOffer" | "serviceSeek"
> = {
  sell: "sell",
  buy: "buy",
  rent: "rent",
  service_offer: "serviceOffer",
  service_seek: "serviceSeek",
};

function listingHref(cat: string): string {
  switch (cat) {
    case "sell":
      return "/sell";
    case "buy":
      return "/buy";
    case "rent":
      return "/rent";
    case "service_offer":
      return "/service-offer";
    case "service_seek":
      return "/service-seek";
    default:
      return "/sell";
  }
}

export function NewsFeed() {
  const t = useTranslations("news");
  const tList = useTranslations("listing");
  const tNav = useTranslations("nav");
  const format = useFormatter();
  const [listings, setListings] = useState<ListingInFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingCategory, setListingCategory] = useState<"all" | ListingCat>(
    "all",
  );

  const load = useCallback(async () => {
    const r = await fetch("/api/listings?limit=120");
    const j = (await r.json()) as { listings?: ListingInFeed[] };
    const rows = j.listings ?? [];
    rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setListings(rows);
  }, []);

  const filteredListings = useMemo(() => {
    if (listingCategory === "all") return listings;
    return listings.filter((item) => {
      const c = LISTING_CAT.includes(item.category as ListingCat)
        ? (item.category as ListingCat)
        : null;
      return c === listingCategory;
    });
  }, [listings, listingCategory]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    const h = window.location.hash;
    if (h.startsWith("#listing-")) {
      const id = h.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [loading, listings]);

  function sectionLabel(id: string): string {
    switch (id) {
      case "general":
        return tList("sec_general");
      case "auto_moto":
        return tList("sec_auto_moto");
      case "real_estate":
        return tList("sec_real_estate");
      case "electronics":
        return tList("sec_electronics");
      case "home_garden":
        return tList("sec_home_garden");
      case "fashion":
        return tList("sec_fashion");
      case "sport_hobby":
        return tList("sec_sport_hobby");
      case "kids":
        return tList("sec_kids");
      case "pets":
        return tList("sec_pets");
      case "business_industrial":
        return tList("sec_business_industrial");
      default:
        return id;
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-semibold leading-snug tracking-normal text-archi-100 sm:text-2xl">
        {t("title")}
      </h1>

      <div className="rounded-xl border border-zone-edge/70 bg-zone-deep/40 p-4 md:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-archi-400/90 md:text-xs">
          {tList("marketplaceSections")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setListingCategory("all")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
              listingCategory === "all"
                ? "border-archi-500 bg-archi-900/50 text-archi-100"
                : "border-zone-edge/80 bg-zone-panel/70 text-zone-muted hover:border-archi-700/50 hover:text-zone-fog"
            }`}
          >
            {tList("allSections")}
          </button>
          {LISTING_CAT.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setListingCategory(cat)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                listingCategory === cat
                  ? "border-archi-500 bg-archi-900/50 text-archi-100"
                  : "border-zone-edge/80 bg-zone-panel/70 text-zone-muted hover:border-archi-700/50 hover:text-zone-fog"
              }`}
            >
              {tNav(NAV_KEY[cat])}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-zone-muted">…</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-zone-muted">{t("feedListingsEmpty")}</p>
      ) : (
        <ul className="space-y-8">
          {filteredListings.map((item) => {
            const cat = LISTING_CAT.includes(item.category as ListingCat)
              ? (item.category as ListingCat)
              : "sell";
            let photos: string[] = [];
            try {
              photos = JSON.parse(item.photosJson || "[]") as string[];
            } catch {
              photos = [];
            }
            const thumb = photos[0];
            return (
              <li
                key={item.id}
                id={`listing-${item.id}`}
                className="pda-card scroll-mt-24 border-archi-800/35"
              >
                <div className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-archi-400/95">
                    {t("listingInFeed")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-start gap-4">
                    {thumb ? (
                      <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-zone-deep sm:h-32 sm:w-40">
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zone-muted">
                        <span className="font-medium text-archi-400/95">
                          {tNav(NAV_KEY[cat])}
                        </span>
                        <span aria-hidden>·</span>
                        <span>
                          {isListingSectionId(item.section)
                            ? sectionLabel(item.section)
                            : item.section}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-zone-fog sm:text-xl">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-zone-muted">
                        {item.user.name || item.user.email} ·{" "}
                        {format.dateTime(new Date(item.createdAt), {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm text-zone-fog/95">
                        {item.description}
                      </p>
                      <p className="mt-2 font-medium text-archi-400">
                        {tList("price")}: {item.price}
                      </p>
                      <p className="text-sm text-zone-fog/90">
                        {tList("phone")}: {item.phone}
                      </p>
                      <p className="mt-3">
                        <Link
                          href={listingHref(cat)}
                          className="text-sm font-medium text-archi-400 underline decoration-archi-600/40 underline-offset-2 hover:text-archi-300"
                        >
                          {tList("openCategoryBoard")}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
                <CommentThread targetType="listing" targetId={item.id} />
              </li>
            );
          })}
          {filteredListings.length === 0 && listings.length > 0 ? (
            <li className="list-none">
              <p className="text-center text-zone-muted">{t("feedEmptyFiltered")}</p>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
