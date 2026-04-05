import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { APP_BRAND_NAME } from "@/lib/brand";
import { getPrivacySections } from "@/lib/privacy-policy-content";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "site",
  });
  return {
    title: `${t("privacyPageTitle")} · ${APP_BRAND_NAME}`,
    description: t("privacyPageDescription"),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const sections = getPrivacySections(locale);
  const showEnNotice = locale !== "en" && locale !== "uk";
  const notice = t("privacyLegalNotice");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-archi-400/95 md:text-xs">
          {APP_BRAND_NAME}
        </p>
        <h1 className="font-display text-2xl font-semibold text-archi-50 sm:text-3xl">
          {t("privacyPageTitle")}
        </h1>
        <p className="text-sm text-zone-muted">
          {t("privacyUpdatedLabel")}{" "}
          <time dateTime="2026-04-04">{t("privacyUpdatedDate")}</time>
        </p>
      </header>

      {showEnNotice && notice ? (
        <p className="rounded-lg border border-archi-800/50 bg-zone-deep/60 p-4 text-sm text-zone-fog/95">
          {notice}
        </p>
      ) : null}

      <div className="space-y-10 rounded-xl border border-zone-edge/80 bg-zone-panel/85 p-6 sm:p-8">
        {sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-lg font-semibold text-archi-200">{section.heading}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-zone-fog/95">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
