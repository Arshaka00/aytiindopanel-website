import type { ServiceFaqItem, ServicePageDef } from "@/lib/service-pages";

export type ServiceCitySeoOverlay = {
  slug: string;
  cityKey: string;
  placename: string;
  displayLabel: string;
  serviceUrlSlug: string;
  serviceRootPath: string;
  hubSlug: string;
  h1: string;
  heroSubheadline: string;
  heroLead: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  introParagraph?: string;
  coverageAreas: string[];
  industryTags: string[];
  siblingCities: { slug: string; label: string }[];
  waTopicPhrase: string;
  faqExtras: ServiceFaqItem[];
  /** Proyek portfolio (id dari Portfolio CMS) untuk halaman kota — lihat `cmsPortfolioPreviewByIds`. */
  relatedGalleryProjectIds?: string[];
};

export function applyCitySeoToPage(page: ServicePageDef, city: ServiceCitySeoOverlay): ServicePageDef {
  const industries =
    city.industryTags.length > 0
      ? [...new Set([...city.industryTags, ...page.industries])]
      : page.industries;

  return {
    ...page,
    metaTitle: city.metaTitle,
    metaDescription: city.metaDescription,
    hero: {
      ...page.hero,
      h1: city.h1,
      subheadline: city.heroSubheadline,
      lead: city.heroLead,
    },
    overview: {
      ...page.overview,
      paragraphs: city.introParagraph
        ? [city.introParagraph, ...page.overview.paragraphs]
        : page.overview.paragraphs,
    },
    industries,
    faq: [...city.faqExtras, ...page.faq],
  };
}
