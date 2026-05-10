export type BadgeKind = "Best Seller" | "Custom Project" | "Industrial Grade";

/** Dummy Unsplash — crop konsisten; beberapa URL peer tidak aktif (404), diganti setema. */
export const IMG_PANEL =
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80";

export const IMG_COLD_STORAGE =
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80";

export const IMG_FREEZER =
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80";

export const IMG_CLEAN_ROOM =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80";

export const IMG_INDUSTRIAL =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80";

/** Unit HVAC / peralatan refrigerasi komersial — hero halaman Refrigeration System */
export const IMG_REFRIGERATION =
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80";

export type ProductCatalogItem = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: BadgeKind;
  imageSrc: string;
};

export const PRODUCTS: ProductCatalogItem[] = [
  {
    slug: "sandwich-panel-pu-camelock",
    title: "Sandwich Panel PU",
    subtitle: "(CameLock)",
    description:
      "CamLock: sambungan presisi dan kedap udara untuk cold room.",
    badge: "Best Seller",
    imageSrc: IMG_PANEL,
  },
  {
    slug: "sandwich-panel-pu-full-knock-down",
    title: "PU Knock Down Panel System",
    subtitle: "Modular & Flexible Insulation Solution",
    description:
      "Sistem panel insulasi modular knock down untuk pemasangan fleksibel, relokasi, dan performa termal stabil dengan core PU.",
    imageSrc: IMG_PANEL,
  },
  {
    slug: "sandwich-panel-eps",
    title: "EPS Sandwich Panel",
    subtitle: "Efficient & Cost-Effective Insulation Solution",
    description:
      "Panel insulasi ekonomis dengan core EPS ringan untuk konstruksi industri standar — mudah dipasang dan efisien biaya.",
    imageSrc: IMG_PANEL,
  },
  {
    slug: "cold-storage-portable",
    title: "Portable Cold Storage",
    subtitle: "Plug & Play Cooling Solution",
    description:
      "Cold storage portabel plug & play: panel insulasi, unit pendingin, dan kontrol terintegrasi tanpa konstruksi permanen.",
    imageSrc: IMG_COLD_STORAGE,
  },
  {
    slug: "cold-storage-custom",
    title: "Cold Storage System",
    subtitle: "Custom System for Chiller, Freezer & Process Area",
    description:
      "Cold storage custom-engineered terintegrasi: panel insulasi, refrigerasi, pintu cold room, dan kontrol suhu untuk chiller, freezer & process area.",
    badge: "Custom Project",
    imageSrc: IMG_COLD_STORAGE,
  },
  {
    slug: "pembekuan-cepat-abf",
    title: "Air Blast Freezer (ABF)",
    subtitle: "Rapid Freezing System for Industrial Applications",
    description:
      "ABF: pembekuan cepat dengan aliran udara tinggi dan kontrol suhu presisi untuk industri makanan, seafood, dan daging.",
    imageSrc: IMG_FREEZER,
  },
  {
    slug: "clean-room",
    title: "Clean Room",
    description:
      "Suhu dan kebersihan terkontrol untuk industri makanan & farmasi.",
    badge: "Industrial Grade",
    imageSrc: IMG_CLEAN_ROOM,
  },
  {
    slug: "sistem-refrigerasi",
    title: "Refrigeration System",
    subtitle: "Integrated Industrial Cooling System",
    description:
      "Sistem refrigerasi terintegrasi: condensing unit, compressor single/two stage, condenser, evaporator & kontrol remote untuk cold storage dan freezer.",
    imageSrc: IMG_REFRIGERATION,
  },
  {
    slug: "pintu-panel",
    title: "Cold Room Door",
    subtitle: "Insulated Door System for Controlled Environment",
    description:
      "Pintu insulated tinggi untuk cold storage dan ruang bersuhu terkontrol — sealing presisi, sliding/swing, tahan suhu ekstrem.",
    imageSrc: IMG_COLD_STORAGE,
  },
  {
    slug: "loading-dock-system",
    title: "Loading Dock System",
    subtitle: "Efficient & Controlled Docking Solution",
    description:
      "Dock leveler, shelter, high speed door & sectional door untuk bongkar muat efisien, aman, dan kontrol suhu di gudang serta cold storage.",
    imageSrc: IMG_INDUSTRIAL,
  },
  {
    slug: "instalasi-pemasangan",
    title: "Instalasi & Pemasangan",
    description:
      "Pemasangan panel, cold room, dan sistem refrigerasi sesuai standar proyek.",
    imageSrc: IMG_INDUSTRIAL,
  },
  {
    slug: "maintenance-purna-jual",
    title: "Maintenance & Purna Jual",
    description:
      "Servis berkala, perbaikan, suku cadang, dan dukungan setelah operasi.",
    imageSrc: IMG_INDUSTRIAL,
  },
  {
    slug: "maintenance-berkala",
    title: "Maintenance Berkala",
    subtitle: "Preventive Maintenance Program",
    description:
      "Program perawatan terjadwal untuk menjaga performa sistem refrigerasi, kestabilan suhu, dan efisiensi operasional.",
    imageSrc: IMG_INDUSTRIAL,
  },
  {
    slug: "perbaikan-troubleshooting",
    title: "Perbaikan & Troubleshooting",
    subtitle: "Corrective Service Solution",
    description:
      "Layanan diagnosis akar masalah dan perbaikan cepat untuk memulihkan performa sistem pendingin dengan downtime minimal.",
    imageSrc: IMG_COLD_STORAGE,
  },
  {
    slug: "after-sales-support",
    title: "After Sales Support",
    subtitle: "Integrated Technical Support",
    description:
      "Dukungan teknis berkelanjutan setelah instalasi mencakup koordinasi teknisi, spare part, serta pendampingan operasional.",
    imageSrc: IMG_REFRIGERATION,
  },
];

export function getProductBySlug(slug: string): ProductCatalogItem | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
