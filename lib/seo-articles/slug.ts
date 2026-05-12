const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSeoFriendlySlug(slug: string): boolean {
  const s = slug.trim();
  if (s.length < 2 || s.length > 120) return false;
  return SLUG_RE.test(s);
}

export function slugifyHeading(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "section";
}
