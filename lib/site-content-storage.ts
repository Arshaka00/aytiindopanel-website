import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { SiteContent } from "@/lib/site-content-model";
import { captureException } from "@/lib/observability";
import { deepMergeSitePatch, validateSiteContentMinimal } from "@/lib/site-content-merge";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import { validateSiteContentStrict } from "@/lib/site-content-schema";

const DATA_DIR = path.join(process.cwd(), "data", "site-content");
const LIVE_PATH = path.join(DATA_DIR, "live.json");
const DRAFT_PATH = path.join(DATA_DIR, "draft.json");
const STATE_PATH = path.join(DATA_DIR, "state.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const AUDIT_LOG_PATH = path.join(DATA_DIR, "audit-log.jsonl");
const MAX_BACKUPS = 20;

type StorageMode = "live" | "draft";
type SiteContentState = {
  version: string;
  updatedAt: number;
};

type AuditAction =
  | "draft_patch_saved"
  | "draft_restored"
  | "live_restored"
  | "draft_published"
  | "global_publish"
  | "live_replace";

export type AuditEntry = {
  id: string;
  at: string;
  action: AuditAction;
  actorRole: "super_admin" | "editor" | "viewer" | "seo_editor" | "content_editor";
  actorId: string;
  ip: string;
  userAgent: string;
  deviceBound: boolean;
  detail?: Record<string, unknown>;
};

export type BackupItem = {
  file: string;
  createdAt: string;
  size: number;
};

let writeQueue = Promise.resolve();

function modePath(mode: StorageMode): string {
  return mode === "live" ? LIVE_PATH : DRAFT_PATH;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function writeStateVersion(): Promise<SiteContentState> {
  const state: SiteContentState = {
    version: randomUUID(),
    updatedAt: Date.now(),
  };
  await atomicWriteJson(STATE_PATH, state);
  return state;
}

async function readStateVersion(): Promise<SiteContentState | null> {
  const parsed = await readJsonSafe(STATE_PATH);
  if (!parsed || typeof parsed !== "object") return null;
  const s = parsed as Partial<SiteContentState>;
  if (typeof s.version !== "string" || typeof s.updatedAt !== "number") return null;
  return { version: s.version, updatedAt: s.updatedAt };
}

async function readJsonSafe(filePath: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as unknown;
  } catch (error) {
    void captureException(error, { area: "site-content-storage.readJsonSafe", filePath });
    return null;
  }
}

async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  await ensureDirs();
  const tempPath = `${filePath}.tmp-${Date.now()}-${randomUUID()}`;
  const body = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, body, "utf8");
  const parsed = JSON.parse(body) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Atomic write validation gagal: data bukan object.");
  }
  await fs.rename(tempPath, filePath);
}

function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function createBackupForMode(mode: StorageMode): Promise<void> {
  await ensureDirs();
  const sourcePath = modePath(mode);
  try {
    const raw = await fs.readFile(sourcePath, "utf8");
    const ts = new Date().toISOString().replaceAll(":", "-");
    const backupName = `${mode}-${ts}.json`;
    await fs.writeFile(path.join(BACKUP_DIR, backupName), raw, "utf8");
  } catch {
    // No existing source file yet; skip backup.
  }
  await pruneOldBackups();
}

async function pruneOldBackups(): Promise<void> {
  await ensureDirs();
  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  if (files.length <= MAX_BACKUPS) return;
  const detailed = await Promise.all(
    files.map(async (name) => {
      const st = await fs.stat(path.join(BACKUP_DIR, name));
      return { name, mtimeMs: st.mtimeMs };
    }),
  );
  detailed.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const toDelete = detailed.slice(MAX_BACKUPS);
  await Promise.all(toDelete.map((file) => fs.unlink(path.join(BACKUP_DIR, file.name))));
}

export async function appendAuditLog(entry: AuditEntry): Promise<void> {
  await ensureDirs();
  await fs.appendFile(AUDIT_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function listAuditLog(limit = 100): Promise<AuditEntry[]> {
  try {
    const raw = await fs.readFile(AUDIT_LOG_PATH, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const out: AuditEntry[] = [];
    for (const line of lines.slice(-limit).reverse()) {
      const parsed = JSON.parse(line) as AuditEntry;
      out.push(parsed);
    }
    return out;
  } catch {
    return [];
  }
}

export async function listBackups(): Promise<BackupItem[]> {
  await ensureDirs();
  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  const details = await Promise.all(
    files.map(async (file) => {
      const st = await fs.stat(path.join(BACKUP_DIR, file));
      return {
        file,
        createdAt: new Date(st.mtimeMs).toISOString(),
        size: st.size,
      } satisfies BackupItem;
    }),
  );
  return details.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function readBackupFile(file: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(BACKUP_DIR, file), "utf8");
  } catch {
    return null;
  }
}

export async function readSiteContentFromStorage(mode: StorageMode, fallback: SiteContent): Promise<SiteContent> {
  const parsed = await readJsonSafe(modePath(mode));
  if (!parsed) return structuredClone(fallback);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    void captureException(new Error("Invalid site-content file"), {
      area: "site-content-storage.readSiteContentFromStorage",
      mode,
      reason: "parsed content is not plain object",
    });
    return structuredClone(fallback);
  }
  const merged = deepMergeSitePatch(structuredClone(fallback), parsed as Record<string, unknown>);
  if (!merged) return structuredClone(fallback);
  const normalizedMerged = normalizeSiteContent(merged);
  if (!validateSiteContentMinimal(normalizedMerged)) return structuredClone(fallback);

  // Self-heal storage file jika konten masih sparse/parsial agar teks & gambar kembali permanen.
  const originalJson = JSON.stringify(parsed);
  const mergedJson = JSON.stringify(normalizedMerged);
  if (originalJson !== mergedJson) {
    await runSerialized(async () => {
      await createBackupForMode(mode);
      await atomicWriteJson(modePath(mode), normalizedMerged);
      await writeStateVersion();
    });
  }

  return normalizedMerged;
}

export async function writeSiteContentToStorage(mode: StorageMode, content: SiteContent): Promise<void> {
  const validated = validateSiteContentStrict(content);
  if (!validated.ok) {
    throw new Error(`Validasi konten gagal: ${validated.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`);
  }
  await runSerialized(async () => {
    await createBackupForMode(mode);
    await atomicWriteJson(modePath(mode), validated.content);
    await writeStateVersion();
  });
}

export async function restoreFromBackup(mode: StorageMode, file: string): Promise<SiteContent> {
  const raw = await readBackupFile(file);
  if (!raw) throw new Error("Backup tidak ditemukan.");
  const parsed = JSON.parse(raw) as unknown;
  const validated = validateSiteContentStrict(parsed);
  if (!validated.ok) {
    throw new Error(
      `Backup tidak valid: ${validated.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`,
    );
  }
  await writeSiteContentToStorage(mode, validated.content);
  return validated.content;
}

export async function getStorageVersionToken(): Promise<string> {
  try {
    const state = await readStateVersion();
    if (state) return `${state.version}:${state.updatedAt}`;
    const [liveSt, draftSt] = await Promise.all([
      fs.stat(LIVE_PATH).catch(() => null),
      fs.stat(DRAFT_PATH).catch(() => null),
    ]);
    const livePart = liveSt ? `${liveSt.mtimeMs}:${liveSt.size}` : "live-default";
    const draftPart = draftSt ? `${draftSt.mtimeMs}:${draftSt.size}` : "draft-default";
    return `${livePart}|${draftPart}`;
  } catch {
    return "storage-default";
  }
}

export async function publishDraftToLive(): Promise<void> {
  await runSerialized(async () => {
    await ensureDirs();
    const draftRaw = await fs.readFile(DRAFT_PATH, "utf8");
    const parsed = JSON.parse(draftRaw) as unknown;
    const validated = validateSiteContentStrict(parsed);
    if (!validated.ok) {
      throw new Error(`Draft tidak valid: ${validated.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`);
    }
    await createBackupForMode("live");
    await atomicWriteJson(LIVE_PATH, validated.content);
    await writeStateVersion();
  });
}
