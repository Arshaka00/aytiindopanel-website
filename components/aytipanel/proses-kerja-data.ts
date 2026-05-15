import {
  IconColdStorage,
  IconDoorDock,
  IconRefrigerationSystem,
  IconSandwichPanelEPS,
  IconSandwichPanelPU,
} from "@/components/aytipanel/icons";

/** Warna ikon SVG fallback hero — `currentColor` + glow di latar gelap. */
const HERO_GLYPH_SHADOW =
  "drop-shadow-[0_1px_0_rgba(255,255,255,0.32)] drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]";

/**
 * Gambar referensi per produk (JPG) — selaras judul strip PRODUCTS OF.
 * Dipakai bila `hero.prosesStepImages.<slug>` kosong; CMS live/draft mengarah ke path ini.
 */
export const PROSES_STEP_DEFAULT_IMAGES = {
  konsultasi: "/images/spesialisasi/icon-sandwich-panel-pu.png",
  survey: "/images/spesialisasi/icon-sandwich-panel-eps.png",
  produksi: "/images/spesialisasi/icon-cold-storage.png",
  instalasi: "/images/spesialisasi/icon-sistem-pendingin.png",
  selesai: "/images/spesialisasi/icon-door-dock-system.png",
} as const;

export const PROSES_KERJA_STEPS = [
  {
    slug: "konsultasi",
    title: "Sandwich\nPanel PU",
    Icon: IconSandwichPanelPU,
    defaultImage: PROSES_STEP_DEFAULT_IMAGES.konsultasi,
    /** Ilustrasi PU kustom di hero; langkah lain tetap SVG. */
    heroIconImage: "/images/spesialisasi/icon-sandwich-panel-pu.png",
    heroGlyphClass: `text-sky-300 ${HERO_GLYPH_SHADOW} drop-shadow-[0_0_12px_rgba(56,189,248,0.42)]`,
  },
  {
    slug: "survey",
    title: "Sandwich\nPanel EPS",
    Icon: IconSandwichPanelEPS,
    defaultImage: PROSES_STEP_DEFAULT_IMAGES.survey,
    heroIconImage: "/images/spesialisasi/icon-sandwich-panel-eps.png",
    heroGlyphClass: `text-amber-300 ${HERO_GLYPH_SHADOW} drop-shadow-[0_0_12px_rgba(251,191,36,0.38)]`,
  },
  {
    slug: "produksi",
    title: "Cold\nStorage",
    Icon: IconColdStorage,
    defaultImage: PROSES_STEP_DEFAULT_IMAGES.produksi,
    heroIconImage: "/images/spesialisasi/icon-cold-storage.png",
    heroGlyphClass: `text-cyan-300 ${HERO_GLYPH_SHADOW} drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]`,
  },
  {
    slug: "instalasi",
    title: "Sistem\nPendingin",
    Icon: IconRefrigerationSystem,
    defaultImage: PROSES_STEP_DEFAULT_IMAGES.instalasi,
    heroIconImage: "/images/spesialisasi/icon-sistem-pendingin.png",
    heroGlyphClass: `text-emerald-300 ${HERO_GLYPH_SHADOW} drop-shadow-[0_0_12px_rgba(52,211,153,0.38)]`,
  },
  {
    slug: "selesai",
    title: "Door &\nDock System",
    Icon: IconDoorDock,
    defaultImage: PROSES_STEP_DEFAULT_IMAGES.selesai,
    heroIconImage: "/images/spesialisasi/icon-door-dock-system.png",
    heroGlyphClass: `text-violet-300 ${HERO_GLYPH_SHADOW} drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]`,
  },
] as const;

export type ProsesKerjaStep = (typeof PROSES_KERJA_STEPS)[number];
export type ProsesKerjaSlug = ProsesKerjaStep["slug"];
