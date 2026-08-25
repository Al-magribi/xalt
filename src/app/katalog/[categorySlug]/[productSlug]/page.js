import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import {
  getActiveMerchandiseByCategorySlug,
  getMerchandiseCategoryBySlug,
  getMerchandiseDetailBySlug,
} from "@/actions/catalog";
import { trackVisitorPageView } from "@/actions/analytics";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import KatalogProductDetail from "@/components/katalog/KatalogProductDetail";
import AppImage from "@/components/ui/AppImage";
import { buildPageMetadata, NO_INDEX_METADATA, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

function toWhatsAppNumber(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

export async function generateMetadata({ params }) {
  const { categorySlug, productSlug } = await params;
  const [product, branding] = await Promise.all([
    getMerchandiseDetailBySlug(productSlug),
    getWebsiteBranding(),
  ]);

  if (!product) {
    return { title: "Produk Tidak Ditemukan", ...NO_INDEX_METADATA };
  }

  const siteOrigin = resolveSiteOrigin(branding.app_url);
  const categoryPath = product.category_slug || categorySlug;
  const description =
    product.description ||
    `${product.title} tersedia untuk pemesanan via WhatsApp.`;
  const image =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    branding.og_image_url;

  return buildPageMetadata({
    title: product.title,
    description,
    path: `/katalog/${categoryPath}/${product.slug}`,
    siteOrigin,
    image,
    type: "website",
  });
}

export default async function KatalogProductDetailPage({ params }) {
  const { categorySlug, productSlug } = await params;
  const [websiteConfig, category, product, relatedProducts] = await Promise.all([
    getWebsiteBranding(),
    getMerchandiseCategoryBySlug(categorySlug),
    getMerchandiseDetailBySlug(productSlug),
    getActiveMerchandiseByCategorySlug(categorySlug),
  ]);

  if (
    !category ||
    !product ||
    product.category_slug !== category.slug
  ) {
    await trackVisitorPageView({
      pageType: "katalog_product",
      routePath: `/katalog/${categorySlug}/${productSlug}`,
      routeSlug: productSlug,
      responseStatus: 404,
    });
    notFound();
  }

  await trackVisitorPageView({
    pageType: "katalog_product",
    routePath: `/katalog/${categorySlug}/${productSlug}`,
    routeSlug: productSlug,
    responseStatus: 200,
  });

  const whatsappNumber = toWhatsAppNumber(websiteConfig?.whatsapp_number);
  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  const relatedItems = relatedProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 6);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <Link
          href={`/katalog/${category.slug}`}
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
        >
          <FaArrowLeft className='text-xs' />
          Kembali ke {category.title}
        </Link>

        <KatalogProductDetail
          product={product}
          categorySlug={category.slug}
          galleryImages={galleryImages}
          whatsappNumber={whatsappNumber}
        />

        {relatedItems.length > 0 ? (
          <div className='mt-12'>
            <h2 className='font-display text-2xl font-semibold sm:text-3xl'>
              Produk Lainnya
            </h2>
            <div className='mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {relatedItems.map((item) => (
                <article
                  key={item.slug}
                  className='w-full overflow-hidden rounded-xl border border-slate-200 bg-white'
                >
                  <Link
                    href={`/katalog/${category.slug}/${item.slug}`}
                    className='block'
                  >
                    <div className='relative aspect-[2/1] bg-slate-100'>
                      <AppImage
                        src={item.image}
                        alt={item.title}
                        fill
                        className='object-contain'
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px'
                      />
                    </div>
                  </Link>
                  <div className='p-3'>
                    <h3 className='line-clamp-2 text-sm font-semibold text-slate-900'>
                      {item.title}
                    </h3>
                    <Link
                      href={`/katalog/${category.slug}/${item.slug}`}
                      className='mt-2 inline-flex items-center text-xs font-semibold text-blue-900 transition hover:text-blue-700 sm:text-sm'
                    >
                      Lihat detail
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
