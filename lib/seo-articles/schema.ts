import { z } from "zod";

import { isSeoFriendlySlug } from "@/lib/seo-articles/slug";
import type { SeoArticle, SeoArticlesFile } from "@/lib/seo-articles/types";

const faqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answerMarkdown: z.string().min(1),
});

const articleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  deck: z.string(),
  primaryKeyword: z.string().min(1),
  tags: z.array(z.string()),
  heroImage: z.string(),
  published: z.boolean(),
  publishedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  authorName: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  bodyMarkdown: z.string().min(1),
  faq: z.array(faqItemSchema),
  relatedSlugs: z.array(z.string()),
});

const putSchema = z.object({
  version: z.literal(1),
  articles: z.array(articleSchema).min(1),
});

export function parseSeoArticlesPutBody(data: unknown): SeoArticlesFile {
  const parsed = putSchema.parse(data);
  const slugs = new Set<string>();
  for (const a of parsed.articles) {
    if (!isSeoFriendlySlug(a.slug)) {
      throw new Error(`Slug tidak valid (hanya huruf kecil, angka, tanda hubung): ${a.slug}`);
    }
    if (slugs.has(a.slug)) {
      throw new Error(`Slug duplikat: ${a.slug}`);
    }
    slugs.add(a.slug);
  }
  return { version: 1, updatedAt: "", articles: parsed.articles };
}

export type { SeoArticle };
