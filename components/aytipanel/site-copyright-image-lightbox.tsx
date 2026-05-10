"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  isSiteSvgPath,
  SITE_IMAGE_COPYRIGHT_NOTICE,
  siteImageCopyrightCaptionOverlay,
} from "@/components/aytipanel/site-image-copyright";
import { useTouchSafeButtonActivate } from "@/components/aytipanel/use-touch-safe-button-activate";

export type SiteCopyrightImageLightboxProps = {
  src: string;
  alt: string;
  titleId: string;
  onClose: () => void;
  /** Judul aksesibilitas dialog (sr-only heading id = titleId). */
  srHeading?: string;
};

export function SiteCopyrightImageLightbox({
  src,
  alt,
  titleId,
  onClose,
  srHeading = "Pratinjau gambar",
}: SiteCopyrightImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [screenshotNoticeVisible, setScreenshotNoticeVisible] = useState(false);

  const closeStable = useCallback(() => {
    onClose();
  }, [onClose]);

  const [backdropBind, backdropActivateClick] = useTouchSafeButtonActivate(closeStable);
  const [closeBind, closeActivateClick] = useTouchSafeButtonActivate(closeStable);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const focusId = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    let hideBannerTimer: ReturnType<typeof setTimeout> | undefined;

    const isLikelyScreenshotChord = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") return true;
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!isLikelyScreenshotChord(e)) return;
      setScreenshotNoticeVisible(true);
      if (hideBannerTimer !== undefined) clearTimeout(hideBannerTimer);
      hideBannerTimer = setTimeout(() => {
        setScreenshotNoticeVisible(false);
        hideBannerTimer = undefined;
      }, 220);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.cancelAnimationFrame(focusId);
      window.removeEventListener("keydown", onKeyDown);
      if (hideBannerTimer !== undefined) clearTimeout(hideBannerTimer);
    };
  }, [onClose]);

  const node = (
    <div
      className="site-copyright-lightbox layanan-lightbox fixed inset-0 z-[11000] touch-manipulation supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        ref={backdropBind}
        type="button"
        className="absolute inset-0 z-0 touch-manipulation border-0 bg-black/88 p-0 backdrop-blur-[10px]"
        onClick={backdropActivateClick}
        aria-label="Tutup pratinjau gambar"
      />

      {screenshotNoticeVisible ? (
        <div
          className="pointer-events-none absolute inset-0 z-[240] flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
          role="status"
          aria-live="assertive"
        >
          <p className="max-w-[min(100%,24rem)] px-6 text-center text-[clamp(1rem,4vw,1.35rem)] font-semibold leading-snug text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.95),0_0_40px_rgba(0,0,0,0.85)]">
            {SITE_IMAGE_COPYRIGHT_NOTICE}
          </p>
        </div>
      ) : null}

      <button
        ref={(node) => {
          closeBind(node);
          closeRef.current = node;
        }}
        type="button"
        className="absolute right-3 top-3 z-[300] min-h-[44px] touch-manipulation rounded-lg border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[13px] font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 md:right-5 md:top-5 md:min-h-0 md:px-4 md:text-sm"
        onClick={closeActivateClick}
      >
        Tutup
      </button>

      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-4 py-14 md:px-8 md:py-16">
        <div
          className="layanan-lightbox-asset pointer-events-auto relative mx-auto w-fit max-w-full select-none"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          <h2 id={titleId} className="sr-only">
            {srHeading}
          </h2>
          {isSiteSvgPath(src) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              width={1920}
              height={1280}
              draggable={false}
              className="relative z-0 mx-auto max-h-[min(82vh,820px)] h-auto w-auto max-w-full rounded-xl border border-white/12 object-contain shadow-2xl"
              aria-describedby={`${titleId}-copyright`}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1280}
              draggable={false}
              className="relative z-0 mx-auto max-h-[min(82vh,820px)] h-auto w-auto max-w-full rounded-xl border border-white/12 object-contain shadow-2xl"
              sizes="100vw"
              priority
              aria-describedby={`${titleId}-copyright`}
            />
          )}
          <div
            id={`${titleId}-copyright`}
            className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1 px-3 text-center"
          >
            <p className="text-balance text-[11px] font-normal leading-snug tracking-[0.03em] text-white/88 sm:text-xs [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.65),0_0_1px_rgba(0,0,0,0.8)]">
              {siteImageCopyrightCaptionOverlay(src)}
            </p>
            <p className="max-w-[min(100%,18rem)] text-[10px] font-normal leading-snug tracking-[0.02em] text-white/75 sm:max-w-md sm:text-[11px] [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(0,0,0,0.55)]">
              {SITE_IMAGE_COPYRIGHT_NOTICE}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
