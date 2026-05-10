export const PROJECT_CATEGORIES = [
  "All",
  "Cold Storage",
  "CS Portable",
  "ABF (Air Blast Freezer)",
  "Proses Area",
  "Clean Room",
  "Refrigeration System",
  "Maintenance",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = "Ongoing" | "Completed" | "Maintenance" | "Commissioning";

/** Badge status — terang & gelap (`prefers-color-scheme`) */
export const GALLERY_PROJECT_STATUS_BADGE_CLASS: Record<ProjectStatus, string> = {
  Ongoing:
    "border-amber-600/35 bg-amber-500/12 text-amber-950 dark:border-amber-300/50 dark:bg-amber-300/15 dark:text-amber-100",
  Completed:
    "border-emerald-600/30 bg-emerald-500/10 text-emerald-950 dark:border-emerald-300/50 dark:bg-emerald-300/15 dark:text-emerald-100",
  Maintenance:
    "border-sky-600/35 bg-sky-500/10 text-sky-950 dark:border-sky-300/45 dark:bg-sky-300/12 dark:text-sky-100",
  Commissioning:
    "border-violet-600/35 bg-violet-500/10 text-violet-950 dark:border-violet-300/45 dark:bg-violet-300/14 dark:text-violet-100",
};

export type GalleryProjectItem = {
  id: string;
  name: string;
  category: Exclude<ProjectCategory, "All">;
  location: string;
  /** Tahun proyek (teks bebas, mis. "2024" atau "2023–2025"). */
  year?: string;
  systemType: string;
  status: ProjectStatus;
  description: string;
  imageSrc: string;
  imageAlt: string;
  progress?: number;
  /** Video bagian atas: file di `public/images/gallery/` (path URL `/images/gallery/...`) atau embed YouTube/Vimeo */
  videoSrc?: string;
  /** Poster/thumbnail video (path `/...` atau data URL dari generate upload). */
  videoPosterSrc?: string;
  /** Autoplay muted + loop untuk video file (kebijakan browser: hanya dengan muted). */
  videoAutoplay?: boolean;
  /** Foto galeri di bawah video (geser horizontal) */
  galleryPhotos?: { src: string; alt: string }[];
};

/**
 * Source data gallery project.
 * Tambahkan item baru di sini agar UI / filter otomatis ikut ter-update.
 */
export const GALLERY_PROJECTS: readonly GalleryProjectItem[] = [
  {
    id: "cs-jabodetabek-distribusi",
    name: "Cold Storage Distribusi FMCG",
    category: "Cold Storage",
    location: "Jabodetabek",
    year: "2025",
    systemType: "Multi-zone chiller + freezer",
    status: "Completed",
    description:
      "Integrasi panel insulated dan sistem refrigerasi untuk kebutuhan throughput distribusi harian dengan traffic loading tinggi.",
    imageSrc: "/images/layanan/instalasi-sistem-pendingin/1.jpg",
    imageAlt: "Dokumentasi area cold storage distribusi FMCG",
    progress: 100,
    videoSrc:
      "/images/gallery/WhatsApp%20Video%202026-05-07%20at%2011.02.55.mp4",
    galleryPhotos: [
      {
        src: "/images/layanan/instalasi-sistem-pendingin/2.jpg",
        alt: "Instalasi sistem pendingin — sudut progres",
      },
      {
        src: "/images/layanan/instalasi-panel-cold-room/2.jpg",
        alt: "Instalasi sandwich panel — referensi commissioning",
      },
      {
        src: "/images/layanan/instalasi-panel-cold-room/1.jpg",
        alt: "Referensi panel cold room terkait proyek",
      },
    ],
  },
  {
    id: "abf-seafood-processing",
    name: "ABF Processing Seafood",
    category: "ABF (Air Blast Freezer)",
    location: "Jawa Timur",
    year: "2024",
    systemType: "Air Blast Freezer + PU panel envelope",
    status: "Commissioning",
    description:
      "Konfigurasi ABF untuk target pull-down temperature cepat dan stabil, termasuk tuning commissioning sesuai profil beban.",
    imageSrc: "/images/layanan/testing-commissioning/1.jpg",
    imageAlt: "Dokumentasi project ABF seafood",
    progress: 86,
  },
  {
    id: "cold-room-pharma",
    name: "Cold Room Farmasi",
    category: "Proses Area",
    location: "Bandung",
    year: "2025",
    systemType: "Cold room higienis + kontrol suhu presisi",
    status: "Ongoing",
    description:
      "Pembangunan cold room bersuhu terkontrol untuk penyimpanan farmasi dengan fokus stabilitas temperatur dan sanitasi area.",
    imageSrc: "/images/layanan/instalasi-panel-cold-room/1.jpg",
    imageAlt: "Dokumentasi cold room farmasi",
    progress: 64,
  },
  {
    id: "refrigeration-retail-chain",
    name: "Refrigeration Upgrade Retail Chain",
    category: "Cold Storage",
    location: "Jakarta",
    year: "2023",
    systemType: "Rack refrigeration + balancing distribution",
    status: "Maintenance",
    description:
      "Program upgrade sistem refrigerasi dan preventive maintenance untuk menjaga uptime outlet serta efisiensi operasi.",
    imageSrc: "/images/layanan/maintenance-after-sales/1.jpg",
    imageAlt: "Dokumentasi maintenance refrigeration retail",
    progress: 72,
  },
  {
    id: "panel-insulated-logistics",
    name: "Panel Insulated Hub Logistik",
    category: "CS Portable",
    location: "Semarang",
    year: "2024",
    systemType: "Sandwich panel PU + loading dock integration",
    status: "Completed",
    description:
      "Implementasi panel insulated skala hub logistik dengan koordinasi utilitas dan optimasi alur bongkar-muat rantai dingin.",
    imageSrc: "/images/layanan/produksi-panel-pu-eps/1.jpg",
    imageAlt: "Dokumentasi panel insulated hub logistik",
    progress: 100,
  },
  {
    id: "cold-storage-fnb-central-kitchen",
    name: "Cold Storage Central Kitchen F&B",
    category: "Cold Storage",
    location: "Surabaya",
    year: "2025",
    systemType: "Dual-temp storage + operational zoning",
    status: "Completed",
    description:
      "Pengembangan cold storage untuk central kitchen dengan zoning operasional agar handling bahan baku lebih terstruktur.",
    imageSrc: "/images/layanan/konsultasi-desain-sistem/1.jpg",
    imageAlt: "Dokumentasi cold storage central kitchen",
    progress: 100,
  },
] as const;
