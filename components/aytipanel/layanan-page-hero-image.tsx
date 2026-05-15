"use client";

import Image from "next/image";

import { CmsImage } from "@/components/site-cms/cms-image";
import { layananPageCmsPath } from "@/lib/layanan-pages/cms-merge";

const imgClass = "object-cover object-center";

/** Satu foto hero per halaman layanan — editable lewat CMS bila `cmsPageIndex` valid. */
export function LayananPageHeroImage({
  cmsPageIndex,
  src,
  alt,
}: {
  cmsPageIndex: number;
  src: string;
  alt: string;
}) {
  if (cmsPageIndex < 0) {
    return <Image src={src} alt={alt} fill priority className={imgClass} sizes="100vw" />;
  }
  return (
    <CmsImage
      srcPath={layananPageCmsPath(cmsPageIndex, "heroImageSrc")}
      src={src}
      alt={alt}
      fill
      priority
      sizes="100vw"
      uploadScope="layanan"
      uploadSegment={`halaman-${cmsPageIndex}`}
      className={imgClass}
      imageClassName={imgClass}
      enableZoom
    />
  );
}
