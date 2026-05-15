import "server-only";

import { resolveLayananPageFromSiteContent } from "@/lib/layanan-pages/cms-merge";
import { readLayananPagesFile } from "@/lib/layanan-pages/storage";
import type { LayananPageRecord } from "@/lib/layanan-pages/types";
import {
  getServicePageBySlug,
  type ServicePageDef,
} from "@/lib/service-pages";
import { isSeoFriendlySlug } from "@/lib/seo-articles/slug";
import { getSiteContent } from "@/lib/site-content";

export type PublishedLayananPage = ServicePageDef & {
  record: LayananPageRecord;
  cmsPageIndex: number;
  showPortfolioSection: boolean;
};

function sortPublished(a: LayananPageRecord, b: LayananPageRecord): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export async function listPublishedLayananPageRecords(): Promise<LayananPageRecord[]> {
  const file = await readLayananPagesFile();
  return file.pages.filter((p) => p.published).sort(sortPublished);
}

export async function listPublishedLayananPages(): Promise<PublishedLayananPage[]> {
  const [records, content] = await Promise.all([listPublishedLayananPageRecords(), getSiteContent()]);
  const out: PublishedLayananPage[] = [];
  for (const record of records) {
    const def = getServicePageBySlug(record.slug);
    if (!def) continue;
    const merged = resolveLayananPageFromSiteContent(def, content.layananPages);
    out.push({ ...merged, record });
  }
  return out;
}

export async function getPublishedLayananPageSlugs(): Promise<string[]> {
  const records = await listPublishedLayananPageRecords();
  return records.map((p) => p.slug);
}

export async function getPublishedLayananPageBySlug(
  slug: string,
): Promise<PublishedLayananPage | null> {
  if (!isSeoFriendlySlug(slug)) return null;
  const file = await readLayananPagesFile();
  const record = file.pages.find((p) => p.slug === slug && p.published);
  if (!record) return null;
  const def = getServicePageBySlug(slug);
  if (!def) return null;
  const content = await getSiteContent();
  const merged = resolveLayananPageFromSiteContent(def, content.layananPages);
  return { ...merged, record };
}
