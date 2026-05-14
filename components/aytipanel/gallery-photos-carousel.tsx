"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import {
  GalleryImageLightbox,
  type GalleryLightboxPhoto,
} from "@/components/aytipanel/gallery-gallery-lightbox";
import { CmsImage } from "@/components/site-cms/cms-image";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type Props = {
  projectId: string;
  projectName: string;
  photos: GalleryLightboxPhoto[];
  /** Index di `SiteContent.portfolio.projects` — mengaktifkan ganti foto lewat CMS (beranda). */
  cmsProjectIndex?: number;
  /** Basis path di SiteContent, mis. `galleryProjectOverrides.{projectId}` — halaman Gallery Project. */
  cmsGalleryBasePath?: string;
};

const VISIBLE_THUMB_COUNT = 4;

function padChunk<T>(chunk: readonly T[], size: number): (T | null)[] {
  const padded: (T | null)[] = [...chunk];
  while (padded.length < size) padded.push(null);
  return padded.slice(0, size);
}

export function GalleryPhotosCarousel({
  projectId,
  projectName,
  photos,
  cmsProjectIndex,
  cmsGalleryBasePath,
}: Props) {
  const cms = useSiteCmsOptional();
  const basePathFromIndex =
    typeof cmsProjectIndex === "number" ? `portfolio.projects.${cmsProjectIndex}` : "";
  const basePath = (cmsGalleryBasePath?.trim() || basePathFromIndex).trim();
  const isGalleryProjectCmsPath = basePath.startsWith("galleryProjectOverrides.");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const staged = cms?.stagedMediaByPath ?? {};

  const photosResolved = useMemo(() => {
    if (!basePath) return photos;
    return photos.map((ph, idx) => ({
      ...ph,
      src: staged[`${basePath}.galleryPhotos.${idx}.src`] ?? ph.src,
    }));
  }, [photos, basePath, staged]);

  const cmsPhotosActive = Boolean(cms?.eligible && cms?.editMode) && basePath.length > 0;

  const row = useMemo(
    () => padChunk(photosResolved.slice(0, VISIBLE_THUMB_COUNT), VISIBLE_THUMB_COUNT),
    [photosResolved],
  );

  const n = photosResolved.length;

  const openPhoto = useCallback(
    (ph: GalleryLightboxPhoto) => {
      const idxInOriginal = photosResolved.findIndex((p) => p.src === ph.src && p.alt === ph.alt);
      setLightboxIndex(idxInOriginal >= 0 ? idxInOriginal : 0);
      setLightboxOpen(true);
    },
    [photosResolved],
  );

  const closeLb = useCallback(() => setLightboxOpen(false), []);
  const prevLb = useCallback(() => {
    setLightboxIndex((i) => (i <= 0 ? n - 1 : i - 1));
  }, [n]);
  const nextLb = useCallback(() => {
    setLightboxIndex((i) => (i >= n - 1 ? 0 : i + 1));
  }, [n]);

  if (!photos.length) return null;

  const thumbClass = mergeAytiCardClass(
    "group relative h-[3.85rem] min-h-0 w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] sm:h-[4.25rem] dark:border-white/[0.1] dark:bg-[#0b1222] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]",
  );
  const placeholderClass = mergeAytiCardClass(
    "relative h-[3.85rem] w-full min-w-0 shrink-0 rounded-xl border border-dashed border-border/40 bg-muted/25 sm:h-[4.25rem] dark:border-white/[0.08] dark:bg-white/[0.04]",
  );

  const renderCell = (ph: GalleryLightboxPhoto | null, cellKey: string) => {
    if (!ph) {
      return <div key={cellKey} className={placeholderClass} aria-hidden />;
    }
    const cmsSlot = photosResolved.findIndex((p) => p.src === ph.src && p.alt === ph.alt);
    const slot = cmsSlot >= 0 ? cmsSlot : 0;
    const inner = cmsPhotosActive && basePath ? (
      <CmsImage
        fill
        src={ph.src}
        srcPath={`${basePath}.galleryPhotos.${slot}.src`}
        alt={ph.alt}
        uploadScope={isGalleryProjectCmsPath ? "project" : "portfolio"}
        uploadSegment={isGalleryProjectCmsPath ? undefined : projectId}
        uploadProjectId={isGalleryProjectCmsPath ? projectId : undefined}
        sizes="(max-width: 767px) 24vw, 20vw"
        imageClassName="object-cover"
        className="block h-full w-full"
      />
    ) : (
      <Image
        src={ph.src}
        alt={ph.alt}
        fill
        className="object-cover"
        sizes="(max-width: 767px) 24vw, 20vw"
        unoptimized={ph.src.startsWith("data:")}
      />
    );

    return cmsPhotosActive ? (
      <div
        key={cellKey}
        role="button"
        tabIndex={0}
        className={thumbClass}
        onClick={(ev) => {
          if ((ev.target as HTMLElement).closest("button")) return;
          openPhoto(ph);
        }}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            openPhoto(ph);
          }
        }}
      >
        {inner}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90" />
      </div>
    ) : (
      <button key={cellKey} type="button" onClick={() => openPhoto(ph)} className={thumbClass}>
        {inner}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90" />
      </button>
    );
  };

  return (
    <>
      <div
        className="border-t border-border bg-muted-bg/95 px-2 py-2.5 dark:border-white/[0.07] dark:bg-[linear-gradient(180deg,rgba(7,13,24,0.98),rgba(9,14,26,0.95))] sm:px-3 sm:py-3"
        role="region"
        aria-label="Galeri foto proyek — empat gambar"
      >
        <div className="grid min-h-0 w-full grid-cols-4 gap-1.5 sm:gap-2">
          {row.map((ph, ci) => renderCell(ph, `${projectId}-thumb-${ci}`))}
        </div>
      </div>

      <GalleryImageLightbox
        open={lightboxOpen}
        photos={photosResolved}
        index={lightboxIndex}
        onClose={closeLb}
        onPrev={prevLb}
        onNext={nextLb}
        title={projectName}
      />
    </>
  );
}
