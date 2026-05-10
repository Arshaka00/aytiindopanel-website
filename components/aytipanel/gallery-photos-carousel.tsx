"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

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
  /** Index di `SiteContent.portfolio.projects` — mengaktifkan ganti foto lewat CMS. */
  cmsProjectIndex?: number;
};

/** Hash string → seed deterministik (SSR/client sama). */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG sederhana untuk shuffle stabil. */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seedStr: string): T[] {
  if (items.length <= 1) return [...items];
  const arr = [...items];
  const rng = mulberry32(hashSeed(seedStr));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function chunkPhotos<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function padChunk<T>(chunk: readonly T[], size: number): (T | null)[] {
  const padded: (T | null)[] = [...chunk];
  while (padded.length < size) padded.push(null);
  return padded.slice(0, size);
}

/** Arah gulir acak per kartu (seed stabil) — kiri, kanan, atas, bawah. */
type MarqueeDirection = "left" | "right" | "up" | "down";

const MARQUEE_KEYFRAMES: Record<MarqueeDirection, string> = {
  left: "gallery-photo-marquee-x-left",
  right: "gallery-photo-marquee-x-right",
  up: "gallery-photo-marquee-y-up",
  down: "gallery-photo-marquee-y-down",
};

function marqueeDirectionFromSeed(projectId: string, photoCount: number): MarqueeDirection {
  const v = hashSeed(`${projectId}|marquee-dir|${photoCount}`) % 4;
  return (["left", "right", "up", "down"] as const)[v];
}

/**
 * Goyangan + irama acak per kartu (seed stabil); nama keyframe mengikuti arah.
 */
function marqueeMotionStyleFromSeed(
  projectId: string,
  photoCount: number,
  direction: MarqueeDirection,
): CSSProperties {
  const s = hashSeed(`${projectId}|${photoCount}`);
  const durSec = Math.min(
    58,
    Math.max(26, 18 + photoCount * 5 + (s % 16)),
  );
  const delaySec = ((s >>> 8) % 19) * 0.17;
  return {
    animation: `${MARQUEE_KEYFRAMES[direction]} ${durSec}s linear ${delaySec}s infinite`,
    transformOrigin: "center center",
    backfaceVisibility: "hidden",
  };
}

export function GalleryPhotosCarousel({
  projectId,
  projectName,
  photos,
  cmsProjectIndex,
}: Props) {
  const cms = useSiteCmsOptional();
  const basePath =
    typeof cmsProjectIndex === "number" ? `portfolio.projects.${cmsProjectIndex}` : "";

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const staged = cms?.stagedMediaByPath ?? {};

  /** Tick client-only untuk mengacak ulang urutan foto secara berkala (variasi “hidup”). */
  const [shuffleEpoch, setShuffleEpoch] = useState(0);

  const photosResolved = useMemo(() => {
    if (!basePath) return photos;
    return photos.map((ph, idx) => ({
      ...ph,
      src: staged[`${basePath}.galleryPhotos.${idx}.src`] ?? ph.src,
    }));
  }, [photos, basePath, staged]);

  const cmsPhotosActive =
    Boolean(cms?.eligible && cms?.editMode) && typeof cmsProjectIndex === "number";

  useEffect(() => {
    if (cmsPhotosActive) return;
    const id = window.setInterval(
      () => setShuffleEpoch((x) => x + 1),
      88_000,
    );
    return () => window.clearInterval(id);
  }, [cmsPhotosActive]);

  /** Urutan strip: acak stabil + epoch (acak berkala); indeks CMS/lightbox tetap ke array asli. */
  const photosDisplayOrder = useMemo(() => {
    const fingerprint =
      projectId +
      "|" +
      shuffleEpoch +
      "|" +
      photosResolved.map((p) => p.src).join("\u001f");
    return seededShuffle(photosResolved, fingerprint);
  }, [photosResolved, projectId, shuffleEpoch]);

  const n = photosDisplayOrder.length;

  /** Satu “halaman” marquee: 1 baris × 3 foto (mobile) atau 1 baris × 4 foto (desktop). */
  const mobilePages = useMemo(
    () => chunkPhotos(photosDisplayOrder, 3).map((c) => padChunk(c, 3)),
    [photosDisplayOrder],
  );
  const desktopPages = useMemo(
    () => chunkPhotos(photosDisplayOrder, 4).map((c) => padChunk(c, 4)),
    [photosDisplayOrder],
  );

  const loopMobilePages = useMemo(
    () => [...mobilePages, ...mobilePages],
    [mobilePages],
  );
  const loopDesktopPages = useMemo(
    () => [...desktopPages, ...desktopPages],
    [desktopPages],
  );

  const openPhoto = useCallback(
    (ph: GalleryLightboxPhoto) => {
      const idxInOriginal = photosResolved.findIndex((p) => p.src === ph.src && p.alt === ph.alt);
      const fallback = photosDisplayOrder.findIndex((p) => p.src === ph.src && p.alt === ph.alt);
      setLightboxIndex(idxInOriginal >= 0 ? idxInOriginal : fallback >= 0 ? fallback : 0);
      setLightboxOpen(true);
    },
    [photosDisplayOrder, photosResolved],
  );

  const closeLb = useCallback(() => setLightboxOpen(false), []);
  const prevLb = useCallback(() => {
    setLightboxIndex((i) => (i <= 0 ? n - 1 : i - 1));
  }, [n]);
  const nextLb = useCallback(() => {
    setLightboxIndex((i) => (i >= n - 1 ? 0 : i + 1));
  }, [n]);

  const marqueeDirection = useMemo(
    () => marqueeDirectionFromSeed(projectId, n),
    [projectId, n],
  );
  const isHorizontal = marqueeDirection === "left" || marqueeDirection === "right";

  const clipRef = useRef<HTMLDivElement | null>(null);
  const [clipW, setClipW] = useState(0);
  useLayoutEffect(() => {
    const el = clipRef.current;
    if (!el) return;
    const measure = () => setClipW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const marqueeMotionStyle = useMemo(
    () => marqueeMotionStyleFromSeed(projectId, n, marqueeDirection),
    [projectId, n, marqueeDirection],
  );

  if (!photos.length) return null;

  const thumbClass = mergeAytiCardClass(
    "group relative h-[4.25rem] min-h-0 w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] transition-[border-color,box-shadow,transform] duration-[320ms] [transition-timing-function:var(--ease-premium-soft)] hover:border-sky-500/35 hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-0.5 dark:border-white/[0.1] dark:bg-[#0b1222] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)] dark:hover:border-sky-400/35 dark:hover:shadow-[0_8px_28px_-12px_rgba(56,189,248,0.35)]",
  );
  const placeholderClass = mergeAytiCardClass(
    "relative h-[4.25rem] w-full min-w-0 shrink-0 rounded-xl border border-dashed border-border/40 bg-muted/25 dark:border-white/[0.08] dark:bg-white/[0.04]",
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
        uploadScope="portfolio"
        uploadSegment={projectId}
        sizes="(max-width: 767px) 28vw, 20vw"
        imageClassName="object-cover transition-transform duration-[420ms] [transition-timing-function:var(--ease-premium-soft)] group-hover:scale-[1.06]"
        className="block h-full w-full"
      />
    ) : (
      <Image
        src={ph.src}
        alt={ph.alt}
        fill
        className="object-cover transition-transform duration-[420ms] [transition-timing-function:var(--ease-premium-soft)] group-hover:scale-[1.06]"
        sizes="(max-width: 767px) 28vw, 20vw"
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
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity duration-[320ms] [transition-timing-function:var(--ease-premium-soft)] group-hover:opacity-100" />
      </div>
    ) : (
      <button key={cellKey} type="button" onClick={() => openPhoto(ph)} className={thumbClass}>
        {inner}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity duration-[320ms] [transition-timing-function:var(--ease-premium-soft)] group-hover:opacity-100" />
      </button>
    );
  };

  return (
    <>
      <div
        className="border-t border-border bg-muted-bg/95 px-2 py-2.5 dark:border-white/[0.07] dark:bg-[linear-gradient(180deg,rgba(7,13,24,0.98),rgba(9,14,26,0.95))] sm:px-3 sm:py-3"
        role="region"
        aria-label={
          isHorizontal
            ? "Galeri foto proyek — satu baris; gulir otomatis horizontal (arah acak per kartu)"
            : "Galeri foto proyek — satu baris; gulir otomatis vertikal (arah acak per kartu)"
        }
      >
        <div ref={clipRef} className="min-h-0 min-w-0 w-full">
          {/* Mobile: 1 baris × 3 foto */}
          <div className="min-h-0 min-w-0 overflow-hidden md:hidden">
            <div
              className={`gallery-photo-marquee-track h-[4.35rem] max-h-[4.35rem] gap-2 sm:gap-2.5 ${
                isHorizontal
                  ? "flex w-max max-w-none flex-row flex-nowrap items-stretch"
                  : "flex w-full flex-col"
              }`}
              style={marqueeMotionStyle}
            >
              {loopMobilePages.map((page, pi) => (
                <div
                  key={`${projectId}-m-page-${pi}`}
                  className="grid shrink-0 grid-cols-3 gap-1.5 sm:gap-2"
                  style={
                    isHorizontal && clipW > 0
                      ? { width: clipW, minWidth: clipW }
                      : isHorizontal
                        ? { width: "100%", minWidth: "100%" }
                        : undefined
                  }
                >
                  {page.map((ph, ci) => renderCell(ph, `${projectId}-m-${pi}-${ci}`))}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: 1 baris × 4 foto */}
          <div className="hidden min-h-0 min-w-0 overflow-hidden md:block">
            <div
              className={`gallery-photo-marquee-track h-[4.35rem] max-h-[4.35rem] gap-2.5 ${
                isHorizontal
                  ? "flex w-max max-w-none flex-row flex-nowrap items-stretch"
                  : "flex w-full flex-col"
              }`}
              style={marqueeMotionStyle}
            >
              {loopDesktopPages.map((page, pi) => (
                <div
                  key={`${projectId}-d-page-${pi}`}
                  className="grid shrink-0 grid-cols-4 gap-2"
                  style={
                    isHorizontal && clipW > 0
                      ? { width: clipW, minWidth: clipW }
                      : isHorizontal
                        ? { width: "100%", minWidth: "100%" }
                        : undefined
                  }
                >
                  {page.map((ph, ci) => renderCell(ph, `${projectId}-d-${pi}-${ci}`))}
                </div>
              ))}
            </div>
          </div>
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
