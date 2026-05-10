import type { NextRequest } from "next/server";

type Bucket = { count: number; start: number };

const buckets = new Map<string, Bucket>();

function clientKey(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  const first = xf?.split(",")[0]?.trim();
  if (first) return first;
  const rip = req.headers.get("x-real-ip");
  if (rip) return rip;
  return "local";
}

/**
 * Rate limit sederhana in-memory (cukup untuk single-node / dev;
 * di multi-instance gunakan Redis di luar scope ini).
 */
export function rateLimitRequest(
  req: NextRequest,
  keySuffix: string,
  max: number,
  windowMs: number,
): boolean {
  const key = `${clientKey(req)}:${keySuffix}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}
