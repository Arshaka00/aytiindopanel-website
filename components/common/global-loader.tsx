"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { SiteLoaderBrandCaption } from "@/components/common/site-loader-brand-caption";
import { siteLoaderBrandAriaLabel } from "@/lib/site-loader-brand-lines";
import { useSiteLoaderMotionTier } from "@/lib/use-site-loader-motion-tier";

const LOADER_MARK_SRC = "/images/global-home-loader-mark.png";

/** Durasi overlay penuh sebelum mulai exit — memberi waktu membaca status memuat. */
const REVEAL_AT_MS = 1400;
const EXIT_DURATION_S = 0.48;
const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

type GlobalLoaderProps = {
  /** Matikan intro (mis. mode performa ringan / tanpa animasi berat dari CMS). */
  disabled?: boolean;
};

/**
 * Full-screen loader pada **load / refresh dokumen** (semua rute).
 * Navigasi klien App Router tidak memicu ulang — pakai {@link RouteTransitionShell}.
 */
export function GlobalLoader({ disabled = false }: GlobalLoaderProps) {
  const reduceMotion = useReducedMotion() === true;
  const motionTier = useSiteLoaderMotionTier();
  const lite = motionTier === "lite";

  const shouldRun = !disabled && !reduceMotion;

  const [dismissed, setDismissed] = useState(false);
  const [exitComplete, setExitComplete] = useState(false);
  const scrollLockRef = useRef<{ y: number } | null>(null);

  const visible = shouldRun && !dismissed;
  const scrollLocked = shouldRun && !(dismissed && exitComplete);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => setDismissed(true), REVEAL_AT_MS);
    return () => clearTimeout(t);
  }, [visible]);

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

  if (!shouldRun) {
    return null;
  }

  if (!visible && exitComplete) {
    return null;
  }

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setExitComplete(true)}>
      {visible ? (
        <motion.div
          key="ayti-global-loader"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={siteLoaderBrandAriaLabel()}
          className={
            lite
              ? "ayti-global-document-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] isolate [contain:layout_paint]"
              : "ayti-global-document-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-[6px] supports-[backdrop-filter]:bg-black/92 max-sm:backdrop-blur-[3px] isolate [contain:layout_paint]"
          }
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: EXIT_DURATION_S, ease: EASE_PREMIUM },
          }}
          style={{ willChange: "opacity" }}
        >
          <div
            className="pointer-events-none flex max-w-[min(20rem,88vw)] flex-col items-center gap-6 text-center sm:gap-7"
            style={{ transform: "translateZ(0)" }}
          >
            <motion.div
              className="relative flex size-[min(8rem,30vw)] shrink-0 items-center justify-center sm:size-[min(8.5rem,32vw)]"
              initial={lite ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={
                lite
                  ? {
                      opacity: 1,
                      transition: { duration: 0.38, ease: EASE_PREMIUM },
                    }
                  : {
                      opacity: 1,
                      scale: [0.94, 1.02, 1],
                      transition: {
                        opacity: { duration: 0.42, ease: EASE_PREMIUM },
                        scale: {
                          duration: Math.min(REVEAL_AT_MS / 1000, 1.12),
                          ease: EASE_PREMIUM,
                          times: [0, 0.55, 1],
                        },
                      },
                    }
              }
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

            <SiteLoaderBrandCaption motionTier={motionTier} />

            <div className="relative h-px w-[min(11rem,72vw)] overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full origin-left rounded-full bg-gradient-to-r from-sky-600/20 via-sky-300 to-cyan-200/90"
                initial={{ scaleX: 0.06, opacity: 0.4 }}
                animate={{ scaleX: 0.92, opacity: 1 }}
                transition={{ duration: REVEAL_AT_MS / 1000, ease: EASE_PREMIUM }}
                style={{ willChange: "transform, opacity" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
