import { randomUUID } from "node:crypto";

import { getSiteContentFileStoragePort } from "@/lib/cms-storage";
import type { SiteContentStateFile } from "@/lib/cms-storage/site-content-file-storage-port";
import { captureException } from "@/lib/observability";
import type { SiteContent } from "@/lib/site-content-model";
import { deepMergeSitePatch, validateSiteContentMinimal } from "@/lib/site-content-merge";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import { validateSiteContentStrict } from "@/lib/site-content-schema";

const MAX_BACKUPS = 20;

type StorageMode = "live" | "draft";

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

function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

async function readStateVersion(): Promise<SiteContentStateFile | null> {
  return getSiteContentFileStoragePort().readState();
}

async function writeStateVersion(touch?: StorageMode): Promise<SiteContentStateFile> {
  const port = getSiteContentFileStoragePort();
  const prev = await port.readState();
  const now = Date.now();
  const state: SiteContentStateFile = {
    version: randomUUID(),
    updatedAt: now,
    draftSavedAt: touch === "draft" ? now : prev?.draftSavedAt,
    liveSavedAt: touch === "live" ? now : prev?.liveSavedAt,
  };
  await port.writeState(state);
  return state;
}

async function createBackupForMode(mode: StorageMode): Promise<void> {
  const port = getSiteContentFileStoragePort();
  const raw = await port.readRawByMode(mode);
  if (raw === null) return;
  const ts = new Date().toISOString().replaceAll(":", "-");
  const backupName = `${mode}-${ts}.json`;
  await port.writeBackupRaw(backupName, raw);
  await port.pruneBackups(MAX_BACKUPS);
}

export async function appendAuditLog(entry: AuditEntry): Promise<void> {
  await getSiteContentFileStoragePort().appendAuditLogLine(`${JSON.stringify(entry)}\n`);
}

export async function listAuditLog(limit = 100): Promise<AuditEntry[]> {
  const raw = await getSiteContentFileStoragePort().readAuditLogRaw();
  const lines = raw.split("\n").filter(Boolean);
  const out: AuditEntry[] = [];
  for (const line of lines.slice(-limit).reverse()) {
    try {
      out.push(JSON.parse(line) as AuditEntry);
    } catch {
      /* skip corrupt line */
    }
  }
  return out;
}

export async function listBackups(): Promise<BackupItem[]> {
  return getSiteContentFileStoragePort().listBackups();
}

export async function readBackupFile(file: string): Promise<string | null> {
  return getSiteContentFileStoragePort().readBackupFile(file);
}

export async function readSiteContentFromStorage(mode: StorageMode, fallback: SiteContent): Promise<SiteContent> {
  const port = getSiteContentFileStoragePort();
  const parsed = await port.readJsonByMode(mode);
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

  const originalJson = JSON.stringify(parsed);
  const mergedJson = JSON.stringify(normalizedMerged);
  if (originalJson !== mergedJson) {
    await runSerialized(async () => {
      await createBackupForMode(mode);
      await port.writeJsonByMode(mode, normalizedMerged);
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
    const port = getSiteContentFileStoragePort();
    await createBackupForMode(mode);
    await port.writeJsonByMode(mode, validated.content);
    await writeStateVersion(mode);
  });
}

export async function restoreFromBackup(mode: StorageMode, file: string): Promise<SiteContent> {
  const raw = await readBackupFile(file);
  if (!raw) throw new Error("Backup tidak ditemukan.");
  const parsed = JSON.parse(raw) as unknown;
  const validated = validateSiteContentStrict(parsed);
  if (!validated.ok) {
    throw new Error(`Backup tidak valid: ${validated.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`);
  }
  await writeSiteContentToStorage(mode, validated.content);
  return validated.content;
}

export async function getStorageVersionToken(): Promise<string> {
  try {
    const state = await readStateVersion();
    if (state) return `${state.version}:${state.updatedAt}`;
    const port = getSiteContentFileStoragePort();
    const meta = await port.getLiveDraftFileMeta();
    const livePart = meta.live ? `${meta.live.mtimeMs}:${meta.live.size}` : "live-default";
    const draftPart = meta.draft ? `${meta.draft.mtimeMs}:${meta.draft.size}` : "draft-default";
    return `${livePart}|${draftPart}`;
  } catch {
    return "storage-default";
  }
}

export async function publishDraftToLive(): Promise<void> {
  await runSerialized(async () => {
    const port = getSiteContentFileStoragePort();
    const draftRaw = await port.readRawByMode("draft");
    if (draftRaw === null) throw new Error("Draft tidak ditemukan.");
    const parsed = JSON.parse(draftRaw) as unknown;
    const validated = validateSiteContentStrict(parsed);
    if (!validated.ok) {
      throw new Error(`Draft tidak valid: ${validated.errors.map((e) => `${e.path}: ${e.message}`).join("; ")}`);
    }
    await createBackupForMode("live");
    await port.writeJsonByMode("live", validated.content);
    await writeStateVersion("live");
  });
}
