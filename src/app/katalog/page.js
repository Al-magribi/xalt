import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import KatalogCategoryGrid from "@/components/katalog/KatalogCategoryGrid";
import { getActiveMerchandiseCategories } from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import { trackVisitorPageView } from "@/actions/analytics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog Produk",
  description: "Jelajahi kategori produk merchandise X-ALT sesuai kebutuhan brand Anda.",
};

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
