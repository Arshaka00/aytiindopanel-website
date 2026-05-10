import { generateWhatsAppLink, generateWhatsAppMessage } from "@/utils/whatsapp";

/** Nomor WhatsApp resmi (canonical): https://wa.me/6285121104411 */
export const WHATSAPP_URL = generateWhatsAppLink(
  generateWhatsAppMessage("solusi cold storage dan refrigerasi")
);

/** Funnel & pra-teks landing cold storage (/cold-storage). */
export {
  COLD_STORAGE_LEAD_SOURCE,
  WHATSAPP_COLD_STORAGE_PREFILL_MESSAGE,
  WHATSAPP_COLD_STORAGE_URL,
} from "./constants/cold-storage-whatsapp";

/** WhatsApp tanpa prefilled text (mis. kartu kontak). */
export const WHATSAPP_ME_URL = "https://wa.me/6285121104411";

export {
  SITE_PUBLIC_ORIGIN,
  SITE_PUBLIC_HOSTNAME,
  SITE_APEX_HOSTNAME,
} from "@/lib/site-public-host";

export const CONTACT_EMAIL = "marketing@aytipanel.com";

export const CONTACT_PHONE = "021-331-4441";

/** Untuk `tel:` — tanpa spasi/tanda hubung. */
export const CONTACT_PHONE_TEL = "+62213314441";

export const CONTACT_WHATSAPP_DISPLAY = "085121104411";

/** Baris alamat kantor (kartu kontak). */
export const CONTACT_ADDRESS_LINES = [
  "Jl. Diklat Pemda No.88,",
  "Bojong Nangka, Kec. Legok,",
  "Kabupaten Tangerang, Banten 15810",
] as const;

/** Satu baris untuk peta / navigasi (sinkron dengan `CONTACT_ADDRESS_LINES`). */
export const CONTACT_ADDRESS_ONE_LINE =
  "Jl. Diklat Pemda No.88, Bojong Nangka, Kec. Legok, Kabupaten Tangerang, Banten 15810, Indonesia" as const;

/** Tautan Google Maps ke lokasi kantor. */
export const CONTACT_GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CONTACT_ADDRESS_ONE_LINE,
)}`;

/**
 * Embed peta tanpa API key (query). Untuk produksi penuh, ganti dengan kode embed resmi dari
 * Google Maps (Share → Embed a map) agar pin dan zoom pasti akurat.
 */
export const CONTACT_MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(
  CONTACT_ADDRESS_ONE_LINE,
)}&hl=id&z=16&output=embed`;

/** Sesuaikan dengan alamat resmi perusahaan. */
export const COMPANY_LEGAL_NAME = "PT AYTI INDO PANEL";

/** Ganti dengan URL profil resmi perusahaan. */
export const SOCIAL_INSTAGRAM_URL = "https://www.instagram.com/aytipanel/";
export const SOCIAL_FACEBOOK_URL = "https://www.facebook.com/aytipanel";
export const SOCIAL_TIKTOK_URL = "https://www.tiktok.com/@aytipanel";
export const SOCIAL_YOUTUBE_URL = "https://www.youtube.com/@aytipanel";
export const SOCIAL_X_URL = "https://x.com/aytipanel";

/**
 * Berkas katalog produk (PDF). Taruh di `public/katalog-aytipanel.pdf` atau ganti ke URL absolut (CDN / penyimpanan cloud).
 */
export const CATALOG_DOWNLOAD_URL = "/katalog-aytipanel.pdf";

