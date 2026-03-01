import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { getMerchandiseOrderPaymentStatusAction } from "@/actions/order";
import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import OrderPaymentStatusCard from "@/components/order/OrderPaymentStatusCard";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ searchParams }) {
  const params = await searchParams;
  const orderCode = String(params?.order_code || "").trim().toUpperCase();
  const [websiteConfig, initialStatus] = await Promise.all([
    getWebsiteBranding(),
    orderCode ? getMerchandiseOrderPaymentStatusAction({ orderCode }) : Promise.resolve(null),
  ]);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <Link
          href='/merchandise'
          className='inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition hover:text-blue-700'
        >
          <FaArrowLeft className='text-xs' />
          Kembali ke katalog
        </Link>

        <div className='mt-5'>
          {orderCode ? (
            <OrderPaymentStatusCard orderCode={orderCode} initialData={initialStatus?.ok ? initialStatus.data : null} />
          ) : (
            <section className='rounded-xl border border-slate-200 bg-white p-5'>
              <p className='text-sm text-slate-700'>Kode order tidak ditemukan.</p>
            </section>
          )}
        </div>
      </section>

      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
