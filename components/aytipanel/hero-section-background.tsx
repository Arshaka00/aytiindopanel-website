"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";

import { HeroBackgroundSlider } from "@/components/aytipanel/hero-background-slider";
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
    const mq = window.matchMedia("(max-width: 767.98px)");
    const sync = () => {
      queueMicrotask(() => {
        setVideoPreload(mq.matches ? "metadata" : "auto");
      });
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [showVideo]);
  /** Poster eksplisit, atau frame cadangan dari slide pertama — bukan warna solid dummy. */
  const videoPoster =
    showVideo && video
      ? (video.poster?.trim() || slides[0]?.src || undefined)
      : undefined;

  return (
    <>
      {showVideo && video ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- dekoratif */}
          <video
            key={video.src}
            src={video.src}
            poster={videoPoster}
            muted={video.muted ?? true}
            playsInline
            autoPlay
            loop
            preload={videoPreload}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Samakan vignette dengan HeroBackgroundSlider (satu gambar). */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_100%_92%_at_50%_44%,transparent_40%,rgba(5,11,24,0.1)_72%,rgba(5,11,24,0.24)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_-44px_64px_-16px_rgba(5,11,24,0.07),inset_0_0_40px_rgba(5,11,24,0.028)]"
            aria-hidden
          />
        </div>
      ) : (
        <>
          <HeroBackgroundSlider
            sources={slides}
            initialViewportIsMobile={props?.initialViewportIsMobile}
          />
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
