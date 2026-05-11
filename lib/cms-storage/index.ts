import { isProductionStorage } from "@/lib/cms-storage/env";
import { createFilesystemSiteContentStorage } from "@/lib/cms-storage/filesystem-site-content-storage";
import type { SiteContentFileStoragePort } from "@/lib/cms-storage/site-content-file-storage-port";
import { createVercelBlobSiteContentStorage } from "@/lib/cms-storage/vercel-blob-site-content-storage";

export { cmsKvKey, hasVercelBlobEnv, hasVercelKvEnv, isProductionStorage } from "@/lib/cms-storage/env";
export { getCmsKv } from "@/lib/cms-storage/kv-client";
export type {
  BackupRow,
  CmsStorageMode,
  SiteContentFileStoragePort,
  SiteContentStateFile,
} from "@/lib/cms-storage/site-content-file-storage-port";

/** Adapter filesystem lokal (`data/site-content/…`). */
export { createFilesystemSiteContentStorage as filesystemStorage } from "@/lib/cms-storage/filesystem-site-content-storage";

/** Adapter Vercel Blob (pathname prefix `CMS_BLOB_PREFIX`). */
export { createVercelBlobSiteContentStorage as vercelBlobStorage } from "@/lib/cms-storage/vercel-blob-site-content-storage";

let cachedPort: SiteContentFileStoragePort | null = null;

export function getSiteContentFileStoragePort(): SiteContentFileStoragePort {
  if (!cachedPort) {
    cachedPort = isProductionStorage() ? createVercelBlobSiteContentStorage() : createFilesystemSiteContentStorage();
  }
  return cachedPort;
}
