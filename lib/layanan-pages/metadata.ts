import type { Metadata } from "next";

import { LAYANAN_PAGES_BASE_PATH } from "@/lib/service-pages";
import type { SiteContent } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";

export function resolveLayananPagesIndexMetadata(content: SiteContent): Metadata {
  const siteName = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const canonical = absoluteUrlFromSite(origin, LAYANAN_PAGES_BASE_PATH);
  const title = `Layanan cold storage & panel industri | ${siteName}`;
  const description =
    "Panduan layanan PT AYTI INDO PANEL: sandwich panel PU, cold storage, blast freezer, sistem refrigerasi, dan pintu cold room — di bawah artikel.";
  const ogImage = resolveOgImageUrl(content, "/images/spesialisasi/spesialisasi-coldstorage.png");

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
