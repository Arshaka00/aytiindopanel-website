import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  renderLayananPage,
  resolveLayananPageCanonicalHref,
} from "@/lib/layanan-pages/render-layanan-page";
import { getPublishedLayananPageBySlug } from "@/lib/layanan-pages/repository";
import { resolveServicePublicPath } from "@/lib/seo-service-paths";
import { resolveServicePageMetadata } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/site-content";

export function buildLayananPageExports(slug: string) {
  async function generateMetadata(): Promise<Metadata> {
    const [content, published] = await Promise.all([
      getSiteContent(),
      getPublishedLayananPageBySlug(slug),
    ]);
    if (!published) notFound();
    const md = resolveServicePageMetadata(slug, content);
    if (!md) notFound();
    return md;
  }

  async function LayananPage() {
    const published = await getPublishedLayananPageBySlug(slug);
    if (!published) notFound();

    const canonicalHref = await resolveLayananPageCanonicalHref(
      slug,
      resolveServicePublicPath(slug),
    );

    return renderLayananPage({ layananSlug: slug, canonicalHref });
  }

  return { generateMetadata, default: LayananPage };
}
