import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/components/aytipanel/products-catalog";
import { captureException } from "@/lib/observability";
import { getPublishedSeoArticleSlugs } from "@/lib/seo-articles/repository";
import { SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { getDefaultSiteContentRef, getSiteContent } from "@/lib/site-content";
import type { SiteContent } from "@/lib/site-content-model";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

/** Cache hasil sitemap — kurangi beban cold start & risiko timeout saat crawl Google. */
export const revalidate = 86400;

async function resolveSiteContentForSitemap(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch (error) {
    void captureException(error, { area: "app/sitemap", reason: "getSiteContent_failed_use_defaults" });
    return getDefaultSiteContentRef();
  }
}

async function buildSitemapEntries(root: string, now: Date, content: SiteContent): Promise<MetadataRoute.Sitemap> {
  const noIndex = content.siteSettings.seoControl.stagingMode === true || content.siteSettings.seoControl.allowIndexing === false;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: root, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${root}/cold-storage`, lastModified: now, changeFrequency: "monthly", priority: 0.78 },
    { url: `${root}/artikel`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
    { url: `${root}/gallery-project`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${root}/tentang`, lastModified: now, changeFrequency: "monthly", priority: 0.74 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${root}/produk/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const seoLandingRoutes: MetadataRoute.Sitemap = noIndex
    ? []
    : SEO_LANDING_PAGES.map((p) => ({
        url: `${root}/${p.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      }));

  let seoArticleRoutes: MetadataRoute.Sitemap = [];
  if (!noIndex) {
    try {
      const slugs = await getPublishedSeoArticleSlugs();
      seoArticleRoutes = slugs.map((slug) => ({
        url: `${root}/artikel/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.68,
      }));
    } catch (error) {
      void captureException(error, { area: "app/sitemap", reason: "getPublishedSeoArticleSlugs_failed" });
      seoArticleRoutes = [];
    }
  }

  return [...staticRoutes, ...productRoutes, ...seoLandingRoutes, ...seoArticleRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await resolveSiteContentForSitemap();
  const root = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const now = new Date();

  try {
    return await buildSitemapEntries(root, now, content);
  } catch (error) {
    void captureException(error, { area: "app/sitemap", reason: "buildSitemapEntries_failed_minimal" });
    return [
      { url: root, lastModified: now, changeFrequency: "weekly", priority: 1 },
      { url: `${root}/cold-storage`, lastModified: now, changeFrequency: "monthly", priority: 0.78 },
    ];
  }
}
