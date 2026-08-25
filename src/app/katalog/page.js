import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import KatalogCategoryGrid from "@/components/katalog/KatalogCategoryGrid";
import { getActiveMerchandiseCategories } from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import { trackVisitorPageView } from "@/actions/analytics";
import { buildPageMetadata, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const branding = await getWebsiteBranding();
  const siteOrigin = resolveSiteOrigin(branding.app_url);

  return buildPageMetadata({
    title: "Katalog Produk",
    description:
      "Jelajahi kategori produk merchandise X-ALT sesuai kebutuhan brand Anda.",
    path: "/katalog",
    siteOrigin,
    image: branding.og_image_url,
  });
}

export default async function KatalogPage() {
  await trackVisitorPageView({
    pageType: "katalog_list",
    routePath: "/katalog",
  });

  const [websiteConfig, categories] = await Promise.all([
    getWebsiteBranding(),
    getActiveMerchandiseCategories(),
  ]);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <KatalogCategoryGrid categories={categories} />
      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
