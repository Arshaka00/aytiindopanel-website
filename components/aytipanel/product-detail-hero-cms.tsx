"use client";

import { ProductDetailHeroImage } from "@/components/aytipanel/product-detail-hero-image";
import { CmsImage } from "@/components/site-cms/cms-image";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type Props = {
  slug: string;
  imageSrc: string;
  alt: string;
  frameClassName: string;
};

export function ProductDetailHeroCms({ slug, imageSrc, alt, frameClassName }: Props) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  if (!edit) {
    return <ProductDetailHeroImage imageSrc={imageSrc} alt={alt} frameClassName={frameClassName} />;
  }

  return (
    <div className={frameClassName}>
      <CmsImage
        srcPath={`productPageOverrides.${slug}.imageSrc`}
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 896px) 100vw, 896px"
        priority
        uploadScope="produk"
        uploadSegment={`detail-${slug}`}
        className="relative block h-full min-h-[170px] w-full sm:min-h-[300px] lg:min-h-[380px]"
        imageClassName="object-cover"
      />
    </div>
  );
}
