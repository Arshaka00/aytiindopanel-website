import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "site-content");
const STATUS_PATH = path.join(DATA_DIR, "global-publish-status.json");
/** Jika proses crash saat deploy, flag in-progress dianggap stale. */
const STALE_IN_PROGRESS_MS = 6 * 60 * 1000;

export type GlobalPublishPhase = "idle" | "publish_content" | "revalidate" | "deploy_hook" | "done";

export type GlobalPublishStatus = {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailedAt: string | null;
  lastError: string | null;
  lastPhase: GlobalPublishPhase;
  lastDeployHookStatus: "skipped" | "ok" | "failed" | null;
  lastDeployHookHttpStatus: number | null;
  lastDeployHookMessage: string | null;
  lastDeployHookAttempts: number | null;
  /** True saat POST deploy hook sedang berjalan (untuk polling UI). */
  deployHookInProgress: boolean;
  /** Saat memasuki langkah deploy (sebelum POST). */
  lastDeployHookTriggeredAt: string | null;
  /** Saat attempt deploy hook selesai (sukses/gagal/skip). */
  lastDeployHookSettledAt: string | null;
  /** UID deployment Vercel untuk polling status build (opsional). */
  vercelDeploymentUid: string | null;
  /** Terakhir diketahui dari API Vercel (QUEUED, BUILDING, READY, ERROR, …). */
  vercelDeploymentReadyState: string | null;
  vercelDeploymentInspectorUrl: string | null;
  vercelDeploymentErrorMessage: string | null;
  vercelDeploymentTrackedAt: string | null;
  storageVersionAfter: string | null;
};

export const DEFAULT_GLOBAL_PUBLISH_STATUS: GlobalPublishStatus = {
  lastAttemptAt: null,
  lastSuccessAt: null,
  lastFailedAt: null,
  lastError: null,
  lastPhase: "idle",
  lastDeployHookStatus: null,
  lastDeployHookHttpStatus: null,
  lastDeployHookMessage: null,
  lastDeployHookAttempts: null,
  deployHookInProgress: false,
  lastDeployHookTriggeredAt: null,
  lastDeployHookSettledAt: null,
  vercelDeploymentUid: null,
  vercelDeploymentReadyState: null,
  vercelDeploymentInspectorUrl: null,
  vercelDeploymentErrorMessage: null,
  vercelDeploymentTrackedAt: null,
  storageVersionAfter: null,
};

function healStaleInProgress(s: GlobalPublishStatus): GlobalPublishStatus {
  if (!s.deployHookInProgress || !s.lastDeployHookTriggeredAt) return s;
  const t = new Date(s.lastDeployHookTriggeredAt).getTime();
  if (!Number.isFinite(t) || Date.now() - t < STALE_IN_PROGRESS_MS) return s;
  return {
    ...s,
    deployHookInProgress: false,
    lastPhase: "idle",
    lastDeployHookMessage: s.lastDeployHookMessage ?? "Deploy hook dianggap terputus (stale); sesi lalu tidak selesai.",
  };
}

function normalizeStatus(raw: unknown): GlobalPublishStatus {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_GLOBAL_PUBLISH_STATUS };
  const o = raw as Record<string, unknown>;
  const phase = o.lastPhase;
  const validPhase: GlobalPublishPhase =
    phase === "publish_content" ||
    phase === "revalidate" ||
    phase === "deploy_hook" ||
    phase === "done"
      ? phase
      : "idle";
  const hook = o.lastDeployHookStatus;
  const hookOk = hook === "skipped" || hook === "ok" || hook === "failed" ? hook : null;
  const base: GlobalPublishStatus = {
    lastAttemptAt: typeof o.lastAttemptAt === "string" ? o.lastAttemptAt : null,
    lastSuccessAt: typeof o.lastSuccessAt === "string" ? o.lastSuccessAt : null,
    lastFailedAt: typeof o.lastFailedAt === "string" ? o.lastFailedAt : null,
    lastError: typeof o.lastError === "string" ? o.lastError : null,
    lastPhase: validPhase,
    lastDeployHookStatus: hookOk,
    lastDeployHookHttpStatus: typeof o.lastDeployHookHttpStatus === "number" ? o.lastDeployHookHttpStatus : null,
    lastDeployHookMessage: typeof o.lastDeployHookMessage === "string" ? o.lastDeployHookMessage : null,
    lastDeployHookAttempts: typeof o.lastDeployHookAttempts === "number" ? o.lastDeployHookAttempts : null,
    deployHookInProgress: o.deployHookInProgress === true,
    lastDeployHookTriggeredAt:
      typeof o.lastDeployHookTriggeredAt === "string" ? o.lastDeployHookTriggeredAt : null,
    lastDeployHookSettledAt:
      typeof o.lastDeployHookSettledAt === "string" ? o.lastDeployHookSettledAt : null,
    vercelDeploymentUid: typeof o.vercelDeploymentUid === "string" ? o.vercelDeploymentUid : null,
    vercelDeploymentReadyState:
      typeof o.vercelDeploymentReadyState === "string" ? o.vercelDeploymentReadyState : null,
    vercelDeploymentInspectorUrl:
      typeof o.vercelDeploymentInspectorUrl === "string" ? o.vercelDeploymentInspectorUrl : null,
    vercelDeploymentErrorMessage:
      typeof o.vercelDeploymentErrorMessage === "string" ? o.vercelDeploymentErrorMessage : null,
    vercelDeploymentTrackedAt:
      typeof o.vercelDeploymentTrackedAt === "string" ? o.vercelDeploymentTrackedAt : null,
    storageVersionAfter: typeof o.storageVersionAfter === "string" ? o.storageVersionAfter : null,
  };
  return healStaleInProgress(base);
}

async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempPath = `${filePath}.tmp-${Date.now()}-${randomUUID()}`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

export async function readGlobalPublishStatus(): Promise<GlobalPublishStatus> {
  try {
    const raw = await fs.readFile(STATUS_PATH, "utf8");
    return healStaleInProgress(normalizeStatus(JSON.parse(raw) as unknown));
  } catch {
    return { ...DEFAULT_GLOBAL_PUBLISH_STATUS };
  }
}

export async function writeGlobalPublishStatus(next: GlobalPublishStatus): Promise<void> {
  await atomicWriteJson(STATUS_PATH, next);
}
