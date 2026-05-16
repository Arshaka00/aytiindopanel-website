"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SiteLoaderBrandCaptionStatic } from "@/components/common/site-loader-brand-caption-static";
import { siteLoaderBrandAriaLabel } from "@/lib/site-loader-brand-lines";

const LOADER_MARK_MOBILE_SRC = "/images/global-home-loader-mark-mobile.webp";

/** Jalur mobile / perangkat lemah: CSS opacity + WebP kecil, tanpa Framer Motion. */
export function GlobalLoaderLiteShell({
  revealMs,
  exitMs,
  onExitComplete,
}: {
  revealMs: number;
  exitMs: number;
  onExitComplete: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [barReady, setBarReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBarReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), revealMs);
    return () => clearTimeout(t);
  }, [revealMs]);

  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (!exiting || e.target !== rootRef.current || e.propertyName !== "opacity") return;
      onExitComplete();
    },
    [exiting, onExitComplete],
  );

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label={siteLoaderBrandAriaLabel()}
      className="ayti-global-document-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] isolate [contain:layout_paint]"
      style={{
        opacity: exiting ? 0 : 1,
        transition: `opacity ${exitMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: exiting ? "opacity" : undefined,
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="pointer-events-none flex max-w-[min(18rem,88vw)] flex-col items-center gap-5 text-center">
        <div className="relative flex size-[min(6.5rem,28vw)] shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- hindari pipeline optimasi Next pada cold start mobile */}
          <img
            src={LOADER_MARK_MOBILE_SRC}
            alt=""
            width={189}
            height={192}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-contain select-none"
            draggable={false}
          />
        </div>

        <SiteLoaderBrandCaptionStatic />

        <div className="relative h-px w-[min(10rem,72vw)] overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full origin-left rounded-full bg-sky-300/85"
            style={{
              transform: barReady ? "scaleX(0.92)" : "scaleX(0.06)",
              transition: barReady
                ? `transform ${revealMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
