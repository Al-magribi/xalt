import { getActiveCatalogFile } from "@/actions/catalog";
import { trackVisitorPageView } from "@/actions/analytics";
import { getWebsiteBranding } from "@/actions/setting";
import CatalogDownloadForm from "@/components/catalog/CatalogDownloadForm";
import HomeHeader from "@/components/home/HomeHeader";

export const metadata = {
  title: "Download Katalog",
};

export default async function DownloadKatalogPage() {
  const [websiteConfig, activeCatalog] = await Promise.all([
    getWebsiteBranding(),
    getActiveCatalogFile(),
  ]);

  await trackVisitorPageView({
    pageType: "other",
    routePath: "/download-katalog",
  });

  return (
    <main className='min-h-screen bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <section className='mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10 md:py-12'>
        <div className='mb-6'>
          <h1 className='font-display text-3xl font-semibold text-slate-900 sm:text-4xl'>
            Katalog Produk
          </h1>
          <p className='mt-2 text-sm text-slate-600'>
            Home &gt; Download Katalog
          </p>
        </div>

        <CatalogDownloadForm
          hasActiveCatalog={Boolean(activeCatalog?.file_url)}
          catalogTitle={activeCatalog?.title || activeCatalog?.file_name || ""}
        />
      </section>
    </main>
  );
}
