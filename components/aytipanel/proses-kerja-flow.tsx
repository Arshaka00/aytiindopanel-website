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
    ? "mx-auto grid w-full min-w-0 max-w-[27rem] grid-cols-5 items-start gap-x-0 gap-y-0 pt-0 pb-0 sm:max-w-[32rem] sm:gap-x-px sm:gap-y-0 sm:pt-0 sm:pb-0 md:max-w-[41rem] md:gap-x-0 md:gap-y-0 md:pt-0 lg:max-w-[44rem] lg:gap-x-0 lg:gap-y-0 lg:pt-0"
    : "mx-auto max-w-md space-y-0 pt-2 lg:mx-0 lg:max-w-[34rem] lg:grid lg:grid-cols-5 lg:gap-x-1 lg:gap-y-2.5 lg:pt-1";

  const liClass = isHero
    ? "relative flex min-w-0 w-full flex-col items-center gap-0 pb-0 text-center before:pointer-events-none before:absolute before:left-0 before:content-[''] first:before:hidden max-sm:gap-0 md:max-w-none lg:gap-0 lg:px-0"
    : "relative flex flex-row items-start gap-2.5 pb-6 text-left last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-0 lg:pb-0 lg:text-center lg:before:pointer-events-none lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-12 lg:before:w-px lg:before:bg-border lg:before:content-[''] lg:first:before:hidden";

  /** Hero: anchor ukuran tetap untuk gambar `absolute inset-0`; tanpa kotak/border (ikon produk polos). */
  const heroIconAnchorClass =
    "proses-hero-step-anchor relative isolate inline-flex size-10 shrink-0 items-center justify-center sm:size-11 md:size-[2.875rem] lg:size-12";

  const iconShellClassLight =
    "relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-transparent text-accent shadow-[var(--shadow-card)] lg:h-12 lg:w-12";

  const iconGlyphClass = isHero
    ? "h-[1.125rem] w-[1.125rem] shrink-0 sm:h-[1.3125rem] sm:w-[1.3125rem] md:h-6 md:w-6 lg:h-[1.625rem] lg:w-[1.625rem]"
    : "h-7 w-7 shrink-0 lg:h-6 lg:w-6";

  const stepMicroLabelLightClass =
    "text-[12px] font-semibold normal-case tracking-wider text-muted [text-rendering:geometricPrecision] lg:hidden";

  const stepTitleClass = isHero
    ? "proses-hero-step-title order-2 -mt-1 w-full whitespace-pre-line line-clamp-3 max-w-[6.5rem] text-center text-[clamp(9px,1.72vw,10px)] font-bold normal-case leading-[1.06] tracking-[0.09em] text-balance text-[#F4F7FD]/95 antialiased [text-rendering:geometricPrecision] [-webkit-text-stroke:0.22px_rgba(2,8,20,0.35)] [paint-order:stroke_fill] [text-shadow:0_0.5px_0_rgb(2,6,18),0_1px_2px_rgba(0,0,0,0.48)] sm:-mt-0.5 sm:max-w-[7.25rem] sm:leading-[1.08] sm:tracking-[0.1em] md:max-w-[7.75rem] md:text-[10px] md:tracking-[0.11em] lg:max-w-[8.35rem] lg:text-[11px] lg:tracking-[0.12em]"
    : "whitespace-pre-line normal-case text-[0.9375rem] font-semibold leading-snug text-foreground [text-rendering:geometricPrecision] lg:mt-1 lg:text-[0.8125rem]";

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
                  ? "proses-hero-step-cluster relative z-10 mx-auto flex w-full min-w-0 flex-col items-center gap-y-0 pt-0 lg:w-full"
                  : "relative z-10 mx-auto flex w-full min-w-0 flex-row items-start gap-2.5 lg:flex lg:w-full lg:flex-col lg:items-center lg:gap-1"
              }
            >
              {isHero ? (
                <div
                  className={`${heroIconAnchorClass} order-1${useHeroImage ? " overflow-hidden" : " overflow-visible"}`}
                  aria-hidden
                >
                  {useHeroImage ? (
                    <ProsesStepIconMedia
                      slug={step.slug}
                      srcPath={stepImagePath}
                      initialSrc={stepImage}
                      alt={step.title.replace("\n", " ")}
                      zoom={stepZoom}
                      imageSizes="(max-width: 767px) 128px, 160px"
                      imageClassName={`proses-hero-step-photo absolute inset-0 z-[1]${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                      imageFit="contain"
                      fallback={
                        <Icon
                          className={`proses-hero-step-glyph relative z-[1] ${iconGlyphClass} ${step.heroGlyphClass}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                          aria-hidden
                        />
                      }
                    />
                  ) : (
                    <Icon
                      className={`proses-hero-step-glyph relative z-[1] ${iconGlyphClass} ${step.heroGlyphClass}${index === PROSES_KERJA_STEPS.length - 1 ? " proses-step-glyph--final" : ""}`}
                      aria-hidden
                    />
                  )}
                </div>
              ) : (
                <div className={mergeAytiCardClass(iconShellClassLight)} aria-hidden>
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
                  {index === PROSES_KERJA_STEPS.length - 1 ? (
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
              )}

              {isHero ? (
                <p className={stepTitleClass}>
                  <span className="sr-only">
                    Langkah <span className="tabular-nums">{stepNo}</span>:{" "}
                  </span>
                  {step.title}
                </p>
              ) : (
                <div className="min-w-0 flex-1 space-y-0.5 pt-0 lg:flex lg:w-full lg:flex-col lg:items-center lg:space-y-0 lg:pt-0">
                  <p className={stepMicroLabelLightClass}>Langkah {stepNo}</p>
                  <p className={stepTitleClass}>{step.title}</p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
