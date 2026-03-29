"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "./SessionProvider";
import { IconChevronDown, IconSettings } from "./icons/AppIcons";

export function HeaderAccountMenu() {
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const { user, loading, logout } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (loading) {
    return (
      <span
        className="inline-flex h-9 w-9 animate-pulse rounded-full bg-zone-edge"
        aria-hidden
      />
    );
  }

  if (!user) {
    return null;
  }

  const label = user.name || user.email;
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id="account-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[min(100%,220px)] items-center gap-2 rounded-full border border-zone-edge/80 bg-zone-panel/90 py-1 pl-1 pr-2 text-left transition hover:border-archi-700/45 hover:bg-zone-edge/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500"
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-archi-800/80 text-sm font-semibold text-archi-100"
          aria-hidden
        >
          {initial}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-sm text-zone-fog sm:block">
          {label}
        </span>
        <IconChevronDown
          className={`shrink-0 text-zone-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          id="account-menu"
          role="menu"
          aria-labelledby="account-menu-button"
          className="absolute right-0 z-50 mt-2 min-w-[min(100vw-2rem,260px)] max-w-[calc(100vw-1.5rem)] rounded-xl border border-zone-edge/90 bg-zone-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="border-b border-zone-edge/50 px-4 py-3">
            <p className="truncate text-sm font-medium text-zone-fog">{label}</p>
            <p className="truncate text-xs text-zone-muted">{user.email}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-3 px-4 py-3 text-sm text-zone-fog transition hover:bg-zone-edge/50"
            onClick={close}
          >
            <IconSettings className="shrink-0 text-zone-muted" />
            {tNav("settings")}
          </Link>
          <Link
            href="/about"
            role="menuitem"
            className="block px-4 py-3 text-sm text-zone-fog transition hover:bg-zone-edge/50"
            onClick={close}
          >
            {tNav("about")}
          </Link>
          <div className="my-1 border-t border-zone-edge/50" />
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-3 text-left text-sm font-medium text-archi-300 transition hover:bg-zone-edge/50"
            onClick={() => {
              close();
              void logout();
            }}
          >
            {tAuth("logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
