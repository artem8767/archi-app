import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandName } from "@/components/BrandName";
import { APP_BRAND_NAME } from "@/lib/brand";
import { getSiteDeveloperCredit } from "@/lib/site-credits";
import { getAppWebVersion } from "@/lib/app-version";

const FEATURE_KEYS = [
  "fNews",
  "fAds",
  "fServices",
  "fJobs",
  "fChat",
  "fI18n",
] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: `${t("metaTitlePrefix")} ${APP_BRAND_NAME}`,
    description: `${APP_BRAND_NAME} ${t("introBody")}`,
  };
}

export default async function AboutPage() {
  const t = await getTranslations("site");
  const tAuth = await getTranslations("auth");
  const developerCredit = getSiteDeveloperCredit();
  const webVersion = getAppWebVersion();

  const ctaClass =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500";

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zone-edge/80 bg-zone-panel/92 p-8 md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-archi-400/95 md:text-xs">
          {t("kicker")}
        </p>
        <h1 className="font-display mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-2xl font-semibold uppercase tracking-wide text-archi-50 sm:text-3xl md:tracking-[0.07em] leading-snug">
          {t.rich("aboutHeadline", {
            brand: () => <BrandName variant="hero" />,
            tail: (chunks) => (
              <span className="max-w-[min(100%,42rem)] text-[0.86em] font-medium leading-snug sm:text-[0.88em]">
                {chunks}
              </span>
            ),
          })}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-zone-muted md:text-lg md:leading-relaxed">
          <BrandName variant="inline" />
          {" "}
          {t("introBody")}
        </p>
        {webVersion ? (
          <p className="mt-6 text-sm text-zone-muted/90 tabular-nums">
            {t("appVersionWeb", { version: webVersion })}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-zone-edge/70 bg-zone-deep/40 p-8 md:p-10">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-archi-100 sm:text-xl">
          {t("featuresTitle")}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-4xl">
          {FEATURE_KEYS.map((key) => (
            <li
              key={key}
              className="flex gap-3 rounded-lg border border-zone-edge/60 bg-zone-panel/50 px-4 py-3 text-sm leading-relaxed text-zone-fog"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-archi-500"
                aria-hidden
              />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </section>

      {developerCredit ? (
        <section className="rounded-xl border border-zone-edge/70 bg-zone-panel/60 p-8 md:p-10">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-archi-100 sm:text-xl">
            {t("developerTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zone-fog md:text-base">
            <span className="text-zone-muted">{t("developerIntro")}</span>{" "}
            {developerCredit.url ? (
              <a
                href={developerCredit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-archi-300 underline decoration-archi-600/45 underline-offset-4 transition hover:text-archi-200"
              >
                {developerCredit.name}
              </a>
            ) : developerCredit.email ? (
              <a
                href={`mailto:${developerCredit.email}`}
                className="font-medium text-archi-300 underline decoration-archi-600/45 underline-offset-4 transition hover:text-archi-200"
              >
                {developerCredit.name}
              </a>
            ) : (
              <span className="font-medium text-archi-200">
                {developerCredit.name}
              </span>
            )}
          </p>
          {(developerCredit.email || developerCredit.phone) && (
            <ul className="mt-6 space-y-2 text-sm text-zone-fog">
              {developerCredit.email ? (
                <li>
                  <span className="text-zone-muted">
                    {t("developerEmailLabel")}:{" "}
                  </span>
                  <a
                    href={`mailto:${developerCredit.email}`}
                    className="font-medium text-archi-300 underline decoration-archi-600/45 underline-offset-4 transition hover:text-archi-200"
                  >
                    {developerCredit.email}
                  </a>
                </li>
              ) : null}
              {developerCredit.phone ? (
                <li>
                  <span className="text-zone-muted">
                    {t("developerPhoneLabel")}:{" "}
                  </span>
                  <a
                    href={`tel:${developerCredit.phone.replace(/\s/g, "")}`}
                    className="font-medium text-archi-300 underline decoration-archi-600/45 underline-offset-4 transition hover:text-archi-200"
                  >
                    {developerCredit.phone}
                  </a>
                </li>
              ) : null}
            </ul>
          )}
        </section>
      ) : null}

      <section className="rounded-xl border border-archi-700/40 bg-archi-950/25 p-8 md:p-10">
        <h2 className="font-display text-lg font-semibold text-archi-100 md:text-xl">
          {t("ctaTitle")}
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth/register"
            className={`${ctaClass} bg-archi-600 text-black hover:bg-archi-500`}
          >
            {tAuth("register")}
          </Link>
          <Link
            href="/auth/login"
            className={`${ctaClass} border border-archi-700/60 bg-zone-panel text-archi-200 hover:border-archi-500 hover:bg-zone-edge/40`}
          >
            {tAuth("login")}
          </Link>
          <Link
            href="/"
            className={`${ctaClass} border border-zone-edge/80 bg-zone-deep/80 text-zone-fog hover:border-archi-600/50 hover:text-archi-200`}
          >
            {t("ctaHome")}
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zone-muted">
          {t("note")}
        </p>
      </section>
    </div>
  );
}
