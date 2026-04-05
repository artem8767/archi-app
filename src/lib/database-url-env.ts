/**
 * Перевірка DATABASE_URL у середовищі (без логування секретів).
 * Повертає короткий опис проблеми українською або null, якщо вигляд нормальний.
 */
export function databaseUrlEnvProblem(): string | null {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  if (!raw) {
    return "DATABASE_URL не задано або порожній.";
  }
  if (raw.startsWith("file:")) {
    return "DATABASE_URL вказує на локальний файл SQLite (file:…) — на Vercel це не працює.";
  }
  if (!/^postgres(ql)?:\/\//i.test(raw)) {
    return "DATABASE_URL має починатися з postgresql:// або postgres://.";
  }
  return null;
}

export function databaseUrlSetupHint(): string {
  return (
    "Створіть безкоштовну БД у Neon (neon.tech) або Supabase, скопіюйте рядок підключення з ?sslmode=require, " +
    "додайте його в Vercel → Settings → Environment Variables → Production як DATABASE_URL, зробіть Redeploy. " +
    "Потім з ПК: задайте той самий DATABASE_URL і виконайте npx prisma db push."
  );
}
