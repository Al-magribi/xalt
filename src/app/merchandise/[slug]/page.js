import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
} from "react-icons/fa";
import {
  getActiveMerchandiseForHome,
  getMerchandiseDetailBySlug,
} from "@/actions/catalog";
import { trackVisitorPageView } from "@/actions/analytics";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import MerchandiseDetailShowcase from "@/components/merchandise/MerchandiseDetailShowcase";
import AppImage from "@/components/ui/AppImage";

export const dynamic = "force-dynamic";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function toWhatsAppNumber(value) {
  return String(value || "").replace(/[^\d]/g, "");
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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getMerchandiseDetailBySlug(slug);

  if (!product) {
    return { title: "Merchandise Tidak Ditemukan" };
  }

  const displayPrice = formatMoney(product.price_amount, product.currency);

  return {
    title: `${product.title} | Merchandise`,
    description: `${product.title} tersedia mulai ${displayPrice} dengan minimal order ${product.min_order} pcs.`,
  };
}

export default async function MerchandiseDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const queryString = toQueryString(resolvedSearchParams);
  const [websiteConfig, product, allItems] = await Promise.all([
    getWebsiteBranding(),
    getMerchandiseDetailBySlug(slug),
    getActiveMerchandiseForHome(),
  ]);

  if (!product) {
    await trackVisitorPageView({
      pageType: "merchandise_detail",
      routePath: `/merchandise/${slug}`,
      routeSlug: slug,
      queryString,
      responseStatus: 404,
    });
    notFound();
  }

  await trackVisitorPageView({
    pageType: "merchandise_detail",
    routePath: `/merchandise/${slug}`,
    routeSlug: slug,
    queryString,
    responseStatus: 200,
  });

  const displayPrice = formatMoney(product.price_amount, product.currency);
  const whatsappNumber = toWhatsAppNumber(websiteConfig?.whatsapp_number);
  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean);

  const relatedItems = allItems
    .filter((item) => item.slug !== product.slug)
    .slice(0, 6);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <Link
          href='/merchandise'
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
        >
          <FaArrowLeft className='text-xs' />
          Kembali ke merchandise
        </Link>

        <MerchandiseDetailShowcase
          product={product}
          galleryImages={galleryImages}
          displayPrice={displayPrice}
          whatsappNumber={whatsappNumber}
        />

        <div className='mt-12'>
          <h2 className='font-display text-2xl font-semibold sm:text-3xl'>
            Produk Terkait
          </h2>
          <div className='mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {relatedItems.map((item) => (
              <article
                key={item.slug}
                className='w-full overflow-hidden rounded-xl border border-slate-200 bg-white'
              >
                <Link href={`/merchandise/${item.slug}`} className='block'>
                  <div className='relative aspect-[5/4] bg-slate-100'>
                    <AppImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px'
                    />
                  </div>
                </Link>
                <div className='p-3'>
                  <h3 className='line-clamp-2 text-sm font-semibold text-slate-900'>
                    {item.title}
                  </h3>
                  <p className='mt-1 text-xs font-semibold text-blue-900 sm:text-sm'>
                    {formatMoney(item.price_amount, item.currency)}
                  </p>
                  <Link
                    href={`/merchandise/${item.slug}`}
                    className='mt-2 inline-flex items-center text-xs font-semibold text-blue-900 transition hover:text-blue-700 sm:text-sm'
                  >
                    Lihat detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
