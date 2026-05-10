import type { SiteContent } from "@/lib/site-content-model";

/** Isi alt kosong dengan prefiks + fallback dari nama file / label. */
export function resolveImageAlt(
  content: SiteContent,
  rawAlt: string | undefined,
  fileHint?: string,
): string {
  const t = typeof rawAlt === "string" ? rawAlt.trim() : "";
  if (t) return t;
  const prefix = content.siteSettings.imageSeo.defaultAltPrefix.trim();
  const hint =
    fileHint?.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Gambar";
  return prefix ? `${prefix} — ${hint}` : hint;
}
