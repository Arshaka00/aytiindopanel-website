import { createClient, type VercelKV } from "@vercel/kv";

import { hasVercelKvEnv } from "@/lib/cms-storage/env";

let client: VercelKV | null = null;

/** Pakai saat `hasVercelKvEnv()` true (lock/status bisa KV tanpa Blob). */
export function getCmsKv(): VercelKV {
  if (!client) {
    if (!hasVercelKvEnv()) {
      throw new Error("KV env tidak di-set (KV_REST_API_URL + KV_REST_API_TOKEN).");
    }
    client = createClient({
      url: process.env.KV_REST_API_URL ?? process.env.KV_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return client;
}
