"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { isWallpaperId } from "@/lib/wallpapers";
import { isUiThemeId } from "@/lib/ui-theme";

const WALLPAPER_STORAGE_KEY = "archi-wallpaper";
const UI_THEME_STORAGE_KEY = "archi-ui-theme";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  locale: string;
  autoTranslate: boolean;
  notificationLevel: number;
  lat: number | null;
  lng: number | null;
  addressLabel: string | null;
  wallpaperId?: string;
  uiTheme?: string;
};

type Ctx = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      const text = await r.text();
      if (!r.ok || !text) {
        setUser(null);
        return;
      }
      try {
        const j = JSON.parse(text) as { user?: SessionUser | null };
        setUser(j.user ?? null);
      } catch {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const apply = (id: string) => {
      const v = isWallpaperId(id) ? id : "original";
      document.body.setAttribute("data-wallpaper", v);
    };
    if (user) {
      const id =
        user.wallpaperId && isWallpaperId(user.wallpaperId)
          ? user.wallpaperId
          : "original";
      apply(id);
      try {
        localStorage.setItem(WALLPAPER_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const stored = localStorage.getItem(WALLPAPER_STORAGE_KEY);
      if (stored && isWallpaperId(stored)) {
        apply(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    apply("original");
  }, [user?.wallpaperId, user]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const applyTheme = (id: string) => {
      const v = isUiThemeId(id) ? id : "stalker";
      document.documentElement.setAttribute("data-ui-theme", v);
    };
    if (user) {
      const id =
        user.uiTheme && isUiThemeId(user.uiTheme) ? user.uiTheme : "stalker";
      applyTheme(id);
      try {
        localStorage.setItem(UI_THEME_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const stored = localStorage.getItem(UI_THEME_STORAGE_KEY);
      if (stored && isUiThemeId(stored)) {
        applyTheme(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    applyTheme("stalker");
  }, [user?.uiTheme, user]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const c = useContext(SessionContext);
  if (!c) throw new Error("useSession outside SessionProvider");
  return c;
}
