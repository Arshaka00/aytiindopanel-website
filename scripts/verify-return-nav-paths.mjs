/**
 * Verifikasi klasifikasi path kembali gallery vs produk (tanpa browser).
 * Jalankan: node scripts/verify-return-nav-paths.mjs
 */

const PORTFOLIO_HOME_SECTION_ID = "proyek";
const HERO_HOME_SECTION_ID = "beranda";

function isHeroReturnHash(hash) {
  const raw = hash.replace(/^#/, "").trim().toLowerCase();
  return raw.length === 0 || raw === "beranda" || raw === "home";
}

function isPortfolioReturnHash(hash) {
  const raw = hash.replace(/^#/, "").trim();
  let id;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  return id === PORTFOLIO_HOME_SECTION_ID;
}

function isGalleryProjectPathname(pathname) {
  return pathname === "/gallery-project" || pathname.startsWith("/gallery-project/");
}

function isProductDetailPathname(pathname) {
  return /^\/produk\/[^/]+/.test(pathname);
}

function isProductListingReturnPath(href) {
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

function isGalleryHomeReturnPath(href) {
  try {
    const u = new URL(href, "http://local");
    if (u.pathname !== "/" && u.pathname !== "") return false;
    return isHeroReturnHash(u.hash) || isPortfolioReturnHash(u.hash);
  } catch {
    return false;
  }
}

function isGalleryInSiteReturnPath(href) {
  try {
    const u = new URL(href, "http://local");
    if (isGalleryProjectPathname(u.pathname)) return true;
  } catch {
    /* ignore */
  }
  return isGalleryHomeReturnPath(href);
}

function isProductHomeReturnPath(href) {
  return isProductListingReturnPath(href) && !isGalleryHomeReturnPath(href);
}

function isProductInSiteReturnPath(href) {
  try {
    const u = new URL(href, "http://local");
    if (isProductDetailPathname(u.pathname)) return true;
  } catch {
    /* ignore */
  }
  return isProductHomeReturnPath(href);
}

function normalizeProductListingReturnSectionId(sectionId) {
  const id = sectionId.replace(/^#/, "").trim().toLowerCase();
  if (id === PORTFOLIO_HOME_SECTION_ID || id === HERO_HOME_SECTION_ID) return "produk";
  return sectionId.replace(/^#/, "").trim();
}

/** Sinkron dengan `PRODUCT_HOME_RETURN_GROUPS` di lib/product-listing-sections.ts */
const PRODUCT_HOME_RETURN_GROUPS = {
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
};

const PRODUCT_SLUG_PINNED_HOME_RETURN_SECTION = Object.fromEntries(
  Object.entries(PRODUCT_HOME_RETURN_GROUPS).flatMap(([section, slugs]) =>
    slugs.map((slug) => [slug, section]),
  ),
);

function getPinnedHomeReturnSectionForProductSlug(slug) {
  return PRODUCT_SLUG_PINNED_HOME_RETURN_SECTION[slug] ?? null;
}

const FEATURED_PRODUCT_LISTING_SECTIONS = [
  "produk-utama",
  "produk-solusi",
  "accessories",
];
const PRODUCT_LISTING_EXTRA_RETURN_SECTION_IDS = ["produk", "service-maintenance"];

function isAllowedProductListingReturnSectionId(sectionId) {
  const id = sectionId.replace(/^#/, "").trim().toLowerCase();
  return (
    FEATURED_PRODUCT_LISTING_SECTIONS.includes(id) ||
    PRODUCT_LISTING_EXTRA_RETURN_SECTION_IDS.includes(id)
  );
}

function normalizeProductHomeReturnSectionId(sectionId) {
  const id = sectionId.replace(/^#/, "").trim();
  return isAllowedProductListingReturnSectionId(id) ? id : "produk";
}

function buildHomeSectionReturnPath(sectionId, search = "") {
  const id = sectionId.replace(/^#/, "").trim();
  return `/${search}#${id.length > 0 ? id : "produk"}`;
}

function sanitizeProductHomeReturnHref(href) {
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

function galleryAccepts(stored) {
  return isGalleryInSiteReturnPath(stored) && !isProductHomeReturnPath(stored);
}

function productAccepts(stored) {
  return isProductInSiteReturnPath(stored) && !isGalleryInSiteReturnPath(stored);
}

const cases = [
  { href: "/#beranda", gallery: true, product: false },
  { href: "/#proyek", gallery: true, product: false },
  { href: "/#produk-utama", gallery: false, product: true },
  { href: "/#produk", gallery: false, product: true },
  { href: "/#service-maintenance", gallery: false, product: true },
  { href: "/#layanan", gallery: false, product: true },
  { href: "/gallery-project", gallery: true, product: false },
  { href: "/gallery-project/edit/x", gallery: true, product: false },
  { href: "/produk/slug", gallery: false, product: true },
];

let failed = 0;
for (const c of cases) {
  const g = galleryAccepts(c.href);
  const p = productAccepts(c.href);
  if (g !== c.gallery || p !== c.product) {
    failed += 1;
    console.error("FAIL", c.href, { g, p, expected: c });
  }
  if (g && p) {
    failed += 1;
    console.error("BENTROK both accept", c.href);
  }
}

const normCases = [
  ["proyek", "produk"],
  ["beranda", "produk"],
  ["produk-utama", "produk-utama"],
  ["service-maintenance", "service-maintenance"],
];
for (const [inId, outId] of normCases) {
  const n = normalizeProductListingReturnSectionId(inId);
  if (n !== outId) {
    failed += 1;
    console.error("FAIL normalize", inId, "->", n, "expected", outId);
  }
}

const pinnedSlugCases = [
  ["sandwich-panel-pu-camelock", "produk-utama"],
  ["sandwich-panel-pu-full-knock-down", "produk-utama"],
  ["sandwich-panel-eps", "produk-utama"],
  ["cold-storage-custom", "produk-solusi"],
  ["pembekuan-cepat-abf", "produk-solusi"],
  ["cold-storage-portable", "produk-solusi"],
  ["pintu-panel", "accessories"],
  ["loading-dock-system", "accessories"],
  ["sistem-refrigerasi", "accessories"],
  ["maintenance-berkala", null],
];
for (const [slug, expected] of pinnedSlugCases) {
  const pinned = getPinnedHomeReturnSectionForProductSlug(slug);
  if (pinned !== expected) {
    failed += 1;
    console.error("FAIL pinned slug", slug, pinned, "expected", expected);
  }
}

const sanitizeCases = [
  ["/#layanan", "/#produk"],
  ["/#kontak", "/#produk"],
  ["/#produk-utama", "/#produk-utama"],
  ["/#accessories", "/#accessories"],
];
for (const [input, expected] of sanitizeCases) {
  const out = sanitizeProductHomeReturnHref(input);
  if (out !== expected) {
    failed += 1;
    console.error("FAIL sanitize", input, "->", out, "expected", expected);
  }
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log(
  "OK: gallery vs produk konsisten —",
  cases.length,
  "path cases,",
  normCases.length,
  "normalize cases,",
  pinnedSlugCases.length,
  "pinned slug cases,",
  sanitizeCases.length,
  "sanitize cases",
);
