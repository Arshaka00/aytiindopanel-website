/** URL sosial / aset: kosong OK; http(s) atau path relatif `/...`. */
export function isValidPublicUrlOrPath(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  if (t.startsWith("/") && !t.includes(" ")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
