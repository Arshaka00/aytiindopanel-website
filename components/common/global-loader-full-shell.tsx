"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import { SiteLoaderBrandCaption } from "@/components/common/site-loader-brand-caption";
import { siteLoaderBrandAriaLabel } from "@/lib/site-loader-brand-lines";

const LOADER_MARK_SRC = "/images/global-home-loader-mark.png";
const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

type GlobalLoaderFullShellProps = {
  visible: boolean;
  revealMs: number;
  exitDurationS: number;
  onExitComplete: () => void;
};

/** Desktop / tier penuh — Framer Motion di chunk terpisah (tidak ikut bundle mobile). */
export function GlobalLoaderFullShell({
  visible,
  revealMs,
  exitDurationS,
  onExitComplete,
}: GlobalLoaderFullShellProps) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
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

            <SiteLoaderBrandCaption />

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
