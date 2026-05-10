"use client";

import { useEffect, useLayoutEffect } from "react";

function scrollTopHard(): void {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Halaman detail / formulir: saat route dimuat, paksa scroll dokumen ke atas (`y = 0`)
 * agar tidak mewarisi posisi scroll dari halaman sebelumnya (restore browser / Next / konten tinggi).
 * Ini memengaruhi posisi halaman, bukan posisi tombol Kembali di dalam alur dokumen.
 */
export function ForceScrollTopOnLoad() {
  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollTopHard();

    let raf1 = 0;
    const raf0 = requestAnimationFrame(() => {
      scrollTopHard();
      raf1 = requestAnimationFrame(scrollTopHard);
    });

    const t1 = window.setTimeout(scrollTopHard, 0);
    const t2 = window.setTimeout(scrollTopHard, 50);
    const t3 = window.setTimeout(scrollTopHard, 150);

    return () => {
      cancelAnimationFrame(raf0);
      cancelAnimationFrame(raf1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      try {
        window.history.scrollRestoration = prev;
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    scrollTopHard();
    const onLoad = () => scrollTopHard();
    if (document.readyState === "complete") {
      scrollTopHard();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
