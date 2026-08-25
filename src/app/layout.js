import "./globals.css";
import { Suspense } from "react";
import { Manrope, Sora } from "next/font/google";
import { query } from "@/config/db";
import MetaPixel from "@/components/analytics/MetaPixel";
import { resolveAssetUrl } from "@/utils/media";

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
  let ogImageUrl = "";
  let appUrl = "https://x-alt.id";

  try {
    const result = await query(
      `SELECT site_name, site_tagline, favicon_url, og_image_url, app_url
       FROM settings.website_config
       WHERE id = 1
       LIMIT 1`,
    );
    const row = result.rows[0] || {};

    if (row.site_name) siteName = row.site_name;
    if (row.site_tagline) siteTagline = row.site_tagline;
    if (row.favicon_url) faviconUrl = resolveAssetUrl(row.favicon_url, "/favicon.ico");
    if (row.og_image_url) ogImageUrl = resolveAssetUrl(row.og_image_url);
    if (row.app_url) {
      try {
        const parsed = new URL(row.app_url);
        if (["http:", "https:"].includes(parsed.protocol)) {
          appUrl = parsed.origin;
        }
      } catch {
        // keep default appUrl
      }
    }
  } catch {
    // Use fallback metadata when database is unavailable.
  }

  const description =
    `${siteName} menyediakan merchandise kit modern untuk startup, bank, dan event. ` +
    "Bangun pengalaman brand yang berkesan lewat produk custom berkualitas.";

  const metadataBase = new URL(appUrl);

  return {
    metadataBase,
    title: {
      default: `${siteName} | ${siteTagline}`,
      template: `%s | ${siteName}`,
    },
    description,
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
      url: appUrl,
      siteName,
      locale: "id_ID",
      type: "website",
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: `${siteName} preview`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${siteTagline}`,
      description: "Temukan koleksi merchandise kit custom untuk kebutuhan brand dan event perusahaan.",
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    // Canonical diset per-halaman agar tidak semua URL mengarah ke homepage.
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
