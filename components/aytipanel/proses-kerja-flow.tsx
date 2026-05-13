import { PROSES_KERJA_STEPS, type ProsesKerjaSlug } from "@/components/aytipanel/proses-kerja-data";
import { ProsesStepIconMedia } from "@/components/aytipanel/proses-step-icon-media";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

export type ProsesStepImages = Partial<Record<ProsesKerjaSlug, string>>;

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
  "border-sky-400/38 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_32px_-6px_rgba(56,189,248,0.42),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-sky-400/35",
  "border-cyan-400/34 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_30px_-6px_rgba(34,211,238,0.38),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-cyan-400/30",
  "border-sky-200/32 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_28px_-6px_rgba(125,211,252,0.32),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-sky-200/28",
  "border-teal-400/38 shadow-[0_14px_40px_-12px_rgba(0,0,0,0.92),0_0_30px_-6px_rgba(45,212,191,0.4),inset_0_1px_0_rgba(255,255,255,0.16)] ring-1 ring-inset ring-teal-400/32",
  "border-emerald-400/45 shadow-[0_16px_44px_-12px_rgba(0,0,0,0.94),0_0_36px_-6px_rgba(52,211,153,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-inset ring-emerald-400/38",
] as const;

type ProsesKerjaFlowVariant = "light" | "hero";

type ProsesKerjaFlowProps = {
  variant: ProsesKerjaFlowVariant;
  /** Extra class on the root `<ol>` (spacing, width). */
  className?: string;
  /** Visually hidden heading for the step list (a11y). */
  "aria-labelledby"?: string;
  /** Plain a11y label (alternatif `aria-labelledby`). */
  "aria-label"?: string;
  /** Gambar kecil per-step (CMS-editable). String kosong = pakai SVG icon fallback. */
  images?: ProsesStepImages;
};

export function ProsesKerjaFlow({
  variant,
  className = "",
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
  images,
}: ProsesKerjaFlowProps) {
  const isHero = variant === "hero";

  const olClass = isHero
    ? "mx-auto grid w-full min-w-0 max-w-[27rem] grid-cols-5 items-start gap-x-2 gap-y-1 pt-0 pb-px sm:max-w-[32rem] sm:gap-x-2.5 sm:gap-y-1.5 sm:pt-0 sm:pb-0 md:max-w-[42rem] md:gap-x-3 md:gap-y-1.5 md:pt-0 lg:max-w-[46rem] lg:gap-x-4 lg:gap-y-2 lg:pt-0"
    : "mx-auto max-w-md space-y-0 pt-2 lg:mx-0 lg:max-w-[34rem] lg:grid lg:grid-cols-5 lg:gap-x-1 lg:gap-y-2.5 lg:pt-1";

  const liClass = isHero
    ? "relative flex min-w-0 w-full flex-col items-center gap-0 pb-0 text-center before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-9 before:w-px before:bg-white/15 before:content-[''] first:before:hidden max-sm:gap-0 sm:before:h-10 md:max-w-none md:before:h-11 lg:gap-0 lg:px-0"
    : "relative flex flex-row items-start gap-2.5 pb-6 text-left last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-0 lg:pb-0 lg:text-center lg:before:pointer-events-none lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-12 lg:before:w-px lg:before:bg-border lg:before:content-[''] lg:first:before:hidden";

  const iconShellHeroBase =
    "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-solid bg-transparent sm:size-10 md:size-11 md:rounded-[10px]";

  const iconShellClassLight =
    "relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-transparent text-accent shadow-[var(--shadow-card)] lg:h-12 lg:w-12";

  const iconGlyphClass = isHero
    ? "h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 md:h-[1.0625rem] md:w-[1.0625rem]"
    : "h-7 w-7 shrink-0 lg:h-6 lg:w-6";

  const heroGlyphToneAt = (index: number) =>
    HERO_STEP_GLYPH_TONE[Math.min(index, HERO_STEP_GLYPH_TONE.length - 1)]!;

  const heroShellAccentAt = (index: number) =>
    HERO_STEP_SHELL_ACCENT[Math.min(index, HERO_STEP_SHELL_ACCENT.length - 1)]!;

  const stepLabelClass = isHero
    ? "sr-only"
    : "text-[11px] font-semibold uppercase tracking-wider text-muted [text-rendering:geometricPrecision] lg:hidden";

  const stepTitleClass = isHero
    ? "whitespace-pre-line line-clamp-3 min-h-[2rem] w-full max-w-[5.125rem] text-[0.5625rem] font-semibold leading-[1.22] tracking-[0.015em] text-balance text-white antialiased [text-rendering:geometricPrecision] [-webkit-text-stroke:0.2px_rgba(2,8,24,0.16)] [text-shadow:0_1px_2px_rgba(2,8,24,0.92),0_0_8px_rgba(2,8,24,0.48),0_0_12px_rgba(255,255,255,0.05)] sm:max-w-[5.5rem] sm:text-[0.625rem] sm:leading-snug md:max-w-[6.75rem] md:text-[0.6875rem] md:font-bold lg:mt-0.5 lg:min-h-0 lg:max-w-none lg:text-xs max-md:min-h-[1.625rem] max-md:leading-[1.26]"
    : "whitespace-pre-line text-sm font-semibold leading-snug text-foreground [text-rendering:geometricPrecision] lg:mt-1 lg:text-xs";

  return (
    <ol
      className={`${olClass} ${className}`.trim()}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabelledby ? undefined : ariaLabel}
    >
      {PROSES_KERJA_STEPS.map((step, index) => {
        const Icon = step.Icon;
        const stepNo = index + 1;
        const stepImage = images?.[step.slug] ?? "";
        const stepImagePath = `hero.prosesStepImages.${step.slug}`;
        return (
          <li key={step.slug} className={liClass}>
            <div className="relative z-10 mx-auto flex w-full justify-center lg:flex lg:w-full lg:flex-col lg:items-center">
              <div
                className={
                  isHero
                    ? mergeAytiCardClass(`${iconShellHeroBase} ${heroShellAccentAt(index)}`)
                    : mergeAytiCardClass(iconShellClassLight)
                }
                aria-hidden
              >
                <ProsesStepIconMedia
                  slug={step.slug}
                  srcPath={stepImagePath}
                  initialSrc={stepImage}
                  alt={step.title}
                  imageSizes={isHero ? "(max-width: 767px) 36px, 44px" : undefined}
                  imageClassName={`absolute inset-0 z-[1]${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                  fallback={
                    <Icon
                      className={`relative z-[1] ${iconGlyphClass}${isHero ? ` ${heroGlyphToneAt(index)}` : ""}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                      aria-hidden
                    />
                  }
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
              </div>
            </div>

            <div
              className={
                isHero
                  ? "flex w-full min-w-0 flex-col items-center space-y-0 lg:flex lg:w-full lg:flex-col lg:items-center lg:pt-0"
                  : "min-w-0 flex-1 space-y-0.5 pt-0 lg:flex lg:w-full lg:flex-col lg:items-center lg:space-y-0 lg:pt-0"
              }
            >
              <p className={stepLabelClass}>Langkah {stepNo}</p>
              <p className={stepTitleClass}>{step.title}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
