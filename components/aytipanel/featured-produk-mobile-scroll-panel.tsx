"use client";

import type { ReactNode } from "react";

import {
  featuredMobileScrollFooterCopy,
  featuredMobileScrollHintCopy,
  featuredMobileTapHintLine,
  featuredMobileTapHintLineEnd,
  featuredMobileTapHintLabel,
} from "@/components/aytipanel/featured-category-layout";
import { MobileMeasuredReveal } from "@/components/common/mobile-measured-reveal";
import {
  MOBILE_HINT_CROSSFADE_RATIO,
  MOBILE_REVEAL_EASE,
  MOBILE_REVEAL_HEIGHT_COLLAPSE_MS,
  MOBILE_REVEAL_HEIGHT_EXPAND_MS,
} from "@/lib/mobile-reveal-constants";

/** Panel detail mobile scroll — timing organik selaras section Layanan. */
export function FeaturedProdukMobileScrollPanel({
  expanded,
  prefersReducedMotion,
  headingId,
  panelId,
  contentVersion,
  children,
}: {
  expanded: boolean;
  prefersReducedMotion: boolean;
  headingId: string;
  panelId: string;
  contentVersion: string;
  children: ReactNode;
}) {
  const hintGridMs = expanded ? MOBILE_REVEAL_HEIGHT_COLLAPSE_MS : MOBILE_REVEAL_HEIGHT_EXPAND_MS;

  return (
    <>
      <div
        className={`grid min-h-0 overflow-hidden ${expanded ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        aria-hidden={expanded}
        style={
          prefersReducedMotion
            ? undefined
            : {
                transition: `grid-template-rows ${hintGridMs}ms ${MOBILE_REVEAL_EASE}, opacity ${Math.round(hintGridMs * MOBILE_HINT_CROSSFADE_RATIO)}ms ${MOBILE_REVEAL_EASE}`,
                opacity: expanded ? 0 : 1,
              }
        }
      >
        <div className="min-h-0 overflow-hidden">
          <p className="m-0 mt-2 flex w-full min-w-0 items-center justify-center gap-2 px-0.5">
            <span className={featuredMobileTapHintLine} aria-hidden />
            <span className={featuredMobileTapHintLabel}>{featuredMobileScrollHintCopy}</span>
            <span className={featuredMobileTapHintLineEnd} aria-hidden />
          </p>
        </div>
      </div>

      <MobileMeasuredReveal
        variant="stagger"
        expanded={expanded}
        panelId={panelId}
        labelledBy={headingId}
        prefersReducedMotion={prefersReducedMotion}
        contentVersion={contentVersion}
      >
        <div
          className="premium-reveal-stage premium-reveal-stage--1 mx-auto mt-3 h-px w-full max-w-[min(100%,14rem)] rounded-full bg-gradient-to-r from-transparent via-sky-500/28 to-transparent dark:via-sky-400/24"
          aria-hidden
        />
        <div className="premium-reveal-stage premium-reveal-stage--2 mt-3 space-y-3 border-t border-border pt-3 pb-0 dark:border-white/12">
          {children}
        </div>
        <div className="premium-reveal-stage premium-reveal-stage--3 border-t border-border/65 px-0.5 pb-0.5 pt-4 dark:border-white/12">
          <p className="m-0 flex w-full min-w-0 items-center justify-center gap-2">
            <span className={featuredMobileTapHintLine} aria-hidden />
            <span className={`${featuredMobileTapHintLabel} text-sky-600/90 dark:text-sky-300/88`}>
              {featuredMobileScrollFooterCopy}
            </span>
            <span className={featuredMobileTapHintLineEnd} aria-hidden />
          </p>
        </div>
      </MobileMeasuredReveal>
    </>
  );
}
