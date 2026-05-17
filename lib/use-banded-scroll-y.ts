"use client";

import { useLayoutEffect, useState } from "react";

/** 0 = atas, 1 = scrolled (>12px), 2 = compact (>48px) — cukup untuk header glass/compact. */
export type ScrollYBand = 0 | 1 | 2;

const SCROLL_BAND_SOFT_PX = 12;
const SCROLL_BAND_COMPACT_PX = 48;

export function scrollYToBand(y: number): ScrollYBand {
  if (y > SCROLL_BAND_COMPACT_PX) return 2;
  if (y > SCROLL_BAND_SOFT_PX) return 1;
  return 0;
}

/**
 * Membaca `window.scrollY` dengan rAF + hanya memicu re-render saat melewati ambang header.
 * Menghindari `setState` tiap frame scroll (sumber jank di navbar fixed).
 */
export function useBandedScrollY(): ScrollYBand {
  /** Selalu 0 pada render pertama (SSR + hidrasi) — hindari mismatch saat browser restore scrollY > 0. */
  const [band, setBand] = useState<ScrollYBand>(0);
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;

    const apply = () => {
      raf = 0;
      const next = scrollYToBand(window.scrollY);
      setBand((prev) => (prev === next ? prev : next));
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    apply();
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return band;
}
