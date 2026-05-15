"use client";

import { nestValueAtPath } from "@/lib/cms-nest-patch";
import { layananPageCmsPath } from "@/lib/layanan-pages/cms-merge";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

/** Hanya mode edit — aktifkan maks. 1 foto di section portfolio. */
export function LayananPortfolioCmsToggle({
  cmsPageIndex,
  enabled,
}: {
  cmsPageIndex: number;
  enabled: boolean;
}) {
  const cms = useSiteCmsOptional();
  if (cmsPageIndex < 0 || !cms?.eligible || !cms.editMode) return null;

  return (
    <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-accent/40 bg-card/80 px-3 py-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={enabled}
        onChange={() => {
          void cms.patchDeep(
            nestValueAtPath(layananPageCmsPath(cmsPageIndex, "showPortfolioSection"), !enabled),
          );
        }}
        className="size-4 rounded border-border"
      />
      <span>Sembunyikan foto referensi proyek (default: tampil 1 foto)</span>
    </label>
  );
}
