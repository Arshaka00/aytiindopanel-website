import { plainTextFromRichValue } from "@/lib/cms-rich-text";
import { GALLERY_PROJECTS } from "@/components/aytipanel/gallery-project-data";
import { PROSES_KERJA_STEPS } from "@/components/aytipanel/proses-kerja-data";
import { PRODUCTS } from "@/components/aytipanel/products-catalog";
import { DEFAULT_HOME_LAYOUT } from "@/lib/home-layout-defaults";
import type { SeoArticle } from "@/lib/seo-articles/types";
import type { SiteContent } from "@/lib/site-content-model";

/** Item hasil pencarian cepat di header — judul, URL, teks untuk filter kata kunci. */
export type HeaderSiteSearchTarget = {
  id: string;
  title: string;
  href: string;
  /** Huruf kecil: judul + sinonim untuk pencarian substring */
  haystack: string;
};

const NAV_SUPPRESSED_IDS = new Set<string>(["nav-keunggulan"]);

/** Tidak muncul sebagai baris hasil pencarian (Beranda → halaman Tentang kami). */
const SEARCH_RESULTS_EXCLUDED_HREFS = new Set([
  "/#beranda",
  "/#tentang",
  "/tentang",
]);

/** Judul fallback jika section tidak punya item nav (CMS). */
const SECTION_FALLBACK_TITLE: Record<string, string> = {
  beranda: "Beranda",
  tentang: "Tentang kami",
  layanan: "Layanan",
  produk: "Produk",
  "service-maintenance": "Service & maintenance",
  proyek: "Proyek",
  "customers-partners": "Customer & partner",
  keunggulan: "Keunggulan",
  faq: "FAQ",
  kontak: "Kontak",
};

const SECTION_KEYWORDS: Partial<Record<string, string>> = {
  beranda:
    "beranda home utama awal hero pembuka landing cold storage panel refrigerasi industri",
  tentang: "tentang profil perusahaan visi misi sejarah siapa kami about company",
  layanan: "layanan jasa service instalasi pemasangan maintenance sandwich panel ruang dingin",
  produk: "produk product katalog catalog sandwich panel pir pu cold room unit pendingin",
  "service-maintenance": "service maintenance perawatan servis purna jual garansi dukungan teknis",
  proyek: "proyek project portfolio portofolio referensi pekerjaan dokumentasi studi kasus",
  "customers-partners":
    "customer partner mitra pelanggan klien logo industri trust merek brand supplier",
  keunggulan: "keunggulan kelebihan benefit nilai plus mengapa memilih kualitas",
  faq: "faq pertanyaan tanya jawab bantuan informasi umum",
  kontak: "kontak contact alamat whatsapp telepon email hubungi lokasi kantor maps",
};

function normalizeHaystack(parts: string[]): string {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function mergeHaystack(target: HeaderSiteSearchTarget, extra: string): void {
  target.haystack = normalizeHaystack([target.haystack, extra]);
}

/** Ringkas Markdown untuk haystack pencarian (tanpa render HTML). */
function stripMarkdownForSearchHaystack(md: string, maxChars = 4000): string {
  const slice = md.slice(0, maxChars);
  return slice
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/#{1,6}\s+/g, " ")
    .replace(/[*_`>|\\-]+/g, " ")
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tulisan publik /artikel + indeks — pencarian header mengindeks judul, isi, FAQ, tag. */
function appendSeoArticlesSearch(byHref: Map<string, HeaderSiteSearchTarget>, articles: readonly SeoArticle[]): void {
  if (!articles.length) return;

  const indexHay = normalizeHaystack(
    articles.flatMap((a) => [a.title, a.primaryKeyword, ...a.tags, a.slug.replace(/-/g, " ")]),
  );
  const indexEntry = byHref.get("/artikel");
  if (indexEntry) {
    mergeHaystack(
      indexEntry,
      normalizeHaystack([
        indexHay,
        "indeks tulisan cold storage cold room blast freezer sandwich panel refrigerasi lapangan artikel blog",
      ]),
    );
  } else {
    byHref.set("/artikel", {
      id: "page-artikel-index",
      title: "Tulisan",
      href: "/artikel",
      haystack: normalizeHaystack([
        "indeks tulisan refrigerasi cold storage artikel blog",
        indexHay,
      ]),
    });
  }

  for (const a of articles) {
    const href = `/artikel/${a.slug}`;
    const faqJoined = a.faq.flatMap((f) => [f.question, f.answerMarkdown]).join("\n");
    byHref.set(href, {
      id: `seo-article-${a.slug}`,
      title: a.title,
      href,
      haystack: normalizeHaystack([
        a.title,
        a.deck,
        a.primaryKeyword,
        ...a.tags,
        a.metaDescription,
        a.metaTitle,
        a.authorName,
        stripMarkdownForSearchHaystack(a.bodyMarkdown),
        stripMarkdownForSearchHaystack(faqJoined, 2500),
        a.slug.replace(/-/g, " "),
        "tulisan cold room cold storage refrigerasi industri",
      ]),
    });
  }
}

function hrefToSectionId(href: string): string | null {
  const h = href.trim();
  if (h === "/#beranda" || h === "#beranda") return "beranda";
  const m = h.match(/#([\w-]+)\s*$/);
  return m ? m[1] : null;
}

/** Nomor, WA, email, alamat — untuk mencocokkan teks dari CMS & pengaturan situs. */
function buildContactSearchBlob(site: SiteContent): string {
  const ss = site.siteSettings;
  const k = site.kontak;
  const waLines = ss.whatsappNumbers.map((w) => `${w.label} ${w.number}`).join(" ");
  const emailLines = ss.emails.map((e) => `${e.label} ${e.email}`).join(" ");
  const digitsJoined = [
    ...ss.whatsappNumbers.map((w) => w.number),
    k.phone,
    k.phoneTel,
    k.whatsappDisplay,
  ]
    .join("")
    .replace(/\D/g, "");

  return normalizeHaystack([
    ss.siteName,
    waLines,
    emailLines,
    k.phone,
    k.phoneTel,
    k.whatsappDisplay,
    k.email,
    ...k.addressLines,
    ss.companyAddress,
    ss.mapsUrl,
    ss.officeHours,
    k.intro,
    k.detailHeading,
    digitsJoined,
    "whatsapp wa hp telepon nomor telpon email mail alamat address maps lokasi kantor hubungi",
  ]);
}

function buildProdukHubHaystack(site: SiteContent): string {
  const p = site.produk;
  const parts: string[] = [
    p.sectionLabel,
    p.heading,
    p.lead,
    p.closingBlurb,
    "halaman produk katalog catalog semua produk",
  ];
  for (const cat of p.categories) {
    parts.push(cat.eyebrow, cat.title, cat.description);
    for (const card of cat.cards) {
      parts.push(card.title, card.subtitle, card.specs, ...(card.highlights ?? []));
      if (card.slug) parts.push(card.slug.replace(/-/g, " "));
    }
  }
  return normalizeHaystack(parts);
}

function enrichFromSiteContent(byHref: Map<string, HeaderSiteSearchTarget>, site: SiteContent): void {
  const contactBlob = buildContactSearchBlob(site);
  const kontakSection = byHref.get("/#kontak");
  if (kontakSection) mergeHaystack(kontakSection, contactBlob);

  const beranda = byHref.get("/#beranda");
  if (beranda) {
    const h = site.hero;
    const intro = h.intro;
    mergeHaystack(
      beranda,
      normalizeHaystack([
        site.siteSettings.siteName,
        h.brandLabel,
        plainTextFromRichValue(h.headingLine1),
        plainTextFromRichValue(h.headingMiddle),
        plainTextFromRichValue(h.headingLine2),
        intro.before1,
        intro.bold1,
        intro.middle,
        intro.bold2,
        intro.after2,
        intro.bold3,
        intro.after3,
        h.prosesBadge,
        h.ctaWhatsApp.label,
        h.ctaWhatsApp.message,
        h.ctaSecondary.label,
      ]),
    );
  }

  const faqSection = byHref.get("/#faq");
  if (faqSection && site.faq?.items?.length) {
    mergeHaystack(
      faqSection,
      normalizeHaystack(site.faq.items.flatMap((i) => [i.q, i.a])),
    );
  }

  const produkSection = byHref.get("/#produk");
  if (produkSection) mergeHaystack(produkSection, buildProdukHubHaystack(site));

  const layananSection = byHref.get("/#layanan");
  if (layananSection) {
    const l = site.layanan;
    mergeHaystack(
      layananSection,
      normalizeHaystack([
        l.sectionLabel,
        l.heading,
        l.lead,
        l.quote,
        ...l.cards.flatMap((c) => [c.title, ...c.body, c.folderSlug.replace(/-/g, " ")]),
      ]),
    );
  }

  const proyekSection = byHref.get("/#proyek");
  if (proyekSection) {
    const po = site.portfolio;
    mergeHaystack(
      proyekSection,
      normalizeHaystack([
        po.sectionLabel,
        po.heading,
        po.lead,
        po.galleryHint,
        ...po.projects.flatMap((p) => [p.name, p.location, p.workType, p.coverImageAlt ?? ""]),
      ]),
    );
  }

  const cpSection = byHref.get("/#customers-partners");
  if (cpSection) {
    const cp = site.customersPartners;
    mergeHaystack(
      cpSection,
      normalizeHaystack([
        cp.heading,
        cp.partnerHeading,
        ...cp.industries.map((i) => i.label),
        ...cp.partners.map((p) => p.name),
      ]),
    );
  }

  const keunggulanSection = byHref.get("/#keunggulan");
  if (keunggulanSection) {
    const k = site.keunggulan;
    mergeHaystack(
      keunggulanSection,
      normalizeHaystack([
        k.sectionLabel,
        k.heading,
        k.lead,
        k.statsHeading,
        ...k.cards.flatMap((c) => [c.title, c.body]),
        ...k.stats.flatMap((s) => [s.value, s.label, ...(s.labelMobileLines ?? [])]),
      ]),
    );
  }

  const svcSection = byHref.get("/#service-maintenance");
  if (svcSection) {
    const sm = site.serviceMaintenance;
    mergeHaystack(
      svcSection,
      normalizeHaystack([
        sm.title,
        sm.description,
        ...sm.cards.flatMap((c) => [c.title, c.subtitle, c.specs, ...(c.highlights ?? [])]),
        "service maintenance perawatan",
      ]),
    );
  }

  const produkPageHay = buildProdukHubHaystack(site);
  if (!byHref.has("/produk")) {
    byHref.set("/produk", {
      id: "page-produk-index",
      title: site.produk.heading.trim() || "Produk",
      href: "/produk",
      haystack: normalizeHaystack([produkPageHay, "/produk halaman lengkap"]),
    });
  } else {
    mergeHaystack(byHref.get("/produk")!, produkPageHay);
  }

  const t = site.tentang;
  if (!byHref.has("/tentang")) {
    byHref.set("/tentang", {
      id: "page-tentang",
      title: t.sectionLabel.trim() || "Tentang kami",
      href: "/tentang",
      haystack: normalizeHaystack([
        t.sectionLabel,
        t.heading,
        t.lead,
        t.body,
        t.valuesHeading,
        ...t.values,
        "halaman tentang profil perusahaan",
      ]),
    });
  }

  if (!byHref.has("/cold-storage")) {
    byHref.set("/cold-storage", {
      id: "page-cold-storage",
      title: "Cold storage",
      href: "/cold-storage",
      haystack: normalizeHaystack([
        "cold storage cold room portable plug ruang dingin freezer chiller sandwich panel mobile plug play",
      ]),
    });
  }

  for (const item of PRODUCTS) {
    const href = `/produk/${item.slug}`;
    if (byHref.has(href)) continue;
    byHref.set(href, {
      id: `product-${item.slug}`,
      title: item.title,
      href,
      haystack: normalizeHaystack([
        item.title,
        item.subtitle ?? "",
        item.description,
        item.slug.replace(/-/g, " "),
        "produk detail sandwich panel refrigerasi",
      ]),
    });
  }

  for (const step of PROSES_KERJA_STEPS) {
    const href = `/proses/${step.slug}`;
    if (byHref.has(href)) continue;
    const bodies = step.page.sections.flatMap((s) => [s.title, s.body]);
    byHref.set(href, {
      id: `proses-${step.slug}`,
      title: step.title,
      href,
      haystack: normalizeHaystack([
        step.title,
        step.page.description,
        step.page.intro,
        ...bodies,
        "alur proses kerja workflow konsultasi instalasi",
      ]),
    });
  }

  const gp = site.galleryPage;
  const galleryEntry = byHref.get("/gallery-project");
  if (galleryEntry) {
    const projectBlob = normalizeHaystack(
      GALLERY_PROJECTS.flatMap((p) => [
        p.name,
        p.location,
        p.systemType,
        p.description,
        p.category,
        p.status,
      ]),
    );
    mergeHaystack(
      galleryEntry,
      normalizeHaystack([
        gp.title,
        gp.searchPlaceholder,
        "gallery dokumentasi proyek foto video portofolio studi kasus",
        projectBlob,
      ]),
    );
  }
}

/**
 * Gabungan tautan nav (CMS) + section beranda + halaman situs + nomor/email/alamat/produk (jika `site` diisi)
 * + tulisan publik (`seoArticles`) untuk pencarian isi `/artikel/…`.
 */
export function buildHeaderSiteSearchTargets(
  header: SiteContent["header"],
  homeLayout: SiteContent["homeLayout"] | null | undefined,
  site?: SiteContent | null,
  seoArticles?: readonly SeoArticle[] | null,
): HeaderSiteSearchTarget[] {
  const hidden = new Set(homeLayout?.hiddenSections ?? []);
  const order =
    homeLayout?.sectionOrder?.length && homeLayout.sectionOrder.length > 0
      ? homeLayout.sectionOrder
      : DEFAULT_HOME_LAYOUT.sectionOrder;

  const byHref = new Map<string, HeaderSiteSearchTarget>();

  for (const item of header.navItems) {
    if (NAV_SUPPRESSED_IDS.has(item.id)) continue;
    const href = item.href.trim();
    const sid = hrefToSectionId(href);
    const extraKw = sid ? SECTION_KEYWORDS[sid] ?? "" : "";
    const pageKw =
      href.includes("gallery-project") || href === "/gallery-project"
        ? "gallery galery dokumentasi foto video portofolio referensi dokumentasi pekerjaan studi kasus"
        : "";
    const haystack = normalizeHaystack([
      item.label,
      item.shortLabel,
      href,
      extraKw,
      pageKw,
      item.id.replace(/^nav-/, "").replace(/-/g, " "),
    ]);
    byHref.set(href, {
      id: item.id,
      title: item.label,
      href,
      haystack,
    });
  }

  for (const sectionId of order) {
    if (hidden.has(sectionId)) continue;
    const href = sectionId === "beranda" ? "/#beranda" : `/#${sectionId}`;
    const kw = SECTION_KEYWORDS[sectionId] ?? "";
    const fallbackTitle = SECTION_FALLBACK_TITLE[sectionId] ?? sectionId;
    const existing = byHref.get(href);
    if (existing) {
      if (kw) {
        existing.haystack = normalizeHaystack([
          existing.haystack,
          kw,
          sectionId.replace(/-/g, " "),
        ]);
      }
      continue;
    }
    byHref.set(href, {
      id: `section-${sectionId}`,
      title: fallbackTitle,
      href,
      haystack: normalizeHaystack([fallbackTitle, sectionId, kw.replace(/-/g, " "), kw]),
    });
  }

  if (site) {
    enrichFromSiteContent(byHref, site);
  }
  if (seoArticles?.length) {
    appendSeoArticlesSearch(byHref, seoArticles);
  }

  const orderIndex = new Map(order.map((id, i) => [id, i]));

  return [...byHref.values()]
    .filter((t) => !SEARCH_RESULTS_EXCLUDED_HREFS.has(t.href.trim()))
    .sort((a, b) => {
      const sa = hrefToSectionId(a.href);
      const sb = hrefToSectionId(b.href);
      const ia = sa != null ? (orderIndex.get(sa) ?? 999) : 1000;
      const ib = sb != null ? (orderIndex.get(sb) ?? 999) : 1000;
      if (ia !== ib) return ia - ib;
      return a.title.localeCompare(b.title, "id");
    });
}
