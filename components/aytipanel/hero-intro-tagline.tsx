"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

/** Varian acak; nama sama dipetakan ke keyframes berbeda per breakpoint di globals.css */
const TAGLINE_VARIANTS = [
  "rise",
  "arc",
  "sweep-l",
  "sweep-r",
  "vault",
] as const;

export type HeroIntroTaglineVariant = (typeof TAGLINE_VARIANTS)[number];

type TaglineAnimParams = {
  variant: HeroIntroTaglineVariant;
  delayMs: number;
  durationMs: number;
};

function pickRandomParams(): TaglineAnimParams {
  return {
    variant:
      TAGLINE_VARIANTS[
        Math.floor(Math.random() * TAGLINE_VARIANTS.length)
      ]!,
    delayMs: 16 + Math.floor(Math.random() * 100),
    durationMs: 620 + Math.floor(Math.random() * 220),
  };
}

/** Arah & jumlah putaran acak tiap tap (seluruh transform, aman di WebKit mobile) */
const SPIN_DIRECTIONS = ["cw", "ccw", "2cw", "2ccw"] as const;

export type HeroIntroTaglineSpinDir = (typeof SPIN_DIRECTIONS)[number];

function pickRandomSpinDir(): HeroIntroTaglineSpinDir {
  return SPIN_DIRECTIONS[
    Math.floor(Math.random() * SPIN_DIRECTIONS.length)
  ]!;
}

function clearSpinClasses(el: HTMLElement) {
  el.classList.remove("hero-intro-tagline-spin-active");
  for (const d of SPIN_DIRECTIONS) {
    el.classList.remove(`hero-intro-tagline-spin--${d}`);
  }
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Bungkus tagline hero: varian animasi acak + durasi/delay halus (premium).
 * Mobile/tablet: hanya transform di keyframes (WebKit aman).
 * Desktop: keyframes terpisah + blur ringan.
 */
export function HeroIntroTagline({ children, className = "" }: Props) {
  const cms = useSiteCmsOptional();
  const cmsEditActive = Boolean(cms?.eligible && cms.editMode);
  const reduceMotion = usePrefersReducedMotion();
  const [params, setParams] = useState<TaglineAnimParams | null>(null);
  const spinTargetRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduceMotion) {
      setParams(null);
      return;
    }
    setParams(pickRandomParams());
  }, [reduceMotion]);

  const runTouchSpin = useCallback(() => {
    if (reduceMotion || cmsEditActive) return;
    const el = spinTargetRef.current;
    if (!el) return;
    clearSpinClasses(el);
    void el.offsetWidth;
    const dir = pickRandomSpinDir();
    const durMs = 600 + Math.floor(Math.random() * 220);
    el.style.setProperty("--tagline-spin-dur", `${durMs}ms`);
    el.classList.add(
      "hero-intro-tagline-spin-active",
      `hero-intro-tagline-spin--${dir}`,
    );
  }, [cmsEditActive, reduceMotion]);

  const onSpinAnimationEnd = useCallback((e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const el = spinTargetRef.current;
    if (!el) return;
    if (!e.animationName?.includes("hero-intro-tagline-touch-spin")) return;
    clearSpinClasses(el);
    el.style.removeProperty("--tagline-spin-dur");
  }, []);

  const ready = Boolean(params) && !reduceMotion;
  const variantClass = ready
    ? `hero-intro-tagline-wrap--${params!.variant}`
    : "";

  const cssVars: CSSProperties | undefined =
    ready && params
      ? {
          ["--tagline-enter-delay" as string]: `${params.delayMs}ms`,
          ["--tagline-enter-dur" as string]: `${params.durationMs}ms`,
        }
      : undefined;

  return (
    <div
      data-tagline-ready={ready ? "1" : undefined}
      style={cssVars}
      className={`hero-intro-tagline-wrap ${variantClass}`.trim()}
    >
      <div
        ref={spinTargetRef}
        className={`hero-intro-tagline-chrome touch-manipulation select-text ${cmsEditActive ? "cursor-text" : "cursor-pointer"} ${className}`.trim()}
        style={{ WebkitTapHighlightColor: "transparent" }}
        role={cmsEditActive ? undefined : "button"}
        tabIndex={cmsEditActive || reduceMotion ? -1 : 0}
        aria-label={cmsEditActive ? undefined : "Ketuk atau klik untuk memutar kutipan secara acak"}
        onClick={cmsEditActive ? undefined : runTouchSpin}
        onAnimationEnd={onSpinAnimationEnd}
        onKeyDown={
          cmsEditActive || reduceMotion
            ? undefined
            : (e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                runTouchSpin();
              }
        }
      >
        {children}
      </div>
    </div>
  );
}
