import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { buildLayananPageExports } from "@/lib/layanan-pages/route";
import { resolveServicePublicPath } from "@/lib/seo-service-paths";
import { isSeoRootServiceLayananSlug } from "@/lib/seo-services";
import {
  getPublishedLayananPageBySlug,
  getPublishedLayananPageSlugs,
} from "@/lib/layanan-pages/repository";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedLayananPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { generateMetadata: gm } = buildLayananPageExports(slug);
  return gm();
}

export default async function ArtikelLayananDetailPage({ params }: Props) {
  const { slug } = await params;
  if (isSeoRootServiceLayananSlug(slug)) {
    redirect(resolveServicePublicPath(slug));
  }
  const published = await getPublishedLayananPageBySlug(slug);
  if (!published) notFound();
  const { default: Page } = buildLayananPageExports(slug);
  return <Page />;
}
