import { slugifyHeading } from "@/lib/seo-articles/slug";
import type { SeoArticleTocItem } from "@/lib/seo-articles/types";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInline(raw: string): string {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    const bold = raw.indexOf("**", i);
    const linkStart = raw.indexOf("[", i);
    const nextBold = bold === -1 ? Infinity : bold;
    const nextLink = linkStart === -1 ? Infinity : linkStart;
    const next = Math.min(nextBold, nextLink);
    if (next === Infinity) {
      out += escapeHtml(raw.slice(i));
      break;
    }
    if (next === nextBold) {
      out += escapeHtml(raw.slice(i, bold));
      const end = raw.indexOf("**", bold + 2);
      if (end === -1) {
        out += escapeHtml(raw.slice(bold));
        break;
      }
      out += `<strong>${escapeHtml(raw.slice(bold + 2, end))}</strong>`;
      i = end + 2;
      continue;
    }
    out += escapeHtml(raw.slice(i, linkStart));
    const closeLabel = raw.indexOf("]", linkStart + 1);
    if (closeLabel === -1) {
      out += escapeHtml(raw.slice(linkStart));
      break;
    }
    if (raw[closeLabel + 1] !== "(") {
      out += escapeHtml(raw[linkStart] ?? "");
      i = linkStart + 1;
      continue;
    }
    const closeHref = raw.indexOf(")", closeLabel + 2);
    if (closeHref === -1) {
      out += escapeHtml(raw.slice(linkStart));
      break;
    }
    const label = raw.slice(linkStart + 1, closeLabel);
    const href = raw.slice(closeLabel + 2, closeHref).trim();
    const safeHref =
      href.startsWith("/") && !href.startsWith("//")
        ? href
        : /^https?:\/\//i.test(href)
          ? href
          : "";
    if (!safeHref) {
      out += escapeHtml(raw.slice(linkStart, closeHref + 1));
      i = closeHref + 1;
      continue;
    }
    out += `<a href="${escapeHtml(safeHref)}" class="seo-article-body__link">${escapeHtml(label)}</a>`;
    i = closeHref + 1;
  }
  return out;
}

export function parseMarkdownLite(markdown: string): { html: string; toc: SeoArticleTocItem[] } {
  const toc: SeoArticleTocItem[] = [];
  const usedIds = new Set<string>();
  const normalized = markdown.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n\n+/);
  const parts: string[] = [];
  for (const blockRaw of blocks) {
    const block = blockRaw.trim();
    if (!block) continue;
    const h3 = /^###\s+(.+)$/.exec(block);
    const h2 = /^##\s+(.+)$/.exec(block);
    if (h3) {
      const text = h3[1]!.trim();
      let id = slugifyHeading(text);
      while (usedIds.has(id)) id = `${id}-2`;
      usedIds.add(id);
      toc.push({ id, level: 3, text });
      parts.push(`<h3 id="${escapeHtml(id)}" class="seo-article-body__h3">${parseInline(text)}</h3>`);
      continue;
    }
    if (h2) {
      const text = h2[1]!.trim();
      let id = slugifyHeading(text);
      while (usedIds.has(id)) id = `${id}-2`;
      usedIds.add(id);
      toc.push({ id, level: 2, text });
      parts.push(`<h2 id="${escapeHtml(id)}" class="seo-article-body__h2">${parseInline(text)}</h2>`);
      continue;
    }
    const inner = block
      .split("\n")
      .map((ln) => parseInline(ln.trim()))
      .join("<br />\n");
    parts.push(`<p class="seo-article-body__p">${inner}</p>`);
  }
  return { html: parts.join("\n"), toc };
}

export function parseMarkdownLiteInline(markdown: string): string {
  return parseInline(markdown.trim());
}
