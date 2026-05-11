/** Base URL REST Vercel. */
const VERCEL_API = "https://api.vercel.com";

export function resolveVercelApiToken(): string | null {
  const t = process.env.CMS_VERCEL_API_TOKEN?.trim() || process.env.VERCEL_API_TOKEN?.trim();
  return t || null;
}

export function resolveVercelTeamId(): string | undefined {
  const t = process.env.VERCEL_TEAM_ID?.trim();
  return t || undefined;
}

/** URL deploy hook integrasi Vercel: /v1/integrations/deploy/{projectId}/{deployHookId} */
export function parseVercelIntegrationDeployHookUrl(hookUrl: string): { projectId: string; deployHookId: string } | null {
  try {
    const u = new URL(hookUrl);
    if (u.hostname !== "api.vercel.com") return null;
    const m = u.pathname.match(/^\/v1\/integrations\/deploy\/([^/]+)\/([^/]+)\/?$/);
    if (!m) return null;
    return { projectId: m[1], deployHookId: m[2] };
  } catch {
    return null;
  }
}

export type VercelHookJob = { id: string; state: string; createdAt: number };

function numOrNow(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : Date.now();
}

/**
 * Body respons POST deploy hook Vercel bermacam format; ambil id yang bisa dipakai GET deployment.
 */
export function parseVercelDeployHookJobJson(body: string): VercelHookJob | null {
  const trimmed = body?.trim() ?? "";
  if (!trimmed) return null;
  try {
    const j = JSON.parse(trimmed) as Record<string, unknown>;
    const job = j.job as Record<string, unknown> | undefined;
    if (job && typeof job.id === "string" && job.id.length > 0 && typeof job.createdAt === "number") {
      return {
        id: job.id,
        state: typeof job.state === "string" ? job.state : "UNKNOWN",
        createdAt: job.createdAt,
      };
    }
    const dep = j.deployment as Record<string, unknown> | undefined;
    if (dep) {
      const uid = typeof dep.uid === "string" ? dep.uid : typeof dep.id === "string" ? dep.id : null;
      if (uid) {
        return {
          id: uid,
          state: typeof dep.readyState === "string" ? dep.readyState : "UNKNOWN",
          createdAt:
            typeof dep.createdAt === "number"
              ? dep.createdAt
              : typeof dep.buildingAt === "number"
                ? dep.buildingAt
                : Date.now(),
        };
      }
    }
    const topUid = typeof j.uid === "string" ? j.uid : typeof j.deploymentId === "string" ? j.deploymentId : null;
    const topCreated =
      typeof j.createdAt === "number"
        ? j.createdAt
        : typeof j.created === "number"
          ? j.created
          : Date.now();
    if (topUid) {
      return { id: topUid, state: "UNKNOWN", createdAt: topCreated };
    }
    const nested = j.data as Record<string, unknown> | undefined;
    if (nested) {
      const id =
        typeof nested.deploymentId === "string"
          ? nested.deploymentId
          : typeof nested.id === "string"
            ? nested.id
            : null;
      if (id) return { id, state: "UNKNOWN", createdAt: numOrNow(nested.createdAt) };
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type DeploymentGetOk = {
  ok: true;
  uid: string;
  readyState: string;
  url: string | null;
  inspectorUrl: string | null;
  errorMessage: string | null;
};

type DeploymentGetFail = { ok: false; httpStatus: number; error: string };

export async function getVercelDeploymentByUid(params: {
  token: string;
  teamId?: string;
  uid: string;
}): Promise<DeploymentGetOk | DeploymentGetFail> {
  const sp = new URLSearchParams();
  if (params.teamId) sp.set("teamId", params.teamId);
  const q = sp.toString();
  const url = `${VERCEL_API}/v13/deployments/${encodeURIComponent(params.uid)}${q ? `?${q}` : ""}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${params.token}` },
      signal: AbortSignal.timeout(20_000),
    });
    const text = await r.text().catch(() => "");
    if (!r.ok) return { ok: false, httpStatus: r.status, error: text.slice(0, 300) };
    const j = JSON.parse(text) as {
      uid?: string;
      readyState?: string;
      url?: string | null;
      inspectorUrl?: string | null;
      errorMessage?: string | null;
    };
    return {
      ok: true,
      uid: j.uid ?? params.uid,
      readyState: j.readyState ?? "UNKNOWN",
      url: j.url ?? null,
      inspectorUrl: j.inspectorUrl ?? null,
      errorMessage: j.errorMessage ?? null,
    };
  } catch (e) {
    return { ok: false, httpStatus: 0, error: e instanceof Error ? e.message : "fetch error" };
  }
}

/** Deployment terbaru setelah `sinceMs` untuk project (untuk menemukan UID dari deploy hook). */
export async function listVercelDeploymentsSince(params: {
  token: string;
  teamId?: string;
  projectId: string;
  sinceMs: number;
  limit?: number;
}): Promise<{ uid: string; createdAt: number; readyState?: string }[]> {
  const sp = new URLSearchParams({
    projectId: params.projectId,
    since: String(Math.max(0, params.sinceMs)),
    limit: String(params.limit ?? 10),
  });
  if (params.teamId) sp.set("teamId", params.teamId);
  const url = `${VERCEL_API}/v6/deployments?${sp.toString()}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${params.token}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return [];
    const j = (await r.json()) as {
      deployments?: Array<{ uid: string; createdAt?: number; created?: number; readyState?: string }>;
    };
    const raw = j.deployments ?? [];
    return raw.map((d) => ({
      uid: d.uid,
      createdAt: d.createdAt ?? d.created ?? 0,
      readyState: d.readyState,
    }));
  } catch {
    return [];
  }
}

/**
 * Bila hook 2xx tetapi body kosong/tidak terurai, cocokkan deployment terbaru di project dari URL hook.
 */
export async function tryResolveLatestDeploymentUidFromProject(params: {
  hookUrl: string;
  token: string;
  teamId?: string;
}): Promise<{
  uid: string | null;
  readyState: string | null;
  inspectorUrl: string | null;
  errorMessage: string | null;
}> {
  const parsed = parseVercelIntegrationDeployHookUrl(params.hookUrl);
  if (!parsed) return { uid: null, readyState: null, inspectorUrl: null, errorMessage: null };
  const sinceMs = Date.now() - 180_000;
  const rows = await listVercelDeploymentsSince({
    token: params.token,
    teamId: params.teamId,
    projectId: parsed.projectId,
    sinceMs,
    limit: 8,
  });
  const pick = rows.sort((a, b) => b.createdAt - a.createdAt)[0];
  if (!pick?.uid) return { uid: null, readyState: null, inspectorUrl: null, errorMessage: null };
  const detail = await getVercelDeploymentByUid({
    token: params.token,
    teamId: params.teamId,
    uid: pick.uid,
  });
  if (!detail.ok) {
    return { uid: pick.uid, readyState: pick.readyState ?? null, inspectorUrl: null, errorMessage: null };
  }
  return {
    uid: detail.uid,
    readyState: detail.readyState,
    inspectorUrl: detail.inspectorUrl,
    errorMessage: detail.errorMessage,
  };
}

/**
 * Setelah deploy hook sukses: cari UID deployment untuk polling (GET job id, atau list by project + since).
 */
export async function resolveVercelDeploymentAfterHook(params: {
  hookUrl: string;
  hookResponseBody: string;
  token: string;
  teamId?: string;
}): Promise<{
  uid: string | null;
  readyState: string | null;
  inspectorUrl: string | null;
  errorMessage: string | null;
}> {
  const job = parseVercelDeployHookJobJson(params.hookResponseBody);
  if (!job) return { uid: null, readyState: null, inspectorUrl: null, errorMessage: null };

  const byId = await getVercelDeploymentByUid({ token: params.token, teamId: params.teamId, uid: job.id });
  if (byId.ok) {
    return {
      uid: byId.uid,
      readyState: byId.readyState,
      inspectorUrl: byId.inspectorUrl,
      errorMessage: byId.errorMessage,
    };
  }

  const parsed = parseVercelIntegrationDeployHookUrl(params.hookUrl);
  if (!parsed) return { uid: null, readyState: null, inspectorUrl: null, errorMessage: null };

  await sleep(1200);
  const sinceMs = job.createdAt - 30_000;
  let rows = await listVercelDeploymentsSince({
    token: params.token,
    teamId: params.teamId,
    projectId: parsed.projectId,
    sinceMs,
    limit: 15,
  });
  if (rows.length === 0) {
    await sleep(2000);
    rows = await listVercelDeploymentsSince({
      token: params.token,
      teamId: params.teamId,
      projectId: parsed.projectId,
      sinceMs,
      limit: 15,
    });
  }

  const threshold = job.createdAt - 5000;
  const candidates = rows.filter((r) => r.createdAt >= threshold).sort((a, b) => b.createdAt - a.createdAt);
  const pick = candidates[0] ?? rows.sort((a, b) => b.createdAt - a.createdAt)[0];
  if (!pick) return { uid: null, readyState: null, inspectorUrl: null, errorMessage: null };

  const detail = await getVercelDeploymentByUid({ token: params.token, teamId: params.teamId, uid: pick.uid });
  if (!detail.ok) {
    return { uid: pick.uid, readyState: pick.readyState ?? null, inspectorUrl: null, errorMessage: null };
  }
  return {
    uid: detail.uid,
    readyState: detail.readyState,
    inspectorUrl: detail.inspectorUrl,
    errorMessage: detail.errorMessage,
  };
}

export function vercelBuildMonitoringSupported(hookUrl: string | null): boolean {
  if (!hookUrl) return false;
  if (!resolveVercelApiToken()) return false;
  return Boolean(parseVercelIntegrationDeployHookUrl(hookUrl));
}
