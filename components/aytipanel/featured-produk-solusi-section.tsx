"use client";

import Link from "next/link";

import { prepareNavigateToProductDetail } from "@/components/common/return-section";
import {
  featuredDualImageHalfFrame,
  featuredDualImageViewportHeights,
  featuredMobileTapHintLine,
  featuredMobileTapHintLineEnd,
  featuredProdukDetailNavHintClass,
  featuredProdukDetailNavHintCopy,
  featuredProdukDetailNavHintRowClass,
  featuredProdukDetailNavHintRuleBottomClass,
  featuredProdukDetailNavHintRuleTopClass,
  featuredProdukDetailNavHintWrapClass,
} from "@/components/aytipanel/featured-category-layout";
import { FeaturedProdukMobileScrollPanel } from "@/components/aytipanel/featured-produk-mobile-scroll-panel";
import {
  type FeaturedProdukScrollSectionId,
  useFeaturedMobilePanelState,
} from "@/components/aytipanel/featured-produk-scroll-provider";
import type { ProductB2BCategoryData } from "@/components/aytipanel/products-b2b-data";
import type { FeaturedImagePair } from "@/lib/site-content-model";
import { CmsText } from "@/components/site-cms/cms-text";
import { buildProductHomeReturnNavLinks } from "@/lib/product-home-return-nav-links";
import { CmsImage } from "@/components/site-cms/cms-image";
import { mergeAytiIconClass } from "@/lib/ayti-icon-cold";
import {
  lightEyebrow,
  lightFeaturedBulletIconRing,
  lightFeaturedBulletsGrid,
  lightFeaturedBulletRow,
  lightFeaturedCategoryEyebrowRule,
  lightFeaturedCategoryHeaderStack,
  lightFeaturedCategoryHeading,
  lightFeaturedCategoryGrid,
  lightFeaturedCategoryLead,
  lightFeaturedNavButton,
  lightSectionMax,
  lightSectionY,
  lightSurfaceBandWarm,
  lightSurfaceBandWhite,
  lightTitleLeadDivider,
} from "@/components/aytipanel/light-section-ui";

const HERO_BULLETS = [
  "Desain hingga commissioning",
  "Integrasi chiller, freezer & ABF",
  "Kontrol suhu sesuai kebutuhan",
  "custom sesuai spesifikasi proyek",
] as const;

function BulletIcon({ className }: { className?: string }) {
  return (
    <svg className={mergeAytiIconClass(className)} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  category: ProductB2BCategoryData;
  tone: "muted" | "surface";
  categoryIndex: number;
  featuredImages: FeaturedImagePair;
};

import type { ProductHomeReturnNavLink } from "@/lib/product-home-return-nav-links";

type ProductLinkItem = ProductHomeReturnNavLink;

function ProdukSolusiLead({
  category,
  categoryIndex,
}: {
  category: ProductB2BCategoryData;
  categoryIndex: number;
}) {
  return (
    <div className={lightFeaturedCategoryHeaderStack}>
      <span className={lightTitleLeadDivider} aria-hidden />
      <p className={lightFeaturedCategoryLead}>
        <CmsText
          path={`produk.categories.${categoryIndex}.description`}
          text={category.description}
          as="span"
          className="block"
        />
      </p>
    </div>
  );
}

function ProdukSolusiBulletsNav({
  productLinks,
}: {
  productLinks: readonly ProductLinkItem[];
}) {
  return (
    <>
      <ul
        className={lightFeaturedBulletsGrid}
        role="list"
        aria-label="Nilai utama solusi ruang dingin"
      >
        {HERO_BULLETS.map((line) => (
          <li key={line} className={lightFeaturedBulletRow}>
            <span className={lightFeaturedBulletIconRing} aria-hidden>
              <BulletIcon className="h-3 w-3" />
            </span>
            <span className="min-w-0 pt-px">{line}</span>
          </li>
        ))}
      </ul>

      <div className={featuredProdukDetailNavHintWrapClass}>
        <span className={featuredProdukDetailNavHintRuleTopClass} aria-hidden />
        <div className={featuredProdukDetailNavHintRowClass}>
          <span className={featuredMobileTapHintLine} aria-hidden />
          <p className={featuredProdukDetailNavHintClass}>{featuredProdukDetailNavHintCopy}</p>
          <span className={featuredMobileTapHintLineEnd} aria-hidden />
        </div>
        <span className={featuredProdukDetailNavHintRuleBottomClass} aria-hidden />
      </div>
      <nav
        className="mt-1 flex max-w-xl flex-col gap-3 md:mt-0 md:-mt-3 lg:-mt-3.5"
        aria-label="Produk solusi ruang dingin"
      >
        {productLinks.map(({ slug, href, label }) => (
          <Link
            key={href}
            href={href}
            scroll={false}
            className={lightFeaturedNavButton}
            onPointerDownCapture={() => prepareNavigateToProductDetail(slug)}
            onClick={() => prepareNavigateToProductDetail(slug)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function ProdukSolusiDetailBlocks({
  category,
  categoryIndex,
  productLinks,
}: {
  category: ProductB2BCategoryData;
  categoryIndex: number;
  productLinks: readonly ProductLinkItem[];
}) {
  return (
    <>
      <ProdukSolusiLead category={category} categoryIndex={categoryIndex} />
      <ProdukSolusiBulletsNav productLinks={productLinks} />
    </>
  );
}

const SCROLL_SECTION_ID = "produk-solusi" satisfies FeaturedProdukScrollSectionId;

export function FeaturedProdukSolusiSection({ category, categoryIndex, tone, featuredImages }: Props) {
  const band = tone === "muted" ? lightSurfaceBandWarm : lightSurfaceBandWhite;

  const productLinks = buildProductHomeReturnNavLinks("produk-solusi", category.cards);

  const mobile = useFeaturedMobilePanelState(SCROLL_SECTION_ID);
  const scrollContentVersion = `${category.description}\0${HERO_BULLETS.join("\0")}\0${productLinks.map((l) => l.href).join("\0")}`;

  return (
    <section
      ref={mobile.scrollMode ? mobile.registerSection : undefined}
      id="produk-solusi"
      data-featured-scroll={mobile.scrollMode ? (mobile.expanded ? "active" : "idle") : undefined}
      className={`scroll-mt-[var(--section-nav-pass)] ${band} ${lightSectionY} max-md:pb-6`}
      aria-labelledby={`${category.id}-heading`}
    >
      <div className={lightSectionMax}>
        <div className={lightFeaturedCategoryGrid}>
          <div className="order-1 flex min-w-0 flex-col lg:col-start-1 lg:row-start-1 lg:pr-3">
            <div className={lightFeaturedCategoryHeaderStack}>
              <div className="flex w-full min-w-0 items-center gap-3">
                <CmsText
                  path={`produk.categories.${categoryIndex}.eyebrow`}
                  text={category.eyebrow}
                  as="p"
                  className={`${lightEyebrow} shrink-0 text-[11px] md:text-xs`}
                />
                <span className={lightFeaturedCategoryEyebrowRule} aria-hidden />
              </div>
              <h2
                id={`${category.id}-heading`}
                className={`${lightFeaturedCategoryHeading} max-md:w-full max-md:border-b max-md:border-sky-500/35 max-md:pb-2 dark:max-md:border-sky-400/28`}
              >
                <span className="flex w-full min-w-0 items-center justify-center gap-2 sm:gap-2.5 md:justify-start md:gap-3">
                  <span
                    className="h-px min-h-px min-w-[1rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-r from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58 sm:min-w-[1.25rem] sm:max-w-[5.5rem] md:w-11 md:max-w-none md:flex-none"
                    aria-hidden
                  />
                  <CmsText
                    path={`produk.categories.${categoryIndex}.title`}
                    text={category.title}
                    as="span"
                    className="min-w-0 shrink text-balance text-center md:text-left"
                  />
                  <span
                    className="h-px min-h-px min-w-[1rem] max-w-[5rem] flex-1 rounded-full bg-gradient-to-l from-transparent via-sky-500/38 to-sky-600/55 dark:via-sky-400/42 dark:to-sky-300/58 sm:min-w-[1.25rem] sm:max-w-[5.5rem] md:min-w-0 md:max-w-none"
                    aria-hidden
                  />
                </span>
              </h2>
            </div>
          </div>

          <div className="order-2 min-w-0 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
            <div className="mx-auto flex w-full max-w-xl min-w-0 gap-2 sm:gap-3 lg:mx-0 lg:max-w-none">
              <div className={featuredDualImageHalfFrame}>
                <div className={featuredDualImageViewportHeights}>
                  <CmsImage
                    fill
                    src={featuredImages.leftSrc}
                    srcPath="produk.featuredImages.solusi.leftSrc"
                    alt={featuredImages.leftAlt}
                    uploadScope="produk"
                    uploadSegment="featured-solusi-left"
                    sizes="(max-width: 1024px) 48vw, 24vw"
                    className="relative block h-full w-full min-h-0"
                    imageClassName="object-cover"
                    imageTransform={featuredImages.leftAdjust}
                    transformPatchPath="produk.featuredImages.solusi.leftAdjust"
                  />
                </div>
              </div>
              <div className={featuredDualImageHalfFrame}>
                <div className={featuredDualImageViewportHeights}>
                  <CmsImage
                    fill
                    src={featuredImages.rightSrc}
                    srcPath="produk.featuredImages.solusi.rightSrc"
                    alt={featuredImages.rightAlt}
                    uploadScope="produk"
                    uploadSegment="featured-solusi-right"
                    sizes="(max-width: 1024px) 48vw, 24vw"
                    className="relative block h-full w-full min-h-0"
                    imageClassName="object-cover"
                    imageTransform={featuredImages.rightAdjust}
                    transformPatchPath="produk.featuredImages.solusi.rightAdjust"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="order-3 min-w-0 md:hidden">
            <div className="mt-3">
              <ProdukSolusiLead category={category} categoryIndex={categoryIndex} />
            </div>
          </div>

          {mobile.scrollMode ? (
            <div className="order-4 min-w-0 md:hidden">
              <FeaturedProdukMobileScrollPanel
                expanded={mobile.expanded}
                prefersReducedMotion={mobile.prefersReducedMotion}
                headingId={`${category.id}-heading`}
                panelId="featured-produk-solusi-details"
                contentVersion={scrollContentVersion}
              >
                <ProdukSolusiBulletsNav productLinks={productLinks} />
              </FeaturedProdukMobileScrollPanel>
            </div>
          ) : (
            <div className="order-4 min-w-0 md:hidden">
              <div className="space-y-3 border-t border-border pt-2 pb-0 dark:border-white/12">
                <ProdukSolusiBulletsNav productLinks={productLinks} />
              </div>
            </div>
          )}

          <div className="order-5 hidden min-w-0 flex-col space-y-4 md:flex md:space-y-5 lg:space-y-6 lg:col-start-1 lg:row-start-2 lg:pr-3">
            <ProdukSolusiDetailBlocks
              category={category}
              categoryIndex={categoryIndex}
              productLinks={productLinks}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
