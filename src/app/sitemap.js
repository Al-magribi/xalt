import {
  getActiveKitsForHome,
  getActiveMerchandiseCategories,
  getActiveMerchandiseForHome,
} from "@/actions/catalog";
import { getWebsiteBranding } from "@/actions/setting";
import { absoluteUrl, resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let siteOrigin = "https://x-alt.id";

  try {
    const branding = await getWebsiteBranding();
    siteOrigin = resolveSiteOrigin(branding.app_url);
  } catch {
    // keep default
  }

  const now = new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/katalog", changeFrequency: "daily", priority: 0.9 },
    { path: "/merchandise", changeFrequency: "daily", priority: 0.9 },
    { path: "/download-katalog", changeFrequency: "weekly", priority: 0.7 },
  ].map((route) => ({
    url: absoluteUrl(siteOrigin, route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let categories = [];
  let merchandise = [];
  let kits = [];

  try {
    [categories, merchandise, kits] = await Promise.all([
      getActiveMerchandiseCategories(),
      getActiveMerchandiseForHome(),
      getActiveKitsForHome(),
    ]);
  } catch {
    return staticRoutes;
  }

  const categoryRoutes = (categories || []).map((category) => ({
    url: absoluteUrl(siteOrigin, `/katalog/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes = (merchandise || []).flatMap((item) => {
    const routes = [
      {
        url: absoluteUrl(siteOrigin, `/merchandise/${item.slug}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];

    if (item.category_slug) {
      routes.push({
        url: absoluteUrl(
          siteOrigin,
          `/katalog/${item.category_slug}/${item.slug}`,
        ),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    return routes;
  });

  const kitRoutes = (kits || []).map((kit) => ({
    url: absoluteUrl(siteOrigin, `/catalog/${kit.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...kitRoutes];
}
