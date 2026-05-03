"use client";

import { useMemo } from "react";
import {
  HERO_SLIDE_INTERVAL_MS,
  heroSlideSources,
} from "@/components/aytipanel/hero-slider-config";

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
export function HeroBackgroundSlider() {
  const count = heroSlideSources.length;

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
    const slide = heroSlideSources[0];
    return (
      <div
        className="hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-neutral-950"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- asset /public */}
        <img
          src={slide.src}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    );
  }

  return (
    <>
      {keyframesTag}
      <div
        className="hero-marquee-viewport pointer-events-none absolute inset-0 z-0 overflow-hidden bg-neutral-950"
        aria-hidden
      >
        <div
          className="hero-marquee-track flex h-full"
          style={{
            width: `${count * 100}%`,
            animation: `hero-marquee-${count} ${durationMs}ms linear infinite`,
          }}
        >
          {heroSlideSources.map((slide, i) => (
            <div
              key={slide.src}
              className="relative h-full shrink-0 overflow-hidden"
              style={{ flex: `0 0 ${100 / count}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- asset /public */}
              <img
                src={slide.src}
                alt=""
                width={1920}
                height={1080}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
                fetchPriority={i === 0 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
