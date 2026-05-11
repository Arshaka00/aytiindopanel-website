import { randomUUID } from "node:crypto";

import { resolveDeployHookUrl, triggerDeployHookIfConfigured } from "@/lib/global-publish-deploy-hook";
import {
  resolveVercelApiToken,
  resolveVercelDeploymentAfterHook,
  resolveVercelTeamId,
  vercelBuildMonitoringSupported,
} from "@/lib/vercel-deployment-api";
import { getDraftLiveMtimeHint } from "@/lib/global-publish-draft-live-hint";
import { acquireGlobalPublishLock } from "@/lib/global-publish-lock";
import {
  readGlobalPublishStatus,
  writeGlobalPublishStatus,
  type GlobalPublishStatus,
} from "@/lib/global-publish-status";
import { runAfterSiteContentLiveUpdated } from "@/lib/site-content-after-publish";
import { getSiteContentVersionToken, publishSiteContentDraft } from "@/lib/site-content";
import type { SiteContent } from "@/lib/site-content-model";
import { appendAuditLog, type AuditEntry } from "@/lib/site-content-storage";

/** Antara dua publish global sukses (debounce server; cegah double-klik / burst). */
const MIN_MS_BETWEEN_SUCCESS = 1600;
/** Setelah deploy hook **sukses**, jeda sebelum POST hook lagi (anti spam / double deploy). */
const DEPLOY_HOOK_SUCCESS_COOLDOWN_MS = 45_000;

export type GlobalPublishOrchestratorResult =
  | {
      ok: true;
      content: SiteContent;
      revalidated: boolean;
      deployHook: "skipped" | "ok" | "failed";
      deployHookHttpStatus?: number;
      deployHookMessage?: string;
      deployHookAttempts?: number;
      deployHookResponseBody?: string;
      vercelDeploymentUid?: string | null;
      vercelDeploymentReadyState?: string | null;
      storageVersion: string;
    }
  | {
      ok: false;
      code: "LOCK_BUSY" | "DEBOUNCED" | "PUBLISH_FAILED" | "UNKNOWN";
      message: string;
    };

function mergeStatus(base: GlobalPublishStatus, patch: Partial<GlobalPublishStatus>): GlobalPublishStatus {
  return { ...base, ...patch };
}

export async function executeGlobalPublish(params: {
  actorRole: AuditEntry["actorRole"];
  actorId: string;
  ip: string;
  userAgent: string;
  deviceBound: boolean;
}): Promise<GlobalPublishOrchestratorResult> {
  const lock = await acquireGlobalPublishLock(params.actorId);
  if (!lock) {
    return {
      ok: false,
      code: "LOCK_BUSY",
      message:
        "Publish global sedang berjalan di sesi lain. Tunggu hingga selesai, lalu coba lagi. Jika macet lebih dari beberapa menit, kunci akan dilepas otomatis.",
    };
  }

  let statusSnapshot = await readGlobalPublishStatus();
  const now = Date.now();
  try {
    if (statusSnapshot.lastSuccessAt) {
      const last = new Date(statusSnapshot.lastSuccessAt).getTime();
      if (Number.isFinite(last) && now - last < MIN_MS_BETWEEN_SUCCESS) {
        return {
          ok: false,
          code: "DEBOUNCED",
          message: "Publish global baru saja selesai. Tunggu sebentar sebelum menjalankan lagi.",
        };
      }
    }

    const attemptAt = new Date().toISOString();
    statusSnapshot = mergeStatus(statusSnapshot, {
      lastAttemptAt: attemptAt,
      lastError: null,
      lastPhase: "publish_content",
      deployHookInProgress: false,
    });
    await writeGlobalPublishStatus(statusSnapshot);

    let live: SiteContent;
    try {
      live = await publishSiteContentDraft();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal publish draft ke live.";
      const failedAt = new Date().toISOString();
      await writeGlobalPublishStatus(
        mergeStatus(await readGlobalPublishStatus(), {
          lastFailedAt: failedAt,
          lastError: msg,
          lastPhase: "idle",
          deployHookInProgress: false,
        }),
      );
      return { ok: false, code: "PUBLISH_FAILED", message: msg };
    }

    statusSnapshot = mergeStatus(await readGlobalPublishStatus(), { lastPhase: "revalidate" });
    await writeGlobalPublishStatus(statusSnapshot);

    let revalidated = false;
    try {
      const r = await runAfterSiteContentLiveUpdated();
      revalidated = r.revalidated;
    } catch {
      revalidated = false;
    }

    statusSnapshot = mergeStatus(await readGlobalPublishStatus(), { lastPhase: "deploy_hook" });
    await writeGlobalPublishStatus(statusSnapshot);

    const url = resolveDeployHookUrl();
    let hook: Awaited<ReturnType<typeof triggerDeployHookIfConfigured>>;

    if (!url) {
      hook = await triggerDeployHookIfConfigured();
    } else {
      const st = await readGlobalPublishStatus();
      const settled = st.lastDeployHookSettledAt;
      const lastOk = st.lastDeployHookStatus === "ok";
      const elapsed = settled ? Date.now() - new Date(settled).getTime() : Number.POSITIVE_INFINITY;
      const recentOk = lastOk && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < DEPLOY_HOOK_SUCCESS_COOLDOWN_MS;

      if (recentOk) {
        const remain = Math.max(1, Math.ceil((DEPLOY_HOOK_SUCCESS_COOLDOWN_MS - elapsed) / 1000));
        hook = {
          status: "skipped",
          message: `Deploy hook dalam jeda ${remain}s setelah sukses (anti spam). Konten live & cache sudah terbarui.`,
        };
      } else {
        await writeGlobalPublishStatus(
          mergeStatus(await readGlobalPublishStatus(), {
            deployHookInProgress: true,
            lastDeployHookTriggeredAt: new Date().toISOString(),
          }),
        );
        try {
          hook = await triggerDeployHookIfConfigured();
        } finally {
          await writeGlobalPublishStatus(
            mergeStatus(await readGlobalPublishStatus(), {
              deployHookInProgress: false,
              lastDeployHookSettledAt: new Date().toISOString(),
            }),
          ).catch(() => {});
        }
      }
    }

    const token = await getSiteContentVersionToken();

    let vercelUid: string | null = null;
    let vercelReady: string | null = null;
    let vercelInspector: string | null = null;
    let vercelErr: string | null = null;
    const hookUrl = resolveDeployHookUrl();
    const apiTok = resolveVercelApiToken();
    if (hook.status === "ok" && hook.responseBody && apiTok && hookUrl) {
      try {
        const v = await resolveVercelDeploymentAfterHook({
          hookUrl,
          hookResponseBody: hook.responseBody,
          token: apiTok,
          teamId: resolveVercelTeamId(),
        });
        vercelUid = v.uid;
        vercelReady = v.readyState;
        vercelInspector = v.inspectorUrl;
        vercelErr = v.errorMessage;
      } catch {
        /* monitoring opsional — tidak gagalkan publish */
      }
    }

    const successAt = new Date().toISOString();
    const prevStatus = await readGlobalPublishStatus();
    const vercelPatch: Partial<GlobalPublishStatus> = {};
    if (vercelUid) {
      vercelPatch.vercelDeploymentUid = vercelUid;
      vercelPatch.vercelDeploymentReadyState = vercelReady;
      vercelPatch.vercelDeploymentInspectorUrl = vercelInspector;
      vercelPatch.vercelDeploymentErrorMessage = vercelErr;
      vercelPatch.vercelDeploymentTrackedAt = successAt;
    }
    await writeGlobalPublishStatus(
      mergeStatus(prevStatus, {
        lastPhase: "done",
        lastSuccessAt: successAt,
        lastFailedAt: null,
        lastError: null,
        lastDeployHookStatus: hook.status,
        lastDeployHookHttpStatus: hook.httpStatus ?? null,
        lastDeployHookMessage: hook.message ?? null,
        lastDeployHookAttempts: hook.attempts ?? null,
        deployHookInProgress: false,
        storageVersionAfter: token,
        ...vercelPatch,
      }),
    );

    await appendAuditLog({
      id: randomUUID(),
      at: successAt,
      action: "global_publish",
      actorRole: params.actorRole,
      actorId: params.actorId,
      ip: params.ip,
      userAgent: params.userAgent,
      deviceBound: params.deviceBound,
      detail: {
        revalidated,
        deployHook: hook.status,
        deployHookHttpStatus: hook.httpStatus,
        deployHookAttempts: hook.attempts,
        vercelDeploymentUid: vercelUid,
      },
    });

    return {
      ok: true,
      content: live,
      revalidated,
      deployHook: hook.status,
      deployHookHttpStatus: hook.httpStatus,
      deployHookMessage: hook.message,
      deployHookAttempts: hook.attempts,
      deployHookResponseBody: hook.responseBody,
      vercelDeploymentUid: vercelUid,
      vercelDeploymentReadyState: vercelReady,
      storageVersion: token,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menjalankan publish global.";
    await writeGlobalPublishStatus(
      mergeStatus(await readGlobalPublishStatus(), {
        lastFailedAt: new Date().toISOString(),
        lastError: msg,
        lastPhase: "idle",
        deployHookInProgress: false,
      }),
    ).catch(() => {});
    return { ok: false, code: "UNKNOWN", message: msg };
  } finally {
    await lock.release();
  }
}

export async function getGlobalPublishStatusPayload(): Promise<{
  status: GlobalPublishStatus;
  draftLiveHint: Awaited<ReturnType<typeof getDraftLiveMtimeHint>>;
  deployHookConfigured: boolean;
  vercelBuildMonitor: {
    supported: boolean;
    deploymentUid: string | null;
    readyState: string | null;
    inspectorUrl: string | null;
    errorMessage: string | null;
  };
}> {
  const { resolveDeployHookUrl } = await import("@/lib/global-publish-deploy-hook");
  const [status, draftLiveHint] = await Promise.all([readGlobalPublishStatus(), getDraftLiveMtimeHint()]);
  const hookUrl = resolveDeployHookUrl();
  const supported = vercelBuildMonitoringSupported(hookUrl ?? "");
  return {
    status,
    draftLiveHint,
    deployHookConfigured: Boolean(hookUrl),
    vercelBuildMonitor: {
      supported,
      deploymentUid: status.vercelDeploymentUid,
      readyState: status.vercelDeploymentReadyState,
      inspectorUrl: status.vercelDeploymentInspectorUrl,
      errorMessage: status.vercelDeploymentErrorMessage,
    },
  };
}
