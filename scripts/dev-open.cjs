/**
 * Запускає `next dev`, звільняє порт за потреби, потім відкриває браузер (без HTTP-зондів — вони ламали Next dev на Windows).
 */
const { spawn, execSync } = require("child_process");
const path = require("path");

/**
 * `0.0.0.0` listens on all IPv4 interfaces — `http://127.0.0.1:3000` and LAN IP both work on Windows.
 * (`127.0.0.1` alone breaks Next dev self-proxy; `localhost` alone often skips IPv4 — bookmarks to 127.0.0.1 fail.)
 */
const host = process.env.DEV_HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || process.env.DEV_PORT || "3000", 10);
const openPath =
  process.env.DEV_OPEN_PATH ||
  (process.env.DEV_OPEN_LOCALE ? `/${process.env.DEV_OPEN_LOCALE}` : "/en");
const openUrl =
  process.env.DEV_OPEN_URL ||
  `http://${process.env.DEV_OPEN_HOST || "127.0.0.1"}:${port}${openPath}`;
/** Після Ready Next ще компілює /[locale] при першому заході — відкриваємо пізніше, щоб не було «Failed to proxy». */
const delayMs = parseInt(process.env.DEV_OPEN_DELAY_MS || "7000", 10);

const nextBin = require.resolve("next/dist/bin/next");
const projectRoot = path.join(__dirname, "..");

function freeListenPort(p) {
  if (process.env.DEV_NO_FREE_PORT === "1") return;
  if (process.platform === "win32") {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: "ignore" }
      );
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    execSync(`lsof -ti:${p} | xargs kill -9 2>/dev/null`, { stdio: "ignore" });
  } catch {
    /* ignore */
  }
}

function openBrowser(url) {
  console.log(`[dev-open] Відкриваю браузер (${delayMs} ms після старту): ${url}`);
  if (process.platform === "win32") {
    try {
      execSync(`cmd /c start "" ${JSON.stringify(url)}`, {
        stdio: "ignore",
        shell: true,
      });
      return;
    } catch {
      /* fall through */
    }
    const rundll = path.join(
      process.env.SystemRoot || "C:\\Windows",
      "System32",
      "rundll32.exe"
    );
    try {
      const opener = spawn(rundll, ["url.dll,FileProtocolHandler", url], {
        detached: true,
        stdio: "ignore",
        shell: false,
      });
      opener.unref();
      return;
    } catch {
      /* fall through */
    }
    try {
      execSync(
        `powershell -NoProfile -Command "Start-Process -FilePath ${JSON.stringify(url)}"`,
        { stdio: "ignore" }
      );
    } catch (e) {
      console.error("[dev-open] Не вдалося відкрити браузер. Відкрийте вручну:", url);
      console.error(e.message);
    }
    return;
  }
  if (process.platform === "darwin") {
    execSync(`open ${JSON.stringify(url)}`, { stdio: "ignore" });
  } else {
    execSync(`xdg-open ${JSON.stringify(url)}`, { stdio: "ignore" });
  }
}

console.log("[dev-open] Звільняю порт", port, "…");
freeListenPort(port);
try {
  if (process.platform === "win32") {
    execSync("ping -n 2 127.0.0.1 >nul 2>&1", { stdio: "ignore", shell: true });
  } else {
    execSync("sleep 1", { stdio: "ignore" });
  }
} catch {
  /* ignore */
}

/** Prefer IPv4 for `localhost` so Next’s dev self-proxy hits 127.0.0.1 while `next dev -H 127.0.0.1` is used (Windows). */
const nodeOpts = [process.env.NODE_OPTIONS, "--dns-result-order=ipv4first"]
  .filter(Boolean)
  .join(" ")
  .trim();

const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port), "-H", host], {
  stdio: "inherit",
  cwd: projectRoot,
  env: { ...process.env, NODE_OPTIONS: nodeOpts },
});

let opened = false;
const timer = setTimeout(() => {
  if (opened || process.env.DEV_SKIP_OPEN === "1") return;
  opened = true;
  openBrowser(openUrl);
}, delayMs);

child.on("exit", (code) => {
  clearTimeout(timer);
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  clearTimeout(timer);
  console.error(err);
  process.exit(1);
});
