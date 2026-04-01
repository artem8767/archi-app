"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LogoArci } from "./LogoArci";

const HOLD_MS = 1200;
const FADE_MS = 480;
const REDUCED_HOLD_MS = 280;
const REDUCED_FADE_MS = 120;

/**
 * Full-screen ARCHI splash on first paint, then fades into the app.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const tCommon = useTranslations("common");
  const [phase, setPhase] = useState<"splash" | "fade" | "done">("splash");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS;
    const fade = reduced ? REDUCED_FADE_MS : FADE_MS;

    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => {
      setPhase("fade");
      document.body.style.overflow = "";
    }, hold);

    const t2 = window.setTimeout(() => setPhase("done"), hold + fade);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {children}
      {phase !== "done" && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zone-void transition-opacity duration-[480ms] ease-out motion-reduce:duration-150 ${
            phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={phase === "fade"}
        >
          <div className="bg-rad-glow pointer-events-none absolute inset-0 opacity-40" />
          <div className="animate-rad-glow-soft relative px-6">
            <LogoArci
              size="lg"
              className="drop-shadow-[0_0_28px_rgb(105_120_78/0.35)]"
            />
          </div>
          <p className="font-display relative mt-6 text-[0.65rem] uppercase tracking-[0.55em] text-archi-500/90">
            {tCommon("loading")}
          </p>
        </div>
      )}
    </>
  );
}
