/**
 * Deploy hook production (Vercel atau webhook generik HTTPS).
 * Prioritas env: `CMS_DEPLOY_HOOK_URL` lalu `VERCEL_DEPLOY_HOOK_URL`.
 * Hanya **https://** — tidak memicu http (production-safe).
 *
 * Route `/api/site-content/global-publish*` memakai `runtime = "nodejs"` agar `process.env`
 * selalu sesuai environment Vercel (bukan Edge).
 *
 * Log diagnostik singkat (tanpa URL): set `CMS_DEPLOY_HOOK_DEBUG=1` di Vercel sementara.
 */

const DEPLOY_HOOK_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const BASE_RETRY_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type DeployHookEnvKey = "CMS_DEPLOY_HOOK_URL" | "VERCEL_DEPLOY_HOOK_URL";

export type DeployHookRejectReason =
  | "none"
  | "missing_both"
  | "blank_after_normalize"
  | "invalid_url"
  | "not_https"
  | "empty_host";

/** Field aman untuk JSON / log — tidak berisi URL lengkap. */
export type DeployHookPublicMeta = {
  configured: boolean;
  source: DeployHookEnvKey | null;
  protocol: string | null;
  rejectReason: DeployHookRejectReason;
  rawCmsKeyPresent: boolean;
  rawVercelKeyPresent: boolean;
  cmsCandidateNonEmpty: boolean;
  vercelCandidateNonEmpty: boolean;
  hostLength: number | null;
  pathnameLength: number | null;
};

export type DeployHookResolution = {
  url: string | null;
  meta: DeployHookPublicMeta;
};

function readEnvRaw(key: DeployHookEnvKey): string | undefined {
  return process.env[key];
}

/**
 * Normalisasi nilai env: trim, hapus zero-width/BOM, buang kutip pembungkus.
 */
export function normalizeDeployHookEnvValue(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  let s = raw.replace(/\u200B|\uFEFF/g, "").trim();
  if (!s) return null;
  for (let i = 0; i < 2; i++) {
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).replace(/\u200B|\uFEFF/g, "").trim();
    } else break;
    if (!s) return null;
  }
  return s || null;
}

function buildMeta(params: {
  url: string | null;
  source: DeployHookEnvKey | null;
  rejectReason: DeployHookRejectReason;
  cmsNorm: string | null;
  vercelNorm: string | null;
}): DeployHookPublicMeta {
  const rawCmsKeyPresent = readEnvRaw("CMS_DEPLOY_HOOK_URL") !== undefined;
  const rawVercelKeyPresent = readEnvRaw("VERCEL_DEPLOY_HOOK_URL") !== undefined;
  let protocol: string | null = null;
  let hostLength: number | null = null;
  let pathnameLength: number | null = null;
  if (params.url) {
    try {
      const u = new URL(params.url);
      protocol = u.protocol;
      hostLength = u.hostname.length;
      pathnameLength = u.pathname.length;
    } catch {
      protocol = null;
    }
  }
  return {
    configured: Boolean(params.url),
    source: params.source,
    protocol,
    rejectReason: params.rejectReason,
    rawCmsKeyPresent,
    rawVercelKeyPresent,
    cmsCandidateNonEmpty: Boolean(params.cmsNorm),
    vercelCandidateNonEmpty: Boolean(params.vercelNorm),
    hostLength,
    pathnameLength,
  };
}

let lastDebugSignature: string | null = null;

function maybeLogDeployHookResolution(res: DeployHookResolution): void {
  if (process.env.CMS_DEPLOY_HOOK_DEBUG !== "1") return;
  const sig = JSON.stringify(res.meta);
  if (sig === lastDebugSignature) return;
  lastDebugSignature = sig;
  // eslint-disable-next-line no-console -- opt-in via CMS_DEPLOY_HOOK_DEBUG; tidak mencetak URL
  console.info("[cms:deploy-hook]", sig);
}

/**
 * Resolusi penuh + meta aman. Satu-satunya sumber kebenaran untuk URL & `deployHookConfigured`.
 */
export function resolveDeployHookResolution(): DeployHookResolution {
  const cmsRaw = readEnvRaw("CMS_DEPLOY_HOOK_URL");
  const vercelRaw = readEnvRaw("VERCEL_DEPLOY_HOOK_URL");
  const cmsNorm = normalizeDeployHookEnvValue(cmsRaw);
  const vercelNorm = normalizeDeployHookEnvValue(vercelRaw);

  const rawCmsKeyPresent = cmsRaw !== undefined;
  const rawVercelKeyPresent = vercelRaw !== undefined;

  const candidates: Array<{ key: DeployHookEnvKey; norm: string | null }> = [
    { key: "CMS_DEPLOY_HOOK_URL", norm: cmsNorm },
    { key: "VERCEL_DEPLOY_HOOK_URL", norm: vercelNorm },
  ];

  for (const { key, norm } of candidates) {
    if (!norm) continue;
    try {
      const parsed = new URL(norm);
      if (parsed.protocol !== "https:" || !parsed.hostname) continue;
      const res: DeployHookResolution = {
        url: norm,
        meta: buildMeta({
          url: norm,
          source: key,
          rejectReason: "none",
          cmsNorm,
          vercelNorm,
        }),
      };
      maybeLogDeployHookResolution(res);
      return res;
    } catch {
      continue;
    }
  }

  let rejectReason: DeployHookRejectReason;
  let blameSource: DeployHookEnvKey | null = null;

  if (!cmsNorm && !vercelNorm) {
    if (!rawCmsKeyPresent && !rawVercelKeyPresent) rejectReason = "missing_both";
    else rejectReason = "blank_after_normalize";
  } else {
    const probe = cmsNorm ?? vercelNorm;
    if (probe) {
      blameSource = cmsNorm ? "CMS_DEPLOY_HOOK_URL" : "VERCEL_DEPLOY_HOOK_URL";
      try {
        const p = new URL(probe);
        if (p.protocol !== "https:") rejectReason = "not_https";
        else if (!p.hostname) rejectReason = "empty_host";
        else rejectReason = "invalid_url";
      } catch {
        rejectReason = "invalid_url";
      }
    } else {
      rejectReason = "missing_both";
    }
  }

  const res: DeployHookResolution = {
    url: null,
    meta: buildMeta({
      url: null,
      source: blameSource,
      rejectReason,
      cmsNorm,
      vercelNorm,
    }),
  };
  maybeLogDeployHookResolution(res);
  return res;
}

export function resolveDeployHookUrl(): string | null {
  return resolveDeployHookResolution().url;
}

export type DeployHookResult = {
  status: "skipped" | "ok" | "failed";
  httpStatus?: number;
  message?: string;
  attempts?: number;
  responseBody?: string;
};

const MAX_RESPONSE_BODY_STORE = 8192;

function shouldRetryHttp(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function shouldRetryError(e: unknown): boolean {
  if (e instanceof TypeError) return true;
  if (e instanceof Error) {
    const n = e.name;
    if (n === "AbortError") return true;
  }
  return false;
}

function skippedMessage(meta: DeployHookPublicMeta): string {
  if (meta.rejectReason === "not_https") {
    return "Deploy hook tidak dijalankan: URL harus https:// (bukan http://). Periksa CMS_DEPLOY_HOOK_URL / VERCEL_DEPLOY_HOOK_URL.";
  }
  if (meta.rejectReason === "invalid_url") {
    return "Deploy hook tidak dijalankan: URL tidak valid setelah normalisasi env. Periksa typo / karakter tersembunyi.";
  }
  if (meta.rejectReason === "blank_after_normalize") {
    return "Deploy hook tidak dijalankan: env ada di Vercel tapi isinya kosong setelah trim — periksa whitespace / kutip.";
  }
  if (meta.rejectReason === "empty_host") {
    return "Deploy hook tidak dijalankan: hostname URL kosong (format URL rusak).";
  }
  return "Deploy hook belum dikonfigurasi (set CMS_DEPLOY_HOOK_URL atau VERCEL_DEPLOY_HOOK_URL, hanya https).";
}

/**
 * POST ke deploy hook dengan timeout, retry ringan (jaringan / 5xx / 429).
 */
export async function triggerDeployHookIfConfigured(): Promise<DeployHookResult> {
  const { url, meta } = resolveDeployHookResolution();
  if (!url) {
    return {
      status: "skipped",
      message: skippedMessage(meta),
    };
  }

  let lastHttpStatus: number | undefined;
  let lastMessage = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEPLOY_HOOK_TIMEOUT_MS);
    try {
      const r = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { accept: "application/json, text/plain, */*" },
        redirect: "manual",
      });
      clearTimeout(timer);
      const text = await r.text().catch(() => "");
      const snippet = text.replace(/\s+/g, " ").trim().slice(0, 400);

      if (r.ok) {
        return {
          status: "ok",
          httpStatus: r.status,
          message: snippet || "Deploy hook diterima.",
          attempts: attempt,
          responseBody: text.slice(0, MAX_RESPONSE_BODY_STORE),
        };
      }

      lastHttpStatus = r.status;
      lastMessage = snippet || `HTTP ${r.status}`;

      if (shouldRetryHttp(r.status) && attempt < MAX_ATTEMPTS) {
        await sleep(BASE_RETRY_MS * attempt);
        continue;
      }

      return { status: "failed", httpStatus: r.status, message: lastMessage, attempts: attempt };
    } catch (e) {
      clearTimeout(timer);
      const msg = e instanceof Error ? e.message : "Gagal memanggil deploy hook.";
      lastMessage = msg;

      if (shouldRetryError(e) && attempt < MAX_ATTEMPTS) {
        await sleep(BASE_RETRY_MS * attempt);
        continue;
      }

      return {
        status: "failed",
        httpStatus: lastHttpStatus,
        message: lastMessage,
        attempts: attempt,
      };
    }
  }

  return { status: "failed", message: lastMessage || "Deploy hook gagal.", attempts: MAX_ATTEMPTS };
}
