"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSession } from "./SessionProvider";
import { LocationPicker } from "./LocationPicker";
import { localeNames, routing } from "@/i18n/routing";
import {
  WALLPAPER_IDS,
  WALLPAPER_MESSAGE_KEYS,
  type WallpaperId,
  isWallpaperId,
} from "@/lib/wallpapers";
import { type UiThemeId, isUiThemeId } from "@/lib/ui-theme";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zone-edge/55 bg-zone-deep/25">
      <h2 className="border-b border-zone-edge/40 px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zone-muted">
        {title}
      </h2>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export function SettingsForm() {
  const t = useTranslations("settings");
  const { user, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<string>(routing.defaultLocale);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [notificationLevel, setNotificationLevel] = useState(100);
  const [lat, setLat] = useState(50.0755);
  const [lng, setLng] = useState(14.4378);
  const [addressLabel, setAddressLabel] = useState("");
  const [uiTheme, setUiTheme] = useState<UiThemeId>("stalker");
  const [wallpaperId, setWallpaperId] = useState<WallpaperId>("original");
  const [saved, setSaved] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  function requestDeviceLocation() {
    setGeoMsg(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoMsg(t("geoUnavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoMsg(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoMsg(t("geoDenied"));
        else setGeoMsg(t("geoError"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  }

  useEffect(() => {
    if (!user) return;
    setLocale(user.locale);
    setAutoTranslate(user.autoTranslate);
    setNotificationLevel(user.notificationLevel);
    if (user.lat != null && user.lng != null) {
      setLat(user.lat);
      setLng(user.lng);
    }
    setAddressLabel(user.addressLabel ?? "");
    setWallpaperId(
      user.wallpaperId && isWallpaperId(user.wallpaperId)
        ? user.wallpaperId
        : "original"
    );
    setUiTheme(
      user.uiTheme && isUiThemeId(user.uiTheme) ? user.uiTheme : "stalker"
    );
  }, [user]);

  const save = useCallback(async () => {
    if (!user) return;
    const switchLocale = locale !== user.locale;
    const r = await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        locale,
        autoTranslate,
        notificationLevel,
        lat,
        lng,
        addressLabel: addressLabel || null,
        wallpaperId,
        uiTheme,
      }),
    });
    if (r.ok) {
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (switchLocale) {
        router.replace(pathname, { locale });
      }
    }
  }, [
    user,
    locale,
    autoTranslate,
    notificationLevel,
    lat,
    lng,
    addressLabel,
    wallpaperId,
    uiTheme,
    refresh,
    router,
    pathname,
  ]);

  if (!user) {
    return <p className="text-zone-muted">{t("mustLogin")}</p>;
  }

  return (
    <div className="pda-panel mx-auto max-w-3xl space-y-5 p-5 sm:p-6">
      <h1 className="font-display text-2xl font-semibold tracking-wide text-archi-100">
        {t("title")}
      </h1>

      <SettingsSection title={t("sectionAccount")}>
        <label className="block">
          <span className="text-sm font-medium text-zone-fog">
            {t("language")}
          </span>
          <select
            className="mt-1 w-full pda-input"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            {routing.locales.map((loc) => (
              <option key={loc} value={loc}>
                {localeNames[loc]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            className="h-4 w-4 rounded border-zone-edge bg-zone-deep text-archi-500 focus:ring-archi-500"
          />
          <span className="text-sm text-zone-fog/95">{t("autoTranslate")}</span>
        </label>
        <p className="text-xs text-zone-muted">{t("autoTranslateHint")}</p>
      </SettingsSection>

      <SettingsSection title={t("sectionAppearance")}>
        <div>
          <p className="text-sm font-medium text-zone-fog">{t("uiTheme")}</p>
          <p className="mt-0.5 text-xs text-zone-muted">{t("uiThemeHint")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                { id: "stalker" as const, label: t("uiThemeStalker") },
                { id: "viking" as const, label: t("uiThemeViking") },
                { id: "zone" as const, label: t("uiThemeZone") },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setUiTheme(id)}
                aria-pressed={uiTheme === id}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-archi-500 ${
                  uiTheme === id
                    ? "border-archi-500 bg-archi-600 text-black"
                    : "border-zone-edge/80 bg-zone-panel/80 text-zone-fog hover:border-archi-700/50 hover:bg-zone-edge/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-zone-fog">{t("wallpaper")}</p>
          <p className="mt-0.5 text-xs text-zone-muted">{t("wallpaperHint")}</p>
          <div className="wallpaper-picker-scroll mt-3 max-h-[min(52vh,440px)] overflow-y-auto overflow-x-hidden rounded-xl border border-zone-edge/45 bg-zone-deep/30 p-3 pr-2">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {WALLPAPER_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-wallpaper={id}
                  className={`wall-thumb text-left ${
                    wallpaperId === id
                      ? "border-archi-500 ring-2 ring-archi-500/70"
                      : "border-zone-edge/40 hover:border-archi-700/50"
                  }`}
                  onClick={() => setWallpaperId(id)}
                  aria-pressed={wallpaperId === id}
                >
                  <span className="relative z-[1] flex h-full min-h-[2.75rem] items-end bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1.5 text-[0.58rem] font-medium leading-tight text-zone-fog/95 sm:min-h-[3rem] sm:text-[0.62rem]">
                    {t(WALLPAPER_MESSAGE_KEYS[id])}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title={t("sectionLocation")}>
        <p className="text-sm font-medium text-zone-fog">{t("location")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-zone-muted">{t("lat")}</span>
            <input
              type="number"
              step="any"
              className="mt-0.5 w-full pda-input"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            <span className="text-xs text-zone-muted">{t("lng")}</span>
            <input
              type="number"
              step="any"
              className="mt-0.5 w-full pda-input"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-zone-muted">{t("address")}</span>
          <input
            className="mt-0.5 w-full pda-input"
            value={addressLabel}
            onChange={(e) => setAddressLabel(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => requestDeviceLocation()}
            className="rounded-lg border border-archi-600/70 bg-zone-deep/80 px-4 py-2 text-sm font-medium text-archi-300 hover:border-archi-500 hover:bg-zone-edge/50"
          >
            {t("useMyLocation")}
          </button>
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(la, ln) => {
              setLat(la);
              setLng(ln);
            }}
            label={t("openMap")}
          />
        </div>
        {geoMsg && <p className="text-sm text-amber-700">{geoMsg}</p>}
      </SettingsSection>

      <SettingsSection title={t("sectionNotifications")}>
        <label className="block">
          <span className="text-sm font-medium text-zone-fog">
            {t("notificationLevel")}: {notificationLevel}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={notificationLevel}
            onChange={(e) => setNotificationLevel(Number(e.target.value))}
            className="mt-2 w-full accent-archi-600"
          />
        </label>
        <p className="text-xs text-zone-muted">{t("notifications")}</p>
      </SettingsSection>

      <button
        type="button"
        onClick={() => void save()}
        className="w-full rounded-xl bg-archi-600 py-3 text-center text-base font-semibold text-black transition hover:bg-archi-500 sm:py-2.5"
      >
        {saved ? "✓" : t("save")}
      </button>
    </div>
  );
}
