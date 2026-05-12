import { cookies, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

function shortSha(sha: string | undefined): string {
  if (!sha) return "—";
  const t = sha.trim();
  return t.length > 10 ? `${t.slice(0, 7)}…` : t;
}

export default async function SiteAdminDeploymentPage() {
  const allowed = isAllowedAdminDevice(await headers(), await cookies());
  if (!allowed) notFound();

  const content = await getSiteContent();
  const { published, maintenanceMode } = content.siteSettings;
  const onVercel = process.env.VERCEL === "1";
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? "";
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() ?? "";
  const vercelEnv = process.env.VERCEL_ENV?.trim() ?? "";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim() ?? "";
  const vercelUrl = process.env.VERCEL_URL?.trim() ?? "";
  const createdAt = process.env.VERCEL_DEPLOYMENT_CREATED_AT?.trim() ?? "";

  const previewUrl = vercelUrl ? `https://${vercelUrl}` : null;
  const deploymentDashboardUrl = deploymentId ? `https://vercel.com/deployments/${encodeURIComponent(deploymentId)}` : null;

  let deployTimeLabel = "—";
  if (createdAt) {
    const asNum = Number(createdAt);
    if (!Number.isNaN(asNum) && asNum > 1e12) {
      deployTimeLabel = new Date(asNum).toISOString();
    } else {
      const parsed = Date.parse(createdAt);
      deployTimeLabel = Number.isNaN(parsed) ? createdAt : new Date(parsed).toISOString();
    }
  } else if (!onVercel) {
    deployTimeLabel = "Lokal (bukan deployment Vercel)";
  }

  const siteLiveStatus =
    maintenanceMode ? "Maintenance (pengunjung)" : published ? "Tayang (published)" : "Tidak tayang";

  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">Internal</p>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Deployment</h1>
          <p className="text-sm text-slate-400">
            Alur: <span className="text-slate-200">localhost</span> → <span className="text-slate-200">git push</span> →{" "}
            <span className="text-slate-200">Vercel auto deploy</span> → <span className="text-slate-200">production</span>.
            Branch production mengikuti repo GitHub yang terhubung ke proyek Vercel (set ke <code className="text-sky-300">main</code>{" "}
            di pengaturan Vercel).
          </p>
          <p className="text-xs text-slate-500">
            Tidak ada publish orchestration di aplikasi — hanya deploy dari Git.
          </p>
        </header>

        <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/12 to-slate-900/60 p-6 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/85">Ringkas</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-500">Git branch (build)</dt>
              <dd className="font-mono text-slate-100">{gitRef || (onVercel ? "—" : "— (set VERCEL_GIT_COMMIT_REF di CI)")}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-500">Git commit (build)</dt>
              <dd className="break-all font-mono text-slate-100">{shortSha(gitSha)}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-500">Vercel environment</dt>
              <dd className="font-mono text-slate-100">{vercelEnv || (onVercel ? "—" : "development / local")}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-500">Waktu deploy (Vercel)</dt>
              <dd className="break-all font-mono text-xs text-slate-100">{deployTimeLabel}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-slate-500">Status konten (Site Settings)</dt>
              <dd className="text-slate-100">{siteLiveStatus}</dd>
            </div>
            {deploymentId ? (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-slate-500">Deployment ID</dt>
                <dd className="break-all font-mono text-xs text-slate-100">{deploymentId}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            {deploymentDashboardUrl ? (
              <a
                href={deploymentDashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-2.5 text-center text-sm font-semibold text-violet-100 transition hover:border-violet-300/55 hover:bg-violet-500/25"
              >
                Buka di Vercel (deployment ini)
              </a>
            ) : null}
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-center text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Dashboard Vercel
            </a>
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-400/35 bg-sky-500/12 px-4 py-2.5 text-center text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
              >
                URL preview (hostname deployment)
              </a>
            ) : null}
          </div>
        </div>

        <p className="text-center text-sm">
          <Link href="/site-admin" className="font-medium text-sky-300 hover:text-sky-200 hover:underline">
            ← Panel CMS
          </Link>
        </p>
      </div>
    </main>
  );
}
