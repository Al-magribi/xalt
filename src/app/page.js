import Home from "@/components/home/Home";
import { trackVisitorPageView } from "@/actions/analytics";
import { getSeoMetadataByPageKey, getWebsiteBranding } from "@/actions/setting";
import { buildMetadataFromSeo, buildPageMetadata, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [seo, branding] = await Promise.all([
    getSeoMetadataByPageKey("home"),
    getWebsiteBranding(),
  ]);
  const siteOrigin = resolveSiteOrigin(branding.app_url);

  const fromDb = buildMetadataFromSeo(seo, {
    siteOrigin,
    fallbackOgImage: branding.og_image_url,
  });

  if (fromDb) return fromDb;

  return buildPageMetadata({
    title: `${branding.site_name} | ${branding.site_tagline || "Merchandise Kit"}`,
    description:
      `${branding.site_name} menyediakan merchandise kit modern untuk startup, bank, dan event.`,
    path: "/",
    siteOrigin,
    image: branding.og_image_url,
  });
}

function toQueryString(searchParams) {
  if (!searchParams || typeof searchParams !== "object") return null;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && String(item).trim()) params.append(key, String(item));
      });
      continue;
    }

    if (value != null && String(value).trim()) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString || null;
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  await trackVisitorPageView({
    pageType: "home",
    routePath: "/",
    queryString: toQueryString(resolvedSearchParams),
  });

  return <Home />;
}
