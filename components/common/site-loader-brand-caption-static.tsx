import {
  SITE_LOADER_BRAND_PRIMARY,
  SITE_LOADER_BRAND_SECONDARY,
} from "@/lib/site-loader-brand-lines";

/** Teks branding loader — tanpa JS animasi (tier ringan / mobile). */
export function SiteLoaderBrandCaptionStatic() {
  return (
    <div className="flex flex-col gap-2 sm:gap-2.5">
      <p className="font-[family-name:var(--font-geist-sans)] text-[0.75rem] font-semibold uppercase leading-snug tracking-[0.16em] text-white/88 sm:text-xs">
        {SITE_LOADER_BRAND_PRIMARY}
      </p>
      <p className="font-[family-name:var(--font-geist-sans)] text-[0.6875rem] font-medium leading-relaxed tracking-[0.1em] text-white/72 sm:text-[0.8125rem]">
        {SITE_LOADER_BRAND_SECONDARY}
      </p>
    </div>
  );
}
