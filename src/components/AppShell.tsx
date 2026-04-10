"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession } from "./SessionProvider";
import { GoogleTranslateWidget } from "./GoogleTranslateWidget";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { HeaderAccountMenu } from "./HeaderAccountMenu";
import { LogoArci } from "./LogoArci";
import { IconChat, IconNews, IconSettings } from "./icons/AppIcons";
import { APP_BRAND_NAME } from "@/lib/brand";
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

  const mobileNavTabs = [
    { href: "/news", key: "news" as const, Icon: IconNews },
    { href: "/chat", key: "chat" as const, Icon: IconChat },
    { href: "/settings", key: "settings" as const, Icon: IconSettings },
  ] as const;
  const { user, loading } = useSession();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-3 pb-6 pt-3 sm:px-6 sm:pb-24 sm:pt-4">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-archi-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:outline-none focus:ring-2 focus:ring-archi-300 focus:ring-offset-2 focus:ring-offset-zone-void"
      >
        {tCommon("skipToContent")}
      </a>
      <div className="sticky top-0 z-40 -mx-3 mb-4 border-b border-zone-edge/80 bg-zone-deep/95 px-2 py-2 backdrop-blur-md sm:mb-0 sm:hidden">
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            translate="no"
            data-notranslate-brand
            className="notranslate shrink-0 rounded-lg px-1 py-0.5 ring-1 ring-archi-500/25 transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
            aria-label={APP_BRAND_NAME}
          >
            <LogoArci size="sm" />
          </Link>
          <nav
            aria-label={tCommon("mobileNavAria")}
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5"
          >
            {mobileNavTabs.map(({ href, key, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-10 min-w-[2.5rem] shrink-0 flex-col items-center justify-center rounded-lg px-1.5 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                    active
                      ? "text-archi-400"
                      : "text-zone-muted hover:text-zone-fog"
                  }`}
                  aria-current={active ? "page" : undefined}
                  title={t(key)}
                >
                  <Icon
                    className={`h-[1.15rem] w-[1.15rem] shrink-0 ${
                      active ? "text-archi-400" : ""
                    }`}
                  />
                  <span className="max-w-[3.25rem] truncate text-[0.6rem] font-medium leading-tight">
                    {t(key)}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-1">
            {loading ? (
              <span
                className="inline-flex h-8 w-8 animate-pulse rounded-full bg-zone-edge"
                aria-hidden
              />
            ) : user ? (
              <HeaderAccountMenu />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="shrink-0 rounded-md bg-archi-600 px-2 py-1.5 text-[0.65rem] font-medium text-black transition hover:bg-archi-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-400"
                >
                  {tAuth("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="shrink-0 rounded-md border border-archi-700/60 bg-zone-panel px-2 py-1.5 text-[0.65rem] font-medium text-archi-200 transition hover:border-archi-500 hover:bg-zone-edge/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
                >
                  {tAuth("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 -mx-3 mb-8 hidden border-b border-zone-edge/80 bg-zone-deep/95 px-3 py-3 shadow-md shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-md sm:-mx-6 sm:mb-8 sm:block sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            translate="no"
            data-notranslate-brand
            className="notranslate group block shrink-0 rounded-lg px-1.5 py-1 ring-1 ring-archi-500/25 transition hover:opacity-95 hover:ring-archi-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 sm:px-2 sm:py-1.5 sm:ring-archi-400/30"
            aria-label={APP_BRAND_NAME}
          >
            <LogoArci
              size="md"
              className="drop-shadow-[0_0_18px_rgb(105_120_78/0.42)] transition group-hover:drop-shadow-[0_0_26px_rgb(130_150_85/0.5)]"
            />
          </Link>
          <nav
            aria-label={t("mainNavAria")}
            className="flex min-h-[2.5rem] min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin] sm:gap-2"
          >
            {navKeys.map((key) => {
              const path = ROUTES[key];
              const active = pathname === path;
              return (
                <Link
                  key={key}
                  href={path}
                  className={`shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 sm:px-2.5 sm:text-sm ${
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
          <div className="flex shrink-0 items-center gap-2">
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
      <footer className="mt-10 border-t border-zone-edge/50 pt-6 text-center">
        {developerCredit ? (
          <p className="mt-3 text-xs text-zone-muted">
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
        ) : null}
      </footer>
      <GoogleTranslateWidget
        key={`${user?.autoTranslate ? "1" : "0"}-${user?.locale ?? "en"}`}
        enabled={!!user?.autoTranslate}
        pageLanguage={user?.locale ?? "en"}
      />
    </div>
  );
}
