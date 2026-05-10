import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import type { SiteContent } from "@/lib/site-content-model";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import { createSiteContentRepository } from "@/lib/site-content-repository";

let cache: { content: SiteContent; at: number } | null = null;
const TTL_MS = 15_000;

/** Baca konten live untuk middleware (cache pendek; hindari React `cache`). */
export async function getNormalizedLiveSiteContentForMiddleware(): Promise<SiteContent> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.content;
  const repo = createSiteContentRepository();
  const defaults = createDefaultSiteContent();
  const raw = await repo.read("live", defaults);
  const content = normalizeSiteContent(raw);
  cache = { content, at: now };
  return content;
}
