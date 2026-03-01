import "./globals.css";
import { Suspense } from "react";
import { Manrope, Sora } from "next/font/google";
import { query } from "@/config/db";
import MetaPixel from "@/components/analytics/MetaPixel";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export async function generateMetadata() {
  let siteName = "X-ALT";
  let siteTagline = "Solusi Merchandise Kit untuk Brand & Event";
  let faviconUrl = "/favicon.ico";

  try {
    const result = await query(
      `SELECT site_name, site_tagline, favicon_url
       FROM settings.website_config
       WHERE id = 1
       LIMIT 1`,
    );
    const row = result.rows[0] || {};

    if (row.site_name) siteName = row.site_name;
    if (row.site_tagline) siteTagline = row.site_tagline;
    if (row.favicon_url) faviconUrl = row.favicon_url;
  } catch {
    // Use fallback metadata when database is unavailable.
  }

  return {
    metadataBase: new URL("https://x-alt.id"),
    title: {
      default: `${siteName} | ${siteTagline}`,
      template: `%s | ${siteName}`,
    },
    description:
      `${siteName} menyediakan merchandise kit modern untuk startup, bank, dan event. ` +
      "Bangun pengalaman brand yang berkesan lewat produk custom berkualitas.",
    keywords: [
      "merchandise",
      "startup kit",
      "bank kit",
      "event kit",
      "eco merchandise",
      "corporate gifting",
      siteName,
    ],
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    openGraph: {
      title: `${siteName} | ${siteTagline}`,
      description:
        "Startup Kit, Bank Kit, Event Kit, dan Eco Merchandise Kit dengan desain modern dan kualitas premium.",
      url: "https://x-alt.id",
      siteName,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${siteTagline}`,
      description: "Temukan koleksi merchandise kit custom untuk kebutuhan brand dan event perusahaan.",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "https://x-alt.id",
    },
  };
}

async function getActiveMetaPixelId() {
  try {
    const result = await query(
      `SELECT public_key
       FROM settings.api_integrations
       WHERE provider = 'meta_pixel'
         AND is_active = TRUE
       LIMIT 1`,
    );

    return String(result.rows?.[0]?.public_key || "").trim() || null;
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const metaPixelId = await getActiveMetaPixelId();

  return (
    <html lang='id'>
      <body className={`${manrope.variable} ${sora.variable} antialiased`}>
        <Suspense fallback={null}>
          <MetaPixel pixelId={metaPixelId} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
