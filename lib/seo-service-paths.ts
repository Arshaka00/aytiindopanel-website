import { getSeoRootServiceByLayananSlug } from "@/lib/seo-services";
import { layananPagePath } from "@/lib/service-pages";

/** Path publik halaman layanan: root untuk layanan SEO inti, artikel untuk sisanya. */
export function resolveServicePublicPath(layananSlug: string): string {
  const root = getSeoRootServiceByLayananSlug(layananSlug);
  if (root) return `/${root.urlSlug}`;
  return layananPagePath(layananSlug);
}

export function serviceCityPagePath(slug: string): string {
  return `/${slug}`;
}
