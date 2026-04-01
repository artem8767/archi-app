import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandName } from "@/components/BrandName";
import { getPlayStoreUrl, hasApkDownloadConfigured } from "@/lib/app-stores";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");
  const playStoreUrl = getPlayStoreUrl();
  const apkReady = hasApkDownloadConfigured();
  const showAndroidBlock = Boolean(playStoreUrl || apkReady);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zone-edge/75 bg-zone-panel/94 p-8 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.55)] ring-1 ring-archi-500/15 backdrop-blur-[2px] md:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgb(var(--tw-archi-400)), transparent 55%)",
        }}
      />
      <div className="relative border-l-2 border-archi-500/80 pl-5 md:pl-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-archi-400/95 md:text-xs">
          {t("hudActions")}
        </p>
        <h1 className="font-display mt-5 text-2xl font-semibold uppercase tracking-wide text-archi-50 sm:text-3xl md:tracking-[0.07em] leading-snug">
          {t.rich("welcomeHeading", {
            prefix: (chunks) => (
              <span className="text-[0.88em] font-medium leading-snug">{chunks}</span>
            ),
            brand: () => <BrandName variant="hero" />,
          })}
        </h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-zone-muted md:text-lg md:leading-relaxed">
          {t("subtitle")}
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zone-muted/90 md:text-base md:leading-relaxed">
          {t("unites")}
        </p>
        <div className="mt-9 flex flex-wrap gap-2 font-mono text-[10px] text-zone-muted/85 md:text-xs">
          <Link
            href="/sell"
            className="rounded border border-zone-edge/90 bg-zone-deep/70 px-2.5 py-1 transition hover:border-archi-600/55 hover:text-archi-200/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-500/60"
          >
            {tNav("sell")}
          </Link>
          <Link
            href="/service-offer"
            className="rounded border border-zone-edge/90 bg-zone-deep/70 px-2.5 py-1 transition hover:border-archi-600/55 hover:text-archi-200/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-500/60"
          >
            {tNav("serviceOffer")}
          </Link>
          <Link
            href="/service-seek"
            className="rounded border border-archi-600/45 bg-archi-900/40 px-2.5 py-1 text-archi-200/95 transition hover:border-archi-500/70 hover:bg-archi-900/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-400/50"
          >
            {tNav("serviceSeek")}
          </Link>
        </div>
        <p className="mt-5 max-w-xl text-[11px] uppercase tracking-[0.22em] text-zone-muted/75 md:text-xs">
          {t("adLinksMore")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] text-zone-muted/85 md:text-xs">
          <Link
            href="/buy"
            className="rounded border border-zone-edge/90 bg-zone-deep/70 px-2.5 py-1 transition hover:border-archi-600/55 hover:text-archi-200/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-500/60"
          >
            {tNav("buy")}
          </Link>
          <Link
            href="/rent"
            className="rounded border border-zone-edge/90 bg-zone-deep/70 px-2.5 py-1 transition hover:border-archi-600/55 hover:text-archi-200/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-500/60"
          >
            {tNav("rent")}
          </Link>
          <Link
            href="/jobs"
            className="rounded border border-archi-600/45 bg-archi-900/40 px-2.5 py-1 text-archi-200/95 transition hover:border-archi-500/70 hover:bg-archi-900/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-archi-400/50"
          >
            {tNav("jobs")}
          </Link>
        </div>
        {showAndroidBlock ? (
          <div className="mt-8 rounded-lg border border-zone-edge/70 bg-zone-deep/50 px-4 py-4 md:px-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-archi-400/90 md:text-xs">
              {t("appStoresCaption")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {playStoreUrl ? (
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-zone-panel px-4 py-2.5 text-sm font-semibold text-archi-100 ring-1 ring-zone-edge/80 transition hover:border-archi-600/40 hover:ring-archi-600/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
                >
                  {t("getOnGooglePlay")}
                </a>
              ) : null}
              {apkReady && !playStoreUrl ? (
                <a
                  href="/download/android"
                  className="inline-flex items-center justify-center rounded-lg bg-archi-600 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-archi-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-400"
                >
                  {t("downloadApk")}
                </a>
              ) : null}
            </div>
            {playStoreUrl ? (
              <p className="mt-3 text-xs leading-relaxed text-zone-muted/90">
                {t("googleSearchHint")}
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-8 text-sm text-zone-muted">
          <Link
            href="/about"
            className="font-medium text-archi-400 underline decoration-archi-600/50 underline-offset-4 transition hover:text-archi-300"
          >
            {t("aboutLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
