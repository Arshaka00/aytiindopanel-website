"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type GpStatus = {
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
  lastDeployHookStatus: string | null;
  lastDeployHookSettledAt: string | null;
  lastDeployHookAttempts: number | null;
  deployHookInProgress?: boolean;
  likelyDraftAheadOfLive: boolean | null;
};

type DeployRuntimeLite = {
  gitCommitShort: string | null;
  liveContentVersion: string;
};

function formatShort(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(d);
}

function truncateMiddle(s: string | null, max = 36): string {
  if (!s) return "—";
  if (s.length <= max) return s;
  const half = Math.floor((max - 1) / 2);
  return `${s.slice(0, half)}…${s.slice(-half)}`;
}

export function SiteAdminDeploymentCard() {
  const [gp, setGp] = useState<GpStatus | null>(null);
  const [hook, setHook] = useState<boolean | null>(null);
  const [workflowEnabled, setWorkflowEnabled] = useState(true);
  const [deployRuntime, setDeployRuntime] = useState<DeployRuntimeLite | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/site-content/global-publish/status", { credentials: "include" });
      if (!r.ok) return;
      const j = (await r.json()) as {
        globalPublishWorkflowEnabled?: boolean;
        status?: GpStatus;
        deployHookConfigured?: boolean;
        draftLiveHint?: { likelyDraftAheadOfLive?: boolean | null };
        deployRuntime?: DeployRuntimeLite;
      };
      setWorkflowEnabled(j.globalPublishWorkflowEnabled !== false);
      if (j.deployRuntime) {
        setDeployRuntime({
          gitCommitShort: j.deployRuntime.gitCommitShort ?? null,
          liveContentVersion: j.deployRuntime.liveContentVersion,
        });
      }
      if (j.status) {
        setGp({
          lastSuccessAt: j.status.lastSuccessAt ?? null,
          lastAttemptAt: j.status.lastAttemptAt ?? null,
          lastDeployHookStatus: j.status.lastDeployHookStatus ?? null,
          lastDeployHookSettledAt: j.status.lastDeployHookSettledAt ?? null,
          lastDeployHookAttempts: j.status.lastDeployHookAttempts ?? null,
          deployHookInProgress: j.status.deployHookInProgress === true,
          likelyDraftAheadOfLive: j.draftLiveHint?.likelyDraftAheadOfLive ?? null,
        });
      }
      if (typeof j.deployHookConfigured === "boolean") setHook(j.deployHookConfigured);
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const deployRunning = gp?.deployHookInProgress === true;
  const deployLabel = deployRunning
    ? "Memproses hook…"
    : gp?.lastDeployHookStatus === "ok"
      ? `OK · ${formatShort(gp.lastDeployHookSettledAt)}`
      : gp?.lastDeployHookStatus === "failed"
        ? "Gagal (cek log)"
        : gp?.lastDeployHookStatus === "skipped"
          ? hook === false
            ? "Belum di-set"
            : "Dilewati / jeda"
          : "—";

  const pending =
    gp?.likelyDraftAheadOfLive === true ? "Draft lebih baru" : gp?.likelyDraftAheadOfLive === false ? "Selaras" : "—";

  if (!workflowEnabled) {
    return (
      <Link
        href="/site-admin/deployment"
        className="group relative block overflow-hidden rounded-2xl border border-violet-400/22 bg-gradient-to-br from-violet-500/[0.09] via-slate-950/72 to-slate-950/92 p-6 shadow-md shadow-violet-950/25 backdrop-blur-md transition duration-300 hover:border-violet-400/36 hover:shadow-lg hover:shadow-violet-950/30 md:p-7"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(92%_58%_at_100%_0%,rgba(139,92,246,0.07),transparent_56%)] opacity-95 transition-opacity group-hover:opacity-100" aria-hidden />

        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">Development</p>
            <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">Deployment</h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              <strong className="font-medium text-slate-200">Production mengikuti deployment terbaru dari branch main.</strong>{" "}
              Publish global dinonaktifkan — bandingkan commit &amp; marker di halaman ini dengan Vercel.
            </p>
          </div>

          <dl className="grid gap-3 rounded-xl border border-white/[0.07] bg-black/18 px-4 py-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Commit (build)</dt>
              <dd className="mt-1 font-mono text-xs text-slate-200">{deployRuntime?.gitCommitShort ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Live storage token</dt>
              <dd className="mt-1 font-mono text-xs text-slate-200">
                {deployRuntime ? truncateMiddle(deployRuntime.liveContentVersion, 32) : "—"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
            <p className="text-xs text-slate-500">Set CMS_ENABLE_GLOBAL_PUBLISH=true untuk mengaktifkan kembali orkestrasi lama.</p>
            <span className="text-sm font-semibold text-violet-200/95 transition group-hover:text-white">
              Buka halaman deployment →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/site-admin/deployment"
      className="group relative block overflow-hidden rounded-2xl border border-violet-400/22 bg-gradient-to-br from-violet-500/[0.09] via-slate-950/72 to-slate-950/92 p-6 shadow-md shadow-violet-950/25 backdrop-blur-md transition duration-300 hover:border-violet-400/36 hover:shadow-lg hover:shadow-violet-950/30 md:p-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(92%_58%_at_100%_0%,rgba(139,92,246,0.07),transparent_56%)] opacity-95 transition-opacity group-hover:opacity-100" aria-hidden />

      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-200/80">Operations</p>
            <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">Git Deployment Flow</h2>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              Publish global: konten live, revalidate cache, middleware sync, deploy hook HTTPS, dan monitoring build bila
              dikonfigurasi — satu alur operasional.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              hook === true
                ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-100/95"
                : "border-white/10 bg-black/25 text-slate-400"
            }`}
          >
            {hook === true ? "Auto-deploy" : "Hook off"}
          </span>
        </div>

        <dl className="grid gap-3.5 rounded-xl border border-white/[0.07] bg-black/18 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Last deployment</dt>
            <dd className="mt-1 font-mono text-xs tabular-nums text-slate-200">{formatShort(gp?.lastSuccessAt ?? null)}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Deploy status</dt>
            <dd className="mt-1 text-xs text-slate-200">{deployLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Hook attempts</dt>
            <dd className="mt-1 font-mono text-xs text-slate-200">{gp?.lastDeployHookAttempts ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Pending changes</dt>
            <dd className="mt-1 text-xs text-slate-200">{pending}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
          <p className="text-xs text-slate-500">
            {hook === false ? "Set CMS_DEPLOY_HOOK_URL (https) untuk auto production." : "Environment siap memicu build production."}
          </p>
          <span className="text-sm font-semibold text-violet-200/95 transition group-hover:text-white">
            Buka halaman deployment →
          </span>
        </div>
      </div>
    </Link>
  );
}
