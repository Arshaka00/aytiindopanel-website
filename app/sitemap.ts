import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/components/aytipanel/products-catalog";
import { SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { getPublishedSeoArticleSlugs } from "@/lib/seo-articles/repository";
import { getSiteContent } from "@/lib/site-content";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const root = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: root, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${root}/cold-storage`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${root}/artikel`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${root}/produk/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const seoLandingRoutes: MetadataRoute.Sitemap = SEO_LANDING_PAGES.map((p) => ({
    url: `${root}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  let seoArticleRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getPublishedSeoArticleSlugs();
    seoArticleRoutes = slugs.map((slug) => ({
      url: `${root}/artikel/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.68,
    }));
  } catch {
    seoArticleRoutes = [];
  }

  return [...staticRoutes, ...productRoutes, ...seoLandingRoutes, ...seoArticleRoutes];
}
