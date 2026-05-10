"use client";

import type { ReactNode } from "react";

import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

/** Menyediakan flag editMode untuk daftar yang di-render manual (tanpa mengubah layout). */
export function CmsRepeater({
  children,
}: {
  children: (ctx: { editMode: boolean }) => ReactNode;
}) {
  const cms = useSiteCmsOptional();
  const editMode = Boolean(cms?.eligible && cms.editMode);
  return <>{children({ editMode })}</>;
}
