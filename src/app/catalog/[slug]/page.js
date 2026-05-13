import Link from "next/link";
import { notFound } from "next/navigation";
import { trackVisitorPageView } from "@/actions/analytics";
import { getKitDetailBySlug } from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import AppImage from "@/components/ui/AppImage";

export const dynamic = "force-dynamic";

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
  const kit = await getKitDetailBySlug(slug);
  if (!kit) {
    return { title: "Katalog Tidak Ditemukan" };
  }

  return {
    title: `${kit.title} Detail`,
    description: `Detail ${kit.title} beserta galeri visual dan ringkasan paket.`,
  };
}

export default async function CatalogDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const queryString = toQueryString(resolvedSearchParams);
  const [kit, websiteConfig] = await Promise.all([getKitDetailBySlug(slug), getWebsiteBranding()]);
  if (!kit) {
    await trackVisitorPageView({
      pageType: "catalog_detail",
      routePath: `/catalog/${slug}`,
      routeSlug: slug,
      queryString,
      responseStatus: 404,
    });
    notFound();
  }

  await trackVisitorPageView({
    pageType: "catalog_detail",
    routePath: `/catalog/${slug}`,
    routeSlug: slug,
    queryString,
    responseStatus: 200,
  });

  const whatsappNumber = toWhatsAppNumber(websiteConfig?.whatsapp_number);
  const consultationUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo X-ALT, saya ingin konsultasi untuk ${kit.title}.`,
  )}`;

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
        >
          <span aria-hidden='true'>&larr;</span>
          Kembali ke katalog
        </Link>

        <div className='mt-6 grid gap-6 md:mt-8 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start'>
          <div>
            <p className='inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800'>
              Detail katalog
            </p>
            <h1 className='mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl'>
              {kit.title}
            </h1>
            <p className='mt-4 max-w-2xl text-sm text-slate-600 sm:text-base md:text-lg'>
              {kit.description}
            </p>
            {whatsappNumber ? (
              <a
                href={consultationUrl}
                target='_blank'
                rel='noreferrer'
                className='mt-6 inline-flex items-center justify-center rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 sm:text-base'
              >
                Konsultasi via WhatsApp
              </a>
            ) : null}
          </div>

          <div className='relative h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-72 md:h-80 lg:h-96 lg:rounded-3xl'>
            <AppImage
              src={kit.image}
              alt={kit.title}
              fill
              className='object-cover'
              sizes='(max-width: 1024px) 100vw, 40vw'
              priority
            />
          </div>
        </div>

        <div className='mt-10 md:mt-12'>
          <h2 className='font-display text-2xl font-semibold sm:text-[1.75rem] md:text-3xl'>
            Galeri Kit
          </h2>
          <p className='mt-2 text-sm text-slate-600 sm:text-base'>
            Preview beberapa item dan mood visual yang biasa dipakai untuk paket
            ini.
          </p>

          <div className='mt-5 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {kit.gallery.map((image, index) => (
              <div
                key={image}
                className='relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'
              >
                <AppImage
                  src={image}
                  alt={`${kit.title} gambar ${index + 1}`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-cover'
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
