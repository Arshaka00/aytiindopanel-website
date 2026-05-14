/**
 * Kontrol tampilan gambar CMS (tanpa mengubah berkas asli).
 * Desktop + penyesuaian opsional khusus mobile (crop/zoom terpisah).
 */

import type { CSSProperties } from "react";

/** Event: `detail = { path: string; transform: CmsImageTransform }` — pratinjau di halaman tanpa simpan draft. */
export const CMS_IMAGE_TRANSFORM_PREVIEW = "cms-image-transform-preview";
/** Event: `detail = { path: string }` — batalkan pratinjau untuk path tersebut. */
export const CMS_IMAGE_TRANSFORM_PREVIEW_RESET = "cms-image-transform-preview-reset";

export type CmsObjectFitMode = "cover" | "contain" | "fill";

/** Override khusus layar sempit — field kosong mengikuti desktop. */
export type CmsImageMobileAdjust = Partial<{
  objectFit: CmsObjectFitMode;
  focalX: number;
  focalY: number;
  zoom: number;
}>;

export type CmsImageTransform = {
  objectFit: CmsObjectFitMode;
  focalX: number;
  focalY: number;
  zoom: number;
  /** Di viewport mobile (≤767.98px), gabungkan di atas nilai desktop. */
  mobile?: CmsImageMobileAdjust;
};

export const DEFAULT_CMS_IMAGE_TRANSFORM: CmsImageTransform = {
  objectFit: "cover",
  focalX: 50,
  focalY: 50,
  zoom: 1,
};

export function clamp01pct(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, n));
}

/** Zoom tampilan: &lt;1 memperkecil, &gt;1 memperbesar (tanpa mengubah berkas). */
export function clampZoom(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(3, Math.max(0.4, n));
}

type RawTransformInput = (Partial<CmsImageTransform> & { src?: string }) | null | undefined;

/** Nilai desktop saja (abaikan `mobile` dan `src`). */
export function resolveCmsImageTransform(p?: RawTransformInput): CmsImageTransform {
  const d = DEFAULT_CMS_IMAGE_TRANSFORM;
  const raw = p ?? {};
  const fit =
    raw.objectFit === "cover" || raw.objectFit === "contain" || raw.objectFit === "fill"
      ? raw.objectFit
      : d.objectFit;
  return {
    objectFit: fit,
    focalX: clamp01pct(typeof raw.focalX === "number" ? raw.focalX : d.focalX),
    focalY: clamp01pct(typeof raw.focalY === "number" ? raw.focalY : d.focalY),
    zoom: clampZoom(typeof raw.zoom === "number" ? raw.zoom : d.zoom),
  };
}

/** Gabungan untuk tampilan aktual: mobile memakai override jika ada. */
export function resolveCmsImageTransformForViewport(p: RawTransformInput, isMobile: boolean): CmsImageTransform {
  const base = resolveCmsImageTransform(p);
  if (!isMobile) return base;
  const m = p?.mobile;
  if (!m || typeof m !== "object") return base;
  const fit =
    m.objectFit === "cover" || m.objectFit === "contain" || m.objectFit === "fill"
      ? m.objectFit
      : base.objectFit;
  return {
    objectFit: fit,
    focalX: typeof m.focalX === "number" ? clamp01pct(m.focalX) : base.focalX,
    focalY: typeof m.focalY === "number" ? clamp01pct(m.focalY) : base.focalY,
    zoom: typeof m.zoom === "number" ? clampZoom(m.zoom) : base.zoom,
  };
}

/** Bentuk untuk disimpan / event pratinjau — `mobile` hanya berisi field yang disetel. */
export function normalizeFullCmsImageTransform(p?: RawTransformInput): CmsImageTransform {
  const core = resolveCmsImageTransform(p);
  const mob = p?.mobile;
  if (!mob || typeof mob !== "object") return { ...core };
  const mobile: CmsImageMobileAdjust = {};
  if (mob.objectFit === "cover" || mob.objectFit === "contain" || mob.objectFit === "fill") {
    mobile.objectFit = mob.objectFit;
  }
  if (typeof mob.focalX === "number") mobile.focalX = clamp01pct(mob.focalX);
  if (typeof mob.focalY === "number") mobile.focalY = clamp01pct(mob.focalY);
  if (typeof mob.zoom === "number") mobile.zoom = clampZoom(mob.zoom);
  if (Object.keys(mobile).length === 0) return { ...core };
  return { ...core, mobile };
}

/** Style untuk `<img>` / Next `<Image>` — wrapper harus `overflow-hidden` bila zoom ≠ 1. */
export function cmsImageTransformToReactStyle(t: CmsImageTransform): CSSProperties {
  const fx = t.focalX;
  const fy = t.focalY;
  const z = t.zoom;
  return {
    objectFit: t.objectFit,
    objectPosition: `${fx}% ${fy}%`,
    transform: Math.abs(z - 1) > 0.001 ? `scale(${z})` : undefined,
    transformOrigin: `${fx}% ${fy}%`,
  };
}
