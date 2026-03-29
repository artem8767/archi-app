import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AppShell } from "@/components/AppShell";
import { HtmlLang } from "@/components/HtmlLang";
import { SessionProvider } from "@/components/SessionProvider";
import { getSiteDeveloperCredit } from "@/lib/site-credits";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const developerCredit = getSiteDeveloperCredit();

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlLang />
      <SessionProvider>
        <AppShell developerCredit={developerCredit}>{children}</AppShell>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
