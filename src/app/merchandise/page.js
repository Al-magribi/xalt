import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import Merchandise from "@/components/merchandise/Merchandise";
import { getActiveMerchandiseForHome } from "@/actions/catalog";
import { getSeoMetadataByPageKey, getWebsiteBranding } from "@/actions/setting";
import { trackVisitorPageView } from "@/actions/analytics";
import { buildMetadataFromSeo, buildPageMetadata, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [seo, branding] = await Promise.all([
    getSeoMetadataByPageKey("merchandise_list"),
    getWebsiteBranding(),
  ]);
  const siteOrigin = resolveSiteOrigin(branding.app_url);

  const fromDb = buildMetadataFromSeo(seo, {
    siteOrigin,
    fallbackOgImage: branding.og_image_url,
  });

  if (fromDb) return fromDb;

  return buildPageMetadata({
    title: "Semua Merchandise",
    description:
      "Jelajahi seluruh pilihan merchandise lengkap dengan estimasi harga dan minimum order.",
    path: "/merchandise",
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

export default async function MerchandisePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  await trackVisitorPageView({
    pageType: "merchandise_list",
    routePath: "/merchandise",
    queryString: toQueryString(resolvedSearchParams),
  });

  const [websiteConfig, merchandiseItems] = await Promise.all([
    getWebsiteBranding(),
    getActiveMerchandiseForHome(),
  ]);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <Merchandise items={merchandiseItems} />
      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
