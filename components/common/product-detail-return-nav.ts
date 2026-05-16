"use client";

import { scrollToLandingNavHref } from "@/components/common/home-nav-scroll";
import {
  consumeLandingHashNavigationIntent,
  markHomeReturnScrollHandled,
  markLandingHashNavigationIntent,
  peekHomeReturnScrollHandled,
  peekStoredDetailReturnPath,
} from "@/components/common/return-section";
import {
  buildHomeSectionReturnPath,
  isFeaturedProductListingSectionHash,
  isPortfolioReturnHash,
  isPortfolioReturnPath,
  isProductDetailPathname,
  isProductListingReturnPath,
} from "@/lib/product-listing-sections";

export const INSTANT_PRODUCT_RETURN_SCROLL = { scrollBehavior: "auto" as const };

/** Target `/#section` dari session (atau fallback `#produk` di halaman detail). */
export function resolveProductDetailBackTarget(): string | null {
  if (typeof window === "undefined") return null;

  const stored = peekStoredDetailReturnPath();
  if (stored && isProductListingReturnPath(stored)) {
    try {
      const u = new URL(stored, window.location.origin);
      return `${u.pathname || "/"}${u.search}${u.hash}`;
    } catch {
      /* fallback */
    }
  }

  if (isProductDetailPathname(window.location.pathname)) {
    return buildHomeSectionReturnPath("produk");
  }

  return null;
}

export function hasPendingProductListingReturn(): boolean {
  const stored = peekStoredDetailReturnPath();
  return stored != null && isProductListingReturnPath(stored);
}

export function hasPendingPortfolioReturn(): boolean {
  const stored = peekStoredDetailReturnPath();
  return stored != null && isPortfolioReturnPath(stored);
}

export function isBackForwardNavigation(): boolean {
  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return nav?.type === "back_forward";
}

function currentHomeHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** Set intent + scroll instan ke section produk di beranda (pathname harus `/`). */
export function syncHomeToProductDetailReturnTarget(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;

  const target = resolveProductDetailBackTarget();
  if (!target || !isProductListingReturnPath(target)) return false;

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

  const currentHref = currentHomeHref();

  const intentHref = consumeLandingHashNavigationIntent(currentHref);
  if (intentHref) {
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

  if (
    peekHomeReturnScrollHandled() ||
    isBackForwardNavigation() ||
    hasPendingProductListingReturn()
  ) {
    if (syncHomeToProductDetailReturnTarget()) return true;
  }

  const h = window.location.hash;
  if (
    h.length > 1 &&
    (isFeaturedProductListingSectionHash(h) || isPortfolioReturnHash(h))
  ) {
    markHomeReturnScrollHandled();
    scrollToLandingNavHref(currentHref, INSTANT_PRODUCT_RETURN_SCROLL);
    return true;
  }

  return false;
}

export function shouldSuppressHomeHeroSync(): boolean {
  return (
    peekHomeReturnScrollHandled() ||
    hasPendingProductListingReturn() ||
    hasPendingPortfolioReturn() ||
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
