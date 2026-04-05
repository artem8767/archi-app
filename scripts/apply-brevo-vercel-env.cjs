/**
 * Додає Brevo SMTP у Vercel Production (перезаписує наявні).
 * Не зберігайте ключ у файлах репо.
 *
 *   $env:BREVO_SMTP_KEY = "xsmtpsib-..."
 *   $env:BREVO_SMTP_USER = "email@який_у_Brevo"   # опційно; інакше git config user.email
 *   node scripts/apply-brevo-vercel-env.cjs
 */
const { execSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const pass = process.env.BREVO_SMTP_KEY?.trim();
let user = process.env.BREVO_SMTP_USER?.trim();
if (!user) {
  try {
    user = execSync("git config user.email", {
      encoding: "utf8",
      cwd: root,
    }).trim();
  } catch {
    /* ignore */
  }
}

if (!pass || !pass.startsWith("xsmtpsib-")) {
  console.error(
    "Задайте BREVO_SMTP_KEY (SMTP-ключ з Brevo → SMTP & API).\n" +
      "За потреби: BREVO_SMTP_USER = email входу в Brevo (якщо не збігається з git).",
  );
  process.exit(1);
}
if (!user) {
  console.error("Не вдалося визначити email: задайте BREVO_SMTP_USER.");
  process.exit(1);
}

function add(name, value, sensitive) {
  const sens = sensitive ? "--sensitive " : "";
  const cmd = `npx vercel env add ${JSON.stringify(name)} production ${sens}--value ${JSON.stringify(value)} --yes --force`;
  execSync(cmd, { cwd: root, stdio: "inherit", shell: true });
}

add("SMTP_USER", user, true);
add("SMTP_PASSWORD", pass, true);
add("SMTP_PORT", "587", false);
add("SMTP_SECURE", "false", false);
add("SMTP_HOST", "smtp-relay.brevo.com", false);
add("EMAIL_FROM", `АРЧІ <${user}>`, false);

console.log("\nГотово. Запустіть redeploy: npm run deploy:vercel");
