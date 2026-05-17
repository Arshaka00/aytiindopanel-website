"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  type NavigationTransitionContextValue,
  useNavigationTransitionOptional,
} from "@/components/common/app-navigation-transition";
import {
  isGalleryInSiteReturnPath,
  isGalleryProjectPathname,
  isProductDetailPathname,
  isProductHomeReturnPath,
} from "@/lib/product-listing-sections";
import {
  prepareGalleryProjectReturnNavigation,
  resolveGalleryProjectBackTarget,
} from "@/components/common/gallery-project-return-nav";
import {
  prepareProductDetailReturnNavigation,
  resolveProductDetailBackTarget,
} from "@/components/common/product-detail-return-nav";
import {
  clearStoredGalleryReturnPath,
  clearStoredProductReturnPath,
  consumeStoredProductReturnPathIfEligible,
  markLandingHashNavigationIntent,
} from "@/components/common/return-section";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";

type BackButtonProps = {
  label?: string;
  className?: string;
  /** `null` = tanpa ikon (teks saja); default panah ← */
  icon?: ReactNode | null;
  destination?: "home" | "previous";
  /**
   * Saat `destination="previous"` dan tidak pakai riwayat / path tersimpan
   * (tab baru, bookmark, dll.).
   */
  fallbackHref?: string;
  /**
   * Di viewport mobile (< `md`, 768px): abaikan `history.back` / storage — langsung ke URL ini + scroll anchor.
   * Untuk tombol “Kembali ke alur kerja” agar selalu sampai hero beranda.
   */
  mobileForceHref?: string;
  /**
   * Jika diisi: selalu `router.push` ke URL ini + scroll anchor (semua viewport).
   * Mengabaikan `history.back` / return-path storage — untuk target beranda yang konsisten (mis. `/#beranda`).
   */
  forceNavigateHref?: string;
};

const backButtonBaseClass =
  "relative z-[60] inline-flex min-h-11 min-w-11 touch-manipulation pointer-events-auto select-none items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-accent/90 opacity-95 transition-[color,opacity] duration-200 hover:text-primary hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background [-webkit-tap-highlight-color:transparent]";

function currentFullPath(): string {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

function navigateToStoredHref(
  href: string,
  router: ReturnType<typeof useRouter>,
  navTx: NavigationTransitionContextValue | null,
): void {
  let targetPath = href;
  try {
    const u = new URL(href, window.location.origin);
    targetPath = `${u.pathname}${u.search}${u.hash}`;
  } catch {
    /* pakai href mentah */
  }

  if (targetPath.includes("#")) {
    markLandingHashNavigationIntent(targetPath);
  }

  if (navTx) {
    navTx.replace(targetPath);
  } else {
    router.replace(targetPath, { scroll: false });
  }
}


export function BackButton({
  label = "Kembali",
  className = backButtonBaseClass,
  icon,
  destination = "home",
  fallbackHref = "/",
  mobileForceHref,
  forceNavigateHref,
}: BackButtonProps) {
  const router = useRouter();
  const navTx = useNavigationTransitionOptional();
  const isNavigatingRef = useRef(false);

  const navigatePrevious = useCallback(() => {
    if (isNavigatingRef.current || typeof window === "undefined") return;
    isNavigatingRef.current = true;

    const releaseLock = () => {
      window.setTimeout(() => {
        isNavigatingRef.current = false;
      }, 720);
    };

    if (forceNavigateHref) {
      try {
        if (isGalleryInSiteReturnPath(forceNavigateHref)) {
          clearStoredProductReturnPath();
          prepareGalleryProjectReturnNavigation(forceNavigateHref);
        } else if (isProductHomeReturnPath(forceNavigateHref)) {
          clearStoredGalleryReturnPath();
          prepareProductDetailReturnNavigation(forceNavigateHref);
        } else {
          clearStoredGalleryReturnPath();
          clearStoredProductReturnPath();
        }
        navigateToStoredHref(forceNavigateHref, router, navTx);
      } catch {
        /* fallback */
      }
      releaseLock();
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    if (isMobileViewport && mobileForceHref) {
      try {
        clearStoredGalleryReturnPath();
        clearStoredProductReturnPath();
        navigateToStoredHref(mobileForceHref, router, navTx);
      } catch {
        /* fallback */
      }
      releaseLock();
      return;
    }

    try {
      if (isGalleryProjectPathname(window.location.pathname)) {
        const galleryBackHref = resolveGalleryProjectBackTarget();
        if (galleryBackHref) {
          clearStoredGalleryReturnPath();
          prepareGalleryProjectReturnNavigation(galleryBackHref);
          navigateToStoredHref(galleryBackHref, router, navTx);
          releaseLock();
          return;
        }
      }

      if (isProductDetailPathname(window.location.pathname)) {
        const productBackHref = resolveProductDetailBackTarget();
        if (productBackHref) {
          clearStoredProductReturnPath();
          prepareProductDetailReturnNavigation(productBackHref);
          navigateToStoredHref(productBackHref, router, navTx);
          releaseLock();
          return;
        }
      }

      const fromProductStorage = consumeStoredProductReturnPathIfEligible(
        currentFullPath(),
      );
      if (fromProductStorage) {
        prepareProductDetailReturnNavigation(fromProductStorage);
        navigateToStoredHref(fromProductStorage, router, navTx);
        releaseLock();
        return;
      }
    } catch {
      /* jalur fallback di bawah */
    }

    clearStoredGalleryReturnPath();
    clearStoredProductReturnPath();
    navigateToStoredHref(fallbackHref, router, navTx);
    releaseLock();
  }, [router, fallbackHref, mobileForceHref, forceNavigateHref, navTx]);

  /** iOS/Android: sentuhan memicu `pointerup` sebelum `click`; duplikat diblok `isNavigatingRef`. */
  const handlePointerUpNavigate = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      if (event.button !== 0 && event.button !== -1) return;
      event.preventDefault();
      navigatePrevious();
    },
    [navigatePrevious],
  );

  const iconMarkup =
    icon === null ? null : (
      <span className="text-[0.9em] opacity-80">{icon ?? <span aria-hidden>←</span>}</span>
    );

  if (destination === "previous") {
    return (
      <button
        type="button"
        className={mergeAytiCtaClass(className)}
        onClick={navigatePrevious}
        onPointerUp={handlePointerUpNavigate}
      >
        {iconMarkup}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href="/" className={mergeAytiCtaClass(className)}>
      {iconMarkup}
      <span>{label}</span>
    </Link>
  );
}
