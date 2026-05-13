import { getWebsiteBranding } from "@/actions/setting";
import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import CheckOrder from "@/components/order/CheckOrder";

export const dynamic = "force-dynamic";

export default async function CheckOrderPage({ searchParams }) {
  const params = await searchParams;
  const orderCode = String(params?.order_code || "").trim().toUpperCase();
  const websiteConfig = await getWebsiteBranding();

  return (
    <main className='flex min-h-screen flex-col overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />

      <section className='mx-auto w-full max-w-4xl flex-1 px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pb-20 md:pt-10'>
        <CheckOrder initialOrderCode={orderCode} />
      </section>

      <div className='mt-auto'>
        <FooterSection websiteConfig={websiteConfig} />
      </div>
    </main>
  );
}
