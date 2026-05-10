"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";

import {
  isSiteSvgPath,
  shouldUseSiteImageViewer,
} from "@/components/aytipanel/site-image-copyright";
import { SiteCopyrightImageLightbox } from "@/components/aytipanel/site-copyright-image-lightbox";
import { useTouchSafeButtonActivate } from "@/components/aytipanel/use-touch-safe-button-activate";
import { mergeAytiMediaClass } from "@/lib/ayti-icon-cold";

type Common = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** Label tombol / dialog (aksi: buka tampilan gambar). */
  viewAriaLabel?: string;
  /** @deprecated Pakai `viewAriaLabel` */
  zoomAriaLabel?: string;
  /** Kelas pada tombol pembungkus (wajib relative + ukuran jika fill). */
  buttonClassName?: string;
  imageClassName: string;
};

type FillProps = Common & {
  fill: true;
};

type FixedProps = Common & {
  fill?: false;
  width: number;
  height: number;
};

export type SiteCopyrightImagePreviewProps = FillProps | FixedProps;

function PreviewFixedRasterChild(props: {
  src: string;
  width: number;
  height: number;
  imageClassName: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { src, width, height, imageClassName, sizes, priority } = props;
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      className={imageClassName}
      sizes={sizes}
      priority={priority}
      aria-hidden
    />
  );
}

function PreviewFixedSvgChild(props: {
  src: string;
  width: number;
  height: number;
  imageClassName: string;
}) {
  const { src, width, height, imageClassName } = props;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG lokal / mitra; perilaku konsisten di semua browser
    <img src={src} alt="" width={width} height={height} className={imageClassName} aria-hidden />
  );
}

/**
 * Gambar yang bisa diklik membuka viewer layar penuh (hak cipta).
 * Berlaku untuk aset `/images/`, URL raster ber-ekstensi, dan gambar Unsplash katalog.
 */
export function SiteCopyrightImagePreview(props: SiteCopyrightImagePreviewProps) {
  const {
    src,
    alt,
    sizes,
    priority,
    viewAriaLabel,
    zoomAriaLabel,
    buttonClassName,
    imageClassName,
  } = props;
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const activate = useCallback(() => setOpen(true), []);
  const [tapBind, tapActivate] = useTouchSafeButtonActivate(activate);

  const label = viewAriaLabel ?? zoomAriaLabel ?? `Lihat gambar: ${alt}`;
  const svg = isSiteSvgPath(src);
  const viewer = shouldUseSiteImageViewer(src);

  if (!viewer) {
    if ("fill" in props && props.fill) {
      return (
        <span className={mergeAytiMediaClass(`relative block ${buttonClassName ?? ""}`.trim())}>
          <Image
            src={src}
            alt={alt}
            fill
            className={imageClassName}
            sizes={sizes}
            priority={priority}
          />
        </span>
      );
    }
    const { width, height } = props as FixedProps;
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imageClassName}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <>
      <button
        ref={tapBind}
        type="button"
        className={mergeAytiMediaClass(
          `relative cursor-pointer touch-manipulation border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/85 focus-visible:ring-offset-2 ${buttonClassName ?? ""}`.trim(),
        )}
        onClick={tapActivate}
        aria-haspopup="dialog"
        aria-label={label}
      >
        {"fill" in props && props.fill ? (
          <span className="pointer-events-none absolute inset-0 block">
            {svg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className={`${imageClassName} h-full w-full object-cover`}
                aria-hidden
              />
            ) : (
              <Image
                src={src}
                alt=""
                fill
                className={imageClassName}
                sizes={sizes}
                priority={priority}
                aria-hidden
              />
            )}
          </span>
        ) : svg ? (
          <PreviewFixedSvgChild
            src={src}
            width={(props as FixedProps).width}
            height={(props as FixedProps).height}
            imageClassName={imageClassName}
          />
        ) : (
          <PreviewFixedRasterChild
            src={src}
            width={(props as FixedProps).width}
            height={(props as FixedProps).height}
            imageClassName={imageClassName}
            sizes={sizes}
            priority={priority}
          />
        )}
      </button>
      {open ? (
        <SiteCopyrightImageLightbox
          src={src}
          alt={alt}
          titleId={titleId}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
