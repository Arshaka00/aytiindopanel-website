"use client";

import { useEffect, useMemo } from "react";
import { useCmsViewportIsMobile } from "@/components/common/use-cms-viewport-mobile";
import {
  cmsImageTransformToReactStyle,
  resolveCmsImageTransformForViewport,
} from "@/lib/cms-image-transform";
import type { HeroSlideEntry } from "@/lib/site-content-model";
import {
  HERO_SLIDE_INTERVAL_MS,
  heroSlideSources,
} from "@/components/aytipanel/hero-slider-config";

export type HeroSlideSource = HeroSlideEntry;

/**
 * Pause hero marquee saat #beranda keluar viewport.
 *
 * Tujuan: di mobile, animasi `transform` infinite loop tetap dijalankan oleh
 * compositor walau section sudah ter-scroll past, menahan layer GPU dan ikut
 * memengaruhi smoothness scroll. Dengan IntersectionObserver kita set atribut
 * `data-hero-visible` pada `#beranda` (lihat globals.css → `[data-hero-visible="0"]`
 * memaksa `animation-play-state: paused`). Saat hero kembali masuk viewport,
 * animasi resume otomatis dari posisi terakhir tanpa flash.
 */
function useHeroVisibilityPause() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const beranda = document.getElementById("beranda");
    if (!beranda) return;
    beranda.setAttribute("data-hero-visible", "1");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          beranda.setAttribute(
            "data-hero-visible",
            entry.isIntersecting ? "1" : "0",
          );
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(beranda);
    return () => {
      io.disconnect();
      beranda.removeAttribute("data-hero-visible");
    };
  }, []);
}

function marqueeKeyframesCss(slideCount: number): string {
  const segment = 100 / slideCount;
  let body = "";
  for (let i = 0; i < slideCount; i++) {
    const start = i * segment;
    const end = (i + 1) * segment - 0.02;
    const tx = -(i * segment);
    body += `  ${start.toFixed(4)}%, ${end.toFixed(4)}% { transform: translate3d(${tx.toFixed(4)}%, 0, 0); }\n`;
  }
  return `@keyframes hero-marquee-${slideCount} {\n${body}}\n`;
}

/**
 * Carousel hero tanpa timer JS — `transform` + keyframes bertahap (andalan untuk mobile).
 */
export function HeroBackgroundSlider({ sources }: { sources?: readonly HeroSlideSource[] }) {
  useHeroVisibilityPause();
  const isMobile = useCmsViewportIsMobile();
  const slides = sources && sources.length > 0 ? sources : heroSlideSources;
  const count = slides.length;

  const keyframesTag = useMemo(() => {
    if (count < 2) return null;
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: marqueeKeyframesCss(count),
        }}
      />
    );
  }, [count]);

  const durationMs = count * HERO_SLIDE_INTERVAL_MS;

  if (count === 0) return null;

  if (count === 1) {
    const slide = slides[0];
    const tf = resolveCmsImageTransformForViewport(slide, isMobile);
    const imgStyle = cmsImageTransformToReactStyle(tf);
    return (
      <div
        className="hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
        aria-hidden
      >
        <div className="cms-media-responsive-frame absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- asset /public */}
          <img
            src={slide.src}
            alt=""
            width={1920}
            height={1080}
            draggable={false}
            className="cms-media-fit-anchor absolute inset-0 h-full w-full touch-manipulation select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]"
            style={imgStyle}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_92%_at_50%_44%,transparent_22%,rgba(5,11,24,0.38)_62%,rgba(5,11,24,0.62)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_-60px_80px_-20px_rgba(5,11,24,0.35),inset_0_0_60px_rgba(5,11,24,0.18)]"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <>
      {keyframesTag}
      <div
        className="hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
        aria-hidden
      >
        <div
          className="hero-marquee-track flex h-full"
          style={{
            width: `${count * 100}%`,
            animation: `hero-marquee-${count} ${durationMs}ms linear infinite`,
          }}
        >
          {slides.map((slide, i) => {
            const tf = resolveCmsImageTransformForViewport(slide, isMobile);
            const imgStyle = cmsImageTransformToReactStyle(tf);
            const slideMob =
              "mobile" in slide && slide.mobile && typeof slide.mobile === "object"
                ? slide.mobile
                : undefined;
            const mobileKey = slideMob ? JSON.stringify(slideMob) : "";
            return (
              <div
                key={`${slide.src}-${i}-${tf.focalX}-${tf.focalY}-${tf.zoom}-${tf.objectFit}-${mobileKey}`}
                className="cms-media-responsive-frame relative h-full shrink-0 overflow-hidden"
                style={{ flex: `0 0 ${100 / count}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- asset /public */}
                <img
                  src={slide.src}
                  alt=""
                  width={1920}
                  height={1080}
                  draggable={false}
                  className="cms-media-fit-anchor absolute inset-0 h-full w-full touch-manipulation select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]"
                  style={imgStyle}
                  loading="eager"
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_92%_at_50%_44%,transparent_22%,rgba(5,11,24,0.38)_62%,rgba(5,11,24,0.62)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_-60px_80px_-20px_rgba(5,11,24,0.35),inset_0_0_60px_rgba(5,11,24,0.18)]"
          aria-hidden
        />
      </div>
    </>
  );
}
