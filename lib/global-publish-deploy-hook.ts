/**
 * Deploy hook production (Vercel atau webhook generik HTTPS).
 * Prioritas env: `CMS_DEPLOY_HOOK_URL` lalu `VERCEL_DEPLOY_HOOK_URL`.
 * Hanya **https://** — tidak memicu http (production-safe).
 */
const DEPLOY_HOOK_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const BASE_RETRY_MS = 700;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function resolveDeployHookUrl(): string | null {
  const a = process.env.CMS_DEPLOY_HOOK_URL?.trim();
  const b = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  const u = a || b;
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return null;
    if (!parsed.hostname) return null;
    return u;
  } catch {
    return null;
  }
}

const MAX_RESPONSE_BODY_STORE = 8192;

export type DeployHookResult = {
  status: "skipped" | "ok" | "failed";
  httpStatus?: number;
  message?: string;
  attempts?: number;
  /** Respons mentah deploy hook (untuk parsing job Vercel / monitoring). */
  responseBody?: string;
};

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

/**
 * POST ke deploy hook dengan timeout, retry ringan (jaringan / 5xx / 429).
 * Tidak memanggil hook jika URL tidak valid / tidak https.
 */
export async function triggerDeployHookIfConfigured(): Promise<DeployHookResult> {
  const url = resolveDeployHookUrl();
  if (!url) {
    return {
      status: "skipped",
      message: "Deploy hook belum dikonfigurasi (set CMS_DEPLOY_HOOK_URL atau VERCEL_DEPLOY_HOOK_URL, hanya https).",
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
