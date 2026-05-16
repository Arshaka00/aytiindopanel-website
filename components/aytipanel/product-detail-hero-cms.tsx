"use client";

import { ProductDetailHeroImage } from "@/components/aytipanel/product-detail-hero-image";
import { CmsImage } from "@/components/site-cms/cms-image";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

const HERO_IMAGE_SIZES = "(max-width: 896px) 50vw, 360px";

/** Tinggi minimum kontainer CMS — selaras dengan `frameClassName` di halaman detail. */
const CMS_IMAGE_MIN_H =
  "min-h-[7.5rem] w-full sm:min-h-[12.5rem] md:min-h-[15rem] lg:min-h-[17.5rem]";

type Props = {
  slug: string;
  imageSrc: string;
  imageSrc2: string;
  alt: string;
  alt2: string;
  frameClassName: string;
};

export function ProductDetailHeroCms({
  slug,
  imageSrc,
  imageSrc2,
  alt,
  alt2,
  frameClassName,
}: Props) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  const gridClass = "mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 sm:gap-3 md:max-w-4xl";

  if (!edit) {
    return (
      <div className={gridClass}>
        <ProductDetailHeroImage
          imageSrc={imageSrc}
          alt={alt}
          frameClassName={frameClassName}
          priority
          sizes={HERO_IMAGE_SIZES}
        />
        <ProductDetailHeroImage
          imageSrc={imageSrc2}
          alt={alt2}
          frameClassName={frameClassName}
          sizes={HERO_IMAGE_SIZES}
        />
      </div>
    );
  }

  return (
    <div className={gridClass}>
      <div className={frameClassName}>
        <CmsImage
          srcPath={`productPageOverrides.${slug}.imageSrc`}
          src={imageSrc}
          alt={alt}
          fill
          sizes={HERO_IMAGE_SIZES}
          priority
          uploadScope="produk"
          uploadSegment={`detail-${slug}`}
          className={`relative block h-full ${CMS_IMAGE_MIN_H}`}
          imageClassName="object-cover"
        />
      </div>
      <div className={frameClassName}>
        <CmsImage
          srcPath={`productPageOverrides.${slug}.imageSrc2`}
          src={imageSrc2}
          alt={alt2}
          fill
          sizes={HERO_IMAGE_SIZES}
          uploadScope="produk"
          uploadSegment={`detail-${slug}-2`}
          className={`relative block h-full ${CMS_IMAGE_MIN_H}`}
          imageClassName="object-cover"
        />
      </div>
    </div>
  );
}
