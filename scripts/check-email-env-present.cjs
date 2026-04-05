const fs = require("fs");
const path = require("path");

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const root = path.join(__dirname, "..");
for (const name of [".env", ".env.local"]) {
  const fp = path.join(root, name);
  if (!fs.existsSync(fp)) continue;
  const e = parseEnv(fs.readFileSync(fp, "utf8"));
  const resend = Boolean(e.RESEND_API_KEY?.trim());
  const smtpOk =
    e.SMTP_HOST?.trim() &&
    e.EMAIL_FROM?.trim() &&
    e.SMTP_USER?.trim() &&
    e.SMTP_PASSWORD?.trim();
  console.log(name + ":");
  console.log("  RESEND_API_KEY:", resend ? "set" : "missing");
  console.log("  SMTP full set:", smtpOk ? "yes" : "no");
}
