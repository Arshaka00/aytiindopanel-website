import type { SiteContent } from "@/lib/site-content-model";

/** Urutan default section beranda — selaras dengan `id` elemen section. */
export const DEFAULT_HOME_SECTION_ORDER: string[] = [
  "beranda",
  "tentang",
  "layanan",
  "produk",
  "service-maintenance",
  "proyek",
  "customers-partners",
  "keunggulan",
  "faq",
  "kontak",
];

export const DEFAULT_HOME_LAYOUT: NonNullable<SiteContent["homeLayout"]> = {
  sectionOrder: [...DEFAULT_HOME_SECTION_ORDER],
  hiddenSections: [],
};
