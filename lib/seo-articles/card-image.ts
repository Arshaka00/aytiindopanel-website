/**
 * Gambar kartu indeks / hero artikel: path lokal `/images/...` atau URL `https://`.
 * Jika `heroImage` kosong, dipilih fallback dari aset layanan situs agar kartu tetap punya visual.
 */
const FALLBACK_CARD_IMAGES = [
  "/images/layanan/instalasi-sistem-pendingin/1.jpg",
  "/images/layanan/instalasi-panel-cold-room/1.jpg",
  "/images/layanan/testing-commissioning/1.jpg",
  "/images/layanan/produksi-panel-pu-eps/1.jpg",
  "/images/layanan/maintenance-after-sales/1.jpg",
  "/images/layanan/konsultasi-desain-sistem/1.jpg",
] as const;

function slugHash(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 33) ^ slug.charCodeAt(i);
  }
  return Math.abs(h);
}

export function resolveArtikelCardImageSrc(heroImage: string, slug: string): string {
  const trimmed = heroImage.trim();
  if (trimmed) return trimmed;
  const idx = slugHash(slug) % FALLBACK_CARD_IMAGES.length;
  return FALLBACK_CARD_IMAGES[idx]!;
}

export function isRemoteOrBlobImageSrc(src: string): boolean {
  return /^(https?:|blob:)/i.test(src.trim());
}
