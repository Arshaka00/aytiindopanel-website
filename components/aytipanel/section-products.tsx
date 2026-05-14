import { ProductsCategorySection } from "@/components/aytipanel/products-category-section";
import { FeaturedProdukScrollProvider } from "@/components/aytipanel/featured-produk-scroll-provider";
import { IconWhatsApp } from "@/components/aytipanel/icons";
import {
  lightSectionInsetX,
  lightSectionMax,
  lightSurfaceBandWhite,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content-model";

export function SectionProducts({ produk }: { produk: SiteContent["produk"] }) {
  return (
    <>
      <section
        className={`${lightSurfaceBandWhite} ${lightSectionInsetX} py-5 sm:py-6 md:py-8`}
        aria-labelledby="produk-heading"
      >
        <div className={lightSectionMax}>
          <div className="mx-auto max-w-4xl space-y-2 text-center md:space-y-2.5">
            <header className="flex flex-col items-center gap-1.5 md:gap-2">
              <CmsText
                id="produk-section-label"
                path="produk.sectionLabel"
                text={produk.sectionLabel}
                as="p"
                className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-sky-800/95 md:text-[11px] dark:text-sky-300/85"
              />
              <div
                className="h-px w-14 shrink-0 rounded-full bg-gradient-to-r from-transparent via-sky-500/35 to-transparent md:w-16 dark:via-sky-400/45"
                aria-hidden
              />
            </header>

            <h2
              id="produk-heading"
              className="text-balance text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem]"
              aria-describedby="produk-section-label"
            >
              <span className="flex w-full min-w-0 items-center justify-center gap-2.5 sm:gap-3.5">
                <span
                  className="h-px min-h-px min-w-[1.25rem] max-w-[5.5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58"
                  aria-hidden
                />
                <CmsText
                  path="produk.heading"
                  text={produk.heading}
                  as="span"
                  className="max-w-[min(100%,36rem)] min-w-0 bg-gradient-to-r from-sky-700 via-sky-600 to-sky-700 bg-clip-text px-1 text-balance text-center text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-transparent sm:text-3xl md:text-[2rem] md:leading-[1.18] lg:text-[2.25rem] dark:from-sky-200 dark:via-sky-300 dark:to-sky-200"
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
              path="produk.lead"
              text={produk.lead}
              as="p"
              className="mx-auto w-full max-w-none text-pretty text-sm leading-snug text-muted-foreground md:text-base md:leading-[1.55]"
            />
          </div>
        </div>
      </section>

      <FeaturedProdukScrollProvider>
        {produk.categories.map((category, index) => (
          <ProductsCategorySection
            key={category.id}
            category={category}
            categoryIndex={index}
            tone={index % 2 === 0 ? "muted" : "surface"}
            featuredImages={produk.featuredImages}
          />
        ))}
      </FeaturedProdukScrollProvider>

      <section
        className={`${lightSurfaceBandWhite} ${lightSectionInsetX} pb-8 pt-2 md:pb-10 md:pt-3`}
      >
        <div className={lightSectionMax}>
          <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center gap-4 text-center sm:max-w-[24rem]">
            <CmsText
              path="produk.closingBlurb"
              text={produk.closingBlurb}
              as="p"
              className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base md:leading-relaxed"
            />
            <WhatsAppCTAButton
              className="inline-flex w-auto min-w-[12.5rem] items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-sky-400 via-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(56,189,248,0.85)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 hover:shadow-[0_16px_30px_-12px_rgba(56,189,248,0.95)] motion-safe:hover:scale-[1.01] md:w-auto md:min-w-[220px]"
              ariaLabel="Hubungi via WhatsApp untuk informasi produk"
              message={produk.closingCtaMessage}
            >
              <IconWhatsApp className="h-4 w-4 shrink-0 text-white" aria-hidden />
              <CmsText
                path="produk.closingCtaLabel"
                text={produk.closingCtaLabel}
                as="span"
                className="font-semibold"
              />
            </WhatsAppCTAButton>
          </div>
        </div>
      </section>
    </>
  );
}
