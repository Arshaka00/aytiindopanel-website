/** Konten halaman layanan yang disimpan di `SiteContent.layananPages` (editable CMS). */
export type LayananPageCmsEntry = {
  slug: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  heroImageSrc: string;
  heroImageAlt: string;
  heroH1: string;
  heroSubheadline: string;
  heroLead: string;
  heroBullets: string[];
  overviewEyebrow: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  ctaHeadline: string;
  ctaLead: string;
  /** Default false — hindari banyak foto di halaman layanan. */
  showPortfolioSection: boolean;
  faq: { question: string; answer: string }[];
};

export type LayananPagesCmsContent = {
  index: {
    eyebrow: string;
    heading: string;
    lead: string;
  };
  pages: LayananPageCmsEntry[];
};
