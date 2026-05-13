/** Hero background slider — letakkan file di /public/images/gambar_hero/ sebagai slide-1.jpg … slide-N.jpg */
export const HERO_SLIDE_COUNT = 2;
export const HERO_SLIDE_INTERVAL_MS = 5000;
export const HERO_IMAGE_FOLDER = "/images/gambar_hero";
/** Naikkan nilai ini setelah mengganti file gambar agar browser tidak memakai cache lama. */
export const HERO_ASSET_VERSION = "4";

export const heroSlideSources = Array.from({ length: HERO_SLIDE_COUNT }, (_, i) => ({
  src: `${HERO_IMAGE_FOLDER}/slide-${i + 1}.jpg?v=${HERO_ASSET_VERSION}`,
}));
