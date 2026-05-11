import { del, get, head, list, put } from "@vercel/blob";

import { getCmsBlobAccessMode } from "@/lib/cms-storage/env";
import { captureException } from "@/lib/observability";
import type {
  BackupRow,
  CmsStorageMode,
  SiteContentFileStoragePort,
  SiteContentStateFile,
} from "@/lib/cms-storage/site-content-file-storage-port";

function blobToken(): string {
  const t = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!t) throw new Error("BLOB_READ_WRITE_TOKEN tidak di-set.");
  return t;
}

function blobBase(): string {
  return process.env.CMS_BLOB_PREFIX?.trim().replace(/^\/+|\/+$/g, "") ?? "site-cms/default";
}

function pathLive(): string {
  return `${blobBase()}/live.json`;
}
function pathDraft(): string {
  return `${blobBase()}/draft.json`;
}
function pathState(): string {
  return `${blobBase()}/state.json`;
}
function pathAudit(): string {
  return `${blobBase()}/audit-log.jsonl`;
}
function pathBackup(file: string): string {
  return `${blobBase()}/backups/${file}`;
}

function modePathname(mode: CmsStorageMode): string {
  return mode === "live" ? pathLive() : pathDraft();
}

function putJsonOpts() {
  return {
    access: getCmsBlobAccessMode(),
    allowOverwrite: true as const,
    contentType: "application/json; charset=utf-8",
  };
}

function putNdjsonOpts() {
  return {
    access: getCmsBlobAccessMode(),
    allowOverwrite: true as const,
    contentType: "application/x-ndjson; charset=utf-8",
  };
}

function concatUint8Chunks(chunks: Uint8Array[]): Uint8Array {
  let len = 0;
  for (const c of chunks) len += c.length;
  const out = new Uint8Array(len);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

async function readStreamAsUtf8(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  if (chunks.length === 0) return "";
  if (chunks.length === 1) return new TextDecoder().decode(chunks[0]);
  return new TextDecoder().decode(concatUint8Chunks(chunks));
}

async function getCmsBlobText(pathname: string): Promise<string | null> {
  const token = blobToken();
  const access = getCmsBlobAccessMode();
  try {
    const res = await get(pathname, { access, token });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    return await readStreamAsUtf8(res.stream);
  } catch (error) {
    void captureException(error, { area: "vercel-blob-site-content-storage.getCmsBlobText", pathname });
    return null;
  }
}

async function putCmsBlobText(pathname: string, body: string, opts: ReturnType<typeof putJsonOpts>): Promise<void> {
  const token = blobToken();
  await put(pathname, body, { ...opts, token });
}

function assertSafeBackupFile(file: string): void {
  if (file.includes("..") || file.includes("/") || file.includes("\\")) {
    throw new Error("Nama backup tidak valid.");
  }
}

function parseStateJson(text: string): SiteContentStateFile | null {
  try {
    const parsed = JSON.parse(text) as unknown;
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
}

export function createVercelBlobSiteContentStorage(): SiteContentFileStoragePort {
  return {
    async readJsonByMode(mode: CmsStorageMode): Promise<unknown | null> {
      const text = await getCmsBlobText(modePathname(mode));
      if (text === null) return null;
      try {
        return JSON.parse(text) as unknown;
      } catch (error) {
        void captureException(error, { area: "vercel-blob-site-content-storage.readJsonByMode", mode });
        return null;
      }
    },

    async writeJsonByMode(mode: CmsStorageMode, data: unknown): Promise<void> {
      const body = JSON.stringify(data, null, 2);
      const parsed = JSON.parse(body) as unknown;
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Write validation gagal: data bukan object.");
      }
      await putCmsBlobText(modePathname(mode), body, putJsonOpts());
    },

    async readRawByMode(mode: CmsStorageMode): Promise<string | null> {
      return getCmsBlobText(modePathname(mode));
    },

    async readState(): Promise<SiteContentStateFile | null> {
      const text = await getCmsBlobText(pathState());
      if (text === null) return null;
      return parseStateJson(text);
    },

    async writeState(state: SiteContentStateFile): Promise<void> {
      await putCmsBlobText(pathState(), JSON.stringify(state, null, 2), putJsonOpts());
    },

    async appendAuditLogLine(line: string): Promise<void> {
      const prev = (await getCmsBlobText(pathAudit())) ?? "";
      await putCmsBlobText(pathAudit(), `${prev}${line}`, putNdjsonOpts());
    },

    async readAuditLogRaw(): Promise<string> {
      return (await getCmsBlobText(pathAudit())) ?? "";
    },

    async listBackups(): Promise<BackupRow[]> {
      const token = blobToken();
      const prefix = `${blobBase()}/backups/`;
      const rows: BackupRow[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix, token, cursor, limit: 1000, mode: "expanded" });
        for (const b of page.blobs) {
          const name = b.pathname.startsWith(prefix) ? b.pathname.slice(prefix.length) : b.pathname;
          if (!name || name.includes("/")) continue;
          rows.push({
            file: name,
            createdAt: b.uploadedAt.toISOString(),
            size: b.size,
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },

    async readBackupFile(file: string): Promise<string | null> {
      assertSafeBackupFile(file);
      return getCmsBlobText(pathBackup(file));
    },

    async writeBackupRaw(file: string, raw: string): Promise<void> {
      assertSafeBackupFile(file);
      await putCmsBlobText(pathBackup(file), raw, putJsonOpts());
    },

    async pruneBackups(maxBackups: number): Promise<void> {
      const token = blobToken();
      const prefix = `${blobBase()}/backups/`;
      const blobs: { url: string; uploadedAt: Date }[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix, token, cursor, limit: 1000, mode: "expanded" });
        for (const b of page.blobs) {
          blobs.push({ url: b.url, uploadedAt: b.uploadedAt });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      const toDelete = blobs.slice(maxBackups);
      await Promise.all(toDelete.map((b) => del(b.url, { token }).catch(() => {})));
    },

    async getLiveDraftFileMeta(): Promise<{
      live: { mtimeMs: number; size: number } | null;
      draft: { mtimeMs: number; size: number } | null;
    }> {
      const token = blobToken();
      const out = { live: null as { mtimeMs: number; size: number } | null, draft: null as null | { mtimeMs: number; size: number } };
      try {
        const h = await head(pathLive(), { token });
        out.live = { mtimeMs: h.uploadedAt.getTime(), size: h.size };
      } catch {
        out.live = null;
      }
      try {
        const h = await head(pathDraft(), { token });
        out.draft = { mtimeMs: h.uploadedAt.getTime(), size: h.size };
      } catch {
        out.draft = null;
      }
      return out;
    },

    async getDraftLiveMtimeHint(): Promise<{
      draftMtimeMs: number | null;
      liveMtimeMs: number | null;
    }> {
      const meta = await this.getLiveDraftFileMeta();
      return {
        draftMtimeMs: meta.draft?.mtimeMs ?? null,
        liveMtimeMs: meta.live?.mtimeMs ?? null,
      };
    },
  };
}
