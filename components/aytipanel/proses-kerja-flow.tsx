import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import { PROSES_KERJA_STEPS } from "@/components/aytipanel/proses-kerja-data";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

/** Ikon hero: glow kuat + bayangan dalam untuk kesan “power” di atas background gelap. */
const HERO_STEP_GLYPH_TONE = [
  "text-sky-100 drop-shadow-[0_0_16px_rgba(56,189,248,0.55)] drop-shadow-[0_2px_8px_rgba(2,10,28,0.75)]",
  "text-cyan-100 drop-shadow-[0_0_16px_rgba(34,211,238,0.5)] drop-shadow-[0_2px_8px_rgba(2,10,28,0.75)]",
  "text-sky-50 drop-shadow-[0_0_14px_rgba(186,230,253,0.42)] drop-shadow-[0_2px_8px_rgba(2,10,28,0.72)]",
  "text-teal-100 drop-shadow-[0_0_16px_rgba(45,212,191,0.48)] drop-shadow-[0_2px_8px_rgba(2,10,28,0.72)]",
  "text-emerald-200 drop-shadow-[0_0_18px_rgba(110,231,183,0.55)] drop-shadow-[0_2px_8px_rgba(2,12,24,0.78)]",
] as const;

/** Kartu ikon hero: border + ring + shadow berwarna per tahap (premium, cohesive dengan palet alur). */
const HERO_STEP_SHELL_ACCENT = [
  "border-sky-400/38 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_32px_-6px_rgba(56,189,248,0.42),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-sky-400/35 md:hover:border-sky-200/45 md:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.92),0_0_44px_-4px_rgba(56,189,248,0.5)]",
  "border-cyan-400/34 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_30px_-6px_rgba(34,211,238,0.38),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-cyan-400/30 md:hover:border-cyan-200/42 md:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.92),0_0_40px_-4px_rgba(34,211,238,0.48)]",
  "border-sky-200/32 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_28px_-6px_rgba(125,211,252,0.32),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-sky-200/28 md:hover:border-white/35 md:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.92),0_0_36px_-4px_rgba(125,211,252,0.4)]",
  "border-teal-400/38 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_30px_-6px_rgba(45,212,191,0.4),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-teal-400/32 md:hover:border-teal-200/45 md:hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.92),0_0_42px_-4px_rgba(45,212,191,0.48)]",
  "border-emerald-400/45 shadow-[0_16px_44px_-12px_rgba(0,0,0,0.94),0_0_36px_-6px_rgba(52,211,153,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-inset ring-emerald-400/38 md:hover:border-emerald-200/48 md:hover:shadow-[0_20px_48px_-12px_rgba(0,0,0,0.94),0_0_48px_-4px_rgba(52,211,153,0.55)]",
] as const;

type ProsesKerjaFlowVariant = "light" | "hero";

type ProsesKerjaFlowProps = {
  variant: ProsesKerjaFlowVariant;
  /** Extra class on the root `<ol>` (spacing, width). */
  className?: string;
  /** Visually hidden heading for the step list (a11y). */
  "aria-labelledby"?: string;
};

export function ProsesKerjaFlow({ variant, className = "", "aria-labelledby": ariaLabelledby }: ProsesKerjaFlowProps) {
  const isHero = variant === "hero";

  const olClass = isHero
    ? "mx-auto grid w-full min-w-0 max-w-none grid-cols-5 items-start justify-items-center gap-x-0.5 gap-y-1.5 pt-0 pb-px sm:gap-x-1 sm:gap-y-2 sm:pt-2 sm:pb-0 md:gap-x-2 md:gap-y-2 md:pt-2 lg:gap-3 lg:pt-1"
    : "mx-auto max-w-md space-y-0 pt-2 lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-5 lg:gap-3 lg:pt-1";

  const liClass = isHero
    ? "relative flex min-w-0 w-full max-w-[5.2rem] flex-col items-center gap-1 pb-0 text-center max-sm:gap-0.5 sm:max-w-[6rem] md:max-w-none lg:gap-0 lg:px-2"
    : "relative flex flex-row items-start gap-4 pb-8 text-left last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-2 lg:pb-0 lg:text-center";

  const connectorMobileWrapClass =
    "proses-flow-connector proses-flow-connector--light-v pointer-events-none absolute bottom-0 left-[23px] top-12 z-0 block w-0.5 lg:hidden";

  const connectorMobileLineClass =
    "proses-flow-line proses-flow-line--light-v absolute inset-x-0 inset-y-0 rounded-full";

  const iconShellHeroBase =
    "relative inline-flex size-[2.6875rem] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-solid bg-gradient-to-br from-white/[0.2] via-white/[0.08] to-[#030818]/95 motion-safe:active:scale-[0.96] md:size-12 md:motion-safe:hover:-translate-y-1 md:rounded-xl md:transition-[transform,box-shadow,border-color] md:duration-300 md:ease-out";

  const iconShellClassLight =
    "relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card text-accent shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color,background-color] duration-[340ms] [transition-timing-function:var(--ease-premium-soft)] md:motion-safe:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-card-hover)] lg:h-11 lg:w-11";

  const iconFocusClass = isHero
    ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    : "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const iconGlyphClass = isHero
    ? "h-[1.0625rem] w-[1.0625rem] shrink-0 sm:h-[1.125rem] sm:w-[1.125rem] md:h-5 md:w-5"
    : "h-6 w-6 shrink-0 lg:h-5 lg:w-5";

  const heroGlyphToneAt = (index: number) =>
    HERO_STEP_GLYPH_TONE[Math.min(index, HERO_STEP_GLYPH_TONE.length - 1)]!;

  const heroShellAccentAt = (index: number) =>
    HERO_STEP_SHELL_ACCENT[Math.min(index, HERO_STEP_SHELL_ACCENT.length - 1)]!;

  const stepLabelClass = isHero
    ? "sr-only"
    : "text-[11px] font-semibold uppercase tracking-wider text-muted lg:hidden";

  const stepTitleClass = isHero
    ? "line-clamp-3 min-h-[2.375rem] w-full max-w-[5.125rem] text-[0.625rem] font-semibold leading-[1.3] tracking-[0.015em] text-balance text-white [text-shadow:0_1px_16px_rgba(2,8,24,0.95),0_0_28px_rgba(255,255,255,0.07)] sm:max-w-[5.5rem] sm:text-[0.6875rem] sm:leading-snug md:max-w-[6.75rem] md:text-xs md:font-bold lg:mt-3 lg:min-h-0 lg:max-w-none lg:text-sm max-md:min-h-[2rem] max-md:leading-[1.28]"
    : "text-base font-semibold leading-snug text-foreground lg:mt-3 lg:text-sm";

  const connectorDesktopWrapClass = isHero
    ? "proses-flow-connector proses-flow-connector--hero-h pointer-events-none absolute left-[calc(50%+1.5rem)] top-6 z-0 hidden h-0.5 -translate-y-1/2 lg:block lg:w-[calc(100%-3rem+0.75rem)]"
    : "proses-flow-connector proses-flow-connector--light-h pointer-events-none absolute left-[calc(50%+1.375rem)] top-[22px] z-0 hidden h-0.5 -translate-y-1/2 lg:block lg:w-[calc(100%-2.75rem+0.75rem)]";

  const connectorDesktopLineClass = isHero
    ? "proses-flow-line proses-flow-line--hero-h absolute inset-y-0 left-0 right-0"
    : "proses-flow-line proses-flow-line--light-h absolute inset-y-0 left-0 right-0";

  const connectorDesktopArrowClass = isHero ? "proses-flow-arrow-march--hero-h" : "proses-flow-arrow-march--light-h";

  const connectorHeroMobileWrapClass =
    "proses-flow-connector proses-flow-connector--hero-h pointer-events-none absolute left-[calc(50%+1.34375rem)] top-[1.34375rem] z-0 h-px w-[calc(100%-2.6875rem+10px)] -translate-y-1/2 md:left-[calc(50%+1.5rem)] md:top-6 md:h-0.5 md:w-[calc(100%-3rem+0.375rem)] lg:hidden";

  const connectorHeroMobileLineClass =
    "proses-flow-line proses-flow-line--hero-h absolute inset-y-0 left-0 right-0";

  return (
    <ol
      className={`${olClass} ${className}`.trim()}
      aria-labelledby={ariaLabelledby}
    >
      {PROSES_KERJA_STEPS.map((step, index) => {
        const Icon = step.Icon;
        const isLast = index === PROSES_KERJA_STEPS.length - 1;
        const stepNo = index + 1;
        return (
          <li key={step.slug} className={liClass}>
            {!isLast && !isHero ? (
              <span className={connectorMobileWrapClass} aria-hidden>
                <span className={connectorMobileLineClass} />
                <span className="proses-flow-arrow-march--light-v" />
              </span>
            ) : null}

            <div className="relative z-10 mx-auto flex w-full justify-center lg:flex lg:w-full lg:flex-col lg:items-center">
              <InternalDetailNavLink
                href={`/proses/${step.slug}`}
                className={`${
                  isHero
                    ? mergeAytiCardClass(`${iconShellHeroBase} ${heroShellAccentAt(index)}`)
                    : mergeAytiCardClass(iconShellClassLight)
                } ${iconFocusClass} motion-safe:hover:scale-[1.03] active:scale-[0.97]`.trim()}
                aria-label={`Buka detail tahapan: ${step.title}`}
              >
                <Icon
                  className={`relative z-[1] ${iconGlyphClass}${isHero ? ` ${heroGlyphToneAt(index)}` : ""}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                  aria-hidden
                />
                {index === PROSES_KERJA_STEPS.length - 1 ? (
                  <span
                    className={
                      isHero
                        ? "proses-step-check proses-step-check--hero proses-step-check--final"
                        : "proses-step-check proses-step-check--light proses-step-check--final"
                    }
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="ayti-icon-cold proses-step-check__svg"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                ) : null}
              </InternalDetailNavLink>
            </div>

            {!isLast && isHero ? (
              <span className={connectorHeroMobileWrapClass} aria-hidden>
                <span className={connectorHeroMobileLineClass} />
                <span className="proses-flow-arrow-march--hero-h" />
              </span>
            ) : null}

            <div
              className={
                isHero
                  ? "flex w-full min-w-0 flex-col items-center space-y-0 lg:flex lg:w-full lg:flex-col lg:items-center lg:pt-0"
                  : "min-w-0 flex-1 space-y-1 pt-0.5 lg:flex lg:w-full lg:flex-col lg:items-center lg:space-y-0 lg:pt-0"
              }
            >
              <p className={stepLabelClass}>Langkah {stepNo}</p>
              <p className={stepTitleClass}>{step.title}</p>
            </div>

            {!isLast ? (
              <span className={connectorDesktopWrapClass} aria-hidden>
                <span className={connectorDesktopLineClass} />
                <span className={connectorDesktopArrowClass} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
