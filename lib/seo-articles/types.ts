export type SeoArticleFaqItem = {
  id: string;
  question: string;
  answerMarkdown: string;
};

export type SeoArticle = {
  id: string;
  slug: string;
  title: string;
  deck: string;
  primaryKeyword: string;
  tags: string[];
  heroImage: string;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  metaTitle: string;
  metaDescription: string;
  bodyMarkdown: string;
  faq: SeoArticleFaqItem[];
  relatedSlugs: string[];
};

export type SeoArticlesFile = {
  version: number;
  updatedAt: string;
  articles: SeoArticle[];
};

export type SeoArticleTocItem = {
  id: string;
  level: 2 | 3;
  text: string;
};
