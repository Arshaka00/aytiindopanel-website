export function SeoArticleBodyHtml({ html }: { html: string }) {
  return (
    <div
      className={[
        "seo-article-body max-w-[42rem] text-pretty antialiased selection:bg-accent/15",
        "hyphens-auto text-[1.0625rem] leading-[1.78] text-foreground/[0.88] md:text-[1.125rem] md:leading-[1.8]",
        "[&_.seo-article-body__h2]:mt-14 [&_.seo-article-body__h2]:scroll-mt-28 [&_.seo-article-body__h2]:border-b [&_.seo-article-body__h2]:border-border/60 [&_.seo-article-body__h2]:pb-3 [&_.seo-article-body__h2]:font-[family-name:var(--font-sora)] [&_.seo-article-body__h2]:text-xl [&_.seo-article-body__h2]:font-semibold [&_.seo-article-body__h2]:tracking-tight [&_.seo-article-body__h2]:text-foreground [&_.seo-article-body__h2]:first:mt-0 [&_.seo-article-body__h2]:md:mt-16 [&_.seo-article-body__h2]:md:text-[1.4rem] [&_.seo-article-body__h2]:md:leading-snug",
        "[&_.seo-article-body__h3]:mt-9 [&_.seo-article-body__h3]:scroll-mt-28 [&_.seo-article-body__h3]:font-[family-name:var(--font-sora)] [&_.seo-article-body__h3]:text-lg [&_.seo-article-body__h3]:font-semibold [&_.seo-article-body__h3]:tracking-tight [&_.seo-article-body__h3]:text-foreground [&_.seo-article-body__h3]:md:mt-10 [&_.seo-article-body__h3]:md:text-xl",
        "[&_.seo-article-body__link]:rounded-sm [&_.seo-article-body__link]:font-medium [&_.seo-article-body__link]:text-accent [&_.seo-article-body__link]:underline [&_.seo-article-body__link]:decoration-accent/35 [&_.seo-article-body__link]:underline-offset-[3px] [&_.seo-article-body__link]:transition-colors [&_.seo-article-body__link]:decoration-2 hover:[&_.seo-article-body__link]:decoration-accent/80 hover:[&_.seo-article-body__link]:text-primary",
        "[&_.seo-article-body__p]:mt-[1.125em] [&_.seo-article-body__p]:text-muted-foreground [&_.seo-article-body__p]:first:mt-0",
        "[&_img]:my-6 [&_img]:mx-auto [&_img]:block [&_img]:max-h-[min(52vh,20rem)] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border/50 [&_img]:object-contain [&_img]:shadow-sm",
        "[&_strong]:font-semibold [&_strong]:text-foreground/95",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
