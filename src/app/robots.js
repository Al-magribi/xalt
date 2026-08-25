import { getWebsiteBranding } from "@/actions/setting";
import { resolveSiteOrigin } from "@/utils/seo";

export const dynamic = "force-dynamic";

export default async function robots() {
  let siteOrigin = "https://x-alt.id";

  try {
    const branding = await getWebsiteBranding();
    siteOrigin = resolveSiteOrigin(branding.app_url);
  } catch {
    // keep default
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/auth/",
          "/user/",
          "/api/",
          "/order",
          "/order-status",
          "/merchandise/*/order",
        ],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
