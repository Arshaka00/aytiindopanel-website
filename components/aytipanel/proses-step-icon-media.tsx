"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import type { SiteContent } from "@/lib/site-content";
import { withSiteImageCacheBust } from "@/lib/site-image-cache-bust";

type ProsesStepIconMediaProps = {
  slug: string;
  /** Path patch CMS — biasanya `hero.prosesStepImages.<slug>`. */
  srcPath: string;
  /** URL gambar awal (server-side). String kosong = jatuh ke fallback ikon. */
  initialSrc: string;
  /**
   * JSX fallback ikon (pre-rendered di parent server component agar tidak
   * melanggar batasan "function as prop" pada client component).
   */
  fallback: ReactNode;
  /** Class untuk elemen `<Image>` (mode image). */
  imageClassName?: string;
  /** Alt text untuk image. */
  alt: string;
  /** Hint `sizes` untuk Next/Image (sesuaikan dengan ukuran shell ikon). */
  imageSizes?: string;
  /** Skala tampilan gambar di dalam kartu (1 = default). */
  zoom?: number;
  /** `contain` = seluruh gambar terlihat (ikon produk); `cover` = isi penuh kartu. */
  imageFit?: "cover" | "contain";
};

/**
 * Render gambar kecil per-step di alur "proses kerja". Bila `src` kosong, jatuhkan
 * ke ikon SVG fallback. Mendengarkan event `cms-image-preview` agar editor di CMS
 * langsung melihat perubahan sebelum disimpan.
 */
export function ProsesStepIconMedia({
  slug,
  srcPath,
  initialSrc,
  fallback,
  imageClassName = "",
  alt,
  imageSizes = "(max-width: 767px) 44px, 56px",
  zoom = 1,
  imageFit = "cover",
}: ProsesStepIconMediaProps) {
  const cms = useSiteCmsOptional();
  const stagedSrc = cms?.stagedMediaByPath?.[srcPath];
  const stagedZoomEntry =
    cms?.stagedProsesStepImageZoom?.[slug as keyof SiteContent["hero"]["prosesStepImageZoom"]];
  const [previewSrc, setPreviewSrc] = useState<string>(stagedSrc ?? initialSrc ?? "");

  useEffect(() => {
    setPreviewSrc(stagedSrc ?? initialSrc ?? "");
  }, [initialSrc, stagedSrc]);

  useEffect(() => {
    const onPreview = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; url?: string }>;
      if (ce.detail?.path !== srcPath) return;
      if (typeof ce.detail.url === "string" && ce.detail.url.trim().length > 0) {
        setPreviewSrc(ce.detail.url);
      }
    };
    const onReset = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string }>;
      if (ce.detail?.path !== srcPath) return;
      setPreviewSrc(cms?.stagedMediaByPath?.[srcPath] ?? initialSrc ?? "");
    };
    window.addEventListener("cms-image-preview", onPreview as EventListener);
    window.addEventListener("cms-image-preview-reset", onReset as EventListener);
    return () => {
      window.removeEventListener("cms-image-preview", onPreview as EventListener);
      window.removeEventListener("cms-image-preview-reset", onReset as EventListener);
    };
  }, [cms, initialSrc, srcPath]);

  const rawSrc = typeof previewSrc === "string" && previewSrc.trim().length > 0 ? previewSrc.trim() : null;
  const safeSrc = rawSrc ? withSiteImageCacheBust(rawSrc) : null;
  const baseZ = typeof zoom === "number" && Number.isFinite(zoom) ? zoom : 1;
  const stagedZ =
    typeof stagedZoomEntry === "number" && Number.isFinite(stagedZoomEntry) ? stagedZoomEntry : undefined;
  const safeZoom = Math.min(2.5, Math.max(0.35, stagedZ !== undefined ? stagedZ : baseZ));

  if (!safeSrc) {
    return <>{fallback}</>;
  }

  const isProductIcon = imageFit === "contain";
  const wrapClass = isProductIcon
    ? "proses-hero-step-photo-wrap pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    : "pointer-events-none absolute inset-0 z-[1] overflow-hidden";

  return (
    <span className={wrapClass}>
      <span
        className="relative block h-full w-full origin-center"
        style={{ transform: `scale(${safeZoom})` }}
      >
        <Image
          key={safeSrc}
          src={safeSrc}
          alt={alt}
          fill
          sizes={imageSizes}
          quality={imageFit === "contain" ? 96 : 82}
          className={`${imageClassName} ${imageFit === "contain" ? "object-contain object-center p-0" : "object-cover"}`.trim()}
          aria-hidden
        />
      </span>
    </span>
  );
}
