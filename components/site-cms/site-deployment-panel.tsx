"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { isOutdatedDeployHookSkippedMessage } from "@/lib/global-publish-deploy-hook";
import type { SiteContent } from "@/lib/site-content-model";
import { getSiteSettingsGateHeaderName } from "@/lib/site-settings-gate";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  const entry = document.cookie.split("; ").find((c) => c.startsWith(key));
  if (!entry) return "";
  return decodeURIComponent(entry.slice(key.length));
}

function friendlyPublishPhase(phase: string): string {
  const map: Record<string, string> = {
    idle: "Siap",
    publish_content: "Menerbitkan konten",
    revalidate: "Memperbarui cache",
    deploy_hook: "Deploy hook",
    done: "Selesai",
  };
  return map[phase] ?? phase;
}

function sitePublishStateLabel(settings: SiteContent["siteSettings"] | null): string {
  if (!settings) return "—";
  if (settings.maintenanceMode) return "Maintenance aktif";
  if (!settings.published) return "Mode tidak tayang";
  return "Mode tayang (live)";
}

function truncateMiddle(s: string | null, max = 44): string {
  if (!s) return "—";
  if (s.length <= max) return s;
  const half = Math.floor((max - 1) / 2);
  return `${s.slice(0, half)}…${s.slice(-half)}`;
}

type GlobalPublishStatusView = {
  status: {
    lastAttemptAt: string | null;
    lastSuccessAt: string | null;
    lastFailedAt: string | null;
    lastError: string | null;
    lastPhase: string;
    lastDeployHookStatus: string | null;
    lastDeployHookHttpStatus: number | null;
    lastDeployHookMessage: string | null;
    lastDeployHookAttempts: number | null;
    deployHookInProgress?: boolean;
    lastDeployHookTriggeredAt: string | null;
    lastDeployHookSettledAt: string | null;
    vercelDeploymentUid: string | null;
    vercelDeploymentReadyState: string | null;
    vercelDeploymentInspectorUrl: string | null;
    vercelDeploymentErrorMessage: string | null;
    vercelDeploymentTrackedAt: string | null;
    storageVersionAfter: string | null;
  };
  draftLiveHint: {
    draftMtimeMs: number | null;
    liveMtimeMs: number | null;
    likelyDraftAheadOfLive: boolean | null;
  };
  deployHookConfigured: boolean;
  /** Sesuai VERCEL_ENV pada deployment ini — preview tidak memuat env Production-only. */
  serverDeploymentEnv?: "production" | "preview" | "development" | null;
  deployHookMeta?: {
    configured: boolean;
    source: string | null;
    protocol: string | null;
    rejectReason: string;
    rawCmsKeyPresent: boolean;
    rawVercelKeyPresent: boolean;
    cmsCandidateNonEmpty: boolean;
    vercelCandidateNonEmpty: boolean;
    hostLength: number | null;
    pathnameLength: number | null;
  };
  /** Tanpa `kv` di Vercel, riwayat publish di API bisa kosong antar request (penyimpanan /tmp). */
  publishGlobalStatusPersistence?: "kv" | "vercel_tmp" | "local";
  vercelBuildMonitor: {
    supported: boolean;
    integrationUrlParsed?: boolean;
    apiTokenConfigured?: boolean;
    deploymentUid: string | null;
    readyState: string | null;
    inspectorUrl: string | null;
    errorMessage: string | null;
  };
};

function formatIsoDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function parseIsoToMs(iso: string | null | undefined): number | null {
  if (!iso || typeof iso !== "string") return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function formatRelativeShort(isoMs: number, nowMs: number): string {
  const diffSec = Math.max(0, Math.floor((nowMs - isoMs) / 1000));
  if (diffSec < 50) return "Baru saja";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)} j lalu`;
  if (diffSec < 172_800) return "Kemarin";
  const d = Math.floor(diffSec / 86_400);
  return `${d} h lalu`;
}

/**
 * Hook terpasang di runtime.
 * Pakai OR antara boolean duplikat di payload: kadang klien/hidrasi hanya mengisi salah satu;
 * meta.configured saja bisa membuat strip “off” padahal deployHookConfigured masih true dari server.
 */
function isDeployHookConfigured(gp: GlobalPublishStatusView | null | undefined): boolean {
  if (!gp) return false;
  return Boolean(gp.deployHookConfigured || gp.deployHookMeta?.configured);
}

/** Skip + pesan lama "belum set env" padahal runtime kini mengenali hook. */
function isStaleOrOutdatedSkippedHookCopy(
  configured: boolean | undefined,
  lastStatus: string | null | undefined,
  msg: string | null | undefined,
): boolean {
  return Boolean(configured && lastStatus === "skipped" && isOutdatedDeployHookSkippedMessage(msg));
}

function formatDeployHookRuntimeHint(
  meta: GlobalPublishStatusView["deployHookMeta"] | undefined,
): string | null {
  if (!meta) return null;
  const parts = [
    `reject=${meta.rejectReason}`,
    meta.source ? `source=${meta.source}` : null,
    meta.protocol ? `protocol=${meta.protocol}` : null,
    `keys CMS=${meta.rawCmsKeyPresent} VERCEL_HOOK=${meta.rawVercelKeyPresent}`,
    `nonEmpty CMS=${meta.cmsCandidateNonEmpty} VERCEL=${meta.vercelCandidateNonEmpty}`,
    meta.hostLength != null ? `hostLen=${meta.hostLength}` : null,
    meta.pathnameLength != null ? `pathLen=${meta.pathnameLength}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function clipDetail(s: string | null | undefined, max = 96): string | undefined {
  if (!s) return undefined;
  const t = s.trim();
  if (!t) return undefined;
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

type DeploymentTimelineVariant = "progress" | "ok" | "warn" | "err" | "muted";

type DeploymentTimelineRow = {
  key: string;
  label: string;
  detail?: string;
  atMs: number;
  variant: DeploymentTimelineVariant;
};

const VERCEL_TERMINAL = new Set(["READY", "ERROR", "CANCELED", "DELETED"]);

/** Turunan murni dari status publish global + polling Vercel (tanpa API baru). */
function buildDeploymentActivityTimeline(
  gp: GlobalPublishStatusView | null,
  vercelPoll: { readyState: string | null; inspectorUrl: string | null; errorMessage: string | null } | null,
  globalPublishBusy: boolean,
  nowMs: number,
): DeploymentTimelineRow[] {
  const rows: DeploymentTimelineRow[] = [];
  const s = gp?.status;
  const mon = gp?.vercelBuildMonitor;

  if (globalPublishBusy) {
    rows.push({
      key: "client-publish",
      label: "Publish global berlangsung",
      detail: "Draft → live, revalidate, deploy hook…",
      atMs: nowMs,
      variant: "progress",
    });
  }

  if (!s) {
    return rows.sort((a, b) => b.atMs - a.atMs).slice(0, 7);
  }

  const liveRs =
    vercelPoll?.readyState ?? mon?.readyState ?? s.vercelDeploymentReadyState ?? null;
  const uid = mon?.deploymentUid ?? s.vercelDeploymentUid ?? null;
  const liveErr =
    vercelPoll?.errorMessage ?? mon?.errorMessage ?? s.vercelDeploymentErrorMessage ?? null;

  if (uid) {
    const trackedMs = parseIsoToMs(s.vercelDeploymentTrackedAt);
    let label = "Build production · menunggu status";
    let variant: DeploymentTimelineVariant = "muted";
    if (liveRs === "READY") {
      label = "Build production siap";
      variant = "ok";
    } else if (liveRs === "ERROR") {
      label = "Build production gagal";
      variant = "err";
    } else if (liveRs === "CANCELED" || liveRs === "DELETED") {
      label = `Build · ${liveRs}`;
      variant = "warn";
    } else if (liveRs && !VERCEL_TERMINAL.has(liveRs)) {
      label = `Build production · ${liveRs}`;
      variant = "progress";
    }
    rows.push({
      key: "vercel-build",
      label,
      detail: liveErr ? clipDetail(liveErr, 88) : undefined,
      atMs: trackedMs ?? parseIsoToMs(s.lastDeployHookSettledAt) ?? nowMs,
      variant,
    });
  }

  const settledMs = parseIsoToMs(s.lastDeployHookSettledAt);
  if (settledMs != null) {
    const st = s.lastDeployHookStatus;
    let label = "Deployment hook selesai";
    let variant: DeploymentTimelineVariant = "muted";
    if (st === "ok") {
      label = "Deployment dipicu · hook OK";
      variant = "ok";
    } else if (st === "failed") {
      label = "Deployment hook gagal";
      variant = "err";
    } else if (st === "skipped") {
      label = "Deployment hook dilewati";
      variant = "warn";
    }
    rows.push({
      key: "hook-settled",
      label,
      detail:
        st === "failed"
          ? clipDetail(s.lastDeployHookMessage, 100)
          : st === "skipped" &&
              isDeployHookConfigured(gp) &&
              isOutdatedDeployHookSkippedMessage(s.lastDeployHookMessage)
            ? "Pesan lama di penyimpanan — hook sekarang terdeteksi di server."
            : undefined,
      atMs: settledMs,
      variant,
    });
  }

  const trigMs = parseIsoToMs(s.lastDeployHookTriggeredAt);
  if (trigMs != null && (settledMs == null || trigMs < settledMs - 1500)) {
    rows.push({
      key: "hook-trigger",
      label: "Deployment production dipicu",
      atMs: trigMs,
      variant: "muted",
    });
  }

  const successMs = parseIsoToMs(s.lastSuccessAt);
  const attemptMs = parseIsoToMs(s.lastAttemptAt);
  if (successMs != null && attemptMs != null && successMs - attemptMs < 4000) {
    rows.push({
      key: "publish-done",
      label: "Publish selesai · draft tersinkron & cache diperbarui",
      atMs: successMs,
      variant: "ok",
    });
  } else {
    if (successMs != null) {
      rows.push({
        key: "live-cache",
        label: "Konten live & cache diperbarui",
        atMs: successMs,
        variant: "ok",
      });
    }
    if (attemptMs != null && (!successMs || attemptMs <= successMs - 1000)) {
      rows.push({
        key: "publish-start",
        label: "Publish dimulai",
        atMs: attemptMs,
        variant: "muted",
      });
    }
  }

  const failMs = parseIsoToMs(s.lastFailedAt);
  const failWins = failMs != null && (successMs == null || failMs > successMs);
  if (failWins) {
    rows.push({
      key: "publish-fail",
      label: "Publish gagal",
      detail: clipDetail(s.lastError, 120),
      atMs: failMs,
      variant: "err",
    });
  }

  rows.sort((a, b) => b.atMs - a.atMs);
  const seen = new Set<string>();
  const deduped: DeploymentTimelineRow[] = [];
  for (const r of rows) {
    const sig = `${r.key}:${Math.floor(r.atMs / 1000)}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    deduped.push(r);
    if (deduped.length >= 7) break;
  }
  return deduped;
}

const DEPLOYMENT_TIMELINE_DOT: Record<DeploymentTimelineVariant, string> = {
  progress: "bg-sky-400/85 shadow-[0_0_0_3px_rgba(56,189,248,0.12)]",
  ok: "bg-emerald-400/75 shadow-[0_0_0_3px_rgba(52,211,153,0.1)]",
  warn: "bg-amber-400/70 shadow-[0_0_0_3px_rgba(251,191,36,0.1)]",
  err: "bg-rose-400/80 shadow-[0_0_0_3px_rgba(251,113,133,0.12)]",
  muted: "bg-slate-500/55 shadow-[0_0_0_2px_rgba(100,116,139,0.12)]",
};

function DeploymentActivityTimeline({
  gp,
  vercelPoll,
  globalPublishBusy,
}: {
  gp: GlobalPublishStatusView | null;
  vercelPoll: { readyState: string | null; inspectorUrl: string | null; errorMessage: string | null } | null;
  globalPublishBusy: boolean;
}) {
  const rows = useMemo(() => {
    const now = Date.now();
    return buildDeploymentActivityTimeline(gp, vercelPoll, globalPublishBusy, now);
  }, [gp, vercelPoll, globalPublishBusy]);

  return (
    <section
      className="mt-6 border-t border-white/[0.07] pt-5"
      aria-labelledby="deployment-activity-timeline-heading"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3
          id="deployment-activity-timeline-heading"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Recent deployment activity
        </h3>
        <span className="text-[9px] font-medium uppercase tracking-wide text-slate-600">Ringkas</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          {gp?.publishGlobalStatusPersistence === "vercel_tmp"
            ? "Riwayat tidak muncul di server tanpa Vercel KV (penyimpanan status tidak tetap antar Lambda). Pasang KV_REST_API_URL + KV_REST_API_TOKEN di Production, redeploy, lalu publish lagi — atau cek deployment di dashboard Vercel."
            : "Belum ada aktivitas deployment tercatat."}
        </p>
      ) : (
        <ul className="mt-3 max-h-[11.5rem] space-y-2.5 overflow-y-auto pr-0.5 sm:max-h-40">
          {rows.map((row) => (
            <li key={row.key} className="flex gap-2.5 sm:gap-3">
              <span
                className={`mt-1.5 size-1.5 shrink-0 rounded-full ${DEPLOYMENT_TIMELINE_DOT[row.variant]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-slate-200">{row.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                  {formatRelativeShort(row.atMs, Date.now())}
                  {row.detail ? ` · ${row.detail}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Status deploy hook + monitoring build Vercel (API token di server). */
function DeployProductionStrip({
  gp,
  globalPublishBusy,
  vercelPoll,
}: {
  gp: GlobalPublishStatusView | null;
  globalPublishBusy: boolean;
  vercelPoll: { readyState: string | null; inspectorUrl: string | null; errorMessage: string | null } | null;
}) {
  const s = gp?.status;
  const mon = gp?.vercelBuildMonitor;
  const hookMetaHint = formatDeployHookRuntimeHint(gp?.deployHookMeta);
  const hookOk = isDeployHookConfigured(gp);
  const previewNoProdEnv = gp?.serverDeploymentEnv === "preview" && !hookOk;
  const inProgress = Boolean(globalPublishBusy || s?.deployHookInProgress);
  let tone: "amber" | "emerald" | "rose" | "slate" = "slate";
  let title = "Siap";
  let detail = hookOk
    ? "Deploy hook HTTPS aktif di server. Publish Global → draft ke live, revalidate cache, lalu POST ke hook production."
    : "Tekan Publish Global untuk menerbitkan konten, memperbarui cache, dan memicu deployment production (set env hook https:// bila perlu).";
  if (!hookOk && hookMetaHint) {
    detail = `${detail} · Runtime: ${hookMetaHint}`;
  }

  if (inProgress) {
    tone = "amber";
    title = "Sedang berjalan";
    detail = globalPublishBusy
      ? "Alur: draft → live → revalidate cache → deploy hook (hingga 3 percobaan, timeout 60s)."
      : "Deploy hook sedang dipanggil dari server…";
  } else if (s?.lastDeployHookStatus === "ok") {
    tone = "emerald";
    title = "Deploy production sukses";
    detail = `Hook diterima ${formatIsoDateTime(s.lastDeployHookSettledAt ?? null)}${
      typeof s.lastDeployHookAttempts === "number" ? ` · ${s.lastDeployHookAttempts} percobaan HTTP` : ""
    }. Build production biasanya berjalan di latar belakang — pantau dashboard Vercel / CI Anda.`;
  } else if (s?.lastDeployHookStatus === "failed") {
    tone = "rose";
    title = "Deploy production gagal";
    detail = (s.lastDeployHookMessage ?? "Konten live tetap aman — periksa URL hook, secret Vercel, dan log build.")
      .slice(0, 220);
  } else if (s?.lastDeployHookStatus === "skipped") {
    tone = "slate";
    const stale = isStaleOrOutdatedSkippedHookCopy(hookOk, s.lastDeployHookStatus, s.lastDeployHookMessage);
    title =
      hookOk && stale
        ? "Deploy hook siap"
        : hookOk
          ? "Deploy hook — publish terakhir"
          : "Deploy hook tidak dijalankan";
    detail = !hookOk
      ? `Deploy hook tidak terbaca valid di runtime server (wajib https://). Publish & cache tetap berhasil.${
          hookMetaHint ? ` · ${hookMetaHint}` : ""
        }`
      : stale
        ? "Env deploy hook sudah benar di server; teks lama di bawah dari publish sebelum env lengkap. Jalankan Publish Global lagi untuk memicu deployment production."
        : (() => {
            const raw = s.lastDeployHookMessage ?? "Dilewati (cooldown atau kebijakan server).";
            if (hookOk && isOutdatedDeployHookSkippedMessage(raw)) {
              return "Cooldown / skip server — pesan penyimpanan di bawah mungkin dari publish lama; aman diabaikan atau jalankan Publish Global lagi.";
            }
            return raw.slice(0, 280);
          })();
  }

  const shell =
    tone === "amber"
      ? "border-amber-400/35 bg-amber-500/[0.09] shadow-[inset_0_1px_0_rgba(251,191,36,0.12)]"
      : tone === "emerald"
        ? "border-emerald-400/28 bg-emerald-500/[0.08] shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]"
        : tone === "rose"
          ? "border-rose-400/32 bg-rose-500/[0.08] shadow-[inset_0_1px_0_rgba(251,113,133,0.1)]"
          : "border-white/[0.08] bg-white/[0.04]";

  const deploymentUid = mon?.deploymentUid ?? s?.vercelDeploymentUid ?? null;
  const vercelMonitoringLive = Boolean(mon?.supported && deploymentUid);

  const liveBuild =
    vercelPoll?.readyState ?? mon?.readyState ?? s?.vercelDeploymentReadyState ?? null;
  const liveInspector =
    vercelPoll?.inspectorUrl ?? mon?.inspectorUrl ?? s?.vercelDeploymentInspectorUrl ?? null;
  const liveErr = vercelPoll?.errorMessage ?? mon?.errorMessage ?? s?.vercelDeploymentErrorMessage ?? null;
  const buildTerminal = new Set(["READY", "ERROR", "CANCELED", "DELETED"]);
  const buildBusy = Boolean(liveBuild && !buildTerminal.has(liveBuild));
  let buildTone: "amber" | "emerald" | "rose" | "slate" = "slate";
  if (buildBusy) buildTone = "amber";
  else if (liveBuild === "READY") buildTone = "emerald";
  else if (liveBuild === "ERROR" || liveBuild === "CANCELED" || liveBuild === "DELETED") buildTone = "rose";

  const buildShell =
    buildTone === "amber"
      ? "border-sky-400/30 bg-sky-500/[0.07]"
      : buildTone === "emerald"
        ? "border-emerald-400/25 bg-emerald-500/[0.06]"
        : buildTone === "rose"
          ? "border-rose-400/28 bg-rose-500/[0.06]"
          : "border-white/[0.07] bg-white/[0.03]";

  return (
    <div className="mt-5 space-y-3">
      {previewNoProdEnv ? (
        <div
          className="rounded-xl border border-amber-400/35 bg-amber-500/[0.09] px-4 py-3 text-[11px] leading-relaxed text-amber-50/95"
          role="status"
        >
          <p className="m-0 font-semibold text-amber-100">Deployment Preview — env Production tidak dipakai di sini</p>
          <p className="m-0 mt-1.5 text-amber-50/90">
            Host ini memakai <code className="rounded bg-black/25 px-1">VERCEL_ENV=preview</code>. Variabel yang di Vercel hanya di-scope{" "}
            <strong>Production</strong> (mis. <code className="rounded bg-black/25 px-1">CMS_DEPLOY_HOOK_URL</code>){" "}
            <strong>tidak terbaca</strong> di deployment preview. Buka Deployment Center dari domain production (mis.{" "}
            <strong>www.aytiindopanel.com</strong>), atau di Vercel salin env yang sama untuk environment{" "}
            <strong>Preview</strong> juga.
          </p>
        </div>
      ) : null}
      <div
        className={`rounded-xl border px-4 py-3.5 ${shell} ${inProgress ? "motion-safe:animate-pulse" : ""}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Production deployment</p>
        <p
          className={`mt-1.5 text-sm font-semibold tracking-tight ${
            tone === "amber"
              ? "text-amber-50"
              : tone === "emerald"
                ? "text-emerald-50"
                : tone === "rose"
                  ? "text-rose-50"
                  : "text-slate-100"
          }`}
        >
          {title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{detail}</p>
      </div>

      {vercelMonitoringLive ? (
        <div
          className={`rounded-xl border px-4 py-3 ${buildShell} ${buildBusy ? "motion-safe:animate-pulse" : ""}`}
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Build Vercel (monitoring)</p>
          <p className="mt-1.5 font-mono text-sm font-semibold tracking-tight text-slate-100">
            {liveBuild ?? "Menunggu status…"}
          </p>
          {liveErr ? <p className="mt-1 text-xs text-rose-200/90">{liveErr}</p> : null}
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            Polling server setiap ~5s (maks ~3 menit). Token API hanya di server (
            <code className="rounded bg-black/30 px-1 text-[10px]">CMS_VERCEL_API_TOKEN</code> /{" "}
            <code className="rounded bg-black/30 px-1 text-[10px]">VERCEL_API_TOKEN</code>
            ).
          </p>
          {liveInspector ? (
            <a
              href={liveInspector}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs font-semibold text-sky-300 hover:text-sky-200 hover:underline"
            >
              Buka inspector deployment →
            </a>
          ) : null}
        </div>
      ) : mon?.supported && !deploymentUid ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <p className="m-0 font-medium text-slate-400">Monitoring Vercel siap</p>
          <p className="m-0 mt-1.5">
            Token &amp; format URL hook sudah cocok untuk API, tetapi belum ada UID deployment tercatat dari publish
            terakhir. Setelah <strong>Publish Global</strong> sukses memanggil hook dan respons berisi job, status
            BUILDING/READY akan muncul di blok ini.
          </p>
          {gp?.publishGlobalStatusPersistence === "vercel_tmp" ? (
            <p className="m-0 mt-2 border-t border-white/[0.06] pt-2 text-slate-500">
              Tanpa <strong>KV</strong>, server tidak menyimpan UID/riwayat secara konsisten di panel ini — deploy tetap
              bisa berjalan; pasang <code className="rounded bg-black/25 px-1">KV_REST_API_URL</code> +{" "}
              <code className="rounded bg-black/25 px-1">KV_REST_API_TOKEN</code> agar status di halaman ini stabil.
            </p>
          ) : null}
        </div>
      ) : hookOk ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
          {mon?.integrationUrlParsed === false ? (
            <p className="m-0">
              Panel BUILDING/READY membutuhkan URL hook standar Vercel (
              <code className="rounded bg-black/25 px-1">api.vercel.com/v1/integrations/deploy/…</code>
              ). Hook Anda tetap dipanggil saat publish jika URL valid — cek deployment di dashboard Vercel.
            </p>
          ) : mon?.apiTokenConfigured === false ? (
            <p className="m-0">
              URL hook sudah cocok pola integrasi. Untuk status BUILDING/READY di sini, tambahkan{" "}
              <code className="rounded bg-black/25 px-1">CMS_VERCEL_API_TOKEN</code> atau{" "}
              <code className="rounded bg-black/25 px-1">VERCEL_API_TOKEN</code> (Production) dengan izin baca deployment.
            </p>
          ) : (
            <p className="m-0">
              Setelah publish global sukses memanggil hook, status build akan muncul di sini bila respons hook berisi job
              deployment.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
          Monitoring build Vercel nonaktif — set{" "}
          <code className="rounded bg-black/25 px-1">CMS_DEPLOY_HOOK_URL</code> (URL{" "}
          <code className="rounded bg-black/25 px-1">api.vercel.com/v1/integrations/deploy/…</code>) + token API untuk
          status READY / BUILDING di panel ini.
        </p>
      )}
    </div>
  );
}

export function SiteDeploymentPanel({
  gateToken,
  onGateInvalid,
}: {
  gateToken: string;
  onGateInvalid?: () => void;
}) {
  const router = useRouter();
  const gateHeaders = useMemo(
    () =>
      ({
        [getSiteSettingsGateHeaderName()]: gateToken,
      }) as Record<string, string>,
    [gateToken],
  );
  const [role, setRole] = useState("viewer");
  const [settingsLite, setSettingsLite] = useState<SiteContent["siteSettings"] | null>(null);
  const [globalPublishBusy, setGlobalPublishBusy] = useState(false);
  const [globalPublishFeedback, setGlobalPublishFeedback] = useState("");
  const [gpSnapshot, setGpSnapshot] = useState<GlobalPublishStatusView | null>(null);
  const [vercelPoll, setVercelPoll] = useState<{
    readyState: string | null;
    inspectorUrl: string | null;
    errorMessage: string | null;
  } | null>(null);

  const loadContext = useCallback(async () => {
    try {
      const r = await fetch("/api/site-content?siteSettingsContext=1", {
        credentials: "include",
        headers: gateHeaders,
      });
      if (r.status === 403) {
        onGateInvalid?.();
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { content?: SiteContent; role?: string };
      setRole(j.role ?? "viewer");
      if (j.content?.siteSettings) {
        setSettingsLite(structuredClone(j.content.siteSettings));
      }
    } catch {
      /* noop */
    }
  }, [gateHeaders, onGateInvalid]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  const loadGlobalPublishStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/site-content/global-publish/status", {
        credentials: "include",
      });
      if (!r.ok) return;
      const j = (await r.json()) as GlobalPublishStatusView;
      setGpSnapshot(j);
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    const boot = window.setTimeout(() => void loadGlobalPublishStatus(), 0);
    const t = window.setInterval(() => void loadGlobalPublishStatus(), 30_000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(t);
    };
  }, [loadGlobalPublishStatus]);

  useEffect(() => {
    const mon = gpSnapshot?.vercelBuildMonitor;
    const terminal = new Set(["READY", "ERROR", "CANCELED", "DELETED"]);
    if (!mon?.supported || !mon.deploymentUid) {
      setVercelPoll(null);
      return;
    }
    if (mon.readyState && terminal.has(mon.readyState)) {
      setVercelPoll(null);
      return;
    }
    const deploymentUid = mon.deploymentUid;
    let iv: ReturnType<typeof setInterval> | undefined;
    let runs = 0;
    const tick = async () => {
      runs += 1;
      if (runs > 42) {
        if (iv) clearInterval(iv);
        return;
      }
      try {
        const r = await fetch(
          `/api/site-content/vercel-deployment-status?uid=${encodeURIComponent(deploymentUid)}`,
          { credentials: "include" },
        );
        const j = (await r.json().catch(() => ({}))) as {
          ok?: boolean;
          enabled?: boolean;
          readyState?: string;
          inspectorUrl?: string | null;
          errorMessage?: string | null;
        };
        if (j.enabled && typeof j.readyState === "string") {
          setVercelPoll({
            readyState: j.readyState,
            inspectorUrl: j.inspectorUrl ?? null,
            errorMessage: j.errorMessage ?? null,
          });
          if (terminal.has(j.readyState)) {
            if (iv) clearInterval(iv);
            await loadGlobalPublishStatus();
          }
        }
      } catch {
        /* abaikan */
      }
    };
    iv = setInterval(() => void tick(), 5000);
    void tick();
    return () => {
      if (iv) clearInterval(iv);
    };
  }, [
    gpSnapshot?.vercelBuildMonitor?.supported,
    gpSnapshot?.vercelBuildMonitor?.deploymentUid,
    gpSnapshot?.vercelBuildMonitor?.readyState,
    loadGlobalPublishStatus,
  ]);

  const publishGlobal = async () => {
    if (globalPublishBusy) return;
    setGlobalPublishBusy(true);
    setGlobalPublishFeedback("Menjalankan: publish → cache → deploy production…");
    try {
      const r = await fetch("/api/site-content/global-publish", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-cms-csrf-token": getCookie("cms_csrf_token"),
          ...gateHeaders,
        },
      });
      const rawBody = await r.text();
      let j: {
        ok?: boolean;
        error?: string;
        code?: string;
        deployHook?: string;
        deployHookHttpStatus?: number;
        deployHookMessage?: string;
        deployHookAttempts?: number;
        vercelDeploymentUid?: string | null;
        vercelDeploymentReadyState?: string | null;
        revalidated?: boolean;
      } = {};
      try {
        j = rawBody ? (JSON.parse(rawBody) as typeof j) : {};
      } catch {
        j = {};
      }
      if (r.status === 403) {
        onGateInvalid?.();
        setGlobalPublishFeedback("Akses pengaturan situs perlu dibuka kunci lagi.");
        return;
      }
      if (!r.ok) {
        const detail = [typeof j.code === "string" ? j.code : null, typeof j.error === "string" ? j.error : null]
          .filter(Boolean)
          .join(" · ");
        throw new Error(
          detail ||
            (rawBody.startsWith("<")
              ? `Publish global gagal (HTTP ${r.status}). Respons bukan JSON — cek log deployment Vercel.`
              : `Publish global gagal (HTTP ${r.status}).`),
        );
      }
      const rev = j.revalidated === false ? " Cache halaman mungkin perlu beberapa detik." : "";
      let deployLine = "";
      if (j.deployHook === "ok") {
        deployLine = ` Deploy production: dipicu (HTTP ${j.deployHookHttpStatus ?? "—"}${typeof j.deployHookAttempts === "number" ? `, ${j.deployHookAttempts} percobaan` : ""}).`;
      } else if (j.deployHook === "failed") {
        deployLine = ` Deploy production: gagal (HTTP ${j.deployHookHttpStatus ?? "—"}). Konten live aman. ${(j.deployHookMessage ?? "").slice(0, 120)}`;
      } else if (j.deployHook === "skipped") {
        const rawSkip = j.deployHookMessage ?? "dilewati.";
        const skipUi = isOutdatedDeployHookSkippedMessage(rawSkip)
          ? "dilewati (pesan konfigurasi lama dari server — jika env hook sudah benar, abaikan dan cek Deployment Center)."
          : rawSkip.slice(0, 160);
        deployLine = ` Deploy: ${skipUi}`;
      }
      if (j.vercelDeploymentUid) {
        deployLine += ` Build Vercel dilacak (UID). Status: ${j.vercelDeploymentReadyState ?? "…"}.`;
      }
      setGlobalPublishFeedback(`Publish global selesai.${deployLine}${rev}`);
      router.refresh();
      await loadGlobalPublishStatus();
      await loadContext();
    } catch (e) {
      setGlobalPublishFeedback(e instanceof Error ? e.message : "Publish global gagal.");
    } finally {
      setGlobalPublishBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 md:max-w-4xl md:space-y-8">
      <header className="space-y-3 text-center md:space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">CMS · operations</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Deployment Center</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
          Mission control untuk publish global, status deploy, cache, dan monitoring. Pengaturan domain &amp; SEO ada di{" "}
          <Link className="font-medium text-cyan-300/90 hover:text-cyan-200 hover:underline" href="/site-admin/site-settings">
            Site Settings
          </Link>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link
            href="/site-admin"
            className="font-medium text-sky-300/90 hover:text-sky-200 hover:underline"
          >
            ← Panel CMS
          </Link>
          <Link
            href="/site-admin/site-settings"
            className="font-medium text-cyan-300/90 hover:text-cyan-200 hover:underline"
          >
            Site Settings →
          </Link>
        </div>
      </header>

      <section
        id="deployment-center"
        aria-labelledby="deployment-center-heading"
        className="relative scroll-mt-24 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.07] via-slate-950/58 to-slate-950/92 p-6 shadow-md shadow-black/20 backdrop-blur-md md:p-8"
      >
        <span id="global-publish" className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/78">Operations · mission control</p>
            <h2 id="deployment-center-heading" className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Status &amp; aksi
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
              Publish global, revalidate, deploy hook, monitoring build — tanpa form konfigurasi di halaman ini.
            </p>
          </div>
          {isDeployHookConfigured(gpSnapshot) ? (
            <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95">
              Auto-deploy aktif
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Auto-deploy off
            </span>
          )}
        </div>

        <DeployProductionStrip gp={gpSnapshot} globalPublishBusy={globalPublishBusy} vercelPoll={vercelPoll} />

        <DeploymentActivityTimeline
          gp={gpSnapshot}
          vercelPoll={vercelPoll}
          globalPublishBusy={globalPublishBusy}
        />

        <dl className="mt-6 grid gap-4 rounded-xl border border-white/[0.07] bg-black/14 px-4 py-4 text-xs sm:grid-cols-2 lg:grid-cols-3 md:px-5 md:py-5">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Terakhir publish global</dt>
            <dd className="mt-1.5 tabular-nums text-sm text-slate-100">
              {formatIsoDateTime(gpSnapshot?.status.lastSuccessAt ?? null)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Percobaan terakhir</dt>
            <dd className="mt-1.5 tabular-nums text-sm text-slate-200">
              {formatIsoDateTime(gpSnapshot?.status.lastAttemptAt ?? null)}
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Runtime server (diagnostik)</dt>
            <dd className="mt-1.5 break-all font-mono text-[11px] leading-snug text-slate-400">
              VERCEL_ENV={gpSnapshot?.serverDeploymentEnv ?? "—"} · hook=
              {isDeployHookConfigured(gpSnapshot) ? "on" : "off"} · reject=
              {gpSnapshot?.deployHookMeta?.rejectReason ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status deploy hook</dt>
            <dd className="mt-1.5 text-sm leading-snug text-slate-200">
              {gpSnapshot?.status.lastDeployHookStatus === "ok"
                ? `Sukses${gpSnapshot.status.lastDeployHookHttpStatus != null ? ` · HTTP ${gpSnapshot.status.lastDeployHookHttpStatus}` : ""}`
                : gpSnapshot?.status.lastDeployHookStatus === "failed"
                  ? `Gagal${gpSnapshot.status.lastDeployHookHttpStatus != null ? ` · HTTP ${gpSnapshot.status.lastDeployHookHttpStatus}` : ""}`
                  : gpSnapshot?.status.lastDeployHookStatus === "skipped"
                    ? isStaleOrOutdatedSkippedHookCopy(
                        isDeployHookConfigured(gpSnapshot),
                        gpSnapshot.status.lastDeployHookStatus,
                        gpSnapshot.status.lastDeployHookMessage,
                      )
                      ? "Siap (pesan lama — publish lagi)"
                      : isDeployHookConfigured(gpSnapshot)
                        ? "Dilewati (cooldown / pesan server)"
                        : `Off · ${formatDeployHookRuntimeHint(gpSnapshot.deployHookMeta) ?? "periksa env Production"}`
                    : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Deploy hook selesai</dt>
            <dd className="mt-1.5 tabular-nums text-sm text-slate-200">
              {formatIsoDateTime(gpSnapshot?.status.lastDeployHookSettledAt ?? null)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Percobaan HTTP hook</dt>
            <dd className="mt-1.5 font-mono text-sm text-slate-200">
              {gpSnapshot?.status.lastDeployHookAttempts != null ? gpSnapshot.status.lastDeployHookAttempts : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cache state</dt>
            <dd className="mt-1.5 text-sm leading-snug text-slate-200">
              {gpSnapshot?.status.lastSuccessAt
                ? "Layout / data cache diperbarui saat publish sukses (revalidate root)."
                : gpSnapshot?.publishGlobalStatusPersistence === "vercel_tmp"
                  ? "Server tidak mengembalikan catatan publish terakhir (typical tanpa KV di Vercel). Publish bisa tetap sukses — pasang KV agar status & UID muncul konsisten di panel."
                  : "Belum ada publish global tercatat."}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Pending changes</dt>
            <dd className="mt-1.5 text-sm leading-snug text-slate-200">
              {gpSnapshot?.draftLiveHint.likelyDraftAheadOfLive === true
                ? "Heuristik: draft lebih baru dari live (mtime) — publish global disarankan."
                : gpSnapshot?.draftLiveHint.likelyDraftAheadOfLive === false
                  ? "Heuristik: berkas draft & live selaras."
                  : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Fase terakhir</dt>
            <dd className="mt-1.5 text-sm text-slate-200">{friendlyPublishPhase(gpSnapshot?.status.lastPhase ?? "idle")}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Environment (Site Settings)</dt>
            <dd className="mt-1.5 text-sm text-slate-200">{sitePublishStateLabel(settingsLite)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Versi penyimpanan (sesudah publish)</dt>
            <dd className="mt-1.5 break-all font-mono text-[11px] leading-snug text-slate-300">
              {truncateMiddle(gpSnapshot?.status.storageVersionAfter ?? null)}
            </dd>
          </div>
        </dl>

        {gpSnapshot?.status.lastError ? (
          <p className="mt-4 rounded-lg border border-amber-400/28 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs leading-relaxed text-amber-50/95">
            <span className="font-semibold text-amber-200/95">Error terakhir: </span>
            {gpSnapshot.status.lastError}
          </p>
        ) : null}
        {globalPublishFeedback ? (
          <p className="mt-4 text-xs leading-relaxed text-violet-100/90">{globalPublishFeedback}</p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => void loadGlobalPublishStatus()}
            className="order-2 rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] sm:order-1"
          >
            Segarkan status
          </button>
          <button
            type="button"
            onClick={() => void publishGlobal()}
            disabled={globalPublishBusy || role !== "super_admin"}
            className="order-1 inline-flex min-h-[2.85rem] w-full items-center justify-center rounded-lg border border-violet-300/40 bg-violet-500/22 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-500/32 disabled:cursor-not-allowed disabled:opacity-40 sm:order-2 sm:w-auto sm:min-w-[12rem]"
          >
            {globalPublishBusy ? (
              <span className="inline-flex items-center gap-2.5">
                <span
                  className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white"
                  aria-hidden
                />
                Publish & deploy…
              </span>
            ) : (
              "Publish Global"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
