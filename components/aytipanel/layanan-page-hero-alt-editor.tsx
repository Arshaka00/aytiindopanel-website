"use client";

import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { layananPageCmsPath } from "@/lib/layanan-pages/cms-merge";

/** Editor alt hero — hanya saat mode edit CMS. */
export function LayananPageHeroAltEditor({
  cmsPageIndex,
  alt,
}: {
  cmsPageIndex: number;
  alt: string;
}) {
  const cms = useSiteCmsOptional();
  if (cmsPageIndex < 0 || !cms?.eligible || !cms.editMode) return null;
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-20 max-w-md rounded-lg border border-white/20 bg-black/70 p-3 text-xs text-white backdrop-blur-sm">
      <p className="mb-1 font-semibold uppercase tracking-wide text-white/70">Alt gambar hero</p>
      <CmsText
        path={layananPageCmsPath(cmsPageIndex, "heroImageAlt")}
        text={alt}
        as="span"
        className="inline"
      />
    </div>
  );
}
