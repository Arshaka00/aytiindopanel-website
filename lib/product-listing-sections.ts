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

/**
 * Satu-satunya sumber kebenaran: slug produk → section beranda untuk Kembali.
 * Tiga grup featured (Utama / Solusi / Accessories) — masing-masing 3 produk.
 */
export const PRODUCT_HOME_RETURN_GROUPS = {
  "produk-utama": [
    "sandwich-panel-pu-camelock",
    "sandwich-panel-pu-full-knock-down",
    "sandwich-panel-eps",
  ],
  "produk-solusi": [
    "cold-storage-custom",
    "pembekuan-cepat-abf",
    "cold-storage-portable",
  ],
  accessories: [
    "pintu-panel",
    "loading-dock-system",
    "sistem-refrigerasi",
  ],
} as const satisfies Record<FeaturedProductListingSectionId, readonly string[]>;

/** Turunan dari `PRODUCT_HOME_RETURN_GROUPS` — jangan edit manual. */
export const PRODUCT_SLUG_PINNED_HOME_RETURN_SECTION: Readonly<
  Record<string, FeaturedProductListingSectionId>
> = Object.fromEntries(
  (
    Object.entries(PRODUCT_HOME_RETURN_GROUPS) as [
      FeaturedProductListingSectionId,
      readonly string[],
    ][]
  ).flatMap(([sectionId, slugs]) => slugs.map((slug) => [slug, sectionId])),
) as Record<string, FeaturedProductListingSectionId>;

export function getProductSlugsForHomeReturnSection(
  sectionId: FeaturedProductListingSectionId,
): readonly string[] {
  return PRODUCT_HOME_RETURN_GROUPS[sectionId];
}

export function parseProductDetailSlug(pathname: string): string | null {
  const match = pathname.match(/^\/produk\/([^/?#]+)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getPinnedHomeReturnSectionForProductSlug(
  slug: string,
): FeaturedProductListingSectionId | null {
  return PRODUCT_SLUG_PINNED_HOME_RETURN_SECTION[slug] ?? null;
}

/** Section beranda yang boleh dipakai return path produk (selain map slug). */
export const PRODUCT_LISTING_EXTRA_RETURN_SECTION_IDS = [
  "produk",
  "service-maintenance",
] as const;

export function isAllowedProductListingReturnSectionId(sectionId: string): boolean {
  const id = sectionId.replace(/^#/, "").trim().toLowerCase();
  return (
    (FEATURED_PRODUCT_LISTING_SECTIONS as readonly string[]).includes(id) ||
    (PRODUCT_LISTING_EXTRA_RETURN_SECTION_IDS as readonly string[]).includes(id)
  );
}

/** Tolak hash lama (layanan, kontak, hero, dll.) — ganti ke section aman. */
export function normalizeProductHomeReturnSectionId(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim();
  return isAllowedProductListingReturnSectionId(id) ? id : "produk";
}

/** Path `/#section` beranda untuk tombol Kembali — hanya section produk yang diizinkan. */
export function sanitizeProductHomeReturnHref(href: string): string | null {
  if (!isProductHomeReturnPath(href)) return null;
  try {
    const u = new URL(href, "http://local");
    const sectionId = normalizeProductHomeReturnSectionId(
      decodeURIComponent(u.hash.replace(/^#/, "")),
    );
    return buildHomeSectionReturnPath(sectionId, u.search);
  } catch {
    return null;
  }
}

/** Fallback `/#…` untuk detail produk (map slug atau `produk`). */
export function buildProductDetailBackFallbackHref(productSlug?: string | null): string {
  const pinned = productSlug ? getPinnedHomeReturnSectionForProductSlug(productSlug) : null;
  return buildHomeSectionReturnPath(pinned ?? "produk");
}

/** Hero beranda — target kembali dari gallery lewat navigasi header/menu. */
export const HERO_HOME_SECTION_ID = "beranda";

/** Fallback `/#beranda` untuk halaman gallery project (tab baru, bookmark). */
export function buildGalleryProjectBackFallbackHref(): string {
  return buildHomeSectionReturnPath(HERO_HOME_SECTION_ID);
}

/** Section portofolio di beranda — target kembali dari gallery lewat CTA Portfolio. */
export const PORTFOLIO_HOME_SECTION_ID = "proyek";

export function isHeroReturnHash(hash: string): boolean {
  const raw = hash.replace(/^#/, "").trim().toLowerCase();
  return raw.length === 0 || raw === "beranda" || raw === "home";
}

export function isHeroReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/" && u.pathname !== "") return false;
    return isHeroReturnHash(u.hash);
  } catch {
    return false;
  }
}

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

/** Path `/#beranda` atau `/#proyek` — kembali dari gallery ke beranda. */
export function isGalleryHomeReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/" && u.pathname !== "") return false;
    return isHeroReturnPath(href) || isPortfolioReturnPath(href);
  } catch {
    return false;
  }
}

/** Path gallery (`/gallery-project`, subpath) atau section beranda gallery. */
export function isGalleryInSiteReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (isGalleryProjectPathname(u.pathname)) return true;
  } catch {
    /* fallback */
  }
  return isGalleryHomeReturnPath(href);
}

/**
 * Section beranda untuk kembali dari detail produk — semua hash listing kecuali milik gallery.
 * Selaras dengan `prepareNavigateFromListingToProductDetail` + `normalizeProductListingReturnSectionId`.
 */
export function isProductHomeReturnPath(href: string): boolean {
  return isProductListingReturnPath(href) && !isGalleryHomeReturnPath(href);
}

/** Path kembali valid untuk detail produk (beranda section atau halaman `/produk/…`). */
export function isProductInSiteReturnPath(href: string): boolean {
  try {
    const u = new URL(href, "http://local");
    if (isProductDetailPathname(u.pathname)) return true;
  } catch {
    /* fallback */
  }
  return isProductHomeReturnPath(href);
}

/** Section id untuk storage produk — portofolio/hero tidak disimpan di key produk. */
export function normalizeProductListingReturnSectionId(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim().toLowerCase();
  if (id === PORTFOLIO_HOME_SECTION_ID || id === HERO_HOME_SECTION_ID) {
    return "produk";
  }
  return sectionId.replace(/^#/, "").trim();
}
