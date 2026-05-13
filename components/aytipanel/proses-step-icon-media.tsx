"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

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
};

/**
 * Render gambar kecil per-step di alur "proses kerja". Bila `src` kosong, jatuhkan
 * ke ikon SVG fallback. Mendengarkan event `cms-image-preview` agar editor di CMS
 * langsung melihat perubahan sebelum disimpan.
 */
export function ProsesStepIconMedia({
  srcPath,
  initialSrc,
  fallback,
  imageClassName = "",
  alt,
  imageSizes = "(max-width: 767px) 44px, 56px",
}: ProsesStepIconMediaProps) {
  const cms = useSiteCmsOptional();
  const stagedSrc = cms?.stagedMediaByPath?.[srcPath];
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

  const safeSrc = typeof previewSrc === "string" && previewSrc.trim().length > 0 ? previewSrc : null;

  if (!safeSrc) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={safeSrc}
      alt={alt}
      fill
      sizes={imageSizes}
      className={`${imageClassName} object-cover`.trim()}
      aria-hidden
    />
  );
}
