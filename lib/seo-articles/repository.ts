import "server-only";

import { readSeoArticlesFile } from "@/lib/seo-articles/storage";
import type { SeoArticle } from "@/lib/seo-articles/types";
import { isSeoFriendlySlug } from "@/lib/seo-articles/slug";

function sortPublished(a: SeoArticle, b: SeoArticle): number {
  const ta = new Date(a.publishedAt).getTime();
  const tb = new Date(b.publishedAt).getTime();
  return tb - ta;
}

export async function listPublishedSeoArticles(): Promise<SeoArticle[]> {
  const file = await readSeoArticlesFile();
  return file.articles.filter((a) => a.published).sort(sortPublished);
}

export async function getPublishedSeoArticleBySlug(slug: string): Promise<SeoArticle | null> {
  if (!isSeoFriendlySlug(slug)) return null;
  const file = await readSeoArticlesFile();
  const hit = file.articles.find((a) => a.slug === slug && a.published);
  return hit ?? null;
}

export async function getAllSeoArticlesForAdmin(): Promise<SeoArticle[]> {
  const file = await readSeoArticlesFile();
  return [...file.articles].sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getPublishedSeoArticleSlugs(): Promise<string[]> {
  const list = await listPublishedSeoArticles();
  return list.map((a) => a.slug);
}

export async function loadPublishedSeoArticleContext(
  slug: string,
): Promise<{ article: SeoArticle | null; published: SeoArticle[] }> {
  if (!isSeoFriendlySlug(slug)) return { article: null, published: [] };
  const file = await readSeoArticlesFile();
  const published = file.articles.filter((a) => a.published).sort(sortPublished);
  const article = published.find((a) => a.slug === slug) ?? null;
  return { article, published };
}
