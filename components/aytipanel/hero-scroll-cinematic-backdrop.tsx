"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type HeroScrollCinematicBackdropProps = {
  children: ReactNode;
};

/** Gelap maksimum (~75%) — teks hero tetap di atas lapisan ini di section. */
const MAX_OVERLAY_OPACITY = 0.75;
const SCALE_START = 1;
/** Zoom halus dari atas (landing premium, tidak agresif). */
const SCALE_END = 1.07;
/** Blur sangat tipis, hanya desktop (mobile tetap 0). */
const BLUR_MAX_PX = 1.75;

/** Easing cubic masuk-keluar — mulai & akhir lembut, terasa mahal seperti landing kelas atas. */
function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/** Jarak scroll hingga efek mencapai penuh — lebih panjang = transisi lebih perlahan. */
function readFadeDistancePx(): number {
  const hero = document.getElementById("beranda");
  const vh = window.innerHeight;
  const base = hero
    ? Math.min(vh * 0.78, Math.max(hero.offsetHeight * 0.68, 360))
    : Math.min(vh * 0.78, 520);
  return base * 1.42;
}

/**
 * Parallax cinematic: overlay gelap + scale + blur halus mengikuti scroll (perlahan dari atas).
 * Posisi scroll (`scrollYRef`) + gaya visual di-update di satu callback `requestAnimationFrame`
 * dengan imperative DOM — tanpa `setState` tiap frame agar scroll tetap ringan di mobile.
 */
export function HeroScrollCinematicBackdrop({
  children,
}: HeroScrollCinematicBackdropProps) {
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  /** Nilai scroll vertikal window (sinkron dengan `window.scrollY`). */
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const motionFlagsRef = useRef({
    reduceMotion: false,
    skipBlur: false,
  });

  useEffect(() => {
    const bgEl = bgLayerRef.current;
    const overlayEl = overlayRef.current;
    if (!bgEl || !overlayEl || typeof window === "undefined") return;

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 767.98px)");

    const syncMotionFlags = () => {
      motionFlagsRef.current = {
        reduceMotion: mqReduce.matches,
        skipBlur: mqMobile.matches,
      };
    };
    syncMotionFlags();

    const applyFrame = () => {
      rafRef.current = null;
      const { reduceMotion, skipBlur } = motionFlagsRef.current;
      const scrollY = scrollYRef.current;
      const fadeDist = readFadeDistancePx();
      const linearT = fadeDist > 0 ? scrollY / fadeDist : 0;
      const t = easeInOutCubic(linearT);

      let overlayOpacity = t * MAX_OVERLAY_OPACITY;
      let scale = SCALE_START + t * (SCALE_END - SCALE_START);
      let blurPx = skipBlur ? 0 : t * BLUR_MAX_PX;

      if (reduceMotion) {
        overlayOpacity = Math.min(MAX_OVERLAY_OPACITY * 0.58, overlayOpacity);
        scale = SCALE_START;
        blurPx = 0;
      }

      const transform = `translate3d(0, 0, 0) scale(${scale})`;

      bgEl.style.transform = transform;
      bgEl.style.filter = blurPx > 0.04 ? `blur(${blurPx}px)` : "none";

      overlayEl.style.opacity = String(overlayOpacity);
    };

    const scheduleFrame = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(applyFrame);
    };

    const onMq = () => {
      syncMotionFlags();
      scrollYRef.current = window.scrollY;
      scheduleFrame();
    };
    mqReduce.addEventListener("change", onMq);
    mqMobile.addEventListener("change", onMq);

    const onScroll = () => {
      scrollYRef.current = window.scrollY;
      scheduleFrame();
    };

    const onResize = () => {
      scrollYRef.current = window.scrollY;
      scheduleFrame();
    };

    scrollYRef.current = window.scrollY;
    applyFrame();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      mqReduce.removeEventListener("change", onMq);
      mqMobile.removeEventListener("change", onMq);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const bgLayerStyle = {
    transform: "translate3d(0, 0, 0) scale(1)",
    filter: "none",
    transformOrigin: "50% 50%",
  } satisfies CSSProperties;

  const overlayStyle = {
    opacity: 0,
  } satisfies CSSProperties;

  return (
    <div
      className="hero-scroll-cinematic hero-bg-root pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
      aria-hidden
    >
      <div
        ref={bgLayerRef}
        className="absolute inset-0 overflow-hidden will-change-[transform,filter]"
        style={bgLayerStyle}
      >
        {children}
      </div>
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 bg-black will-change-opacity"
        style={overlayStyle}
      />
    </div>
  );
}
