export type CmsStorageMode = "live" | "draft";

export type SiteContentStateFile = {
  version: string;
  updatedAt: number;
  draftSavedAt?: number;
  liveSavedAt?: number;
};

export type BackupRow = { file: string; createdAt: string; size: number };

/**
 * Penyimpanan file CMS (live/draft/state/audit/backups) — filesystem lokal atau Vercel Blob.
 */
export interface SiteContentFileStoragePort {
  readJsonByMode(mode: CmsStorageMode): Promise<unknown | null>;
  writeJsonByMode(mode: CmsStorageMode, data: unknown): Promise<void>;
  readRawByMode(mode: CmsStorageMode): Promise<string | null>;
  readState(): Promise<SiteContentStateFile | null>;
  writeState(state: SiteContentStateFile): Promise<void>;
  appendAuditLogLine(line: string): Promise<void>;
  readAuditLogRaw(): Promise<string>;
  listBackups(): Promise<BackupRow[]>;
  readBackupFile(file: string): Promise<string | null>;
  writeBackupRaw(file: string, raw: string): Promise<void>;
  pruneBackups(maxBackups: number): Promise<void>;
  getLiveDraftFileMeta(): Promise<{
    live: { mtimeMs: number; size: number } | null;
    draft: { mtimeMs: number; size: number } | null;
  }>;
  getDraftLiveMtimeHint(): Promise<{
    draftMtimeMs: number | null;
    liveMtimeMs: number | null;
  }>;
}
