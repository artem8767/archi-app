import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Oswald, Share_Tech_Mono } from "next/font/google";
import { getPlayStoreUrl } from "@/lib/app-stores";
import { APP_BRAND_NAME } from "@/lib/brand";
import { getSiteDeveloperCredit } from "@/lib/site-credits";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const fontDisplay = Oswald({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const fontSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fontStalkerHud = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-stalker-hud",
  weight: "400",
});

const googleVerify = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const developerCredit = getSiteDeveloperCredit();
const playStoreUrl = getPlayStoreUrl();
const siteUrl = getSiteUrl();

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_BRAND_NAME,
  description: "News, classifieds, chat",
  url: siteUrl,
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Web Browser",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  ...(playStoreUrl ? { installUrl: playStoreUrl } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: APP_BRAND_NAME,
  description: "News, classifieds, chat",
  ...(developerCredit
    ? {
        authors: [
          {
            name: developerCredit.name,
            ...(developerCredit.url
              ? { url: developerCredit.url }
              : developerCredit.email
                ? { url: `mailto:${developerCredit.email}` }
                : {}),
          },
        ],
      }
    : {}),
  ...(googleVerify ? { verification: { google: googleVerify } } : {}),
  openGraph: {
    locale: "en_US",
    type: "website",
    siteName: APP_BRAND_NAME,
  },
  appleWebApp: {
    capable: true,
    title: APP_BRAND_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2a3224" },
    { media: "(prefers-color-scheme: dark)", color: "#12150e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-ui-theme="stalker" suppressHydrationWarning>
      <body
        data-wallpaper="original"
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontStalkerHud.variable} zone-atmosphere min-h-screen font-sans text-zone-fog antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebApp),
          }}
        />
        {children}
      </body>
    </html>
  );
}
