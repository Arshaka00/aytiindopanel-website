import {
  IconCompanyLocation,
  IconManufacturing,
  IconMessageCircle,
  IconProcessInstall,
  IconThermostat,
} from "@/components/aytipanel/icons";

export const PROSES_KERJA_STEPS = [
  {
    slug: "konsultasi",
    title: "Konsultasi",
    Icon: IconMessageCircle,
    page: {
      description:
        "Tahap konsultasi kebutuhan cold room dan sistem refrigerasi — definisi scope, constraint lapangan, dan garis besar solusi bersama PT AYTI INDO PANEL.",
      intro:
        "Kami memulai dengan memahami kebutuhan operasi Anda: jenis produk, setpoint suhu, throughput, dan ketersediaan utilitas. Diskusi ini menjadi dasar dokumen scope yang jelas sebelum survey atau estimasi lebih rinci.",
      sections: [
        {
          title: "Yang biasanya dibahas",
          body:
            "Kebutuhan ruang dingin atau zona suhu, perkiraan volume produksi, integrasi dengan lini yang ada, target jadwal, dan preferensi material/envelope panel.",
        },
        {
          title: "Keluaran tahap ini",
          body:
            "Kesepakatan awal arah solusi, daftar pertanyaan/BOQ untuk dilengkapi, dan jadwal lanjutan (survey lapangan atau penyusunan proposal teknis).",
        },
      ] as const,
    },
  },
  {
    slug: "survey",
    title: "Survey",
    Icon: IconCompanyLocation,
    page: {
      description:
        "Survey lapangan untuk pengukuran, pengecekan akses, dan pencatatan kondisi eksisting sebelum desain fabrikasi dan instalasi.",
      intro:
        "Tim teknis mengunjungi lokasi untuk memverifikasi dimensi, jalur akses peralatan, titik penetrasi utilitas, dan hal-hal yang memengaruhi pemasangan panel serta mesin pendingin.",
      sections: [
        {
          title: "Aktivitas lapangan",
          body:
            "Pengukuran ruang, dokumentasi foto/kondisi struktur, pembahasan koordinasi dengan kontraktor lain, dan identifikasi risiko yang perlu mitigasi di gambar kerja.",
        },
        {
          title: "Setelah survey",
          body:
            "Data lapangan disinkronkan dengan engineering; pembaruan gambar, BOM, dan urutan kerja agar eksekusi produksi dan instalasi selaras dengan kondisi nyata di site.",
        },
      ] as const,
    },
  },
  {
    slug: "produksi",
    title: "Produksi",
    Icon: IconManufacturing,
    page: {
      description:
        "Fabrikasi sandwich panel PU/EPS dan komponen terkait di fasilitas produksi dengan pengawasan kualitas.",
      intro:
        "Panel dan aksesori diproduksi mengacu spesifikasi proyek yang sudah disepakati — ketebalan, density, joint, dan finishing disesuaikan dengan beban thermal dan kebutuhan hygiene bila diperlukan.",
      sections: [
        {
          title: "Kontrol kualitas",
          body:
            "Proses produksi mengikuti baseline teknis; inspeksi visual dan parameter material dapat dirujuk untuk pelacakan batch dan kejelasan di serah terima.",
        },
        {
          title: "Logistik ke site",
          body:
            "Penjadwalan pengiriman diselaraskan dengan jendela instalasi di lapangan sehingga material tiba sesuai urutan pemasangan dan mitigasi penyimpanan sementara.",
        },
      ] as const,
    },
  },
  {
    slug: "instalasi",
    title: "Instalasi",
    Icon: IconProcessInstall,
    page: {
      description:
        "Pemasangan panel envelope cold room dan integrasi awal dengan utilitas serta peralatan refrigerasi di lokasi proyek.",
      intro:
        "Instalasi dilaksanakan oleh tim lapangan dengan metode kerja dan checklist yang selaras dengan desain. Koordinasi dengan pemilik proyek menjaga alur kerja aman dan sesuai jadwal milestone.",
      sections: [
        {
          title: "Lingkup instalasi",
          body:
            "Perakitan panel, pintu, seal joint, penetrasi pipa/listrik sesuai shop drawing, serta koordinasi dengan pekerja mekanikal/elektrikal lain jika ada.",
        },
        {
          title: "Catatan proyek",
          body:
            "Perubahan kondisi lapangan didokumentasikan; penyesuaian kecil dieksekusi dengan persetujuan agar hasil akhir tetap memenuhi spesifikasi operasional.",
        },
      ] as const,
    },
  },
  {
    slug: "selesai",
    title: "Selesai",
    Icon: IconThermostat,
    page: {
      description:
        "Testing, commissioning, dan serah terima sistem pendingin agar ruang dingin siap operasi sesuai parameter yang disepakati.",
      intro:
        "Setelah pemasangan, sistem diuji pull-down, stabilitas suhu, dan titik-titik kritis operasi. Serah terima meliputi dokumentasi as-built ringkas dan panduan operasi dasar untuk tim Anda.",
      sections: [
        {
          title: "Commissioning",
          body:
            "Verifikasi setpoint, alarm, defrost, dan keselarasan dengan beban nyata; koreksi minor dilakukan sebelum penandatanganan berita acara.",
        },
        {
          title: "Setelah serah terima",
          body:
            "Dukungan after-sales dan perawatan dapat dijadwalkan sesuai kebutuhan — menjaga keandalan sistem untuk jangka panjang.",
        },
      ] as const,
    },
  },
] as const;

export type ProsesKerjaStep = (typeof PROSES_KERJA_STEPS)[number];
export type ProsesKerjaSlug = ProsesKerjaStep["slug"];

export function getProsesKerjaStepBySlug(slug: string): ProsesKerjaStep | null {
  const found = PROSES_KERJA_STEPS.find((s) => s.slug === slug);
  return found ?? null;
}

export function getProsesKerjaStepContext(slug: ProsesKerjaSlug): {
  step: ProsesKerjaStep;
  index: number;
  prev: ProsesKerjaStep | null;
  next: ProsesKerjaStep | null;
} | null {
  const index = PROSES_KERJA_STEPS.findIndex((s) => s.slug === slug);
  if (index < 0) return null;
  const step = PROSES_KERJA_STEPS[index]!;
  return {
    step,
    index,
    prev: index > 0 ? PROSES_KERJA_STEPS[index - 1]! : null,
    next: index < PROSES_KERJA_STEPS.length - 1 ? PROSES_KERJA_STEPS[index + 1]! : null,
  };
}
