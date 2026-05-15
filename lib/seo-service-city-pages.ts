import type { Metadata } from "next";

import type { ProjectCategory } from "@/components/aytipanel/gallery-project-data";
import { getCityPlacename, buildHtmlGeoMetaForCityKey } from "@/lib/seo-cities";
import {
  INDONESIA_SERVICE_AREA_CITIES,
  INDONESIA_SERVICE_AREA_CITY_KEYS,
} from "@/lib/indonesia-service-area-cities";
import { getLocalSeoCityProfile } from "@/lib/local-seo-city-profiles";
import { applyServiceCityCmsOverlay, readServiceCityCmsOverlayFile } from "@/lib/cms-content/city-overlay-file";
import {
  applyLandingKotaCmsEntryToServiceOverlay,
  getLandingKotaPageEntryFromContent,
} from "@/lib/landing-kota-pages/cms-merge";
import type { ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";
import { serviceCityPagePath } from "@/lib/seo-service-paths";
import { getSeoRootServiceByUrlSlug } from "@/lib/seo-services";
import type { SiteContent } from "@/lib/site-content-model";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import type { WhatsAppMessageContext } from "@/utils/whatsapp";

/** @deprecated Gunakan `ServiceCityPageDef.serviceUrlSlug`. */
export const LOCAL_SEO_PRODUCT_BASES = [
  "cold-storage",
  "sandwich-panel",
  "cold-room",
  "blast-freezer",
  "sandwich-panel-pu",
] as const;
export type LocalSeoProductBase = (typeof LOCAL_SEO_PRODUCT_BASES)[number];

export type LocalSeoFaqItem = { question: string; answer: string };
export type LocalSeoServiceLink = { slug: string; label: string };

export type ServiceCityPageDef = {
  slug: string;
  serviceUrlSlug: string;
  layananSlug: string;
  /** Alias historis untuk kompatibilitas komponen lama. */
  productBase: LocalSeoProductBase;
  cityKey: string;
  topicLabel: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  hero: {
    subheadline: string;
    lead: string;
    bullets: string[];
    imageSrc: string;
    imageAlt: string;
  };
  cityContext: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    industryTags: string[];
    coverageAreas: string[];
  };
  applications: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  advantages: string[];
  specs: { label: string; value: string }[];
  portfolioCategories: Exclude<ProjectCategory, "All">[];
  faq: LocalSeoFaqItem[];
  relatedServiceLinks: LocalSeoServiceLink[];
  relatedProductSlugs: string[];
  siblingCityKeys: string[];
  whatsAppContext: WhatsAppMessageContext;
  waTopicPhrase: string;
};

/** Alias kompatibilitas — sama dengan `ServiceCityPageDef`. */
export type LocalSeoCityPageDef = ServiceCityPageDef;

type ServiceCityKey =
  | "cold-storage"
  | "cold-room"
  | "blast-freezer"
  | "sandwich-panel-pu"
  | "sandwich-panel";

const BRAND_TAGLINE = "Solusi Sistem Pendingin Terintegrasi";

const SERVICE_CONFIG: Record<
  ServiceCityKey,
  {
    topicLabel: string;
    heroImage: string;
    serviceUrlSlug: string;
    layananSlug: string;
    citySlugPrefix: string;
    relatedServiceLinks: LocalSeoServiceLink[];
    relatedProductSlugs: string[];
    portfolioCategories: Exclude<ProjectCategory, "All">[];
    whatsAppContext: WhatsAppMessageContext;
    keywords: string[];
  }
> = {
  "cold-storage": {
    topicLabel: "Cold storage",
    heroImage: "/images/spesialisasi/spesialisasi-coldstorage.png",
    serviceUrlSlug: "cold-storage",
    layananSlug: "cold-storage",
    citySlugPrefix: "cold-storage",
    relatedServiceLinks: [
      { slug: "cold-storage", label: "Cold storage industri" },
      { slug: "cold-storage-portable", label: "Cold storage portable" },
      { slug: "refrigeration-system", label: "Sistem refrigerasi" },
      { slug: "cold-room", label: "Cold room" },
    ],
    relatedProductSlugs: [
      "cold-storage-custom",
      "cold-storage-portable",
      "sandwich-panel-pu-camelock",
      "sistem-refrigerasi",
      "pintu-panel",
    ],
    portfolioCategories: ["Cold Storage"],
    whatsAppContext: "solusi_sistem",
    keywords: ["cold storage", "ruang pendingin", "pendingin industri", "cold room", "gudang dingin"],
  },
  "cold-room": {
    topicLabel: "Cold room",
    heroImage: "/images/layanan/instalasi-panel-cold-room/1.jpg",
    serviceUrlSlug: "cold-room",
    layananSlug: "cold-room-door",
    citySlugPrefix: "cold-room",
    relatedServiceLinks: [
      { slug: "cold-room", label: "Cold room & pintu" },
      { slug: "cold-storage", label: "Cold storage" },
      { slug: "sandwich-panel-pu", label: "Sandwich panel PU" },
      { slug: "refrigeration-system", label: "Sistem refrigerasi" },
    ],
    relatedProductSlugs: ["cold-storage-custom", "pintu-panel", "sandwich-panel-pu-camelock", "sistem-refrigerasi"],
    portfolioCategories: ["Cold Storage", "Proses Area"],
    whatsAppContext: "solusi_sistem",
    keywords: ["cold room", "chiller room", "ruang pendingin", "pendingin ruangan"],
  },
  "blast-freezer": {
    topicLabel: "Blast freezer",
    heroImage: "/images/layanan/testing-commissioning/1.jpg",
    serviceUrlSlug: "blast-freezer",
    layananSlug: "blast-freezer",
    citySlugPrefix: "blast-freezer",
    relatedServiceLinks: [
      { slug: "blast-freezer", label: "Blast freezer / ABF" },
      { slug: "cold-storage", label: "Cold storage" },
      { slug: "refrigeration-system", label: "Sistem refrigerasi" },
      { slug: "sandwich-panel-pu", label: "Sandwich panel PU" },
    ],
    relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "sistem-refrigerasi"],
    portfolioCategories: ["ABF (Air Blast Freezer)", "Cold Storage"],
    whatsAppContext: "solusi_sistem",
    keywords: ["blast freezer", "ABF", "pembekuan cepat", "freezer room"],
  },
  "sandwich-panel-pu": {
    topicLabel: "Sandwich panel PU",
    heroImage: "/images/spesialisasi/spesialisasi-pu.png",
    serviceUrlSlug: "sandwich-panel-pu",
    layananSlug: "sandwich-panel-pu",
    citySlugPrefix: "sandwich-panel-pu",
    relatedServiceLinks: [
      { slug: "sandwich-panel-pu", label: "Sandwich panel PU" },
      { slug: "sandwich-panel-knock-down", label: "Panel knock down" },
      { slug: "cold-storage", label: "Cold storage" },
      { slug: "refrigeration-system", label: "Sistem refrigerasi" },
    ],
    relatedProductSlugs: [
      "sandwich-panel-pu-camelock",
      "sandwich-panel-pu-full-knock-down",
      "sandwich-panel-eps",
      "pintu-panel",
    ],
    portfolioCategories: ["Cold Storage", "Proses Area"],
    whatsAppContext: "produk",
    keywords: ["sandwich panel", "panel PU", "cold room", "panel insulasi", "sandwich panel knock down"],
  },
  "sandwich-panel": {
    topicLabel: "Sandwich panel",
    heroImage: "/images/spesialisasi/spesialisasi-pu.png",
    serviceUrlSlug: "sandwich-panel-pu",
    layananSlug: "sandwich-panel-pu",
    citySlugPrefix: "sandwich-panel",
    relatedServiceLinks: [
      { slug: "sandwich-panel-pu", label: "Sandwich panel PU" },
      { slug: "sandwich-panel-knock-down", label: "Panel knock down" },
      { slug: "cold-storage", label: "Cold storage" },
      { slug: "refrigeration-system", label: "Sistem refrigerasi" },
    ],
    relatedProductSlugs: [
      "sandwich-panel-pu-camelock",
      "sandwich-panel-pu-full-knock-down",
      "sandwich-panel-eps",
      "pintu-panel",
    ],
    portfolioCategories: ["Cold Storage", "Proses Area"],
    whatsAppContext: "produk",
    keywords: ["sandwich panel", "panel PU", "cold room", "panel insulasi"],
  },
};

const CITY_PREFIXES = (
  Object.values(SERVICE_CONFIG).map((c) => c.citySlugPrefix) as string[]
).sort((a, b) => b.length - a.length);

const SHARED_ADVANTAGES = [
  "Survey kebutuhan dan desain layout sebelum fabrikasi",
  "Koordinasi panel, pintu, dan mesin pendingin dalam satu tim",
  "Material dan ketebalan panel disesuaikan target suhu proyek",
  "Instalasi terstruktur hingga uji pull-down / commissioning",
  "Dukungan teknis pasca handover untuk stabilitas operasional",
] as const;

function hashNum(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function siblingCityKeys(cityKey: string, prefix: string): string[] {
  const keys = INDONESIA_SERVICE_AREA_CITY_KEYS.filter((k) => k !== cityKey);
  const start = hashNum(`${prefix}-${cityKey}`) % keys.length;
  const out: string[] = [];
  for (let i = 0; i < keys.length && out.length < 8; i++) {
    out.push(keys[(start + i) % keys.length]!);
  }
  return out;
}

function applyBrandToMetaTitle(template: string, brand: string): string {
  return template.replace(/\{brand\}/g, brand);
}

function buildColdStoragePage(
  cityKey: string,
  profile: ReturnType<typeof getLocalSeoCityProfile>,
): ServiceCityPageDef {
  const { placename, displayLabel } = profile;
  const cfg = SERVICE_CONFIG["cold-storage"];
  const slug = `${cfg.citySlugPrefix}-${cityKey}`;

  return {
    slug,
    serviceUrlSlug: cfg.serviceUrlSlug,
    layananSlug: cfg.layananSlug,
    productBase: "cold-storage",
    cityKey,
    topicLabel: cfg.topicLabel,
    h1: `Jasa Cold Storage ${placename} untuk Industri & Komersial`,
    metaTitle: `Cold storage ${placename} | ruang dingin & refrigerasi | {brand}`,
    metaDescription: `Cold storage ${displayLabel}: sandwich panel, cold room, chiller/freezer, sistem refrigerasi, dan commissioning. Konsultasi teknis ${BRAND_TAGLINE} — PT AYTI INDO PANEL.`,
    keywords: [...cfg.keywords, `cold storage ${cityKey}`, `ruang pendingin ${placename}`],
    hero: {
      subheadline: `${BRAND_TAGLINE} — area ${displayLabel}`,
      lead: profile.industrialContext,
      bullets: [
        `Desain cold storage untuk operasional di ${placename} dan koridor industri terdekat`,
        "Panel insulasi, pintu cold room, dan mesin pendingin terintegrasi",
        "Survey lokasi, fabrikasi, instalasi, hingga uji performa suhu",
      ],
      imageSrc: cfg.heroImage,
      imageAlt: `Cold storage industri di ${placename}`,
    },
    cityContext: {
      eyebrow: `Konteks ${placename}`,
      title: `Cold storage untuk industri di ${displayLabel}`,
      paragraphs: [
        profile.industrialContext,
        `Untuk proyek di ${placename}, kami menyesuaikan kapasitas dingin, zonasi suhu, dan akses loading agar selaras dengan SOP gudang atau pabrik Anda.`,
        `Tim kami mendampingi dari data beban dingin kasar, pemilihan panel PU/EPS, hingga commissioning agar target suhu tercapai sebelum serah terima.`,
      ],
      industryTags: profile.industryTags,
      coverageAreas: profile.coverageAreas,
    },
    applications: profile.typicalApplications,
    benefits: [
      {
        title: "Stabilitas suhu operasional",
        body: `Cold room di ${placename} dirancang mempertahankan setpoint saat buka pintu dan traffic forklift tinggi.`,
      },
      {
        title: "Efisiensi energi",
        body: "Ketebalan panel dan seleksi mesin pendingin diselaraskan beban dingin agar konsumsi listrik terkontrol.",
      },
      {
        title: "Skalabilitas",
        body: "Modul portable atau ekspansi ruang dingin dapat direncanakan sejak tahap desain awal.",
      },
    ],
    advantages: [...SHARED_ADVANTAGES],
    specs: [
      { label: "Area layanan", value: displayLabel },
      { label: "Komponen", value: "Panel insulasi, pintu cold room, evaporator, compressor, kontrol suhu" },
      { label: "Target suhu", value: "Chiller hingga freezer — disesuaikan komoditas" },
      { label: "Proses", value: "Survey → desain → fabrikasi → instalasi → uji pull-down → handover" },
    ],
    portfolioCategories: cfg.portfolioCategories,
    faq: [
      {
        question: `Berapa lama proyek cold storage di ${placename} biasanya selesai?`,
        answer:
          "Tergantung ukuran ruangan, kompleksitas refrigerasi, dan kesiapan site. Estimasi awal diberikan setelah data beban dingin tersedia.",
      },
      {
        question: `Apakah bisa survey lokasi di ${displayLabel}?`,
        answer:
          "Ya. Kami memetakan layout, akses truk, sumber listrik, dan kebutuhan zonasi suhu sebelum penawaran teknis.",
      },
    ],
    relatedServiceLinks: cfg.relatedServiceLinks,
    relatedProductSlugs: cfg.relatedProductSlugs,
    siblingCityKeys: siblingCityKeys(cityKey, cfg.citySlugPrefix),
    whatsAppContext: cfg.whatsAppContext,
    waTopicPhrase: `cold storage di ${placename}`,
  };
}

function buildColdRoomPage(
  cityKey: string,
  profile: ReturnType<typeof getLocalSeoCityProfile>,
): ServiceCityPageDef {
  const { placename, displayLabel } = profile;
  const cfg = SERVICE_CONFIG["cold-room"];
  const slug = `${cfg.citySlugPrefix}-${cityKey}`;

  return {
    slug,
    serviceUrlSlug: cfg.serviceUrlSlug,
    layananSlug: cfg.layananSlug,
    productBase: "cold-room",
    cityKey,
    topicLabel: cfg.topicLabel,
    h1: `Cold Room & Ruang Pendingin ${placename} — Instalasi Panel & Pintu`,
    metaTitle: `Cold room ${placename} | chiller room & panel insulasi | {brand}`,
    metaDescription: `Cold room ${displayLabel}: panel insulasi, pintu cold storage, evaporator & compressor, kontrol suhu. Untuk distribusi dingin dan pabrik — PT AYTI INDO PANEL.`,
    keywords: [...cfg.keywords, `cold room ${cityKey}`, `ruang pendingin ${placename}`],
    hero: {
      subheadline: `${BRAND_TAGLINE} — ${displayLabel}`,
      lead: profile.industrialContext,
      bullets: [
        `Cold room modular untuk operasional di ${placename}`,
        "Panel PU/EPS, pintu insulated, dan refrigerasi terkoordinasi",
        "Survey, fabrikasi, instalasi, hingga commissioning suhu",
      ],
      imageSrc: cfg.heroImage,
      imageAlt: `Cold room di ${placename}`,
    },
    cityContext: {
      eyebrow: `Konteks ${placename}`,
      title: `Cold room untuk proyek di ${displayLabel}`,
      paragraphs: [
        profile.industrialContext,
        `Di ${placename}, zonasi chiller/freezer dan desain pintu menentukan stabilitas suhu saat traffic operasional tinggi.`,
        "Kami menyatukan panel, pintu cold room, dan tuning refrigerasi agar parameter operasi aman jangka panjang.",
      ],
      industryTags: profile.industryTags,
      coverageAreas: profile.coverageAreas,
    },
    applications: profile.typicalApplications,
    benefits: [
      {
        title: "Zonasi suhu jelas",
        body: `Pemisahan chiller dan freezer disesuaikan alur komoditas di ${placename}.`,
      },
      {
        title: "Pintu & seal presisi",
        body: "Hardware dan seal dirancang untuk frekuensi buka tinggi dan suhu rendah.",
      },
      {
        title: "Retrofit modular",
        body: "Panel knock down memudahkan pemasangan di site dengan akses terbatas.",
      },
    ],
    advantages: [...SHARED_ADVANTAGES],
    specs: [
      { label: "Area layanan", value: displayLabel },
      { label: "Komponen", value: "Panel insulasi, pintu cold room, unit pendingin, kontrol" },
      { label: "Aplikasi", value: "Chiller room, freezer room, staging distribusi" },
      { label: "Proses", value: "Survey → desain → fabrikasi → instalasi → commissioning" },
    ],
    portfolioCategories: cfg.portfolioCategories,
    faq: [
      {
        question: `Bisakah cold room dipasang di lantai produksi existing di ${placename}?`,
        answer:
          "Bisa setelah audit struktur, drainase, dan daya listrik. Retrofit sering memakai panel modular knock down.",
      },
      {
        question: `Apakah bisa survey di ${displayLabel}?`,
        answer: "Ya — kami petakan layout, akses, dan kebutuhan suhu sebelum penawaran teknis.",
      },
    ],
    relatedServiceLinks: cfg.relatedServiceLinks,
    relatedProductSlugs: cfg.relatedProductSlugs,
    siblingCityKeys: siblingCityKeys(cityKey, cfg.citySlugPrefix),
    whatsAppContext: cfg.whatsAppContext,
    waTopicPhrase: `cold room ${placename}`,
  };
}

function buildBlastFreezerPage(
  cityKey: string,
  profile: ReturnType<typeof getLocalSeoCityProfile>,
): ServiceCityPageDef {
  const { placename, displayLabel } = profile;
  const cfg = SERVICE_CONFIG["blast-freezer"];
  const slug = `${cfg.citySlugPrefix}-${cityKey}`;

  return {
    slug,
    serviceUrlSlug: cfg.serviceUrlSlug,
    layananSlug: cfg.layananSlug,
    productBase: "blast-freezer",
    cityKey,
    topicLabel: cfg.topicLabel,
    h1: `Blast Freezer & ABF ${placename} — Pembekuan Cepat Industri`,
    metaTitle: `Blast freezer ${placename} | ABF & pembekuan cepat | {brand}`,
    metaDescription: `Blast freezer ${displayLabel}: air blast freezer (ABF), panel insulated, pull-down terukur untuk seafood, daging, dan frozen food — PT AYTI INDO PANEL.`,
    keywords: [...cfg.keywords, `blast freezer ${cityKey}`, `ABF ${placename}`],
    hero: {
      subheadline: `Pembekuan cepat — ${displayLabel}`,
      lead: profile.industrialContext,
      bullets: [
        `ABF dan blast freezer untuk line produksi di ${placename}`,
        "Kapasitas pull-down disesuaikan throughput batch",
        "Panel insulasi + refrigerasi high-capacity terintegrasi",
      ],
      imageSrc: cfg.heroImage,
      imageAlt: `Blast freezer industri di ${placename}`,
    },
    cityContext: {
      eyebrow: `Konteks ${placename}`,
      title: `Blast freezer untuk industri di ${displayLabel}`,
      paragraphs: [
        profile.industrialContext,
        `Untuk operasional ${placename}, laju pembekuan dan sirkulasi udara menjadi parameter kritis kualitas produk.`,
        "Kami merancang ABF sebagai sistem lengkap — envelope, airflow, dan kapasitas pendingin selaras beban produksi.",
      ],
      industryTags: profile.industryTags,
      coverageAreas: profile.coverageAreas,
    },
    applications: profile.typicalApplications,
    benefits: [
      {
        title: "Pull-down terukur",
        body: `Target suhu core dan waktu siklus didefinisikan per komoditas di ${placename}.`,
      },
      {
        title: "Profil udara presisi",
        body: "Layout rak dan kemasan disesuaikan forced-air circulation.",
      },
      {
        title: "Integrasi cold chain",
        body: "Dapat dihubungkan dengan cold storage staging hulu/hilir.",
      },
    ],
    advantages: [...SHARED_ADVANTAGES],
    specs: [
      { label: "Area layanan", value: displayLabel },
      { label: "Suhu ruangan", value: "Umum −35 hingga −40 °C (sesuai komoditas)" },
      { label: "Aplikasi", value: "Seafood, daging, bakery beku, export commodity" },
      { label: "Proses", value: "Survey → desain → fabrikasi → instalasi → uji pull-down" },
    ],
    portfolioCategories: cfg.portfolioCategories,
    faq: [
      {
        question: `Berapa kapasitas blast freezer yang umum di ${placename}?`,
        answer:
          "Sangat bervariasi menurut throughput. Kami hitung dari data produksi per jam dan target waktu pembekuan.",
      },
      {
        question: `Apakah bisa survey di ${displayLabel}?`,
        answer: "Ya — audit termal dan layout line dilakukan sebelum penawaran teknis.",
      },
    ],
    relatedServiceLinks: cfg.relatedServiceLinks,
    relatedProductSlugs: cfg.relatedProductSlugs,
    siblingCityKeys: siblingCityKeys(cityKey, cfg.citySlugPrefix),
    whatsAppContext: cfg.whatsAppContext,
    waTopicPhrase: `blast freezer / ABF ${placename}`,
  };
}

function buildSandwichPanelPage(
  serviceKey: "sandwich-panel-pu" | "sandwich-panel",
  cityKey: string,
  profile: ReturnType<typeof getLocalSeoCityProfile>,
): ServiceCityPageDef {
  const { placename, displayLabel } = profile;
  const cfg = SERVICE_CONFIG[serviceKey];
  const slug = `${cfg.citySlugPrefix}-${cityKey}`;
  const productBase: LocalSeoProductBase = serviceKey;

  return {
    slug,
    serviceUrlSlug: cfg.serviceUrlSlug,
    layananSlug: cfg.layananSlug,
    productBase,
    cityKey,
    topicLabel: cfg.topicLabel,
    h1: `Sandwich Panel PU ${placename} untuk Cold Room & Industri`,
    metaTitle: `Sandwich panel ${placename} | PU, knock down & EPS | {brand}`,
    metaDescription: `Sandwich panel ${displayLabel}: core PU (CameLock / knock down) dan EPS. Cocok cold room, chiller, freezer — PT AYTI INDO PANEL.`,
    keywords: [...cfg.keywords, `sandwich panel ${cityKey}`, `panel PU ${placename}`],
    hero: {
      subheadline: `Panel insulasi — ${displayLabel}`,
      lead: profile.industrialContext,
      bullets: [
        `Panel PU dan EPS untuk proyek cold room di ${placename}`,
        "Sambungan CamLock atau knock down sesuai mobilitas site",
        "Konsultasi ketebalan panel berdasarkan target suhu",
      ],
      imageSrc: cfg.heroImage,
      imageAlt: `Sandwich panel untuk cold room di ${placename}`,
    },
    cityContext: {
      eyebrow: `Konteks ${placename}`,
      title: `Sandwich panel untuk proyek di ${displayLabel}`,
      paragraphs: [
        profile.industrialContext,
        `Di ${placename}, panel insulasi dipakai untuk ekspansi gudang dingin, retrofit cold room, atau line produksi baru.`,
        "Kami membantu hitung beban dingin kasar sebagai input awal desain ketebalan panel dan integrasi pintu.",
      ],
      industryTags: profile.industryTags,
      coverageAreas: profile.coverageAreas,
    },
    applications: profile.typicalApplications,
    benefits: [
      {
        title: "Performa termal presisi",
        body: `Ketebalan inti panel disesuaikan target suhu operasi di ${placename}.`,
      },
      {
        title: "Kecepatan pemasangan",
        body: "Sistem modular CamLock atau knock down mempercepat mobilisasi ruang dingin.",
      },
      {
        title: "Fleksibilitas proyek",
        body: "Cocok cold room baru, perluasan gudang, maupun partition industri insulated.",
      },
    ],
    advantages: [...SHARED_ADVANTAGES],
    specs: [
      { label: "Area layanan", value: displayLabel },
      { label: "Varian panel", value: "PU CameLock, PU knock down, EPS ekonomis" },
      { label: "Aplikasi", value: "Cold room, chiller, freezer, partition industri" },
      { label: "Parameter", value: "Ketebalan inti & sambungan — disesuaikan suhu target" },
    ],
    portfolioCategories: cfg.portfolioCategories,
    faq: [
      {
        question: `Bisa konsultasi sandwich panel untuk proyek di ${placename}?`,
        answer:
          "Ya. Kirimkan gambar denah, target suhu, dan jenis komoditas; kami sarankan ketebalan panel dan integrasi pintu.",
      },
      {
        question: `Apakah melayani pengiriman panel ke ${displayLabel}?`,
        answer: "Koordinasi logistik mengikuti jadwal fabrikasi dan akses site setelah spesifikasi teknis fix.",
      },
    ],
    relatedServiceLinks: cfg.relatedServiceLinks,
    relatedProductSlugs: cfg.relatedProductSlugs,
    siblingCityKeys: siblingCityKeys(cityKey, cfg.citySlugPrefix),
    whatsAppContext: cfg.whatsAppContext,
    waTopicPhrase: `sandwich panel proyek ${placename}`,
  };
}

const SERVICE_BUILDERS: Record<
  ServiceCityKey,
  (cityKey: string, profile: ReturnType<typeof getLocalSeoCityProfile>) => ServiceCityPageDef
> = {
  "cold-storage": buildColdStoragePage,
  "cold-room": buildColdRoomPage,
  "blast-freezer": buildBlastFreezerPage,
  "sandwich-panel-pu": (cityKey, profile) => buildSandwichPanelPage("sandwich-panel-pu", cityKey, profile),
  "sandwich-panel": (cityKey, profile) => buildSandwichPanelPage("sandwich-panel", cityKey, profile),
};

const SERVICE_CITY_KEYS: ServiceCityKey[] = [
  "cold-storage",
  "cold-room",
  "blast-freezer",
  "sandwich-panel-pu",
  "sandwich-panel",
];

function buildPage(serviceKey: ServiceCityKey, cityKey: string): ServiceCityPageDef | null {
  if (!INDONESIA_SERVICE_AREA_CITIES[cityKey]) return null;
  const profile = getLocalSeoCityProfile(cityKey);
  return SERVICE_BUILDERS[serviceKey](cityKey, profile);
}

const ALL_SERVICE_CITY_PAGES: ServiceCityPageDef[] = SERVICE_CITY_KEYS.flatMap((serviceKey) =>
  INDONESIA_SERVICE_AREA_CITY_KEYS.map((cityKey) => buildPage(serviceKey, cityKey)).filter(
    (p): p is ServiceCityPageDef => Boolean(p),
  ),
);

const CITY_BY_SLUG = new Map(ALL_SERVICE_CITY_PAGES.map((p) => [p.slug, p]));

export function parseServiceCitySlug(
  slug: string,
): { serviceKey: ServiceCityKey; cityKey: string } | null {
  for (const prefix of CITY_PREFIXES) {
    const needle = `${prefix}-`;
    if (!slug.startsWith(needle)) continue;
    const cityKey = slug.slice(needle.length);
    if (!cityKey || !INDONESIA_SERVICE_AREA_CITIES[cityKey]) return null;
    const serviceKey = (Object.keys(SERVICE_CONFIG) as ServiceCityKey[]).find(
      (k) => SERVICE_CONFIG[k].citySlugPrefix === prefix,
    );
    if (!serviceKey) return null;
    return { serviceKey, cityKey };
  }
  return null;
}

/** @deprecated Gunakan `parseServiceCitySlug`. */
export function parseLocalSeoCitySlug(slug: string): {
  productBase: LocalSeoProductBase;
  cityKey: string;
} | null {
  const parsed = parseServiceCitySlug(slug);
  if (!parsed) return null;
  return { productBase: parsed.serviceKey, cityKey: parsed.cityKey };
}

export function isServiceCitySlug(slug: string): boolean {
  return CITY_BY_SLUG.has(slug);
}

/** @deprecated Gunakan `isServiceCitySlug`. */
export function isLocalSeoCitySlug(slug: string): boolean {
  return isServiceCitySlug(slug);
}

export function getServiceCityPageBySlug(slug: string): ServiceCityPageDef | undefined {
  return CITY_BY_SLUG.get(slug);
}

/** @deprecated Gunakan `getServiceCityPageBySlug`. */
export function getLocalSeoCityPageBySlug(slug: string): ServiceCityPageDef | undefined {
  return getServiceCityPageBySlug(slug);
}

export function getAllServiceCitySlugs(): string[] {
  return ALL_SERVICE_CITY_PAGES.map((p) => p.slug);
}

/** @deprecated Gunakan `getAllServiceCitySlugs`. */
export function getAllLocalSeoCitySlugs(): string[] {
  return getAllServiceCitySlugs();
}

export function localSeoCityPagePath(slug: string): string {
  return serviceCityPagePath(slug);
}

export function buildServiceCitySeoOverlay(page: ServiceCityPageDef): ServiceCitySeoOverlay {
  const placename = getCityPlacename(page.cityKey);
  const root = getSeoRootServiceByUrlSlug(page.serviceUrlSlug);
  const serviceRootPath = root ? `/${root.urlSlug}` : `/${page.serviceUrlSlug}`;
  const cfg = SERVICE_CONFIG[page.productBase as ServiceCityKey];
  const citySlugPrefix = cfg?.citySlugPrefix ?? page.serviceUrlSlug;

  return {
    slug: page.slug,
    cityKey: page.cityKey,
    placename,
    displayLabel: INDONESIA_SERVICE_AREA_CITIES[page.cityKey]?.displayLabel ?? placename,
    serviceUrlSlug: page.serviceUrlSlug,
    serviceRootPath,
    hubSlug: `lokasi-${page.cityKey}`,
    h1: page.h1,
    heroSubheadline: page.hero.subheadline,
    heroLead: page.hero.lead,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    keywords: page.keywords,
    introParagraph: page.cityContext.paragraphs[1] ?? page.cityContext.paragraphs[0],
    coverageAreas: page.cityContext.coverageAreas,
    industryTags: page.cityContext.industryTags,
    siblingCities: page.siblingCityKeys.map((k) => ({
      slug: `${citySlugPrefix}-${k}`,
      label: getCityPlacename(k),
    })),
    waTopicPhrase: page.waTopicPhrase,
    faqExtras: page.faq,
  };
}

export async function loadServiceCitySeoOverlayMerged(
  slug: string,
  siteContent?: SiteContent,
): Promise<ServiceCitySeoOverlay | null> {
  const page = getServiceCityPageBySlug(slug);
  if (!page) return null;
  const file = await readServiceCityCmsOverlayFile(slug);
  let overlay = applyServiceCityCmsOverlay(buildServiceCitySeoOverlay(page), file);
  const entry = siteContent ? getLandingKotaPageEntryFromContent(siteContent.landingKotaPages, slug) : undefined;
  overlay = applyLandingKotaCmsEntryToServiceOverlay(overlay, entry);
  return overlay;
}

export async function resolveServiceCityMetadata(slug: string, content: SiteContent): Promise<Metadata | null> {
  const overlay = await loadServiceCitySeoOverlayMerged(slug, content);
  if (!overlay) return null;
  const page = getServiceCityPageBySlug(slug);
  if (!page) return null;

  const brand = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const title = applyBrandToMetaTitle(overlay.metaTitle, brand);
  const description =
    overlay.metaDescription.length > 160
      ? `${overlay.metaDescription.slice(0, 157)}…`
      : overlay.metaDescription;

  const ss = content.siteSettings;
  const originBase = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const canonical = absoluteUrlFromSite(originBase, serviceCityPagePath(slug));
  const ogImage = resolveOgImageUrl(content, page.hero.imageSrc);
  const noIndex = ss.seoControl.stagingMode === true || ss.seoControl.allowIndexing === false;
  const geoOther = buildHtmlGeoMetaForCityKey(page.cityKey);

  return {
    title,
    description,
    keywords: overlay.keywords,
    alternates: { canonical },
    ...(geoOther ? { other: geoOther } : {}),
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: canonical,
      siteName: ss.siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** @deprecated Gunakan `resolveServiceCityMetadata` (async). */
export async function resolveLocalSeoCityMetadata(
  slug: string,
  content: SiteContent,
): Promise<Metadata | null> {
  return resolveServiceCityMetadata(slug, content);
}

export { BRAND_TAGLINE as LOCAL_SEO_BRAND_TAGLINE };
