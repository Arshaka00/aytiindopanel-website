"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LANDING_ANCHOR_SETTLED_EVENT,
  isLandingNavAnchorAligned,
  isMobileishViewport,
  normalizeLandingNavHash,
  scrollHomeToHeroSection,
  scrollToLandingNavHref,
} from "@/components/common/home-nav-scroll";
import {
  markHomeReturnScrollHandled,
} from "@/components/common/return-section";
import { isFeaturedProductListingSectionHash } from "@/lib/product-listing-sections";
import { tryApplyGalleryReturnOnHome } from "@/components/common/gallery-project-return-nav";
import {
  clearLandingHashNavigationIntent,
  peekLandingHashNavigationIntent,
} from "@/components/common/return-section";
import {
  isAllowedProductListingReturnSectionId,
  isGalleryHomeReturnPath,
  isProductHomeReturnPath,
} from "@/lib/product-listing-sections";
import {
  INSTANT_PRODUCT_RETURN_SCROLL,
  shouldSuppressHomeHeroSync,
  tryApplyProductListingReturnOnHome,
} from "@/components/common/product-detail-return-nav";
import { isDocumentReloadNavigation } from "@/lib/global-loader-session";

const INSTANT_HASH_SCROLL = INSTANT_PRODUCT_RETURN_SCROLL;

const USER_SCROLL_YIELDS_HERO_SYNC_PX = 56;

const DEV_HMR_HOME_RESET_FLAG = "__aytiDevHmrHomeReset";

type WindowWithDevHmrFlag = Window & {
  [DEV_HMR_HOME_RESET_FLAG]?: boolean;
};

const HERO_VIEWPORT_RESET_TIMEOUTS_MS = [0, 40, 120, 280, 520, 900, 1400];
/** Kunjungan pertama tanpa hash: sinkron singkat saja — hindari tarik-balik saat user scroll di mobile. */
const FIRST_VISIT_HERO_SYNC_MS = [0, 80, 220] as const;
const FIRST_VISIT_HERO_SYNC_MS_DESKTOP = [0, 40] as const;

function armDevHmrHomeScrollReset(): void {
  if (process.env.NODE_ENV !== "development") return;
  try {
    const hot = (module as NodeModule & { hot?: { dispose(cb: () => void): void } }).hot;
    if (!hot) return;
    hot.dispose(() => {
      if (typeof window !== "undefined") {
        (window as WindowWithDevHmrFlag)[DEV_HMR_HOME_RESET_FLAG] = true;
      }
    });
  } catch {
    /* ignore */
  }
}

function consumeDevHmrHomeScrollReset(): boolean {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return false;
  const w = window as WindowWithDevHmrFlag;
  if (!w[DEV_HMR_HOME_RESET_FLAG]) return false;
  w[DEV_HMR_HOME_RESET_FLAG] = false;
  return true;
}

armDevHmrHomeScrollReset();

/**
 * Satu orchestrator restore beranda: hash section via `scrollToLandingNavHref`.
 * Hero sinkron hanya untuk HMR dev atau kunjungan pertama tanpa hash di atas dokumen.
 * Reload mengikuti restore scroll bawaan browser (tidak dipaksa ke hero).
 */
export function ScrollToSectionOnLoad() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;
    const timeoutIds: number[] = [];
    const cleanupFns: Array<() => void> = [];
    let firstVisitHeroSyncYielded = false;

    const scrollHeroFullScreen = (): void => {
      if (cancelled || firstVisitHeroSyncYielded) return;
      if (shouldSuppressHomeHeroSync()) return;
      scrollHomeToHeroSection();
    };

    const armYieldHeroResetOnUserScroll = (): void => {
      const onUserScroll = (): void => {
        if (window.scrollY < USER_SCROLL_YIELDS_HERO_SYNC_PX) return;
        firstVisitHeroSyncYielded = true;
      };
      window.addEventListener("scroll", onUserScroll, { passive: true });
      cleanupFns.push(() => {
        window.removeEventListener("scroll", onUserScroll);
      });
    };

    const scheduleAggressiveHeroViewportResets = (timeoutsMs: readonly number[]): void => {
      scrollHeroFullScreen();
      requestAnimationFrame(scrollHeroFullScreen);

      timeoutsMs.forEach((ms) => {
        timeoutIds.push(window.setTimeout(scrollHeroFullScreen, ms));
      });

      const onLoad = (): void => scrollHeroFullScreen();
      window.addEventListener("load", onLoad, { once: true });
      cleanupFns.push(() => {
        window.removeEventListener("load", onLoad);
      });

      const onViewportResize = (): void => scrollHeroFullScreen();
      window.visualViewport?.addEventListener("resize", onViewportResize);
      cleanupFns.push(() => {
        window.visualViewport?.removeEventListener("resize", onViewportResize);
      });
    };

    const scheduleFirstVisitHeroSync = (): void => {
      armYieldHeroResetOnUserScroll();
      const syncMs = isMobileishViewport()
        ? FIRST_VISIT_HERO_SYNC_MS
        : FIRST_VISIT_HERO_SYNC_MS_DESKTOP;
      scrollHeroFullScreen();
      requestAnimationFrame(scrollHeroFullScreen);
      syncMs.forEach((ms) => {
        timeoutIds.push(window.setTimeout(scrollHeroFullScreen, ms));
      });
    };

    const applyUrlHashScrollOnHome = (forceInstant = false): boolean => {
      if (!window.location.hash || window.location.hash.length <= 1) return false;
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      markHomeReturnScrollHandled();
      const scrollOpts =
        forceInstant ||
        isDocumentReloadNavigation() ||
        isFeaturedProductListingSectionHash(window.location.hash)
          ? INSTANT_HASH_SCROLL
          : isMobileishViewport()
            ? INSTANT_HASH_SCROLL
            : undefined;
      scrollToLandingNavHref(currentHref, { ...scrollOpts, bypassInstantScrollLock: true });
      return true;
    };

    const applyHashSectionRestore = (): boolean => {
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (tryApplyGalleryReturnOnHome()) {
        return true;
      }

      if (tryApplyProductListingReturnOnHome()) {
        return true;
      }

      const hashIntent = peekLandingHashNavigationIntent(currentHref);
      if (hashIntent) {
        if (isGalleryHomeReturnPath(hashIntent)) {
          return false;
        }
        if (isProductHomeReturnPath(hashIntent)) {
          try {
            const id = decodeURIComponent(
              new URL(hashIntent, window.location.origin).hash.replace(/^#/, ""),
            )
              .trim()
              .toLowerCase();
            if (isAllowedProductListingReturnSectionId(id)) {
              return false;
            }
          } catch {
            /* scroll intent generik di bawah */
          }
        }
        clearLandingHashNavigationIntent();
        markHomeReturnScrollHandled();
        scrollToLandingNavHref(hashIntent, {
          ...INSTANT_HASH_SCROLL,
          bypassInstantScrollLock: true,
        });
        return true;
      }

      return applyUrlHashScrollOnHome();
    };

    const run = (): void => {
      if (cancelled) return;

      if (consumeDevHmrHomeScrollReset()) {
        markHomeReturnScrollHandled();
        try {
          window.history.scrollRestoration = "manual";
        } catch {
          /* ignore */
        }
        scheduleAggressiveHeroViewportResets(HERO_VIEWPORT_RESET_TIMEOUTS_MS);
        timeoutIds.push(
          window.setTimeout(() => {
            try {
              window.history.scrollRestoration = "auto";
            } catch {
              /* ignore */
            }
          }, 1200),
        );
        return;
      }

      /**
       * Reload + hash: section beranda sering belum ter-hydrate saat browser scroll fragment.
       * Sinkronkan scroll + active nav setelah DOM siap (tanpa hero sync / session return).
       */
      if (isDocumentReloadNavigation()) {
        const fragment = window.location.hash;
        if (fragment.length > 1) {
          try {
            window.history.scrollRestoration = "auto";
          } catch {
            /* ignore */
          }
          const targetHash = normalizeLandingNavHash(fragment);
          let reloadHashSyncDone = false;
          const syncReloadHashAnchor = (): void => {
            if (cancelled || reloadHashSyncDone) return;
            if (isLandingNavAnchorAligned(targetHash)) {
              reloadHashSyncDone = true;
              window.dispatchEvent(new CustomEvent(LANDING_ANCHOR_SETTLED_EVENT));
              return;
            }
            applyUrlHashScrollOnHome(true);
            if (isLandingNavAnchorAligned(targetHash)) {
              reloadHashSyncDone = true;
              window.dispatchEvent(new CustomEvent(LANDING_ANCHOR_SETTLED_EVENT));
            }
          };
          requestAnimationFrame(() => {
            requestAnimationFrame(syncReloadHashAnchor);
          });
          for (const ms of [0, 60, 150, 320, 600, 1000, 1600, 2400, 3200, 4200]) {
            timeoutIds.push(window.setTimeout(syncReloadHashAnchor, ms));
          }
          const onLoad = (): void => syncReloadHashAnchor();
          if (document.readyState === "complete") {
            syncReloadHashAnchor();
          } else {
            window.addEventListener("load", onLoad, { once: true });
            cleanupFns.push(() => window.removeEventListener("load", onLoad));
          }
          const onPageShow = (): void => syncReloadHashAnchor();
          window.addEventListener("pageshow", onPageShow);
          cleanupFns.push(() => window.removeEventListener("pageshow", onPageShow));
        }
        return;
      }

      if (applyHashSectionRestore()) {
        return;
      }

      if (window.scrollY >= USER_SCROLL_YIELDS_HERO_SYNC_PX) {
        return;
      }

      markHomeReturnScrollHandled();
      scheduleFirstVisitHeroSync();
    };

    const onPopState = (): void => {
      if (cancelled || window.location.pathname !== "/") return;
      queueMicrotask(() => {
        if (cancelled) return;
        applyHashSectionRestore();
      });
    };

    window.addEventListener("popstate", onPopState);
    cleanupFns.push(() => window.removeEventListener("popstate", onPopState));

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      cleanupFns.splice(0).forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
