import {
  IMG_COLD_STORAGE,
  IMG_FREEZER,
  IMG_INDUSTRIAL,
  IMG_PANEL,
  IMG_REFRIGERATION,
} from "@/components/aytipanel/products-catalog";
import type { WhatsAppMessageKey } from "@/components/aytipanel/constants/whatsapp";
import type { WhatsAppMessageContext } from "@/utils/whatsapp";

export type ProductB2BCardData = {
  /** Halaman detail `/produk/[slug]` jika ada */
  slug?: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  /** Untuk kartu katalog: foto kedua (opsional). Tanpa ini UI memakai satu foto dipotong dua panel. */
  imageSrcSecondary?: string;
  imageAltSecondary?: string;
  highlights: readonly string[];
  specs: string;
  /** Jika tidak diisi, tombol "Lihat Detail" disembunyikan */
  detailLabel?: "Lihat Detail";
  quoteLabel: "Minta Penawaran" | "Konsultasi" | "Hubungi tim support";
  whatsappMessageKey: WhatsAppMessageKey;
  whatsappContext: WhatsAppMessageContext;
};

export type ProductB2BCategoryData = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  detailSectionLabel?: string;
  detailOpenHint?: string;
  detailCloseHint?: string;
  supportLabel?: string;
  supportLead?: string;
  supportCtaLabel?: string;
  cards: readonly ProductB2BCardData[];
};

/** Urutan: Produk Utama → Solusi → Accessories */
export const PRODUCTS_B2B_CATEGORIES: readonly ProductB2BCategoryData[] = [
  {
    id: "produk-utama",
    eyebrow: "Produk Utama",
    title: "Sandwich panel",
    description:
      "Dirancang untuk kebutuhan ruang bersuhu terkontrol dengan performa termal yang stabil, material standar industri, dan spesifikasi yang dapat disesuaikan dengan kebutuhan.",
    cards: [
      {
        slug: "sandwich-panel-pu-camelock",
        title: "Sandwich Panel PU Camlock",
        subtitle:
          "Panel insulasi premium dengan sistem camlock presisi untuk sambungan rapat, instalasi cepat, dan performa termal optimal pada cold storage dan clean room.",
        imageSrc: IMG_PANEL,
        imageAlt: "Sandwich panel PU Camlock",
        highlights: [
          "Sambungan rapat & kedap udara",
          "Insulasi tinggi, efisiensi energi",
          "Instalasi cepat & presisi",
        ],
        specs:
          "PU Core • Density 42–45 kg/m³\nTebal 50–150 mm • Camlock System",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "sandwich_pu_camelock",
        whatsappContext: "produk",
      },
      {
        slug: "sandwich-panel-pu-full-knock-down",
        title: "PU Knock Down Panel",
        subtitle:
          "Modular Insulation System — panel insulasi modular dengan sistem knock down yang fleksibel, mudah bongkar pasang, dan cocok untuk kebutuhan ruang bersuhu terkontrol.",
        imageSrc: IMG_PANEL,
        imageAlt: "PU Knock Down Panel",
        highlights: [
          "Fleksibel & mudah relokasi",
          "Instalasi cepat tanpa permanen",
          "Insulasi stabil & efisien",
        ],
        specs:
          "PU Core • Density 42–45 kg/m³\nTebal 50–150 mm • Modular System",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "sandwich_pu_full_knock_down",
        whatsappContext: "produk",
      },
      {
        slug: "sandwich-panel-eps",
        title: "EPS Sandwich Panel",
        subtitle:
          "Panel insulasi ringan dan ekonomis dengan core EPS, cocok untuk dinding, partisi, dan bangunan industri dengan kebutuhan standar.",
        imageSrc: IMG_PANEL,
        imageAlt: "EPS Sandwich Panel",
        highlights: [
          "Ringan & mudah dipasang",
          "Harga ekonomis",
          "Insulasi cukup untuk kebutuhan umum",
        ],
        specs: "EPS Core • Lightweight • Cost Efficient",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "sandwich_panel_eps",
        whatsappContext: "produk",
      },
    ],
  },
  {
    id: "produk-solusi",
    eyebrow: "Produk Solusi",
    title: "Cold storage & ABF",
    description:
      "Mulai desain hingga commissioning, seluruh sistem dirancang mengikuti kebutuhan operasional dan target temperature.",
    cards: [
      {
        slug: "cold-storage-custom",
        title: "Cold Storage System",
        subtitle:
          "Integrated Cooling Solution — sistem cold storage terintegrasi untuk kebutuhan industri dengan desain custom sesuai aplikasi.",
        imageSrc: IMG_COLD_STORAGE,
        imageAlt: "Cold Storage System industri",
        highlights: [
          "Suhu stabil & terkontrol",
          "Desain fleksibel sesuai kebutuhan",
          "Efisiensi energi optimal",
        ],
        specs:
          "Custom System for Chiller, Freezer & Process Area",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "cold_storage_system",
        whatsappContext: "solusi_sistem",
      },
      {
        slug: "pembekuan-cepat-abf",
        title: "Air Blast Freezer (ABF)",
        subtitle:
          "Rapid Freezing System — sistem pembekuan cepat untuk menjaga kualitas produk dengan proses freezing yang merata dan efisien.",
        imageSrc: IMG_FREEZER,
        imageAlt: "Air Blast Freezer industri",
        highlights: [
          "Pembekuan cepat & merata",
          "Menjaga kualitas & tekstur produk",
          "Efisiensi proses produksi",
        ],
        specs: "-40°C • Rapid Freezing System",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "air_blast_freezer",
        whatsappContext: "solusi_sistem",
      },
      {
        slug: "cold-storage-portable",
        title: "Portable Cold Storage",
        subtitle:
          "Plug & Play Cooling Unit — unit cold storage siap pakai tanpa konstruksi, fleksibel, dan mudah dipindahkan untuk berbagai kebutuhan industri.",
        imageSrc: IMG_COLD_STORAGE,
        imageAlt: "Portable Cold Storage industri",
        highlights: [
          "Siap pakai (plug & play)",
          "Fleksibel & mudah relokasi",
          "Instalasi cepat tanpa konstruksi",
        ],
        specs: "Ready Unit • Mobile System",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "portable_cold_storage",
        whatsappContext: "solusi_sistem",
      },
    ],
  },
  {
    id: "produk-accessories",
    eyebrow: "Accessories",
    title: "Komponen pendukung",
    description:
      "Pintu insulated, sistem dock, loading dock system, dan sistem refrigerasi untuk mendukung operasional ruang bersuhu terkontrol secara stabil dan efisien.",
    cards: [
      {
        slug: "pintu-panel",
        title: "Cold Room Door",
        subtitle:
          "Insulated Access System — pintu khusus cold storage dengan sistem insulasi tinggi untuk menjaga suhu tetap stabil dan kedap udara.",
        imageSrc: IMG_COLD_STORAGE,
        imageAlt: "Cold Room Door industri",
        highlights: [
          "Kedap udara & minim kebocoran",
          "Tahan suhu ekstrem",
          "Sistem buka-tutup halus & aman",
        ],
        specs: "Sliding / Swing • Insulated Door",
        detailLabel: "Lihat Detail",
        quoteLabel: "Minta Penawaran",
        whatsappMessageKey: "cold_room_door",
        whatsappContext: "accessories",
      },
      {
        slug: "loading-dock-system",
        title: "Loading Dock System",
        subtitle:
          "Efficient Docking Solution — sistem docking terintegrasi untuk proses bongkar muat yang cepat, aman, dan efisien, sekaligus menjaga kestabilan suhu.",
        imageSrc: IMG_INDUSTRIAL,
        imageAlt: "Loading Dock System industri",
        highlights: [
          "Proses loading lebih cepat",
          "Stabil & aman saat docking",
          "Mengurangi kehilangan suhu",
        ],
        specs:
          "Dock Leveler • Dock Shelter • HSD • Sectional Door",
        detailLabel: "Lihat Detail",
        quoteLabel: "Konsultasi",
        whatsappMessageKey: "loading_dock_system",
        whatsappContext: "accessories",
      },
      {
        slug: "sistem-refrigerasi",
        title: "Refrigeration System",
        subtitle:
          "Industrial Cooling Solution — sistem pendingin industri terintegrasi untuk kebutuhan cold storage, freezer, dan area proses dengan kontrol suhu presisi.",
        imageSrc: IMG_REFRIGERATION,
        imageAlt: "Unit sistem refrigerasi industri dan HVAC komersial",
        highlights: [
          "Performa pendinginan optimal",
          "Sistem terintegrasi & efisien",
          "Monitoring & kontrol modern",
        ],
        specs: "Condensing Unit • Control System",
        detailLabel: "Lihat Detail",
        quoteLabel: "Konsultasi",
        whatsappMessageKey: "refrigeration_system",
        whatsappContext: "solusi_sistem",
      },
    ],
  },
] as const;

export const SERVICE_MAINTENANCE_CATEGORY: ProductB2BCategoryData = {
  id: "service-maintenance",
  eyebrow: "SERVICE & MAINTENANCE",
  title: "Dukungan After Sales",
  description:
    "Layanan maintenance, troubleshooting, dan dukungan teknis untuk menjaga performa sistem tetap stabil dan terukur setelah implementasi proyek.",
  detailSectionLabel: "Layanan",
  detailOpenHint: "Ketuk untuk melihat",
  detailCloseHint: "Ketuk untuk menutup",
  supportLabel: "Dukungan",
  supportLead: "Untuk informasi lebih lanjut, hubungi tim support kami.",
  supportCtaLabel: "Hubungi via WhatsApp",
  cards: [
    {
      slug: "maintenance-berkala",
      title: "Maintenance Berkala",
      subtitle:
        "Preventive Maintenance Program - perawatan terjadwal untuk menjaga performa sistem refrigerasi, kestabilan suhu, dan efisiensi operasional secara konsisten.",
      imageSrc: IMG_INDUSTRIAL,
      imageAlt: "Maintenance berkala sistem refrigerasi industri",
      highlights: [
        "Pemeriksaan Sistem Refrigerasi",
        "Analisis Performa Operasional",
        "Tindakan Maintenance",
        "Laporan Kondisi & Evaluasi",
      ],
      specs: "Routine Service • Scheduled Maintenance",
      quoteLabel: "Hubungi tim support",
      whatsappMessageKey: "maintenance_berkala",
      whatsappContext: "maintenance",
    },
    {
      slug: "perbaikan-troubleshooting",
      title: "Perbaikan & Troubleshooting",
      subtitle:
        "Corrective Service Solution - diagnosis akar masalah dan tindakan perbaikan cepat untuk memulihkan performa sistem secara tepat dan terarah.",
      imageSrc: IMG_COLD_STORAGE,
      imageAlt: "Perbaikan dan troubleshooting sistem pendingin",
      highlights: [
        "Analisis Gangguan Sistem",
        "Perbaikan Komponen & Kontrol",
        "Meminimalisir Downtime Operasional",
        "Prioritas Penanganan Kondisi Kritis",
      ],
      specs: "Rapid Response • System Diagnosis",
      quoteLabel: "Hubungi tim support",
      whatsappMessageKey: "perbaikan_troubleshooting",
      whatsappContext: "troubleshooting",
    },
    {
      slug: "after-sales-support",
      title: "After Sales Support",
      subtitle:
        "Integrated Technical Support - dukungan teknis berkelanjutan untuk menjaga sistem tetap stabil dan optimal setelah instalasi.",
      imageSrc: IMG_REFRIGERATION,
      imageAlt: "After sales support dan dukungan teknis",
      highlights: [
        "Monitoring Performa Sistem",
        "Koordinasi Teknis Menyeluruh",
        "Pembaruan & Update Sistem",
        "Pendampingan Pasca Instalasi",
      ],
      specs: "Technical Support berkelanjutan",
      quoteLabel: "Hubungi tim support",
      whatsappMessageKey: "after_sales_support",
      whatsappContext: "after_sales",
    },
  ],
};
