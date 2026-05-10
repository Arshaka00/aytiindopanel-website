import type { Metadata } from "next";

import type { SiteContent, SitePageSeoKey } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

/** URL gambar OG — absolut atau path root; fallback brand → image SEO → logo statis. */
export function resolveOgImageUrl(content: SiteContent, candidate: string): string {
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const fallback =
    content.siteSettings.imageSeo.fallbackOgImage.trim() ||
    content.siteSettings.brandAssets.defaultOgImage.trim() ||
    "/images/logo_ayti.png";
  const raw = candidate.trim() || fallback;
  if (/\w+:\/\//.test(raw)) {
    try {
      return new URL(raw).href;
    } catch {
      /* fallthrough */
    }
  }
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${path}`;
}

/**
 * Metadata untuk satu route CMS (`pageSeo` mengalahkan `seoContent` global).
 * `pathSuffix` dipakai canonical bila override canonical kosong (mis. `/cold-storage`).
 */
export function resolveSiteMetadataForPage(
  key: SitePageSeoKey,
  content: SiteContent,
  pathSuffix: string,
  options?: { titleFallback?: string; descriptionFallback?: string },
): Metadata {
  const ss = content.siteSettings;
  const globalSeo = ss.seoContent;
  const po = ss.pageSeo[key] ?? {};

  const title =
    po.title?.trim() ||
    options?.titleFallback?.trim() ||
    globalSeo.metaTitle.trim() ||
    `${ss.siteName} — Panel Pendingin, Cold Storage & Cooling System`;

  const description =
    po.description?.trim() ||
    options?.descriptionFallback?.trim() ||
    globalSeo.metaDescription.trim() ||
    "Produksi sandwich panel, instalasi cold room & sistem refrigerasi industri.";

  const kwSource = po.keywords?.trim() || globalSeo.keywords;
  const keywords = kwSource
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  const originBase = resolvePublicSiteOrigin(ss.siteUrl).origin;

  const canonicalRaw = po.canonical?.trim();
  const canonical = canonicalRaw
    ? absoluteUrlFromSite(originBase, canonicalRaw)
    : absoluteUrlFromSite(originBase, pathSuffix);

  const ogImage = resolveOgImageUrl(content, po.ogImage ?? "");

  const noIndex =
    po.noIndex === true ||
    ss.seoControl.stagingMode === true ||
    ss.seoControl.allowIndexing === false;

  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: ss.siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ss.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
