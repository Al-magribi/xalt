import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

const FALLBACK_IMAGE_SRC = "/placeholder-image.svg";

function getSafeImageSrc(value) {
  if (typeof value === "string" && value.trim()) return value;
  return FALLBACK_IMAGE_SRC;
}

export default function KatalogProductGrid({
  category,
  products = [],
  categories = [],
}) {
  return (
    <section className='bg-slate-50'>
      <div className='bg-slate-900'>
        <div className='mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10'>
          <h1 className='font-display text-xl font-semibold text-white sm:text-2xl'>
            {category.title}
          </h1>
          <nav
            aria-label='Breadcrumb'
            className='text-sm text-slate-300'
          >
            <ol className='flex flex-wrap items-center gap-1.5'>
              <li>
                <Link href='/' className='transition hover:text-white'>
                  Home
                </Link>
              </li>
              <li aria-hidden='true'>/</li>
              <li>
                <Link href='/katalog' className='transition hover:text-white'>
                  Katalog
                </Link>
              </li>
              <li aria-hidden='true'>/</li>
              <li className='font-medium text-white'>{category.title}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10 md:py-10'>
        <div className='grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]'>
          <aside className='h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] text-slate-500'>
                Kategori
              </p>
            </div>
            <nav className='divide-y divide-slate-100'>
              {categories.map((item) => {
                const isActive = item.slug === category.slug;
                return (
                  <Link
                    key={item.slug}
                    href={`/katalog/${item.slug}`}
                    className={`block px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-900"
                        : "text-slate-700 hover:bg-slate-50 hover:text-blue-900"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div>
            {products.length > 0 ? (
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
                {products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/katalog/${category.slug}/${product.slug}`}
                    className='group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md'
                  >
                    <div className='relative aspect-[4/5] w-full bg-white'>
                      <AppImage
                        src={getSafeImageSrc(product.image)}
                        alt={product.title}
                        fill
                        className='object-contain object-center p-3 transition group-hover:scale-[1.02]'
                        sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
                      />
                    </div>
                    <div className='border-t border-slate-100 px-4 py-3 text-center'>
                      <h2 className='line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base'>
                        {product.title}
                      </h2>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500'>
                Belum ada produk di kategori ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
