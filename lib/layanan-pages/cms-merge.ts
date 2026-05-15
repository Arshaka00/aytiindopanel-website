import type { LayananPageCmsEntry, LayananPagesCmsContent } from "@/lib/layanan-pages/cms-types";
import type { ServicePageDef } from "@/lib/service-pages";
import { SERVICE_PAGES } from "@/lib/service-pages";
import type { SiteContent } from "@/lib/site-content-model";

function trimStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

export function layananCmsPath(pageIndex: number, field: string): string {
  return `layananPages.pages.${pageIndex}.${field}`;
}

export function servicePageDefToCmsEntry(def: ServicePageDef): LayananPageCmsEntry {
  return {
    slug: def.slug,
    navLabel: def.navLabel,
    metaTitle: def.metaTitle,
    metaDescription: def.metaDescription,
    heroImageSrc: def.hero.imageSrc,
    heroImageAlt: def.hero.imageAlt,
    heroH1: def.hero.h1,
    heroSubheadline: def.hero.subheadline,
    heroLead: def.hero.lead,
    heroBullets: [...def.hero.bullets],
    overviewEyebrow: def.overview.eyebrow,
    overviewTitle: def.overview.title,
    overviewParagraphs: [...def.overview.paragraphs],
    ctaHeadline: def.ctaHeadline,
    ctaLead: def.ctaLead,
    /** Satu foto referensi proyek — bagian penting; bisa dimatikan di mode edit CMS. */
    showPortfolioSection: true,
    faq: def.faq.map((f) => ({ ...f })),
  };
}

export function buildDefaultLayananPagesCms(): LayananPagesCmsContent {
  return {
    index: {
      eyebrow: "Solusi Sistem Pendingin Terintegrasi",
      heading: "Layanan cold storage & panel industri",
      lead:
        "Halaman layanan mendalam untuk kebutuhan teknis — sandwich panel, cold storage, blast freezer, dan sistem refrigerasi. Halaman dapat diakses langsung dari URL dan indeks internal situs.",
    },
    pages: SERVICE_PAGES.map(servicePageDefToCmsEntry),
  };
}

export function findLayananCmsPageIndex(
  pages: LayananPageCmsEntry[],
  slug: string,
): number {
  return pages.findIndex((p) => p.slug === slug);
}

export function getLayananCmsPageEntry(
  content: LayananPagesCmsContent | undefined,
  slug: string,
): { entry: LayananPageCmsEntry; index: number } | null {
  if (!content?.pages?.length) return null;
  const index = findLayananCmsPageIndex(content.pages, slug);
  if (index < 0) return null;
  return { entry: content.pages[index]!, index };
}

export function mergeServicePageWithCms(
  def: ServicePageDef,
  cms: LayananPageCmsEntry | undefined,
  cmsPageIndex = -1,
): ServicePageDef & { cmsPageIndex: number; showPortfolioSection: boolean } {
  if (!cms) {
    return { ...def, cmsPageIndex, showPortfolioSection: false };
  }
  return {
    ...def,
    cmsPageIndex,
    showPortfolioSection: cms.showPortfolioSection === true,
    navLabel: cms.navLabel.trim() || def.navLabel,
    metaTitle: cms.metaTitle.trim() || def.metaTitle,
    metaDescription: cms.metaDescription.trim() || def.metaDescription,
    hero: {
      h1: cms.heroH1.trim() || def.hero.h1,
      subheadline: cms.heroSubheadline.trim() || def.hero.subheadline,
      lead: cms.heroLead.trim() || def.hero.lead,
      bullets: cms.heroBullets.length ? cms.heroBullets : def.hero.bullets,
      imageSrc: cms.heroImageSrc.trim() || def.hero.imageSrc,
      imageAlt: cms.heroImageAlt.trim() || def.hero.imageAlt,
    },
    overview: {
      eyebrow: cms.overviewEyebrow.trim() || def.overview.eyebrow,
      title: cms.overviewTitle.trim() || def.overview.title,
      paragraphs: cms.overviewParagraphs.length ? cms.overviewParagraphs : def.overview.paragraphs,
    },
    faq: cms.faq.length ? cms.faq : def.faq,
    ctaHeadline: cms.ctaHeadline.trim() || def.ctaHeadline,
    ctaLead: cms.ctaLead.trim() || def.ctaLead,
  };
}

export function resolveLayananPageFromSiteContent(
  def: ServicePageDef,
  layananPages: LayananPagesCmsContent | undefined,
): ServicePageDef & { cmsPageIndex: number; showPortfolioSection: boolean } {
  const hit = getLayananCmsPageEntry(layananPages, def.slug);
  return mergeServicePageWithCms(def, hit?.entry, hit?.index ?? -1);
}

function trimOr<T extends string>(value: T | undefined, fallback: T): T {
  const t = (value ?? "").trim();
  return (t || fallback) as T;
}

/** Sinkronkan `layananPages` dengan manifest layanan + migrasi `coldStoragePage`. */
export function normalizeLayananPagesInContent(
  layananPages: LayananPagesCmsContent | undefined,
  coldStoragePage: { heroImageSrc: string; heroImageAlt: string },
): LayananPagesCmsContent {
  const defaults = buildDefaultLayananPagesCms();
  const existingBySlug = new Map((layananPages?.pages ?? []).map((p) => [p.slug, p]));

  const pages = SERVICE_PAGES.map((def) => {
    const base = servicePageDefToCmsEntry(def);
    const prev = existingBySlug.get(def.slug);
    if (!prev) return base;
    return {
      ...base,
      ...prev,
      slug: def.slug,
      navLabel: trimOr(prev.navLabel, base.navLabel),
      metaTitle: trimOr(prev.metaTitle, base.metaTitle),
      metaDescription: trimOr(prev.metaDescription, base.metaDescription),
      heroImageSrc: trimOr(prev.heroImageSrc, base.heroImageSrc),
      heroImageAlt: trimOr(prev.heroImageAlt, base.heroImageAlt),
      heroH1: trimOr(prev.heroH1, base.heroH1),
      heroSubheadline: trimOr(prev.heroSubheadline, base.heroSubheadline),
      heroLead: trimOr(prev.heroLead, base.heroLead),
      heroBullets: prev.heroBullets?.length ? prev.heroBullets : base.heroBullets,
      overviewEyebrow: trimOr(prev.overviewEyebrow, base.overviewEyebrow),
      overviewTitle: trimOr(prev.overviewTitle, base.overviewTitle),
      overviewParagraphs: prev.overviewParagraphs?.length ? prev.overviewParagraphs : base.overviewParagraphs,
      ctaHeadline: trimOr(prev.ctaHeadline, base.ctaHeadline),
      ctaLead: trimOr(prev.ctaLead, base.ctaLead),
      showPortfolioSection: prev.showPortfolioSection === false ? false : true,
      faq: prev.faq?.length ? prev.faq : base.faq,
    };
  });

  const coldIdx = pages.findIndex((p) => p.slug === "cold-storage");
  if (coldIdx >= 0) {
    const row = pages[coldIdx]!;
    pages[coldIdx] = {
      ...row,
      heroImageSrc: trimOr(coldStoragePage.heroImageSrc, row.heroImageSrc),
      heroImageAlt: trimOr(coldStoragePage.heroImageAlt, row.heroImageAlt),
    };
  }

  return {
    index: {
      eyebrow: trimOr(layananPages?.index?.eyebrow, defaults.index.eyebrow),
      heading: trimOr(layananPages?.index?.heading, defaults.index.heading),
      lead: trimOr(layananPages?.index?.lead, defaults.index.lead),
    },
    pages,
  };
}

export function layananPageCmsPath(pageIndex: number, field: string): string {
  return `layananPages.pages.${pageIndex}.${field}`;
}
