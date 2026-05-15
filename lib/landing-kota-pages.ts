import type { Metadata } from "next";

import { getCityPlacename } from "@/lib/local-seo-geo";
import { SEO_LANDING_PAGES, type SeoLandingPageDef } from "@/lib/seo-landing";
import type { SiteContent } from "@/lib/site-content-model";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

/** Path publik indeks landing SEO per kota (di bawah artikel). */
export const LANDING_KOTA_PAGES_BASE_PATH = "/artikel/lokasi";

/** Item navbar terpisah — mengarah ke indeks halaman area layanan per kota. */
export const LANDING_KOTA_NAV_ITEM = {
  id: "nav-landing-kota",
  label: "Landing Kota",
  shortLabel: "Lokasi",
  href: LANDING_KOTA_PAGES_BASE_PATH,
} as const;

export function getLandingKotaHubPages(): SeoLandingPageDef[] {
  return SEO_LANDING_PAGES.filter((p) => p.kind === "city_area" && p.localSeoCityKey).sort(
    (a, b) =>
      getCityPlacename(a.localSeoCityKey!).localeCompare(getCityPlacename(b.localSeoCityKey!), "id"),
  );
}

export function landingKotaHubPath(slug: string): string {
  return `/${slug}`;
}

/** Pastikan item navbar Landing Kota selalu ada (desktop + mobile). */
export function mergeLandingKotaNavItem(
  navItems: { id: string; label: string; shortLabel: string; href: string }[],
): { id: string; label: string; shortLabel: string; href: string }[] {
  if (navItems.some((i) => i.id === LANDING_KOTA_NAV_ITEM.id)) return navItems;
  const afterHalamanLayanan = navItems.findIndex((i) => i.id === "nav-halaman-layanan");
  const afterLayanan = navItems.findIndex((i) => i.id === "nav-layanan");
  const at =
    afterHalamanLayanan >= 0
      ? afterHalamanLayanan + 1
      : afterLayanan >= 0
        ? afterLayanan + 1
        : navItems.length;
  return [...navItems.slice(0, at), { ...LANDING_KOTA_NAV_ITEM }, ...navItems.slice(at)];
}

export function mergeLandingKotaMobileNavIds(mobileNavIds: string[]): string[] {
  const id = LANDING_KOTA_NAV_ITEM.id;
  if (mobileNavIds.includes(id)) return mobileNavIds;
  const afterHalamanLayanan = mobileNavIds.findIndex((x) => x === "nav-halaman-layanan");
  const afterLayanan = mobileNavIds.findIndex((x) => x === "nav-layanan");
  const at =
    afterHalamanLayanan >= 0
      ? afterHalamanLayanan + 1
      : afterLayanan >= 0
        ? afterLayanan + 1
        : mobileNavIds.length;
  return [...mobileNavIds.slice(0, at), id, ...mobileNavIds.slice(at)];
}

export function resolveLandingKotaIndexMetadata(content: SiteContent): Metadata {
  const idx = content.landingKotaPages.index;
  const siteName = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const canonical = absoluteUrlFromSite(origin, LANDING_KOTA_PAGES_BASE_PATH);
  const defaultTitle = `Landing kota & area layanan | ${siteName}`;
  const defaultDescription =
    "Indeks halaman SEO per kota: cold storage, sandwich panel, cold room, dan blast freezer — wilayah layanan PT AYTI INDO PANEL di seluruh Indonesia.";
  const title = idx.metaTitle.trim() || defaultTitle;
  const description = idx.metaDescription.trim() || defaultDescription;
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
