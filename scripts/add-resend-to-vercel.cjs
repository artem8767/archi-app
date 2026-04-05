/**
 * Додає RESEND_API_KEY у Vercel Production (перезаписує, якщо вже є).
 *
 * 1) https://resend.com/api-keys — створити ключ (безкоштовний план).
 * 2) PowerShell з кореня репо:
 *    $env:RESEND_API_KEY = "re_xxxxxxxx"
 *    node scripts/add-resend-to-vercel.cjs
 */
const { execSync } = require("child_process");
const path = require("path");

const key = process.env.RESEND_API_KEY?.trim();
if (!key || !key.startsWith("re_")) {
  console.error(
    "Задайте змінну середовища RESEND_API_KEY (ключ з https://resend.com/api-keys), наприклад:\n" +
      '  $env:RESEND_API_KEY = "re_..."\n' +
      "  node scripts/add-resend-to-vercel.cjs",
  );
  process.exit(1);
}

const root = path.join(__dirname, "..");
const cmd = `npx vercel env add ${JSON.stringify("RESEND_API_KEY")} production --sensitive --value ${JSON.stringify(key)} --yes --force`;
execSync(cmd, { cwd: root, stdio: "inherit", shell: true });
console.log("\nДалі: Vercel → Redeploy production (або npm run deploy:vercel).");
