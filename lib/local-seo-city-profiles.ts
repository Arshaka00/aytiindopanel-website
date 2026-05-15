import {
  INDONESIA_SERVICE_AREA_CITIES,
  INDONESIA_SERVICE_AREA_CITY_KEYS,
} from "@/lib/indonesia-service-area-cities";

export type LocalSeoCityProfile = {
  cityKey: string;
  placename: string;
  displayLabel: string;
  /** Konteks industri lokal — 1–2 kalimat unik. */
  industrialContext: string;
  typicalApplications: { title: string; body: string }[];
  coverageAreas: string[];
  industryTags: string[];
};

type ProfileOverride = Partial<
  Pick<LocalSeoCityProfile, "industrialContext" | "typicalApplications" | "coverageAreas" | "industryTags">
>;

const OVERRIDES: Record<string, ProfileOverride> = {
  jakarta: {
    industrialContext:
      "Koridor Jabodetabek menggabungkan hub logistik, central kitchen ritel, dan pabrik makanan skala besar — cold storage harus mengikuti ritme distribusi harian dan traffic loading dock yang padat.",
    typicalApplications: [
      { title: "Logistik & distribusi", body: "Gudang chiller/freezer untuk FMCG, e-commerce grocery, dan 3PL rantai dingin." },
      { title: "Central kitchen", body: "Zonasi suhu untuk bahan baku, setengah jadi, dan produk akhir outlet." },
      { title: "Seafood & protein", body: "Cold room staging sebelum distribusi ke modern trade dan HORECA." },
    ],
    coverageAreas: ["Jakarta Pusat", "Bekasi", "Tangerang", "Depok", "Bogor", "Karawang (koridor)"],
    industryTags: ["Logistik", "F&B", "Distribusi", "Ritel"],
  },
  bandung: {
    industrialContext:
      "Bandung dan Priangan memiliki cluster dairy, bakery beku, dan UMKM makanan yang naik kelas — kebutuhan cold room sering dimulai dari kapasitas menengah dengan rencana ekspansi.",
    typicalApplications: [
      { title: "Dairy & bakery", body: "Chiller untuk susu, krim, dan adonan setengah jadi sebelum distribusi." },
      { title: "Frozen food UMKM", body: "Freezer room untuk stok beku skala produksi harian." },
      { title: "Minuman & snack", body: "Panel insulated untuk ruang pendingin line filling." },
    ],
    coverageAreas: ["Bandung", "Cimahi", "Sumedang", "Garut (koridor)"],
    industryTags: ["Dairy", "Frozen food", "F&B"],
  },
  surabaya: {
    industrialContext:
      "Surabaya dan Gerbangkertosusila adalah pintu keluar manufaktur dan distribusi Jawa Timur — cold storage di sini sering melayani ekspor seafood dan supply chain nasional.",
    typicalApplications: [
      { title: "Seafood processing", body: "Blast freezer, cold room, dan staging untuk komoditas perikanan." },
      { title: "Manufaktur makanan", body: "Gudang dingin untuk bahan baku impor dan produk olahan." },
      { title: "Logistik pelabuhan", body: "Hub pendingin dekat akses container dan truk berat." },
    ],
    coverageAreas: ["Surabaya", "Sidoarjo", "Gresik", "Mojokerto"],
    industryTags: ["Seafood", "Manufaktur", "Logistik"],
  },
  tangerang: {
    industrialContext:
      "Tangerang dan BSD berdekatan dengan pelabuhan, kawasan industri, dan gudang e-commerce — prioritasnya stabilitas suhu saat shift gudang panjang.",
    typicalApplications: [
      { title: "Gudang distribusi", body: "Multi-zone chiller/freezer untuk SKU campuran." },
      { title: "Farmasi & kosmetik", body: "Cold room bersuhu terkendali untuk bahan sensitif." },
      { title: "Makanan beku", body: "Kapasitas freezer untuk import frozen dan repacking." },
    ],
    coverageAreas: ["Tangerang", "Tangerang Selatan", "Serpong", "Cikupa"],
    industryTags: ["Logistik", "Farmasi", "F&B"],
  },
  bekasi: {
    industrialContext:
      "Bekasi dan Cikarang menampung kawasan industri manufaktur besar — kebutuhan panel dan cold storage sering terkait ekspansi pabrik dan gudang bahan jadi.",
    typicalApplications: [
      { title: "Manufaktur & KIM", body: "Cold room proses dan gudang bahan baku bersuhu terkendali." },
      { title: "Automotive & elektronik", body: "Ruangan terkontrol suhu untuk komponen sensitif (bila diperlukan)." },
      { title: "Food industry", body: "Line produksi dengan partition panel insulated." },
    ],
    coverageAreas: ["Bekasi", "Cikarang", "Karawang (dekat)", "Cibitung"],
    industryTags: ["Manufaktur", "KIM", "F&B"],
  },
  semarang: {
    industrialContext:
      "Semarang sebagai pelabuhan Pantura dan pusat distribusi Jawa Tengah — cold storage mendukung agro, kosmetik, dan manufaktur regional.",
    typicalApplications: [
      { title: "Agro & hortikultura", body: "Chiller untuk produk segar sebelum ekspor atau olahan." },
      { title: "Distribusi regional", body: "Hub dingin untuk supply ke Jawa Tengah & DIY." },
      { title: "Industri makanan", body: "Freezer dan cold room skala pabrik menengah." },
    ],
    coverageAreas: ["Semarang", "Kendal", "Demak", "Salatiga"],
    industryTags: ["Agro", "Distribusi", "F&B"],
  },
  medan: {
    industrialContext:
      "Medan menjadi gerbang Sumatera untuk komoditas agro dan perkebunan — cold storage penting untuk palm derivative, buah, dan produk beku regional.",
    typicalApplications: [
      { title: "Agro & perkebunan", body: "Penyimpanan bahan olahan dan produk turunan." },
      { title: "Daging & unggas", body: "Cold room untuk rantai dingin protein Sumatera Utara." },
      { title: "Distribusi nasional", body: "Hub pendingin untuk truk lintas pulau." },
    ],
    coverageAreas: ["Medan", "Deli Serdang", "Binjai", "Tebing Tinggi"],
    industryTags: ["Agro", "Protein", "Logistik"],
  },
  makassar: {
    industrialContext:
      "Makassar melayani Eastern Indonesia dengan fokus seafood, niaga, dan logistik maritim — instalasi cold storage harus tahan korosi lingkungan pantai.",
    typicalApplications: [
      { title: "Seafood & perikanan", body: "Blast freezer dan cold storage untuk komoditas laut." },
      { title: "Distribusi pulau", body: "Staging dingin sebelum pengiriman ke luar Sulawesi." },
      { title: "Minuman & FMCG", body: "Gudang regional bersuhu terkendali." },
    ],
    coverageAreas: ["Makassar", "Maros", "Sungguminasa", "Parepare (koridor)"],
    industryTags: ["Seafood", "Logistik", "F&B"],
  },
  balikpapan: {
    industrialContext:
      "Balikpapan dan Kalimantan Timur berfokus pada energi, logistik, dan support industri tambang — cold storage dipakai untuk catering industri, FMCG, dan seafood.",
    typicalApplications: [
      { title: "Logistik Kaltim", body: "Hub dingin untuk supply chain regional." },
      { title: "Seafood & protein", body: "Cold room untuk komoditas laut dan daging impor." },
      { title: "Proyek industri", body: "Modular cold room untuk site terpencil berjangka." },
    ],
    coverageAreas: ["Balikpapan", "Samarinda (koridor)", "Penajam", "Kutai Kartanegara"],
    industryTags: ["Logistik", "Seafood", "Industri"],
  },
  batam: {
    industrialContext:
      "Batam sebagai zona perdagangan bebas menghubungkan Singapura dan Sumatera — cold storage mendukung re-export, seafood, dan manufaktur elektronik.",
    typicalApplications: [
      { title: "Re-export & gudang", body: "Chiller/freezer untuk barang sensitif suhu." },
      { title: "Seafood", body: "Penyimpanan sebelum ekspor atau olahan." },
      { title: "Manufaktur", body: "Partition dingin di pabrik kawasan industri." },
    ],
    coverageAreas: ["Batam", "Tanjung Pinang (koridor)", "Bintan"],
    industryTags: ["Logistik", "Seafood", "Manufaktur"],
  },
  pekanbaru: {
    industrialContext:
      "Pekanbaru dan Riau berkaitan dengan agro, kelapa sawit, dan logistik Sumatera — kebutuhan ruang dingin untuk bahan olahan dan distribusi.",
    typicalApplications: [
      { title: "Agro & CPO derivative", body: "Penyimpanan bahan turunan suhu terkendali." },
      { title: "Distribusi", body: "Cold storage regional untuk FMCG." },
      { title: "Makanan & minuman", body: "Line produksi dengan panel insulated." },
    ],
    coverageAreas: ["Pekanbaru", "Dumai", "Bengkalis"],
    industryTags: ["Agro", "Distribusi", "F&B"],
  },
  palembang: {
    industrialContext:
      "Palembang sebagai simpul Sumatera Selatan untuk agro, batu bara support services, dan distribusi — cold room mendukung F&B dan logistik.",
    typicalApplications: [
      { title: "Agro & perkebunan", body: "Chiller untuk komoditas segar dan olahan." },
      { title: "Distribusi", body: "Hub pendingin antar-Sumatera." },
      { title: "Frozen food", body: "Kapasitas freezer untuk stok beku." },
    ],
    coverageAreas: ["Palembang", "Prabumulih", "Lubuklinggau (koridor)"],
    industryTags: ["Agro", "Logistik", "F&B"],
  },
  denpasar: {
    industrialContext:
      "Denpasar dan Bali melayani pariwisata, F&B premium, dan distribusi ke pulau — cold storage untuk central kitchen hotel dan supplier seafood.",
    typicalApplications: [
      { title: "Hospitality & HORECA", body: "Cold room untuk central kitchen dan supplier hotel." },
      { title: "Seafood", body: "Penyimpanan ikan segar dan beku untuk restoran & ekspor." },
      { title: "Minuman & dairy", body: "Chiller untuk produk segar wisatawan tinggi." },
    ],
    coverageAreas: ["Denpasar", "Badung", "Gianyar", "Tabanan"],
    industryTags: ["HORECA", "Seafood", "F&B"],
  },
  yogyakarta: {
    industrialContext:
      "Yogyakarta dan sekitarnya memiliki UMKM makanan, edukasi, dan distribusi Joglosemar — cold storage skala menengah sering jadi langkah pertama sebelum ekspansi nasional.",
    typicalApplications: [
      { title: "UMKM frozen", body: "Freezer room untuk produk tradisional dan modern." },
      { title: "Distribusi", body: "Hub dingin ke Solo, Semarang, dan Pantura." },
      { title: "Kafe & bakery", body: "Chiller untuk bahan pastry dan dairy." },
    ],
    coverageAreas: ["Yogyakarta", "Sleman", "Bantul", "Klaten"],
    industryTags: ["UMKM", "F&B", "Distribusi"],
  },
  samarinda: {
    industrialContext:
      "Samarinda dan Kaltim melayani mining support, logistik sungai/marah, dan pertumbuhan FMCG — cold storage untuk distribusi regional.",
    typicalApplications: [
      { title: "Logistik Kaltim", body: "Gudang dingin multi-SKU." },
      { title: "Seafood & protein", body: "Cold room untuk komoditas laut Mahakam." },
      { title: "Katering industri", body: "Modular storage untuk site project." },
    ],
    coverageAreas: ["Samarinda", "Balikpapan (koridor)", "Kutai", "Bontang"],
    industryTags: ["Logistik", "Seafood", "Industri"],
  },
  banjarmasin: {
    industrialContext:
      "Banjarmasin dan Kalimantan Selatan berfokus agro, tambang support, dan distribusi sungai — panel insulated penting untuk gudang dan cold room baru.",
    typicalApplications: [
      { title: "Agro & komoditas", body: "Chiller untuk produk hortikultura dan olahan." },
      { title: "Distribusi", body: "Cold storage hub untuk Kalimantan bagian selatan." },
      { title: "Manufaktur kecil", body: "Ekspansi pabrik makanan dengan knock down panel." },
    ],
    coverageAreas: ["Banjarmasin", "Banjarbaru", "Martapura"],
    industryTags: ["Agro", "Distribusi", "Manufaktur"],
  },
  pontianak: {
    industrialContext:
      "Pontianak sebagai gerbang Kalimantan Barat menghubungkan Malaysia dan Indonesia — cold storage untuk agro, seafood, dan barang impor.",
    typicalApplications: [
      { title: "Agro & kebun", body: "Penyimpanan produk segar dan olahan." },
      { title: "Seafood", body: "Cold room untuk komoditas perairan Kalimantan Barat." },
      { title: "Distribusi", body: "Hub regional lintas-provinsi." },
    ],
    coverageAreas: ["Pontianak", "Kubu Raya", "Singkawang (koridor)"],
    industryTags: ["Agro", "Seafood", "Logistik"],
  },
  manado: {
    industrialContext:
      "Manado dan Sulawesi Utara kuat di seafood, cengkeh, dan distribusi ke seluruh Indonesia Timur — blast freezer dan cold storage sering dipasang bersamaan.",
    typicalApplications: [
      { title: "Seafood processing", body: "Tuna, cumi, dan komoditas laut untuk ekspor." },
      { title: "Cold storage regional", body: "Hub untuk distribusi ke Maluku & Papua (koridor)." },
      { title: "Minuman & FMCG", body: "Gudang bersuhu terkendali." },
    ],
    coverageAreas: ["Manado", "Bitung", "Tomohon", "Minahasa"],
    industryTags: ["Seafood", "Ekspor", "Distribusi"],
  },
  surakarta: {
    industrialContext:
      "Solo dan Surakarta memiliki industri makanan tradisional, tekstil support, dan distribusi Jawa Tengah bagian dalam — cold room untuk UMKM naik kelas.",
    typicalApplications: [
      { title: "Frozen & snack", body: "Freezer untuk produk jajanan dan olahan beku." },
      { title: "Distribusi", body: "Cold storage ke Yogyakarta dan Semarang." },
      { title: "Beverage", body: "Chiller line produksi minuman." },
    ],
    coverageAreas: ["Surakarta", "Solo", "Karanganyar", "Sukoharjo"],
    industryTags: ["UMKM", "F&B", "Distribusi"],
  },
  malang: {
    industrialContext:
      "Malang dan Batu dikenal agro, apel, dan manufaktur makanan — kebutuhan cold storage untuk hortikultura dan dairy regional.",
    typicalApplications: [
      { title: "Hortikultura & apel", body: "Chiller untuk komoditas segar dan sorting." },
      { title: "Dairy & bakery", body: "Cold room untuk produk olahan susu." },
      { title: "Distribusi", body: "Supply ke Surabaya dan seluruh Jatim." },
    ],
    coverageAreas: ["Malang", "Batu", "Pasuruan (koridor)", "Probolinggo"],
    industryTags: ["Agro", "Dairy", "F&B"],
  },
  karawang: {
    industrialContext:
      "Karawang dan Purwakarta adalah koridor industri besar Jabodetabek — pabrik otomotif, F&B, dan farmasi membutuhkan cold room presisi dan panel insulated skala luas.",
    typicalApplications: [
      { title: "Manufaktur KIM", body: "Cold storage proses dan gudang bahan jadi." },
      { title: "Farmasi", body: "Ruangan bersuhu terkendali untuk bahan aktif." },
      { title: "F&B nasional", body: "Line produksi dengan panel PU ketebalan disesuaikan." },
    ],
    coverageAreas: ["Karawang", "Purwakarta", "Subang (koridor)", "Cikampek"],
    industryTags: ["Manufaktur", "Farmasi", "F&B"],
  },
};

const DEFAULT_APPLICATIONS: { title: string; body: string }[] = [
  { title: "Distribusi & logistik", body: "Gudang chiller/freezer untuk rantai dingin regional." },
  { title: "Makanan & minuman", body: "Cold room untuk bahan baku, proses, dan produk akhir." },
  { title: "Protein & seafood", body: "Penyimpanan bersuhu terkontrol untuk komoditas mudah rusak." },
];

function hashPick<T>(seed: string, items: readonly T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return items[Math.abs(h) % items.length]!;
}

function buildFallbackProfile(cityKey: string): LocalSeoCityProfile {
  const meta = INDONESIA_SERVICE_AREA_CITIES[cityKey];
  const placename = meta?.placename ?? cityKey.replace(/-/g, " ");
  const displayLabel = meta?.displayLabel ?? placename;

  const introVariants = [
    `${displayLabel} memiliki aktivitas industri, distribusi, dan F&B yang membutuhkan ruang dingin stabil — dari gudang regional hingga cold room pabrik.`,
    `Di ${placename}, ekspansi pabrik dan gudang sering mendorong kebutuhan cold storage baru atau upgrade panel insulated agar suhu lebih terkendali.`,
    `Koridor ${displayLabel} melayani rantai dingin untuk komoditas segar, beku, dan bahan sensitif suhu — instalasi harus selaras dengan pola operasi harian.`,
  ];

  return {
    cityKey,
    placename,
    displayLabel,
    industrialContext: hashPick(`${cityKey}-ctx`, introVariants),
    typicalApplications: DEFAULT_APPLICATIONS,
    coverageAreas: [`${placename} & sekitarnya`, "Kawasan industri terdekat", "Koridor distribusi regional"],
    industryTags: ["Distribusi", "F&B", "Manufaktur"],
  };
}

export function getLocalSeoCityProfile(cityKey: string): LocalSeoCityProfile {
  const base = INDONESIA_SERVICE_AREA_CITIES[cityKey];
  if (!base) {
    return buildFallbackProfile(cityKey);
  }
  const override = OVERRIDES[cityKey];
  const fallback = buildFallbackProfile(cityKey);
  return {
    cityKey,
    placename: base.placename,
    displayLabel: base.displayLabel,
    industrialContext: override?.industrialContext ?? fallback.industrialContext,
    typicalApplications: override?.typicalApplications ?? fallback.typicalApplications,
    coverageAreas: override?.coverageAreas ?? fallback.coverageAreas,
    industryTags: override?.industryTags ?? fallback.industryTags,
  };
}

export function getAllLocalSeoCityKeys(): string[] {
  return [...INDONESIA_SERVICE_AREA_CITY_KEYS];
}
