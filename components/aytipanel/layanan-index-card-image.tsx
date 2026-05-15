"use client";

import Image from "next/image";

import { CmsImage } from "@/components/site-cms/cms-image";
import { layananPageCmsPath } from "@/lib/layanan-pages/cms-merge";

/** Thumbnail kartu indeks — memakai gambar hero halaman (satu foto penting per layanan). */
export function LayananIndexCardImage({
  cmsPageIndex,
  src,
  alt,
}: {
  cmsPageIndex: number;
  src: string;
  alt: string;
}) {
  const className = "object-cover transition duration-500 group-hover:scale-[1.02]";
  if (cmsPageIndex < 0) {
    return <Image src={src} alt={alt} fill className={className} sizes="(max-width: 768px) 100vw, 50vw" />;
  }
  return (
    <CmsImage
      srcPath={layananPageCmsPath(cmsPageIndex, "heroImageSrc")}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      uploadScope="layanan"
      uploadSegment={`index-${cmsPageIndex}`}
      className={className}
      imageClassName={className}
      enableZoom={false}
    />
  );
}
