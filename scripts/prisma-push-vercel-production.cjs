/**
 * Тягне Production env з Vercel і виконує prisma db push (схема на ту саму БД, що на сайті).
 * Не комітить секрети. Потрібні: vercel link, prisma/schema.prisma.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const pullPath = path.join(root, ".env.vercel.pull.tmp");

function parseDatabaseUrl(content) {
  const m = content.match(/^DATABASE_URL=(.*)$/m);
  if (!m) return null;
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v || null;
}

execSync(`npx vercel env pull "${pullPath}" --environment production --yes`, {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

const raw = fs.readFileSync(pullPath, "utf8");
const databaseUrl = parseDatabaseUrl(raw);
try {
  fs.unlinkSync(pullPath);
} catch {
  /* ignore */
}

if (!databaseUrl) {
  console.error("Не знайдено DATABASE_URL у змінних Production.");
  process.exit(1);
}

console.log("prisma db push …");
execSync("npx prisma db push", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
  shell: true,
});
console.log("Готово.");
