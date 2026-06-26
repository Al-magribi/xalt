import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import AppImage from "@/components/ui/AppImage";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function Merchandise({ items = [] }) {
  return (
    <section className='mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
      <p className='font-display text-3xl font-semibold md:text-4xl'>
        Semua Merchandise
      </p>
      <p className='mt-3 max-w-3xl text-slate-600'>
        Jelajahi seluruh pilihan merchandise lengkap dengan estimasi harga.
      </p>

      <div className='mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
        {items.map((itemData) => {
          const displayPrice = formatMoney(
            itemData.price_amount,
            itemData.currency,
          );

          return (
            <article
              key={itemData.slug}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'
            >
              <Link href={`/merchandise/${itemData.slug}`} className='block'>
                <div className='relative aspect-[2/1] w-full bg-slate-100'>
                  <AppImage
                    src={itemData.image}
                    alt={itemData.title}
                    fill
                    className='object-contain'
                    sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw'
                  />
                </div>
              </Link>

              <div className='p-5'>
                <h2 className='font-display text-xl font-semibold text-slate-900'>
                  {itemData.title}
                </h2>
                <p className='mt-2 text-sm font-semibold text-blue-900'>
                  {displayPrice}
                </p>
                <p className='mt-1 text-xs font-medium text-slate-500'>
                  Min. order {itemData.min_order} pcs
                </p>
                <p
                  style={{ whiteSpace: "nowrap" }}
                  className='mt-2 line-clamp-2 text-sm text-slate-600'
                >
                  {itemData.description}
                </p>

                <div className='mt-4 flex flex-col gap-2'>
                  <Link
                    href={`/merchandise/${itemData.slug}`}
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50'
                  >
                    Lihat Detail
                    <FaArrowRight className='text-xs' />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {items.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500'>
          Belum ada merchandise aktif.
        </div>
      ) : null}
    </section>
  );
}
