"use client";

import { SiteCopyrightImagePreview } from "@/components/aytipanel/site-copyright-image-preview";

type Props = {
  imageSrc: string;
  alt: string;
  frameClassName: string;
};

export function ProductDetailHeroImage({ imageSrc, alt, frameClassName }: Props) {
  return (
    <div className={frameClassName}>
      <SiteCopyrightImagePreview
        fill
        src={imageSrc}
        alt={alt}
        priority
        sizes="(max-width: 896px) 100vw, 896px"
        buttonClassName="absolute inset-0 block h-full w-full min-h-0"
        imageClassName="object-cover"
      />
    </div>
  );
}
