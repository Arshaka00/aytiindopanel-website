import type { SiteContent } from "@/lib/site-content-model";
import type { SeoArticle } from "@/lib/seo-articles/types";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";
import { resolveOgImageUrl } from "@/lib/site-seo-resolve";

function toAbsoluteImage(origin: string, src: string): string {
  const t = src.trim();
  if (!t) return "";
  if (/\w+:\/\//.test(t)) return t;
  return absoluteUrlFromSite(origin, t.startsWith("/") ? t : `/${t}`);
}

export function buildSeoArticleArticleJsonLd(args: {
  article: SeoArticle;
  canonicalHref: string;
  content: SiteContent;
  wordCount: number;
  readingMinutes: number;
}): Record<string, unknown> {
  const { article, canonicalHref, content, wordCount, readingMinutes } = args;
  const ss = content.siteSettings;
  const origin = resolvePublicSiteOrigin(ss.siteUrl).origin;
  const siteName = ss.siteName.trim() || "PT AYTI INDO PANEL";
  const og = resolveOgImageUrl(content, "");
  const hero = article.heroImage.trim() ? toAbsoluteImage(origin, article.heroImage) : og;
  const published = article.publishedAt;
  const modified = article.updatedAt || article.publishedAt;

  const articleNode: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${canonicalHref}#article`,
    headline: article.title,
    description: article.metaDescription.trim() || article.deck,
    inLanguage: "id-ID",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalHref },
    datePublished: published,
    dateModified: modified,
    author: { "@type": "Person", name: article.authorName.trim() || siteName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: og },
    },
    keywords: [article.primaryKeyword, ...article.tags].filter(Boolean).join(", "),
    articleSection: "Refrigerasi industri",
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
  };
  if (hero) {
    articleNode.image = [hero];
  }

  return articleNode;
}

function faqAnswerPlainText(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSeoArticleFaqJsonLd(
  canonicalHref: string,
  article: SeoArticle,
): Record<string, unknown> | null {
  if (!article.faq.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${canonicalHref}#faq`,
    mainEntity: article.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faqAnswerPlainText(item.answerMarkdown),
      },
    })),
  };
}

export function buildSeoArticleBreadcrumbJsonLd(args: {
  canonicalHref: string;
  origin: string;
  title: string;
}): Record<string, unknown> {
  const { canonicalHref, origin, title } = args;
  const artikelIndex = absoluteUrlFromSite(origin, "/artikel");
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: origin },
      { "@type": "ListItem", position: 2, name: "Artikel", item: artikelIndex },
      { "@type": "ListItem", position: 3, name: title, item: canonicalHref },
    ],
  };
}
