/**
 * Section layout & themed surfaces — mengikuti CSS variables (--bg-main, --card-bg, dll.).
 * Kartu produk B2B memakai kelas `dark-card` terpisah (fixed dark).
 */

import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";

/**
 * Gutter horizontal + safe-area (notch / inset landscape).
 * Selaras dengan `px-4` / `sm:px-5` / `md:px-6` namun tidak menempel ke tepi layar di perangkat berinset.
 */
export const sectionInsetX =
  "ps-[max(1rem,env(safe-area-inset-left,0px))] pe-[max(1rem,env(safe-area-inset-right,0px))] sm:ps-[max(1.25rem,env(safe-area-inset-left,0px))] sm:pe-[max(1.25rem,env(safe-area-inset-right,0px))] md:ps-[max(1.5rem,env(safe-area-inset-left,0px))] md:pe-[max(1.5rem,env(safe-area-inset-right,0px))]";

/** Inner block Layanan: setara `px-4 md:px-5 lg:px-6` + safe-area. */
export const sectionInsetXMdLg =
  "ps-[max(1rem,env(safe-area-inset-left,0px))] pe-[max(1rem,env(safe-area-inset-right,0px))] md:ps-[max(1.25rem,env(safe-area-inset-left,0px))] md:pe-[max(1.25rem,env(safe-area-inset-right,0px))] lg:ps-[max(1.5rem,env(safe-area-inset-left,0px))] lg:pe-[max(1.5rem,env(safe-area-inset-right,0px))]";

/** Vertikal landing — lebih rapat agar terasa premium tanpa sesak */
export const sectionPaddingY = `${sectionInsetX} py-9 md:py-14`;

/** Judul section → grid/konten */
export const sectionContentStack = "space-y-5 md:space-y-6";

/** Eyebrow → heading → lead */
export const sectionHeaderStack = "space-y-2.5 md:space-y-3";

/** Garis tipis antara judul (h2) dan subjudul / lead di stripe section terang */
export const sectionTitleLeadDivider =
  "block h-px w-full max-w-[5rem] shrink-0 rounded-full bg-gradient-to-r from-border via-border/55 to-transparent dark:from-white/22 dark:via-white/14 dark:to-transparent";

/**
 * Featured kategori produk (Utama, Solusi, Accessories, Service): grid 2 kolom,
 * tipografi hero, bullet kompak, frame gambar — satu set supaya selaras.
 */
export const featuredCategoryGrid =
  "grid grid-cols-1 items-start gap-y-3.5 sm:gap-y-4 lg:grid-cols-2 lg:gap-10 xl:gap-12";

export const featuredCategoryColumn =
  "order-1 flex min-w-0 flex-col space-y-4 md:space-y-5 lg:space-y-6 lg:pr-3";

export const featuredCategoryHeaderStack = "space-y-3.5 md:space-y-4";

/** Garis di samping label eyebrow (Produk Utama, Produk Solusi, …) */
export const featuredCategoryEyebrowRule =
  "h-px min-w-[2.5rem] flex-1 bg-gradient-to-r from-border via-border/70 to-transparent dark:from-white/22 dark:via-white/14 dark:to-transparent";

export const featuredCategoryHeading =
  "text-balance font-bold leading-[1.12] tracking-[-0.03em] text-foreground text-[1.75rem] sm:text-[2rem] md:text-[2.25rem] md:leading-[1.08] lg:text-[2.375rem] lg:leading-[1.06] dark:text-white";

export const featuredCategoryLead =
  "max-w-xl text-[1rem] leading-[1.62] text-muted md:text-[1.0625rem] md:leading-relaxed dark:text-white/78";

export const featuredBulletsGrid =
  "grid max-w-xl gap-2.5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-2.5";

export const featuredBulletRow =
  "flex gap-2.5 text-[0.875rem] font-medium leading-snug text-foreground md:text-[0.9375rem] dark:text-white/90";

export const featuredBulletIconRing =
  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/14 text-blue-700 ring-1 ring-blue-500/22 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-400/20";

export const featuredHeroImageFrame =
  "relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.125rem] shadow-[0_16px_48px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.06] dark:shadow-[0_20px_56px_-14px_rgba(0,0,0,0.55)] dark:ring-white/[0.09] lg:mx-0 lg:max-w-none";

export const featuredHeroImageViewport =
  "relative h-[272px] w-full sm:h-[312px] md:h-[332px] lg:h-[352px] lg:max-h-[384px]";

export const featuredNavButton =
  "inline-flex w-full min-h-12 touch-manipulation items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-center text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-[color,background-color,border-color,transform,opacity,box-shadow] duration-[280ms] [transition-timing-function:var(--ease-premium-soft)] motion-safe:active:scale-[0.988] hover:border-accent/35 hover:bg-muted-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 dark:border-white/25 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-950 sm:max-w-xl";

export const sectionMax = "mx-auto w-full max-w-6xl";

export const sectionEyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted md:text-xs md:tracking-[0.22em]";

export const sectionHeading =
  "text-2xl font-semibold leading-[1.2] tracking-tight text-foreground sm:text-3xl md:text-4xl md:leading-[1.15]";

export const sectionLead =
  "max-w-2xl text-base leading-[1.75] text-muted md:text-lg md:leading-relaxed";

export const sectionBody =
  "text-sm leading-[1.7] text-muted md:text-base md:leading-relaxed";

/** Kartu konten umum (layanan, FAQ, dll.) */
const themedCardCore =
  "rounded-[11px] border border-border bg-card p-[1.125rem] shadow-[var(--shadow-card)] md:rounded-xl md:p-5";

export const themedCard = mergeAytiCardClass(themedCardCore);

export const themedCardInteractive =
  `${themedCard} transition-[transform,box-shadow] duration-[340ms] [transition-timing-function:var(--ease-premium-soft)] md:motion-safe:hover:-translate-y-0.5 md:hover:shadow-[var(--shadow-card-hover)] motion-safe:active:translate-y-px motion-reduce:transition-[box-shadow]`;

/** Stripe utama halaman */
export const surfaceBand = "border-y border-border bg-background";

/** Stripe sekunder */
export const surfaceBandMuted = "border-y border-border bg-muted-bg";

/** Alias untuk refactor bertahap */
export const lightSectionY = sectionPaddingY;
export const lightSectionInsetX = sectionInsetX;
export const lightSectionInsetXMdLg = sectionInsetXMdLg;
export const lightSectionContentStack = sectionContentStack;
export const lightSectionHeaderStack = sectionHeaderStack;
export const lightSectionMax = sectionMax;
export const lightEyebrow = sectionEyebrow;
export const lightHeading = sectionHeading;
export const lightLead = sectionLead;
export const lightTitleLeadDivider = sectionTitleLeadDivider;
export const lightFeaturedCategoryGrid = featuredCategoryGrid;
export const lightFeaturedCategoryColumn = featuredCategoryColumn;
export const lightFeaturedCategoryHeaderStack = featuredCategoryHeaderStack;
export const lightFeaturedCategoryEyebrowRule = featuredCategoryEyebrowRule;
export const lightFeaturedCategoryHeading = featuredCategoryHeading;
export const lightFeaturedCategoryLead = featuredCategoryLead;
export const lightFeaturedBulletsGrid = featuredBulletsGrid;
export const lightFeaturedBulletRow = featuredBulletRow;
export const lightFeaturedBulletIconRing = featuredBulletIconRing;
export const lightFeaturedHeroImageFrame = featuredHeroImageFrame;
export const lightFeaturedHeroImageViewport = featuredHeroImageViewport;
export const lightFeaturedNavButton = featuredNavButton;
export const lightBody = sectionBody;
export const lightMiniCard = themedCard;
export const lightMiniCardInteractive = themedCardInteractive;
export const lightSurfaceBandWhite = surfaceBand;
export const lightSurfaceBandWarm = surfaceBandMuted;
