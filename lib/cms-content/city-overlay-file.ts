import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CONTENT_CMS_ROOT } from "@/lib/cms-content/paths";
import type { ServiceCitySeoOverlay } from "@/lib/seo-service-city-overlay";

/** Override SEO kota dari `/content/cms/cities/[slug-lengkap].json` (mis. cold-storage-bandung.json). */
export type ServiceCityCmsOverlayFile = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  h1?: string;
  heroSubheadline?: string;
  heroLead?: string;
  introParagraph?: string;
  coverageAreas?: string[];
  /** ID entri Portfolio CMS (`content.portfolio.projects[].id`). */
  relatedGalleryProjectIds?: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function readServiceCityCmsOverlayFile(
  slug: string,
): Promise<ServiceCityCmsOverlayFile | null> {
  if (!/^[\da-z]+(?:-[\da-z]+)*$/i.test(slug)) return null;
  const filePath = path.join(CONTENT_CMS_ROOT, "cities", `${slug}.json`);
  try {
    const raw = await readFile(filePath, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data)) return null;

    const out: ServiceCityCmsOverlayFile = {};
    const str = (k: string) => (typeof data[k] === "string" ? data[k]?.toString().trim() : "");

    const mt = str("metaTitle");
    const md = str("metaDescription");
    const h1 = str("h1");
    const hs = str("heroSubheadline");
    const hl = str("heroLead");
    const intro = str("introParagraph");

    if (mt) out.metaTitle = mt;
    if (md) out.metaDescription = md;
    if (h1) out.h1 = h1;
    if (hs) out.heroSubheadline = hs;
    if (hl) out.heroLead = hl;
    if (intro) out.introParagraph = intro;

    if (Array.isArray(data.keywords)) {
      out.keywords = data.keywords.filter((x) => typeof x === "string").map((x) => x.trim()).filter(Boolean);
    }
    if (Array.isArray(data.coverageAreas)) {
      out.coverageAreas = data.coverageAreas
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean);
    }
    if (Array.isArray(data.relatedGalleryProjectIds)) {
      out.relatedGalleryProjectIds = data.relatedGalleryProjectIds
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean);
    }

    const keysLen = Object.keys(out).length;
    return keysLen > 0 ? out : null;
  } catch {
    return null;
  }
}

export function applyServiceCityCmsOverlay(
  overlay: ServiceCitySeoOverlay,
  file: ServiceCityCmsOverlayFile | null,
): ServiceCitySeoOverlay {
  if (!file) return overlay;
  return {
    ...overlay,
    metaTitle: file.metaTitle ?? overlay.metaTitle,
    metaDescription: file.metaDescription ?? overlay.metaDescription,
    keywords: file.keywords?.length ? file.keywords : overlay.keywords,
    h1: file.h1 ?? overlay.h1,
    heroSubheadline: file.heroSubheadline ?? overlay.heroSubheadline,
    heroLead: file.heroLead ?? overlay.heroLead,
    introParagraph: file.introParagraph ?? overlay.introParagraph,
    coverageAreas: file.coverageAreas?.length ? file.coverageAreas : overlay.coverageAreas,
    relatedGalleryProjectIds:
      file.relatedGalleryProjectIds?.length ? file.relatedGalleryProjectIds : overlay.relatedGalleryProjectIds,
  };
}
