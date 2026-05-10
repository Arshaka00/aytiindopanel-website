"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToLandingNavHref } from "@/components/common/home-nav-scroll";
import {
  clearHomeScrollY,
  consumeLandingHashNavigationIntent,
  getHomeScrollY,
} from "@/components/common/return-section";

const ANDROID_RELOAD_SCROLL_TOP_TIMEOUTS_MS = [0, 40, 120, 260, 520, 900, 1400, 2000];

/**
 * Saat reload, scroll dipaksa ke atas berkali-kali (terutama Android). Kalau user sudah
 * menggeser ke bawah, hentikan rangkaian itu — kalau tidak, gesture akan "bertabrakan"
 * dan terasa seperti scroll ditahan / ditarik balik.
 */
const USER_SCROLL_YIELDS_RELOAD_LOCK_PX = 56;

function isAndroidMobileBrowser(): boolean {
  try {
    const ua = navigator.userAgent;
    return /Android/i.test(ua) && /Mobile/i.test(ua);
  } catch {
    return false;
  }
}

function isPageReload(): boolean {
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return (
    navEntry?.type === "reload" ||
    // Legacy fallback for older engines.
    (typeof performance !== "undefined" &&
      "navigation" in performance &&
      ((performance as Performance & { navigation?: { type?: number } }).navigation?.type === 1))
  );
}

/** Pulihkan scroll Y beranda — ulang ketika SPA kembali ke `/`. */
export function ScrollToSectionOnLoad() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;
    const timeoutIds: number[] = [];
    const cleanupFns: Array<() => void> = [];
    const isReload = isPageReload();
    const isAndroidMobileReload = isReload && isAndroidMobileBrowser();
    let reloadScrollLockDone = false;

    const scrollTopHard = (): void => {
      if (cancelled || reloadScrollLockDone) return;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const root = document.scrollingElement;
      if (root) root.scrollTop = 0;
    };
    const run = (): void => {
      if (cancelled) return;

      const hashIntent = window.location.hash
        ? consumeLandingHashNavigationIntent(
            `${window.location.pathname}${window.location.search}${window.location.hash}`,
          )
        : null;
      if (hashIntent) {
        clearHomeScrollY();
        scrollToLandingNavHref(hashIntent);
        return;
      }

      // Requirement: hard refresh on homepage should always land on Home section.
      if (isReload) {
        clearHomeScrollY();
        const prevRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";

        const finishReloadScrollLock = (): void => {
          if (reloadScrollLockDone || cancelled) return;
          reloadScrollLockDone = true;
          timeoutIds.forEach((id) => window.clearTimeout(id));
          timeoutIds.length = 0;
          try {
            window.history.scrollRestoration = prevRestoration;
          } catch {
            /* ignore */
          }
          cleanupFns.splice(0).forEach((cleanup) => cleanup());
        };

        // Jangan pertahankan hash saat hard refresh agar browser tidak auto-scroll ulang.
        if (window.location.hash) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}`,
          );
        }

        const onUserScrollDuringReloadLock = (): void => {
          if (window.scrollY >= USER_SCROLL_YIELDS_RELOAD_LOCK_PX) {
            finishReloadScrollLock();
          }
        };
        window.addEventListener("scroll", onUserScrollDuringReloadLock, { passive: true });
        cleanupFns.push(() => {
          window.removeEventListener("scroll", onUserScrollDuringReloadLock);
        });

        scrollTopHard();
        requestAnimationFrame(scrollTopHard);

        const timeouts = isAndroidMobileReload
          ? ANDROID_RELOAD_SCROLL_TOP_TIMEOUTS_MS
          : [40, 120];
        timeouts.forEach((ms) => {
          timeoutIds.push(window.setTimeout(scrollTopHard, ms));
        });

        const onPageShow = (): void => scrollTopHard();
        const onLoad = (): void => scrollTopHard();
        window.addEventListener("pageshow", onPageShow);
        window.addEventListener("load", onLoad);
        cleanupFns.push(() => {
          window.removeEventListener("pageshow", onPageShow);
          window.removeEventListener("load", onLoad);
        });

        if (isAndroidMobileReload) {
          window.visualViewport?.addEventListener("resize", scrollTopHard);
          cleanupFns.push(() => {
            window.visualViewport?.removeEventListener("resize", scrollTopHard);
          });
        }

        timeoutIds.push(
          window.setTimeout(finishReloadScrollLock, isAndroidMobileReload ? 2200 : 180),
        );
        return;
      }

      const savedY = getHomeScrollY();
      if (savedY == null) return;
      window.scrollTo(0, savedY);
      clearHomeScrollY();
    };

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
