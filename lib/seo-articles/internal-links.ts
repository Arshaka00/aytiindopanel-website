import type { SeoArticle } from "@/lib/seo-articles/types";

/**
 * Menautkan frase kunci artikel lain (primaryKeyword) ke `/artikel/{slug}`.
 * Melewati baris heading; satu kali per frase untuk seluruh dokumen.
 */
export function injectMarkdownInternalLinks(
  markdown: string,
  currentSlug: string,
  articles: SeoArticle[],
): string {
  const targets = articles
    .filter((a) => a.published && a.slug !== currentSlug && a.primaryKeyword.trim())
    .map((a) => ({ slug: a.slug, phrase: a.primaryKeyword.trim() }))
    .sort((a, b) => b.phrase.length - a.phrase.length);

  let result = markdown;
  for (const { slug, phrase } of targets) {
    const lines = result.split("\n");
    const rebuilt: string[] = [];
    let linked = false;
    for (const line of lines) {
      if (linked || line.startsWith("#")) {
        rebuilt.push(line);
        continue;
      }
      if (line.includes("](/artikel/")) {
        rebuilt.push(line);
        continue;
      }
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${escaped})`, "i");
      if (re.test(line)) {
        const next = line.replace(re, (_m, g1: string) => `[${g1}](/artikel/${slug})`);
        rebuilt.push(next);
        linked = true;
      } else {
        rebuilt.push(line);
      }
    }
    result = rebuilt.join("\n");
  }
  return result;
}
