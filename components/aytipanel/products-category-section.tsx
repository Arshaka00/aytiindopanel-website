import type { ProductB2BCategoryData } from "@/components/aytipanel/products-b2b-data";
import { ProductB2BCard } from "@/components/aytipanel/product-b2b-card";
import { CmsText } from "@/components/site-cms/cms-text";
import type { SiteContent } from "@/lib/site-content-model";
import { FeaturedProdukAccessoriesSection } from "@/components/aytipanel/featured-produk-accessories-section";
import { FeaturedProdukSolusiSection } from "@/components/aytipanel/featured-produk-solusi-section";
import { FeaturedProdukUtamaSection } from "@/components/aytipanel/featured-produk-utama-section";
import {
  GAMBAR_PRODUK_ACCESSORIES_KANAN,
  GAMBAR_PRODUK_ACCESSORIES_KIRI,
  GAMBAR_PRODUK_SOLUSI_KANAN,
  GAMBAR_PRODUK_SOLUSI_KIRI,
  GAMBAR_PRODUK_UTAMA_KANAN,
  GAMBAR_PRODUK_UTAMA_KIRI,
} from "@/components/aytipanel/gambar-produk-paths";
import {
  lightEyebrow,
  lightHeading,
  lightLead,
  lightSectionContentStack,
  lightSectionHeaderStack,
  lightSectionMax,
  lightSectionY,
  lightSurfaceBandWarm,
  lightSurfaceBandWhite,
} from "@/components/aytipanel/light-section-ui";

type Props = {
  category: ProductB2BCategoryData;
  tone: "muted" | "surface";
  categoryIndex: number;
  featuredImages: SiteContent["produk"]["featuredImages"];
};

/** Latar kategori produk: mengikuti tema; kartu produk tetap gelap (dark-card). */
export function ProductsCategorySection({ category, tone, categoryIndex, featuredImages }: Props) {
  const safeFeaturedImages = featuredImages ?? {
    utama: {
      leftSrc: GAMBAR_PRODUK_UTAMA_KIRI,
      rightSrc: GAMBAR_PRODUK_UTAMA_KANAN,
      leftAlt: "Produk utama kiri",
      rightAlt: "Produk utama kanan",
    },
    solusi: {
      leftSrc: GAMBAR_PRODUK_SOLUSI_KIRI,
      rightSrc: GAMBAR_PRODUK_SOLUSI_KANAN,
      leftAlt: "Produk solusi kiri",
      rightAlt: "Produk solusi kanan",
    },
    accessories: {
      leftSrc: GAMBAR_PRODUK_ACCESSORIES_KIRI,
      rightSrc: GAMBAR_PRODUK_ACCESSORIES_KANAN,
      leftAlt: "Produk accessories kiri",
      rightAlt: "Produk accessories kanan",
    },
  };

  if (category.id === "produk-utama") {
    return (
      <FeaturedProdukUtamaSection
        category={category}
        categoryIndex={categoryIndex}
        tone={tone}
        featuredImages={safeFeaturedImages.utama}
      />
    );
  }

  if (category.id === "produk-solusi") {
    return (
      <FeaturedProdukSolusiSection
        category={category}
        categoryIndex={categoryIndex}
        tone={tone}
        featuredImages={safeFeaturedImages.solusi}
      />
    );
  }

  if (category.id === "produk-accessories") {
    return (
      <FeaturedProdukAccessoriesSection
        category={category}
        categoryIndex={categoryIndex}
        tone={tone}
        featuredImages={safeFeaturedImages.accessories}
      />
    );
  }

  const band =
    tone === "muted" ? lightSurfaceBandWarm : lightSurfaceBandWhite;

  return (
    <section
      id={category.id}
      className={`scroll-mt-[var(--section-nav-pass)] ${band} ${lightSectionY}`}
      aria-labelledby={`${category.id}-heading`}
    >
      <div className={`${lightSectionMax} ${lightSectionContentStack}`}>
        <header
          className={`relative mx-auto max-w-3xl text-center md:mx-0 md:max-w-[44rem] md:text-left ${lightSectionHeaderStack}`}
        >
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-4">
            <p className={`${lightEyebrow} md:text-xs`}>
              <CmsText
                path={`produk.categories.${categoryIndex}.eyebrow`}
                text={category.eyebrow}
                as="span"
              />
            </p>
            <span
              className="hidden h-px w-12 shrink-0 bg-accent/30 md:block"
              aria-hidden
            />
          </div>
          <h2 id={`${category.id}-heading`} className={lightHeading}>
            <CmsText
              path={`produk.categories.${categoryIndex}.title`}
              text={category.title}
              as="span"
            />
          </h2>
          <p className={`mx-auto max-w-2xl md:mx-0 ${lightLead}`}>
            <CmsText
              path={`produk.categories.${categoryIndex}.description`}
              text={category.description}
              as="span"
            />
          </p>
          <div
            className="mx-auto h-px max-w-[5rem] bg-gradient-to-r from-transparent via-accent/35 to-transparent pt-1 md:mx-0"
            aria-hidden
          />
        </header>

        <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-5 md:grid-cols-3 md:gap-5 lg:gap-6">
          {category.cards.map((card, cardIndex) => (
            <ProductB2BCard
              key={card.title}
              card={card}
              staggerIndex={cardIndex}
              listingReturnAnchor={category.id}
              imageSrcPath={`produk.categories.${categoryIndex}.cards.${cardIndex}.imageSrc`}
              cmsCardPathPrefix={`produk.categories.${categoryIndex}.cards.${cardIndex}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
