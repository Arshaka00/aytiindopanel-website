"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import {
  isMobileishViewport,
  restoreHomeScrollPosition,
  scrollHomeToHeroSection,
  scrollToLandingNavHref,
} from "@/components/common/home-nav-scroll";
import {
  clearAllHomeReturnSnapshots,
  clearHomeScrollY,
  consumeHomeReturnFallbackHash,
  consumeLandingHashNavigationIntent,
  getHomeScrollY,
  markHomeReturnScrollHandled,
} from "@/components/common/return-section";

const ANDROID_RELOAD_SCROLL_TOP_TIMEOUTS_MS = [0, 40, 120, 260, 520, 900, 1400, 2000];

const USER_SCROLL_YIELDS_RELOAD_LOCK_PX = 56;

const DEV_HMR_HOME_RESET_FLAG = "__aytiDevHmrHomeReset";

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
        (window as Window & Record<string, boolean>)[DEV_HMR_HOME_RESET_FLAG] = true;
      }
    });
  } catch {
    /* ignore */
  }
}

function consumeDevHmrHomeScrollReset(): boolean {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return false;
  const w = window as Window & Record<string, boolean | undefined>;
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

const MOBILE_HOME_SCROLL_REINFORCE_MS = [100, 280, 560] as const;

function scheduleMobileHomeScrollReinforce(savedY: number): void {
  if (!isMobileishViewport()) return;
  const maxY = Math.max(
    0,
    (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight,
  );
  const target = Math.min(savedY, maxY);
  MOBILE_HOME_SCROLL_REINFORCE_MS.forEach((ms) => {
    window.setTimeout(() => {
      if (Math.abs(window.scrollY - target) > 40) {
        restoreHomeScrollPosition(target);
      }
    }, ms);
  });
}

function scrollHomeReturnFallbackHash(hash: string): void {
  const full = `${window.location.pathname}${window.location.search}${hash}`;
  scrollToLandingNavHref(full, { scrollBehavior: "auto" });
}

function restoreSavedHomeScrollY(): void {
  const savedY = getHomeScrollY();
  if (savedY == null) return;

  markHomeReturnScrollHandled();

  const mobile = isMobileishViewport();
  const maxAttempts = mobile ? 20 : 18;
  const retryMs = mobile ? 80 : 48;
  const layoutFactor = mobile ? 0.22 : 0.35;
  let attempts = 0;

  const run = (): void => {
    attempts += 1;
    const viewportH =
      window.visualViewport?.height && window.visualViewport.height > 0
        ? window.visualViewport.height
        : window.innerHeight;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight || 0;
    const layoutReady = scrollHeight >= savedY + viewportH * layoutFactor;

    if (!layoutReady && attempts < maxAttempts) {
      window.setTimeout(run, retryMs);
      return;
    }

    if (layoutReady) {
      restoreHomeScrollPosition(savedY, () => {
        clearHomeScrollY();
        consumeHomeReturnFallbackHash();
      });
      scheduleMobileHomeScrollReinforce(savedY);
      return;
    }

    const fallbackHash = consumeHomeReturnFallbackHash();
    clearHomeScrollY();
    if (fallbackHash) {
      scrollHomeReturnFallbackHash(fallbackHash);
      return;
    }

    restoreHomeScrollPosition(savedY);
    scheduleMobileHomeScrollReinforce(savedY);
  };

  queueMicrotask(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  });
}

/** Pulihkan scroll Y beranda — ulang ketika SPA kembali ke `/`. */
export function ScrollToSectionOnLoad() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const isReload = isHomeDocumentReload();

    /** Reload beranda (mis. dari `/#kontak`) — reset hero segera, tanpa `<script>` di React. */
    if (isReload) {
      clearAllHomeReturnSnapshots();
      markHomeReturnScrollHandled();
      try {
        window.history.scrollRestoration = "manual";
      } catch {
        /* ignore */
      }
      scrollHomeToHeroSection();
    }

    let cancelled = false;
    const timeoutIds: number[] = [];
    const cleanupFns: Array<() => void> = [];
    const isAndroidMobileReload = isReload && isAndroidMobileBrowser();
    let reloadScrollLockDone = false;
    let firstVisitHeroSyncYielded = false;

    const scrollHeroFullScreen = (): void => {
      if (cancelled || reloadScrollLockDone || firstVisitHeroSyncYielded) return;
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

    /** Reload / HMR: lawan scroll restoration browser (termasuk visualViewport di mobile). */
    const scheduleAggressiveHeroViewportResets = (timeoutsMs: readonly number[]): void => {
      scrollHeroFullScreen();
      requestAnimationFrame(scrollHeroFullScreen);

      timeoutsMs.forEach((ms) => {
        timeoutIds.push(window.setTimeout(scrollHeroFullScreen, ms));
      });

      const onLoad = (): void => scrollHeroFullScreen();
      const onPageShow = (): void => scrollHeroFullScreen();
      window.addEventListener("load", onLoad, { once: true });
      window.addEventListener("pageshow", onPageShow);
      cleanupFns.push(() => {
        window.removeEventListener("load", onLoad);
        window.removeEventListener("pageshow", onPageShow);
      });

      const onViewportResize = (): void => scrollHeroFullScreen();
      window.visualViewport?.addEventListener("resize", onViewportResize);
      cleanupFns.push(() => {
        window.visualViewport?.removeEventListener("resize", onViewportResize);
      });
    };

    /** Kunjungan pertama: satu kali sinkron ke hero, berhenti saat user mulai scroll. */
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

    const run = (): void => {
      if (cancelled) return;

      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (consumeDevHmrHomeScrollReset()) {
        markHomeReturnScrollHandled();
        try {
          window.history.scrollRestoration = "manual";
        } catch {
          /* ignore */
        }
        scheduleAggressiveHeroViewportResets(HERO_VIEWPORT_RESET_TIMEOUTS_MS);
        timeoutIds.push(window.setTimeout(() => {
          try {
            window.history.scrollRestoration = "auto";
          } catch {
            /* ignore */
          }
        }, 1200));
        return;
      }

      if (isReload) {
        clearAllHomeReturnSnapshots();
        markHomeReturnScrollHandled();

        const prevRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";

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

      /** Kembali dari detail: langsung ke scroll Y tersimpan (tanpa lewat hero / anchor CTA). */
      const savedY = getHomeScrollY();
      if (savedY != null) {
        const onPageShow = (event: PageTransitionEvent): void => {
          if (!event.persisted) return;
          const y = getHomeScrollY();
          if (y == null) return;
          markHomeReturnScrollHandled();
          restoreHomeScrollPosition(y, () => clearHomeScrollY());
          scheduleMobileHomeScrollReinforce(y);
        };
        window.addEventListener("pageshow", onPageShow);
        cleanupFns.push(() => window.removeEventListener("pageshow", onPageShow));
        restoreSavedHomeScrollY();
        return;
      }

      const hashIntent = consumeLandingHashNavigationIntent(currentHref);
      if (hashIntent) {
        markHomeReturnScrollHandled();
        scrollToLandingNavHref(
          hashIntent,
          isMobileishViewport() ? { scrollBehavior: "auto" } : undefined,
        );
        return;
      }

      if (window.location.hash && window.location.hash.length > 1) {
        markHomeReturnScrollHandled();
        scrollToLandingNavHref(
          currentHref,
          isMobileishViewport() ? { scrollBehavior: "auto" } : undefined,
        );
        return;
      }

      /** Kunjungan pertama / buka beranda tanpa hash — hero penuh + nav Beranda. */
      markHomeReturnScrollHandled();
      scheduleFirstVisitHeroSync();
    };

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
