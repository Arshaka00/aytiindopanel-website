"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  SITE_IMAGE_COPYRIGHT_NOTICE,
  siteImageCopyrightCaptionOverlay,
} from "@/components/aytipanel/site-image-copyright";

export type GalleryLightboxPhoto = { src: string; alt: string };

type Props = {
  open: boolean;
  photos: GalleryLightboxPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  title: string;
};

function ZoomableLightboxImage({
  src,
  alt,
  unoptimized,
  watermarkId,
  watermarkLine1,
  watermarkLine2,
}: {
  src: string;
  alt: string;
  unoptimized: boolean;
  watermarkId: string;
  watermarkLine1: string;
  watermarkLine2: string;
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const dragStartRef = useRef<{ pointerId: number; x: number; y: number; ox: number; oy: number } | null>(null);
  const canPan = zoomScale > 1.001;

  const clampScale = useCallback((value: number) => Math.min(4, Math.max(1, value)), []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

      const pointers = [...pointersRef.current.values()];
      if (pointers.length >= 2) {
        const [a, b] = pointers;
        pinchRef.current = {
          startDistance: Math.hypot(a.x - b.x, a.y - b.y),
          startScale: zoomScale,
        };
        setIsPinching(true);
        dragStartRef.current = null;
      } else if (canPan) {
        dragStartRef.current = {
          pointerId: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          ox: dragOffset.x,
          oy: dragOffset.y,
        };
      }
    },
    [canPan, dragOffset.x, dragOffset.y, zoomScale],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pointers = [...pointersRef.current.values()];

      if (pointers.length >= 2 && pinchRef.current) {
        const [a, b] = pointers;
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const next = clampScale((pinchRef.current.startScale * distance) / pinchRef.current.startDistance);
        setZoomScale(next);
        if (next <= 1.001) setDragOffset({ x: 0, y: 0 });
        return;
      }

      if (!canPan || !dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const limit = (zoomScale - 1) * 180;
      setDragOffset({
        x: Math.max(-limit, Math.min(limit, dragStartRef.current.ox + dx)),
        y: Math.max(-limit, Math.min(limit, dragStartRef.current.oy + dy)),
      });
    },
    [canPan, clampScale, zoomScale],
  );

  const handlePointerEnd = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
      setIsPinching(false);
    }
    if (dragStartRef.current?.pointerId === e.pointerId) dragStartRef.current = null;
  }, []);

  return (
    <div
      className="relative aspect-[16/10] w-full max-h-[min(85vh,820px)] touch-none overflow-hidden sm:aspect-video"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {/* Satu layer transform: gambar + watermark ikut zoom / geser */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoomScale})`,
          transformOrigin: "center center",
          transition: isPinching ? "none" : "transform 120ms ease-out",
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className={`relative z-0 object-contain ${canPan ? "select-none" : ""}`}
            sizes="100vw"
            priority
            unoptimized={unoptimized}
            draggable={false}
            aria-describedby={watermarkId}
          />
          <div
            id={watermarkId}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 px-2 text-center"
          >
            <p className="text-balance text-[11px] font-normal leading-snug tracking-[0.03em] text-white/88 sm:text-xs [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.65),0_0_1px_rgba(0,0,0,0.8)]">
              {watermarkLine1}
            </p>
            <p className="max-w-[18rem] text-[10px] font-normal leading-snug text-white/75 sm:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.55)]">
              {watermarkLine2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryImageLightbox({
  open,
  photos,
  index,
  onClose,
  onPrev,
  onNext,
  title,
}: Props) {
  const copyrightNoticeId = useId();
  const safeIdx = photos.length ? Math.min(Math.max(index, 0), photos.length - 1) : 0;
  const current = photos[safeIdx];

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [open, onClose, onPrev, onNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);


  if (typeof document === "undefined") return null;
  if (!photos.length) return null;

  const unopt = current?.src.startsWith("data:") ?? false;

  return createPortal(
    <AnimatePresence>
      {open && current ? (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={`Pratinjau foto galeri — ${title}`}
          aria-describedby={copyrightNoticeId}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          key="gallery-lb-backdrop"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#030712]/92 backdrop-blur-[2px]"
            aria-label="Tutup"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1220] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06]">
              <ZoomableLightboxImage
                key={`${safeIdx}-${current.src}`}
                src={current.src}
                alt={current.alt}
                unoptimized={unopt}
                watermarkId={copyrightNoticeId}
                watermarkLine1={siteImageCopyrightCaptionOverlay(current.src)}
                watermarkLine2={SITE_IMAGE_COPYRIGHT_NOTICE}
              />

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className="absolute left-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-lg text-white shadow-lg backdrop-blur-sm transition-[background-color,transform] hover:bg-black/70 motion-safe:active:scale-[0.97] sm:left-4 sm:size-12"
                    aria-label="Foto sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="absolute right-2 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-lg text-white shadow-lg backdrop-blur-sm transition-[background-color,transform] hover:bg-black/70 motion-safe:active:scale-[0.97] sm:right-4 sm:size-12"
                    aria-label="Foto berikutnya"
                  >
                    ›
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="absolute right-2 top-2 z-20 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-xl leading-none text-white backdrop-blur-sm transition-colors hover:bg-black/75 sm:right-3 sm:top-3"
                aria-label="Tutup pratinjau"
              >
                ×
              </button>
            </div>

            <p className="mt-3 truncate text-center text-xs font-medium text-white/85 sm:text-sm">
              {current.alt}
              {photos.length > 1 ? (
                <span className="text-white/45"> · {safeIdx + 1} / {photos.length}</span>
              ) : null}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

