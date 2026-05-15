import type { LandingKotaPageCmsEntry, LandingKotaPagesCmsContent } from "@/lib/landing-kota-pages/cms-types";
import type { ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";

function trimStr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

/** Slug URL landing kota: huruf-angka-dash. */
export function isLandingKotaSlugKey(slug: string): boolean {
  return /^[\da-z]+(?:-[\da-z]+)*$/i.test(slug.trim());
}

export function buildDefaultLandingKotaPages(): LandingKotaPagesCmsContent {
  return {
    index: {
      eyebrow: "Area layanan Indonesia",
      heading: "Landing kota — cold storage & panel per wilayah",
      lead:
        "Halaman SEO lokal untuk setiap kota: ringkasan layanan cold storage, sandwich panel, cold room, dan blast freezer. Pilih wilayah proyek Anda untuk detail teknis dan tautan topik terkait.",
      metaTitle: "",
      metaDescription: "",
    },
    pages: [],
  };
}

/** Terapkan override CMS kota (prioritas atas merge file kota + baseline generator). */
export function applyLandingKotaCmsEntryToServiceOverlay(
  overlay: ServiceCitySeoOverlay,
  entry: LandingKotaPageCmsEntry | null | undefined,
): ServiceCitySeoOverlay {
  if (!entry) return overlay;
  const mt = trimStr(entry.metaTitle, "");
  const md = trimStr(entry.metaDescription, "");
  const h1 = trimStr(entry.h1, "");
  const hs = trimStr(entry.heroSubheadline, "");
  const hl = trimStr(entry.heroLead, "");
  const intro = trimStr(entry.introParagraph, "");
  const kw = Array.isArray(entry.keywords)
    ? entry.keywords.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean)
    : [];
  const cov = Array.isArray(entry.coverageAreas)
    ? entry.coverageAreas.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean)
    : [];
  const rel = Array.isArray(entry.relatedGalleryProjectIds)
    ? entry.relatedGalleryProjectIds
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  return {
    ...overlay,
    metaTitle: mt || overlay.metaTitle,
    metaDescription: md || overlay.metaDescription,
    keywords: kw.length ? kw : overlay.keywords,
    h1: h1 || overlay.h1,
    heroSubheadline: hs || overlay.heroSubheadline,
    heroLead: hl || overlay.heroLead,
    introParagraph: intro || overlay.introParagraph,
    coverageAreas: cov.length ? cov : overlay.coverageAreas,
    relatedGalleryProjectIds:
      rel.length ? rel : overlay.relatedGalleryProjectIds,
  };
}

/** Cari override CMS untuk satu slug kota. */
export function getLandingKotaPageEntryFromContent(
  landing: LandingKotaPagesCmsContent | undefined,
  slug: string,
): LandingKotaPageCmsEntry | undefined {
  if (!landing?.pages?.length) return undefined;
  const key = slug.trim();
  const lower = key.toLowerCase();
  return landing.pages.find((p) => {
    const s = trimStr(p.slug, "");
    return s.toLowerCase() === lower || s === key;
  });
}

function normalizeLandingKotaPageEntry(raw: LandingKotaPageCmsEntry): LandingKotaPageCmsEntry | null {
  const slug = trimStr(raw.slug, "");
  if (!isLandingKotaSlugKey(slug)) return null;

  const out: LandingKotaPageCmsEntry = { slug };

  const mt = trimStr(raw.metaTitle, "");
  const md = trimStr(raw.metaDescription, "");
  const h1 = trimStr(raw.h1, "");
  const hs = trimStr(raw.heroSubheadline, "");
  const hl = trimStr(raw.heroLead, "");
  const intro = trimStr(raw.introParagraph, "");

  if (mt) out.metaTitle = mt;
  if (md) out.metaDescription = md;
  if (h1) out.h1 = h1;
  if (hs) out.heroSubheadline = hs;
  if (hl) out.heroLead = hl;
  if (intro) out.introParagraph = intro;

  if (Array.isArray(raw.keywords)) {
    const k = raw.keywords.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
    if (k.length) out.keywords = k;
  }
  if (Array.isArray(raw.coverageAreas)) {
    const c = raw.coverageAreas
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter(Boolean);
    if (c.length) out.coverageAreas = c;
  }
  if (Array.isArray(raw.relatedGalleryProjectIds)) {
    const r = raw.relatedGalleryProjectIds
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter(Boolean);
    if (r.length) out.relatedGalleryProjectIds = r;
  }

  /** Hanya simpan objek kalau ada setidaknya satu field konten selain slug. */
  const keys = Object.keys(out).filter((k) => k !== "slug");
  if (keys.length === 0) return null;

  return out;
}

export function normalizeLandingKotaPagesInContent(
  incoming: LandingKotaPagesCmsContent | undefined,
  defaults: LandingKotaPagesCmsContent,
): LandingKotaPagesCmsContent {
  const idxIn = incoming?.index;
  const idxDef = defaults.index;

  const index = {
    eyebrow: trimStr(idxIn?.eyebrow, idxDef.eyebrow) || idxDef.eyebrow,
    heading: trimStr(idxIn?.heading, idxDef.heading) || idxDef.heading,
    lead: trimStr(idxIn?.lead, idxDef.lead) || idxDef.lead,
    metaTitle: trimStr(idxIn?.metaTitle, ""),
    metaDescription: trimStr(idxIn?.metaDescription, ""),
  };

  const bySlug = new Map<string, LandingKotaPageCmsEntry>();

  const pagesSrc = incoming?.pages;
  const seen = pagesSrc ?? [];
  for (const row of seen) {
    if (!row || typeof row !== "object") continue;
    const norm = normalizeLandingKotaPageEntry(row as LandingKotaPageCmsEntry);
    if (norm) bySlug.set(norm.slug, norm);
  }

  const pages = [...bySlug.values()].sort((a, b) =>
    a.slug.toLowerCase().localeCompare(b.slug.toLowerCase(), "id"),
  );

  return { index, pages };
}
