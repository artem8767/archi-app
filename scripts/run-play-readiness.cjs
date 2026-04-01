/**
 * Запускає перевірку змінних для продакшену / Google Play (RUN_PLAY_CHECK=1 + vitest).
 */
const { spawnSync } = require("child_process");
const path = require("path");

process.env.RUN_PLAY_CHECK = "1";
const cwd = path.join(__dirname, "..");
const r = spawnSync(
  "npx",
  ["vitest", "run", "src/lib/play-store-readiness.test.ts"],
  {
    cwd,
    stdio: "inherit",
    env: { ...process.env, RUN_PLAY_CHECK: "1" },
    shell: true,
  },
);

process.exit(r.status === null ? 1 : r.status);
