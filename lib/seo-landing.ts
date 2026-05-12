import type { Metadata } from "next";

import { buildHtmlGeoMetaForCityKey, getCityPlacename } from "@/lib/local-seo-geo";
import type { SiteContent } from "@/lib/site-content-model";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import type { WhatsAppMessageContext } from "@/utils/whatsapp";

export type SeoLandingKind = "product_city" | "product_industry" | "solution_need" | "city_area";

export type SeoFaqItem = { question: string; answer: string };

export type SeoLandingPageDef = {
  kind: SeoLandingKind;
  slug: string;
  topicLabel: string;
  modifierLabel: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  paragraphs: string[];
  faq: SeoFaqItem[];
  relatedProductSlugs: string[];
  whatsAppContext: WhatsAppMessageContext;
  siblingCityKeys?: string[];
  productBaseForSiblings?: string;
  waTopicPhrase: string;
  /** Kunci kota untuk geo meta & area layanan (schema). */
  localSeoCityKey?: string;
  /** Tautan internal ke halaman produk+lokasi (hanya `city_area`). */
  hubServiceSlugs?: string[];
};

const GLOBAL_KEYWORDS = [
  "Castorit",
  "Castotet",
  "Kastorit",
  "Kastorid",
  "pendingin industri",
  "cold room",
  "blast freezer",
  "sandwich panel",
  "ruang pendingin",
  "Panel pendingin",
  "chiller room",
  "freezer room",
  "pendingin ruangan",
  "ABF",
  "Pembekuan cepat",
  "Panel PU",
  "Panel PIU",
  "panel polyuretane",
  "pintu cold storage",
  "freon",
  "mesin pendingin",
  "mesin evaporator",
  "mesin compressor",
  "cold storage",
  "Pendingin",
] as const;

const CITIES: Record<string, string> = {
  jakarta: "Jakarta & Jabodetabek",
  bekasi: "Bekasi & Cikarang",
  surabaya: "Surabaya",
  bandung: "Bandung",
  medan: "Medan",
  semarang: "Semarang",
  tangerang: "Tangerang",
  makassar: "Makassar",
  bali: "Bali",
};

const CITY_KEYS = Object.keys(CITIES);

function uniqBySlug(pages: SeoLandingPageDef[]): SeoLandingPageDef[] {
  const m = new Map<string, SeoLandingPageDef>();
  for (const p of pages) {
    if (!m.has(p.slug)) m.set(p.slug, p);
  }
  return [...m.values()];
}

function siblingCityKeys(cityKey: string): string[] {
  return CITY_KEYS.filter((k) => k !== cityKey);
}

function mergeKeywords(...groups: (string | readonly string[])[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const g of groups) {
    const arr = Array.isArray(g) ? g : [g];
    for (const raw of arr) {
      const k = raw.trim();
      if (!k || seen.has(k.toLowerCase())) continue;
      seen.add(k.toLowerCase());
      out.push(k);
    }
  }
  return out;
}

function productCity(
  productBase: string,
  cityKey: string,
  args: {
    topicLabel: string;
    h1: (city: string) => string;
    metaTitle: (city: string) => string;
    metaDescription: (city: string) => string;
    keywords: string[];
    paragraphs: (city: string) => string[];
    faq: (city: string) => SeoFaqItem[];
    relatedProductSlugs: string[];
    whatsAppContext: WhatsAppMessageContext;
    waTopicPhrase: (city: string) => string;
  },
): SeoLandingPageDef {
  const city = CITIES[cityKey] ?? cityKey;
  const slugKeyword = `${productBase.replace(/-/g, " ")} ${cityKey}`;
  return {
    kind: "product_city",
    slug: `${productBase}-${cityKey}`,
    topicLabel: args.topicLabel,
    modifierLabel: city,
    h1: args.h1(city),
    metaTitle: args.metaTitle(city),
    metaDescription: args.metaDescription(city),
    keywords: mergeKeywords([slugKeyword], args.keywords, GLOBAL_KEYWORDS),
    localSeoCityKey: cityKey,
    paragraphs: args.paragraphs(city),
    faq: args.faq(city),
    relatedProductSlugs: args.relatedProductSlugs,
    whatsAppContext: args.whatsAppContext,
    siblingCityKeys: siblingCityKeys(cityKey),
    productBaseForSiblings: productBase,
    waTopicPhrase: args.waTopicPhrase(city),
  };
}

function productIndustry(
  slug: string,
  args: {
    topicLabel: string;
    modifierLabel: string;
    h1: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    paragraphs: string[];
    faq: SeoFaqItem[];
    relatedProductSlugs: string[];
    whatsAppContext: WhatsAppMessageContext;
    waTopicPhrase: string;
  },
): SeoLandingPageDef {
  return {
    kind: "product_industry",
    slug,
    topicLabel: args.topicLabel,
    modifierLabel: args.modifierLabel,
    h1: args.h1,
    metaTitle: args.metaTitle,
    metaDescription: args.metaDescription,
    keywords: mergeKeywords(args.keywords, GLOBAL_KEYWORDS),
    paragraphs: args.paragraphs,
    faq: args.faq,
    relatedProductSlugs: args.relatedProductSlugs,
    whatsAppContext: args.whatsAppContext,
    waTopicPhrase: args.waTopicPhrase,
  };
}

function solutionNeed(
  slug: string,
  args: Omit<SeoLandingPageDef, "kind" | "slug" | "siblingCityKeys" | "productBaseForSiblings">,
): SeoLandingPageDef {
  return {
    kind: "solution_need",
    slug,
    ...args,
    keywords: mergeKeywords(args.keywords, GLOBAL_KEYWORDS),
  };
}

function buildProductCityPages(
  productBase: string,
  spec: Parameters<typeof productCity>[2],
): SeoLandingPageDef[] {
  return CITY_KEYS.map((cityKey) => productCity(productBase, cityKey, spec));
}

function buildCityAreaHubPages(): SeoLandingPageDef[] {
  return CITY_KEYS.map((cityKey) => {
    const city = CITIES[cityKey] ?? cityKey;
    const placename = getCityPlacename(cityKey);
    const hubServiceSlugs = [
      `cold-storage-${cityKey}`,
      `sandwich-panel-${cityKey}`,
      `cold-room-${cityKey}`,
      `blast-freezer-${cityKey}`,
    ];
    return {
      kind: "city_area",
      slug: `lokasi-${cityKey}`,
      topicLabel: "Area layanan",
      modifierLabel: city,
      h1: `Cold storage, sandwich panel & cold room di ${city} — layanan instalasi`,
      metaTitle: `Cold storage & sandwich panel ${placename} | area layanan | {brand}`,
      metaDescription: `Layanan cold storage, sandwich panel PU/EPS, cold room, dan blast freezer untuk ${city}. Konsultasi teknis, fabrikasi panel, dan instalasi refrigerasi industri.`,
      keywords: mergeKeywords(
        [
          `cold storage ${cityKey}`,
          `sandwich panel ${cityKey}`,
          `cold room ${cityKey}`,
          `blast freezer ${cityKey}`,
          `pendingin industri ${cityKey}`,
        ],
        GLOBAL_KEYWORDS,
      ),
      localSeoCityKey: cityKey,
      hubServiceSlugs,
      paragraphs: [
        `PT AYTI INDO PANEL melayani proyek di ${city} dan sekitarnya: mulai dari gudang dingin, cold room komersial, hingga blast freezer untuk makanan dan seafood. Tim kami mendukung survey lokasi, estimasi beban dingin, dan dokumentasi teknis untuk tender atau ekspansi pabrik.`,
        `Lihat halaman topik per layanan di bawah untuk detail sandwich panel, cold storage, cold room, dan ABF khusus wilayah ini — semuanya terhubung dari satu basis NAP (nama, alamat, telepon) resmi perusahaan.`,
      ],
      faq: [
        {
          question: `Apakah instalasi cold storage di ${placename} mendapat dukungan purna jual?`,
          answer:
            "Ya. Setelah commissioning, kami dapat menjadwalkan maintenance berkala, troubleshooting, dan koordinasi suku cadang sesuai kontrak layanan yang disepakati.",
        },
        {
          question: `Berapa lama mobilisasi tim ke site di sekitar ${placename}?`,
          answer:
            "Tergantung jadwal proyek dan jarak logistik; untuk wilayah Jabodetabek dan koridor industri umumnya fleksibel. Untuk kota lain, survey awal sering dilakukan hybrid (dokumen + kunjungan).",
        },
        {
          question: `Bisakah memesan sandwich panel saja tanpa mesin pendingin untuk proyek di ${placename}?`,
          answer:
            "Ya. Panel PU/EPS dan aksesori pintu cold room dapat dipasok sesuai spesifikasi; integrasi refrigerasi bisa menyusul atau oleh kontraktor MEP pilihan Anda dengan koordinasi teknis kami.",
        },
        {
          question: "Bagaimana agar NAP bisnis konsisten di seluruh saluran online?",
          answer:
            "Gunakan nama legal, alamat, dan nomor yang sama persis dengan blok kontak di halaman ini dan di Google Business Profile. Perubahan resmi cukup diperbarui sekali di pengaturan situs agar situs dan schema ikut selaras.",
        },
      ],
      relatedProductSlugs: [
        "cold-storage-custom",
        "sandwich-panel-pu-camelock",
        "cold-storage-portable",
        "pembekuan-cepat-abf",
      ],
      whatsAppContext: "konsultasi",
      waTopicPhrase: `proyek cold storage / panel di ${placename}`,
    };
  });
}

function applyBrandToMetaTitle(metaTitle: string, brand: string): string {
  return metaTitle.replace(/\{brand\}/g, brand).replace(/\s+/g, " ").trim();
}

function buildAllDefinitions(): SeoLandingPageDef[] {
  const coldStorageCity = buildProductCityPages("cold-storage", {
    topicLabel: "Cold storage",
    h1: (city) => `Cold storage industri di ${city} — panel & mesin pendingin terintegrasi`,
    metaTitle: (city) => `Cold storage ${city} | instalasi ruang dingin & refrigerasi | {brand}`,
    metaDescription: (city) =>
      `Solusi cold storage untuk ${city}: sandwich panel PU/EPS, cold room, chiller/freezer room, sistem refrigerasi, pintu cold storage, dan commissioning. Konsultasi teknis PT AYTI INDO PANEL.`,
    keywords: ["cold storage", "ruang pendingin", "pendingin industri"],
    paragraphs: (city) => [
      `Untuk operasional di ${city}, cold storage harus stabil secara termal, hemat energi, dan mudah diaudit kebersihan serta suhunya. Kami merancang kombinasi panel insulasi, pintu cold room, dan mesin pendingin (evaporator, compressor, kontrol) sesuai kapasitas produksi dan pola traffic gudang.`,
      `Tim kami mendampingi survey kebutuhan, desain layout, fabrikasi panel, hingga uji performa (pull-down) agar target suhu tercapai sebelum handover. Cocok untuk distribusi dingin, farmasi, F&B, seafood, dan logistik berantai dingin.`,
    ],
    faq: (city) => [
      {
        question: `Berapa lama proyek cold storage di ${city} biasanya selesai?`,
        answer:
          "Tergantung ukuran ruangan, kompleksitas refrigerasi, dan kesiapan site. Modul portabel lebih cepat; cold storage custom mengikuti jadwal sipil dan MEP. Estimasi awal diberikan setelah data beban dingin dan jam operasi tersedia.",
      },
      {
        question: "Apakah sandwich panel PU aman untuk ruang makanan dingin?",
        answer:
          "Ya, untuk aplikasi food-grade umumnya memakai material dan finishing sambungan yang memenuhi kebutuhan hygiene proyek. Spesifikasi inti (ketebalan, λ, finishing) disesuaikan target suhu dan siklus CIP/pembersihan.",
      },
      {
        question: "Apakah tersedia layanan perawatan freon dan compressor?",
        answer:
          "Kami menyalurkan ke program maintenance berkala: inspeksi kebocoran, tekanan suction/discharge, amp draw compressor, dan kalibrasi sensor — agar freon dan sirkuit refrigerasi tetap efisien.",
      },
    ],
    relatedProductSlugs: [
      "cold-storage-custom",
      "cold-storage-portable",
      "sandwich-panel-pu-camelock",
      "sistem-refrigerasi",
      "pintu-panel",
    ],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `cold storage di ${city}`,
  });

  const sandwichPanelCity = buildProductCityPages("sandwich-panel", {
    topicLabel: "Sandwich panel",
    h1: (city) => `Sandwich panel PU/EPS untuk cold room & gudang dingin di ${city}`,
    metaTitle: (city) => `Sandwich panel ${city} | PU CameLock, knock down & EPS | {brand}`,
    metaDescription: (city) =>
      `Supplier sandwich panel untuk ${city}: core PU (CameLock / knock down) dan EPS ekonomis. Cocok cold room, chiller room, freezer room, dan partition industri. Minta spesifikasi tebal panel dan λ sesuai target suhu.`,
    keywords: [
      "sandwich panel",
      "Panel PU",
      "Panel PIU",
      "Castorit",
      "Kastorit",
      "panel polyuretane",
    ],
    paragraphs: (city) => [
      `Di ${city}, kebutuhan panel insulasi sering berkaitan dengan ekspansi gudang dingin, retrofit cold room, atau line produksi baru. Panel PU memberikan performa termal lebih ketat dibanding EPS pada delta suhu besar; EPS tetap relevan untuk aplikasi ekonomis dengan beban termal moderat.`,
      `Sambungan CamLock maupun sistem knock down dipilih berdasarkan mobilitas, kecepatan pasang, dan kebutuhan kedap udara. Kami membantu hitung beban dingin kasar sebagai input awal desain ketebalan panel.`,
    ],
    faq: (city) => [
      {
        question: `Bisa konsultasi teknis sandwich panel untuk proyek di ${city}?`,
        answer:
          "Ya. Kirimkan gambar denah, target suhu, dan jenis komoditas; kami sarankan ketebalan panel, tipe sambungan, dan integrasi pintu cold storage.",
      },
      {
        question: "Apa beda panel PU knock down dengan CamLock?",
        answer:
          "Keduanya modular. Knock down mendukung fleksibilitas transport dan pemasangan ulang; CamLock umumnya cepat untuk ruang kotak standar dengan presisi sambungan tinggi.",
      },
      {
        question: "Apakah keyword merek seperti Castorit sama dengan panel PU?",
        answer:
          "Di pasar Indonesia istilah merek/brand panel PU sering dipakai bergantian. Spesifikasi teknis yang penting adalah densitas inti, λ termal, dan sistem sambungan — kami transparan terkait material yang dipasang di lapangan.",
      },
    ],
    relatedProductSlugs: [
      "sandwich-panel-pu-camelock",
      "sandwich-panel-pu-full-knock-down",
      "sandwich-panel-eps",
      "pintu-panel",
    ],
    whatsAppContext: "produk",
    waTopicPhrase: (city) => `sandwich panel proyek ${city}`,
  });

  const blastFreezerCity = buildProductCityPages("blast-freezer", {
    topicLabel: "Blast freezer / ABF",
    h1: (city) => `Blast freezer & ABF (pembekuan cepat) untuk industri di ${city}`,
    metaTitle: (city) => `Blast freezer & ABF ${city} | pembekuan cepat seafood & daging | {brand}`,
    metaDescription: (city) =>
      `Air blast freezer (ABF) dan blast freezer industri di ${city}: pembekuan cepat untuk ikan, daging, dan bahan mudah rusak. Integrasi cold room, conveyor line, dan sistem refrigerasi two-stage bila diperlukan.`,
    keywords: ["blast freezer", "ABF", "Pembekuan cepat", "freezer room"],
    paragraphs: (city) => [
      `Blast freezer mempercepat penurunan suhu inti produk sehingga kualitas organoleptik terjaga dan mikroorganisme terkendali. Untuk operasional ${city}, kami mempertimbangkan kapasitas ton per jam, sirkulasi udara, dan kompatibilitas dengan cold storage hulu atau hilir.`,
      `Solusi dapat berupa ABF tunggal atau integrasi line dengan cold room staging. Pembahasan teknis mencakup defrost, drain pan, dan safety interlock sesuai SOP pabrik.`,
    ],
    faq: (city) => [
      {
        question: `Berapa kapasitas blast freezer yang umum dipasang di ${city}?`,
        answer:
          "Sangat bervariasi menurut throughput produk dan waktu siklus target. Kami mulai dari data produksi per jam lalu menghitung beban pendinginan dan laju pembekuan.",
      },
      {
        question: "Apakah blast freezer sama dengan freezer room?",
        answer:
          "Blast freezer fokus pada laju pembekuan cepat untuk batch; freezer room biasanya penyimpanan setelah produk sudah melewati titik beku inti sesuai standar internal.",
      },
      {
        question: "Apakah membutuhkan compressor dua tahap?",
        answer:
          "Untuk suhu sangat rendah dan beban besar, arsitektur two-stage atau cascade sering dipertimbangkan. Keputusan final mengikuti audit termal dan margin aman kompresor.",
      },
    ],
    relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "sistem-refrigerasi"],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `blast freezer / ABF ${city}`,
  });

  const coldRoomCity = buildProductCityPages("cold-room", {
    topicLabel: "Cold room",
    h1: (city) => `Cold room & ruang pendingin komersial di ${city}`,
    metaTitle: (city) => `Cold room ${city} | chiller room & instalasi panel | {brand}`,
    metaDescription: (city) =>
      `Pembuatan cold room dan chiller room di ${city}: panel insulasi, pintu cold storage, sistem evaporator dan compressor, kontrol suhu. Untuk distribusi dingin, skala menengah, hingga pabrik.`,
    keywords: ["cold room", "chiller room", "ruang pendingin", "pendingin ruangan"],
    paragraphs: (city) => [
      `Cold room di ${city} harus memisahkan zona suhu positif (chiller) dan zona beku bila ada alur komoditas campuran. Desain pintu, air curtain, dan vestibule menentukan kestabilan suhu saat pintu sering dibuka.`,
      `Kami menyatukan fabrikasi panel, pemasangan pintu insulated, dan commissioning mesin pendingin agar parameter suction dan superheat aman untuk compressor jangka panjang.`,
    ],
    faq: (city) => [
      {
        question: `Bisakah cold room dipasang di lantai produksi existing di ${city}?`,
        answer:
          "Bisa, setelah audit struktur lantai, drainase, dan daya listrik. Retrofit sering memakai modular panel knock down untuk akses pintu masuk terbatas.",
      },
      {
        question: "Apakah perlu ruang mesin terpisah?",
        answer:
          "Tergantung jenis condensing unit dan kebisingan lingkungan kerja. Untuk banyak proyek komersial, condensing unit diletakkan outdoor atau atap dengan kanopi perawatan.",
      },
      {
        question: "Bagaimana mencegah embun berlebih di cold room?",
        answer:
          "Dengan barrier uap, sambungan panel rapat, kontrol RH area antar ruang, dan desain defrost yang tepat pada evaporator.",
      },
    ],
    relatedProductSlugs: ["cold-storage-custom", "pintu-panel", "sandwich-panel-pu-camelock", "sistem-refrigerasi"],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `cold room ${city}`,
  });

  const panelPendinginCity = buildProductCityPages("panel-pendingin", {
    topicLabel: "Panel pendingin",
    h1: (city) => `Panel pendingin (sandwich panel) untuk ruang dingin di ${city}`,
    metaTitle: (city) => `Panel pendingin ${city} | cold room & cold storage | {brand}`,
    metaDescription: (city) =>
      `Panel pendingin insulasi untuk ${city}: PU dan EPS, aplikasi cold storage, freezer room, dan partition pabrik. Spesifikasi termal disesuaikan beban dingin dan standar proyek.`,
    keywords: ["Panel pendingin", "sandwich panel", "Castorit", "Kastorid"],
    paragraphs: (city) => [
      `Istilah panel pendingin di ${city} merujuk pada panel sandwich isolasi yang membentuk envelope cold room atau cold storage. Pemilihan inti PU versus EPS mengikuti delta suhu, biaya siklus hidup, dan kebutuhan kedap uap.`,
      `Kami mendukung dokumentasi material dan panduan pemasangan agar sambungan minim thermal bridge.`,
    ],
    faq: (city) => [
      {
        question: `Estimasi ketebalan panel untuk cuaca di sekitar ${city}?`,
        answer:
          "Tergantung suhu ruang sekitar, target cold room, dan beban masuk produk. Perhitungan R-value atau U-value dibuat setelah data operasional lengkap.",
      },
      {
        question: "Apakah panel bisa dicabut dipindahkan?",
        answer:
          "Sistem knock down dan beberapa layout CamLock mendukung relocasi modul dengan perencanaan ulang sealing dan struktur pengikat.",
      },
      {
        question: "Apakah menyediakan pintu cold storage matching?",
        answer:
          "Ya, pintu insulated (swing atau sliding) dapat diselaraskan dengan modul panel dan hardware sealing.",
      },
    ],
    relatedProductSlugs: [
      "sandwich-panel-pu-camelock",
      "sandwich-panel-pu-full-knock-down",
      "sandwich-panel-eps",
      "pintu-panel",
    ],
    whatsAppContext: "produk",
    waTopicPhrase: (city) => `panel pendingin ${city}`,
  });

  const ruangPendinginCity = buildProductCityPages("ruang-pendingin", {
    topicLabel: "Ruang pendingin",
    h1: (city) => `Ruang pendingin industri & komersial di ${city}`,
    metaTitle: (city) => `Ruang pendingin ${city} | desain cold room & cold storage | {brand}`,
    metaDescription: (city) =>
      `Pembuatan ruang pendingin di ${city}: mulai dari chiller room, freezer room, hingga cold storage skala menengah-besar. Integrasi panel, refrigerasi, dan pintu cold storage.`,
    keywords: ["ruang pendingin", "pendingin ruangan", "cold room", "freezer room"],
    paragraphs: (city) => [
      `Ruang pendingin di ${city} harus mempertimbangkan ritme buka-tutup pintu, beban produk masuk, dan distribusi aliran udara dingin. Layout vestibule dan zoning suhu membantu menjaga produk tetap pada rantai dingin.`,
      `Kami membantu menyusun konsep zona: receiving chiller, holding freezer, dan staging sebelum distribusi.`,
    ],
    faq: (city) => [
      {
        question: `Berapa suhu yang umum untuk ruang pendingin di ${city}?`,
        answer:
          "Chiller room sering 0°C hingga +10°C sesuai komoditas; freezer di bawah -18°C tergantung SOP. Nilai pasti mengikuti regulasi internal dan jenis produk.",
      },
      {
        question: "Apakah bisa menambah cold room tanpa menghentikan produksi lama?",
        answer:
          "Dengan phased construction dan koordinasi MEP, banyak proyek bisa dibagi modul. Survey lapangan menentukan risiko downtime.",
      },
      {
        question: "Apakah termasuk training operator?",
        answer:
          "Handover mencakup penjelasan panel kontrol, alarm, dan prosedur defrost dasar; pelatihan lanjutan bisa dijadwalkan.",
      },
    ],
    relatedProductSlugs: ["cold-storage-custom", "cold-storage-portable", "pintu-panel", "sistem-refrigerasi"],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `ruang pendingin ${city}`,
  });

  const pendinginIndustriCity = buildProductCityPages("pendingin-industri", {
    topicLabel: "Pendingin industri",
    h1: (city) => `Sistem pendingin industri & cold chain di ${city}`,
    metaTitle: (city) => `Pendingin industri ${city} | cold storage & refrigerasi | {brand}`,
    metaDescription: (city) =>
      `Solusi pendingin industri untuk ${city}: cold storage, mesin evaporator dan compressor, sistem refrigerasi, dan panel insulasi. Untuk pabrik makanan, farmasi, logistik, dan retail modern.`,
    keywords: ["pendingin industri", "mesin pendingin", "mesin evaporator", "mesin compressor", "cold storage"],
    paragraphs: (city) => [
      `Pendingin industri di ${city} mencakup integrasi antara envelope dingin (panel), komponen refrigerasi (evaporator, condensing unit, expansion device), dan sistem kontrol. Kami menekankan efisiensi energi dan kemudahan maintenance.`,
      `Untuk upgrade, audit lapangan dapat mengidentifikasi bottleneck kapasitas compressor atau masalah defrost yang membebani listrik.`,
    ],
    faq: (city) => [
      {
        question: `Apakah bisa upgrade compressor tanpa ganti seluruh cold storage di ${city}?`,
        answer:
          "Sering bisa, setelah verifikasi koil evaporator, pipa refrigerant, dan proteksi listrik mendukung kapasitas baru. Studi kelayakan teknis wajib.",
      },
      {
        question: "Bagaimana pengelolaan freon dan jenis refrigerant?",
        answer:
          "Pemilihan refrigerant mengikuti regulasi, kompatibilitas oli, dan suhu kerja. Tim teknis menjelaskan implikasi servis dan suku cadang.",
      },
      {
        question: "Apakah mendukung clean room bersuhu rendah?",
        answer:
          "Ya, termasuk clean room dengan kontrol partikel dan suhu — lihat juga halaman produk Clean Room.",
      },
    ],
    relatedProductSlugs: ["sistem-refrigerasi", "cold-storage-custom", "clean-room", "sandwich-panel-pu-camelock"],
    whatsAppContext: "konsultasi",
    waTopicPhrase: (city) => `pendingin industri ${city}`,
  });

  const freezerRoomCity = buildProductCityPages("freezer-room", {
    topicLabel: "Freezer room",
    h1: (city) => `Freezer room industri & penyimpanan beku di ${city}`,
    metaTitle: (city) => `Freezer room ${city} | panel & sistem pembekuan | {brand}`,
    metaDescription: (city) =>
      `Freezer room untuk ${city}: insulasi panel tebal, pintu cold storage low temp, dan sistem refrigerasi yang stabil di suhu beku. Cocok untuk penyimpanan daging, seafood, dan bahan setengah jadi.`,
    keywords: ["freezer room", "blast freezer", "cold storage"],
    paragraphs: (city) => [
      `Freezer room di ${city} membutuhkan perhatian khusus pada thermal bridge ambang pintu, floor heating bila perlu, dan siklus defrost evaporator agar es tidak menumpuk.`,
      `Kami merancang transisi dari chiller ke freezer agar tidak terjadi flash condensation di jalur logistik.`,
    ],
    faq: (city) => [
      {
        question: "Apakah freezer room selalu membutuhkan lantai insulated raised?",
        answer:
          "Tergantung substrat lantai dan risiko frost heave. Di banyak proyek industri, detail floor insulation dan heater trace dirancang eksplisit.",
      },
      {
        question: "Berapa margin suhu aman untuk alarm?",
        answer:
          "Ditetapkan per SOP komoditas; umumnya alarm bertingkat (warning atau critical) terhubung ke panel kontrol atau BMS.",
      },
      {
        question: "Bisa integrasi dengan blast freezer?",
        answer:
          "Ya, alur produk sering masuk ABF lalu holding di freezer room — koordinasi beban termal penting.",
      },
    ],
    relatedProductSlugs: ["cold-storage-custom", "pembekuan-cepat-abf", "pintu-panel", "sistem-refrigerasi"],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `freezer room ${city}`,
  });

  const chillerRoomCity = buildProductCityPages("chiller-room", {
    topicLabel: "Chiller room",
    h1: (city) => `Chiller room & penyimpanan suhu positif di ${city}`,
    metaTitle: (city) => `Chiller room ${city} | cold room suhu sedang | {brand}`,
    metaDescription: (city) =>
      `Chiller room untuk ${city}: cold room suhu positif, distribusi sayur-buah, dairy, dan bahan mudah rusak. Panel, evaporator, dan kontrol presisi.`,
    keywords: ["chiller room", "cold room", "ruang pendingin"],
    paragraphs: (city) => [
      `Chiller room di ${city} biasanya beroperasi pada suhu sedang dengan bukaan pintu lebih sering. Desain air curtain, strip curtain, atau vestibule double door membantu menjaga setpoint.`,
      `Kami menyelaraskan CFM evaporator dengan layout rak dan jalur forklift bila ada.`,
    ],
    faq: (city) => [
      {
        question: "Apakah chiller room cocok untuk farmasi?",
        answer:
          "Bisa, dengan tambahan dokumentasi kualifikasi suhu (mapping) sesuai kebutuhan regulasi internal klien.",
      },
      {
        question: "Bagaimana dengan RH (kelembaban)?",
        answer:
          "Kontrol RH bisa melibatkan desain koil, defrost, dan manajemen infiltrasi udara luar — dibahas di tahap desain.",
      },
      {
        question: "Apakah memakai sandwich panel yang sama dengan freezer?",
        answer:
          "Bisa, dengan ketebalan dan spesifikasi inti yang disesuaikan; freezer biasanya membutuhkan insulasi lebih agresif untuk margin energi.",
      },
    ],
    relatedProductSlugs: ["cold-storage-custom", "sandwich-panel-pu-camelock", "sandwich-panel-eps", "sistem-refrigerasi"],
    whatsAppContext: "solusi_sistem",
    waTopicPhrase: (city) => `chiller room ${city}`,
  });

  const industryPages: SeoLandingPageDef[] = [
    productIndustry("blast-freezer-ikan", {
      topicLabel: "Blast freezer",
      modifierLabel: "Industri ikan & seafood",
      h1: "Blast freezer & ABF untuk industri ikan — pembekuan cepat rantai dingin",
      metaTitle: "Blast freezer ikan & seafood | ABF pembekuan cepat | {brand}",
      metaDescription:
        "Solusi blast freezer dan air blast freezer untuk ikan dan seafood: throughput tinggi, kontrol suhu, integrasi cold storage. Konsultasi layout line pembekuan.",
      keywords: ["blast freezer", "ikan", "seafood", "ABF", "Pembekuan cepat"],
      paragraphs: [
        "Industri ikan membutuhkan penurunan suhu inti cepat untuk menjaga tekstur dan memperlambat aktivitas enzimatik. Blast freezer dengan sirkulasi udara dirancang agar tidak terjadi case hardening berlebihan pada fillet tipis.",
        "Kami menghubungkan desain ABF dengan cold storage staging dan distribusi, termasuk pertimbangan drainase meltwater dan hygiene washdown.",
      ],
      faq: [
        {
          question: "Berapa waktu pembekuan target untuk blok ikan?",
          answer:
            "Sangat tergantung ketebalan blok dan sirkulasi udara. Benchmark teknis diturunkan dari trial produk dan data logger suhu inti.",
        },
        {
          question: "Apakah material kontak produk food-grade?",
          answer:
            "Material finishing coil, dinding liner, dan drain pan dapat dipilih sesuai standar hygiene proyek — disepakati di awal.",
        },
        {
          question: "Bisa integrasi conveyor?",
          answer:
            "Ya untuk line otomatis; mekanikal dan kontrol diselaraskan dengan OEM conveyor bila ada.",
        },
      ],
      relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "sistem-refrigerasi"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "blast freezer untuk ikan",
    }),
    productIndustry("blast-freezer-daging", {
      topicLabel: "Blast freezer",
      modifierLabel: "Industri daging",
      h1: "Blast freezer industri untuk daging — pembekuan cepat & cold storage",
      metaTitle: "Blast freezer daging | ABF & freezer room | {brand}",
      metaDescription:
        "Blast freezer dan ABF untuk industri daging: pembekuan cepat, integrasi cold room, dan sistem refrigerasi stabil untuk line potong utama.",
      keywords: ["blast freezer", "daging", "ABF", "freezer room"],
      paragraphs: [
        "Proses daging membutuhkan blast chilling atau blast freezing sesuai SOP HACCP pabrik. Kami memetakan titik bottleneck antara chilling awal dan holding freezer.",
        "Desain memperhatikan sanitasi lantai, slope drain, dan kemudahan inspeksi evaporator.",
      ],
      faq: [
        {
          question: "Apakah mendukung suhu chilling sebelum freezing?",
          answer:
            "Ya, sering dibuat sebagai zona terpisah atau siklus kontrol multi-setpoint tergantung line.",
        },
        {
          question: "Bagaimana dengan odor dan CIP?",
          answer:
            "Material dan finishing permukaan dipilih agar kompatibel dengan prosedur pencucian kimiawi yang dipakai pabrik.",
        },
        {
          question: "Apakah bisa menggunakan sistem refrigerasi existing?",
          answer:
            "Upgrade memungkinkan setelah audit kapasitas compressor dan evaluasi pipa refrigerant.",
        },
      ],
      relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "pintu-panel"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "blast freezer daging",
    }),
    productIndustry("cold-room-rumah-sakit", {
      topicLabel: "Cold room",
      modifierLabel: "Rumah sakit",
      h1: "Cold room rumah sakit — penyimpanan farmasi & logistik medis dingin",
      metaTitle: "Cold room rumah sakit | suhu terkontrol & panel hygienic | {brand}",
      metaDescription:
        "Pembuatan cold room untuk rumah sakit: zona suhu farmasi, specimen, atau logistik medis. Panel, pintu, dan sistem refrigerasi dengan dokumentasi teknis.",
      keywords: ["cold room", "rumah sakit", "farmasi", "chiller room"],
      paragraphs: [
        "Fasilitas kesehatan membutuhkan cold room dengan kontrol akses, alarm suhu, dan kemudahan pembersihan permukaan. Transisi ambulans ke gudang obat sering membutuhkan vestibule untuk menjaga setpoint.",
        "Kami berkoordinasi dengan tim MEP rumah sakit untuk titik listrik genset, UPS kritis, dan redudansi sensor.",
      ],
      faq: [
        {
          question: "Apakah mendukung mapping suhu?",
          answer:
            "Kami bisa mendampingi proses mapping sebagai bagian commissioning sesuai scope yang disepakati dengan tim QA rumah sakit.",
        },
        {
          question: "Bisakah cold room dibuat modular?",
          answer:
            "Ya, modular knock down cocok untuk retrofit gedung existing dengan akses koridor sempit.",
        },
        {
          question: "Apakah pintu cold storage anti-panic?",
          answer:
            "Hardware pintu dapat dipilih sesuai standar keselamatan gedung dan SOP internal.",
        },
      ],
      relatedProductSlugs: ["cold-storage-custom", "clean-room", "pintu-panel", "sandwich-panel-pu-camelock"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "cold room rumah sakit",
    }),
    productIndustry("cold-room-farmasi", {
      topicLabel: "Cold room",
      modifierLabel: "Farmasi & obat",
      h1: "Cold room farmasi — cold chain obat & penyimpanan suhu terkendali",
      metaTitle: "Cold room farmasi | cold chain & chiller room | {brand}",
      metaDescription:
        "Cold room dan chiller room untuk industri farmasi: stabilitas suhu, redundansi sensor, dan finishing permukaan yang mudah dibersihkan.",
      keywords: ["cold room", "farmasi", "chiller room", "cold storage"],
      paragraphs: [
        "Cold chain farmasi membutuhkan dokumentasi setpoint, alarm, dan rekaman suhu. Desain ruang mempertimbangkan beban masuk batch dan titik panas dari traffic operator.",
        "Integrasi panel insulasi dan pintu kedap mengurangi infiltrasi udara panas dari koridor bersih.",
      ],
      faq: [
        {
          question: "Apakah mendukung GxP documentation?",
          answer:
            "Dokumentasi teknis dasar (manual, diagram, as-built) disiapkan; kualifikasi formal mengikuti prosedur QA klien.",
        },
        {
          question: "Bisakah cold room multi-suhu?",
          answer:
            "Multi-setpoint dalam satu envelope membutuhkan partisi termal dan kontrol zona — dapat dirancang bila diperlukan.",
        },
        {
          question: "Apakah clean room berbeda dengan cold room farmasi?",
          answer:
            "Clean room menekankan partikel; cold room menekankan suhu — kadang digabung sesuai kebutuhan proses.",
        },
      ],
      relatedProductSlugs: ["clean-room", "cold-storage-custom", "sistem-refrigerasi", "pintu-panel"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "cold room farmasi",
    }),
    productIndustry("sandwich-panel-logistik", {
      topicLabel: "Sandwich panel",
      modifierLabel: "Gudang logistik dingin",
      h1: "Sandwich panel untuk gudang logistik dingin & cold storage distribusi",
      metaTitle: "Sandwich panel logistik dingin | cold storage distribusi | {brand}",
      metaDescription:
        "Sandwich panel PU/EPS untuk hub logistik dingin: cold room besar, docking zone, dan partition fleksibel. Cocok 3PL dan rantai dingin nasional.",
      keywords: ["sandwich panel", "logistik", "cold storage", "Panel pendingin"],
      paragraphs: [
        "Gudang logistik sering membutuhkan cold room dengan bukaan besar mendekati dock. Panel harus tahan benturan ringan equipment handling dan mudah diperbaiki modulnya.",
        "Kami merancang interface panel dengan high speed door atau airlock sesuai traffic forklift.",
      ],
      faq: [
        {
          question: "Apakah panel tahan vibrasi dock?",
          answer:
            "Struktur pengikat dan detail ambang disesuaikan beban dinamik; survey site menentukan penguatan lokal.",
        },
        {
          question: "Bisakah memperluas cold room bertahap?",
          answer:
            "Layout modular mendukung penambahan bay baru dengan sambungan panel yang direncanakan sejak awal.",
        },
        {
          question: "Apakah EPS cukup untuk hub besar?",
          answer:
            "Tergantung target suhu dan biaya operasional; banyak hub memilih PU untuk delta suhu besar.",
        },
      ],
      relatedProductSlugs: ["sandwich-panel-pu-camelock", "sandwich-panel-eps", "loading-dock-system", "cold-storage-custom"],
      whatsAppContext: "produk",
      waTopicPhrase: "sandwich panel gudang logistik",
    }),
    productIndustry("cold-storage-f-b", {
      topicLabel: "Cold storage",
      modifierLabel: "F&B & central kitchen",
      h1: "Cold storage untuk F&B & central kitchen — cold room produksi & penyimpanan",
      metaTitle: "Cold storage F&B | central kitchen & cold room | {brand}",
      metaDescription:
        "Cold storage untuk industri F&B: cold room produksi, chiller holding, freezer bahan baku. Panel hygienic, pintu cold storage, dan sistem refrigerasi.",
      keywords: ["cold storage", "F&B", "cold room", "chiller room"],
      paragraphs: [
        "Central kitchen dan pabrik F&B membutuhkan zoning suhu yang jelas antara bahan mentah, chilling, dan produk jadi. Cold storage harus mendukung CCP suhu di HACCP.",
        "Kami membantu desain alur one-way untuk meminimalkan cross-contamination termal dan biologis.",
      ],
      faq: [
        {
          question: "Apakah mendukung cold room bersertifikasi hygiene?",
          answer:
            "Material liner dan sudut internal dapat dibuat rounded untuk washdown; detail disepakati dengan tim QA.",
        },
        {
          question: "Bisakah cold storage portable untuk catering besar?",
          answer:
            "Unit portable cold storage tersedia untuk kebutuhan event atau ekspansi sementara.",
        },
        {
          question: "Bagaimana dengan load-in panas?",
          answer:
            "Perhitungan beban masuk panas menentukan ukuran evaporator dan jadwal defrost.",
        },
      ],
      relatedProductSlugs: ["cold-storage-custom", "cold-storage-portable", "sandwich-panel-pu-camelock", "sistem-refrigerasi"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "cold storage F&B",
    }),
  ];

  const solutionPages: SeoLandingPageDef[] = [
    solutionNeed("pembekuan-cepat-produk-mudah-rusak", {
      topicLabel: "Pembekuan cepat",
      modifierLabel: "Produk mudah rusak",
      h1: "Pembekuan cepat untuk produk mudah rusak — blast freezer & ABF",
      metaTitle: "Pembekuan cepat blast freezer | ABF industri | {brand}",
      metaDescription:
        "Solusi pembekuan cepat dengan blast freezer dan ABF untuk menjaga kualitas produk mudah rusak. Integrasi cold storage dan refrigerasi industri.",
      keywords: ["Pembekuan cepat", "ABF", "blast freezer"],
      paragraphs: [
        "Pembekuan cepat mengunci kualitas nutrisi dan tekstur sebelum kristal es besar merusak sel. ABF memadukan laju udara, suhu evaporator, dan waktu tinggal batch.",
        "Kami membantu menentukan apakah single-stage cukup atau diperlukan arsitektur pendinginan lebih dalam untuk target suhu inti.",
      ],
      faq: [
        {
          question: "Kapan memilih ABF versus freezer biasa?",
          answer:
            "ABF dipakai saat throughput batch membutuhkan penurunan suhu inti cepat; freezer biasa untuk holding setelah produk mencapai titik aman internal.",
        },
        {
          question: "Apakah ABF boros energi?",
          answer:
            "ABF memiliki puncak beban tinggi; efisiensi dicapai dengan kontrol siklus, defrost adaptif, dan integrasi heat recovery bila relevan.",
        },
        {
          question: "Bisakah disesuaikan dengan tray rack existing?",
          answer:
            "Ya, dimensi troli dan pitch rack menjadi input utama desain ducting dan nozzle.",
        },
      ],
      relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "sistem-refrigerasi"],
      whatsAppContext: "solusi_sistem",
      waTopicPhrase: "pembekuan cepat ABF",
    }),
    solutionNeed("pintu-cold-storage-industri", {
      topicLabel: "Pintu cold storage",
      modifierLabel: "Industrial cold room doors",
      h1: "Pintu cold storage industri — sealing, sliding atau swing, & low temperature",
      metaTitle: "Pintu cold storage industri | cold room door | {brand}",
      metaDescription:
        "Pintu insulated untuk cold storage dan cold room: sealing presisi, varian sliding atau swing, hardware low temperature. Cocok blast freezer, chiller, dan freezer room.",
      keywords: ["pintu cold storage", "cold room", "freezer room"],
      paragraphs: [
        "Pintu cold storage adalah komponen kritis infiltrasi udara dan kebocoran energi. Pemilihan sweep gasket, heater trace, dan sistem bukaan otomatis mempengaruhi stabilitas suhu.",
        "Kami mencocokkan pintu dengan modul panel dan pola traffic forklift versus pejalan kaki.",
      ],
      faq: [
        {
          question: "Apakah tersedia pintu sliding otomatis?",
          answer:
            "Ya, termasuk interlock dengan high speed door atau air curtain bila sistem zona membutuhkannya.",
        },
        {
          question: "Bagaimana maintenance engsel di suhu beku?",
          answer:
            "Hardware low temp dan pelumasan material disesuaikan; program PM berkala direkomendasikan.",
        },
        {
          question: "Bisakah mengganti pintu tanpa ganti seluruh panel?",
          answer:
            "Sering bisa dengan retrofit opening dan verifikasi struktur header.",
        },
      ],
      relatedProductSlugs: ["pintu-panel", "cold-storage-custom", "sandwich-panel-pu-camelock"],
      whatsAppContext: "accessories",
      waTopicPhrase: "pintu cold storage industri",
    }),
    solutionNeed("sistem-freon-dan-refrigerasi", {
      topicLabel: "Freon & refrigerasi",
      modifierLabel: "Servis & upgrade",
      h1: "Sistem freon, compressor & evaporator — servis refrigerasi industri",
      metaTitle: "Servis freon & refrigerasi | compressor evaporator | {brand}",
      metaDescription:
        "Konsultasi servis sistem freon dan refrigeran industri: compressor, evaporator, tekanan kerja, dan efisiensi energi. Integrasi cold storage dan cold room.",
      keywords: ["freon", "mesin compressor", "mesin evaporator", "sistem refrigerasi"],
      paragraphs: [
        "Performa cold storage sangat bergantung pada sirkuit refrigerasi yang seimbang: superheat, subcooling, dan jadwal defrost. Audit lapangan membaca pola amp draw dan tekanan saturasi.",
        "Upgrade refrigerant mengikuti regulasi dan kompatibilitas peralatan — tidak semua komponen dapat dialihkan tanpa engineering ulang.",
      ],
      faq: [
        {
          question: "Apakah menyediakan deteksi kebocoran refrigerant?",
          answer:
            "Melalui program maintenance dan vendor halogen detector sesuai SOP site — scope disepakati per kontrak servis.",
        },
        {
          question: "Kapan evaporator perlu diganti coil?",
          answer:
            "Jika korosi, oil logging, atau penurunan HT yang tidak pulih setelah cleaning profesional.",
        },
        {
          question: "Apakah bisa menambah economizer?",
          answer:
            "Tergantung tipe compressor dan kontrol; studi teknis diperlukan.",
        },
      ],
      relatedProductSlugs: ["sistem-refrigerasi", "maintenance-berkala", "perbaikan-troubleshooting"],
      whatsAppContext: "maintenance",
      waTopicPhrase: "servis freon dan compressor",
    }),
  ];

  return uniqBySlug([
    ...buildCityAreaHubPages(),
    ...coldStorageCity,
    ...sandwichPanelCity,
    ...blastFreezerCity,
    ...coldRoomCity,
    ...panelPendinginCity,
    ...ruangPendinginCity,
    ...pendinginIndustriCity,
    ...freezerRoomCity,
    ...chillerRoomCity,
    ...industryPages,
    ...solutionPages,
  ]);
}

const RAW_PAGES = buildAllDefinitions();
const SEO_BY_SLUG = new Map(RAW_PAGES.map((p) => [p.slug, p]));

export const SEO_LANDING_PAGES: SeoLandingPageDef[] = RAW_PAGES;

export function getSeoLandingBySlug(slug: string): SeoLandingPageDef | undefined {
  return SEO_BY_SLUG.get(slug);
}

export function getAllSeoLandingSlugs(): string[] {
  return RAW_PAGES.map((p) => p.slug);
}

export function resolveSeoLandingMetadata(slug: string, content: SiteContent): Metadata | null {
  const raw = getSeoLandingBySlug(slug);
  if (!raw) return null;

  const brand = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  const title = applyBrandToMetaTitle(raw.metaTitle, brand);
  const description =
    raw.metaDescription.length > 160 ? `${raw.metaDescription.slice(0, 157)}…` : raw.metaDescription;

  const ss = content.siteSettings;
  const originBase = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const canonical = absoluteUrlFromSite(originBase, `/${raw.slug}`);
  const ogImage = resolveOgImageUrl(content, "");
  const noIndex =
    ss.seoControl.stagingMode === true || ss.seoControl.allowIndexing === false;

  const geoOther = buildHtmlGeoMetaForCityKey(raw.localSeoCityKey);

  return {
    title,
    description,
    keywords: raw.keywords,
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
