import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { getMerchandiseDetailBySlug } from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import MerchandiseOrderForm from "@/components/order/MerchandiseOrderForm";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getMerchandiseDetailBySlug(slug);

  if (!product) {
    return { title: "Halaman Pesanan Tidak Ditemukan" };
  }

  return {
    title: `Pesan ${product.title}`,
    description: `Isi form pesanan untuk ${product.title} dan hitung ongkir dengan RajaOngkir.`,
  };
}

export default async function MerchandiseOrderPage({ params }) {
  const { slug } = await params;
  const [websiteConfig, product] = await Promise.all([getWebsiteBranding(), getMerchandiseDetailBySlug(slug)]);

  if (!product) {
    notFound();
  }

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <Link
          href={`/merchandise/${product.slug}`}
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
        >
          <FaArrowLeft className='text-xs' />
          Kembali ke detail merchandise
        </Link>

        <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5'>
          <p className='text-xs font-semibold uppercase tracking-wide text-blue-700'>Form Pesanan</p>
          <h1 className='mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl'>{product.title}</h1>
          <p className='mt-2 text-sm text-slate-600'>
            Harga mulai {formatMoney(product.price_amount, product.currency)} | Minimum order {product.min_order} pcs
          </p>
          <p className='mt-1 text-sm text-slate-600'>Bobot produk: {product.weight_gram || 0} gram / pcs</p>
        </div>

        <div className='mt-5'>
          <MerchandiseOrderForm product={product} />
        </div>
      </section>

      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
