"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "./SessionProvider";
import { GoogleTranslateWidget } from "./GoogleTranslateWidget";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderAccountMenu } from "./HeaderAccountMenu";
import { MobileAppNav } from "./MobileAppNav";
import { IconSettings } from "./icons/AppIcons";
import type { SiteDeveloperCredit } from "@/lib/site-credits";

const navKeys = [
  "news",
  "chat",
  "sell",
  "buy",
  "rent",
  "serviceOffer",
  "serviceSeek",
  "jobs",
  "about",
] as const;

const ROUTES: Record<(typeof navKeys)[number], string> = {
  news: "/news",
  chat: "/chat",
  sell: "/sell",
  buy: "/buy",
  rent: "/rent",
  serviceOffer: "/service-offer",
  serviceSeek: "/service-seek",
  jobs: "/jobs",
  about: "/about",
};

export function AppShell({
  children,
  developerCredit,
}: {
  children: React.ReactNode;
  developerCredit?: SiteDeveloperCredit | null;
}) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tSite = useTranslations("site");
  const pathname = usePathname();
  const { user, loading } = useSession();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-28 pt-3 sm:px-6 sm:pb-24 sm:pt-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-archi-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:outline-none focus:ring-2 focus:ring-archi-300 focus:ring-offset-2 focus:ring-offset-zone-void"
      >
        {tCommon("skipToContent")}
      </a>
      <header className="sticky top-0 z-40 -mx-3 mb-5 border-b border-zone-edge/80 bg-zone-deep/95 px-3 py-3 shadow-md shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            href="/"
            className="animate-rad-glow-soft font-display text-2xl font-semibold uppercase tracking-[0.38em] text-archi-100 transition hover:text-archi-50"
          >
            АРЧІ
          </Link>
          <nav
            aria-label="Головна навігація"
            className="flex max-w-full gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {navKeys.map((key) => {
              const path = ROUTES[key];
              const active = pathname === path;
              return (
                <Link
                  key={key}
                  href={path}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                    active
                      ? "bg-archi-600 text-black"
                      : "bg-zone-panel/80 text-zone-muted ring-1 ring-zone-edge/80 transition hover:bg-zone-edge/50 hover:text-zone-fog hover:ring-archi-700/40"
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </nav>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <Link
              href="/settings"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zone-edge/80 bg-zone-panel/90 text-zone-fog transition hover:border-archi-700/45 hover:bg-zone-edge/40 hover:text-archi-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
              aria-label={t("settings")}
              title={t("settings")}
            >
              <IconSettings className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <LocaleSwitcher />
            {loading ? (
              <span
                className="inline-flex h-5 w-5 animate-pulse rounded-full bg-zone-edge"
                aria-hidden
              />
            ) : user ? (
              <HeaderAccountMenu />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-md bg-archi-600 px-3 py-1.5 text-sm font-medium text-black transition hover:bg-archi-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-400"
                >
                  {tAuth("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md border border-archi-700/60 bg-zone-panel px-3 py-1.5 text-sm font-medium text-archi-200 transition hover:border-archi-500 hover:bg-zone-edge/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
                >
                  {tAuth("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1" id="main-content">
        {children}
      </main>
      {developerCredit ? (
        <footer className="mt-10 border-t border-zone-edge/50 pt-6 text-center">
          <p className="text-xs text-zone-muted">
            {developerCredit.url ? (
              <>
                {tSite("developerFooterPrefix")}{" "}
                <a
                  href={developerCredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-archi-400 underline decoration-archi-600/40 underline-offset-2 transition hover:text-archi-300"
                >
                  {developerCredit.name}
                </a>
              </>
            ) : developerCredit.email ? (
              <>
                {tSite("developerFooterPrefix")}{" "}
                <a
                  href={`mailto:${developerCredit.email}`}
                  className="font-medium text-archi-400 underline decoration-archi-600/40 underline-offset-2 transition hover:text-archi-300"
                >
                  {developerCredit.name}
                </a>
              </>
            ) : (
              tSite("developerFooter", { name: developerCredit.name })
            )}
          </p>
        </footer>
      ) : null}
      <MobileAppNav />
      <GoogleTranslateWidget
        key={`${user?.autoTranslate ? "1" : "0"}-${user?.locale ?? "en"}`}
        enabled={!!user?.autoTranslate}
        pageLanguage={user?.locale ?? "en"}
      />
    </div>
  );
}
