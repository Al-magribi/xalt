import { resolveAssetUrl } from "@/utils/media";

export const DEFAULT_SITE_ORIGIN = "https://x-alt.id";

export function resolveSiteOrigin(appUrl) {
  const fallback = DEFAULT_SITE_ORIGIN;

  if (!appUrl || typeof appUrl !== "string") return fallback;

  try {
    const parsed = new URL(appUrl.trim());
    if (["http:", "https:"].includes(parsed.protocol)) {
      return parsed.origin;
    }
  } catch {
    // keep fallback
  }

  return fallback;
}

export function absoluteUrl(origin, pathOrUrl) {
  if (!pathOrUrl) return origin;

  const value = String(pathOrUrl).trim();
  if (!value) return origin;

  if (/^https?:\/\//i.test(value) || value.startsWith("//")) {
    return value.startsWith("//") ? `https:${value}` : value;
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  return `${origin.replace(/\/$/, "")}${path}`;
}

/**
 * Convert settings.seo_metadata row into Next.js Metadata.
 */
export function buildMetadataFromSeo(seo, { siteOrigin, fallbackOgImage } = {}) {
  if (!seo) return null;

  const origin = siteOrigin || DEFAULT_SITE_ORIGIN;
  const pagePath = seo.page_path || "/";
  const canonical =
    seo.canonical_url ||
    absoluteUrl(origin, pagePath === "/" ? "/" : pagePath);

  const ogImage = resolveAssetUrl(seo.og_image_url) || resolveAssetUrl(fallbackOgImage) || "";
  const twitterImage =
    resolveAssetUrl(seo.twitter_image_url) || ogImage || "";

  const title = seo.meta_title;
  const description = seo.meta_description;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: Array.isArray(seo.meta_keywords) ? seo.meta_keywords : undefined,
    robots: {
      index: Boolean(seo.robots_index),
      follow: Boolean(seo.robots_follow),
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo.og_title || title,
      description: seo.og_description || description,
      url: canonical,
      type: seo.og_type || "website",
      locale: "id_ID",
      ...(ogImage
        ? {
            images: [
              {
                url: absoluteUrl(origin, ogImage),
                width: 1200,
                height: 630,
                alt: seo.og_title || title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: seo.twitter_card || "summary_large_image",
      title: seo.twitter_title || title,
      description: seo.twitter_description || description,
      ...(twitterImage ? { images: [absoluteUrl(origin, twitterImage)] } : {}),
    },
  };
}

export function buildPageMetadata({
  title,
  description,
  path,
  siteOrigin,
  image,
  index = true,
  follow = true,
  type = "website",
}) {
  const origin = siteOrigin || DEFAULT_SITE_ORIGIN;
  const canonical = absoluteUrl(origin, path || "/");
  const imageUrl = image ? absoluteUrl(origin, resolveAssetUrl(image)) : "";

  return {
    title,
    description,
    robots: { index, follow },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      locale: "id_ID",
      ...(imageUrl
        ? {
            images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export const NO_INDEX_METADATA = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
