"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { SiteLoaderBrandCaption } from "@/components/common/site-loader-brand-caption";
import { siteLoaderBrandAriaLabel } from "@/lib/site-loader-brand-lines";
import { useSiteLoaderMotionTier } from "@/lib/use-site-loader-motion-tier";

const LOADER_MARK_SRC = "/images/global-home-loader-mark.png";

const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Total nuansa ~500–800ms sebelum push/replace (sesuai brief). */
const HOLD_BEFORE_NAV_MS = 520;
const OVERLAY_ENTER_S = 0.17;
const OVERLAY_EXIT_S = 0.24;
const FORCE_COMPLETE_MS = 3200;

/** Tombol kembali / delayed history.back — overlay dulu, lalu navigasi. */
const HOLD_BEFORE_HISTORY_BACK_MS = 280;

/** Popstate / forward: overlay minimal terlihat agar tidak “kedip”. */
const MIN_HISTORY_OVERLAY_MS = 420;
const HISTORY_OVERLAY_MAX_MS = 900;

export type NavigationTransitionContextValue = {
  navigate: (destination: string) => void;
  replace: (destination: string) => void;
  /** Overlay konsisten untuk tombol kembali (bukan native chrome — itu pakai popstate). */
  back: () => void;
};

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | null>(null);

export function useNavigationTransition(): NavigationTransitionContextValue {
  const v = useContext(NavigationTransitionContext);
  if (!v) {
    throw new Error("useNavigationTransition harus di dalam NavigationTransitionProvider");
  }
  return v;
}

export function useNavigationTransitionOptional(): NavigationTransitionContextValue | null {
  return useContext(NavigationTransitionContext);
}

function normalizeUrlKey(pathname: string, search: string, hash: string): string {
  const p = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  return `${p}${search}${hash}`;
}

type NavigationTransitionProviderProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

/**
 * Transisi global App Router: overlay gelap + delegasi klik, navigasi header/CMS (`spaNavigate`),
 * tombol kembali (`back`), `replace`, serta **popstate** (back/forward bilah browser).
 */
export function NavigationTransitionProvider({
  children,
  disabled = false,
}: NavigationTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  const motionTier = useSiteLoaderMotionTier();
  const lite = motionTier === "lite";
  const skip = disabled || reduceMotion;

  const [present, setPresent] = useState(false);
  const pendingKeyRef = useRef<string | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const historyFlowRef = useRef(false);
  const historyShownAtRef = useRef(0);
  const historyDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (pushTimerRef.current != null) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    if (forceTimerRef.current != null) {
      clearTimeout(forceTimerRef.current);
      forceTimerRef.current = null;
    }
    if (historyDismissTimerRef.current != null) {
      clearTimeout(historyDismissTimerRef.current);
      historyDismissTimerRef.current = null;
    }
  }, []);

  const dismissOverlay = useCallback(() => {
    pendingKeyRef.current = null;
    historyFlowRef.current = false;
    clearTimers();
    setPresent(false);
  }, [clearTimers]);

  const armHistoryOverlay = useCallback(() => {
    historyFlowRef.current = true;
    historyShownAtRef.current = typeof performance !== "undefined" ? performance.now() : 0;
    pendingKeyRef.current = null;
    if (pushTimerRef.current != null) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    setPresent(true);
    if (forceTimerRef.current != null) clearTimeout(forceTimerRef.current);
    forceTimerRef.current = setTimeout(() => dismissOverlay(), HISTORY_OVERLAY_MAX_MS);
  }, [dismissOverlay]);

  const tryCompleteForPending = useCallback(() => {
    const pending = pendingKeyRef.current;
    if (pending == null || typeof window === "undefined") return;

    const fromWindow = normalizeUrlKey(
      window.location.pathname,
      window.location.search,
      window.location.hash,
    );
    if (fromWindow === pending) {
      dismissOverlay();
      return;
    }

    const fromRouter = normalizeUrlKey(
      pathname,
      window.location.search,
      window.location.hash,
    );
    if (fromRouter === pending) {
      dismissOverlay();
    }
  }, [dismissOverlay, pathname]);

  useEffect(() => {
    if (skip) return;

    const onPopState = () => {
      armHistoryOverlay();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [skip, armHistoryOverlay]);

  useEffect(() => {
    let cancelled = false;
    let r1 = 0;
    let r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        if (cancelled) return;
        tryCompleteForPending();

        if (!historyFlowRef.current) return;

        const elapsed =
          (typeof performance !== "undefined" ? performance.now() : 0) - historyShownAtRef.current;
        const wait = Math.max(0, MIN_HISTORY_OVERLAY_MS - elapsed);

        historyDismissTimerRef.current = setTimeout(() => {
          if (cancelled || !historyFlowRef.current) return;
          historyFlowRef.current = false;
          dismissOverlay();
        }, wait);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      if (historyDismissTimerRef.current != null) {
        clearTimeout(historyDismissTimerRef.current);
        historyDismissTimerRef.current = null;
      }
    };
  }, [pathname, tryCompleteForPending, dismissOverlay]);

  const runTimedNavigation = useCallback(
    (mode: "push" | "replace", destination: string) => {
      if (typeof window === "undefined") return;

      let url: URL;
      try {
        url = new URL(destination, window.location.origin);
      } catch {
        if (mode === "push") router.push(destination);
        else router.replace(destination);
        return;
      }

      const dest = `${url.pathname}${url.search}${url.hash}`;

      if (skip) {
        if (mode === "push") router.push(dest);
        else router.replace(dest);
        return;
      }

      historyFlowRef.current = false;
      const nextKey = normalizeUrlKey(url.pathname, url.search, url.hash);

      clearTimers();
      pendingKeyRef.current = nextKey;
      setPresent(true);

      pushTimerRef.current = setTimeout(() => {
        pushTimerRef.current = null;
        if (mode === "push") router.push(dest);
        else router.replace(dest);
      }, HOLD_BEFORE_NAV_MS);

      forceTimerRef.current = setTimeout(() => dismissOverlay(), FORCE_COMPLETE_MS);
    },
    [skip, router, clearTimers, dismissOverlay],
  );

  const navigate = useCallback(
    (destination: string) => runTimedNavigation("push", destination),
    [runTimedNavigation],
  );

  const replace = useCallback(
    (destination: string) => runTimedNavigation("replace", destination),
    [runTimedNavigation],
  );

  const back = useCallback(() => {
    if (skip) {
      router.back();
      return;
    }
    armHistoryOverlay();
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null;
      router.back();
    }, HOLD_BEFORE_HISTORY_BACK_MS);
    forceTimerRef.current = setTimeout(() => dismissOverlay(), FORCE_COMPLETE_MS);
  }, [skip, router, armHistoryOverlay, dismissOverlay]);

  const ctx = useMemo(() => ({ navigate, replace, back }), [navigate, replace, back]);

  useEffect(() => {
    if (skip) return;

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const rawTarget = e.target;
      if (!(rawTarget instanceof Element)) return;

      const a = rawTarget.closest("a[href]");
      if (!a || !(a instanceof HTMLAnchorElement)) return;

      if (a.closest("[data-site-header-sticky]")) return;
      if (a.dataset.noNavTransition === "true") return;
      if (a.closest("[data-no-nav-transition]")) return;

      const hrefAttr = a.getAttribute("href");
      if (hrefAttr == null || hrefAttr === "" || hrefAttr.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.origin);
      } catch {
        return;
      }

      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.origin !== window.location.origin) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;

      const cur = new URL(window.location.href);
      if (url.pathname === cur.pathname && url.search === cur.search && url.hash !== cur.hash) {
        return;
      }
      if (url.pathname === cur.pathname && url.search === cur.search && url.hash === cur.hash) {
        return;
      }

      e.preventDefault();

      navigate(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [skip, navigate]);

  const lineDurationS = (HOLD_BEFORE_NAV_MS + 160) / 1000;

  return (
    <NavigationTransitionContext.Provider value={ctx}>
      {children}
      {!skip ? (
        <AnimatePresence>
          {present ? (
            <motion.div
              key="app-nav-transition-overlay"
              role="status"
              aria-live="polite"
              aria-busy="true"
              aria-label={siteLoaderBrandAriaLabel()}
              className={
                lite
                  ? "fixed inset-0 flex flex-col items-center justify-center bg-black px-6 isolate [contain:layout_paint]"
                  : "fixed inset-0 flex flex-col items-center justify-center bg-black/[0.91] px-6 backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/82 max-sm:backdrop-blur-[3px] isolate [contain:layout_paint]"
              }
              style={{
                zIndex: 65_000,
                willChange: "opacity",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: OVERLAY_ENTER_S, ease: EASE_PREMIUM },
              }}
              exit={{
                opacity: 0,
                transition: { duration: OVERLAY_EXIT_S, ease: EASE_PREMIUM },
              }}
            >
              <div
                className="pointer-events-none flex max-w-[min(17rem,82vw)] flex-col items-center gap-5 text-center sm:gap-6"
                style={{ transform: "translateZ(0)" }}
              >
                <motion.div
                  className="relative flex size-[min(4.25rem,22vw)] shrink-0 items-center justify-center sm:size-[min(4.75rem,20vw)]"
                  initial={lite ? { opacity: 0 } : { opacity: 0.85, scale: 0.94 }}
                  animate={
                    lite
                      ? {
                          opacity: 1,
                          transition: { duration: 0.28, ease: EASE_PREMIUM },
                        }
                      : {
                          opacity: 1,
                          scale: 1,
                          transition: { duration: 0.4, ease: EASE_PREMIUM },
                        }
                  }
                >
                  <Image
                    src={LOADER_MARK_SRC}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 22vw, 4.75rem"
                    className="object-contain select-none"
                    draggable={false}
                  />
                </motion.div>

                <SiteLoaderBrandCaption motionTier={motionTier} opacityBreathDuration={2.2} />

                <div className="relative h-px w-[min(10rem,70vw)] overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-sky-600/25 via-sky-300 to-cyan-200/90"
                    initial={{ scaleX: 0.06, opacity: 0.45 }}
                    animate={{ scaleX: 0.94, opacity: 1 }}
                    transition={{ duration: lineDurationS, ease: EASE_PREMIUM }}
                    style={{ willChange: "transform, opacity" }}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      ) : null}
    </NavigationTransitionContext.Provider>
  );
}
