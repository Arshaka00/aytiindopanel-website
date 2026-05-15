import type { Metadata } from "next";

import type { ProjectCategory } from "@/components/aytipanel/gallery-project-data";
import type { WhatsAppMessageKey } from "@/components/aytipanel/constants/whatsapp";
import type { SiteContent } from "@/lib/site-content-model";
import { resolveServicePublicPath } from "@/lib/seo-service-paths";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";
import type { WhatsAppMessageContext } from "@/utils/whatsapp";

export type ServicePageKind = "primary" | "support";

export type ServiceFaqItem = { question: string; answer: string };

export type ServicePageDef = {
  slug: string;
  kind: ServicePageKind;
  /** Label singkat untuk nav & breadcrumb */
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  hero: {
    h1: string;
    subheadline: string;
    lead: string;
    bullets: string[];
    imageSrc: string;
    imageAlt: string;
  };
  overview: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  functions: { title: string; body: string }[];
  applicationsIntro: string;
  applications: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  industries: string[];
  advantages: {
    eyebrow: string;
    title: string;
    lead: string;
    items: string[];
  };
  specs: {
    eyebrow: string;
    title: string;
    lead: string;
    rows: { label: string; value: string }[];
  };
  portfolio: {
    eyebrow: string;
    title: string;
    lead: string;
    /** Filter kategori galeri proyek */
    categories: Exclude<ProjectCategory, "All">[];
  };
  faq: ServiceFaqItem[];
  relatedServiceSlugs: string[];
  relatedProductSlugs: string[];
  waMessageKey: WhatsAppMessageKey;
  waContext: WhatsAppMessageContext;
  ctaHeadline: string;
  ctaLead: string;
};

const BRAND = "Solusi Sistem Pendingin Terintegrasi";

const SHARED_ADVANTAGES = [
  "Fabrikasi dan koordinasi produksi di bawah satu tim teknis",
  "Desain disesuaikan kapasitas, suhu target, dan pola operasi Anda",
  "Material insulasi dan komponen mengikuti spesifikasi proyek",
  "Instalasi lapangan terstruktur hingga uji operasional",
  "Dukungan teknis pasca commissioning untuk stabilitas jangka panjang",
] as const;

export const SERVICE_PAGES: ServicePageDef[] = [
  {
    slug: "sandwich-panel-pu",
    kind: "primary",
    navLabel: "Sandwich Panel PU",
    metaTitle: "Sandwich Panel PU Industri | PT AYTI INDO PANEL",
    metaDescription:
      "Produksi sandwich panel PU untuk cold room dan fasilitas bersuhu terkontrol. Fabrikasi custom, sambungan presisi, instalasi profesional — Jabodetabek & nasional.",
    hero: {
      h1: "Sandwich Panel PU untuk Cold Room & Industri",
      subheadline: "Envelope insulasi presisi untuk ruang dingin yang stabil dan efisien.",
      lead:
        "Panel sandwich polyurethane (PU) menjadi fondasi thermal cold storage, clean room, dan area proses bersuhu terkontrol. Kami memproduksi dan memasang panel sesuai layout operasi Anda — bukan paket generik.",
      bullets: [
        "Core PU dengan performa insulasi konsisten",
        "Sistem sambungan CamLock atau knock down sesuai kebutuhan proyek",
        "Koordinasi fabrikasi hingga pemasangan lapangan",
      ],
      imageSrc: "/images/spesialisasi/spesialisasi-pu.png",
      imageAlt: "Sandwich panel PU untuk cold room industri",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Panel insulasi sebagai fondasi ruang dingin",
      paragraphs: [
        "Sandwich panel PU menggabungkan kulit baja dan inti polyurethane untuk membentuk dinding, plafon, dan partisi yang menahan perpindahan panas. Pada cold storage, kualitas panel menentukan seberapa stabil suhu dijaga dan seberapa efisien sistem refrigerasi bekerja.",
        "PT AYTI INDO PANEL memproduksi panel dengan spesifikasi ketebalan, densitas, dan sistem joint yang diselaraskan dengan desain ruangan serta kapasitas pendingin — agar envelope dan mesin saling mendukung, bukan saling membebani.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Membentuk envelope kedap termal yang memisahkan lingkungan dalam dan luar ruang dingin, mengurangi beban pendingin dan fluktuasi suhu.",
      },
      {
        title: "Aplikasi umum",
        body: "Cold room chiller/freezer, ruang proses makanan, gudang distribusi berpendingin, dan area produksi yang membutuhkan kontrol suhu.",
      },
      {
        title: "Manfaat operasional",
        body: "Stabilitas suhu lebih baik, risiko kondensasi berkurang, serta perawatan sistem refrigerasi lebih terprediksi.",
      },
    ],
    applicationsIntro: "Panel PU kami dipakai di berbagai sektor yang mengandalkan rantai dingin:",
    applications: [
      { title: "Frozen food & protein", body: "Ruangan freezer dan chiller untuk stok harian maupun inventori jangka menengah." },
      { title: "Farmasi & medis", body: "Area penyimpanan bersuhu terkontrol dengan kebutuhan higienis dan presisi." },
      { title: "F&B & central kitchen", body: "Zonasi suhu untuk bahan baku, setengah jadi, dan produk akhir." },
      { title: "Gudang pendingin", body: "Hub logistik multi-zona dengan traffic loading tinggi." },
    ],
    benefits: [
      { title: "Custom dimensi", body: "Panjang, lebar, dan ketebalan disesuaikan gambar kerja dan akses lokasi." },
      { title: "Joint terencana", body: "CamLock atau knock down dipilih berdasarkan kecepatan instalasi dan kebutuhan relokasi." },
      { title: "Integrasi pintu", body: "Koordinasi bukaan pintu cold room agar tidak menjadi titik kebocoran termal." },
    ],
    industries: ["Distribusi FMCG", "Pengolahan makanan", "Farmasi", "Logistik berpendingin", "Manufaktur"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Mengapa panel dari fabrikasi terintegrasi",
      lead: "Satu jalur dari produksi panel hingga pemasangan di lapangan — komunikasi teknis tidak terputus antar pihak.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter teknis yang biasa disepakati",
      lead: "Detail final mengikuti hasil survei dan perhitungan beban dingin.",
      rows: [
        { label: "Material kulit", value: "Baja galvalume / stainless (sesuai lingkungan)" },
        { label: "Core insulasi", value: "Polyuretane (PU) — densitas disesuaikan proyek" },
        { label: "Ketebalan panel", value: "50–200 mm (umum cold room: 80–150 mm)" },
        { label: "Sistem joint", value: "CamLock presisi atau full knock down modular" },
        { label: "Ketahanan termal", value: "Koefisien U rendah untuk efisiensi refrigerasi" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi pemasangan panel insulated",
      lead: "Contoh pekerjaan envelope panel pada fasilitas bersuhu terkontrol.",
      categories: ["Cold Storage", "Proses Area", "CS Portable"],
    },
    faq: [
      {
        question: "Apa beda panel PU CamLock dan knock down?",
        answer:
          "CamLock cocok untuk cold room permanen dengan sambungan cepat dan rapat. Knock down lebih fleksibel untuk relokasi atau perluasan bertahap. Kami bantu memilih setelah survei layout.",
      },
      {
        question: "Berapa ketebalan panel yang disarankan?",
        answer:
          "Bergantung suhu target, frekuensi buka pintu, dan beban internal. Setelah data operasi terkumpul, ketebalan direkomendasikan agar tidak over- maupun under-insulated.",
      },
      {
        question: "Apakah hanya supply panel tanpa instalasi?",
        answer:
          "Kami juga melayani paket lengkap fabrikasi + instalasi + koordinasi refrigerasi agar envelope dan mesin selaras.",
      },
    ],
    relatedServiceSlugs: ["sandwich-panel-knock-down", "cold-storage", "cold-room-door", "refrigeration-system"],
    relatedProductSlugs: ["sandwich-panel-pu-camelock", "sandwich-panel-pu-full-knock-down", "cold-storage-custom"],
    waMessageKey: "sandwich_pu_camelock",
    waContext: "solusi_sistem",
    ctaHeadline: "Konsultasikan kebutuhan sandwich panel PU Anda",
    ctaLead: "Kirim gambar layout atau perkiraan dimensi — tim kami bantu arahkan spesifikasi dan langkah kerja.",
  },
  {
    slug: "sandwich-panel-knock-down",
    kind: "primary",
    navLabel: "Panel Knock Down",
    metaTitle: "Sandwich Panel Knock Down Modular | AYTI Indo Panel",
    metaDescription:
      "Sistem sandwich panel knock down modular untuk cold room fleksibel. Instalasi cepat, relokasi mudah, insulasi PU stabil — konsultasi & survei gratis.",
    hero: {
      h1: "Sandwich Panel Knock Down — Sistem Modular Insulasi",
      subheadline: "Fleksibel dipasang, diperluas, atau dipindah sesuai evolusi operasi pabrik Anda.",
      lead:
        "Panel knock down dirancang untuk proyek yang membutuhkan kecepatan instalasi, kemungkinan relokasi, atau perluasan bertahap tanpa mengganggu operasi utama.",
      bullets: [
        "Modular — cocok untuk fase proyek bertahap",
        "Performa insulasi PU tetap konsisten antar modul",
        "Koordinasi fabrikasi dan pemasangan oleh tim lapangan",
      ],
      imageSrc: "/images/layanan/produksi-panel-pu-eps/1.jpg",
      imageAlt: "Produksi sandwich panel knock down modular",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Insulasi modular tanpa mengorbankan ketepatan sambungan",
      paragraphs: [
        "Sistem knock down memecah panel menjadi modul yang dirakit di lokasi dengan presisi. Pendekatan ini sering dipilih pabrik yang berencana menambah kapasitas cold room secara bertahap atau memindahkan ruang dingin ke area lain.",
        "Kami menyelaraskan desain modul dengan akses truk, crane, dan jalur utilitas agar instalasi berjalan terstruktur — bukan sekadar menumpuk panel di gudang.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Memberikan envelope insulasi yang dapat dirakit ulang tanpa kehilangan integritas sambungan termal pada titik joint.",
      },
      {
        title: "Aplikasi umum",
        body: "Cold room sementara, perluasan kapasitas, proyek di lahan sewa, atau fasilitas yang berpotensi relokasi.",
      },
      {
        title: "Manfaat operasional",
        body: "Waktu instalasi lebih singkat, gangguan operasi berkurang, dan investasi awal bisa dibagi per fase.",
      },
    ],
    applicationsIntro: "Knock down panel banyak dipakai pada skenario berikut:",
    applications: [
      { title: "Ekspansi pabrik", body: "Menambah zona chiller/freezer tanpa membongkar seluruh bangunan." },
      { title: "Proyek sewa lahan", body: "Ruangan dingin yang bisa dipindah saat kontrak lokasi berakhir." },
      { title: "Pilot plant", body: "Validasi operasi sebelum investasi cold storage skala penuh." },
      { title: "Hub logistik", body: "Modul cepat untuk mendukung musim puncak distribusi." },
    ],
    benefits: [
      { title: "Instalasi terjadwal", body: "Modul prefabrikasi memperpendek durasi kerja di lokasi." },
      { title: "Perluasan modular", body: "Tambah ruang tanpa merombak seluruh envelope existing." },
      { title: "Koordinasi refrigerasi", body: "Kapasitas pendingin disesuaikan volume modul aktual." },
    ],
    industries: ["Manufaktur makanan", "Logistik", "Ritel cold chain", "Pengolahan bahan baku"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Tim yang memahami logika modular",
      lead: "Desain modul bukan sekadar memotong panel — urutan rakit dan detail joint menentukan performa jangka panjang.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter sistem knock down",
      lead: "Spesifikasi final mengacu pada gambar kerja hasil survei.",
      rows: [
        { label: "Core insulasi", value: "Polyuretane (PU) — opsi ketebalan modular" },
        { label: "Sistem sambungan", value: "Profil knock down + sealant termal terkontrol" },
        { label: "Ketebalan umum", value: "80–150 mm untuk cold room standar" },
        { label: "Aksesori", value: "Sudut, lis, dan bukaan pintu disesuaikan modul" },
        { label: "Instalasi", value: "Tim lapangan + checklist kualitas sambungan" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi instalasi modular",
      lead: "Dokumentasi pekerjaan panel insulated skala hub dan pabrik.",
      categories: ["CS Portable", "Cold Storage", "Proses Area"],
    },
    faq: [
      {
        question: "Apakah knock down kurang kedap dibanding CamLock?",
        answer:
          "Tidak otomatis. Kualitas joint dan cara pemasangan menentukan performa. Kami menerapkan detail sambungan dan seal sesuai standar proyek agar setara kebutuhan suhu target.",
      },
      {
        question: "Bisakah modul lama ditambah modul baru?",
        answer:
          "Ya, dengan perencanaan profil dan ketebalan yang kompatibel. Survei awal membantu memetakan modul existing sebelum perluasan.",
      },
      {
        question: "Berapa lama instalasi di lokasi?",
        answer:
          "Tergantung luas dan kompleksitas utilitas. Setelah layout fix, jadwal instalasi disepakati dalam rencana kerja proyek.",
      },
    ],
    relatedServiceSlugs: ["sandwich-panel-pu", "cold-storage-portable", "cold-storage", "cold-room-door"],
    relatedProductSlugs: ["sandwich-panel-pu-full-knock-down", "cold-storage-portable", "sandwich-panel-pu-camelock"],
    waMessageKey: "sandwich_pu_full_knock_down",
    waContext: "solusi_sistem",
    ctaHeadline: "Rencanakan cold room modular bersama tim kami",
    ctaLead: "Ceritakan rencana perluasan atau relokasi — kami bantu susun pendekatan knock down yang realistis.",
  },
  {
    slug: "cold-storage",
    kind: "primary",
    navLabel: "Cold Storage",
    metaTitle: "Jasa Cold Storage Industri Chiller & Freezer | AYTI Indo Panel",
    metaDescription:
      "Jasa pembuatan cold storage lengkap: panel insulated, sistem refrigerasi, pintu cold room. Solusi terintegrasi untuk industri makanan, farmasi, dan logistik.",
    hero: {
      h1: "Jasa Pembuatan Cold Storage Chiller & Freezer",
      subheadline: "Ruangan dingin stabil dari panel hingga mesin pendingin — siap operasi.",
      lead:
        "Cold storage bukan sekadar kotak dingin. Kami membangun sistem terintegrasi: envelope insulated, distribusi refrigerasi, dan kontrol suhu yang selaras dengan cara Anda beroperasi.",
      bullets: [
        "Multi-zona chiller, freezer, dan process area",
        "Panel PU + koordinasi unit pendingin",
        "Commissioning dan uji suhu sebelum serah terima",
      ],
      imageSrc: "/images/spesialisasi/spesialisasi-coldstorage.png",
      imageAlt: "Instalasi cold storage industri",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Cold storage sebagai investasi operasional",
      paragraphs: [
        "Cold storage yang tepat melindungi nilai stok, mempercepat putaran barang, dan menurunkan risiko reject akibat suhu tidak stabil. Kami merancangnya dari perspektif operasional: traffic pintu, zonasi SKU, kapasitas pendingin, hingga pola maintenance.",
        "Sebagai mitra Solusi Sistem Pendingin Terintegrasi, PT AYTI INDO PANEL menangani panel, pintu, dan koordinasi refrigerasi dalam satu alur kerja — mengurangi celah komunikasi antar vendor.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Menyimpan produk pada suhu terkontrol untuk mempertahankan kualitas, keamanan pangan, atau compliance industri.",
      },
      {
        title: "Aplikasi umum",
        body: "Gudang distribusi, pabrik pengolahan, central kitchen, dan fasilitas logistik berantai dingin.",
      },
      {
        title: "Manfaat operasional",
        body: "Stok lebih aman, biaya refrigerasi lebih terukur, dan alur kerja gudang lebih terprediksi.",
      },
    ],
    applicationsIntro: "Cold storage kami mendukung berbagai sektor industri:",
    applications: [
      { title: "Frozen food", body: "Freezer room dan blast untuk komoditas beku." },
      { title: "Farmasi", body: "Penyimpanan vaksin dan bahan sensitif suhu." },
      { title: "F&B", body: "Chiller untuk bahan segar dan produk setengah jadi." },
      { title: "Gudang pendingin", body: "Multi-temperature hub untuk distribusi nasional." },
    ],
    benefits: [
      { title: "Desain custom", body: "Layout mengikuti alur forklift, zonasi, dan shift operasi." },
      { title: "Integrasi mesin", body: "Kapasitas pendingin diselaraskan beban dan envelope." },
      { title: "Dokumentasi proyek", body: "Gambar kerja dan laporan commissioning untuk audit internal." },
    ],
    industries: ["FMCG", "Protein & seafood", "Farmasi", "Ritel", "3PL logistik"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Satu mitra dari desain hingga ruang dingin dipakai",
      lead: "Tim yang memahami panel sekaligus perilaku sistem refrigerasi pada beban nyata.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter cold storage yang biasa ditentukan",
      lead: "Setiap proyek memiliki profil suhu dan beban unik — spesifikasi disesuaikan hasil perhitungan.",
      rows: [
        { label: "Zona suhu", value: "Chiller (+2 hingga +8 °C) · Freezer (−18 °C dan below)" },
        { label: "Panel insulasi", value: "Sandwich panel PU — ketebalan sesuai zona" },
        { label: "Sistem refrigerasi", value: "Unit cooler, condensing, piping — kapasitas terukur" },
        { label: "Pintu & akses", value: "Cold room door, air curtain (opsional)" },
        { label: "Kontrol", value: "Sensor suhu, alarm, logging (sesuai kebutuhan)" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Portfolio cold storage & rantai dingin",
      lead: "Referensi instalasi cold storage skala distribusi hingga pabrik pengolahan.",
      categories: ["Cold Storage", "ABF (Air Blast Freezer)", "Proses Area"],
    },
    faq: [
      {
        question: "Berapa lama pengerjaan cold storage?",
        answer:
          "Bergantung luas, kompleksitas zona, dan kesiapan infrastruktur listrik. Setelah survei, jadwal kerja disepakati dalam proposal proyek.",
      },
      {
        question: "Apakah bisa hanya ruangan tanpa mesin pendingin?",
        answer:
          "Kami merekomendasikan paket terintegrasi agar envelope dan kapasitas pendingin selaras. Konsultasi awal membantu menentukan ruang lingkup yang tepat.",
      },
      {
        question: "Area layanan di mana saja?",
        answer:
          "Berbasis Tangerang dengan cakupan Jabodetabek, Jawa Barat, dan proyek nasional sesuai jadwal mobilisasi tim.",
      },
    ],
    relatedServiceSlugs: ["blast-freezer", "cold-storage-portable", "refrigeration-system", "cold-room-door"],
    relatedProductSlugs: ["cold-storage-custom", "pembekuan-cepat-abf", "sistem-refrigerasi"],
    waMessageKey: "cold_storage_system",
    waContext: "solusi_sistem",
    ctaHeadline: "Konsultasikan kebutuhan cold storage Anda",
    ctaLead: "Kirim perkiraan luas atau layout — arah sistem dan langkah kerja bisa dibahas tanpa komitmen awal.",
  },
  {
    slug: "cold-storage-portable",
    kind: "primary",
    navLabel: "Cold Storage Portable",
    metaTitle: "Cold Storage Portable Plug & Play | AYTI Indo Panel",
    metaDescription:
      "Cold storage portable siap operasi: panel insulasi, unit pendingin, dan kontrol terintegrasi. Cocok untuk proyek sementara, musiman, atau lokasi terbatas.",
    hero: {
      h1: "Cold Storage Portable — Solusi Dingin Siap Operasi",
      subheadline: "Plug & play untuk kebutuhan sementara, musiman, atau lokasi tanpa konstruksi permanen.",
      lead:
        "Unit portable menggabungkan envelope insulated dan sistem pendingin dalam paket yang bisa dioperasikan lebih cepat dibanding membangun cold room permanen dari nol.",
      bullets: [
        "Instalasi lebih singkat di lokasi terbatas",
        "Cocok untuk pilot, musiman, atau backup kapasitas",
        "Spesifikasi disesuaikan suhu target dan beban produk",
      ],
      imageSrc: "/images/layanan/instalasi-panel-cold-room/1.jpg",
      imageAlt: "Cold storage portable siap operasi",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Fleksibilitas tanpa mengorbankan kontrol suhu",
      paragraphs: [
        "Cold storage portable dipilih ketika waktu proyek singkat, lahan bersifat sewa, atau perusahaan perlu menambah kapasitas dingin sementara tanpa investasi bangunan tetap.",
        "Kami menyusun spesifikasi modul — dimensi, suhu, dan daya — agar unit dapat dioperasikan dengan prosedur yang jelas sejak hari pertama commissioning.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Menyediakan kapasitas penyimpanan dingin yang dapat dipindah atau ditarik setelah periode operasi tertentu.",
      },
      {
        title: "Aplikasi umum",
        body: "Event logistik, musim panen, proyek konstruksi terbatas, atau backup saat cold room utama maintenance.",
      },
      {
        title: "Manfaat operasional",
        body: "Capex lebih terkendali, waktu deploy lebih cepat, risiko idle asset lebih rendah setelah proyek selesai.",
      },
    ],
    applicationsIntro: "Portable cold storage sering dipakai pada:",
    applications: [
      { title: "Distribusi musiman", body: "Kapasitas tambahan saat puncak permintaan." },
      { title: "Proyek konstruksi", body: "Penyimpanan material sensitif suhu di lokasi terbatas." },
      { title: "Uji operasi", body: "Validasi rantai dingin sebelum investasi permanen." },
      { title: "Ekspansi darurat", body: "Menahan stok saat cold room utama overload." },
    ],
    benefits: [
      { title: "Deploy cepat", body: "Modul terintegrasi memperpendek waktu siap operasi." },
      { title: "Spesifikasi jelas", body: "Suhu target dan kapasitas didefinisikan sejak awal." },
      { title: "Dukungan teknis", body: "Panduan operasi dan kontak support pasca instalasi." },
    ],
    industries: ["Agro & hortikultura", "Event catering", "Logistik", "Konstruksi industri"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Portable yang tetap dihitung secara engineering",
      lead: "Bukan sekadar container dingin — kapasitas dan insulasi dihitung sesuai profil produk.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter unit portable",
      lead: "Konfigurasi menyesuaikan produk dan infrastruktur listrik lokasi.",
      rows: [
        { label: "Envelope", value: "Panel PU modular — ketebalan sesuai suhu" },
        { label: "Suhu operasi", value: "Chiller atau freezer — disesuaikan komoditas" },
        { label: "Unit pendingin", value: "Kapasitas BTU/kW terukur untuk beban" },
        { label: "Kelistrikan", value: "Kebutuhan daya disepakati sebelum mobilisasi" },
        { label: "Mobilisasi", value: "Koordinasi akses lokasi & positioning unit" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi cold storage modular & portable",
      lead: "Pekerjaan panel insulated skala hub dan modul cepat.",
      categories: ["CS Portable", "Cold Storage"],
    },
    faq: [
      {
        question: "Apakah portable cocok untuk suhu freezer?",
        answer:
          "Ya, dengan perhitungan insulasi dan kapasitas pendingin yang memadai. Profil produk dan siklus buka pintu menjadi acuan desain.",
      },
      {
        question: "Berapa lama unit bisa dipakai?",
        answer:
          "Desain mengikuti durasi proyek Anda — mulai dari bulanan hingga multi-tahun dengan perawatan berkala.",
      },
      {
        question: "Apakah perlu fondasi khusus?",
        answer:
          "Kami evaluasi kondisi lantai dan akses saat survei agar unit stabil dan aman dioperasikan.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "sandwich-panel-knock-down", "blast-freezer", "refrigeration-system"],
    relatedProductSlugs: ["cold-storage-portable", "sandwich-panel-pu-full-knock-down"],
    waMessageKey: "portable_cold_storage",
    waContext: "solusi_sistem",
    ctaHeadline: "Butuh kapasitas dingin sementara?",
    ctaLead: "Jelaskan durasi proyek dan suhu target — kami rekomendasikan konfigurasi portable yang realistis.",
  },
  {
    slug: "blast-freezer",
    kind: "primary",
    navLabel: "Blast Freezer",
    metaTitle: "Blast Freezer & Air Blast Freezer Industri | AYTI Indo Panel",
    metaDescription:
      "Sistem blast freezer (ABF) untuk pembekuan cepat komoditas makanan. Panel insulated, distribusi udara tinggi, commissioning suhu core — AYTI Indo Panel.",
    hero: {
      h1: "Blast Freezer — Pembekuan Cepat untuk Industri",
      subheadline: "Pull-down temperature cepat dengan envelope dan sistem udara yang terukur.",
      lead:
        "Blast freezer (air blast freezer) dirancang menurunkan suhu inti produk dalam waktu singkat — menjaga kualitas tekstur, mengurangi kristal es besar, dan mendukung throughput produksi.",
      bullets: [
        "Konfigurasi ABF sesuai jenis komoditas",
        "Panel PU + sistem refrigerasi terkoordinasi",
        "Commissioning pull-down sesuai target produksi",
      ],
      imageSrc: "/images/layanan/testing-commissioning/1.jpg",
      imageAlt: "Sistem blast freezer industri",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Pembekuan cepat sebagai tahap kritis produksi",
      paragraphs: [
        "Pada industri seafood, daging, dan frozen food, waktu pembekuan mempengaruhi kualitas jual dan shelf life. Ruangan ABF membutuhkan aliran udara tinggi, insulasi kuat, dan kapasitas pendingin yang tidak under-sized.",
        "Kami membangun blast freezer sebagai sistem lengkap — bukan hanya menambahkan evaporator pada ruangan biasa.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Menurunkan suhu inti produk secara cepat melalui forced air circulation pada suhu sangat rendah.",
      },
      {
        title: "Aplikasi umum",
        body: "Pabrik seafood, poultry, bakery beku, dan line produksi yang membutuhkan IQF atau pembekuan batch.",
      },
      {
        title: "Manfaat operasional",
        body: "Kualitas produk lebih konsisten, reject akibat pembekuan lambat berkurang, throughput line meningkat.",
      },
    ],
    applicationsIntro: "Blast freezer kami relevan untuk:",
    applications: [
      { title: "Seafood processing", body: "Batch cepat setelah sortir dan washing." },
      { title: "Meat & poultry", body: "Pembekuan primal cut sebelum distribusi." },
      { title: "Frozen bakery", body: "Stabilisasi produk setengah jadi sebelum packing." },
      { title: "Export commodity", body: "Memenuhi standar suhu core untuk pengapalan." },
    ],
    benefits: [
      { title: "Profil udara terarah", body: "Distribusi airflow disesuaikan rak dan kemasan produk." },
      { title: "Insulasi kuat", body: "Panel mencegah heat gain yang memperlambat pull-down." },
      { title: "Data commissioning", body: "Uji suhu core terdokumentasi sebelum operasi penuh." },
    ],
    industries: ["Seafood", "Daging & unggas", "Frozen food", "Ekspor komoditas"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "ABF dirancang dari beban produk, bukan template",
      lead: "Kapasitas dan waktu pembekuan diturunkan dari data produk nyata Anda.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter blast freezer",
      lead: "Target suhu core dan waktu siklus menjadi acuan utama desain.",
      rows: [
        { label: "Suhu ruangan", value: "Umum −35 hingga −40 °C (sesuai komoditas)" },
        { label: "Airflow", value: "High-velocity forced air — layout rack disesuaikan" },
        { label: "Panel insulasi", value: "PU ketebalan above standard cold room" },
        { label: "Refrigerasi", value: "Kapasitas pull-down terukur untuk batch size" },
        { label: "Waktu siklus", value: "Didefinisikan per jenis produk & kemasan" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi blast freezer & pembekuan cepat",
      lead: "Dokumentasi pekerjaan ABF dan cold storage terkait.",
      categories: ["ABF (Air Blast Freezer)", "Cold Storage"],
    },
    faq: [
      {
        question: "Berapa lama waktu pembekuan yang bisa dicapai?",
        answer:
          "Bergantung jenis produk, ketebalan, dan suhu awal. Setelah data produksi dibagikan, target pull-down dirumuskan dalam desain.",
      },
      {
        question: "Apakah blast freezer bisa ditambah pada cold storage existing?",
        answer:
          "Perlu evaluasi envelope, kapasitas mesin, dan alur operasi. Survei lapangan menentukan apakah upgrade atau ruang baru lebih ekonomis.",
      },
      {
        question: "Bagaimana maintenance ABF?",
        answer:
          "Program perawatan evaporator, defrost, dan cek kebocoran refrigeran — bisa dikombinasikan dengan layanan maintenance kami.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "refrigeration-system", "sandwich-panel-pu", "cold-room-door"],
    relatedProductSlugs: ["pembekuan-cepat-abf", "cold-storage-custom", "sistem-refrigerasi"],
    waMessageKey: "air_blast_freezer",
    waContext: "solusi_sistem",
    ctaHeadline: "Rencanakan blast freezer untuk line produksi Anda",
    ctaLead: "Bagikan jenis produk dan target throughput — tim kami bantu gambaran sistem ABF yang sesuai.",
  },
  {
    slug: "refrigeration-system",
    kind: "primary",
    navLabel: "Sistem Refrigerasi",
    metaTitle: "Sistem Refrigerasi Industri & Cold Room | AYTI Indo Panel",
    metaDescription:
      "Instalasi sistem refrigerasi industri: unit cooler, condensing, piping, dan balancing. Terintegrasi dengan panel cold storage — mitra teknis AYTI Indo Panel.",
    hero: {
      h1: "Sistem Refrigerasi Industri Terintegrasi",
      subheadline: "Kapasitas pendingin yang selaras dengan envelope dan beban operasi nyata.",
      lead:
        "Mesin pendingin adalah jantung cold storage. Kami merancang dan mengkoordinasikan sistem refrigerasi agar kapasitas, distribusi, dan kontrol suhu mendukung pola operasi harian Anda.",
      bullets: [
        "Perhitungan kapasitas berdasarkan beban dan suhu target",
        "Koordinasi dengan panel insulated & pintu cold room",
        "Commissioning dan tuning sebelum operasi penuh",
      ],
      imageSrc: "/images/spesialisasi/spesialisasi-refrigerasi.png",
      imageAlt: "Sistem refrigerasi industri cold storage",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Refrigerasi yang dipahami dalam konteks ruangan",
      paragraphs: [
        "Kesalahan sizing atau distribusi refrigerasi sering membuat cold room terasa \"tidak dingin\" meski listrik membengkak. Kami mendekati sistem refrigerasi bersama envelope insulated — karena keduanya menentukan performa akhir.",
        "Layanan ini mencakup pemilihan unit, routing pipa, electrical coordination, hingga uji operasional dan penyerahan dokumentasi teknis.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Menyerap panas dari ruangan terkontrol dan membuangnya ke lingkungan luar melalui siklus refrigerasi yang stabil.",
      },
      {
        title: "Aplikasi umum",
        body: "Cold room, blast freezer, process cooling, dan upgrade sistem pada fasilitas existing.",
      },
      {
        title: "Manfaat operasional",
        body: "Suhu stabil, downtime berkurang, konsumsi energi lebih terprediksi saat sistem sized dengan benar.",
      },
    ],
    applicationsIntro: "Sistem refrigerasi kami mendukung:",
    applications: [
      { title: "Cold storage multi-zona", body: "Chiller, freezer, dan anteroom dalam satu site." },
      { title: "Blast freezing", body: "Kapasitas pull-down tinggi untuk line produksi." },
      { title: "Process area", body: "Pendinginan ruang produksi bersuhu terkontrol." },
      { title: "Retrofit & upgrade", body: "Peningkatan kapasitas pada cold room existing." },
    ],
    benefits: [
      { title: "Sizing terukur", body: "Kapasitas tidak asal oversize atau undersize." },
      { title: "Integrasi panel", body: "Koordinasi dengan tim panel untuk minim heat bridge." },
      { title: "Dokumentasi teknis", body: "Diagram dan parameter operasi untuk tim maintenance Anda." },
    ],
    industries: ["Makanan & minuman", "Farmasi", "Distribusi", "Manufaktur"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Refrigerasi + panel dalam satu koordinasi",
      lead: "Mengurangi saling lempar tanggung jawab antara kontraktor panel dan HVAC.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Komponen sistem refrigerasi",
      lead: "Merek dan tipe equipment disesuaikan ketersediaan dan spesifikasi proyek.",
      rows: [
        { label: "Unit indoor", value: "Evaporator / unit cooler — kapasitas terukur" },
        { label: "Unit outdoor", value: "Condensing unit atau rack system" },
        { label: "Refrigeran", value: "Sesuai regulasi & desain (mis. R404A, R448A, dll.)" },
        { label: "Piping", value: "Insulated suction & liquid line — routing terencana" },
        { label: "Kontrol", value: "Thermostat, defrost cycle, alarm (opsional PLC)" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi instalasi refrigerasi",
      lead: "Pekerjaan sistem pendingin pada cold storage dan hub logistik.",
      categories: ["Refrigeration System", "Cold Storage"],
    },
    faq: [
      {
        question: "Apakah bisa hanya instalasi mesin tanpa panel?",
        answer:
          "Bisa, dengan catatan envelope existing dievaluasi dulu. Kami cek insulasi dan kebocoran termal agar mesin tidak bekerja berlebihan.",
      },
      {
        question: "Bagaimana jika cold room tidak dingin?",
        answer:
          "Troubleshooting mencakup beban, refrigeran, defrost, dan envelope. Tim kami bisa membantu diagnosa terstruktur.",
      },
      {
        question: "Apakah menyediakan maintenance?",
        answer:
          "Ya, tersedia layanan maintenance berkala dan dukungan pasca proyek — diskusikan SLA sesuai kebutuhan operasi.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "blast-freezer", "cold-room-door", "sandwich-panel-pu"],
    relatedProductSlugs: ["sistem-refrigerasi", "cold-storage-custom", "maintenance-berkala"],
    waMessageKey: "refrigeration_system",
    waContext: "solusi_sistem",
    ctaHeadline: "Evaluasi sistem refrigerasi fasilitas Anda",
    ctaLead: "Ceritakan keluhan operasional atau rencana upgrade — kami bantu identifikasi langkah teknis berikutnya.",
  },
  {
    slug: "cold-room-door",
    kind: "primary",
    navLabel: "Pintu Cold Room",
    metaTitle: "Pintu Cold Room Industri | PT AYTI INDO PANEL",
    metaDescription:
      "Pintu cold room hinged & sliding untuk chiller dan freezer. Seal termal presisi, hardware tahan suhu rendah, instalasi rapi — AYTI Indo Panel.",
    hero: {
      h1: "Pintu Cold Room — Akses yang Kedap dan Tahan Operasi",
      subheadline: "Hardware dan seal yang dirancang untuk suhu rendah dan frekuensi buka tinggi.",
      lead:
        "Pintu adalah titik paling aktif pada cold storage. Kami menyediakan pintu cold room dengan seal, heater frame (jika diperlukan), dan hardware yang disesuaikan zona suhu dan traffic operasi.",
      bullets: [
        "Hinged & sliding — sesuai layout dan alur forklift",
        "Seal termal untuk minim infiltrasi udara",
        "Koordinasi bukaan dengan panel insulated",
      ],
      imageSrc: "/images/spesialisasi/spesialisasi-doordock.png",
      imageAlt: "Pintu cold room industri",
    },
    overview: {
      eyebrow: "Penjelasan layanan",
      title: "Akses ruang dingin yang sering diremehkan",
      paragraphs: [
        "Kebocoran di pintu cold room memaksa mesin pendingin bekerja lebih keras dan menciptakan es pada frame. Pemilihan tipe pintu, ukuran bukaan, dan sistem seal harus selaras dengan zona suhu dan frekuensi akses.",
        "Kami memasang pintu sebagai bagian dari sistem cold storage — bukan komponen terpisah yang dipasang tanpa koordinasi panel.",
      ],
    },
    functions: [
      {
        title: "Fungsi utama",
        body: "Memberi akses personel dan material sambil menjaga integritas termal ruangan dingin.",
      },
      {
        title: "Aplikasi umum",
        body: "Cold room chiller/freezer, blast freezer, anteroom, dan area loading berpendingin.",
      },
      {
        title: "Manfaat operasional",
        body: "Fluktuasi suhu saat buka pintu berkurang, es pada frame lebih terkontrol, maintenance seal lebih terjadwal.",
      },
    ],
    applicationsIntro: "Pintu cold room dipasang pada berbagai konfigurasi:",
    applications: [
      { title: "Gudang distribusi", body: "Pintu lebar untuk pallet dan forklift." },
      { title: "Produksi makanan", body: "Akses higienis antar zona suhu berbeda." },
      { title: "Blast freezer", body: "Seal kuat untuk suhu sangat rendah." },
      { title: "Clean room terkontrol", body: "Kombinasi dengan panel dan tekanan ruang." },
    ],
    benefits: [
      { title: "Ukuran custom", body: "Lebar dan tinggi bukaan mengikuti alat angkut." },
      { title: "Hardware tahan dingin", body: "Engsel dan handle untuk lingkungan lembap dan dingin." },
      { title: "Instalasi presisi", body: "Alignment frame agar seal bekerja optimal sepanjang usia pakai." },
    ],
    industries: ["Logistik dingin", "F&B", "Farmasi", "Ritel"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Pintu terintegrasi dengan envelope panel",
      lead: "Bukaan dirancang bersamaan dengan layout panel — bukan dipotong belakangan.",
      items: [...SHARED_ADVANTAGES],
    },
    specs: {
      eyebrow: "Spesifikasi & fitur",
      title: "Parameter pintu cold room",
      lead: "Tipe pintu dipilih setelah memetakan traffic dan suhu zona.",
      rows: [
        { label: "Tipe", value: "Swing (hinged) · Sliding · Kombinasi air curtain" },
        { label: "Material panel pintu", value: "PU insulated — ketebalan selaras dinding" },
        { label: "Seal", value: "Magnetic gasket / brush seal — sesuai suhu" },
        { label: "Frame heater", value: "Opsional pada freezer untuk anti icing" },
        { label: "Hardware", value: "Stainless / coated steel untuk lingkungan lembap" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi pintu & cold room",
      lead: "Instalasi cold storage dengan akses pintu frekuensi tinggi.",
      categories: ["Cold Storage", "Proses Area"],
    },
    faq: [
      {
        question: "Pintu sliding atau swing lebih baik?",
        answer:
          "Sliding menghemat ruang clearance; swing lebih ekonomis untuk bukaan kecil. Layout forklift dan anteroom menjadi penentu utama.",
      },
      {
        question: "Mengapa frame pintu membeku?",
        answer:
          "Biasanya karena infiltrasi udara, seal aus, atau tanpa frame heater pada freezer. Evaluasi lapangan menentukan perbaikan yang tepat.",
      },
      {
        question: "Apakah bisa ganti pintu saja?",
        answer:
          "Ya, dengan pengukuran ulang bukaan dan kondisi panel existing. Kami pastikan dimensi dan seal compatible.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "sandwich-panel-pu", "refrigeration-system", "cold-storage-portable"],
    relatedProductSlugs: ["pintu-panel", "cold-storage-custom", "loading-dock-system"],
    waMessageKey: "cold_room_door",
    waContext: "accessories",
    ctaHeadline: "Konsultasikan kebutuhan pintu cold room",
    ctaLead: "Kirim foto bukaan existing atau gambar kerja — kami bantu pilih tipe dan ukuran yang sesuai.",
  },
  {
    slug: "cold-storage-murah",
    kind: "support",
    navLabel: "Cold Storage — Panduan Investasi",
    metaTitle: "Cold Storage Efisien Biaya untuk UKM & Industri | AYTI Indo Panel",
    metaDescription:
      "Panduan merencanakan cold storage dengan investasi terukur: prioritas spesifikasi, fase proyek, dan efisiensi operasi jangka panjang — tanpa mengorbankan keamanan produk.",
    hero: {
      h1: "Cold Storage dengan Investasi Terukur dan Aman Operasi",
      subheadline: "Efisiensi biaya melalui perencanaan teknis — bukan pemotongan kualitas sembarangan.",
      lead:
        "Kebutuhan \"cold storage hemat\" sering muncul dari tekanan budget. Kami membantu Anda memprioritaskan spesifikasi yang benar-benar berdampak pada suhu dan biaya operasi, sambil menghindari risiko mahal di kemudian hari.",
      bullets: [
        "Survei lokasi sebelum komitmen investasi",
        "Opsi fase proyek dan modular",
        "Fokus pada total cost of ownership, bukan harga unit semata",
      ],
      imageSrc: "/images/layanan/konsultasi-desain-sistem/1.jpg",
      imageAlt: "Konsultasi perencanaan cold storage",
    },
    overview: {
      eyebrow: "Edukasi & solusi",
      title: "Memahami di mana biaya sebenarnya berada",
      paragraphs: [
        "Biaya cold storage tidak hanya terlihat pada kontrak awal. Ketebalan panel yang kurang, mesin pendingin under-sized, atau pintu yang tidak kedap akan memunculkan tagihan listrik dan reject produk yang jauh lebih mahal dari selisih harga awal.",
        "Pendekatan kami: transparansi spesifikasi, prioritas kebutuhan operasional, dan rekomendasi fase yang realistis — agar investasi Anda terukur tanpa mengorbankan keamanan stok.",
      ],
    },
    functions: [
      {
        title: "Apa yang bisa dioptimalkan",
        body: "Dimensi fase awal, zonasi suhu, dan pemilihan peralatan sesuai beban aktual — bukan overspec kosmetik.",
      },
      {
        title: "Apa yang tidak boleh dikompromikan",
        body: "Insulasi panel, kapasitas pendingin pada beban puncak, dan seal pintu — karena langsung mempengaruhi suhu dan safety produk.",
      },
      {
        title: "Manfaat perencanaan",
        body: "Cash flow lebih terkendali, ekspansi bisa dijadwalkan, operasi tidak terganggu oleh rework.",
      },
    ],
    applicationsIntro: "Pendekatan terukur cocok untuk:",
    applications: [
      { title: "UKM naik skala", body: "Mulai dari satu zona chiller sebelum menambah freezer." },
      { title: "Distribusi regional", body: "Prioritas ruang dengan turnover tertinggi." },
      { title: "Proyek sewa", body: "Portable atau modular untuk mengurangi capex tetap." },
      { title: "Replacing unit lama", body: "Upgrade refrigerasi setelah audit energi." },
    ],
    benefits: [
      { title: "Konsultasi jujur", body: "Rekomendasi yang bisa dipertanggungjawabkan secara teknis." },
      { title: "Tanpa paket gimmick", body: "Spesifikasi ditulis jelas — tidak ada janji berlebihan." },
      { title: "Trust & dokumentasi", body: "Proposal berisi parameter utama yang disepakati." },
    ],
    industries: ["UMKM makanan", "Distributor lokal", "Retail berkembang", "Startup F&B"],
    advantages: {
      eyebrow: "Mengapa berdiskusi dulu",
      title: "Mitigasi risiko lebih murah daripada rework",
      lead: "Satu sesi survei dan perhitungan awal sering menghemat biaya pembenahan di tengah operasi.",
      items: [
        "Survei lokasi dan kebutuhan sebelum penawaran final",
        "Perbandingan opsi modular vs permanen",
        "Perhitungan kasar beban dingin untuk arah kapasitas mesin",
        "Transparansi ruang lingkup kontrak",
        "Garansi komunikasi satu pintu selama proyek",
      ],
    },
    specs: {
      eyebrow: "Checklist perencanaan",
      title: "Parameter yang mempengaruhi investasi",
      lead: "Gunakan daftar ini saat membandingkan penawaran dari mana pun.",
      rows: [
        { label: "Luas & tinggi ruang", value: "Volume menentukan panel dan kapasitas mesin" },
        { label: "Suhu target", value: "Freezer membutuhkan insulasi lebih tebal daripada chiller" },
        { label: "Frekuensi buka pintu", value: "Mempengaruhi sizing refrigerasi" },
        { label: "Infrastruktur listrik", value: "Biaya tambahan jika kapasitas PLN terbatas" },
        { label: "Jadwal operasi", value: "Instalasi fase bisa mengurangi downtime" },
      ],
    },
    portfolio: {
      eyebrow: "Referensi",
      title: "Proyek dengan pendekatan bertahap",
      lead: "Contoh instalasi yang dimulai dari kapasitas inti lalu berkembang.",
      categories: ["Cold Storage", "CS Portable"],
    },
    faq: [
      {
        question: "Apakah ada cold storage \"paling murah\"?",
        answer:
          "Harga terendah tanpa konteks spesifikasi sering berisiko. Kami bantu Anda memahami trade-off dan memilih konfigurasi yang masuk akal untuk operasi.",
      },
      {
        question: "Bisakah mulai kecil lalu menambah?",
        answer:
          "Ya, dengan perencanaan modular dan layout yang disiapkan untuk perluasan. Ini sering strategi terbaik untuk cash flow.",
      },
      {
        question: "Bagaimana cara meminta estimasi?",
        answer:
          "Kirim perkiraan luas, suhu target, dan jenis produk via WhatsApp. Tim kami jadwalkan survei untuk angka yang lebih akurat.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "cold-storage-berkualitas", "cold-storage-portable", "sandwich-panel-knock-down"],
    relatedProductSlugs: ["cold-storage-custom", "cold-storage-portable"],
    waMessageKey: "cold_storage_system",
    waContext: "konsultasi",
    ctaHeadline: "Rencanakan cold storage sesuai budget operasional",
    ctaLead: "Diskusi awal gratis — kami bantu urutkan prioritas teknis sebelum Anda memutuskan investasi.",
  },
  {
    slug: "cold-storage-berkualitas",
    kind: "support",
    navLabel: "Cold Storage Berkualitas",
    metaTitle: "Cold Storage Berkualitas untuk Industri | PT AYTI INDO PANEL",
    metaDescription:
      "Standar kualitas cold storage industri: material, instalasi, commissioning, dan dokumentasi. Mitra teknis untuk stabilitas suhu jangka panjang — AYTI Indo Panel.",
    hero: {
      h1: "Cold Storage Berkualitas untuk Operasi Jangka Panjang",
      subheadline: "Kualitas terlihat pada stabilitas suhu, bukan hanya pada hari serah terima.",
      lead:
        "Cold storage berkualitas dibangun dari material yang tepat, instalasi disiplin, dan commissioning terukur. Kami menerapkan standar kerja yang bisa diaudit — dari panel hingga sistem refrigerasi.",
      bullets: [
        "Checklist kualitas fabrikasi dan lapangan",
        "Commissioning suhu terdokumentasi",
        "Dukungan pasca proyek untuk continuity operasi",
      ],
      imageSrc: "/images/layanan/testing-commissioning/2.jpg",
      imageAlt: "Commissioning cold storage berkualitas",
    },
    overview: {
      eyebrow: "Standar & kepercayaan",
      title: "Kualitas sebagai sistem kerja, bukan slogan",
      paragraphs: [
        "Industri frozen food, farmasi, dan distribusi tidak bisa toleran terhadap fluktuasi suhu. Kualitas cold storage diukur dari kemampuan ruangan mempertahankan setpoint saat beban puncak dan frekuensi buka pintu tinggi.",
        "PT AYTI INDO PANEL menerapkan koordinasi produksi panel, instalasi, dan refrigerasi dengan dokumentasi proyek yang jelas — sehingga tim Anda punya acuan saat audit internal atau ekspansi berikutnya.",
      ],
    },
    functions: [
      {
        title: "Material",
        body: "Panel PU, seal pintu, dan komponen refrigerasi dipilih sesuai spesifikasi proyek — bukan substitusi diam-diam.",
      },
      {
        title: "Instalasi",
        body: "Sambungan panel, penetrasi pipa, dan alignment pintu dikontrol dengan checklist lapangan.",
      },
      {
        title: "Commissioning",
        body: "Uji pull-down, stabilisasi suhu, dan serah terima parameter operasi ke tim Anda.",
      },
    ],
    applicationsIntro: "Standar kualitas kami relevan untuk:",
    applications: [
      { title: "Audit rantai dingin", body: "Dokumentasi suhu dan layout untuk kepatuhan internal." },
      { title: "Farmasi & medis", body: "Stabilitas suhu dan higienitas area." },
      { title: "Ekspor makanan", body: "Konsistensi suhu core untuk shipment." },
      { title: "Retail & distribusi", body: "Uptime tinggi dengan maintenance terjadwal." },
    ],
    benefits: [
      { title: "Stabilitas suhu", body: "Envelope dan mesin diselaraskan sejak desain." },
      { title: "Dokumentasi", body: "Gambar kerja dan laporan uji untuk tim maintenance." },
      { title: "Mitra jangka panjang", body: "Support pasca commissioning — bukan sekadar serah terima." },
    ],
    industries: ["Farmasi", "Frozen food", "Distribusi nasional", "Manufaktur"],
    advantages: {
      eyebrow: "Keunggulan",
      title: "Kualitas yang bisa diverifikasi",
      lead: "Kami mengundang klien melihat progres fabrikasi dan mengikuti checklist commissioning.",
      items: [
        "Material sesuai spesifikasi kontrak",
        "Tim lapangan berpengalaman cold storage industri",
        "Commissioning terukur sebelum operasi penuh",
        "Dokumentasi as-built dan parameter sistem",
        "Layanan maintenance dan troubleshooting tersedia",
      ],
    },
    specs: {
      eyebrow: "Indikator kualitas",
      title: "Apa yang kami ukur saat serah terima",
      lead: "Parameter berikut menjadi acuan penerimaan proyek.",
      rows: [
        { label: "Stabilitas setpoint", value: "Suhu ruang dalam toleransi disepakati" },
        { label: "Pull-down time", value: "Waktu mencapai suhu operasi dari kondisi awal" },
        { label: "Integritas panel", value: "Joint dan penetrasi terkontrol" },
        { label: "Fungsi pintu", value: "Seal dan heater frame (jika ada) bekerja normal" },
        { label: "Dokumentasi", value: "Parameter operasi dan kontak support diserahkan" },
      ],
    },
    portfolio: {
      eyebrow: "Proyek terkait",
      title: "Referensi cold storage skala industri",
      lead: "Dokumentasi proyek dengan standar commissioning penuh.",
      categories: ["Cold Storage", "ABF (Air Blast Freezer)", "Refrigeration System"],
    },
    faq: [
      {
        question: "Bagaimana membedakan cold storage berkualitas?",
        answer:
          "Perhatikan stabilitas suhu saat beban puncak, detail sambungan panel, dokumentasi commissioning, dan reputasi pengerjaan — bukan hanya tampilan panel.",
      },
      {
        question: "Apakah ada garansi?",
        answer:
          "Ruang lingkup garansi mengikuti kontrak proyek. Kami jelaskan secara transparan sebelum pekerjaan dimulai.",
      },
      {
        question: "Bisakah audit cold storage lama?",
        answer:
          "Ya, evaluasi envelope dan sistem refrigerasi bisa dilakukan untuk rekomendasi perbaikan atau upgrade.",
      },
    ],
    relatedServiceSlugs: ["cold-storage", "cold-storage-murah", "refrigeration-system", "blast-freezer"],
    relatedProductSlugs: ["cold-storage-custom", "sistem-refrigerasi", "maintenance-berkala"],
    waMessageKey: "cold_storage_system",
    waContext: "konsultasi",
    ctaHeadline: "Bangun cold storage dengan standar yang jelas",
    ctaLead: "Jadwalkan survei — kami tunjukkan pendekatan kualitas yang kami terapkan di lapangan.",
  },
];

export const PRIMARY_SERVICE_PAGES = SERVICE_PAGES.filter((p) => p.kind === "primary");
export const SUPPORT_SERVICE_PAGES = SERVICE_PAGES.filter((p) => p.kind === "support");

export const SERVICE_PAGE_SLUGS = SERVICE_PAGES.map((p) => p.slug);

/** Path publik halaman layanan SEO (di bawah indeks artikel). */
export const LAYANAN_PAGES_BASE_PATH = "/artikel/layanan";

/** Item navbar terpisah — bukan dropdown; mengarah ke indeks halaman layanan. */
export const LAYANAN_PAGES_NAV_ITEM = {
  id: "nav-halaman-layanan",
  label: "Halaman Layanan",
  /** Label ringkas — dipakai di navbar desktop (ujung kanan). */
  shortLabel: "Hal. Layanan",
  href: LAYANAN_PAGES_BASE_PATH,
} as const;

/** Pastikan item navbar Halaman Layanan selalu ada (desktop + mobile). */
export function mergeHalamanLayananNavItem(
  navItems: { id: string; label: string; shortLabel: string; href: string }[],
): { id: string; label: string; shortLabel: string; href: string }[] {
  if (navItems.some((i) => i.id === LAYANAN_PAGES_NAV_ITEM.id)) return navItems;
  const afterLayanan = navItems.findIndex((i) => i.id === "nav-layanan");
  const at = afterLayanan >= 0 ? afterLayanan + 1 : navItems.length;
  return [
    ...navItems.slice(0, at),
    { ...LAYANAN_PAGES_NAV_ITEM },
    ...navItems.slice(at),
  ];
}

export function mergeHalamanLayananMobileNavIds(mobileNavIds: string[]): string[] {
  const id = LAYANAN_PAGES_NAV_ITEM.id;
  if (mobileNavIds.includes(id)) return mobileNavIds;
  const afterLayanan = mobileNavIds.findIndex((x) => x === "nav-layanan");
  const at = afterLayanan >= 0 ? afterLayanan + 1 : mobileNavIds.length;
  return [...mobileNavIds.slice(0, at), id, ...mobileNavIds.slice(at)];
}

export function layananPagePath(slug: string): string {
  return `${LAYANAN_PAGES_BASE_PATH}/${slug}`;
}

export function getServicePageBySlug(slug: string): ServicePageDef | undefined {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

export function resolveServicePageMetadata(
  slug: string,
  content: SiteContent,
): Metadata | null {
  const page = getServicePageBySlug(slug);
  if (!page) return null;

  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const canonical = absoluteUrlFromSite(origin, resolveServicePublicPath(slug));
  const ogImage = resolveOgImageUrl(content, page.hero.imageSrc);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export const SERVICE_BRAND_TAGLINE = BRAND;
