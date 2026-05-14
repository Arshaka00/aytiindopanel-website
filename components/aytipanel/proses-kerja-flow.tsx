import type { SiteContent } from "@/lib/site-content-model";
import { PROSES_KERJA_STEPS, type ProsesKerjaSlug } from "@/components/aytipanel/proses-kerja-data";
import { ProsesStepIconMedia } from "@/components/aytipanel/proses-step-icon-media";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

export type ProsesStepImages = Partial<Record<ProsesKerjaSlug, string>>;

/** Ikon hero (fallback SVG): netral + bayangan timbul saja — tanpa glow warna per langkah. */
const HERO_STEP_GLYPH_RAISED =
  "text-slate-100 drop-shadow-[0_1px_0_rgba(255,255,255,0.14)] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.48)]";

/** Kartu ikon hero: fill gelap + kelas raised (bayangan di `globals.css` → `#beranda.hero .proses-hero-step-shell--raised`). */
const HERO_STEP_SHELL_BLACK = "!border-0 bg-neutral-950 proses-hero-step-shell--raised";

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
  /** Skala gambar per langkah di kartu (1 = default). */
  imageZoom?: SiteContent["hero"]["prosesStepImageZoom"];
};

export function ProsesKerjaFlow({
  variant,
  className = "",
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
  images,
  imageZoom,
}: ProsesKerjaFlowProps) {
  const isHero = variant === "hero";

  const olClass = isHero
    ? "mx-auto grid w-full min-w-0 max-w-[27rem] grid-cols-5 items-start gap-x-2 gap-y-1 pt-0 pb-px sm:max-w-[32rem] sm:gap-x-2.5 sm:gap-y-1.5 sm:pt-0 sm:pb-0 md:max-w-[42rem] md:gap-x-3 md:gap-y-1.5 md:pt-0 lg:max-w-[46rem] lg:gap-x-4 lg:gap-y-2 lg:pt-0"
    : "mx-auto max-w-md space-y-0 pt-2 lg:mx-0 lg:max-w-[34rem] lg:grid lg:grid-cols-5 lg:gap-x-1 lg:gap-y-2.5 lg:pt-1";

  const liClass = isHero
    ? "relative flex min-w-0 w-full flex-col items-center gap-0 pb-0 text-center before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-10 before:w-px before:bg-white/15 before:content-[''] first:before:hidden max-sm:gap-0 sm:before:h-11 md:max-w-none md:before:h-12 lg:gap-0 lg:px-0"
    : "relative flex flex-row items-start gap-2.5 pb-6 text-left last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-0 lg:pb-0 lg:text-center lg:before:pointer-events-none lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-12 lg:before:w-px lg:before:bg-border lg:before:content-[''] lg:first:before:hidden";

  const iconShellHeroBase =
    "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-solid bg-transparent sm:size-11 md:size-12 md:rounded-[11px]";

  const iconShellClassLight =
    "relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-transparent text-accent shadow-[var(--shadow-card)] lg:h-12 lg:w-12";

  const iconGlyphClass = isHero
    ? "h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem] md:h-[1.1875rem] md:w-[1.1875rem]"
    : "h-7 w-7 shrink-0 lg:h-6 lg:w-6";

  const stepLabelClass = isHero
    ? "sr-only"
    : "text-[11px] font-semibold uppercase tracking-wider text-muted [text-rendering:geometricPrecision] lg:hidden";

  const stepTitleClass = isHero
    ? "proses-hero-step-title--raised whitespace-pre-line line-clamp-3 min-h-[2rem] w-full max-w-[5.125rem] text-[0.5625rem] font-semibold leading-[1.22] tracking-[0.015em] text-balance text-white antialiased [text-rendering:geometricPrecision] sm:max-w-[5.5rem] sm:text-[0.625rem] sm:leading-snug md:max-w-[6.75rem] md:text-[0.6875rem] md:font-bold lg:min-h-0 lg:max-w-none lg:text-xs max-md:min-h-[1.625rem] max-md:leading-[1.26]"
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
        const stepZoom = imageZoom?.[step.slug] ?? 1;
        return (
          <li key={step.slug} className={liClass}>
            <div
              className={
                isHero
                  ? "relative z-10 mx-auto flex w-full min-w-0 flex-col items-center justify-center gap-1 sm:gap-1.5 lg:flex lg:w-full lg:flex-col lg:items-center"
                  : "relative z-10 mx-auto flex w-full min-w-0 flex-row items-start gap-2.5 lg:flex lg:w-full lg:flex-col lg:items-center lg:gap-1"
              }
            >
              <div
                className={
                  isHero
                    ? `${iconShellHeroBase} ${HERO_STEP_SHELL_BLACK}`
                    : mergeAytiCardClass(iconShellClassLight)
                }
                aria-hidden
              >
                <ProsesStepIconMedia
                  slug={step.slug}
                  srcPath={stepImagePath}
                  initialSrc={stepImage}
                  alt={step.title}
                  zoom={stepZoom}
                  imageSizes={isHero ? "(max-width: 767px) 44px, 48px" : undefined}
                  imageClassName={`absolute inset-0 z-[1]${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                  fallback={
                    <Icon
                      className={`relative z-[1] ${iconGlyphClass}${isHero ? ` ${HERO_STEP_GLYPH_RAISED}` : ""}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
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
            </div>
          </li>
        );
      })}
    </ol>
  );
}
