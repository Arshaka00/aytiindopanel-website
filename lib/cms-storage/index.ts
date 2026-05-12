import { createFilesystemSiteContentStorage } from "@/lib/cms-storage/filesystem-site-content-storage";
import type { SiteContentFileStoragePort } from "@/lib/cms-storage/site-content-file-storage-port";

export type {
  BackupRow,
  CmsStorageMode,
  SiteContentFileStoragePort,
  SiteContentStateFile,
} from "@/lib/cms-storage/site-content-file-storage-port";

/** Adapter filesystem: `data/site-content/` (ikut repository / build). */
export { createFilesystemSiteContentStorage as filesystemStorage } from "@/lib/cms-storage/filesystem-site-content-storage";

let cachedPort: SiteContentFileStoragePort | null = null;

export function getSiteContentFileStoragePort(): SiteContentFileStoragePort {
  if (!cachedPort) {
    cachedPort = createFilesystemSiteContentStorage();
  }
  return cachedPort;
}
