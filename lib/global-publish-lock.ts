import { open, readFile, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { cmsKvKey, hasVercelKvEnv } from "@/lib/cms-storage/env";
import { getCmsKv } from "@/lib/cms-storage/kv-client";

/** Di serverless Vercel, cwd (`/var/task`) read-only; pakai /tmp jika tidak ada KV. */
function getFsLockPath(): string {
  if (process.env.VERCEL === "1") {
    return path.join(os.tmpdir(), "aytipanel-global-publish.lock");
  }
  return path.join(process.cwd(), "data", "site-content", ".global-publish.lock");
}

const LOCK_KV_KEY = cmsKvKey("global-publish-lock");
/** Kunci dianggap stale jika proses crash (serverless/instance mati). */
const STALE_MS = 4 * 60 * 1000;
const LOCK_TTL_S = Math.ceil(STALE_MS / 1000);

export type GlobalPublishLockHandle = {
  release: () => Promise<void>;
};

async function ensureLockParent(): Promise<void> {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(path.dirname(getFsLockPath()), { recursive: true });
}

async function writeLockFile(actorId: string): Promise<void> {
  const LOCK_PATH = getFsLockPath();
  const fh = await open(LOCK_PATH, "wx");
  try {
    await fh.writeFile(JSON.stringify({ actorId, since: Date.now() }), "utf-8");
  } finally {
    await fh.close().catch(() => {});
  }
}

async function tryRemoveStaleLock(): Promise<boolean> {
  const LOCK_PATH = getFsLockPath();
  try {
    const raw = await readFile(LOCK_PATH, "utf-8");
    const j = JSON.parse(raw) as { since?: number };
    const since = typeof j.since === "number" ? j.since : 0;
    if (Date.now() - since < STALE_MS) return false;
    await unlink(LOCK_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Kunci eksklusif publish global.
 * - KV (Upstash) SET NX + TTL jika env KV ada — koordinasi antar-instance.
 * - Tanpa KV: file lock; di Vercel path di /tmp (bukan /var/task yang read-only).
 */
export async function acquireGlobalPublishLock(actorId: string): Promise<GlobalPublishLockHandle | null> {
  if (hasVercelKvEnv()) {
    const kv = getCmsKv();
    const payload = JSON.stringify({ actorId, since: Date.now() });
    const ok = await kv.set(LOCK_KV_KEY, payload, { nx: true, ex: LOCK_TTL_S });
    if (ok === "OK") {
      return {
        release: async () => {
          await kv.del(LOCK_KV_KEY).catch(() => {});
        },
      };
    }
    return null;
  }

  await ensureLockParent();
  try {
    await writeLockFile(actorId);
    const LOCK_PATH = getFsLockPath();
    return {
      release: async () => {
        await unlink(LOCK_PATH).catch(() => {});
      },
    };
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code !== "EEXIST") throw e;
    const removed = await tryRemoveStaleLock();
    if (!removed) return null;
  }
  try {
    await writeLockFile(actorId);
    const LOCK_PATH = getFsLockPath();
    return {
      release: async () => {
        await unlink(LOCK_PATH).catch(() => {});
      },
    };
  } catch {
    return null;
  }
}
