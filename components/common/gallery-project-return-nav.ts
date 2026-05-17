"use client";

import {
  scrollHomeToHeroSection,
  scrollToLandingNavHref,
} from "@/components/common/home-nav-scroll";
import {
  clearLandingHashNavigationIntent,
  markHomeReturnScrollHandled,
  markLandingHashNavigationIntent,
  peekHomeReturnScrollHandled,
  peekLandingHashNavigationIntent,
  peekStoredGalleryReturnPath,
} from "@/components/common/return-section";
import {
  buildHomeSectionReturnPath,
  HERO_HOME_SECTION_ID,
  isGalleryHomeReturnPath,
  isGalleryProjectPathname,
  isHeroReturnPath,
} from "@/lib/product-listing-sections";

export { isGalleryHomeReturnPath, isGalleryInSiteReturnPath } from "@/lib/product-listing-sections";

const INSTANT_GALLERY_RETURN_SCROLL = { scrollBehavior: "auto" as const };

function normalizeReturnHref(href: string): string | null {
  try {
    const u = new URL(href, window.location.origin);
    return `${u.pathname || "/"}${u.search}${u.hash}`;
  } catch {
    return null;
  }
}

export function hasPendingGalleryReturn(): boolean {
  const stored = peekStoredGalleryReturnPath();
  return stored != null && isGalleryHomeReturnPath(stored);
}

export function hasPendingGalleryHeroReturn(): boolean {
  const stored = peekStoredGalleryReturnPath();
  return stored != null && isHeroReturnPath(stored);
}

/** Target kembali: storage (`/#beranda` | `/#proyek`), subpath gallery, atau hero (bookmark). */
export function resolveGalleryProjectBackTarget(): string | null {
  if (typeof window === "undefined") return null;

  const stored = peekStoredGalleryReturnPath();
  if (stored && isGalleryHomeReturnPath(stored)) {
    return normalizeReturnHref(stored);
  }

  const pn = window.location.pathname;
  if (isGalleryProjectPathname(pn) && pn !== "/gallery-project") {
    return "/gallery-project";
  }

  return buildHomeSectionReturnPath(HERO_HOME_SECTION_ID);
}

function currentHomeHref(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function peekGalleryReturnTargetFromStorage(): string | null {
  const stored = peekStoredGalleryReturnPath();
  if (!stored || !isGalleryHomeReturnPath(stored)) return null;
  return normalizeReturnHref(stored);
}

/** Set intent + scroll instan ke section beranda setelah kembali dari gallery. */
export function syncHomeToGalleryReturnTarget(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;

  const target = peekGalleryReturnTargetFromStorage();
  if (!target) return false;

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
  if (isHeroReturnPath(target)) {
    scrollHomeToHeroSection();
  } else {
    scrollToLandingNavHref(target, INSTANT_GALLERY_RETURN_SCROLL);
  }
  return true;
}

/**
 * Pulihkan hero atau Portfolio di `/` — tombol Kembali, back perangkat, tanpa jatuh ke section salah.
 */
export function tryApplyGalleryReturnOnHome(): boolean {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;

  const currentHref = currentHomeHref();

  const intentHref = peekLandingHashNavigationIntent(currentHref);
  if (intentHref && isGalleryHomeReturnPath(intentHref)) {
    clearLandingHashNavigationIntent();
    if (currentHref !== intentHref) {
      try {
        window.history.replaceState(null, "", intentHref);
      } catch {
        /* ignore */
      }
    }
    markHomeReturnScrollHandled();
    if (isHeroReturnPath(intentHref)) {
      scrollHomeToHeroSection();
    } else {
      scrollToLandingNavHref(intentHref, INSTANT_GALLERY_RETURN_SCROLL);
    }
    return true;
  }

  if (peekHomeReturnScrollHandled() || hasPendingGalleryReturn()) {
    if (syncHomeToGalleryReturnTarget()) return true;
  }

  return false;
}

export function prepareGalleryProjectReturnNavigation(target: string): void {
  markHomeReturnScrollHandled();
  markLandingHashNavigationIntent(target);
  try {
    window.history.scrollRestoration = "manual";
  } catch {
    /* ignore */
  }
}
