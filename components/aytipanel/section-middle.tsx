import {
  lightEyebrow,
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWarm,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";
import { PortfolioProjectsClient } from "@/components/aytipanel/portfolio-projects-client";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";
import { InternalDetailNavLink } from "@/components/common/internal-detail-nav-link";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content-model";

export function PortfolioSection({ portfolio }: { portfolio: SiteContent["portfolio"] }) {
  return (
    <section
      id="proyek"
      className={`scroll-mt-[var(--section-nav-pass)] ${lightSurfaceBandWarm} ${lightSectionInsetX} py-5 [touch-action:pan-y_pinch-zoom] sm:py-6 md:py-8`}
      aria-labelledby="portfolio-heading"
    >
      <div className={`${lightSectionMax} space-y-4 md:space-y-5`}>
        <header className="mx-auto max-w-4xl space-y-2 text-center md:space-y-2.5">
          <CmsText
            id="portfolio-label"
            path="portfolio.sectionLabel"
            text={portfolio.sectionLabel}
            as="p"
            className={`${lightEyebrow} text-[11px] md:text-xs`}
          />
          <div
            className="mx-auto h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
            aria-hidden
          />
          <h2
            id="portfolio-heading"
            className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
            aria-describedby="portfolio-label"
          >
            <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
              <span
                className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                aria-hidden
              />
              <CmsText
                path="portfolio.heading"
                text={portfolio.heading}
                as="span"
                className="max-w-[min(100%,38rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-1 text-balance text-center text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200"
              />
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
          <CmsText
            path="portfolio.lead"
            text={portfolio.lead}
            as="p"
            className="mx-auto w-full max-w-3xl text-pretty text-sm leading-snug text-muted-foreground md:text-base md:leading-[1.55]"
          />
        </header>
        <PortfolioProjectsClient
          projects={portfolio.projects}
          locationLabel={portfolio.projectLocationLabel}
          workTypeLabel={portfolio.projectWorkTypeLabel}
          editorAddProjectLabel={portfolio.editorAddProjectLabel}
        />
        <div className="mt-4 flex flex-col items-center gap-3 text-center md:mt-5">
          <CmsText
            path="portfolio.galleryHint"
            text={portfolio.galleryHint}
            as="p"
            className="text-sm leading-relaxed text-muted-foreground md:text-base"
          />
          <InternalDetailNavLink
            href="/gallery-project"
            listingReturnSectionId="proyek"
            className={mergeAytiCardClass(
              "inline-flex min-h-12 w-full items-center justify-center rounded-[11px] border border-sky-500/35 bg-gradient-to-r from-sky-500/18 via-blue-600/18 to-sky-500/18 px-5 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] backdrop-blur-sm transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:border-sky-500/55 hover:from-sky-500/26 hover:via-blue-600/24 hover:to-sky-500/26 hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-auto md:min-w-[220px]",
            )}
          >
            <CmsText
              path="portfolio.galleryLinkLabel"
              text={portfolio.galleryLinkLabel}
              as="span"
              className="font-semibold"
            />
          </InternalDetailNavLink>
        </div>
      </div>
    </section>
  );
}
