import type { MetadataRoute } from "next";

import { getSiteContent } from "@/lib/site-content";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getSiteContent();
  const ss = content.siteSettings;
  const root = resolvePublicSiteOrigin(ss.siteUrl).origin;

  if (ss.seoControl.stagingMode || !ss.seoControl.allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/site-admin/", "/api/"],
    },
    sitemap: `${root}/sitemap.xml`,
  };
}
