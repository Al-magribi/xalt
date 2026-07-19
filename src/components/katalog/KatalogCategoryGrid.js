import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

const FALLBACK_IMAGE_SRC = "/placeholder-image.svg";

function getSafeImageSrc(value) {
  if (typeof value === "string" && value.trim()) return value;
  return FALLBACK_IMAGE_SRC;
}

export default function KatalogCategoryGrid({ categories = [] }) {
  return (
    <section className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
      <p className='font-display text-3xl font-semibold text-slate-900 md:text-4xl'>
        Katalog Produk
      </p>
      <p className='mt-3 max-w-3xl text-slate-600'>
        Pilih kategori produk sesuai kebutuhan branding, seragam, dan event perusahaan.
      </p>

      <div className='mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4'>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/katalog/${category.slug}`}
            className='group block'
          >
            <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md'>
              <div className='relative aspect-[4/5] w-full bg-white'>
                <AppImage
                  src={getSafeImageSrc(category.image)}
                  alt={category.title}
                  fill
                  className='object-contain object-center p-3'
                  sizes='(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw'
                />
              </div>
              <div className='bg-blue-900 px-3 py-3 text-center'>
                <h2 className='line-clamp-2 text-sm font-semibold text-white sm:text-base'>
                  {category.title}
                </h2>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {categories.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
          Belum ada kategori aktif.
        </div>
      ) : null}
    </section>
  );
}
