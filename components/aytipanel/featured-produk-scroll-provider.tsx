"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/components/common/use-prefers-reduced-motion";

export const FEATURED_PRODUK_SCROLL_SECTION_ORDER = [
  "produk-utama",
  "produk-solusi",
  "accessories",
] as const;

export type FeaturedProdukScrollSectionId = (typeof FEATURED_PRODUK_SCROLL_SECTION_ORDER)[number];

type FeaturedScrollCtx = {
  /** Indeks aktif dalam `FEATURED_PRODUK_SCROLL_SECTION_ORDER`, atau null. */
  activeIndex: number | null;
  registerSection: (id: FeaturedProdukScrollSectionId, el: HTMLElement | null) => void;
  prefersReducedMotion: boolean;
  scrollModeEnabled: boolean;
};

const FeaturedProdukScrollContext = createContext<FeaturedScrollCtx | null>(null);

export function FeaturedProdukScrollProvider({ children }: { children: ReactNode }) {
  /** Scroll-sync accordion dinonaktifkan — mobile menampilkan detail tanpa accordion. */
  const scrollModeEnabled = false;
  const prefersReducedMotion = usePrefersReducedMotion();

  const registerSection = useCallback((_id: FeaturedProdukScrollSectionId, _el: HTMLElement | null) => {}, []);

  const value = useMemo(
    () =>
      ({
        activeIndex: null,
        registerSection,
        prefersReducedMotion,
        scrollModeEnabled,
      }) satisfies FeaturedScrollCtx,
    [registerSection, prefersReducedMotion, scrollModeEnabled],
  );

  return (
    <FeaturedProdukScrollContext.Provider value={value}>{children}</FeaturedProdukScrollContext.Provider>
  );
}

export function useFeaturedProdukScroll(): FeaturedScrollCtx | null {
  return useContext(FeaturedProdukScrollContext);
}

export function useFeaturedMobilePanelState(id: FeaturedProdukScrollSectionId): {
  scrollMode: boolean;
  expanded: boolean;
  registerSection: (el: HTMLElement | null) => void;
  prefersReducedMotion: boolean;
} {
  const ctx = useFeaturedProdukScroll();
  const idx = FEATURED_PRODUK_SCROLL_SECTION_ORDER.indexOf(id);

  return useMemo(() => {
    if (!ctx || !ctx.scrollModeEnabled || idx === -1) {
      return {
        scrollMode: false,
        expanded: false,
        registerSection: () => {},
        prefersReducedMotion: ctx?.prefersReducedMotion ?? false,
      };
    }
    return {
      scrollMode: true,
      expanded: ctx.activeIndex === idx,
      registerSection: (el: HTMLElement | null) => ctx.registerSection(id, el),
      prefersReducedMotion: ctx.prefersReducedMotion,
    };
  }, [ctx, id, idx]);
}
