/**
 * Konten kartu layanan (single source of truth).
 */

import type { CmsImageTransform } from "@/lib/cms-image-transform";

export {
  SITE_IMAGE_COPYRIGHT_HOLDER as LAYANAN_IMAGE_COPYRIGHT_HOLDER,
  SITE_IMAGE_COPYRIGHT_NOTICE as LAYANAN_IMAGE_COPYRIGHT_NOTICE,
} from "@/components/aytipanel/site-image-copyright";

export type LayananPhotoSrc = {
  readonly src: string;
  readonly alt: string;
} & Partial<CmsImageTransform>;

export type LayananCardPhotos = {
  readonly photos: readonly LayananPhotoSrc[];
};

export type LayananUtamaCard = {
  readonly id: string;
  /** Folder di `public/images/layanan/{folderSlug}/1.jpg` … `2.jpg` */
  readonly folderSlug: string;
  readonly title: string;
  /** Satu atau lebih paragraf deskripsi (urutan tampilan) */
  readonly body: readonly string[];
};

const PHOTO_INDICES = [1, 2] as const;

export function layananPhotosFromFolder(
  folderSlug: string,
  serviceTitle: string,
): LayananCardPhotos {
  const photos: LayananPhotoSrc[] = PHOTO_INDICES.map((n) => ({
    src: `/images/layanan/${folderSlug}/${n}.jpg`,
    alt: `${serviceTitle} — dokumentasi ${n}`,
  }));
  return { photos };
}

/** Enam kartu layanan terintegrasi — urutan = urutan tampilan grid */
export const LAYANAN_UTAMA_CARDS = [
  {
    id: "konsultasi-desain-sistem",
    folderSlug: "konsultasi-desain-sistem",
    title: "Konsultasi & Desain",
    body: [
      "Kami menyediakan layanan perencanaan dan desain yang komprehensif sesuai kebutuhan operasional Anda.",
      "Tim engineering kami akan melakukan analisis teknis, perhitungan kapasitas pendinginan, serta perancangan layout cold storage yang efisien, aman, dan sesuai standar industri.",
    ],
  },
  {
    id: "produksi-panel-pu-eps",
    folderSlug: "produksi-panel-pu-eps",
    title: "Produksi Sandwich Panel",
    body: [
      "Kami memproduksi sandwich panel PU dan EPS berkualitas tinggi dengan material pilihan yang memiliki daya isolasi termal optimal.",
      "Proses produksi dilakukan dengan kontrol ketat untuk memastikan kekuatan struktur, ketahanan, dan efisiensi energi dalam aplikasi cold storage.",
    ],
  },
  {
    id: "instalasi-sistem-pendingin",
    folderSlug: "instalasi-sistem-pendingin",
    title: "Produksi Pintu & Loading System",
    body: [
      "Kami menyediakan berbagai jenis pintu cold storage dan sistem loading (loading dock) yang dirancang untuk menjaga stabilitas suhu serta meningkatkan efisiensi operasional.",
      "Produk kami mengutamakan durabilitas, keamanan, dan kemudahan penggunaan.",
    ],
  },
  {
    id: "instalasi-panel-cold-room",
    folderSlug: "instalasi-panel-cold-room",
    title: "Instalasi Sandwich Panel",
    body: [
      "Tim profesional kami menangani proses instalasi sandwich panel secara presisi, termasuk pemasangan struktur pendukung, sealing, dan finishing.",
      "Kami memastikan setiap instalasi memenuhi standar kualitas, kedap udara, serta efisiensi termal yang maksimal.",
    ],
  },
  {
    id: "testing-commissioning",
    folderSlug: "testing-commissioning",
    title: "Instalasi Sistem Pendingin",
    body: [
      "Kami mengerjakan instalasi sistem pendingin secara menyeluruh, mulai dari pemasangan unit, piping, hingga sistem kontrol.",
      "Proses dilanjutkan dengan pengujian dan commissioning untuk memastikan sistem bekerja optimal, stabil, dan sesuai spesifikasi yang direncanakan.",
    ],
  },
  {
    id: "maintenance-after-sales",
    folderSlug: "maintenance-after-sales",
    title: "Layanan Purna Jual & After Sales",
    body: [
      "Kami berkomitmen memberikan dukungan berkelanjutan melalui layanan purna jual, termasuk perawatan rutin, perbaikan, serta penyediaan suku cadang.",
      "Tim kami siap memastikan sistem Anda tetap berjalan optimal dan memiliki umur operasional yang panjang.",
    ],
  },
] as const satisfies readonly LayananUtamaCard[];
