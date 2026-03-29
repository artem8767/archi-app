import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Fallback when opening `/` without a locale segment (middleware also redirects). */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
