"use client";

import { useLayoutEffect, useRef, useState } from "react";

import {
  MOBILE_CONTENT_STAGGER_MS,
  MOBILE_ENTER_OFFSET_PX,
  MOBILE_INNER_OPACITY_RATIO,
  MOBILE_REVEAL_EASE,
  MOBILE_REVEAL_HEIGHT_COLLAPSE_MS,
  MOBILE_REVEAL_HEIGHT_EXPAND_MS,
  MOBILE_REVEAL_OPACITY_COLLAPSE_MS,
} from "@/lib/mobile-reveal-constants";

export type MobileMeasuredRevealVariant = "uniform" | "stagger";

export function MobileMeasuredReveal({
  expanded,
  panelId,
  labelledBy,
  prefersReducedMotion,
  contentVersion,
  children,
  variant = "uniform",
}: {
  expanded: boolean;
  panelId: string;
  labelledBy: string;
  prefersReducedMotion: boolean;
  contentVersion: string;
  children: React.ReactNode;
  /** `stagger`: tanpa fade pada wrapper — pakai `.premium-reveal-stage` di dalam (Layanan / Featured). */
  variant?: MobileMeasuredRevealVariant;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [fullHeightPx, setFullHeightPx] = useState(0);
  const heightPx = expanded ? fullHeightPx : 0;

  const heightMs = expanded ? MOBILE_REVEAL_HEIGHT_EXPAND_MS : MOBILE_REVEAL_HEIGHT_COLLAPSE_MS;
  const innerOpacityExpandMs = Math.round(MOBILE_REVEAL_HEIGHT_EXPAND_MS * MOBILE_INNER_OPACITY_RATIO);
  const innerOpacityMs = expanded ? innerOpacityExpandMs : MOBILE_REVEAL_OPACITY_COLLAPSE_MS;
  const innerTransformMs = expanded ? MOBILE_REVEAL_HEIGHT_EXPAND_MS : MOBILE_REVEAL_HEIGHT_COLLAPSE_MS;

  useLayoutEffect(() => {
    if (!expanded) return;
    const el = measureRef.current;
    if (!el) return;
    queueMicrotask(() => {
      const node = measureRef.current;
      if (!node) return;
      setFullHeightPx(node.scrollHeight);
    });
  }, [expanded, contentVersion]);

  useLayoutEffect(() => {
    if (!expanded) return;
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFullHeightPx(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, contentVersion]);

  const outerTransition = prefersReducedMotion
    ? { height: heightPx }
    : {
        height: heightPx,
        transition: `height ${heightMs}ms ${MOBILE_REVEAL_EASE}`,
      };

  const uniformInnerStyle =
    variant === "uniform" && !prefersReducedMotion
      ? {
          opacity: expanded ? 1 : 0,
          transform: expanded ? "translate3d(0,0,0)" : `translate3d(0, -${MOBILE_ENTER_OFFSET_PX}px, 0)`,
          transition: `opacity ${innerOpacityMs}ms ${MOBILE_REVEAL_EASE}, transform ${innerTransformMs}ms ${MOBILE_REVEAL_EASE}`,
          transitionDelay: expanded ? `${MOBILE_CONTENT_STAGGER_MS}ms` : "0ms",
        }
      : prefersReducedMotion && variant === "uniform"
        ? { opacity: expanded ? 1 : 0 }
        : undefined;

  return (
    <div
      className="group/reveal mobile-measured-reveal overflow-hidden pointer-events-auto [contain:content]"
      data-expanded={expanded ? "true" : "false"}
      style={outerTransition}
      aria-hidden={!expanded}
    >
      <div
        ref={measureRef}
        id={panelId}
        role="region"
        aria-labelledby={labelledBy}
        inert={!expanded}
        className={`transform-gpu [backface-visibility:hidden] ${variant === "stagger" ? "mobile-measured-reveal-inner--stagger" : ""}`}
        style={uniformInnerStyle}
      >
        {children}
      </div>
    </div>
  );
}
