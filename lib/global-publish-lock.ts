import { open, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "site-content");
const LOCK_PATH = path.join(DATA_DIR, ".global-publish.lock");
/** Kunci dianggap stale jika proses crash (serverless/instance mati). */
const STALE_MS = 4 * 60 * 1000;

export type GlobalPublishLockHandle = {
  release: () => Promise<void>;
};

async function ensureDataDir(): Promise<void> {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(DATA_DIR, { recursive: true });
}

async function writeLockFile(actorId: string): Promise<void> {
  const fh = await open(LOCK_PATH, "wx");
  try {
    await fh.writeFile(JSON.stringify({ actorId, since: Date.now() }), "utf-8");
  } finally {
    await fh.close().catch(() => {});
  }
}

async function tryRemoveStaleLock(): Promise<boolean> {
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
 * Kunci eksklusif file (best-effort satu node / satu filesystem).
 * Jika kunci aktif dan belum stale → `null` (jangan jalankan publish paralel).
 */
export async function acquireGlobalPublishLock(actorId: string): Promise<GlobalPublishLockHandle | null> {
  await ensureDataDir();
  try {
    await writeLockFile(actorId);
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
    return {
      release: async () => {
        await unlink(LOCK_PATH).catch(() => {});
      },
    };
  } catch {
    return null;
  }
}
