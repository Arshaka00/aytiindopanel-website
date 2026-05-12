import type { Metadata } from "next";

import type { SiteContent } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import type { SeoArticle } from "@/lib/seo-articles/types";

export function resolveSeoArticleMetadata(article: SeoArticle, content: SiteContent): Metadata {
  const ss = content.siteSettings;
  const brand = ss.siteName.trim() || "PT AYTI INDO PANEL";
  const titleBase = article.metaTitle.trim() || article.title;
  const title = titleBase.includes(brand) ? titleBase : `${titleBase} | ${brand}`;
  const rawDesc = article.metaDescription.trim() || article.deck;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}…` : rawDesc;
  const originBase = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const canonical = absoluteUrlFromSite(originBase, `/artikel/${article.slug}`);
  const ogImage = article.heroImage.trim()
    ? resolveOgImageUrl(content, article.heroImage)
    : resolveOgImageUrl(content, "");
  const noIndex = ss.seoControl.stagingMode === true || ss.seoControl.allowIndexing === false;
  const kw = [article.primaryKeyword, ...article.tags].map((k) => k.trim()).filter(Boolean);

  return {
    title,
    description,
    keywords: kw,
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: canonical,
      siteName: ss.siteName,
      title: titleBase,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: titleBase }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleBase,
      description,
      images: [ogImage],
    },
  };
}

export function resolveSeoArticlesIndexMetadata(content: SiteContent): Metadata {
  const ss = content.siteSettings;
  const brand = ss.siteName.trim() || "PT AYTI INDO PANEL";
  const title = `Artikel refrigerasi industri | ${brand}`;
  const description =
    "Artikel singkat soal cold storage, cold room, blast freezer, dan sandwich panel—buat yang baca sambil cek lapangan, bukan skripsi.";
  const originBase = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const canonical = absoluteUrlFromSite(originBase, "/artikel");
  const ogImage = resolveOgImageUrl(content, "");
  const noIndex = ss.seoControl.stagingMode === true || ss.seoControl.allowIndexing === false;

  return {
    title,
    description,
    alternates: { canonical },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: ss.siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
