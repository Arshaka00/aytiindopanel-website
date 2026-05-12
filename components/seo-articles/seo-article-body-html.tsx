export function SeoArticleBodyHtml({ html }: { html: string }) {
  return (
    <div
      className="seo-article-body max-w-none text-base leading-relaxed text-foreground/95 md:text-lg [&_.seo-article-body__h2]:mt-10 [&_.seo-article-body__h2]:scroll-mt-28 [&_.seo-article-body__h2]:text-xl [&_.seo-article-body__h2]:font-semibold [&_.seo-article-body__h2]:tracking-tight [&_.seo-article-body__h2]:text-foreground [&_.seo-article-body__h2]:md:text-2xl [&_.seo-article-body__h3]:mt-6 [&_.seo-article-body__h3]:scroll-mt-28 [&_.seo-article-body__h3]:text-lg [&_.seo-article-body__h3]:font-semibold [&_.seo-article-body__h3]:text-foreground [&_.seo-article-body__link]:font-medium [&_.seo-article-body__link]:text-accent [&_.seo-article-body__link]:underline [&_.seo-article-body__link]:underline-offset-4 [&_.seo-article-body__link]:hover:text-primary [&_.seo-article-body__p]:mt-4 [&_.seo-article-body__p]:text-muted-foreground [&_.seo-article-body__p]:first:mt-0 [&_strong]:text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
