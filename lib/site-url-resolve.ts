/**
 * Menyelesaikan URL basis publik untuk canonical, OG, metadataBase, sitemap.
 * Prioritas: CMS `siteSettings.siteUrl` → env → Vercel preview URL.
 */
export function normalizeAbsoluteOriginCandidate(raw: string): string | null {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return null;
  try {
    const href = /\w+:\/\//.test(t) ? t : `https://${t}`;
    const u = new URL(href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Normalisasi path untuk redirect & canonical: lowercase, tanpa trailing slash kecuali `/`. */
export function normalizeUrlPathname(pathname: string): string {
  let p = pathname.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  const lower = p.toLowerCase();
  if (lower.length > 1 && lower.endsWith("/")) return lower.slice(0, -1);
  return lower;
}

/** Gabungkan origin primer dengan path; path boleh relatif tanpa leading slash. */
export function absoluteUrlFromSite(originHref: string, pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (!t) return originHref.replace(/\/$/, "");
  if (/\w+:\/\//.test(t)) {
    try {
      return new URL(t).href;
    } catch {
      return originHref.replace(/\/$/, "");
    }
  }
  const base = originHref.replace(/\/$/, "");
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${base}${path}`;
}

export function resolvePublicSiteOrigin(siteUrlFromCms: string): URL {
  const fromCms = normalizeAbsoluteOriginCandidate(siteUrlFromCms);
  if (fromCms) return new URL(fromCms);

  const envUrl = normalizeAbsoluteOriginCandidate(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  if (envUrl) return new URL(envUrl);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      /* fallthrough */
    }
  }

  return new URL("https://localhost");
}
