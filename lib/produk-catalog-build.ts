import type { ProductB2BCardData } from "@/components/aytipanel/products-b2b-data";
import type { SiteContent } from "@/lib/site-content-model";

export type ProdukCatalogTile = {
  slug: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  /** Gambar kedua untuk kartu katalog (opsional). */
  imageSrcSecondary?: string;
  imageAltSecondary?: string;
};

/** Grup untuk chip filter & pencarian — key stabil dari CMS. */
export type ProdukCatalogListItem = ProdukCatalogTile & {
  sectionKey: string;
  /** Label pendek untuk chip (eyebrow atau judul grup). */
  sectionChipLabel: string;
};

function toTileFromCard(card: ProductB2BCardData & { slug: string }): ProdukCatalogTile {
  return {
    slug: card.slug,
    title: card.title,
    subtitle: card.subtitle,
    imageSrc: card.imageSrc,
    imageAlt: card.imageAlt?.trim() || card.title,
    imageSrcSecondary: card.imageSrcSecondary?.trim() || undefined,
    imageAltSecondary: card.imageAltSecondary?.trim() || undefined,
  };
}

/**
 * Satu daftar datar untuk UX filter/pencarian + metadata grup.
 * Sumber: kategori produk (CMS) → service & maintenance.
 */
export function buildProdukCatalogList(content: SiteContent): ProdukCatalogListItem[] {
  const out: ProdukCatalogListItem[] = [];

  for (const cat of content.produk.categories) {
    const chip = cat.eyebrow.trim() || cat.title;
    for (const card of cat.cards) {
      if (!card.slug?.trim()) continue;
      out.push({
        ...toTileFromCard(card as ProductB2BCardData & { slug: string }),
        sectionKey: cat.id,
        sectionChipLabel: chip,
      });
    }
  }

  const svcChip =
    content.serviceMaintenance.eyebrow.trim() || content.serviceMaintenance.title;
  for (const card of content.serviceMaintenance.cards) {
    if (!card.slug?.trim()) continue;
    out.push({
      ...toTileFromCard(card as ProductB2BCardData & { slug: string }),
      sectionKey: "service-maintenance",
      sectionChipLabel: svcChip,
    });
  }

  return out;
}

/** Urutan chip filter setelah "Semua" — konsisten UX katalog (bukan alfabet). */
const CATALOG_SECTION_FILTER_ORDER = [
  "produk-utama",
  "produk-solusi",
  "produk-accessories",
  "service-maintenance",
] as const;

export function catalogSectionFilters(items: ProdukCatalogListItem[]): {
  key: string;
  label: string;
}[] {
  const map = new Map<string, string>();
  for (const it of items) {
    if (!map.has(it.sectionKey)) map.set(it.sectionKey, it.sectionChipLabel);
  }

  const orderedKeys = new Set<string>(CATALOG_SECTION_FILTER_ORDER);
  const primary = CATALOG_SECTION_FILTER_ORDER.filter((key) => map.has(key)).map((key) => ({
    key,
    label: map.get(key)!,
  }));

  const extra = [...map.entries()]
    .filter(([key]) => !orderedKeys.has(key))
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));

  return [{ key: "all", label: "Semua" }, ...primary, ...extra];
}
