"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";

// ——— Data shape (isi dari section-top: heroAchievementStats) ———

export type HeroStatItem = {
  value: string;
  label: string;
  hint: string;
};

const AREA_LABEL = "Area Layanan";

// ——— Layout / typography tokens (sesuaikan dengan `.hero-stats-section` di globals.css) ———

const wrapClass =
  "relative mx-auto max-w-6xl w-full px-2.5 max-md:ps-[max(0.625rem,env(safe-area-inset-left,0px))] max-md:pe-[max(0.625rem,env(safe-area-inset-right,0px))] sm:px-0";

const shellClass =
  "hero-stats-tiles-shell rounded-[1rem] border border-white/12 bg-[linear-gradient(160deg,rgba(8,10,14,0.82),rgba(12,14,20,0.76))] p-1.5 shadow-[inset_0_1px_0_rgba(245,247,255,0.08),0_24px_48px_-28px_rgba(0,0,0,0.55)] backdrop-blur-[14px] md:contents md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none";

const gridClass =
  "hero-stats-tiles grid grid-cols-2 items-stretch gap-2 sm:gap-3 md:grid-cols-4 md:gap-4 lg:gap-5";

const labelClass =
  "card-stats__label w-full max-w-[min(100%,9.25rem)] text-[0.65625rem] font-semibold leading-snug tracking-[0.028em] text-balance text-center hyphens-auto max-md:max-w-[min(100%,9.5rem)] max-md:text-[0.625rem] max-md:font-semibold max-md:leading-[1.35] max-md:tracking-[0.02em] sm:max-w-[12rem] sm:text-[0.6875rem] sm:font-medium sm:tracking-wide md:max-w-[13rem] md:text-sm md:font-semibold lg:text-[0.9375rem]";

const hintClass =
  "card-stats__hint w-full max-w-[min(100%,9.25rem)] text-[10px] font-normal leading-[1.48] tracking-[0.01em] text-pretty hyphens-auto max-md:max-w-[min(100%,9.5rem)] max-md:text-[0.59375rem] max-md:leading-[1.45] max-md:tracking-[0.006em] sm:max-w-[12rem] sm:text-[0.6875rem] sm:leading-snug md:max-w-[13rem] md:text-xs md:leading-snug lg:text-sm";

const valueClass =
  "card-stats__value stats-number min-h-[1em] text-[clamp(1.0625rem,3.9vmin,1.25rem)] font-semibold tabular-nums tracking-tight leading-[1.05] text-[#F1F5F9] [text-shadow:0_0_14px_rgba(255,255,255,0.1)] antialiased max-md:min-h-[1.05em] max-md:font-semibold max-md:tracking-tight max-md:text-[clamp(0.875rem,4vw,1.0625rem)] max-md:leading-[1.02] [@media(max-width:767px)_and_(orientation:landscape)]:text-[clamp(0.75rem,3.4vw,0.9375rem)] sm:text-[1.5rem] md:text-[2.125rem] lg:text-4xl";

function tileSurfaceClass(isArea: boolean) {
  return [
    "card-stats-tile group relative flex min-h-0 min-w-0 flex-col items-center overflow-hidden rounded-xl px-2.5 py-2 text-center motion-safe:transition-[box-shadow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] after:pointer-events-none after:absolute after:inset-x-2.5 after:top-0 after:z-[1] after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/23 after:to-transparent max-md:px-1.5 max-md:py-1.5 max-md:rounded-[10px] max-md:after:inset-x-1.5 sm:px-3 sm:py-2.5 sm:after:inset-x-3 md:min-h-0 md:px-4 md:py-3 md:after:inset-x-4 md:after:via-white/25 lg:py-3.5",
    "bg-[linear-gradient(165deg,rgba(10,12,18,0.88),rgba(5,8,12,0.92))] ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(245,247,255,0.08),0_14px_30px_-20px_rgba(0,0,0,0.65)]",
    isArea ? "min-w-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

// ——— Angka & parsing ———

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function parseStatValue(value: string): { kind: "count"; end: number } | { kind: "text" } {
  const normalized = value.trim().replace(/\uFF0B/g, "+").replace(/\s+/g, "");
  const m = /^(\d+)\+$/.exec(normalized);
  if (m) return { kind: "count", end: Number(m[1]) };
  return { kind: "text" };
}

export function StatCountUp({ end, delayMs }: { end: number; delayMs: number }) {
  const [display, setDisplay] = useState(end);

  useEffect(() => {
    let reducedMotion = false;
    try {
      reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reducedMotion = false;
    }

    if (reducedMotion) {
      queueMicrotask(() => setDisplay(end));
      return;
    }

    const durationMs = 1350;
    let cancelled = false;
    let intervalId: number | undefined;

    queueMicrotask(() => {
      if (!cancelled) setDisplay(0);
    });

    const startDelayId = window.setTimeout(() => {
      const t0 = performance.now();
      intervalId = window.setInterval(() => {
        if (cancelled) return;
        const elapsed = performance.now() - t0;
        const t = Math.min(1, elapsed / durationMs);
        setDisplay(Math.round(end * easeOutCubic(t)));
        if (t >= 1) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          intervalId = undefined;
          setDisplay(end);
        }
      }, 1000 / 30) as unknown as number;
    }, delayMs) as unknown as number;

    const safetyId = window.setTimeout(() => {
      if (!cancelled) setDisplay(end);
    }, delayMs + durationMs + 600) as unknown as number;

    return () => {
      cancelled = true;
      window.clearTimeout(startDelayId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
      window.clearTimeout(safetyId);
    };
  }, [end, delayMs]);

  return (
    <span className="tabular-nums tracking-tight" aria-live="polite">
      {display}+
    </span>
  );
}

// ——— prefers-reduced-motion ———

function subscribePrefersReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getPrefersReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotionMedia(): boolean {
  return useSyncExternalStore(subscribePrefersReducedMotion, getPrefersReducedMotionSnapshot, () => false);
}

// ——— Isi kartu ———

function AreaStatInner({ item }: { item: HeroStatItem }) {
  return (
    <div className="stats-number flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-y-0.5 py-0 max-md:max-w-none max-md:gap-y-1 md:h-auto md:max-w-[10rem] md:flex-none md:justify-start md:gap-y-1 md:py-0">
      <p className={`${labelClass} shrink-0`}>{item.label}</p>
      <p className={`${hintClass} shrink-0 text-center`}>{item.hint}</p>
      <div className="card-stats-area-map relative mt-0.5 w-full max-w-[3.25rem] shrink-0 sm:max-w-[3.75rem] md:mt-1 md:max-w-[4.5rem]">
        <SiteCopyrightImagePreview
          src="/images/peta_indonesia.png"
          alt="Peta Indonesia — jangkauan layanan nasional"
          fill={false}
          width={700}
          height={350}
          buttonClassName="w-full"
          imageClassName="h-auto w-full object-contain object-center opacity-[0.92]"
          sizes="(max-width: 767px) 52px, 72px"
        />
      </div>
    </div>
  );
}

function NumericStatInner({ item, countDelayMs }: { item: HeroStatItem; countDelayMs: number }) {
  const parsed = parseStatValue(item.value);
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-y-1 max-md:gap-y-0.5 md:h-auto md:flex-none md:justify-start md:gap-y-0">
      <p className={`${valueClass} shrink-0`}>
        {parsed.kind === "count" ? (
          <StatCountUp end={parsed.end} delayMs={countDelayMs} />
        ) : (
          item.value
        )}
      </p>
      <div className="flex w-full flex-col items-center gap-y-0.5 max-md:gap-y-0.5 md:gap-y-0">
        <p className={`mt-0 md:mt-1.5 ${labelClass}`}>{item.label}</p>
        <p className={`md:mt-1 ${hintClass}`}>{item.hint}</p>
      </div>
    </div>
  );
}

// ——— Kartu gelas ———

function HeroStatCard({
  item,
  index,
  prefersReducedMotion,
}: {
  item: HeroStatItem;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const isArea = item.label === AREA_LABEL;
  return (
    <div
      className={`${tileSurfaceClass(isArea)} touch-manipulation motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 motion-safe:active:-translate-y-1`}
    >
      {!prefersReducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] origin-right scale-x-0 bg-gradient-to-l from-white/[0.18] via-white/[0.08] to-transparent opacity-0 motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-hover:opacity-100 max-md:hidden"
        />
      ) : null}
      <div className="relative z-[2] flex min-h-0 w-full flex-1 flex-col items-center max-md:justify-start md:flex-none md:justify-start">
        {isArea ? (
          <AreaStatInner item={item} />
        ) : (
          <NumericStatInner item={item} countDelayMs={index * 130} />
        )}
      </div>
    </div>
  );
}

// ——— Section ———

const sectionClassName =
  "hero-stats-section relative z-30 -mt-12 px-0 pb-5 pt-0 max-md:-mt-10 max-md:pb-3 [@media(max-width:767px)_and_(orientation:landscape)]:-mt-6 [@media(max-width:767px)_and_(orientation:landscape)]:pb-2 [@media(orientation:landscape)_and_(max-height:520px)_and_(max-width:1023px)]:-mt-6 [@media(orientation:landscape)_and_(max-height:520px)_and_(max-width:1023px)]:pb-2 sm:-mt-14 sm:px-5 sm:pb-6 sm:pt-2 md:-mt-16 md:px-6 md:pb-10 md:pt-5";

export function HeroStatsStrip({ items }: { items: readonly HeroStatItem[] }) {
  const prefersReducedMotion = usePrefersReducedMotionMedia();

  return (
    <section className={sectionClassName} aria-label="Ringkasan pencapaian">
      <div className={wrapClass}>
        <div className={shellClass}>
          <div className={gridClass}>
            {items.map((item, index) => (
              <HeroStatCard
                key={item.label}
                item={item}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
