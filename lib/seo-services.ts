/** Layanan inti dengan canonical URL di root situs (bukan hanya /artikel/layanan). */
export type SeoRootServiceDef = {
  /** Segmen URL publik, mis. `/cold-room`. */
  urlSlug: string;
  /** Slug halaman layanan CMS (`data/layanan-pages`, `lib/service-pages`). */
  layananSlug: string;
  navLabel: string;
};

export const SEO_ROOT_SERVICES: readonly SeoRootServiceDef[] = [
  { urlSlug: "cold-storage", layananSlug: "cold-storage", navLabel: "Cold Storage" },
  { urlSlug: "cold-room", layananSlug: "cold-room-door", navLabel: "Cold Room" },
  { urlSlug: "blast-freezer", layananSlug: "blast-freezer", navLabel: "Blast Freezer" },
  { urlSlug: "sandwich-panel-pu", layananSlug: "sandwich-panel-pu", navLabel: "Sandwich Panel PU" },
] as const;

const ROOT_BY_URL = new Map(SEO_ROOT_SERVICES.map((s) => [s.urlSlug, s]));
const ROOT_BY_LAYANAN = new Map(SEO_ROOT_SERVICES.map((s) => [s.layananSlug, s]));

export const SEO_ROOT_URL_SLUGS = SEO_ROOT_SERVICES.map((s) => s.urlSlug);
export const SEO_ROOT_LAYANAN_SLUGS = SEO_ROOT_SERVICES.map((s) => s.layananSlug);

export function getSeoRootServiceByUrlSlug(urlSlug: string): SeoRootServiceDef | undefined {
  return ROOT_BY_URL.get(urlSlug);
}

export function getSeoRootServiceByLayananSlug(layananSlug: string): SeoRootServiceDef | undefined {
  return ROOT_BY_LAYANAN.get(layananSlug);
}

export function isSeoRootServiceUrlSlug(slug: string): boolean {
  return ROOT_BY_URL.has(slug);
}

export function isSeoRootServiceLayananSlug(slug: string): boolean {
  return ROOT_BY_LAYANAN.has(slug);
}
