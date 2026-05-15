import type { ServicePageKind } from "@/lib/service-pages";

export type LayananPageRecord = {
  id: string;
  slug: string;
  kind: ServicePageKind;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
  navLabel: string;
};

export type LayananPagesFile = {
  version: number;
  updatedAt: string;
  pages: LayananPageRecord[];
};

export type ServicePageHeroOverride = {
  imageSrc?: string;
  imageAlt?: string;
};
