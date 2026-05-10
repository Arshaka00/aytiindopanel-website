"use client";

import type { ProductCatalogItem } from "@/components/aytipanel/products-catalog";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

type Props = {
  slug: string;
  product: ProductCatalogItem;
  /** Nilai efektif (katalog + override). */
  title: string;
  subtitle: string;
  badge?: string;
};

export function ProductDetailHeaderCms({ slug, product, title, subtitle, badge }: Props) {
  const cms = useSiteCmsOptional();
  const edit = Boolean(cms?.eligible && cms.editMode);

  if (!edit) {
    return (
      <>
        {product.badge ? (
          <span className="inline-block rounded-full border border-badge-border bg-badge-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary md:text-[11px]">
            {product.badge}
          </span>
        ) : null}
        <h1 className="text-2xl font-semibold leading-[1.2] tracking-[-0.012em] text-foreground sm:text-[2rem] md:text-[2.5rem] md:leading-[1.14] md:tracking-[-0.015em]">
          {product.title}
          {product.subtitle ? (
            <span className="mt-1 block max-w-3xl text-base font-medium leading-relaxed text-muted md:mt-2 md:text-[1.3rem] md:leading-relaxed md:font-semibold">
              {product.subtitle}
            </span>
          ) : null}
        </h1>
      </>
    );
  }

  const badgeText = badge ?? product.badge;

  return (
    <>
      {badgeText ? (
        <span className="inline-block rounded-full border border-badge-border bg-badge-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary md:text-[11px]">
          <CmsText
            path={`productPageOverrides.${slug}.badge`}
            text={badgeText}
            as="span"
            className="inline"
          />
        </span>
      ) : null}
      <h1 className="text-2xl font-semibold leading-[1.2] tracking-[-0.012em] text-foreground sm:text-[2rem] md:text-[2.5rem] md:leading-[1.14] md:tracking-[-0.015em]">
        <CmsText
          path={`productPageOverrides.${slug}.title`}
          text={title}
          as="span"
          className="block"
        />
        {(subtitle || product.subtitle) ? (
          <span className="mt-1 block max-w-3xl text-base font-medium leading-relaxed text-muted md:mt-2 md:text-[1.3rem] md:leading-relaxed md:font-semibold">
            <CmsText
              path={`productPageOverrides.${slug}.subtitle`}
              text={subtitle || product.subtitle || ""}
              as="span"
              className="block"
            />
          </span>
        ) : null}
      </h1>
    </>
  );
}
