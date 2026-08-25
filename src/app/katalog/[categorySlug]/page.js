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
import { buildPageMetadata, NO_INDEX_METADATA, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const [category, branding] = await Promise.all([
    getMerchandiseCategoryBySlug(categorySlug),
    getWebsiteBranding(),
  ]);

  if (!category) {
    return { title: "Kategori Tidak Ditemukan", ...NO_INDEX_METADATA };
  }

  const siteOrigin = resolveSiteOrigin(branding.app_url);
  const description =
    category.description ||
    `Lihat koleksi produk ${category.title} dari X-ALT.`;

  return buildPageMetadata({
    title: category.title,
    description,
    path: `/katalog/${category.slug}`,
    siteOrigin,
    image: category.image || branding.og_image_url,
  });
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
