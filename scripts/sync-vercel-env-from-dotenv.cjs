/**
 * Читає кореневий .env і додає/оновлює змінні на Vercel (production).
 * Секрети не друкуються. Потрібні: vercel login, папка .vercel (vercel link).
 * Запуск: node scripts/sync-vercel-env-from-dotenv.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
const TARGET = "production";

const SENSITIVE = new Set([
  "DATABASE_URL",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "OPENAI_API_KEY",
]);

const KEYS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_PRIVACY_POLICY_URL",
  "NEXT_PUBLIC_TERMS_OF_USE_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
];

function parseEnv(content) {
  const env = {};
  for (const line of content.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function addOne(name, value) {
  const sens = SENSITIVE.has(name) ? "--sensitive " : "";
  const cmd = `npx vercel env add ${JSON.stringify(name)} ${TARGET} ${sens}--value ${JSON.stringify(
    value,
  )} --yes --force`;
  try {
    execSync(cmd, {
      cwd: root,
      shell: true,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0" },
    });
    return true;
  } catch (e) {
    process.stderr.write(e.stderr || e.message || `${name} failed\n`);
    return false;
  }
}

function main() {
  if (!fs.existsSync(path.join(root, ".vercel", "project.json"))) {
    console.error("Немає .vercel/project.json — спочатку: npx vercel link");
    process.exit(1);
  }
  if (!fs.existsSync(envPath)) {
    console.error("Немає файлу .env у корені проєкту.");
    process.exit(1);
  }

  const env = parseEnv(fs.readFileSync(envPath, "utf8"));
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const name of KEYS) {
    const value = env[name];
    if (value === undefined || value === "") {
      skip++;
      continue;
    }
    process.stdout.write(`${name} → Vercel (${TARGET}) … `);
    if (addOne(name, value)) {
      process.stdout.write("ok\n");
      ok++;
    } else {
      process.stdout.write("FAIL\n");
      fail++;
    }
  }

  console.log(`Готово: додано/оновлено ${ok}, пропущено порожніх ${skip}, помилок ${fail}`);
  if (fail) process.exit(1);
  console.log("Далі: npx vercel deploy --prod  (або npm run deploy:vercel)");
}

main();
