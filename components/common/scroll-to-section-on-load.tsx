"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  isMobileishViewport,
  scrollHomeToHeroSection,
  scrollToLandingNavHref,
} from "@/components/common/home-nav-scroll";
import {
  clearAllHomeReturnSnapshots,
  consumeLandingHashNavigationIntent,
  markHomeReturnScrollHandled,
} from "@/components/common/return-section";
import { isFeaturedProductListingSectionHash } from "@/lib/product-listing-sections";
import { tryApplyGalleryReturnOnHome } from "@/components/common/gallery-project-return-nav";
import {
  clearLandingHashNavigationIntent,
  peekLandingHashNavigationIntent,
} from "@/components/common/return-section";
import {
  isGalleryHomeReturnPath,
  isProductHomeReturnPath,
} from "@/lib/product-listing-sections";
import {
  INSTANT_PRODUCT_RETURN_SCROLL,
  shouldSuppressHomeHeroSync,
  tryApplyProductListingReturnOnHome,
} from "@/components/common/product-detail-return-nav";

const INSTANT_HASH_SCROLL = INSTANT_PRODUCT_RETURN_SCROLL;

const ANDROID_RELOAD_SCROLL_TOP_TIMEOUTS_MS = [0, 40, 120, 260, 520, 900, 1400, 2000];

const USER_SCROLL_YIELDS_RELOAD_LOCK_PX = 56;

const DEV_HMR_HOME_RESET_FLAG = "__aytiDevHmrHomeReset";

type WindowWithDevHmrFlag = Window & {
  [DEV_HMR_HOME_RESET_FLAG]?: boolean;
};

const HERO_VIEWPORT_RESET_TIMEOUTS_MS = [0, 40, 120, 280, 520, 900, 1400];
/** Kunjungan pertama tanpa hash: sinkron singkat saja — hindari tarik-balik saat user scroll di mobile. */
const FIRST_VISIT_HERO_SYNC_MS = [0, 80, 220] as const;
const FIRST_VISIT_HERO_SYNC_MS_DESKTOP = [0, 40] as const;
const RELOAD_HERO_LOCK_MS = 2200;
const RELOAD_HERO_LOCK_MS_DESKTOP = 1400;

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

function isAndroidMobileBrowser(): boolean {
  try {
    const ua = navigator.userAgent;
    return /Android/i.test(ua) && /Mobile/i.test(ua);
  } catch {
    return false;
  }
}

/** Hard refresh / reload dokumen (bukan navigasi SPA). */
export function isHomeDocumentReload(): boolean {
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return (
    navEntry?.type === "reload" ||
    (typeof performance !== "undefined" &&
      "navigation" in performance &&
      ((performance as Performance & { navigation?: { type?: number } }).navigation?.type === 1))
  );
}

/**
 * Satu orchestrator restore beranda: hash section via `scrollToLandingNavHref`.
 * Hero hanya untuk reload, HMR dev, atau kunjungan pertama tanpa hash.
 */
export function ScrollToSectionOnLoad() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const isReload = isHomeDocumentReload();
    let cancelled = false;
    const timeoutIds: number[] = [];
    const cleanupFns: Array<() => void> = [];
    const isAndroidMobileReload = isReload && isAndroidMobileBrowser();
    let reloadScrollLockDone = false;
    let firstVisitHeroSyncYielded = false;

    const scrollHeroFullScreen = (): void => {
      if (cancelled || reloadScrollLockDone || firstVisitHeroSyncYielded) return;
      if (shouldSuppressHomeHeroSync()) return;
      scrollHomeToHeroSection();
    };

    const armYieldHeroResetOnUserScroll = (onYield?: () => void): void => {
      const onUserScroll = (): void => {
        if (window.scrollY < USER_SCROLL_YIELDS_RELOAD_LOCK_PX) return;
        firstVisitHeroSyncYielded = true;
        onYield?.();
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
        if (isGalleryHomeReturnPath(hashIntent) || isProductHomeReturnPath(hashIntent)) {
          return false;
        }
        clearLandingHashNavigationIntent();
        markHomeReturnScrollHandled();
        scrollToLandingNavHref(hashIntent, INSTANT_HASH_SCROLL);
        return true;
      }

      if (window.location.hash && window.location.hash.length > 1) {
        markHomeReturnScrollHandled();
        const scrollOpts = isFeaturedProductListingSectionHash(window.location.hash)
          ? INSTANT_HASH_SCROLL
          : isMobileishViewport()
            ? INSTANT_HASH_SCROLL
            : undefined;
        scrollToLandingNavHref(currentHref, scrollOpts);
        return true;
      }

      return false;
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

      if (isReload) {
        clearAllHomeReturnSnapshots();
        markHomeReturnScrollHandled();

        const prevRestoration = window.history.scrollRestoration;
        try {
          window.history.scrollRestoration = "manual";
        } catch {
          /* ignore */
        }

        const finishReloadScrollLock = (): void => {
          if (reloadScrollLockDone || cancelled) return;
          reloadScrollLockDone = true;
          try {
            window.history.scrollRestoration = prevRestoration;
          } catch {
            /* ignore */
          }
        };

        armYieldHeroResetOnUserScroll(finishReloadScrollLock);

        const resetTimeouts = isAndroidMobileReload
          ? ANDROID_RELOAD_SCROLL_TOP_TIMEOUTS_MS
          : HERO_VIEWPORT_RESET_TIMEOUTS_MS;
        scheduleAggressiveHeroViewportResets(resetTimeouts);

        timeoutIds.push(
          window.setTimeout(
            finishReloadScrollLock,
            isAndroidMobileReload ? RELOAD_HERO_LOCK_MS : RELOAD_HERO_LOCK_MS_DESKTOP,
          ),
        );
        return;
      }

      if (applyHashSectionRestore()) {
        return;
      }

      markHomeReturnScrollHandled();
      scheduleFirstVisitHeroSync();
    };

    const onPopState = (): void => {
      if (cancelled || window.location.pathname !== "/") return;
      queueMicrotask(() => {
        if (cancelled || isReload) return;
        applyHashSectionRestore();
      });
    };

    window.addEventListener("popstate", onPopState);
    cleanupFns.push(() => window.removeEventListener("popstate", onPopState));

    let raf1 = 0;
    if (isReload) {
      run();
    } else {
      raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(run);
      });
    }

    return () => {
      cancelled = true;
      if (raf1) cancelAnimationFrame(raf1);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      cleanupFns.splice(0).forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
