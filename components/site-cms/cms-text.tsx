"use client";

import type { ElementType } from "react";

import { CmsRichStyledText } from "@/components/site-cms/cms-rich-styled-text";
import type { CmsRichTextValue } from "@/lib/cms-rich-text";
import { plainTextFromRichValue } from "@/lib/cms-rich-text";

type CmsTextProps<T extends ElementType> = {
  path: string;
  /** Nilai dari JSON: string biasa atau blok bergaya — sama seperti `CmsRichStyledText`. */
  text: CmsRichTextValue;
  /** Default penyimpanan jika field kosong (opsional; untuk heading hero dll.). */
  fallbackText?: string;
  as?: T;
  className?: string;
  id?: string;
};

/**
 * Inline CMS text — pengeditan & panel **Gaya teks CMS** sama dengan judul hero (`CmsRichStyledText`).
 * Field string biasa tetap disimpan sebagai string jika tidak ada meta gaya.
 */
export function CmsText<T extends ElementType = "span">({
  path,
  text,
  fallbackText: fallbackProp,
  as,
  className,
  id,
}: CmsTextProps<T>) {
  const derivedPlain =
    typeof text === "string" ? text : plainTextFromRichValue(text, "");
  const fallbackText = (fallbackProp ?? derivedPlain) || "\u00a0";

  return (
    <CmsRichStyledText
      path={path}
      richValue={text}
      fallbackText={fallbackText}
      as={as}
      className={className}
      id={id}
    />
  );
}
