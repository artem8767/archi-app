"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  IconChat,
  IconHome,
  IconNews,
  IconSettings,
} from "./icons/AppIcons";

const tabs = [
  { href: "/", key: "home" as const, Icon: IconHome },
  { href: "/news", key: "news" as const, Icon: IconNews },
  { href: "/chat", key: "chat" as const, Icon: IconChat },
  { href: "/settings", key: "settings" as const, Icon: IconSettings },
];

export function MobileAppNav() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zone-edge/80 bg-zone-deep/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md sm:hidden"
      aria-label={tCommon("mobileNavAria")}
    >
      <ul className="mx-auto flex max-w-lg justify-around">
        {tabs.map(({ href, key, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === ""
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[0.65rem] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                  active
                    ? "text-archi-400"
                    : "text-zone-muted hover:text-zone-fog"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={active ? "text-archi-400" : undefined} />
                <span className="max-w-[4.5rem] truncate">
                  {key === "home" ? tCommon("home") : tNav(key)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
