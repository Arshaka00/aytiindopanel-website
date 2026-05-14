import type { GalleryProjectItem } from "@/components/aytipanel/gallery-project-data";

type GalleryPhoto = NonNullable<GalleryProjectItem["galleryPhotos"]>[number];
type GalleryProjectCardCmsOverride = Partial<Omit<GalleryProjectItem, "id">>;

function mergeGalleryPhotosOverride(base: GalleryPhoto[], raw: unknown): GalleryPhoto[] {
  if (raw === undefined) return base;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return base;
    const merged = base.map((b, i) => {
      const c = raw[i];
      if (!c || typeof c !== "object") return b;
      return { ...b, ...(c as Record<string, unknown>) } as GalleryPhoto;
    });
    if (raw.length > base.length) {
      const tail = raw.slice(base.length).filter((c): c is Record<string, unknown> => Boolean(c && typeof c === "object"));
      return [
        ...merged,
        ...tail.map((c) => ({
          src: String(c.src ?? ""),
          alt: String(c.alt ?? ""),
        })),
      ];
    }
    return merged;
  }
  if (typeof raw !== "object" || raw === null) return base;
  const record = raw as Record<string, unknown>;
  const keys = Object.keys(record).filter((k) => /^\d+$/.test(k));
  if (keys.length === 0) return base;
  return base.map((b, i) => {
    const slot = record[String(i)];
    if (!slot || typeof slot !== "object") return b;
    return { ...b, ...(slot as Record<string, unknown>) } as GalleryPhoto;
  });
}

/** Gabungkan `content.galleryProjectOverrides` ke satu item proyek (setelah patch berkas lokal). */
export function mergeGalleryProjectSiteOverrides(
  project: GalleryProjectItem,
  cms?: Record<string, GalleryProjectCardCmsOverride>,
): GalleryProjectItem {
  const o = cms?.[project.id];
  if (!o) return project;
  const { galleryPhotos: gpRaw, ...rest } = o;
  const next: GalleryProjectItem = {
    ...project,
    ...rest,
    id: project.id,
  };
  if (gpRaw !== undefined) {
    next.galleryPhotos = mergeGalleryPhotosOverride(project.galleryPhotos ?? [], gpRaw);
  }
  return next;
}
