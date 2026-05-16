import { CmsImage } from "@/components/site-cms/cms-image";
import { CmsStringList } from "@/components/site-cms/cms-string-list";
import { CmsText } from "@/components/site-cms/cms-text";
import {
  lightFeaturedBulletIconRing,
  lightLead,
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWhite,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";
import type { SiteContent } from "@/lib/site-content";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

type Props = { tentang: SiteContent["tentang"] };

/** Paragraf lead/body — full width & line-height rapat di mobile. */
const tentangParagraphClass = [
  lightLead,
  "m-0 w-full max-w-none text-left text-pretty",
  "break-words [overflow-wrap:break-word] hyphens-auto",
  "max-md:text-[0.9375rem] max-md:leading-[1.62] max-md:tracking-[0.01em]",
  "md:max-w-2xl",
].join(" ");

const tentangValuesItemClass = [
  lightLead,
  "max-w-none text-left text-pretty",
  "break-words [overflow-wrap:break-word] hyphens-auto",
  "max-md:text-[0.9375rem] max-md:leading-[1.58]",
  "md:max-w-2xl",
].join(" ");

export function TentangSection({ tentang }: Props) {
  return (
    <section
      id="tentang"
      className={`scroll-mt-[var(--section-nav-pass)] ${lightSurfaceBandWhite} ${lightSectionInsetX} py-4 sm:py-5 md:py-6`}
      aria-labelledby="tentang-heading"
    >
      <div className={lightSectionMax}>
        <div className="mx-auto mb-4 max-w-4xl space-y-1.5 text-center md:mb-5 md:space-y-2">
          <header className="flex flex-col items-center gap-1 md:gap-1.5">
            <CmsText
              path="tentang.sectionLabel"
              text={tentang.sectionLabel}
              className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-sky-800/95 md:text-[11px] dark:text-sky-300/85"
              id="tentang-section-label"
              as="p"
            />
            <div
              className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
              aria-hidden
            />
          </header>

          <h2
            id="tentang-heading"
            className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
            aria-describedby="tentang-section-label"
          >
            <span className="flex w-full min-w-0 items-center justify-center gap-2 sm:gap-3">
              <span
                className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                aria-hidden
              />
              <span className="max-w-[min(100%,38rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-1 text-balance text-center text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200">
                <CmsText path="tentang.heading" text={tentang.heading} />
              </span>
              <span
                className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                aria-hidden
              />
            </span>
          </h2>

          <div className="flex justify-center">
            <span className={lightTitleLeadDivider} aria-hidden />
          </div>
          <div
            className="mx-auto h-px w-full max-w-2xl rounded-full bg-gradient-to-r from-transparent via-sky-500/25 to-transparent dark:via-sky-300/30"
            aria-hidden
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-9">
          <figure
            className={mergeAytiCardClass(
              "relative order-2 mx-auto aspect-video w-full max-w-[min(100%,21.5rem)] overflow-hidden rounded-xl border border-border bg-muted-bg shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-[340ms] [transition-timing-function:var(--ease-premium-soft)] sm:max-w-md md:max-w-lg lg:order-none lg:col-start-1 lg:mx-0 lg:max-w-none lg:sticky lg:top-28 md:rounded-xl md:motion-safe:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-card-hover)]",
            )}
          >
            <CmsImage
              src={tentang.imageSrc}
              alt={tentang.imageAlt}
              fill
              sizes="(max-width: 640px) 344px, (max-width: 1024px) 512px, 50vw"
              className="absolute inset-0"
              imageClassName="object-cover"
              srcPath="tentang.imageSrc"
              uploadScope="tentang"
              imageTransform={tentang.imageAdjust}
              transformPatchPath="tentang.imageAdjust"
            />
            <figcaption className="sr-only">{tentang.figcaptionSr}</figcaption>
          </figure>

          <div className="tentang-copy order-1 flex flex-col gap-3 text-pretty max-md:gap-3 md:gap-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:gap-[1.125rem]">
            <p className={tentangParagraphClass}>
              <CmsText path="tentang.lead" text={tentang.lead} as="span" />
            </p>
            <p className={tentangParagraphClass}>
              <CmsText path="tentang.body" text={tentang.body} as="span" />
            </p>

            <p
              className="m-0 shrink-0 pt-0.5 text-center text-sm leading-none tracking-[0.2em] text-muted-foreground max-md:pt-0 max-md:text-xs md:text-base"
              aria-hidden
            >
              ⸻
            </p>

            <div className="space-y-2.5 max-md:space-y-2 md:space-y-3">
              <h3 className="text-base font-semibold leading-snug text-foreground max-md:text-[0.9375rem] md:text-lg">
                <CmsText path="tentang.valuesHeading" text={tentang.valuesHeading} />
              </h3>
              <ul className="mt-0 list-none space-y-2 max-md:space-y-2 sm:space-y-3">
                <CmsStringList
                  items={tentang.values}
                  patchPath="tentang.values"
                  itemClassName={tentangValuesItemClass}
                  leadingIconRingClassName={lightFeaturedBulletIconRing}
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
