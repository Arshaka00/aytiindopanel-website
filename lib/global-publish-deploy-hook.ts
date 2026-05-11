/**
 * Deploy hook production (Vercel atau webhook generik HTTPS).
 * Prioritas env: `CMS_DEPLOY_HOOK_URL` → `CMS_DEPLOY_HOOK` → `VERCEL_DEPLOY_HOOK_URL` → `VERCEL_DEPLOY_HOOK`.
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

export type DeployHookEnvKey =
  | "CMS_DEPLOY_HOOK_URL"
  | "CMS_DEPLOY_HOOK"
  | "VERCEL_DEPLOY_HOOK_URL"
  | "VERCEL_DEPLOY_HOOK";

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
  // Lookup dinamis (bukan `process.env.FOO` literal) supaya bundler tidak meng-inline
  // nilai dari lingkungan build CI / lokal saat `CMS_*` tidak disetel di sana.
  const v = (process.env as Record<string, string | undefined>)[key];
  return typeof v === "string" ? v : undefined;
}

function rawCmsDeployHookKeysPresent(): boolean {
  return readEnvRaw("CMS_DEPLOY_HOOK_URL") !== undefined || readEnvRaw("CMS_DEPLOY_HOOK") !== undefined;
}

function rawVercelDeployHookKeysPresent(): boolean {
  return readEnvRaw("VERCEL_DEPLOY_HOOK_URL") !== undefined || readEnvRaw("VERCEL_DEPLOY_HOOK") !== undefined;
}

/** Hapus kontrol C0/C1 yang sering nyelip dari paste (kecuali \t \n \r). */
function stripDisallowedControls(s: string): string {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0080-\u009F]/g, "");
}

/**
 * Normalisasi nilai env: trim, hapus zero-width/BOM, NFKC (Latin/punctuation fullwidth → ASCII),
 * buang kutip pembungkus, ambil baris yang berisi https:// jika ada beberapa baris (paste dari dokumen).
 */
export function normalizeDeployHookEnvValue(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  let s = raw.replace(/\u200B|\uFEFF/g, "").replace(/\r\n/g, "\n").trim();
  if (!s) return null;
  s = s.normalize("NFKC");
  if (!s.trim()) return null;
  for (let i = 0; i < 2; i++) {
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = s.slice(1, -1).replace(/\u200B|\uFEFF/g, "").trim();
    } else break;
    if (!s) return null;
    s = s.normalize("NFKC");
  }
  if (/\n/.test(s)) {
    const lines = s
      .split("\n")
      .map((l) => stripDisallowedControls(l.trim()))
      .filter(Boolean);
    const httpsLine =
      lines.find((ln) => /^https:\/\//i.test(ln)) ?? lines.find((ln) => /https:\/\//i.test(ln));
    s = (httpsLine ?? lines[0] ?? s).trim();
  } else {
    s = stripDisallowedControls(s).trim();
  }
  return s || null;
}

/**
 * Dari nilai yang sudah dinormalisasi, dapatkan string URL https:// yang lolos `new URL`.
 * Menangani prefix/suffix teks, tanda baca di akhir salinan, dll.
 */
function httpsSubstringStarts(norm: string): number[] {
  const lower = norm.toLowerCase();
  const needle = "https://";
  const out: number[] = [];
  let pos = 0;
  while (pos < lower.length) {
    const i = lower.indexOf(needle, pos);
    if (i === -1) break;
    out.push(i);
    pos = i + 1;
  }
  return out;
}

function coerceHttpsDeployHookUrl(norm: string): string | null {
  const base = norm.normalize("NFKC").trim();
  const seen = new Set<string>();
  const tryParse = (candidate: string): string | null => {
    const t = candidate.trim();
    if (!t || seen.has(t)) return null;
    seen.add(t);
    try {
      const parsed = new URL(t);
      if (parsed.protocol === "https:" && parsed.hostname) return t;
    } catch {
      /* ignore */
    }
    return null;
  };

  const variants: string[] = [];
  const add = (v: string) => {
    const x = v.trim();
    if (x && !variants.includes(x)) variants.push(x);
  };

  add(base);
  for (const idx of httpsSubstringStarts(base)) {
    add(base.slice(idx));
  }

  const embedded = base.match(/\bhttps:\/\/[^\s"'<>\r\n\t\u0000-\u0008\u000B\u000C\u000E-\u001F]+/giu);
  if (embedded?.[0]) {
    add(embedded[0].replace(/["'`,);\]\s]+$/g, ""));
  }

  for (const v0 of variants) {
    let s = v0;
    for (let i = 0; i < 24; i++) {
      const hit = tryParse(s);
      if (hit) return hit;
      const next = s.replace(/["'`,);\]\s]+$/g, "").trim();
      if (next.length === s.length) break;
      s = next;
    }
  }
  return null;
}

/**
 * Pesan skip tersimpan saat hook belum di-set — tidak relevan setelah URL hook valid di runtime.
 * Dipakai untuk sanitasi payload status + tampilan UI.
 */
export function isOutdatedDeployHookSkippedMessage(msg: string | null | undefined): boolean {
  if (!msg) return false;
  const t = msg.normalize("NFKC").toLowerCase();
  return (
    /belum\s*dikonfigurasi/.test(t) ||
    /cms\s*[_-]?\s*deploy\s*[_-]?\s*hook/.test(t) ||
    /vercel\s*[_-]?\s*deploy\s*[_-]?\s*hook/.test(t) ||
    /hanya\s*https/.test(t) ||
    /deploy\s*hook\s*belum/.test(t)
  );
}

function buildMeta(params: {
  url: string | null;
  source: DeployHookEnvKey | null;
  rejectReason: DeployHookRejectReason;
  cmsNorm: string | null;
  vercelNorm: string | null;
}): DeployHookPublicMeta {
  const rawCmsKeyPresent = rawCmsDeployHookKeysPresent();
  const rawVercelKeyPresent = rawVercelDeployHookKeysPresent();
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
  const cmsUrlRaw = readEnvRaw("CMS_DEPLOY_HOOK_URL");
  const cmsAltRaw = readEnvRaw("CMS_DEPLOY_HOOK");
  const vercelUrlRaw = readEnvRaw("VERCEL_DEPLOY_HOOK_URL");
  const vercelAltRaw = readEnvRaw("VERCEL_DEPLOY_HOOK");

  const cmsUrlNorm = normalizeDeployHookEnvValue(cmsUrlRaw);
  const cmsAltNorm = normalizeDeployHookEnvValue(cmsAltRaw);
  const vercelUrlNorm = normalizeDeployHookEnvValue(vercelUrlRaw);
  const vercelAltNorm = normalizeDeployHookEnvValue(vercelAltRaw);

  const cmsNormMerged = cmsUrlNorm ?? cmsAltNorm;
  const vercelNormMerged = vercelUrlNorm ?? vercelAltNorm;

  const rawCmsKeyPresent = cmsUrlRaw !== undefined || cmsAltRaw !== undefined;
  const rawVercelKeyPresent = vercelUrlRaw !== undefined || vercelAltRaw !== undefined;

  const candidates: Array<{ key: DeployHookEnvKey; norm: string | null }> = [
    { key: "CMS_DEPLOY_HOOK_URL", norm: cmsUrlNorm },
    { key: "CMS_DEPLOY_HOOK", norm: cmsAltNorm },
    { key: "VERCEL_DEPLOY_HOOK_URL", norm: vercelUrlNorm },
    { key: "VERCEL_DEPLOY_HOOK", norm: vercelAltNorm },
  ];

  for (const { key, norm } of candidates) {
    if (!norm) continue;
    const urlCandidate = coerceHttpsDeployHookUrl(norm);
    if (!urlCandidate) continue;
    const res: DeployHookResolution = {
      url: urlCandidate,
      meta: buildMeta({
        url: urlCandidate,
        source: key,
        rejectReason: "none",
        cmsNorm: cmsNormMerged,
        vercelNorm: vercelNormMerged,
      }),
    };
    maybeLogDeployHookResolution(res);
    return res;
  }

  let rejectReason: DeployHookRejectReason;
  let blameSource: DeployHookEnvKey | null = null;

  if (!cmsNormMerged && !vercelNormMerged) {
    if (!rawCmsKeyPresent && !rawVercelKeyPresent) rejectReason = "missing_both";
    else rejectReason = "blank_after_normalize";
  } else {
    const probe = cmsNormMerged ?? vercelNormMerged;
    if (probe) {
      if (cmsNormMerged) {
        blameSource = cmsUrlNorm ? "CMS_DEPLOY_HOOK_URL" : "CMS_DEPLOY_HOOK";
      } else {
        blameSource = vercelUrlNorm ? "VERCEL_DEPLOY_HOOK_URL" : "VERCEL_DEPLOY_HOOK";
      }
      const diagnostic = probe.normalize("NFKC").trim();
      try {
        const p = new URL(diagnostic);
        if (p.protocol === "http:") rejectReason = "not_https";
        else if (p.protocol !== "https:") rejectReason = "invalid_url";
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
      cmsNorm: cmsNormMerged,
      vercelNorm: vercelNormMerged,
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
    return "Deploy hook tidak dijalankan: URL tidak valid setelah normalisasi env (NFKC/trim). Tempel ulang URL Integrations mentah dari Vercel; hindari PDF/HTML/jarak antar huruf.";
  }
  if (meta.rejectReason === "blank_after_normalize") {
    return "Deploy hook tidak dijalankan: env ada di Vercel tapi isinya kosong setelah trim — periksa whitespace / kutip.";
  }
  if (meta.rejectReason === "empty_host") {
    return "Deploy hook tidak dijalankan: hostname URL kosong (format URL rusak).";
  }
  if (meta.rejectReason === "missing_both") {
    return (
      "Deploy hook tidak dijalankan: runtime tidak melihat variabel env hook untuk deployment ini. " +
      "Set salah satu: CMS_DEPLOY_HOOK_URL · CMS_DEPLOY_HOOK · VERCEL_DEPLOY_HOOK_URL · VERCEL_DEPLOY_HOOK (nilai = URL https://api.vercel.com/v1/integrations/deploy/…). " +
      "Di Vercel pastikan environment mencakup deployment yang kamu pakai (Production vs Preview), nama key tepat, simpan, lalu redeploy. " +
      "Kalau env hanya Production, buka CMS dari domain production (bukan URL *.vercel.app preview)."
    );
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
