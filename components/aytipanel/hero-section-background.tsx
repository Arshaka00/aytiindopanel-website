"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { HeroBackgroundSlider } from "@/components/aytipanel/hero-background-slider";
import {
  HERO_SLIDE_INTERVAL_MS,
  heroSlideSources,
} from "@/components/aytipanel/hero-slider-config";
import { SiteCopyrightImageLightbox } from "@/components/aytipanel/site-copyright-image-lightbox";
import { useTouchSafeButtonActivate } from "@/components/aytipanel/use-touch-safe-button-activate";

const emptySubscribe = () => () => {};

function useIsBrowser(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Sinkron viewer dengan carousel CSS (waktu sistem mod siklus). */
function heroSlideIndexFromClock(): number {
  const n = heroSlideSources.length;
  if (n < 2) return 0;
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return 0;
  }
  const cycleMs = n * HERO_SLIDE_INTERVAL_MS;
  const elapsed = Date.now() % cycleMs;
  return Math.min(n - 1, Math.floor(elapsed / HERO_SLIDE_INTERVAL_MS));
}

/** Lapisan gambar hero + viewer slide yang sedang aktif di siklus. */
export function HeroSectionBackground() {
  const titleId = useId();
  const [viewerSlideIdx, setViewerSlideIdx] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const isBrowser = useIsBrowser();

  const openViewer = useCallback(() => {
    setViewerSlideIdx(heroSlideIndexFromClock());
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => setViewerOpen(false), []);

  const [bindFabButton, activateFabTap] = useTouchSafeButtonActivate(openViewer);
  const [bindBackdropTap, activateBackdropTap] = useTouchSafeButtonActivate(openViewer);

  const slide = heroSlideSources[viewerSlideIdx] ?? heroSlideSources[0];
  const slideAlt = slide ? `Gambar latar beranda — slide ${viewerSlideIdx + 1}` : "";

  const fabPortal =
    isBrowser && typeof document !== "undefined"
      ? createPortal(
          <button
            ref={bindFabButton}
            type="button"
            onClick={activateFabTap}
            aria-haspopup="dialog"
            aria-label="Lihat gambar latar beranda"
            className="touch-manipulation fixed bottom-28 right-4 z-[120] flex size-11 cursor-pointer items-center justify-center rounded-xl border border-white/25 bg-black/45 text-white shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[opacity,transform,border-color,background-color] hover:border-white/40 hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-5 md:bottom-10 md:right-8 md:size-12"
          >
            <GalleryIcon className="size-[1.375rem] opacity-95 md:size-6" />
          </button>,
          document.body,
        )
      : null;

  return (
    <>
      <HeroBackgroundSlider />
      <button
        ref={bindBackdropTap}
        type="button"
        tabIndex={-1}
        onClick={activateBackdropTap}
        aria-label="Lihat gambar latar beranda"
        className="absolute inset-0 z-[8] cursor-pointer touch-manipulation border-0 bg-transparent p-0 [&:focus]:outline-none"
      />
      {fabPortal}
      {viewerOpen && slide ? (
        <SiteCopyrightImageLightbox
          src={slide.src}
          alt={slideAlt}
          titleId={titleId}
          onClose={closeViewer}
          srHeading="Tampilan gambar latar beranda"
        />
      ) : null}
    </>
  );
}
