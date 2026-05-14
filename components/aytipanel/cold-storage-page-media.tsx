"use client";

import { CmsImage } from "@/components/site-cms/cms-image";

const HERO_SRC_PATH = "coldStoragePage.heroImageSrc" as const;

/** Hero `/cold-storage` — sumber gambar dari `SiteContent.coldStoragePage` + unggah CMS (`scope=coldStorage`). */
export function ColdStoragePageHeroImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <CmsImage
      srcPath={HERO_SRC_PATH}
      src={src}
      alt={alt}
      fill
      priority
      sizes="100vw"
      uploadScope="coldStorage"
      className="absolute inset-0 z-[1] block h-full min-h-[500px] w-full md:min-h-full"
      imageClassName="object-cover"
      enableZoom
    />
  );
}

/** Kartu ilustrasi portfolio di halaman yang sama — memakai path gambar yang sama agar satu unggahan memperbarui hero + kartu. */
export function ColdStoragePageCardImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <CmsImage
      srcPath={HERO_SRC_PATH}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      uploadScope="coldStorage"
      className="absolute inset-0 block size-full"
      imageClassName="object-cover"
      enableZoom={false}
    />
  );
}
