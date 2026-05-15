import type { SiteContent } from "@/lib/site-content-model";

export type CmsPortfolioPreviewItem = {
  id: string;
  name: string;
  location: string;
  workType: string;
  imageSrc: string;
  imageAlt: string;
  /** Cuplikan teks — biasanya alt foto pertama carousel (selaras strip portfolio beranda). */
  snippetLabel: string;
};

export function mapCmsPortfolioProjectToPreview(
  proj: SiteContent["portfolio"]["projects"][number],
): CmsPortfolioPreviewItem {
  const firstPhoto = proj.galleryPhotos?.[0];
  const imageSrc =
    proj.coverImageSrc?.trim() ||
    firstPhoto?.src?.trim() ||
    "";
  const imageAlt =
    (proj.coverImageAlt?.trim() ||
      firstPhoto?.alt?.trim() ||
      proj.name).trim() || proj.name;
  const snippetFromPhoto = firstPhoto?.alt?.trim() ?? "";
  const snippetLabel = snippetFromPhoto || proj.workType?.trim() || "";

  return {
    id: proj.id,
    name: proj.name,
    location: proj.location,
    workType: proj.workType,
    imageSrc,
    imageAlt,
    snippetLabel,
  };
}

/** Urutan sama dengan section portfolio di beranda (`content.portfolio.projects`). */
export function cmsPortfolioPreviewSlice(
  content: SiteContent,
  maxItems: number,
): CmsPortfolioPreviewItem[] {
  if (maxItems <= 0) return [];
  return content.portfolio.projects.slice(0, maxItems).map(mapCmsPortfolioProjectToPreview);
}

/** Pilih proyek CMS berdasarkan `id` (mis. dari overlay SEO kota) — tetap sumber yang sama dengan beranda. */
export function cmsPortfolioPreviewByIds(
  content: SiteContent,
  ids: readonly string[],
  maxItems: number,
): CmsPortfolioPreviewItem[] {
  if (maxItems <= 0 || ids.length === 0) return [];
  const byId = new Map(content.portfolio.projects.map((p) => [p.id, p]));
  const out: CmsPortfolioPreviewItem[] = [];
  for (const rawId of ids) {
    if (out.length >= maxItems) break;
    const id = rawId.trim();
    if (!id) continue;
    const proj = byId.get(id);
    if (proj) out.push(mapCmsPortfolioProjectToPreview(proj));
  }
  return out;
}
