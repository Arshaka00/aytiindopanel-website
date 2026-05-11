import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { captureException } from "@/lib/observability";
import type {
  BackupRow,
  CmsStorageMode,
  SiteContentFileStoragePort,
  SiteContentStateFile,
} from "@/lib/cms-storage/site-content-file-storage-port";

const DATA_DIR = path.join(process.cwd(), "data", "site-content");
const LIVE_PATH = path.join(DATA_DIR, "live.json");
const DRAFT_PATH = path.join(DATA_DIR, "draft.json");
const STATE_PATH = path.join(DATA_DIR, "state.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const AUDIT_LOG_PATH = path.join(DATA_DIR, "audit-log.jsonl");

function modePath(mode: CmsStorageMode): string {
  return mode === "live" ? LIVE_PATH : DRAFT_PATH;
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
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

function assertSafeBackupFile(file: string): void {
  if (file.includes("..") || file.includes("/") || file.includes("\\")) {
    throw new Error("Nama backup tidak valid.");
  }
}

export function createFilesystemSiteContentStorage(): SiteContentFileStoragePort {
  return {
    async readJsonByMode(mode: CmsStorageMode): Promise<unknown | null> {
      try {
        const raw = await fs.readFile(modePath(mode), "utf8");
        return JSON.parse(raw) as unknown;
      } catch (error) {
        void captureException(error, { area: "filesystem-site-content-storage.readJsonByMode", mode });
        return null;
      }
    },

    async writeJsonByMode(mode: CmsStorageMode, data: unknown): Promise<void> {
      await atomicWriteJson(modePath(mode), data);
    },

    async readRawByMode(mode: CmsStorageMode): Promise<string | null> {
      try {
        return await fs.readFile(modePath(mode), "utf8");
      } catch {
        return null;
      }
    },

    async readState(): Promise<SiteContentStateFile | null> {
      try {
        const raw = await fs.readFile(STATE_PATH, "utf8");
        const parsed = JSON.parse(raw) as unknown;
        if (!parsed || typeof parsed !== "object") return null;
        const s = parsed as Partial<SiteContentStateFile>;
        if (typeof s.version !== "string" || typeof s.updatedAt !== "number") return null;
        return {
          version: s.version,
          updatedAt: s.updatedAt,
          draftSavedAt: typeof s.draftSavedAt === "number" ? s.draftSavedAt : undefined,
          liveSavedAt: typeof s.liveSavedAt === "number" ? s.liveSavedAt : undefined,
        };
      } catch {
        return null;
      }
    },

    async writeState(state: SiteContentStateFile): Promise<void> {
      await atomicWriteJson(STATE_PATH, state);
    },

    async appendAuditLogLine(line: string): Promise<void> {
      await ensureDirs();
      await fs.appendFile(AUDIT_LOG_PATH, line, "utf8");
    },

    async readAuditLogRaw(): Promise<string> {
      try {
        return await fs.readFile(AUDIT_LOG_PATH, "utf8");
      } catch {
        return "";
      }
    },

    async listBackups(): Promise<BackupRow[]> {
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
          } satisfies BackupRow;
        }),
      );
      return details.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async readBackupFile(file: string): Promise<string | null> {
      assertSafeBackupFile(file);
      try {
        return await fs.readFile(path.join(BACKUP_DIR, file), "utf8");
      } catch {
        return null;
      }
    },

    async writeBackupRaw(file: string, raw: string): Promise<void> {
      assertSafeBackupFile(file);
      await ensureDirs();
      await fs.writeFile(path.join(BACKUP_DIR, file), raw, "utf8");
    },

    async pruneBackups(maxBackups: number): Promise<void> {
      await ensureDirs();
      const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
      const files = entries.filter((e) => e.isFile()).map((e) => e.name);
      if (files.length <= maxBackups) return;
      const detailed = await Promise.all(
        files.map(async (name) => {
          const st = await fs.stat(path.join(BACKUP_DIR, name));
          return { name, mtimeMs: st.mtimeMs };
        }),
      );
      detailed.sort((a, b) => b.mtimeMs - a.mtimeMs);
      const toDelete = detailed.slice(maxBackups);
      await Promise.all(toDelete.map((row) => fs.unlink(path.join(BACKUP_DIR, row.name))));
    },

    async getLiveDraftFileMeta(): Promise<{
      live: { mtimeMs: number; size: number } | null;
      draft: { mtimeMs: number; size: number } | null;
    }> {
      const [liveSt, draftSt] = await Promise.all([
        fs.stat(LIVE_PATH).catch(() => null),
        fs.stat(DRAFT_PATH).catch(() => null),
      ]);
      return {
        live: liveSt ? { mtimeMs: liveSt.mtimeMs, size: liveSt.size } : null,
        draft: draftSt ? { mtimeMs: draftSt.mtimeMs, size: draftSt.size } : null,
      };
    },

    async getDraftLiveMtimeHint(): Promise<{
      draftMtimeMs: number | null;
      liveMtimeMs: number | null;
    }> {
      try {
        const [d, l] = await Promise.all([fs.stat(DRAFT_PATH), fs.stat(LIVE_PATH)]);
        return { draftMtimeMs: d.mtimeMs, liveMtimeMs: l.mtimeMs };
      } catch {
        return { draftMtimeMs: null, liveMtimeMs: null };
      }
    },
  };
}
