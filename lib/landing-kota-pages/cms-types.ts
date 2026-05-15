/** Konten indeks `/artikel/lokasi` + override sparse per URL kota di `SiteContent.landingKotaPages`. */

export type LandingKotaIndexCmsContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  /** Kosong = pakai meta bawaan (judul template + deskripsi default indeks). */
  metaTitle: string;
  metaDescription: string;
};

/** Satu kota — field opsional sama dengan `content/cms/cities/[slug].json`. */
export type LandingKotaPageCmsEntry = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  h1?: string;
  heroSubheadline?: string;
  heroLead?: string;
  introParagraph?: string;
  coverageAreas?: string[];
  relatedGalleryProjectIds?: string[];
};

export type LandingKotaPagesCmsContent = {
  index: LandingKotaIndexCmsContent;
  pages: LandingKotaPageCmsEntry[];
};
