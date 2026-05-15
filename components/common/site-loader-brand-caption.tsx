"use client";

import { motion } from "framer-motion";

import {
  SITE_LOADER_BRAND_PRIMARY,
  SITE_LOADER_BRAND_SECONDARY,
} from "@/lib/site-loader-brand-lines";
import type { SiteLoaderMotionTier } from "@/lib/use-site-loader-motion-tier";

const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

type SiteLoaderBrandCaptionProps = {
  /** Animasi opacity bernafas halus (shared loaders). */
  opacityBreathDuration?: number;
  /** Di perangkat/jaringan lemah: tanpa loop animasi agar tidak membebani compositor. */
  motionTier?: SiteLoaderMotionTier;
};

/** Blok teks dua baris branding — dipakai GlobalLoader & NavigationTransition overlay. */
export function SiteLoaderBrandCaption({
  opacityBreathDuration = 2.5,
  motionTier = "full",
}: SiteLoaderBrandCaptionProps) {
  if (motionTier === "lite") {
    return (
      <div className="flex flex-col gap-2 sm:gap-2.5">
        <p className="font-[family-name:var(--font-geist-sans)] text-[0.75rem] font-semibold uppercase leading-snug tracking-[0.16em] text-white/88 sm:text-xs">
          {SITE_LOADER_BRAND_PRIMARY}
        </p>
        <p className="font-[family-name:var(--font-geist-sans)] text-[0.6875rem] font-medium leading-relaxed tracking-[0.1em] text-white/72 sm:text-[0.8125rem]">
          {SITE_LOADER_BRAND_SECONDARY}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2 sm:gap-2.5"
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: [0.88, 1, 0.92, 1],
        y: 0,
        transition: {
          opacity: {
            duration: opacityBreathDuration,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: { duration: 0.5, ease: EASE_PREMIUM },
        },
      }}
    >
      <p className="font-[family-name:var(--font-geist-sans)] text-[0.75rem] font-semibold uppercase leading-snug tracking-[0.16em] text-white/88 sm:text-xs">
        {SITE_LOADER_BRAND_PRIMARY}
      </p>
      <p className="font-[family-name:var(--font-geist-sans)] text-[0.6875rem] font-medium leading-relaxed tracking-[0.1em] text-white/72 sm:text-[0.8125rem]">
        {SITE_LOADER_BRAND_SECONDARY}
      </p>
    </motion.div>
  );
}
