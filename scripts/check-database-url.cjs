/** Перевіряє DATABASE_URL у .env або файлі з аргумента (без друку секретів). */
const fs = require("fs");
const path = require("path");

const file = process.argv[2] || path.join(__dirname, "..", ".env");
if (!fs.existsSync(file)) {
  console.error("Файл не знайдено:", file);
  process.exit(1);
}
const text = fs.readFileSync(file, "utf8");
const m = text.match(/^DATABASE_URL=(.*)$/m);
if (!m) {
  console.error("DATABASE_URL відсутній у", file);
  process.exit(1);
}
let v = m[1].trim();
if (
  (v.startsWith('"') && v.endsWith('"')) ||
  (v.startsWith("'") && v.endsWith("'"))
) {
  v = v.slice(1, -1);
}
if (v.startsWith("file:")) {
  console.error(
    "Проблема: DATABASE_URL вказує на SQLite (file:). На Vercel потрібен postgresql://",
  );
  process.exit(2);
}
if (!/^postgres(ql)?:\/\//i.test(v)) {
  console.error("Проблема: DATABASE_URL має починатися з postgresql:// або postgres://");
  process.exit(3);
}
try {
  const normalized = v.replace(/^postgresql:/i, "http:").replace(/^postgres:/i, "http:");
  const x = new URL(normalized);
  console.log("OK: PostgreSQL, хост:", x.hostname);
  process.exit(0);
} catch {
  console.error("Проблема: некоректний рядок підключення");
  process.exit(4);
}
