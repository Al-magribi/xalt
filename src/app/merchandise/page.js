import FooterSection from "@/components/home/FooterSection";
import HomeHeader from "@/components/home/HomeHeader";
import Merchandise from "@/components/merchandise/Merchandise";
import { getActiveMerchandiseForHome } from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import { trackVisitorPageView } from "@/actions/analytics";

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

export default async function MerchandisePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  await trackVisitorPageView({
    pageType: "merchandise_list",
    routePath: "/merchandise",
    queryString: toQueryString(resolvedSearchParams),
  });

  const [websiteConfig, merchandiseItems] = await Promise.all([
    getWebsiteBranding(),
    getActiveMerchandiseForHome(),
  ]);

  return (
    <main className='overflow-x-hidden bg-white text-slate-900'>
      <HomeHeader websiteConfig={websiteConfig} />
      <Merchandise items={merchandiseItems} />
      <FooterSection websiteConfig={websiteConfig} />
    </main>
  );
}
