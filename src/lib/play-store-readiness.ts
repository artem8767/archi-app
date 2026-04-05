/**
 * Перевірки для безпечного продакшену та посилань на Google Play.
 * Запуск: `npm run play:readiness`; повний прогін: `npm run release:check`.
 * Підготовка до публікації (сайт + Play + нагадування): `npm run prepare:publish`.
 * Див. `scripts/PLAY_STORE_CHECKLIST.txt`.
 *
 * У консолі Play окремо: підпис AAB, targetSdk, Data safety, політика (URL), рейтинг контенту.
 */

export type ReadinessLevel = "error" | "warning";

export type ReadinessIssue = {
  level: ReadinessLevel;
  code: string;
  message: string;
};

const DEFAULT_JWT_PLACEHOLDER = "change-this-to-a-long-random-string-in-production";

function isHttpsPlayStoreAppUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (u.hostname !== "play.google.com") return false;
    return u.pathname.startsWith("/store/apps/details");
  } catch {
    return false;
  }
}

function isLocalOrDevSiteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" && u.hostname === "localhost") return true;
    if (u.hostname === "127.0.0.1") return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Повертає список проблем для заданих змінних середовища (наприклад `process.env`).
 * `treatAsProduction`: якщо `true`, застосовуються суворіші правила незалежно від `NODE_ENV`.
 */
export function getPlayStoreReadinessIssues(
  env: Record<string, string | undefined>,
  options?: { treatAsProduction?: boolean },
): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const prod =
    options?.treatAsProduction === true || env.NODE_ENV === "production";

  const playUrl = env.NEXT_PUBLIC_PLAY_STORE_URL?.trim();
  if (playUrl && !isHttpsPlayStoreAppUrl(playUrl)) {
    issues.push({
      level: "error",
      code: "PLAY_STORE_URL_INVALID",
      message:
        "NEXT_PUBLIC_PLAY_STORE_URL має бути HTTPS-посиланням на картку застосунку: https://play.google.com/store/apps/details?id=…",
    });
  }

  if (prod && env.SHOW_VERIFICATION_CODES?.trim() === "true") {
    issues.push({
      level: "error",
      code: "OTP_CODES_EXPOSED",
      message:
        "SHOW_VERIFICATION_CODES=true у production неприпустимо для Google Play / публічного сервера (коди в API).",
    });
  }

  if (prod) {
    const jwt = env.JWT_SECRET?.trim();
    if (!jwt || jwt === DEFAULT_JWT_PLACEHOLDER) {
      issues.push({
        level: "error",
        code: "JWT_SECRET_WEAK",
        message:
          "JWT_SECRET має бути довгим випадковим рядком у production (не залишайте значення за замовчуванням з .env.example).",
      });
    }
  }

  if (prod) {
    const db = env.DATABASE_URL?.trim() ?? "";
    if (db.startsWith("file:") && db.includes("dev.db")) {
      issues.push({
        level: "warning",
        code: "SQLITE_DEV_DB",
        message:
          "DATABASE_URL вказує на локальний SQLite dev.db — для реального продакшену потрібна стійка БД (і бекапи).",
      });
    }
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (prod && siteUrl) {
    try {
      const u = new URL(siteUrl);
      if (u.protocol !== "https:" && !isLocalOrDevSiteUrl(siteUrl)) {
        issues.push({
          level: "error",
          code: "SITE_NOT_HTTPS",
          message:
            "NEXT_PUBLIC_SITE_URL у production має використовувати https:// (крім локальної розробки).",
        });
      }
    } catch {
      issues.push({
        level: "error",
        code: "SITE_URL_INVALID",
        message: "NEXT_PUBLIC_SITE_URL не є коректним URL.",
      });
    }
  }

  if (prod && !env.NEXT_PUBLIC_SITE_URL?.trim()) {
    issues.push({
      level: "warning",
      code: "SITE_URL_MISSING",
      message:
        "NEXT_PUBLIC_SITE_URL не задано — для продакшену вкажіть канонічний https:// URL (sitemap, OG, посилання в застосунку).",
    });
  }

  if (prod && !env.NEXT_PUBLIC_PRIVACY_POLICY_URL?.trim()) {
    issues.push({
      level: "warning",
      code: "PRIVACY_POLICY_URL_MISSING",
      message:
        "Для Google Play зазвичай потрібна політика конфіденційності: додайте NEXT_PUBLIC_PRIVACY_POLICY_URL (HTTPS) і той самий URL у консолі Play.",
    });
  }

  if (prod && !env.NEXT_PUBLIC_TERMS_OF_USE_URL?.trim()) {
    issues.push({
      level: "warning",
      code: "TERMS_URL_MISSING",
      message:
        "Рекомендовано NEXT_PUBLIC_TERMS_OF_USE_URL (HTTPS, напр. …/en/terms) — для Play та посилань у застосунку.",
    });
  }

  if (prod) {
    const emailOk =
      Boolean(env.RESEND_API_KEY?.trim() && env.EMAIL_FROM?.trim()) ||
      Boolean(env.SMTP_HOST?.trim() && env.EMAIL_FROM?.trim());
    const showCodes = env.SHOW_VERIFICATION_CODES === "true";
    if (!emailOk && !showCodes) {
      issues.push({
        level: "warning",
        code: "VERIFICATION_NOT_CONFIGURED",
        message:
          "Немає відправки листів для коду реєстрації: додайте Resend або SMTP (EMAIL_FROM). Для внутрішнього тесту — SHOW_VERIFICATION_CODES=true (небезпечно).",
      });
    }
  }

  return issues;
}

export function formatReadinessReport(
  issues: ReadinessIssue[],
): { ok: boolean; text: string } {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const lines: string[] = [];
  if (errors.length) {
    lines.push("Помилки (блокують безпечний реліз / політику):");
    for (const e of errors) lines.push(`  [${e.code}] ${e.message}`);
  }
  if (warnings.length) {
    lines.push("Попередження:");
    for (const w of warnings) lines.push(`  [${w.code}] ${w.message}`);
  }
  if (!lines.length) {
    lines.push("Автоматичних блокерів не знайдено (див. також вимоги консолі Play для нативного APK/AAB).");
  }
  return { ok: errors.length === 0, text: lines.join("\n") };
}
