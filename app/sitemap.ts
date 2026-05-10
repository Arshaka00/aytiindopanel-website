import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/components/aytipanel/products-catalog";
import { getSiteContent } from "@/lib/site-content";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const root = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: root, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${root}/cold-storage`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${root}/produk/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...productRoutes];
}
