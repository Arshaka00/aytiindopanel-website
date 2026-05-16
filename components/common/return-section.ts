"use client";

import {
  buildHomeSectionReturnPath,
  PORTFOLIO_HOME_SECTION_ID,
  isPortfolioReturnPath,
  isProductListingReturnPath,
} from "@/lib/product-listing-sections";

export const HOME_SCROLL_Y_KEY = "homeScrollY";

/** Legacy sessionStorage key — dihapus oleh `clearFeaturedProdukMobileAccordionSnapshot` untuk sesi lama. */
export const FEATURED_PRODUK_MOBILE_OPEN_SECTION_KEY = "ayti_featuredProdukAccordion_v1";

/** Halaman untuk `router.push` jika riwayat browser tidak bisa dipercaya (iOS/WebView) */
export const DETAIL_NAV_RETURN_PATH_KEY = "ayti_detailReturn_v1";
export const LANDING_HASH_NAV_INTENT_KEY = "ayti_landingHashNavIntent_v1";
/** Dicegah `HomeInitialHashScroll` scroll ulang setelah `ScrollToSectionOnLoad` menangani kembali dari detail. */
export const HOME_RETURN_SCROLL_HANDLED_KEY = "ayti_homeReturnScrollHandled_v1";
/** Hash cadangan jika pulihkan `homeScrollY` gagal (umum di mobile saat layout belum siap). */
export const HOME_RETURN_FALLBACK_HASH_KEY = "ayti_homeReturnFallbackHash_v1";

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

export function saveHomeScrollY(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HOME_SCROLL_Y_KEY, String(window.scrollY));
  } catch {
    /* ignore private mode */
  }
}

export function getHomeScrollY(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HOME_SCROLL_Y_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearHomeScrollY(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(HOME_SCROLL_Y_KEY);
  } catch {
    /* ignore private mode */
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
    document.documentElement.removeAttribute("data-home-scroll-authority");
  } catch {
    /* ignore */
  }
}

export function clearAllHomeReturnSnapshots(): void {
  clearHomeScrollY();
  clearLegacyProductNavStorage();
  clearStoredDetailReturnPath();
  clearHomeReturnFallbackHash();
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LANDING_HASH_NAV_INTENT_KEY);
  } catch {
    /* ignore */
  }
}

export function stashHomeReturnFallbackHash(hash: string): void {
  if (typeof window === "undefined") return;
  const hn = hash.trim();
  if (hn.length <= 1) return;
  try {
    sessionStorage.setItem(HOME_RETURN_FALLBACK_HASH_KEY, hn);
  } catch {
    /* private mode */
  }
}

export function peekHomeReturnFallbackHash(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HOME_RETURN_FALLBACK_HASH_KEY);
    if (!raw || raw.length > 64 || !raw.startsWith("#")) return null;
    return raw;
  } catch {
    return null;
  }
}

export function consumeHomeReturnFallbackHash(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HOME_RETURN_FALLBACK_HASH_KEY);
    sessionStorage.removeItem(HOME_RETURN_FALLBACK_HASH_KEY);
    if (!raw || raw.length > 64 || !raw.startsWith("#")) return null;
    return raw;
  } catch {
    return null;
  }
}

export function clearHomeReturnFallbackHash(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(HOME_RETURN_FALLBACK_HASH_KEY);
  } catch {
    /* ignore */
  }
}

/** Simpan URL saat ini (path + hash) sebelum buka `/produk/…`, `/artikel/…`, dsb. */
export function saveInternalReturnPath(): void {
  if (typeof window === "undefined") return;
  try {
    const { pathname, search, hash } = window.location;
    const full = `${pathname}${search}${hash}`;
    if (!full.startsWith("/") || full.startsWith("//")) return;
    sessionStorage.setItem(DETAIL_NAV_RETURN_PATH_KEY, full);
  } catch {
    /* private mode */
  }
}

export function peekStoredDetailReturnPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DETAIL_NAV_RETURN_PATH_KEY);
    if (!raw || raw.length > 2048) return null;
    if (!raw.startsWith("/") || raw.startsWith("//")) return null;
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return raw;
  } catch {
    return null;
  }
}

/** Tarik jalur yang tersimpan (hapus dari storage jika digunakan). */
export function consumeStoredDetailReturnPathIfEligible(currentFullPath: string): string | null {
  const candidate = peekStoredDetailReturnPath();
  if (!candidate || candidate === currentFullPath) return null;
  clearStoredDetailReturnPath();
  return candidate;
}

export function clearStoredDetailReturnPath(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DETAIL_NAV_RETURN_PATH_KEY);
  } catch {
    /* ignore */
  }
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

/** Hash induk produk di beranda — subsection (utama/solusi/accessories) lebih spesifik. */
const HOME_PRODUK_PARENT_SECTION_ID = "produk";

const HOME_PRODUK_SUBSECTION_IDS = new Set([
  "produk-utama",
  "produk-solusi",
  "accessories",
  "produk-accessories",
]);

function isUsableHomeLocationHash(hash: string): boolean {
  const hn = hash.trim();
  return hn.length > 1 && hn !== "#beranda" && hn !== "#home";
}

/**
 * Section beranda yang paling relevan dengan posisi scroll saat ini (bukan hanya hash URL).
 * Dipakai agar Kembali dari detail tidak selalu jatuh ke `/#produk` saat pengguna ada di subsection/CTA.
 */
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

function resolveHomeReturnHash(defaultHomeSectionDomId: string): string {
  const fallbackId = defaultHomeSectionDomId.replace(/^#/, "");
  const { hash } = window.location;
  const hn = typeof hash === "string" ? hash.trim() : "";
  const detected = detectVisibleHomeLandingSectionId();

  if (!isUsableHomeLocationHash(hn)) {
    return detected ? `#${detected}` : `#${fallbackId}`;
  }

  const hashId = hn.replace(/^#/, "");
  if (
    detected &&
    hashId === HOME_PRODUK_PARENT_SECTION_ID &&
    detected !== HOME_PRODUK_PARENT_SECTION_ID &&
    HOME_PRODUK_SUBSECTION_IDS.has(detected)
  ) {
    return `#${detected}`;
  }

  if (detected && detected !== hashId && !HOME_PRODUK_SUBSECTION_IDS.has(hashId)) {
    return hn;
  }

  return hn;
}

/** Sebelum navigasi ke halaman detail dari konteks beranda / halaman lain. */
export function prepareNavigateToInternalDetail(defaultHomeSectionDomId: string = "beranda"): void {
  snapshotReturnPathForInternalDetail(defaultHomeSectionDomId);
}

export function consumeLandingHashNavigationIntent(currentHref: string): string | null {
  const resolved = resolveLandingHashNavigationIntentForHome(currentHref);
  if (!resolved) return null;
  try {
    sessionStorage.removeItem(LANDING_HASH_NAV_INTENT_KEY);
  } catch {
    /* ignore */
  }
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

    if (isProductListingReturnPath(raw) || isPortfolioReturnPath(raw)) {
      return `${intended.pathname}${intended.search}${intended.hash}`;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Simpan titik kembali sebelum buka detail (produk / proses dari beranda).
 * Di `/`: hash dari URL + posisi scroll + deteksi section terlihat (subsection produk, kontak, dll.).
 */
export function snapshotReturnPathForInternalDetail(defaultHomeSectionDomId: string): void {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  const pn = pathname === "" ? "/" : pathname;

  if (pn === "/") {
    saveHomeScrollY();
    try {
      const finalHash = resolveHomeReturnHash(defaultHomeSectionDomId);
      const full = `/${search}${finalHash}`;
      if (!full.startsWith("/") || full.startsWith("//")) return;
      sessionStorage.setItem(DETAIL_NAV_RETURN_PATH_KEY, full);
    } catch {
      /* private mode */
    }
    return;
  }

  saveInternalReturnPath();
  clearFeaturedProdukMobileAccordionSnapshot();
}

/**
 * Sebelum membuka `/produk/[slug]` dari beranda.
 * Simpan `/#{sectionId}` — mis. `produk-utama`, `produk-solusi`, `accessories`.
 */
export function prepareNavigateFromListingToProductDetail(
  homeSectionDomId: string = "produk",
): void {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  const pn = pathname === "" ? "/" : pathname;

  if (pn === "/") {
    try {
      clearHomeScrollY();
      const full = buildHomeSectionReturnPath(homeSectionDomId, search);
      sessionStorage.setItem(DETAIL_NAV_RETURN_PATH_KEY, full);
    } catch {
      /* private mode */
    }
    return;
  }

  saveInternalReturnPath();
  clearFeaturedProdukMobileAccordionSnapshot();
}

/** Sebelum buka `/gallery-project` dari beranda — simpan `/#proyek` tanpa snapshot scroll Y. */
export function prepareNavigateFromHomeToGalleryProject(): void {
  prepareNavigateFromListingToProductDetail(PORTFOLIO_HOME_SECTION_ID);
}

/** Sebelum `router.push` ke halaman dalam situs lain (gallery admin); tanpa menyimpan scroll beranda. */
export function prepareProgrammaticNavigateToInternalDetail(): void {
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
