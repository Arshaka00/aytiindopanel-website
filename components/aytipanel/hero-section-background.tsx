"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";

import { HeroBackgroundSlider } from "@/components/aytipanel/hero-background-slider";
import { HeroScrollCinematicBackdrop } from "@/components/aytipanel/hero-scroll-cinematic-backdrop";
import { useHeroViewportPerformance } from "@/components/aytipanel/use-hero-viewport-performance";
import { heroSlideSources } from "@/components/aytipanel/hero-slider-config";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import {
  CMS_IMAGE_TRANSFORM_PREVIEW,
  CMS_IMAGE_TRANSFORM_PREVIEW_RESET,
  type CmsImageTransform,
} from "@/lib/cms-image-transform";
import type { HeroSlideEntry } from "@/lib/site-content-model";

type HeroBgVideo = null | {
  src: string;
  poster?: string;
  muted?: boolean;
};

function isHeroBackgroundVideoSrc(src: string | undefined | null): boolean {
  const s = typeof src === "string" ? src.trim() : "";
  if (!s) return false;
  return s.startsWith("/") || s.startsWith("https://") || s.startsWith("http://");
}

/** Lapisan gambar hero (slider / pratinjau CMS). */
export function HeroSectionBackground(props?: {
  slides?: readonly HeroSlideEntry[];
  backgroundVideo?: HeroBgVideo;
  /** Jika true (Site Settings), pakai slider gambar menggantikan video. */
  disableVideoBackground?: boolean;
  /** SSR: tebakan viewport mobile dari User-Agent — kurangi CLS hydrasi hero. */
  initialViewportIsMobile?: boolean;
}) {
  const cms = useSiteCmsOptional();
  const cmsHeroEdit = Boolean(cms?.eligible && cms.editMode);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useHeroViewportPerformance();
  const [previewSlides, setPreviewSlides] = useState<Record<string, string>>({});
  const [instantPreviewSrc, setInstantPreviewSrc] = useState<string | null>(null);
  /** Pratinjau transform slide hero sebelum simpan draft. */
  const [slideTransformPreview, setSlideTransformPreview] = useState<Record<number, CmsImageTransform>>({});

  const baseSlides =
    props?.slides && props.slides.length > 0 ? props.slides : heroSlideSources;
  useEffect(() => {
    const onPreview = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; url?: string }>;
      const path = ce.detail?.path;
      const url = ce.detail?.url;
      if (!path?.startsWith("hero.slides.") || !url) return;
      setPreviewSlides((prev) => ({ ...prev, [path]: url }));
      setInstantPreviewSrc(url);
    };
    const onPreviewReset = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string }>;
      const path = ce.detail?.path;
      if (!path?.startsWith("hero.slides.")) return;
      setPreviewSlides((prev) => {
        const next = { ...prev };
        delete next[path];
        if (Object.keys(next).length === 0) setInstantPreviewSrc(null);
        return next;
      });
    };
    window.addEventListener("cms-image-preview", onPreview as EventListener);
    window.addEventListener("cms-image-preview-reset", onPreviewReset as EventListener);
    return () => {
      window.removeEventListener("cms-image-preview", onPreview as EventListener);
      window.removeEventListener("cms-image-preview-reset", onPreviewReset as EventListener);
    };
  }, []);

  useEffect(() => {
    const onTfPreview = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string; transform?: CmsImageTransform }>;
      const path = ce.detail?.path;
      const tf = ce.detail?.transform;
      const m = path?.match(/^hero\.slides\.(\d+)$/);
      if (!m || !tf) return;
      const idx = Number(m[1]);
      setSlideTransformPreview((prev) => ({ ...prev, [idx]: tf }));
    };
    const onTfReset = (ev: Event) => {
      const ce = ev as CustomEvent<{ path?: string }>;
      const path = ce.detail?.path;
      const m = path?.match(/^hero\.slides\.(\d+)$/);
      if (!m) return;
      const idx = Number(m[1]);
      setSlideTransformPreview((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    };
    window.addEventListener(CMS_IMAGE_TRANSFORM_PREVIEW, onTfPreview as EventListener);
    window.addEventListener(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, onTfReset as EventListener);
    return () => {
      window.removeEventListener(CMS_IMAGE_TRANSFORM_PREVIEW, onTfPreview as EventListener);
      window.removeEventListener(CMS_IMAGE_TRANSFORM_PREVIEW_RESET, onTfReset as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!cms?.stagedMediaByPath) return;
    setPreviewSlides((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (!key.startsWith("hero.slides.")) continue;
        if (!cms.stagedMediaByPath[key]) delete next[key];
      }
      if (Object.keys(next).length === 0) setInstantPreviewSrc(null);
      return next;
    });
  }, [cms?.stagedMediaByPath]);

  const slides = useMemo(
    () =>
      baseSlides.map((s, i) => {
        const key = `hero.slides.${i}.src`;
        const staged = cms?.stagedMediaByPath?.[key];
        const preview = previewSlides[key];
        const src = preview ?? staged ?? s.src;
        const pv = slideTransformPreview[i];
        return pv ? { ...s, ...pv, src } : { ...s, src };
      }),
    [baseSlides, cms?.stagedMediaByPath, previewSlides, slideTransformPreview],
  );
  const video = props?.backgroundVideo;
  const disableVideo = props?.disableVideoBackground === true;
  const showVideo =
    Boolean(video) && isHeroBackgroundVideoSrc(video?.src) && !disableVideo;

  /** Mobile: kurangi fetch decode awal; desktop tetap `auto`. */
  const [videoPreload, setVideoPreload] =
    useState<ComponentProps<"video">["preload"]>("auto");
  useEffect(() => {
    if (!showVideo) return;
    const mobileMq = window.matchMedia("(max-width: 767.98px)");
    const sync = () => {
      queueMicrotask(() => {
        setVideoPreload(mobileMq.matches ? "metadata" : "metadata");
      });
    };
    sync();
    mobileMq.addEventListener("change", sync);
    return () => mobileMq.removeEventListener("change", sync);
  }, [showVideo]);

  /** Jeda decode video saat scroll / hero hampir keluar layar. */
  useEffect(() => {
    if (!showVideo) return;
    const beranda = document.getElementById("beranda");
    const videoEl = heroVideoRef.current;
    if (!beranda || !videoEl) return;

    const syncPlayback = () => {
      const shouldPause = beranda.getAttribute("data-hero-bg-active") === "0";
      if (shouldPause) {
        if (!videoEl.paused) videoEl.pause();
        return;
      }
      void videoEl.play().catch(() => {
        /* autoplay policy / tab background */
      });
    };

    syncPlayback();
    const mo = new MutationObserver(syncPlayback);
    mo.observe(beranda, {
      attributes: true,
      attributeFilter: ["data-hero-bg-active"],
    });
    return () => mo.disconnect();
  }, [showVideo]);

  /** Poster eksplisit, atau frame cadangan dari slide pertama — bukan warna solid dummy. */
  const videoPoster =
    showVideo && video
      ? (video.poster?.trim() || slides[0]?.src || undefined)
      : undefined;

  return (
    <>
      {showVideo && video ? (
        <HeroScrollCinematicBackdrop>
          <div className="hero-bg-root pointer-events-none relative h-full min-h-0 w-full overflow-hidden bg-[#050B18]" aria-hidden>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- dekoratif */}
            <video
              ref={heroVideoRef}
              key={video.src}
              src={video.src}
              poster={videoPoster}
              muted={video.muted ?? true}
              playsInline
              autoPlay
              loop
              preload={videoPreload}
              className="hero-bg-media absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        </HeroScrollCinematicBackdrop>
      ) : (
        <>
          <HeroScrollCinematicBackdrop>
            <HeroBackgroundSlider
              sources={slides}
              initialViewportIsMobile={props?.initialViewportIsMobile}
            />
          </HeroScrollCinematicBackdrop>
          {cmsHeroEdit && instantPreviewSrc ? (
            <div
              className="pointer-events-none absolute inset-0 z-[2] opacity-100 transition-opacity duration-300 ease-out"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- lightweight CMS preview overlay */}
              <img
                src={instantPreviewSrc}
                alt=""
                width={1920}
                height={1080}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full touch-manipulation select-none object-cover object-center [-webkit-touch-callout:none]"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
