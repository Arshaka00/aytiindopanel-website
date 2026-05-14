import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { SeoArticleJsonLd } from "@/components/seo-articles/seo-article-json-ld";
import { SeoArticleView } from "@/components/seo-articles/seo-article-view";
import { injectMarkdownInternalLinks } from "@/lib/seo-articles/internal-links";
import { parseMarkdownLite } from "@/lib/seo-articles/markdown-lite";
import { resolveSeoArticleMetadata } from "@/lib/seo-articles/metadata";
import { estimateReadingMinutesFromMarkdown, roughWordCountFromMarkdown } from "@/lib/seo-articles/reading-time";
import { loadPublishedSeoArticleContext, getPublishedSeoArticleSlugs } from "@/lib/seo-articles/repository";
import type { SeoArticle } from "@/lib/seo-articles/types";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { absoluteUrlFromSite, resolvePublicSiteOrigin } from "@/lib/site-url-resolve";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedSeoArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [content, ctx] = await Promise.all([getSiteContent(), loadPublishedSeoArticleContext(slug)]);
  if (!ctx.article) notFound();
  return resolveSeoArticleMetadata(ctx.article, content);
}

function resolveRelated(article: SeoArticle, published: SeoArticle[]) {
  const bySlug = new Map(published.map((a) => [a.slug, a]));
  return article.relatedSlugs
    .map((s) => bySlug.get(s))
    .filter((x): x is SeoArticle => Boolean(x))
    .map((a) => ({ slug: a.slug, title: a.title, deck: a.deck, heroImage: a.heroImage }));
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params;
  const [content, ctx] = await Promise.all([getSiteContent(), loadPublishedSeoArticleContext(slug)]);
  const article = ctx.article;
  if (!article) notFound();

  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const origin = resolvePublicSiteOrigin(content.siteSettings.siteUrl).origin;
  const canonicalHref = absoluteUrlFromSite(origin, `/artikel/${article.slug}`);

  const linkedMd = injectMarkdownInternalLinks(article.bodyMarkdown, article.slug, ctx.published);
  const { html: bodyHtml, toc } = parseMarkdownLite(linkedMd);
  const readingMinutes = estimateReadingMinutesFromMarkdown(article.bodyMarkdown, article.faq);
  const wordCount =
    roughWordCountFromMarkdown(article.bodyMarkdown) +
    article.faq.reduce(
      (acc, f) =>
        acc + roughWordCountFromMarkdown(`${f.question} ${f.answerMarkdown}`),
      0,
    );
  const related = resolveRelated(article, ctx.published);

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ForceScrollTopOnLoad />
      <SeoArticleJsonLd
        article={article}
        canonicalHref={canonicalHref}
        content={content}
        wordCount={wordCount}
        readingMinutes={readingMinutes}
      />
      <div className="flex min-h-full flex-1 flex-col bg-background text-foreground">
        <main className="flex-1">
          <SeoArticleView
            article={article}
            bodyHtml={bodyHtml}
            toc={toc}
            readingMinutes={readingMinutes}
            related={related}
          />
        </main>
        <SiteFooter footer={content.footer} />
      </div>
    </WhatsAppPhoneProvider>
  );
}
