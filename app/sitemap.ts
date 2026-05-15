import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/components/aytipanel/products-catalog";
import { captureException } from "@/lib/observability";
import { getPublishedSeoArticleSlugs } from "@/lib/seo-articles/repository";
import { getAllServiceCitySlugs } from "@/lib/seo-service-city-pages";
import { resolveServicePublicPath } from "@/lib/seo-service-paths";
import { SEO_ROOT_URL_SLUGS } from "@/lib/seo-services";
import { SEO_LANDING_PAGES } from "@/lib/seo-landing";
import { getPublishedLayananPageSlugs } from "@/lib/layanan-pages/repository";
import { LANDING_KOTA_PAGES_BASE_PATH } from "@/lib/landing-kota-pages";
import { LAYANAN_PAGES_BASE_PATH } from "@/lib/service-pages";
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

async function buildSitemapEntries(
  root: string,
  now: Date,
  content: SiteContent,
): Promise<MetadataRoute.Sitemap> {
  const noIndex = content.siteSettings.seoControl.stagingMode === true || content.siteSettings.seoControl.allowIndexing === false;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: root, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${root}/artikel`, lastModified: now, changeFrequency: "weekly", priority: 0.72 },
    { url: `${root}/gallery-project`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${root}/tentang`, lastModified: now, changeFrequency: "monthly", priority: 0.74 },
  ];

  let layananSlugs: string[] = [];
  try {
    layananSlugs = await getPublishedLayananPageSlugs();
  } catch {
    layananSlugs = [];
  }
  const servicePageRoutes: MetadataRoute.Sitemap = [
    {
      url: `${root}${LAYANAN_PAGES_BASE_PATH}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.84,
    },
    {
      url: `${root}${LANDING_KOTA_PAGES_BASE_PATH}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    ...layananSlugs.map((slug) => ({
      url: `${root}${resolveServicePublicPath(slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.86,
    })),
    ...SEO_ROOT_URL_SLUGS.map((slug) => ({
      url: `${root}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${root}/produk/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const serviceCitySlugSet = new Set(noIndex ? [] : getAllServiceCitySlugs());
  const localCityRoutes: MetadataRoute.Sitemap = [...serviceCitySlugSet].map((slug) => ({
    url: `${root}/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));

  const seoLandingRoutes: MetadataRoute.Sitemap = noIndex
    ? []
    : SEO_LANDING_PAGES.filter((p) => !serviceCitySlugSet.has(p.slug)).map((p) => ({
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

  return [
    ...staticRoutes,
    ...servicePageRoutes,
    ...productRoutes,
    ...localCityRoutes,
    ...seoLandingRoutes,
    ...seoArticleRoutes,
  ];
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
