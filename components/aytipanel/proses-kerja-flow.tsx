import type { SiteContent } from "@/lib/site-content-model";
import { PROSES_KERJA_STEPS, type ProsesKerjaSlug } from "@/components/aytipanel/proses-kerja-data";
import { ProsesStepIconMedia } from "@/components/aytipanel/proses-step-icon-media";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

export type ProsesStepImages = Partial<Record<ProsesKerjaSlug, string>>;

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
    ? "relative flex min-w-0 w-full flex-col items-center gap-0 pb-0 text-center before:pointer-events-none before:absolute before:left-0 before:top-3.5 before:h-7 before:w-px before:bg-white/[0.14] before:content-[''] first:before:hidden max-sm:gap-0 sm:before:top-4 sm:before:h-8 md:max-w-none md:before:top-[1.125rem] md:before:h-9 lg:gap-0 lg:px-0"
    : "relative flex flex-row items-start gap-2.5 pb-6 text-left last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-0 lg:pb-0 lg:text-center lg:before:pointer-events-none lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-12 lg:before:w-px lg:before:bg-border lg:before:content-[''] lg:first:before:hidden";

  /** Hero: hanya area gambar/ikon — tanpa kartu, border, atau latar kotak. */
  const iconShellHeroBase =
    "proses-hero-step-media relative inline-flex size-11 shrink-0 items-center justify-center overflow-visible sm:size-12 md:size-14 lg:size-[3.75rem]";

  const iconShellClassLight =
    "relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-transparent text-accent shadow-[var(--shadow-card)] lg:h-12 lg:w-12";

  const iconGlyphClass = isHero
    ? "h-6 w-6 shrink-0 sm:h-[1.625rem] sm:w-[1.625rem] md:h-8 md:w-8 lg:h-9 lg:w-9"
    : "h-7 w-7 shrink-0 lg:h-6 lg:w-6";

  const stepLabelClass = isHero
    ? "sr-only"
    : "text-[11px] font-semibold uppercase tracking-wider text-muted [text-rendering:geometricPrecision] lg:hidden";

  const stepTitleClass = isHero
    ? "whitespace-pre-line line-clamp-3 w-full max-w-[5.125rem] text-[0.5625rem] font-semibold leading-[1.22] tracking-[0.015em] text-balance text-white antialiased [text-rendering:geometricPrecision] sm:max-w-[5.5rem] sm:text-[0.625rem] md:max-w-[6.75rem] md:text-[0.6875rem] md:font-bold lg:max-w-none lg:text-xs"
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
        const stepImagePath = `hero.prosesStepImages.${step.slug}`;
        const heroIconImage =
          "heroIconImage" in step && typeof step.heroIconImage === "string"
            ? step.heroIconImage
            : undefined;
        const cmsImage = images?.[step.slug]?.trim() ?? "";
        const stepImage =
          cmsImage ||
          (isHero && heroIconImage ? heroIconImage : "") ||
          (!isHero ? step.defaultImage : "");
        const stepZoom = imageZoom?.[step.slug] ?? 1;
        const useHeroImage = isHero && Boolean(stepImage);
        return (
          <li key={step.slug} className={liClass}>
            <div
              className={
                isHero
                  ? "relative z-10 mx-auto flex w-full min-w-0 flex-col items-center justify-center gap-0 lg:flex lg:w-full lg:flex-col lg:items-center"
                  : "relative z-10 mx-auto flex w-full min-w-0 flex-row items-start gap-2.5 lg:flex lg:w-full lg:flex-col lg:items-center lg:gap-1"
              }
            >
              <div
                className={isHero ? iconShellHeroBase : mergeAytiCardClass(iconShellClassLight)}
                aria-hidden
              >
                {useHeroImage ? (
                  <ProsesStepIconMedia
                    slug={step.slug}
                    srcPath={stepImagePath}
                    initialSrc={stepImage}
                    alt={step.title.replace("\n", " ")}
                    zoom={stepZoom}
                    imageSizes="(max-width: 767px) 48px, 56px"
                    imageClassName={`proses-hero-step-photo absolute inset-0 z-[1]${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                    imageFit="contain"
                    fallback={
                      <Icon
                        className={`proses-hero-step-glyph relative z-[1] ${iconGlyphClass} ${step.heroGlyphClass}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                        aria-hidden
                      />
                    }
                  />
                ) : isHero ? (
                  <Icon
                    className={`proses-hero-step-glyph relative z-[1] ${iconGlyphClass} ${step.heroGlyphClass}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                    aria-hidden
                  />
                ) : (
                  <ProsesStepIconMedia
                    slug={step.slug}
                    srcPath={stepImagePath}
                    initialSrc={stepImage}
                    alt={step.title.replace("\n", " ")}
                    zoom={stepZoom}
                    imageClassName={`absolute inset-0 z-[1]${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                    fallback={
                      <Icon
                        className={`relative z-[1] ${iconGlyphClass}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                        aria-hidden
                      />
                    }
                  />
                )}
                {!isHero && index === PROSES_KERJA_STEPS.length - 1 ? (
                  <span
                    className="proses-step-check proses-step-check--light proses-step-check--final"
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

              {isHero ? <span className="proses-hero-step-divider" aria-hidden /> : null}

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
