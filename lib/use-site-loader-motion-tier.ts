"use client";

import { useLayoutEffect, useState } from "react";

export type SiteLoaderMotionTier = "full" | "lite";

function isCoarsePointerMobile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(max-width: 767px)").matches) return true;
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function isCmsLightweightMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.performanceLightweight === "1";
}

/**
 * Tier ringan: tanpa backdrop-blur, loop opacity, scale, dan decode gambar besar.
 * Mobile viewport selalu lite; desktop lemah (CPU/RAM/jaringan) juga lite.
 */
export function readSiteLoaderMotionTier(): SiteLoaderMotionTier {
  if (typeof navigator === "undefined") return "full";
  try {
    if (isCoarsePointerMobile()) return "lite";
    if (isCmsLightweightMode()) return "lite";

    const cores = navigator.hardwareConcurrency ?? 8;
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection;
    if (conn?.saveData === true) return "lite";
    const ect = conn?.effectiveType;
    if (ect === "slow-2g" || ect === "2g" || ect === "3g") return "lite";
    if (cores <= 4) return "lite";
    const dm = nav.deviceMemory;
    if (typeof dm === "number" && dm <= 4) return "lite";
  } catch {
    /* ignore */
  }
  return "full";
}

/**
 * Hydration-safe: tier dibaca di layout effect supaya mobile tidak sempat jalankan animasi berat.
 */
export function useSiteLoaderMotionTier(): SiteLoaderMotionTier {
  const [tier, setTier] = useState<SiteLoaderMotionTier>("lite");
  useLayoutEffect(() => {
    setTier(readSiteLoaderMotionTier());
  }, []);
  return tier;
}
