import type { ProductB2BCategoryData } from "@/components/aytipanel/products-b2b-data";
import type { RichProductDetail } from "@/components/aytipanel/product-detail-rich-data";
import type { CmsRichTextValue } from "@/lib/cms-rich-text";
import type { CmsImageTransform } from "@/lib/cms-image-transform";
import type { LayananPagesCmsContent } from "@/lib/layanan-pages/cms-types";
import type { LandingKotaPagesCmsContent } from "@/lib/landing-kota-pages/cms-types";

export type { CmsRichTextValue } from "@/lib/cms-rich-text";
export type { CmsImageTransform } from "@/lib/cms-image-transform";

/** Satu slide hero — `src` wajib; focal/zoom/fit opsional (editor CMS). */
export type HeroSlideEntry = { src: string } & Partial<CmsImageTransform>;

/** Pasangan gambar featured (produk) dengan penyesuaian per sisi. */
export type FeaturedImagePair = {
  leftSrc: string;
  rightSrc: string;
  leftAlt: string;
  rightAlt: string;
  leftAdjust?: Partial<CmsImageTransform>;
  rightAdjust?: Partial<CmsImageTransform>;
};

export type HeroIntroParts = {
  before1: CmsRichTextValue;
  bold1: CmsRichTextValue;
  middle: CmsRichTextValue;
  bold2: CmsRichTextValue;
  after2: CmsRichTextValue;
  bold3: CmsRichTextValue;
  after3: CmsRichTextValue;
};

/** Ikon keunggulan (kartu) — key stabil untuk CMS */
export type KeunggulanCardIconKey =
  | "manufacturing"
  | "rab"
  | "clipboard"
  | "stopwatch"
  | "hardhat"
  | "folder";

export type KeunggulanStatIconKey = "briefcase" | "users" | "clock" | "shield";

export type SiteWhatsAppContact = {
  id: string;
  label: string;
  number: string;
  isPrimary: boolean;
};

export type SiteEmailContact = {
  id: string;
  label: string;
  email: string;
  isPrimary: boolean;
};

/** Satu domain/asal URL produksi; satu entri bertanda primary dipakai canonical & metadata. */
export type SiteProductionUrl = {
  id: string;
  label: string;
  url: string;
  isPrimary: boolean;
};

export type SiteSeoContent = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  companyDescription: string;
  serviceAreas: string;
  additionalSeoContent: string;
};

/** Aset brand situs — path publik (`/images/...`) atau URL absolut; string kosong = fallback bawaan. */
export type SiteBrandAssets = {
  logoLight: string;
  logoDark: string;
  favicon: string;
  appleTouchIcon: string;
  defaultOgImage: string;
};

/** SEO per halaman (override di atas `seoContent` global). */
export type SitePageSeoEntry = {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
  noIndex: boolean;
};

export type SitePageSeoKey = "home" | "about" | "produk" | "coldStorage" | "gallery" | "process";

export type SitePageSeoMap = Partial<Record<SitePageSeoKey, Partial<SitePageSeoEntry>>>;

export type SiteAnalyticsSettings = {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  microsoftClarityId: string;
  googleSiteVerification: string;
};

/** Tautan sosial terpusat (Site Settings) — tersinkron ke footer bila diisi. */
export type SiteSocialLinksSettings = {
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  facebook: string;
};

export type SiteSeoControl = {
  allowIndexing: boolean;
  stagingMode: boolean;
};

export type SiteImageSeoSettings = {
  defaultAltPrefix: string;
  fallbackOgImage: string;
};

export type SiteLocalSeoSettings = {
  latitude: string;
  longitude: string;
  areaServed: string[];
  openingHours: string[];
};

export type SitePerformanceModeSettings = {
  lightweightMode: boolean;
  disableHeavyAnimations: boolean;
  disableVideoBackground: boolean;
};

export type SiteRedirectRule = {
  from: string;
  to: string;
  permanent: boolean;
};

/** URL halaman/profil brand di jejaring sosial — untuk tombol "buka profil" di panel promosi. */
export type SiteSocialPromotionProfiles = {
  facebookPageUrl: string;
  instagramProfileUrl: string;
  tiktokProfileUrl: string;
  youtubeChannelUrl: string;
  xProfileUrl: string;
};

export type SiteContent = {
  version: 1;
  siteSettings: {
    /** Nama brand / legal singkat — dipakai metadata & sinkron judul situs. */
    siteName: string;
    /** Beberapa URL/domain produksi (www, apex, alias). Diset dari CMS; primary = canonical. */
    productionUrls: SiteProductionUrl[];
    /**
     * Origin canonical primer (mis. https://www.example.com) — diisi otomatis dari `productionUrls`
     * saat normalize; dipakai metadata, sitemap, OG.
     */
    siteUrl: string;
    /** Alamat multi-baris (textarea); dipakai kontak & schema. */
    companyAddress: string;
    whatsappNumbers: SiteWhatsAppContact[];
    emails: SiteEmailContact[];
    /** URL embed atau share Maps — opsional */
    mapsUrl: string;
    officeHours: string;
    seoContent: SiteSeoContent;
    /** Tautan opsional ke halaman sosial — dipakai tombol promosi di Site Settings. */
    socialPromotionProfiles: SiteSocialPromotionProfiles;

    brandAssets: SiteBrandAssets;
    pageSeo: SitePageSeoMap;
    analytics: SiteAnalyticsSettings;
    socialLinks: SiteSocialLinksSettings;
    seoControl: SiteSeoControl;
    imageSeo: SiteImageSeoSettings;
    localSeo: SiteLocalSeoSettings;
    performanceMode: SitePerformanceModeSettings;
    /** Redirect 301/302 — path `from` relatif ke origin (mis. `/lama`). */
    redirects: SiteRedirectRule[];

    published: boolean;
    maintenanceMode: boolean;
    maintenanceHeadline: string;
    maintenanceSubtext: string;
    maintenanceShowWhatsApp: boolean;
    maintenanceWhatsAppLabel: string;
    maintenanceWhatsAppMessage: string;
  };
  header: {
    brandName: string;
    logoAriaLabel: string;
    navAriaLabel: string;
    mobileMenuAriaLabel: string;
    mobileMenuOpenAriaLabel: string;
    mobileMenuCloseAriaLabel: string;
    /** Petunjuk di kotak pencarian header (dialog). */
    siteSearchPlaceholder: string;
    /** Teks saat tidak ada hasil di dialog pencarian. */
    siteSearchNoResultsText: string;
    navItems: { id: string; label: string; shortLabel: string; href: string }[];
    mobileNavIds: string[];
  };
  hero: {
    brandLabel: string;
    headingLine1: CmsRichTextValue;
    /** Baris tengah heading hero (mis. kata utama). */
    headingMiddle: CmsRichTextValue;
    headingLine2: CmsRichTextValue;
    intro: HeroIntroParts;
    /** Label di atas blok intro (gaya badge); string kosong = baris disembunyikan. */
    introBadge: string;
    prosesBadge: string;
    /**
     * Gambar kecil per-step pada strip "proses kerja" hero — string kosong = pakai fallback SVG icon.
     * Diedit lewat CMS (upload ke scope=hero).
     */
    prosesStepImages: {
      konsultasi: string;
      survey: string;
      produksi: string;
      instalasi: string;
      selesai: string;
    };
    /**
     * Skala tampilan gambar per langkah di kartu strip proses hero (1 = pas penuh kartu).
     * Di bawah 1 memperkecil tampilan; di atas 1 memperbesar (tepi ter-crop). Diedit di CMS.
     */
    prosesStepImageZoom: {
      konsultasi: number;
      survey: number;
      produksi: number;
      instalasi: number;
      selesai: number;
    };
    ctaWhatsApp: { label: string; message: string; ariaLabel: string };
    ctaSecondary: { label: string; href: string; ariaLabel: string };
    slides: HeroSlideEntry[];
    backgroundVideo: null | {
      src: string;
      poster?: string;
      muted?: boolean;
    };
  };
  tentang: {
    sectionLabel: string;
    heading: string;
    lead: string;
    body: CmsRichTextValue;
    valuesHeading: string;
    values: string[];
    imageSrc: string;
    imageAlt: string;
    figcaptionSr: string;
    /** Penyesuaian tampilan gambar section (object-fit, focal, zoom). */
    imageAdjust?: Partial<CmsImageTransform>;
  };
  layanan: {
    sectionLabel: string;
    heading: string;
    lead: string;
    quote: string;
    cards: {
      id: string;
      folderSlug: string;
      title: string;
      body: string[];
      photos?: ({ src: string; alt: string } & Partial<CmsImageTransform>)[];
    }[];
  };
  produk: {
    sectionLabel: string;
    heading: string;
    lead: string;
    closingBlurb: string;
    closingCtaLabel: string;
    closingCtaMessage: string;
    featuredImages: {
      utama: FeaturedImagePair;
      solusi: FeaturedImagePair;
      accessories: FeaturedImagePair;
    };
    categories: ProductB2BCategoryData[];
  };
  serviceMaintenance: ProductB2BCategoryData;
  portfolio: {
    sectionLabel: string;
    heading: string;
    lead: string;
    projects: {
      id: string;
      name: string;
      location: string;
      workType: string;
      /** Video hero (path `/...` atau URL embed). */
      videoSrc?: string;
      videoPosterSrc?: string;
      /** Autoplay muted + loop — hanya untuk file video lokal/web yang mendukung. */
      videoAutoplay?: boolean;
      /** Jika tidak ada video: gambar hero di atas kartu. */
      coverImageSrc?: string;
      coverImageAlt?: string;
      /** Foto bergeser otomatis di bawah video/gambar hero. */
      galleryPhotos?: { src: string; alt: string }[];
    }[];
    projectLocationLabel: string;
    projectWorkTypeLabel: string;
    editorAddProjectLabel: string;
    galleryHint: string;
    galleryLinkLabel: string;
  };
  customersPartners: {
    heading: string;
    partnerHeading: string;
    editorIndustriesLabel: string;
    editorAddIndustryLabel: string;
    editorAddPartnerLabel: string;
    industries: { id: string; label: string; logoSrc: string; logoAlt: string; logoAdjust?: Partial<CmsImageTransform> }[];
    partners: {
      id: string;
      name: string;
      logoSrc: string;
      logoAlt: string;
      width: number;
      height: number;
      logoAdjust?: Partial<CmsImageTransform>;
    }[];
  };
  keunggulan: {
    sectionLabel: string;
    heading: string;
    lead: string;
    statsHeading: string;
    editorHint: string;
    editorAddCardLabel: string;
    cards: { id: string; title: string; body: string; iconKey: KeunggulanCardIconKey }[];
    stats: {
      value: string;
      label: string;
      iconKey: KeunggulanStatIconKey;
      labelMobileLines?: [string, string];
    }[];
  };
  ctaMid: {
    title: string;
    subtitle: string;
    buttonLabel: string;
    whatsappMessage: string;
  };
  faq: {
    sectionLabel: string;
    heading: string;
    lead: string;
    items: { id: string; q: string; a: string }[];
    ctaLabel: string;
    ctaMessage: string;
  };
  kontak: {
    heading: string;
    badge: string;
    intro: string;
    waCtaLabel: string;
    waMessage: string;
    detailHeading: string;
    phoneLabel: string;
    whatsappLabel: string;
    emailLabel: string;
    addressLabel: string;
    socialHeading: string;
    socialLead: string;
    operationalLabel: string;
    operationalHours: string;
    mapTitle: string;
    phone: string;
    phoneTel: string;
    whatsappDisplay: string;
    email: string;
    addressLines: string[];
    mapEmbedUrl: string;
  };
  footer: {
    copyrightLine: string;
    social: {
      instagram: string;
      linkedin: string;
      facebook: string;
      tiktok: string;
      youtube: string;
      x: string;
    };
    quickLinks: { id: string; label: string; href: string }[];
  };
  /** Konten halaman `/artikel/layanan` — teks & hero (editable CMS). */
  layananPages: LayananPagesCmsContent;
  /** Indeks `/artikel/lokasi` + override sparse URL landing kota (`/cold-storage-*`, dll.). */
  landingKotaPages: LandingKotaPagesCmsContent;
  /** @deprecated Gunakan `layananPages.pages` slug `cold-storage`; disinkronkan saat normalize. */
  coldStoragePage: {
    heroImageSrc: string;
    heroImageAlt: string;
  };
  galleryPage: {
    loadingText: string;
    title: string;
    filterAriaLabel: string;
    listAriaLabel: string;
    resultPrefix: string;
    resultCategoryText: string;
    resultSearchPrefix: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    sortAriaLabel: string;
    sortDefault: string;
    sortLatest: string;
    sortOldest: string;
    sortNameAsc: string;
    sortNameDesc: string;
    emptyNoResultPrefix: string;
    emptyNoResultSearchSuffix: string;
    emptyNoCategoryPrefix: string;
    loadMoreLabel: string;
    addProjectLabel: string;
    authTitle: string;
    authLead: string;
    authPasswordLabel: string;
    authCancelLabel: string;
    authContinueLabel: string;
    authContinueBusyLabel: string;
    authAccessBadge: string;
    authCloseAriaLabel: string;
    authDeniedError: string;
    deleteConfirmTemplate: string;
    deleteFailedError: string;
    toastAddedTitle: string;
    toastUpdatedTitle: string;
    toastAddedBodyPrefix: string;
    toastAddedBodySuffix: string;
    toastUpdatedBody: string;
    toastCloseAriaLabel: string;
    categoryLabels: {
      all: string;
      coldStorage: string;
      csPortable: string;
      abf: string;
      prosesArea: string;
      cleanRoom: string;
      refrigeration: string;
      maintenance: string;
    };
  };

  /** Override halaman detail produk per slug (gabung dengan `RICH_PRODUCT_DETAILS`). */
  productRichOverrides?: Record<string, Partial<RichProductDetail>>;

  /** Override tampilan kartu katalog & hero halaman detail per slug. */
  productPageOverrides?: Record<
    string,
    {
      title?: string;
      subtitle?: string;
      badge?: string;
      imageSrc?: string;
      description?: string;
    }
  >;

  /** Urutan & visibilitas section beranda (id section). */
  homeLayout?: {
    sectionOrder: string[];
    hiddenSections: string[];
  };
};

export type SiteContentOverridesFile = Partial<SiteContent> & { version?: 1 };
