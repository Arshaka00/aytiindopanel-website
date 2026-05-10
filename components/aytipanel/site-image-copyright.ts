import { SITE_IMAGE_UPLOAD_ISO } from "@/components/aytipanel/site-image-upload-dates.generated";

/** Pemilik hak cipta untuk aset di `/images/...` */
export const SITE_IMAGE_COPYRIGHT_HOLDER =
  "PT AYTI INDO PANEL";

/** Peringatan singkat (overlay tombol screenshot / modal). */
export const SITE_IMAGE_COPYRIGHT_NOTICE = "Gambar mengandung hak cipta.";

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Tanpa query string (mis. `?v=`) agar cocok kunci manifest hak cipta. */
function normalizeLocalImagePath(src: string): string {
  const q = src.indexOf("?");
  return q === -1 ? src : src.slice(0, q);
}

/** Raster menurut ekstensi di URL (termasuk sebelum query). */
export function isSiteRasterCopyrightPath(src: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(src);
}

/** Aset di `/images/...` (tanpa query). */
export function isSiteLocalImagePath(src: string): boolean {
  return normalizeLocalImagePath(src).startsWith("/images/");
}

/** Aset upload CMS di `/media/...` (tanpa query). */
export function isSiteMediaImagePath(src: string): boolean {
  return normalizeLocalImagePath(src).startsWith("/media/");
}

export function isSiteSvgPath(src: string): boolean {
  return /\.svg(\?|$)/i.test(normalizeLocalImagePath(src));
}

/** Boleh dibuka viewer klik: lokal `/images/`, raster menurut ekstensi, atau stok Unsplash katalog. */
export function shouldUseSiteImageViewer(src: string): boolean {
  if (isSiteLocalImagePath(src)) return true;
  if (isSiteMediaImagePath(src)) return true;
  if (isSiteRasterCopyrightPath(src)) return true;
  return /^https:\/\/images\.unsplash\.com\//i.test(src.trim());
}

/**
 * Baris hak cipta (bisa dipakai di keterangan di luar viewer): aset lokal `/images/` + tanggal dari mtime manifest.
 */
export function siteImageCopyrightCaption(imageSrc: string): string {
  const path = normalizeLocalImagePath(imageSrc);
  if (path.startsWith("/images/")) {
    const iso = SITE_IMAGE_UPLOAD_ISO[path];
    const d = iso ? new Date(iso) : new Date();
    const tanggal = tanggalFormatter.format(d);
    return `Hak cipta ${SITE_IMAGE_COPYRIGHT_HOLDER} (${tanggal})`;
  }
  return "Gambar ilustrasi; hak cipta mengikuti sumber aslinya.";
}

/**
 * Teks untuk overlay di tengah gambar (lightbox): **tanpa tanggal/tahun**.
 */
export function siteImageCopyrightCaptionOverlay(imageSrc: string): string {
  const path = normalizeLocalImagePath(imageSrc);
  if (path.startsWith("/images/")) {
    return `Hak cipta ${SITE_IMAGE_COPYRIGHT_HOLDER}`;
  }
  return "Gambar ilustrasi; hak cipta mengikuti sumber aslinya.";
}
