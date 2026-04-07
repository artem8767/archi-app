"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { BrandName } from "@/components/BrandName";

const SPLASH_MS = 3000;

/**
 * Головна: лише привітання кілька секунд, далі — стрічка «Нове».
 */
export function HomeWelcomeGate() {
  const t = useTranslations("home");
  const router = useRouter();

  useEffect(() => {
    const id = window.setTimeout(() => {
      router.replace("/news");
    }, SPLASH_MS);
    return () => window.clearTimeout(id);
  }, [router]);

  return (
    <div
      className="flex min-h-[min(70vh,520px)] flex-col items-center justify-center px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <h1 className="font-display max-w-xl text-2xl font-semibold uppercase tracking-wide text-archi-50 sm:text-3xl md:tracking-[0.07em] leading-snug">
        {t.rich("welcomeHeading", {
          prefix: (chunks) => (
            <span className="text-[0.88em] font-medium leading-snug">{chunks}</span>
          ),
          brand: () => <BrandName variant="hero" />,
        })}
      </h1>
    </div>
  );
}
