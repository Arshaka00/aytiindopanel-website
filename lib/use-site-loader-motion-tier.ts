"use client";

import { useLayoutEffect, useState } from "react";

export type SiteLoaderMotionTier = "full" | "lite";

/**
 * Tier ringan untuk overlay loader: kurangi backdrop-blur, loop opacity, dan blur exit
 * yang berat di GPU — dipicu oleh CPU rendah, memori kecil, atau jaringan hemat data.
 */
export function readSiteLoaderMotionTier(): SiteLoaderMotionTier {
  if (typeof navigator === "undefined") return "full";
  try {
    const cores = navigator.hardwareConcurrency ?? 8;
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    const conn = nav.connection;
    if (conn?.saveData === true) return "lite";
    const ect = conn?.effectiveType;
    if (ect === "slow-2g" || ect === "2g") return "lite";
    if (cores <= 4) return "lite";
    const dm = nav.deviceMemory;
    if (typeof dm === "number" && dm <= 4) return "lite";
  } catch {
    /* ignore */
  }
  return "full";
}

/**
 * Hydration-safe: tier dibaca di layout effect supaya stabil sebelum paint berikutnya.
 */
export function useSiteLoaderMotionTier(): SiteLoaderMotionTier {
  const [tier, setTier] = useState<SiteLoaderMotionTier>("full");
  useLayoutEffect(() => {
    setTier(readSiteLoaderMotionTier());
  }, []);
  return tier;
}
