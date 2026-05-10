/** Folder di bawah `public/media/` — konsisten dengan brief CMS. */
export const MEDIA_LIBRARY_SCOPES = [
  "mediaHero",
  "mediaGallery",
  "mediaProjects",
  "mediaPartner",
  "mediaProducts",
] as const;

export type MediaLibraryScope = (typeof MEDIA_LIBRARY_SCOPES)[number];

export const MEDIA_SCOPE_TO_DIR: Record<MediaLibraryScope, string> = {
  mediaHero: "hero",
  mediaGallery: "gallery",
  mediaProjects: "projects",
  mediaPartner: "partner",
  mediaProducts: "products",
};

export const PUBLIC_MEDIA_BASE = "/media";
