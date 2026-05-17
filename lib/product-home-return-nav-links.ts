import { getProductBySlug } from "@/components/aytipanel/products-catalog";
import { buildProductDetailHref } from "@/components/aytipanel/product-navigation";
import type { ProductB2BCardData } from "@/components/aytipanel/products-b2b-data";
import {
  type FeaturedProductListingSectionId,
  getProductSlugsForHomeReturnSection,
} from "@/lib/product-listing-sections";

export type ProductHomeReturnNavLink = {
  slug: string;
  href: string;
  label: string;
};

/**
 * Tautan navigasi detail dari daftar slug resmi grup + label kartu/katalog.
 * Urutan mengikuti `PRODUCT_HOME_RETURN_GROUPS`.
 */
export function buildProductHomeReturnNavLinks(
  sectionId: FeaturedProductListingSectionId,
  cards: readonly ProductB2BCardData[] = [],
): ProductHomeReturnNavLink[] {
  const cardBySlug = new Map(
    cards.filter((c): c is ProductB2BCardData & { slug: string } => Boolean(c.slug)).map(
      (c) => [c.slug, c] as const,
    ),
  );

  return getProductSlugsForHomeReturnSection(sectionId).map((slug) => {
    const card = cardBySlug.get(slug);
    const catalog = getProductBySlug(slug);
    return {
      slug,
      href: buildProductDetailHref(slug),
      label: card?.title ?? catalog?.title ?? slug,
    };
  });
}
