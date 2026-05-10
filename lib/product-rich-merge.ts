import type { RichProductDetail } from "@/components/aytipanel/product-detail-rich-data";

/** Gabungkan konten rich statis dengan override CMS (parsial per field / array). */
export function mergeRichProductDetail(
  base: RichProductDetail | undefined,
  patch: Partial<RichProductDetail> | undefined,
): RichProductDetail | undefined {
  if (!base) return undefined;
  if (!patch) return base;

  return {
    ...base,
    ...patch,
    paragraphs: patch.paragraphs ?? base.paragraphs,
    advantages: patch.advantages ?? base.advantages,
    specs: patch.specs ?? base.specs,
    applications: patch.applications ?? base.applications,
    gallery: patch.gallery ?? base.gallery,
    relatedProductSlugs: patch.relatedProductSlugs ?? base.relatedProductSlugs,
  };
}
