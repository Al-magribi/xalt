import { notFound } from "next/navigation";
import {
  getActiveMerchandiseByCategorySlug,
  getActiveMerchandiseCategories,
  getMerchandiseCategoryBySlug,
} from "@/actions/catalog";
import { trackVisitorPageView } from "@/actions/analytics";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import KatalogProductGrid from "@/components/katalog/KatalogProductGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = await getMerchandiseCategoryBySlug(categorySlug);

  if (!category) {
    return { title: "Kategori Tidak Ditemukan" };
  }

  return {
    title: category.title,
    description:
      category.description ||
      `Lihat koleksi produk ${category.title} dari X-ALT.`,
  };
}

export default async function KatalogCategoryPage({ params }) {
  const { categorySlug } = await params;
  const [websiteConfig, category, products, categories] = await Promise.all([
    getWebsiteBranding(),
    getMerchandiseCategoryBySlug(categorySlug),
    getActiveMerchandiseByCategorySlug(categorySlug),
    getActiveMerchandiseCategories(),
  ]);

  if (!category) {
    await trackVisitorPageView({
      pageType: "katalog_category",
      routePath: `/katalog/${categorySlug}`,
      routeSlug: categorySlug,
      responseStatus: 404,
    });
    notFound();
  }

  await trackVisitorPageView({
    pageType: "katalog_category",
    routePath: `/katalog/${categorySlug}`,
    routeSlug: categorySlug,
    responseStatus: 200,
  });

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <KatalogProductGrid
        category={category}
        products={products}
        categories={categories}
      />
      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
