"use client";

export const HOME_SCROLL_Y_KEY = "homeScrollY";

/** Legacy sessionStorage key — dihapus oleh `clearFeaturedProdukMobileAccordionSnapshot` untuk sesi lama. */
export const FEATURED_PRODUK_MOBILE_OPEN_SECTION_KEY = "ayti_featuredProdukAccordion_v1";

/** Halaman untuk `router.push` jika riwayat browser tidak bisa dipercaya (iOS/WebView) */
export const DETAIL_NAV_RETURN_PATH_KEY = "ayti_detailReturn_v1";
export const LANDING_HASH_NAV_INTENT_KEY = "ayti_landingHashNavIntent_v1";

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

export function consumeLandingHashNavigationIntent(currentHref: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LANDING_HASH_NAV_INTENT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(LANDING_HASH_NAV_INTENT_KEY);
    const intended = new URL(raw, window.location.origin);
    const current = new URL(currentHref, window.location.origin);
    if (intended.origin !== window.location.origin || current.origin !== window.location.origin) {
      return null;
    }
    if (intended.pathname !== "/" || current.pathname !== "/") return null;
    if (intended.hash.length <= 1 || intended.hash !== current.hash) return null;
    return `${current.pathname}${current.search}${current.hash}`;
  } catch {
    return null;
  }
}

/**
 * Simpan titik kembali sebelum buka detail (produk / proses dari beranda).
 * Di `/` tanpa hash bermakna: pakai `defaultHomeSectionDomId` (mis. `produk` → `/#produk`) agar Kembali tidak mentok di hero.
 */
export function snapshotReturnPathForInternalDetail(defaultHomeSectionDomId: string): void {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  const pn = pathname === "" ? "/" : pathname;

  if (pn === "/") {
    saveHomeScrollY();
    try {
      const hn = typeof hash === "string" ? hash.trim() : "";
      const usable =
        hn.length > 1 && hn !== "#beranda" && hn !== "#home";
      const id = defaultHomeSectionDomId.replace(/^#/, "");
      const finalHash = usable ? hn : `#${id}`;
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

/** Sebelum membuka `/produk/[slug]` dari listing di situs. */
export function prepareNavigateFromListingToProductDetail(
  homeSectionDomId: string = "produk",
): void {
  snapshotReturnPathForInternalDetail(homeSectionDomId);
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
