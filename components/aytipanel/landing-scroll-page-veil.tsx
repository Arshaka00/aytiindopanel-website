"use client";

import { useEffect, useRef } from "react";

/** Gelap maksimum di atas konten (bukan hero backdrop) — tetap aman untuk kontras teks. */
const MAX_VEIL_LIGHT = 0.072;
const MAX_VEIL_DARK = 0.048;

function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function readSiteDarkSurface(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.dataset.darkModeEnabled !== "1") return false;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/**
 * Di luar hero: menggelapkan **seluruh halaman** (lapisan fixed di atas konten,
 * di bawah header) mengikuti scroll — bukan overlay per gambar/section.
 * Hero tetang cinematik pada media lewat `HeroScrollCinematicBackdrop`.
 */
export function LandingScrollPageVeil() {
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = veilRef.current;
    if (!el || typeof window === "undefined") return;

    const root = document.documentElement;
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollYRef = { current: window.scrollY };
    let raf: number | null = null;
    let willChangeIdleTimer: ReturnType<typeof setTimeout> | undefined;

    const releaseWillChange = () => {
      if (willChangeIdleTimer !== undefined) {
        clearTimeout(willChangeIdleTimer);
        willChangeIdleTimer = undefined;
      }
      el.style.willChange = "auto";
    };

    const armWillChange = () => {
      el.style.willChange = "opacity";
      if (willChangeIdleTimer !== undefined) clearTimeout(willChangeIdleTimer);
      willChangeIdleTimer = setTimeout(releaseWillChange, 180);
    };

    const applyFrame = () => {
      raf = null;

      if (
        mqReduce.matches ||
        root.dataset.performanceNoAnim === "1" ||
        root.dataset.performanceLightweight === "1"
      ) {
        el.style.opacity = "0";
        releaseWillChange();
        return;
      }

      const hero = document.getElementById("beranda");
      const vh = window.innerHeight;
      const maxV = readSiteDarkSurface() ? MAX_VEIL_DARK : MAX_VEIL_LIGHT;

      if (!hero) {
        const linear = Math.min(1, scrollYRef.current / Math.max(vh * 1.8, 520));
        el.style.opacity = String(easeInOutCubic(linear) * maxV);
        return;
      }

      const rect = hero.getBoundingClientRect();
      /** Mulai saat bawah hero mendekati keluar viewport (hero tidak lagi dominan). */
      const triggerBottom = vh * 0.26;
      const pastPx = Math.max(0, triggerBottom - rect.bottom);
      const fadeSpan = Math.max(vh * 1.05, 440);
      const linearT = Math.min(1, pastPx / fadeSpan);
      el.style.opacity = String(easeInOutCubic(linearT) * maxV);
    };

    const schedule = () => {
      armWillChange();
      if (raf !== null) return;
      raf = window.requestAnimationFrame(applyFrame);
    };

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      schedule();
    };

    const onResize = () => {
      scrollYRef.current = window.scrollY;
      schedule();
    };

    scrollYRef.current = window.scrollY;
    applyFrame();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    mqReduce.addEventListener("change", applyFrame);

    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => schedule();
    mqDark.addEventListener("change", onScheme);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      mqReduce.removeEventListener("change", applyFrame);
      mqDark.removeEventListener("change", onScheme);
      if (raf !== null) window.cancelAnimationFrame(raf);
      releaseWillChange();
    };
  }, []);

  return (
    <div
      ref={veilRef}
      className="landing-scroll-page-veil pointer-events-none fixed inset-0 z-[40] bg-black"
      aria-hidden
      style={{ opacity: 0 }}
    />
  );
}
