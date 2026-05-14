"use client";

import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";

/** Hanya saat mode edit CMS — mengubah `coldStoragePage.heroImageAlt` (teks alt gambar hero & kartu). */
export function ColdStoragePageImageAltEditor({ text }: { text: string }) {
  const cms = useSiteCmsOptional();
  if (!cms?.editMode) return null;
  return (
    <div className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-4 right-4 z-[12] max-w-6xl rounded-xl border border-white/20 bg-black/55 p-3 text-left shadow-lg backdrop-blur-md sm:left-6 sm:right-6 md:bottom-8">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/75">
        Teks alt gambar (aksesibilitas & SEO)
      </p>
      <CmsText
        path="coldStoragePage.heroImageAlt"
        text={text}
        as="p"
        className="text-xs leading-snug text-white/95"
      />
    </div>
  );
}
