"use client";

import {
  buildHomeSectionReturnPath,
  HERO_HOME_SECTION_ID,
  isGalleryHomeReturnPath,
  isGalleryInSiteReturnPath,
  isGalleryProjectPathname,
  isProductHomeReturnPath,
  isProductInSiteReturnPath,
  getPinnedHomeReturnSectionForProductSlug,
  normalizeProductHomeReturnSectionId,
  normalizeProductListingReturnSectionId,
  PORTFOLIO_HOME_SECTION_ID,
  sanitizeProductHomeReturnHref,
} from "@/lib/product-listing-sections";

/** Legacy sessionStorage key — dihapus oleh `clearFeaturedProdukMobileAccordionSnapshot` untuk sesi lama. */
export const FEATURED_PRODUK_MOBILE_OPEN_SECTION_KEY = "ayti_featuredProdukAccordion_v1";

/** Kembali dari `/produk/…`, artikel, dll. */
export const PRODUCT_NAV_RETURN_PATH_KEY = "ayti_detailReturn_v1";
/** @deprecated gunakan `PRODUCT_NAV_RETURN_PATH_KEY` */
export const DETAIL_NAV_RETURN_PATH_KEY = PRODUCT_NAV_RETURN_PATH_KEY;

/**
 * Kembali dari `/gallery-project` — hanya dua nilai sah:
 * `/#beranda` (navbar) atau `/#proyek` (CTA Portfolio).
 */
export const GALLERY_NAV_RETURN_PATH_KEY = "ayti_galleryReturn_v1";

export const LANDING_HASH_NAV_INTENT_KEY = "ayti_landingHashNavIntent_v1";

function isGalleryReturnPathForStorage(href: string): boolean {
  return isGalleryInSiteReturnPath(href);
}

function readStoredReturnPath(storageKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw || raw.length > 2048) return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return raw;
  } catch {
    return null;
  }
}

function writeStoredReturnPath(storageKey: string, full: string): void {
  if (typeof window === "undefined") return;
  if (!full.startsWith("/") || full.startsWith("//")) return;
  try {
    sessionStorage.setItem(storageKey, full);
  } catch {
    /* private mode */
  }
}

function clearStoredReturnPathByKey(storageKey: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

/** Selaraskan key lama: gallery ↔ produk tidak boleh campur di storage. */
function migrateLegacyReturnPathsBetweenDomains(): void {
  if (typeof window === "undefined") return;
  try {
    const productRaw = sessionStorage.getItem(PRODUCT_NAV_RETURN_PATH_KEY);
    if (productRaw && isGalleryReturnPathForStorage(productRaw)) {
      if (!sessionStorage.getItem(GALLERY_NAV_RETURN_PATH_KEY)) {
        sessionStorage.setItem(GALLERY_NAV_RETURN_PATH_KEY, productRaw);
      }
      sessionStorage.removeItem(PRODUCT_NAV_RETURN_PATH_KEY);
    }

    const galleryRaw = sessionStorage.getItem(GALLERY_NAV_RETURN_PATH_KEY);
    if (galleryRaw && isProductInSiteReturnPath(galleryRaw) && !isGalleryReturnPathForStorage(galleryRaw)) {
      if (!sessionStorage.getItem(PRODUCT_NAV_RETURN_PATH_KEY)) {
        sessionStorage.setItem(PRODUCT_NAV_RETURN_PATH_KEY, galleryRaw);
      }
      sessionStorage.removeItem(GALLERY_NAV_RETURN_PATH_KEY);
    }
  } catch {
    /* ignore */
  }
}
/** Dicegah scroll ganda setelah `ScrollToSectionOnLoad` menangani kembali dari detail. */
export const HOME_RETURN_SCROLL_HANDLED_KEY = "ayti_homeReturnScrollHandled_v1";

export function markHomeReturnScrollHandled(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HOME_RETURN_SCROLL_HANDLED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function peekHomeReturnScrollHandled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(HOME_RETURN_SCROLL_HANDLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function consumeHomeReturnScrollHandled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = sessionStorage.getItem(HOME_RETURN_SCROLL_HANDLED_KEY);
    if (v !== "1") return false;
    sessionStorage.removeItem(HOME_RETURN_SCROLL_HANDLED_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Hard refresh beranda: buang snapshot kembali dari detail agar tidak scroll ke listing lama. */
/** Bersihkan kunci navigasi produk lama (sesi sebelumnya). */
export function clearLegacyProductNavStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("lastProductId");
    localStorage.removeItem("productScrollY");
    sessionStorage.removeItem("ayti_productReturnScrollLock_v1");
    sessionStorage.removeItem("ayti_productReturnPending_v1");
    sessionStorage.removeItem("homeScrollY");
    sessionStorage.removeItem("ayti_homeReturnFallbackHash_v1");
    document.documentElement.removeAttribute("data-home-scroll-authority");
  } catch {
    /* ignore */
  }
}

export function clearAllHomeReturnSnapshots(): void {
  clearLegacyProductNavStorage();
  clearStoredProductReturnPath();
  clearStoredGalleryReturnPath();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LANDING_HASH_NAV_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

function saveInternalReturnPathToKey(storageKey: string): void {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  const full = `${pathname}${search}${hash}`;
  writeStoredReturnPath(storageKey, full);
}

/** Simpan URL saat ini sebelum navigasi internal (routing otomatis ke key produk atau gallery). */
export function saveInternalReturnPath(): void {
  if (isGalleryProjectPathname(window.location.pathname)) {
    saveInternalGalleryReturnPath();
    return;
  }
  saveInternalProductReturnPath();
}

export function saveInternalProductReturnPath(): void {
  saveInternalReturnPathToKey(PRODUCT_NAV_RETURN_PATH_KEY);
}

export function saveInternalGalleryReturnPath(): void {
  saveInternalReturnPathToKey(GALLERY_NAV_RETURN_PATH_KEY);
}

export function peekStoredProductReturnPath(): string | null {
  migrateLegacyReturnPathsBetweenDomains();
  const raw = readStoredReturnPath(PRODUCT_NAV_RETURN_PATH_KEY);
  if (!raw || !isProductInSiteReturnPath(raw)) return null;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.pathname === "/" || u.pathname === "") {
      return sanitizeProductHomeReturnHref(raw);
    }
  } catch {
    /* pakai raw in-site non-home */
  }
  return raw;
}

export function peekStoredGalleryReturnPath(): string | null {
  migrateLegacyReturnPathsBetweenDomains();
  const raw = readStoredReturnPath(GALLERY_NAV_RETURN_PATH_KEY);
  if (!raw) return null;
  if (isGalleryHomeReturnPath(raw)) return raw;
  if (typeof window !== "undefined" && isGalleryProjectPathname(window.location.pathname)) {
    try {
      const u = new URL(raw, window.location.origin);
      if (isGalleryProjectPathname(u.pathname)) return raw;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Alias produk — jangan dipakai untuk gallery. */
export function peekStoredDetailReturnPath(): string | null {
  return peekStoredProductReturnPath();
}

export function consumeStoredProductReturnPathIfEligible(
  currentFullPath: string,
): string | null {
  const candidate = peekStoredProductReturnPath();
  if (!candidate || candidate === currentFullPath) return null;
  clearStoredProductReturnPath();
  return candidate;
}

export function consumeStoredGalleryReturnPathIfEligible(
  currentFullPath: string,
): string | null {
  const candidate = peekStoredGalleryReturnPath();
  if (!candidate || candidate === currentFullPath) return null;
  clearStoredGalleryReturnPath();
  return candidate;
}

/** @deprecated gunakan `consumeStoredProductReturnPathIfEligible` */
export function consumeStoredDetailReturnPathIfEligible(
  currentFullPath: string,
): string | null {
  return consumeStoredProductReturnPathIfEligible(currentFullPath);
}

export function clearStoredProductReturnPath(): void {
  clearStoredReturnPathByKey(PRODUCT_NAV_RETURN_PATH_KEY);
}

export function clearStoredGalleryReturnPath(): void {
  clearStoredReturnPathByKey(GALLERY_NAV_RETURN_PATH_KEY);
}

/** @deprecated gunakan `clearStoredProductReturnPath` */
export function clearStoredDetailReturnPath(): void {
  clearStoredProductReturnPath();
}

export function isBackForwardNavigation(): boolean {
  if (typeof window === "undefined") return false;
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return nav?.type === "back_forward";
}

export function markLandingHashNavigationIntent(href: string): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (url.pathname !== "/" || url.hash.length <= 1) return;
    sessionStorage.setItem(
      LANDING_HASH_NAV_INTENT_KEY,
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    /* ignore private mode */
  }
}

const HOME_SECTION_ID_DENYLIST = /-(heading|label|card-heading)$/;

function isUsableHomeLocationHash(hash: string): boolean {
  const hn = hash.trim();
  return hn.length > 1 && hn !== "#beranda" && hn !== "#home";
}

/** Section beranda yang terlihat di viewport — hanya untuk navigasi artikel dari header. */
export function detectVisibleHomeLandingSectionId(): string | null {
  if (typeof document === "undefined") return null;
  const main = document.querySelector("main");
  if (!main) return null;

  const viewportH =
    window.visualViewport?.height && window.visualViewport.height > 0
      ? window.visualViewport.height
      : window.innerHeight;
  const viewportAnchor = window.scrollY + viewportH * 0.32;
  let best: { id: string; top: number } | null = null;

  for (const el of main.querySelectorAll<HTMLElement>("section[id], article[id], div[id]")) {
    const id = el.id.trim();
    if (!id || HOME_SECTION_ID_DENYLIST.test(id)) continue;
    if (!el.className.includes("scroll-mt") && el.tagName !== "SECTION") continue;

    const top = el.getBoundingClientRect().top + window.scrollY;
    const bottom = top + el.offsetHeight;
    if (bottom < window.scrollY + 48) continue;
    if (top > window.scrollY + window.innerHeight + 24) continue;
    if (top <= viewportAnchor && (!best || top > best.top)) {
      best = { id, top };
    }
  }

  return best?.id ?? null;
}

/** Hash URL beranda saat ini, atau fallback — tanpa deteksi scroll (cegah return ke section salah). */
function resolveHomeReturnHash(defaultHomeSectionDomId: string): string {
  const fallbackId = defaultHomeSectionDomId.replace(/^#/, "");
  const { hash } = window.location;
  const hn = typeof hash === "string" ? hash.trim() : "";

  if (!isUsableHomeLocationHash(hn)) {
    return `#${normalizeProductHomeReturnSectionId(fallbackId)}`;
  }

  return `#${normalizeProductHomeReturnSectionId(hn.replace(/^#/, ""))}`;
}

/** Sebelum navigasi ke halaman detail dari konteks beranda / halaman lain. */
export function prepareNavigateToInternalDetail(defaultHomeSectionDomId: string = "beranda"): void {
  snapshotReturnPathForInternalDetail(defaultHomeSectionDomId);
}

export function peekLandingHashNavigationIntent(currentHref: string): string | null {
  return resolveLandingHashNavigationIntentForHome(currentHref);
}

export function clearLandingHashNavigationIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LANDING_HASH_NAV_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Hapus intent dari storage lalu kembalikan nilainya (semua jenis section). */
export function consumeLandingHashNavigationIntent(currentHref: string): string | null {
  const resolved = peekLandingHashNavigationIntent(currentHref);
  if (!resolved) return null;
  clearLandingHashNavigationIntent();
  return resolved;
}

/**
 * Intent hash navigasi beranda — termasuk saat router belum menulis fragment (kembali produk).
 */
export function resolveLandingHashNavigationIntentForHome(
  currentHref: string,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LANDING_HASH_NAV_INTENT_KEY);
    if (!raw) return null;
    const intended = new URL(raw, window.location.origin);
    const current = new URL(currentHref, window.location.origin);
    if (intended.origin !== window.location.origin || current.origin !== window.location.origin) {
      return null;
    }
    if (intended.pathname !== "/" || current.pathname !== "/") return null;
    if (intended.hash.length <= 1) return null;

    if (intended.hash === current.hash) {
      return `${current.pathname}${current.search}${current.hash}`;
    }

    return `${intended.pathname}${intended.search}${intended.hash}`;
  } catch {
    return null;
  }
}

/**
 * Simpan `/#section` sebelum buka detail (produk / proses dari beranda).
 * Satu-satunya mekanisme restore: hash section, bukan pixel scroll Y.
 */
export function snapshotReturnPathForInternalDetail(defaultHomeSectionDomId: string): void {
  if (typeof window === "undefined") return;
  clearStoredGalleryReturnPath();
  const { pathname, search } = window.location;
  const pn = pathname === "" ? "/" : pathname;

  if (pn === "/") {
    try {
      const finalHash = resolveHomeReturnHash(defaultHomeSectionDomId);
      const full = `/${search}${finalHash}`;
      if (!full.startsWith("/") || full.startsWith("//")) return;
      writeStoredReturnPath(PRODUCT_NAV_RETURN_PATH_KEY, full);
    } catch {
      /* private mode */
    }
    return;
  }

  saveInternalProductReturnPath();
  clearFeaturedProdukMobileAccordionSnapshot();
}

/**
 * Sebelum buka `/produk/[slug]` — section dari map slug, atau `fallbackHomeSectionDomId`.
 */
export function prepareNavigateToProductDetail(
  productSlug: string,
  fallbackHomeSectionDomId: string = "produk",
): void {
  const section =
    getPinnedHomeReturnSectionForProductSlug(productSlug) ??
    normalizeProductHomeReturnSectionId(
      normalizeProductListingReturnSectionId(fallbackHomeSectionDomId),
    );
  prepareNavigateFromListingToProductDetail(section);
}

export function prepareNavigateFromListingToProductDetail(
  homeSectionDomId: string = "produk",
): void {
  if (typeof window === "undefined") return;
  clearStoredGalleryReturnPath();
  const { pathname, search } = window.location;
  const pn = pathname === "" ? "/" : pathname;

  if (pn === "/") {
    writeStoredReturnPath(
      PRODUCT_NAV_RETURN_PATH_KEY,
      buildHomeSectionReturnPath(
        normalizeProductHomeReturnSectionId(
          normalizeProductListingReturnSectionId(homeSectionDomId),
        ),
        search,
      ),
    );
    return;
  }

  saveInternalProductReturnPath();
  clearFeaturedProdukMobileAccordionSnapshot();
}

/** Sumber 1: masuk gallery lewat CTA di section Portfolio proyek → kembali ke `/#proyek`. */
export function setGalleryProjectReturnFromPortfolioCta(): void {
  if (typeof window === "undefined") return;
  clearStoredProductReturnPath();
  writeStoredReturnPath(
    GALLERY_NAV_RETURN_PATH_KEY,
    buildHomeSectionReturnPath(PORTFOLIO_HOME_SECTION_ID),
  );
  clearFeaturedProdukMobileAccordionSnapshot();
}

/** Sumber 2: masuk gallery lewat item navbar Gallery proyek → kembali ke `/#beranda`. */
export function setGalleryProjectReturnFromNavbar(): void {
  if (typeof window === "undefined") return;
  clearStoredProductReturnPath();
  writeStoredReturnPath(
    GALLERY_NAV_RETURN_PATH_KEY,
    buildHomeSectionReturnPath(HERO_HOME_SECTION_ID),
  );
  clearFeaturedProdukMobileAccordionSnapshot();
}

/** Navigasi admin dalam gallery (edit/tambah) — jangan timpa `/#beranda` / `/#proyek`. */
export function prepareProgrammaticNavigateToInternalDetail(): void {
  if (typeof window === "undefined") return;
  if (isGalleryProjectPathname(window.location.pathname)) {
    const existing = peekStoredGalleryReturnPath();
    if (existing && isGalleryHomeReturnPath(existing)) {
      clearFeaturedProdukMobileAccordionSnapshot();
      return;
    }
  }
  saveInternalReturnPath();
  clearFeaturedProdukMobileAccordionSnapshot();
}

export function clearFeaturedProdukMobileAccordionSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(FEATURED_PRODUK_MOBILE_OPEN_SECTION_KEY);
  } catch {
    /* ignore */
  }
}
