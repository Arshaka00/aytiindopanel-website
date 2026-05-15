/**
 * Panduan istilah untuk konsistensi penyebutan antar CMS, landing SEO, dan metadata.
 * Hanya dokumentasi/canonical string — pakai secara eksplisit di copy baru & util normalisasi.
 *
 * Slug/route URL: hyphen (contoh cold-storage).
 * Istilah dalam bahasa Indonesia/teks narasi: spasi untuk frasa dua kata (cold storage, blast freezer).
 */

export const COPY_BRAND_LINE = "Solusi Sistem Pendingin Terintegrasi";

/** Frasa canon untuk copy publik (bahasa Indo + campuran industri). */
export const COPY_DISPLAY_TERMS = {
  coldStorage: "cold storage",
  sandwichPanelPu: "sandwich panel PU",
  sandwichPanelPhrase: "sandwich panel",
  blastFreezer: "blast freezer",
  coldRoom: "cold room",
  freezerRoom: "freezer room",
  polyurethane: "polyurethane",
  /** Singkatan industri; tetap besar semua dalam judul META jika dipakai. */
  polyurethaneAbbrev: "PU",
} as const;
