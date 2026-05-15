"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useCmsViewportIsMobile } from "@/components/common/use-cms-viewport-mobile";
import {
  cmsImageTransformToReactStyle,
  resolveCmsImageTransformForViewport,
} from "@/lib/cms-image-transform";
import { isHeroSlideNextImageOptimizable } from "@/lib/hero-slide-image-policy";
import type { HeroSlideEntry } from "@/lib/site-content-model";
import {
  HERO_SLIDE_INTERVAL_MS,
  heroSlideSources,
} from "@/components/aytipanel/hero-slider-config";

export type HeroSlideSource = HeroSlideEntry;

export type HeroBackgroundSliderProps = {
  sources?: readonly HeroSlideSource[];
  initialViewportIsMobile?: boolean;
};

const HERO_SLIDE_SIZES = "(max-width: 767px) 100vw, min(100vw, 1920px)";
const HERO_IMG_BASELINE = { width: 1920, height: 1080 } as const;

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
 * Crossfade dengan overlap di batas slide — selalu ada minimal satu lapisan terlihat
 * (hindari jeda #050B18 saat pergantian).
 */
function crossfadeKeyframesCss(slideCount: number): string {
  const seg = 100 / slideCount;
  const blend = Math.min(seg * 0.1, 6);
  let css = "";
  for (let i = 0; i < slideCount; i++) {
    const start = i * seg;
    const end = (i + 1) * seg;
    const fadeInStart = i === 0 ? start : Math.max(0, start - blend);
    const fadeInEnd = i === 0 ? start : start + blend;
    const fadeOutStart = end - blend;
    const fadeOutEnd = end;

    css += `@keyframes hero-crossfade-${slideCount}-s${i} {\n`;
    if (i === 0) {
      css += `  0% { opacity: 1; }\n`;
    } else {
      css += `  0% { opacity: 0; }\n`;
      css += `  ${fadeInStart.toFixed(3)}% { opacity: 0; }\n`;
      css += `  ${fadeInEnd.toFixed(3)}% { opacity: 1; }\n`;
    }
    css += `  ${fadeOutStart.toFixed(3)}% { opacity: 1; }\n`;
    css += `  ${fadeOutEnd.toFixed(3)}% { opacity: 0; }\n`;
    if (i < slideCount - 1) {
      css += `  100% { opacity: 0; }\n`;
    } else {
      css += `  100% { opacity: 0; }\n`;
    }
    css += `}\n`;
  }
  return css;
}

/** Desktop crossfade: muat slide 2+ cepat agar tidak blank saat transisi. */
function useDeferNonPrimaryHeroSlides(
  slideCount: number,
  enabled: boolean,
  eagerLoad: boolean,
) {
  const [ready, setReady] = useState(
    slideCount <= 1 || !enabled || eagerLoad,
  );

  useEffect(() => {
    if (!enabled || slideCount <= 1 || eagerLoad) {
      setReady(slideCount <= 1 || eagerLoad);
      return;
    }
    let cancelled = false;
    const unlock = () => {
      if (!cancelled) setReady(true);
    };
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(unlock, { timeout: 900 })
        : undefined;
    const timeoutId = window.setTimeout(unlock, 1100);
    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      window.clearTimeout(timeoutId);
    };
  }, [slideCount, enabled, eagerLoad]);

  return ready;
}

/** Preload URL gambar slide berikutnya (hindari jeda decode saat crossfade). */
function usePreloadHeroSlideUrls(urls: readonly string[], enabled: boolean) {
  useEffect(() => {
    if (!enabled || urls.length === 0) return;
    const links: HTMLLinkElement[] = [];
    for (const href of urls) {
      if (!href) continue;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      for (const link of links) {
        link.remove();
      }
    };
  }, [urls, enabled]);
}

type HeroSlideImageProps = {
  slide: HeroSlideSource;
  index: number;
  slideCount: number;
  isMobile: boolean;
  showMedia: boolean;
  layout: "marquee" | "crossfade" | "single";
  layerStyle?: CSSProperties;
};

function HeroSlideImage({
  slide,
  index,
  slideCount,
  isMobile,
  showMedia,
  layout,
  layerStyle,
}: HeroSlideImageProps) {
  const tf = resolveCmsImageTransformForViewport(slide, isMobile);
  const imgStyle = cmsImageTransformToReactStyle(tf);
  const useNext = isHeroSlideNextImageOptimizable(slide.src);
  const isPrimary = index === 0;
  const preloadSoon = layout === "crossfade" && index === 1;
  const primaryQ = isMobile ? 74 : 78;
  const secondaryQ = isMobile ? 68 : 72;

  const frameClass =
    layout === "marquee"
      ? "cms-media-responsive-frame relative h-full shrink-0 overflow-hidden"
      : layout === "crossfade"
        ? "hero-crossfade-slide cms-media-responsive-frame absolute inset-0 overflow-hidden"
        : "cms-media-responsive-frame absolute inset-0 overflow-hidden";

  const frameStyle: CSSProperties | undefined =
    layout === "marquee"
      ? { flex: `0 0 ${100 / slideCount}%` }
      : layerStyle;

  return (
    <div className={frameClass} style={frameStyle}>
      {!showMedia ? (
        <div className="absolute inset-0 bg-[#050B18]" aria-hidden />
      ) : useNext ? (
        <Image
          src={slide.src}
          alt=""
          fill
          sizes={HERO_SLIDE_SIZES}
          draggable={false}
            priority={isPrimary || preloadSoon}
            quality={isPrimary ? primaryQ : secondaryQ}
            className="hero-bg-media cms-media-fit-anchor touch-manipulation select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]"
            style={imgStyle}
            decoding={isPrimary || preloadSoon ? "sync" : "async"}
            fetchPriority={isPrimary || preloadSoon ? "high" : "low"}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.src}
          alt=""
          width={HERO_IMG_BASELINE.width}
          height={HERO_IMG_BASELINE.height}
          draggable={false}
          className="hero-bg-media cms-media-fit-anchor absolute inset-0 h-full w-full touch-manipulation select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]"
          style={imgStyle}
          loading={isPrimary || preloadSoon ? "eager" : "lazy"}
          decoding={isPrimary || preloadSoon ? "sync" : "async"}
          fetchPriority={isPrimary || preloadSoon ? "high" : "low"}
        />
      )}
    </div>
  );
}

/**
 * Mobile: marquee transform. Desktop: crossfade opacity. Satu slide: statis.
 */
export function HeroBackgroundSlider({
  sources,
  initialViewportIsMobile,
}: HeroBackgroundSliderProps) {
  const isMobile = useCmsViewportIsMobile(initialViewportIsMobile);
  const slides = sources && sources.length > 0 ? sources : heroSlideSources;
  const count = slides.length;
  const useMobileMarquee = isMobile && count >= 2;
  const useDesktopCrossfade = !isMobile && count >= 2;
  const useSlideshow = useMobileMarquee || useDesktopCrossfade;
  const nonPrimaryMediaReady = useDeferNonPrimaryHeroSlides(
    count,
    useSlideshow,
    useDesktopCrossfade,
  );

  const preloadUrls = useMemo(
    () => (useDesktopCrossfade ? slides.slice(1).map((s) => s.src) : []),
    [slides, useDesktopCrossfade],
  );
  usePreloadHeroSlideUrls(preloadUrls, useDesktopCrossfade);

  const keyframesTag = useMemo(() => {
    if (count < 2) return null;
    const css = useDesktopCrossfade
      ? crossfadeKeyframesCss(count)
      : marqueeKeyframesCss(count);
    return <style dangerouslySetInnerHTML={{ __html: css }} />;
  }, [count, useDesktopCrossfade]);

  const durationMs = count * HERO_SLIDE_INTERVAL_MS;

  if (count === 0) return null;

  if (count === 1) {
    const slide = slides[0]!;
    return (
      <div
        className="hero-bg-root hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
        aria-hidden
      >
        <HeroSlideImage
          slide={slide}
          index={0}
          slideCount={1}
          isMobile={isMobile}
          showMedia
          layout="single"
        />
      </div>
    );
  }

  if (useDesktopCrossfade) {
    return (
      <>
        {keyframesTag}
        <div
          className="hero-bg-root hero-marquee-viewport hero-marquee-viewport--crossfade pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
          aria-hidden
        >
          <div className="hero-crossfade-stack relative h-full w-full">
            {slides.map((slide, i) => (
              <HeroSlideImage
                key={`${slide.src}-${i}`}
                slide={slide}
                index={i}
                slideCount={count}
                isMobile={isMobile}
                showMedia
                layout="crossfade"
                layerStyle={{
                  animation: `hero-crossfade-${count}-s${i} ${durationMs}ms linear infinite`,
                  zIndex: i,
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {keyframesTag}
      <div
        className="hero-bg-root hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#050B18]"
        aria-hidden
      >
        <div
          className="hero-marquee-track flex h-full"
          style={{
            width: `${count * 100}%`,
            animation: `hero-marquee-${count} ${durationMs}ms linear infinite`,
          }}
        >
          {slides.map((slide, i) => (
            <HeroSlideImage
              key={`${slide.src}-${i}`}
              slide={slide}
              index={i}
              slideCount={count}
              isMobile={isMobile}
              showMedia={i === 0 || nonPrimaryMediaReady}
              layout="marquee"
            />
          ))}
        </div>
      </div>
    </>
  );
}
