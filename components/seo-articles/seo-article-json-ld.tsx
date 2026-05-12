import type { SiteContent } from "@/lib/site-content-model";
import type { SeoArticle } from "@/lib/seo-articles/types";
import {
  buildSeoArticleArticleJsonLd,
  buildSeoArticleBreadcrumbJsonLd,
  buildSeoArticleFaqJsonLd,
} from "@/lib/seo-articles/json-ld";
import { resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export function SeoArticleJsonLd({
  article,
  canonicalHref,
  content,
  wordCount,
  readingMinutes,
}: {
  article: SeoArticle;
  canonicalHref: string;
  content: SiteContent;
  wordCount: number;
  readingMinutes: number;
}) {
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const graph: Record<string, unknown>[] = [
    buildSeoArticleArticleJsonLd({
      article,
      canonicalHref,
      content,
      wordCount,
      readingMinutes,
    }),
    buildSeoArticleBreadcrumbJsonLd({
      canonicalHref,
      origin,
      title: article.title,
    }),
  ];
  const faq = buildSeoArticleFaqJsonLd(canonicalHref, article);
  if (faq) graph.push(faq);

  const schema = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
