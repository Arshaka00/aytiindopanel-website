"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { SiteLoaderBrandCaption } from "@/components/common/site-loader-brand-caption";
import {
  markGlobalLoaderIntroDone,
  shouldRunGlobalLoaderIntro,
} from "@/lib/global-loader-session";
import { siteLoaderBrandAriaLabel } from "@/lib/site-loader-brand-lines";
import { useSiteLoaderMotionTier } from "@/lib/use-site-loader-motion-tier";

const LOADER_MARK_SRC = "/images/global-home-loader-mark.png";
const LOADER_MARK_MOBILE_SRC = "/images/global-home-loader-mark-mobile.webp";

const REVEAL_AT_MS_FULL = 1400;
const REVEAL_AT_MS_LITE = 960;
const EXIT_DURATION_S_FULL = 0.48;
const EXIT_DURATION_S_LITE = 0.32;
const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

type GlobalLoaderProps = {
  /** Matikan intro (mis. mode performa ringan / tanpa animasi berat dari CMS). */
  disabled?: boolean;
};

type IntroGate = "pending" | "run" | "skip";

/** Jalur mobile / perangkat lemah: CSS opacity + gambar WebP kecil, tanpa Framer di dalam overlay. */
function LiteLoaderShell({
  revealMs,
  exitMs,
  onExitComplete,
}: {
  revealMs: number;
  exitMs: number;
  onExitComplete: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [barReady, setBarReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBarReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), revealMs);
    return () => clearTimeout(t);
  }, [revealMs]);

  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (!exiting || e.target !== rootRef.current || e.propertyName !== "opacity") return;
      onExitComplete();
    },
    [exiting, onExitComplete],
  );

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label={siteLoaderBrandAriaLabel()}
      className="ayti-global-document-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] isolate [contain:layout_paint]"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity ${exitMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: exiting ? "opacity" : undefined,
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="pointer-events-none flex max-w-[min(18rem,88vw)] flex-col items-center gap-5 text-center">
        <div className="relative flex size-[min(6.5rem,28vw)] shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- tier ringan: hindari pipeline optimasi Next pada cold start mobile */}
          <img
            src={LOADER_MARK_MOBILE_SRC}
            alt=""
            width={192}
            height={192}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-contain select-none"
            draggable={false}
          />
        </div>

        <SiteLoaderBrandCaption motionTier="lite" />

        <div className="relative h-px w-[min(10rem,72vw)] overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full origin-left rounded-full bg-sky-300/85"
            style={{
              transform: barReady ? "scaleX(0.92)" : "scaleX(0.06)",
              transition: barReady
                ? `transform ${revealMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen loader pada **load / refresh dokumen** (semua rute).
 * Satu kali per tab (sessionStorage); tidak muncul lagi saat navigasi SPA meski layout remount.
 */
export function GlobalLoader({ disabled = false }: GlobalLoaderProps) {
  const reduceMotion = useReducedMotion() === true;
  const motionTier = useSiteLoaderMotionTier();
  const lite = motionTier === "lite";

  const [gate, setGate] = useState<IntroGate>("pending");
  const [dismissed, setDismissed] = useState(true);
  const [exitComplete, setExitComplete] = useState(true);
  const scrollLockRef = useRef<{ y: number } | null>(null);

  const revealMs = lite ? REVEAL_AT_MS_LITE : REVEAL_AT_MS_FULL;
  const exitDurationS = lite ? EXIT_DURATION_S_LITE : EXIT_DURATION_S_FULL;

  useLayoutEffect(() => {
    if (disabled || reduceMotion) {
      setGate("skip");
      return;
    }
    if (!shouldRunGlobalLoaderIntro()) {
      setGate("skip");
      return;
    }
    setGate("run");
    setDismissed(false);
    setExitComplete(false);
  }, [disabled, reduceMotion]);

  const finishIntro = useCallback(() => {
    markGlobalLoaderIntroDone();
    setDismissed(true);
    setExitComplete(true);
  }, []);

  const shouldRun = gate === "run";
  const visible = shouldRun && !dismissed;
  const scrollLocked = shouldRun && visible;

  useEffect(() => {
    if (!visible || lite) return;
    const t = window.setTimeout(() => setDismissed(true), revealMs);
    return () => clearTimeout(t);
  }, [visible, lite, revealMs]);

  useEffect(() => {
    if (!scrollLocked) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const y = window.scrollY;

    scrollLockRef.current = { y };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      const lock = scrollLockRef.current;
      scrollLockRef.current = null;
      if (lock != null) {
        window.scrollTo(0, lock.y);
      }
    };
  }, [scrollLocked]);

  useEffect(() => {
    if (dismissed && shouldRun) {
      markGlobalLoaderIntroDone();
    }
  }, [dismissed, shouldRun]);

  if (gate === "pending" || gate === "skip") {
    return null;
  }

  if (!visible && exitComplete) {
    return null;
  }

  if (lite) {
    if (exitComplete) return null;
    return (
      <LiteLoaderShell
        revealMs={revealMs}
        exitMs={Math.round(exitDurationS * 1000)}
        onExitComplete={finishIntro}
      />
    );
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={finishIntro}>
      {visible ? (
        <motion.div
          key="ayti-global-loader"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={siteLoaderBrandAriaLabel()}
          className="ayti-global-document-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/92 isolate [contain:layout_paint]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: exitDurationS, ease: EASE_PREMIUM },
          }}
          style={{ willChange: "opacity" }}
        >
          <div
            className="pointer-events-none flex max-w-[min(20rem,88vw)] flex-col items-center gap-6 text-center sm:gap-7"
            style={{ transform: "translateZ(0)" }}
          >
            <motion.div
              className="relative flex size-[min(8rem,30vw)] shrink-0 items-center justify-center sm:size-[min(8.5rem,32vw)]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{
                opacity: 1,
                scale: [0.94, 1.02, 1],
                transition: {
                  opacity: { duration: 0.42, ease: EASE_PREMIUM },
                  scale: {
                    duration: Math.min(revealMs / 1000, 1.12),
                    ease: EASE_PREMIUM,
                    times: [0, 0.55, 1],
                  },
                },
              }}
            >
              <Image
                src={LOADER_MARK_SRC}
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 30vw, 8.5rem"
                className="object-contain select-none"
                draggable={false}
              />
            </motion.div>

            <SiteLoaderBrandCaption motionTier="full" />

            <div className="relative h-px w-[min(11rem,72vw)] overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-sky-600/20 via-sky-300 to-cyan-200/90"
                initial={{ scaleX: 0.06, opacity: 0.4 }}
                animate={{ scaleX: 0.92, opacity: 1 }}
                transition={{ duration: revealMs / 1000, ease: EASE_PREMIUM }}
                style={{ willChange: "transform, opacity" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
