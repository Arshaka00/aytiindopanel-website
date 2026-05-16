/** Tiga blok featured di beranda — `id` section = hash kembali dari detail produk. */
export const FEATURED_PRODUCT_LISTING_SECTIONS = [
  "produk-utama",
  "produk-solusi",
  "accessories",
] as const;

export type FeaturedProductListingSectionId =
  (typeof FEATURED_PRODUCT_LISTING_SECTIONS)[number];

export function normalizeHomeSectionHash(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim();
  return id.length > 0 ? `#${id}` : "#produk";
}

/** Path beranda + hash section, mis. `/#produk-utama`. */
export function buildHomeSectionReturnPath(
  sectionId: string,
  search = "",
): string {
  return `/${search}${normalizeHomeSectionHash(sectionId)}`;
}

export function isProductDetailPathname(pathname: string): boolean {
  return /^\/produk\/[^/]+/.test(pathname);
}

/** Section portofolio di beranda — target tombol “Kembali ke Portofolio”. */
export const PORTFOLIO_HOME_SECTION_ID = "proyek";

export function isGalleryProjectPathname(pathname: string): boolean {
  return (
    pathname === "/gallery-project" || pathname.startsWith("/gallery-project/")
  );
}

export function isPortfolioReturnHash(hash: string): boolean {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return false;
  let id: string;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  return id === PORTFOLIO_HOME_SECTION_ID;
}

export function isPortfolioReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/" && u.pathname !== "") return false;
    return isPortfolioReturnHash(u.hash);
  } catch {
    return false;
  }
}

export function isFeaturedProductListingSectionHash(hash: string): boolean {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return false;
  let id: string;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  return (FEATURED_PRODUCT_LISTING_SECTIONS as readonly string[]).includes(id);
}

export function isProductListingReturnHash(hash: string): boolean {
  const hn = hash.trim();
  const normalized = hn.startsWith("#") ? hn : `#${hn}`;
  return isProductListingReturnPath(`/${normalized}`);
}

/** Path `/#section` dari `prepareNavigateFromListingToProductDetail` (bukan hero). */
export function isProductListingReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/" && u.pathname !== "") return false;
    if (u.hash.length <= 1) return false;
    const id = decodeURIComponent(u.hash.replace(/^#/, "")).trim().toLowerCase();
    return id.length > 0 && id !== "beranda" && id !== "home";
  } catch {
    return false;
  }
}
