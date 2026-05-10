import path from "node:path";

import { MEDIA_SCOPE_TO_DIR, PUBLIC_MEDIA_BASE } from "@/lib/site-media-constants";

/** Pastikan path publik aman untuk hapus (hanya di bawah `public/media/*`). */
export function publicPathToSafeMediaFile(publicUrlPath: string): string | null {
  const u = publicUrlPath.split("?")[0] ?? "";
  const prefix = `${PUBLIC_MEDIA_BASE}/`;
  if (!u.startsWith(prefix)) return null;
  const rel = u.slice(prefix.length);
  const parts = rel.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [dir, ...rest] = parts;
  const allowed = Object.values(MEDIA_SCOPE_TO_DIR);
  if (!allowed.includes(dir)) return null;
  const joined = path.join(dir, ...rest);
  if (joined.includes("..")) return null;
  const abs = path.join(process.cwd(), "public", "media", joined);
  const normPublic = path.join(process.cwd(), "public");
  if (!abs.startsWith(path.join(normPublic, "media"))) return null;
  return abs;
}
