"use client";

import { scrollToLandingNavHref } from "@/components/common/home-nav-scroll";
import {
  clearLandingHashNavigationIntent,
  isBackForwardNavigation,
  markHomeReturnScrollHandled,
  markLandingHashNavigationIntent,
  peekHomeReturnScrollHandled,
  peekLandingHashNavigationIntent,
  peekStoredProductReturnPath,
} from "@/components/common/return-section";
import {
  hasPendingGalleryHeroReturn,
  hasPendingGalleryReturn,
} from "@/components/common/gallery-project-return-nav";
import { isDocumentReloadNavigation } from "@/lib/global-loader-session";
import {
  buildHomeSectionReturnPath,
  getPinnedHomeReturnSectionForProductSlug,
  isAllowedProductListingReturnSectionId,
  isGalleryHomeReturnPath,
  isGalleryInSiteReturnPath,
  isProductDetailPathname,
  isProductHomeReturnPath,
  isProductInSiteReturnPath,
  parseProductDetailSlug,
  sanitizeProductHomeReturnHref,
} from "@/lib/product-listing-sections";

export const INSTANT_PRODUCT_RETURN_SCROLL = {
  scrollBehavior: "auto" as const,
  bypassInstantScrollLock: true,
} as const;

/** Target `/#section` dari session (atau fallback `#produk` di halaman detail). */
export function resolveProductDetailBackTarget(): string | null {
  if (typeof window === "undefined") return null;

  const slug = parseProductDetailSlug(window.location.pathname);
  const pinnedSection = slug ? getPinnedHomeReturnSectionForProductSlug(slug) : null;
  if (pinnedSection) {
    return buildHomeSectionReturnPath(pinnedSection);
  }

  const stored = peekStoredProductReturnPath();
  if (stored && !isGalleryInSiteReturnPath(stored)) {
    if (isProductHomeReturnPath(stored)) {
      const safe = sanitizeProductHomeReturnHref(stored);
      if (safe) return safe;
    } else if (isProductInSiteReturnPath(stored)) {
      try {
        const u = new URL(stored, window.location.origin);
        return `${u.pathname || "/"}${u.search}${u.hash}`;
      } catch {
        /* fallback */
      }
    }
  }

  if (isProductDetailPathname(window.location.pathname)) {
    return buildHomeSectionReturnPath("produk");
  }

  return null;
}

export function hasPendingProductListingReturn(): boolean {
  const stored = peekStoredProductReturnPath();
  return stored != null && isProductHomeReturnPath(stored);
}

function currentHomeHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** Set intent + scroll instan ke section produk di beranda (pathname harus `/`). */
export function syncHomeToProductDetailReturnTarget(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;

  const target = resolveProductDetailBackTarget();
  if (!target || !isProductHomeReturnPath(target)) {
    return false;
  }

  const current = currentHomeHref();
  if (current !== target) {
    try {
      window.history.replaceState(null, "", target);
    } catch {
      /* ignore */
    }
    markLandingHashNavigationIntent(target);
  }

  markHomeReturnScrollHandled();
  scrollToLandingNavHref(target, INSTANT_PRODUCT_RETURN_SCROLL);
  return true;
}

/**
 * Pulihkan section produk di `/` — tombol Kembali, back perangkat, tanpa jatuh ke hero.
 */
export function tryApplyProductListingReturnOnHome(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;
  if (isDocumentReloadNavigation()) return false;

  const currentHref = currentHomeHref();

  const intentHref = peekLandingHashNavigationIntent(currentHref);
  if (intentHref && isProductHomeReturnPath(intentHref)) {
    try {
      const id = decodeURIComponent(
        new URL(intentHref, window.location.origin).hash.replace(/^#/, ""),
      )
        .trim()
        .toLowerCase();
      if (!isAllowedProductListingReturnSectionId(id)) {
        return false;
      }
    } catch {
      return false;
    }
    clearLandingHashNavigationIntent();
    if (currentHref !== intentHref) {
      try {
        window.history.replaceState(null, "", intentHref);
      } catch {
        /* ignore */
      }
    }
    markHomeReturnScrollHandled();
    scrollToLandingNavHref(intentHref, INSTANT_PRODUCT_RETURN_SCROLL);
    return true;
  }

  if (peekHomeReturnScrollHandled() || hasPendingProductListingReturn()) {
    if (syncHomeToProductDetailReturnTarget()) return true;
  }

  const h = window.location.hash;
  if (h.length > 1) {
    let sectionId: string;
    try {
      sectionId = decodeURIComponent(h.replace(/^#/, "")).trim().toLowerCase();
    } catch {
      return false;
    }
    if (!isAllowedProductListingReturnSectionId(sectionId)) {
      return false;
    }
    const safeHome = sanitizeProductHomeReturnHref(`/${h}`);
    if (safeHome) {
      markHomeReturnScrollHandled();
      scrollToLandingNavHref(safeHome, INSTANT_PRODUCT_RETURN_SCROLL);
      return true;
    }
  }

  return false;
}

export function shouldSuppressHomeHeroSync(): boolean {
  return (
    isDocumentReloadNavigation() ||
    peekHomeReturnScrollHandled() ||
    hasPendingProductListingReturn() ||
    hasPendingGalleryReturn() ||
    hasPendingGalleryHeroReturn() ||
    isBackForwardNavigation()
  );
}

export function prepareProductDetailReturnNavigation(target: string): void {
  markHomeReturnScrollHandled();
  markLandingHashNavigationIntent(target);
  try {
    window.history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
}
