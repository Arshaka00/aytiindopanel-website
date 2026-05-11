/**
 * Fingerprint runtime deployment (Vercel menyuntik env di build & runtime).
 * Dipakai Deployment Center untuk memastikan production ≠ stale vs GitHub `main`.
 */
export type DeployRuntimeFingerprint = {
  gitCommitSha: string | null;
  gitCommitShort: string | null;
  vercelDeploymentId: string | null;
  vercelEnv: string | null;
  vercelUrl: string | null;
  nodeEnv: string;
  /** ISO — waktu respons API (bukan waktu build image). */
  serverNowIso: string;
};

export function getDeployRuntimeFingerprint(): DeployRuntimeFingerprint {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null;
  return {
    gitCommitSha: sha,
    gitCommitShort: sha ? sha.slice(0, 7) : null,
    vercelDeploymentId: process.env.VERCEL_DEPLOYMENT_ID?.trim() || null,
    vercelEnv: process.env.VERCEL_ENV?.trim() || null,
    vercelUrl: process.env.VERCEL_URL?.trim() || null,
    nodeEnv: process.env.NODE_ENV ?? "development",
    serverNowIso: new Date().toISOString(),
  };
}
