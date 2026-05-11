import { randomUUID } from "node:crypto";

import {
  isCooldownDeployHookMessage,
  isOutdatedDeployHookSkippedMessage,
  resolveDeployHookResolution,
  triggerDeployHookIfConfigured,
  type DeployHookPublicMeta,
  type DeployHookResult,
} from "@/lib/global-publish-deploy-hook";
import {
  parseVercelIntegrationDeployHookUrl,
  resolveVercelApiToken,
  resolveVercelDeploymentAfterHook,
  resolveVercelTeamId,
  tryResolveLatestDeploymentUidFromProject,
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
import { hasVercelKvEnv } from "@/lib/cms-storage/env";
import { getDeployRuntimeFingerprint } from "@/lib/deploy-build-marker";
import { captureException } from "@/lib/observability";
import { appendAuditLog, type AuditEntry } from "@/lib/site-content-storage";
import { logEvent } from "@/lib/structured-log";

/** Antara dua publish global sukses (debounce server; cegah double-klik / burst). */
const MIN_MS_BETWEEN_SUCCESS = 1600;
/** Setelah deploy hook **sukses**, jeda sebelum POST hook lagi (anti spam / double deploy). */
const DEPLOY_HOOK_SUCCESS_COOLDOWN_MS = 45_000;

export type GlobalPublishOrchestratorResult =
  | {
      ok: true;
      revalidated: boolean;
      deployHook: "skipped" | "ok" | "failed";
      deployHookHttpStatus?: number;
      deployHookMessage?: string;
      deployHookAttempts?: number;
      /** `cooldown` = hook sengaja tidak dipanggil lagi; bukan gagal konfigurasi. */
      deployHookSkipKind: "cooldown" | "config" | null;
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

function hookSkipKind(hook: DeployHookResult): "cooldown" | "config" | null {
  if (hook.status !== "skipped") return null;
  return isCooldownDeployHookMessage(hook.message) ? "cooldown" : "config";
}

/** Normalisasi field Vercel di KV supaya UID lama tidak “nempel” setelah hook gagal/config skip; cooldown mempertahankan UID terakhir. */
function buildVercelPersistencePatch(args: {
  prev: GlobalPublishStatus;
  hook: DeployHookResult;
  resolved: {
    uid: string | null;
    readyState: string | null;
    inspectorUrl: string | null;
    errorMessage: string | null;
  };
  successAt: string;
}): Partial<GlobalPublishStatus> {
  const { prev, hook, resolved, successAt } = args;
  const { uid, readyState, inspectorUrl, errorMessage } = resolved;
  if (uid) {
    return {
      vercelDeploymentUid: uid,
      vercelDeploymentReadyState: readyState,
      vercelDeploymentInspectorUrl: inspectorUrl,
      vercelDeploymentErrorMessage: errorMessage,
      vercelDeploymentTrackedAt: successAt,
    };
  }
  if (hook.status === "skipped" && isCooldownDeployHookMessage(hook.message)) {
    return {
      vercelDeploymentUid: prev.vercelDeploymentUid,
      vercelDeploymentReadyState: prev.vercelDeploymentReadyState,
      vercelDeploymentInspectorUrl: prev.vercelDeploymentInspectorUrl,
      vercelDeploymentErrorMessage: prev.vercelDeploymentErrorMessage,
      vercelDeploymentTrackedAt: prev.vercelDeploymentTrackedAt,
    };
  }
  return {
    vercelDeploymentUid: null,
    vercelDeploymentReadyState: null,
    vercelDeploymentInspectorUrl: null,
    vercelDeploymentErrorMessage: null,
    vercelDeploymentTrackedAt: null,
  };
}

/** Kegagalan KV (transien) di tengah alur tidak boleh membatalkan publish draft→live. */
function safeWriteGlobalPublishStatus(next: GlobalPublishStatus, phase: string): Promise<void> {
  return writeGlobalPublishStatus(next).catch((err) => {
    void captureException(err instanceof Error ? err : new Error(String(err)), {
      area: "global-publish-orchestrator",
      reason: "writeGlobalPublishStatus",
      phase,
    });
  });
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
        logEvent("info", "global_publish_debounced", { actorId: params.actorId, lastSuccessAt: statusSnapshot.lastSuccessAt });
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
    await safeWriteGlobalPublishStatus(statusSnapshot, "attempt_start");

    logEvent("info", "global_publish_start", { actorId: params.actorId, actorRole: params.actorRole, attemptAt });

    try {
      await publishSiteContentDraft();
      logEvent("info", "global_publish_live_saved", { actorId: params.actorId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal publish draft ke live.";
      const failedAt = new Date().toISOString();
      logEvent("error", "global_publish_live_failed", { actorId: params.actorId, message: msg });
      await safeWriteGlobalPublishStatus(
        mergeStatus(await readGlobalPublishStatus(), {
          lastFailedAt: failedAt,
          lastError: msg,
          lastPhase: "idle",
          deployHookInProgress: false,
        }),
        "publish_failed",
      );
      return { ok: false, code: "PUBLISH_FAILED", message: msg };
    }

    statusSnapshot = mergeStatus(await readGlobalPublishStatus(), { lastPhase: "revalidate" });
    await safeWriteGlobalPublishStatus(statusSnapshot, "revalidate");

    let revalidated = false;
    try {
      const r = await runAfterSiteContentLiveUpdated();
      revalidated = r.revalidated;
      logEvent("info", "global_publish_cache_revalidated", { actorId: params.actorId, revalidated });
    } catch {
      revalidated = false;
      logEvent("warn", "global_publish_cache_revalidate_error", { actorId: params.actorId });
    }

    statusSnapshot = mergeStatus(await readGlobalPublishStatus(), { lastPhase: "deploy_hook" });
    await safeWriteGlobalPublishStatus(statusSnapshot, "deploy_hook");

    const hookDeploy = resolveDeployHookResolution();
    const url = hookDeploy.url;
    let hook: Awaited<ReturnType<typeof triggerDeployHookIfConfigured>>;
    let cooldownSkip = false;

    if (!url) {
      hook = await triggerDeployHookIfConfigured();
    } else {
      const st = await readGlobalPublishStatus();
      const settled = st.lastDeployHookSettledAt;
      const lastOk = st.lastDeployHookStatus === "ok";
      const elapsed = settled ? Date.now() - new Date(settled).getTime() : Number.POSITIVE_INFINITY;
      const recentOk = lastOk && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < DEPLOY_HOOK_SUCCESS_COOLDOWN_MS;

      if (recentOk) {
        cooldownSkip = true;
        const remain = Math.max(1, Math.ceil((DEPLOY_HOOK_SUCCESS_COOLDOWN_MS - elapsed) / 1000));
        hook = {
          status: "skipped",
          message: `Deploy hook dalam jeda ${remain}s setelah sukses (anti spam). Konten live & cache sudah terbarui.`,
        };
        logEvent("info", "global_publish_hook_skipped_cooldown", { actorId: params.actorId, remainSec: remain });
      } else {
        await safeWriteGlobalPublishStatus(
          mergeStatus(await readGlobalPublishStatus(), {
            deployHookInProgress: true,
            lastDeployHookTriggeredAt: new Date().toISOString(),
          }),
          "hook_trigger",
        );
        try {
          hook = await triggerDeployHookIfConfigured();
          if (hook.status === "ok") {
            logEvent("info", "global_publish_hook_triggered", {
              actorId: params.actorId,
              httpStatus: hook.httpStatus,
              attempts: hook.attempts,
            });
          } else if (hook.status === "failed") {
            logEvent("warn", "global_publish_hook_failed", {
              actorId: params.actorId,
              httpStatus: hook.httpStatus,
              attempts: hook.attempts,
            });
          }
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
    const apiTok = resolveVercelApiToken();
    const teamId = resolveVercelTeamId();
    if (hook.status === "ok" && apiTok && url) {
      try {
        if (hook.responseBody?.trim()) {
          const v = await resolveVercelDeploymentAfterHook({
            hookUrl: url,
            hookResponseBody: hook.responseBody,
            token: apiTok,
            teamId,
          });
          vercelUid = v.uid;
          vercelReady = v.readyState;
          vercelInspector = v.inspectorUrl;
          vercelErr = v.errorMessage;
        }
        if (!vercelUid) {
          const fb = await tryResolveLatestDeploymentUidFromProject({
            hookUrl: url,
            token: apiTok,
            teamId,
          });
          if (fb.uid) {
            vercelUid = fb.uid;
            vercelReady = fb.readyState;
            vercelInspector = fb.inspectorUrl;
            vercelErr = fb.errorMessage;
            logEvent("info", "global_publish_deployment_uid_fallback_list", {
              actorId: params.actorId,
              uid: vercelUid,
            });
          }
        }
        if (vercelUid) {
          logEvent("info", "global_publish_deployment_uid_detected", {
            actorId: params.actorId,
            uid: vercelUid,
            readyState: vercelReady,
          });
        }
      } catch (err) {
        logEvent("warn", "global_publish_deployment_uid_resolution_error", {
          actorId: params.actorId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const successAt = new Date().toISOString();
    const prevStatus = await readGlobalPublishStatus();
    const vercelPersistence = buildVercelPersistencePatch({
      prev: prevStatus,
      hook,
      resolved: {
        uid: vercelUid,
        readyState: vercelReady,
        inspectorUrl: vercelInspector,
        errorMessage: vercelErr,
      },
      successAt,
    });

    const skipKind = hookSkipKind(hook);
    try {
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
          ...vercelPersistence,
        }),
      );
      logEvent("info", "global_publish_status_written", {
        actorId: params.actorId,
        deployHook: hook.status,
        skipKind,
        uid: vercelPersistence.vercelDeploymentUid ?? null,
      });
    } catch (statusWriteErr) {
      void captureException(statusWriteErr instanceof Error ? statusWriteErr : new Error(String(statusWriteErr)), {
        area: "global-publish-orchestrator",
        reason: "writeGlobalPublishStatus failed after successful publish",
      });
      logEvent("warn", "global_publish_status_write_failed_live_ok", {
        actorId: params.actorId,
        message: statusWriteErr instanceof Error ? statusWriteErr.message : String(statusWriteErr),
      });
    }

    try {
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
      logEvent("info", "global_publish_audit_appended", { actorId: params.actorId });
    } catch (auditErr) {
      void captureException(auditErr instanceof Error ? auditErr : new Error(String(auditErr)), {
        area: "global-publish-orchestrator",
        reason: "appendAuditLog failed after successful publish (live sudah tersimpan)",
      });
      logEvent("warn", "global_publish_audit_skipped", {
        actorId: params.actorId,
        message: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }

    logEvent("info", "global_publish_success", {
      actorId: params.actorId,
      revalidated,
      deployHook: hook.status,
      uid: vercelUid,
      cooldownSkip,
    });

    return {
      ok: true,
      revalidated,
      deployHook: hook.status,
      deployHookHttpStatus: hook.httpStatus,
      deployHookMessage: hook.message,
      deployHookAttempts: hook.attempts,
      deployHookSkipKind: skipKind,
      vercelDeploymentUid: vercelUid,
      vercelDeploymentReadyState: vercelReady,
      storageVersion: token,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menjalankan publish global.";
    logEvent("error", "global_publish_unknown_failure", {
      actorId: params.actorId,
      message: msg,
    });
    await safeWriteGlobalPublishStatus(
      mergeStatus(await readGlobalPublishStatus(), {
        lastFailedAt: new Date().toISOString(),
        lastError: msg,
        lastPhase: "idle",
        deployHookInProgress: false,
      }),
      "unknown_failure",
    );
    return { ok: false, code: "UNKNOWN", message: msg };
  } finally {
    await lock.release().catch(() => {});
  }
}

function getServerDeploymentEnv(): "production" | "preview" | "development" | null {
  const v = process.env.VERCEL_ENV;
  if (v === "production" || v === "preview" || v === "development") return v;
  if (process.env.VERCEL !== "1") {
    return process.env.NODE_ENV === "development" ? "development" : null;
  }
  return null;
}

export async function getGlobalPublishStatusPayload(): Promise<{
  status: GlobalPublishStatus;
  draftLiveHint: Awaited<ReturnType<typeof getDraftLiveMtimeHint>>;
  deployHookConfigured: boolean;
  /** Diagnostik aman (tanpa URL); sama dengan `resolveDeployHookResolution().meta`. */
  deployHookMeta: DeployHookPublicMeta;
  /** `vercel_tmp` = serverless tanpa KV — status tidak konsisten antar Lambda (panel bisa tampak kosong). */
  publishGlobalStatusPersistence: "kv" | "vercel_tmp" | "local";
  /** `preview` = deployment PR/preview — env bertanda hanya Production tidak tersedia (lihat Vercel). */
  serverDeploymentEnv: "production" | "preview" | "development" | null;
  /** Bandingkan dengan `git log -1` / deployment Vercel — pastikan bukan build/cache lama. */
  deployRuntime: ReturnType<typeof getDeployRuntimeFingerprint> & { liveContentVersion: string };
  vercelBuildMonitor: {
    supported: boolean;
    /** URL hook cocok pola `api.vercel.com/v1/integrations/deploy/...` (respons job JSON). */
    integrationUrlParsed: boolean;
    /** Token API terset di server (wajib agar `supported` true). */
    apiTokenConfigured: boolean;
    deploymentUid: string | null;
    readyState: string | null;
    inspectorUrl: string | null;
    errorMessage: string | null;
  };
}> {
  const [statusRaw, draftLiveHint, liveContentVersion] = await Promise.all([
    readGlobalPublishStatus(),
    getDraftLiveMtimeHint(),
    getSiteContentVersionToken(),
  ]);
  const { url: hookUrl, meta: deployHookMeta } = resolveDeployHookResolution();
  const integrationUrlParsed = Boolean(hookUrl && parseVercelIntegrationDeployHookUrl(hookUrl));
  const apiTokenConfigured = Boolean(resolveVercelApiToken());
  const supported = vercelBuildMonitoringSupported(hookUrl ?? "");
  let status =
    deployHookMeta.configured &&
    statusRaw.lastDeployHookStatus === "skipped" &&
    isOutdatedDeployHookSkippedMessage(statusRaw.lastDeployHookMessage)
      ? {
          ...statusRaw,
          lastDeployHookMessage:
            "Hook HTTPS terdeteksi di server; teks lama dari publish sebelum env lengkap disembunyikan.",
        }
      : statusRaw;
  if (
    deployHookMeta.configured &&
    status.lastDeployHookStatus === "skipped" &&
    isCooldownDeployHookMessage(status.lastDeployHookMessage) &&
    status.lastSuccessAt
  ) {
    const succ = new Date(status.lastSuccessAt).getTime();
    const settledMs = status.lastDeployHookSettledAt ? new Date(status.lastDeployHookSettledAt).getTime() : 0;
    if (Number.isFinite(succ) && (!settledMs || succ >= settledMs - 3000)) {
      status = {
        ...status,
        lastDeployHookMessage:
          "Hook dalam cooldown (publish sukses sebelumnya). Konten live & cache sudah diperbarui — tunggu jeda atau buka Deployment di Vercel.",
      };
    }
  }
  return {
    status,
    draftLiveHint,
    deployHookConfigured: deployHookMeta.configured,
    deployHookMeta,
    publishGlobalStatusPersistence: hasVercelKvEnv()
      ? "kv"
      : process.env.VERCEL === "1"
        ? "vercel_tmp"
        : "local",
    serverDeploymentEnv: getServerDeploymentEnv(),
    deployRuntime: {
      ...getDeployRuntimeFingerprint(),
      liveContentVersion,
    },
    vercelBuildMonitor: {
      supported,
      integrationUrlParsed,
      apiTokenConfigured,
      deploymentUid: status.vercelDeploymentUid,
      readyState: status.vercelDeploymentReadyState,
      inspectorUrl: status.vercelDeploymentInspectorUrl,
      errorMessage: status.vercelDeploymentErrorMessage,
    },
  };
}
