/** Inlined at build from root `package.json` via `next.config.mjs`. */
export function getAppWebVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION?.trim() ?? "";
}
