"use client";

import { useEffect } from "react";

const DESKTOP_MQ = "(min-width: 768px)";

/** Pause animasi slide saat hero hampir tidak terlihat (bukan untuk sembunyikan foto). */
const ANIM_PAUSE_RATIO_MOBILE = 0.18;
const ANIM_PAUSE_RATIO_DESKTOP = 0.35;

const SCROLL_IDLE_MS_MOBILE = 200;
const SCROLL_IDLE_MS_DESKTOP = 950;

/** Di bawah ini hero dianggap lewat — baru sembunyikan latar. */
const HERO_PAST_RATIO = 0.12;

function readAnimPauseThreshold(): number {
  if (typeof window === "undefined") return ANIM_PAUSE_RATIO_MOBILE;
  return window.matchMedia(DESKTOP_MQ).matches
    ? ANIM_PAUSE_RATIO_DESKTOP
    : ANIM_PAUSE_RATIO_MOBILE;
}

function readScrollIdleMs(): number {
  if (typeof window === "undefined") return SCROLL_IDLE_MS_MOBILE;
  return window.matchMedia(DESKTOP_MQ).matches
    ? SCROLL_IDLE_MS_DESKTOP
    : SCROLL_IDLE_MS_MOBILE;
}

function isHeroInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const h = window.innerHeight;
  return rect.bottom > 0 && rect.top < h;
}

/**
 * - `data-hero-bg-active` — "1" selama bagian hero masih di layar (foto tampil, termasuk saat scroll naik).
 * - `data-hero-past` — "1" hanya saat hero hampir sepenuhnya lewat.
 * - `data-hero-scrolling` — scroll sedang berjalan (header/reveal saja, bukan sembunyikan foto).
 */
export function useHeroViewportPerformance() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const beranda = document.getElementById("beranda");
    const root = document.documentElement;
    if (!beranda) return;

    beranda.setAttribute("data-hero-bg-active", "1");
    beranda.setAttribute("data-hero-visible", "1");
    beranda.setAttribute("data-hero-past", "0");
    beranda.setAttribute("data-hero-scrolling", "0");

    let scrollIdleTimer: ReturnType<typeof setTimeout> | undefined;
    let io: IntersectionObserver | undefined;
    let animPauseThreshold = readAnimPauseThreshold();
    let scrollIdleMs = readScrollIdleMs();
    let scrollTicking = false;

    const syncHeroBgActive = () => {
      beranda.setAttribute(
        "data-hero-bg-active",
        isHeroInViewport(beranda) ? "1" : "0",
      );
    };

    const syncFromRatio = (ratio: number) => {
      beranda.setAttribute(
        "data-hero-visible",
        ratio >= animPauseThreshold ? "1" : "0",
      );
      beranda.setAttribute(
        "data-hero-past",
        ratio <= HERO_PAST_RATIO ? "1" : "0",
      );
      syncHeroBgActive();
    };

    syncHeroBgActive();

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            syncFromRatio(entry.intersectionRatio);
          }
        },
        {
          threshold: [0, 0.08, 0.12, 0.18, 0.35, 0.5, 0.72, 0.85, 1],
        },
      );
      io.observe(beranda);
    }

    const endScroll = () => {
      beranda.setAttribute("data-hero-scrolling", "0");
      root.removeAttribute("data-page-scrolling");
      syncHeroBgActive();
      scrollIdleTimer = undefined;
    };

    const markScrolling = () => {
      beranda.setAttribute("data-hero-scrolling", "1");
      root.setAttribute("data-page-scrolling", "1");
      syncHeroBgActive();
      if (scrollIdleTimer !== undefined) {
        clearTimeout(scrollIdleTimer);
      }
      scrollIdleTimer = setTimeout(endScroll, scrollIdleMs);
    };

    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        scrollTicking = false;
        syncHeroBgActive();
        markScrolling();
      });
    };

    const desktopMq = window.matchMedia(DESKTOP_MQ);
    const onDesktopChange = () => {
      animPauseThreshold = readAnimPauseThreshold();
      scrollIdleMs = readScrollIdleMs();
      beranda.toggleAttribute("data-hero-desktop", desktopMq.matches);
      syncHeroBgActive();
    };
    onDesktopChange();
    desktopMq.addEventListener("change", onDesktopChange);

    // Hanya `scroll` pasif — `touchmove`/`wheel` global memicu handler tiap frame geser.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncHeroBgActive, { passive: true });

    return () => {
      io?.disconnect();
      desktopMq.removeEventListener("change", onDesktopChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncHeroBgActive);
      if (scrollIdleTimer !== undefined) {
        clearTimeout(scrollIdleTimer);
      }
      beranda.removeAttribute("data-hero-bg-active");
      beranda.removeAttribute("data-hero-visible");
      beranda.removeAttribute("data-hero-past");
      beranda.removeAttribute("data-hero-scrolling");
      beranda.removeAttribute("data-hero-desktop");
      root.removeAttribute("data-page-scrolling");
    };
  }, []);
}
