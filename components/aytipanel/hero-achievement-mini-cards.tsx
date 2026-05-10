"use client";

import { useEffect, useRef, useState } from "react";
import {
  parseStatValue,
  StatCountUp,
  type HeroStatItem,
} from "@/components/aytipanel/hero-stats-strip";
import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

const AREA_LABEL = "Area Layanan";

/** Variasi animasi acak per kartu saat jeda + jeda baca sebelum marquee lagi */
const SHOWCASE_DISPLAY_MS = 4000;

const SHOWCASE_VARIANTS = [
  "pop",
  "rise",
  "in-left",
  "in-right",
  "zoom",
  "tilt",
  "bounce",
] as const;

type ShowcaseVariant = (typeof SHOWCASE_VARIANTS)[number];

type ShowcaseCardPlan = {
  variant: ShowcaseVariant;
  delayMs: number;
  durationMs: number;
};

function randomShowcasePlan(length: number): ShowcaseCardPlan[] {
  return Array.from({ length }, () => ({
    variant:
      SHOWCASE_VARIANTS[Math.floor(Math.random() * SHOWCASE_VARIANTS.length)]!,
    delayMs: Math.floor(Math.random() * 180),
    durationMs: 460 + Math.floor(Math.random() * 280),
  }));
}

type Props = {
  items: readonly HeroStatItem[];
};

/** Beda dari kartu “Proses kerja”: aksen sky, tanpa glass hitam yang sama. */
const cardShell = mergeAytiCardClass(
  "flex min-h-0 w-[9rem] shrink-0 flex-col items-center justify-start rounded-md border border-[#59D8FF]/35 bg-gradient-to-b from-[#0A1D3E]/62 via-[#081327]/82 to-[#050B18]/92 px-2 py-2 text-center shadow-[inset_0_1px_0_rgba(245,247,255,0.12),0_10px_28px_-16px_rgba(3,14,34,0.55)] backdrop-blur-[8px] sm:w-[9.5rem] sm:rounded-lg sm:px-2 sm:py-2 md:w-[10rem] md:py-2.5",
);

/** Padding horizontal strip — kartu tidak menempel ke tepi mask */
const stripChrome = mergeAytiCardClass(
  "hero-achievement-marquee-viewport relative overflow-hidden rounded-xl border border-[#59D8FF]/24 bg-gradient-to-r from-[#071126]/58 via-[#0A1B39]/42 to-[#071126]/58 px-3 py-2 shadow-[0_0_48px_-20px_rgba(89,216,255,0.2),inset_0_1px_0_rgba(245,247,255,0.08)] sm:px-4 sm:py-2.5",
);

const listRow =
  "m-0 flex w-max list-none gap-3 p-0 sm:gap-3.5 md:gap-4 pr-3 sm:pr-3.5 md:pr-4";

const showcaseGrid =
  "hero-achievement-showcase-grid m-0 grid w-full max-w-full list-none grid-cols-2 justify-items-center gap-3 p-0 sm:grid-cols-4 sm:gap-3.5 md:gap-4";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function AchievementCardBody({
  item,
  countUp = false,
  countDelayMs = 0,
}: {
  item: HeroStatItem;
  countUp?: boolean;
  countDelayMs?: number;
}) {
  const isArea = item.label === AREA_LABEL;
  if (isArea) {
    return (
      <div className="flex w-full flex-col items-center gap-1">
        <p className="max-w-[9rem] text-[0.59375rem] font-semibold leading-snug tracking-[0.018em] text-sky-50 sm:max-w-[10rem] sm:text-[0.625rem] md:max-w-[11rem] md:text-[0.6875rem]">
          {item.label}
        </p>
        <p className="max-w-[9.5rem] text-[0.5625rem] leading-[1.42] text-sky-100/72 sm:text-[0.59375rem] md:max-w-[11.5rem] md:text-[0.625rem] md:leading-snug">
          {item.hint}
        </p>
        <div className="relative mt-px w-full max-w-[2.75rem] sm:max-w-[3rem] md:max-w-[3.5rem]">
          <SiteCopyrightImagePreview
            src="/images/peta_indonesia.png"
            alt="Peta Indonesia — jangkauan layanan nasional"
            fill={false}
            width={700}
            height={350}
            buttonClassName="w-full"
            imageClassName="h-auto w-full object-contain object-center opacity-[0.92]"
            sizes="(max-width: 767px) 44px, 56px"
          />
        </div>
      </div>
    );
  }
  const parsed = parseStatValue(item.value);
  return (
    <div className="flex w-full flex-col items-center gap-0.5 sm:gap-1">
      {item.value ? (
        <p className="text-[clamp(0.9375rem,2.8vw,1.1875rem)] font-semibold tabular-nums tracking-tight text-sky-200 sm:text-xl md:text-[1.35rem]">
          {countUp && parsed.kind === "count" ? (
            <StatCountUp end={parsed.end} delayMs={countDelayMs} />
          ) : (
            item.value
          )}
        </p>
      ) : null}
      <p className="max-w-[9rem] text-[0.59375rem] font-semibold leading-snug tracking-[0.018em] text-sky-50 sm:max-w-[10rem] sm:text-[0.625rem] md:max-w-[11rem] md:text-[0.6875rem]">
        {item.label}
      </p>
      <p className="max-w-[9.5rem] text-[0.5625rem] leading-[1.42] text-sky-100/70 sm:text-[0.59375rem] md:max-w-[11.5rem] md:text-[0.625rem] md:leading-snug">
        {item.hint}
      </p>
    </div>
  );
}

export function HeroAchievementMiniCards({ items }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"marquee" | "showcase">("marquee");
  const [marqueeCycle, setMarqueeCycle] = useState(0);
  const [showcasePlan, setShowcasePlan] = useState<ShowcaseCardPlan[] | null>(
    null,
  );
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion || phase !== "marquee") return;
    const el = trackRef.current;
    if (!el) return;

    const onIter = () => {
      setShowcasePlan(randomShowcasePlan(items.length));
      setPhase("showcase");
    };
    el.addEventListener("animationiteration", onIter);
    return () => el.removeEventListener("animationiteration", onIter);
  }, [phase, reduceMotion, marqueeCycle, items.length]);

  useEffect(() => {
    if (phase !== "showcase" || reduceMotion) return;
    const id = window.setTimeout(() => {
      setShowcasePlan(null);
      setPhase("marquee");
      setMarqueeCycle((c) => c + 1);
    }, SHOWCASE_DISPLAY_MS);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion]);

  const viewportMods =
    phase === "showcase" ? "hero-achievement-marquee-viewport--showcase" : "";

  return (
    <div
      className={`${stripChrome} ${viewportMods} -mx-1 w-[calc(100%+0.5rem)] sm:mx-0 sm:w-full`}
    >
      {phase === "marquee" ? (
        <div
          ref={trackRef}
          key={marqueeCycle}
          className="hero-achievement-marquee-track hero-achievement-marquee-track--running flex w-max"
        >
          <ul className={listRow} aria-label="Ringkasan pencapaian dan jangkauan layanan">
            {items.map((item) => (
              <li key={item.label} className={cardShell}>
                <AchievementCardBody item={item} />
              </li>
            ))}
          </ul>
          <ul className={listRow} aria-hidden="true">
            {items.map((item) => (
              <li key={`${item.label}-marquee-dup`} className={cardShell}>
                <AchievementCardBody item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul
          className={showcaseGrid}
          aria-label="Ringkasan pencapaian dan jangkauan layanan"
        >
          {items.map((item, index) => {
            const plan = showcasePlan?.[index];
            const variant = plan?.variant ?? "pop";
            return (
              <li
                key={item.label}
                className={`hero-achievement-showcase-card hero-achievement-showcase-card--${variant} ${cardShell}`}
                style={{
                  animationDelay: plan ? `${plan.delayMs}ms` : undefined,
                  animationDuration: plan ? `${plan.durationMs}ms` : undefined,
                }}
              >
                <AchievementCardBody
                  item={item}
                  countUp
                  countDelayMs={plan?.delayMs ?? 0}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
