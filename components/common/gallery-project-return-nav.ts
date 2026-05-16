"use client";

import { prepareProductDetailReturnNavigation } from "@/components/common/product-detail-return-nav";
import { peekStoredDetailReturnPath } from "@/components/common/return-section";
import {
  buildHomeSectionReturnPath,
  isGalleryProjectPathname,
  isPortfolioReturnPath,
  PORTFOLIO_HOME_SECTION_ID,
} from "@/lib/product-listing-sections";

export function resolveGalleryProjectBackTarget(): string | null {
  if (typeof window === "undefined") return null;

  const stored = peekStoredDetailReturnPath();
  if (stored && isPortfolioReturnPath(stored)) {
    try {
      const u = new URL(stored, window.location.origin);
      return `${u.pathname || "/"}${u.search}${u.hash}`;
    } catch {
      /* fallback */
    }
  }

  if (isGalleryProjectPathname(window.location.pathname)) {
    return buildHomeSectionReturnPath(PORTFOLIO_HOME_SECTION_ID);
  }

  return null;
}

export function prepareGalleryProjectReturnNavigation(
  target: string = buildHomeSectionReturnPath(PORTFOLIO_HOME_SECTION_ID),
): void {
  prepareProductDetailReturnNavigation(target);
}
