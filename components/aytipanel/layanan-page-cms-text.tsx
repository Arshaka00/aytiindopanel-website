"use client";

import type { ElementType } from "react";

import { CmsText } from "@/components/site-cms/cms-text";
import { layananPageCmsPath } from "@/lib/layanan-pages/cms-merge";

type Props<T extends ElementType> = {
  cmsPageIndex: number;
  field: string;
  text: string;
  as?: T;
  className?: string;
  id?: string;
};

export function LayananPageCmsText<T extends ElementType = "span">({
  cmsPageIndex,
  field,
  text,
  as,
  className,
  id,
}: Props<T>) {
  if (cmsPageIndex < 0) {
    const Tag = (as ?? "span") as ElementType;
    return (
      <Tag className={className} id={id}>
        {text}
      </Tag>
    );
  }
  return (
    <CmsText
      path={layananPageCmsPath(cmsPageIndex, field)}
      text={text}
      as={as}
      className={className}
      id={id}
    />
  );
}
