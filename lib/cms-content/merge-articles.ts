import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { CONTENT_CMS_ROOT } from "@/lib/cms-content/paths";
import type { SeoArticle, SeoArticlesFile } from "@/lib/seo-articles/types";

function isSafeJsonBasename(name: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]+\.json$/.test(name) && !name.startsWith("_");
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

function coerceNewArticleFromDisk(slug: string, parsed: Partial<SeoArticle>): SeoArticle | null {
  if (typeof parsed.title !== "string" || !parsed.title.trim()) return null;
  if (typeof parsed.bodyMarkdown !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: typeof parsed.id === "string" && parsed.id.trim() ? parsed.id.trim() : slug,
    slug,
    title: parsed.title.trim(),
    deck: typeof parsed.deck === "string" ? parsed.deck : "",
    primaryKeyword:
      typeof parsed.primaryKeyword === "string" ? parsed.primaryKeyword.trim() || slug : slug,
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter((x) => typeof x === "string").map(String) : [],
    heroImage:
      typeof parsed.heroImage === "string" && parsed.heroImage.trim()
        ? parsed.heroImage.trim()
        : "",
    published: parsed.published === true,
    publishedAt: typeof parsed.publishedAt === "string" && parsed.publishedAt ? parsed.publishedAt : now,
    updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt ? parsed.updatedAt : now,
    authorName:
      typeof parsed.authorName === "string" && parsed.authorName.trim()
        ? parsed.authorName.trim()
        : "PT AYTI INDO PANEL",
    metaTitle:
      typeof parsed.metaTitle === "string" && parsed.metaTitle.trim()
        ? parsed.metaTitle.trim()
        : parsed.title.trim(),
    metaDescription:
      typeof parsed.metaDescription === "string"
        ? parsed.metaDescription.trim() || `${parsed.title.trim()} — PT AYTI INDO PANEL.`
        : `${parsed.title.trim()} — PT AYTI INDO PANEL.`,
    bodyMarkdown: parsed.bodyMarkdown,
    faq: Array.isArray(parsed.faq) ? (parsed.faq as SeoArticle["faq"]) : [],
    relatedSlugs: Array.isArray(parsed.relatedSlugs)
      ? parsed.relatedSlugs.filter((x) => typeof x === "string")
      : [],
  };
}

/**
 * Menggabungkan artikel dari `content/cms/articles/*.json` ke dalam payload `live.json`.
 * Untuk slug yang ada: overwrite field yang ada di JSON file.
 * Untuk slug baru: file harus memiliki minimal `title` + `bodyMarkdown` (SEO siap pakai opsional lain).
 */
export async function mergeCmsFolderArticlesInto(file: SeoArticlesFile): Promise<SeoArticlesFile> {
  const dir = path.join(CONTENT_CMS_ROOT, "articles");
  let names: string[] = [];
  try {
    names = await readdir(dir);
  } catch {
    return file;
  }

  const bySlug = new Map(file.articles.map((a) => [a.slug, { ...a }]));

  for (const name of names) {
    if (!isSafeJsonBasename(name)) continue;
    const full = path.join(dir, name);
    try {
      const raw = await readFile(full, "utf8");
      const parsed = JSON.parse(raw) as Partial<SeoArticle> & { slug?: string };
      let slug =
        typeof parsed.slug === "string" && /^[\da-z]+(?:-[\da-z]+)*$/i.test(parsed.slug.trim())
          ? parsed.slug.trim()
          : path.basename(name, ".json");

      slug = /^[\da-z]+(?:-[\da-z]+)*$/i.test(slug) ? slug : "";
      if (!slug) continue;

      const diskPatch = stripUndefined(parsed as Record<string, unknown>) as Partial<SeoArticle>;
      const prev = bySlug.get(slug);
      if (prev) {
        bySlug.set(slug, {
          ...prev,
          slug,
          ...diskPatch,
        });
      } else {
        const next = coerceNewArticleFromDisk(slug, parsed);
        if (next) bySlug.set(slug, next);
      }
    } catch {
      /** lewati file rusak */
    }
  }

  return {
    ...file,
    articles: [...bySlug.values()],
  };
}
