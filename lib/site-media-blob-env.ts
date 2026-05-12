/**
 * Unggah media opsional ke Vercel Blob (`access: public`) — terpisah dari penyimpanan CMS JSON.
 * Konten situs (`live.json` / `draft.json`) selalu dari `data/site-content/` di repo.
 */
export function isSiteMediaBlobUploadEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
