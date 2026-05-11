import { stat } from "node:fs/promises";
import path from "node:path";

const DRAFT_PATH = path.join(process.cwd(), "data", "site-content", "draft.json");
const LIVE_PATH = path.join(process.cwd(), "data", "site-content", "live.json");

/**
 * Heuristik: `draft.json` lebih baru daripada `live.json` → kemungkinan ada perubahan yang belum di-publish.
 * Tidak sempurna jika alur edit menulis keduanya sekaligus; hanya indikator UI.
 */
export async function getDraftLiveMtimeHint(): Promise<{
  draftMtimeMs: number | null;
  liveMtimeMs: number | null;
  likelyDraftAheadOfLive: boolean | null;
}> {
  try {
    const [d, l] = await Promise.all([stat(DRAFT_PATH), stat(LIVE_PATH)]);
    const marginMs = 2000;
    return {
      draftMtimeMs: d.mtimeMs,
      liveMtimeMs: l.mtimeMs,
      likelyDraftAheadOfLive: d.mtimeMs > l.mtimeMs + marginMs,
    };
  } catch {
    return { draftMtimeMs: null, liveMtimeMs: null, likelyDraftAheadOfLive: null };
  }
}
