import { getSiteContentFileStoragePort } from "@/lib/cms-storage";

/**
 * Heuristik: draft lebih baru daripada live → kemungkinan ada perubahan yang belum di-publish.
 * Tidak sempurna jika alur edit menulis keduanya sekaligus; hanya indikator UI.
 */
export async function getDraftLiveMtimeHint(): Promise<{
  draftMtimeMs: number | null;
  liveMtimeMs: number | null;
  likelyDraftAheadOfLive: boolean | null;
}> {
  const port = getSiteContentFileStoragePort();
  const { draftMtimeMs, liveMtimeMs } = await port.getDraftLiveMtimeHint();
  const marginMs = 2000;
  if (draftMtimeMs === null || liveMtimeMs === null) {
    return { draftMtimeMs, liveMtimeMs, likelyDraftAheadOfLive: null };
  }
  return {
    draftMtimeMs,
    liveMtimeMs,
    likelyDraftAheadOfLive: draftMtimeMs > liveMtimeMs + marginMs,
  };
}
