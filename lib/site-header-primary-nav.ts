/**
 * Item yang ditampilkan di navbar utama konsumen — tanpa halaman SEO mendalam / artikel
 * (routing tetap lewat URL, sitemap, pencarian).
 */
export const PRIMARY_HEADER_NAV_IDS = [
  "nav-home",
  "nav-tentang",
  "nav-layanan",
  "nav-produk",
  "nav-service",
  "nav-proyek",
  "nav-kontak",
  "nav-gallery-proyek",
] as const;

export type PrimaryHeaderNavId = (typeof PRIMARY_HEADER_NAV_IDS)[number];

type NavRow = {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
};

export function pickPrimaryHeaderNav(navItems: readonly NavRow[], defaults: readonly NavRow[]): NavRow[] {
  const byId = new Map(navItems.map((i) => [i.id, i]));
  const defById = new Map(defaults.map((i) => [i.id, i]));
  const out: NavRow[] = [];
  for (const id of PRIMARY_HEADER_NAV_IDS) {
    const merged = byId.get(id);
    const def = defById.get(id);
    if (!def) continue;
    const m = merged ?? def;
    out.push({
      id,
      label: (m.label?.trim() || def.label).trim() || def.label,
      shortLabel: (m.shortLabel?.trim() || def.shortLabel).trim() || def.shortLabel,
      href: (m.href?.trim() || def.href).trim() || def.href,
    });
  }
  return out;
}

export function primaryHeaderMobileNavIds(): readonly PrimaryHeaderNavId[] {
  return PRIMARY_HEADER_NAV_IDS;
}
