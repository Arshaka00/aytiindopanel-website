"use client";

import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";

type Props = {
  imageSrc: string;
  alt: string;
  frameClassName: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductDetailHeroImage({
  imageSrc,
  alt,
  frameClassName,
  priority = false,
  sizes = "(max-width: 896px) 100vw, 896px",
}: Props) {
  return (
    <div className={frameClassName}>
      <SiteCopyrightImagePreview
        fill
        src={imageSrc}
        alt={alt}
        priority={priority}
        sizes={sizes}
        buttonClassName="absolute inset-0 block h-full w-full min-h-0"
        imageClassName="object-cover"
      />
    </div>
  );
}
