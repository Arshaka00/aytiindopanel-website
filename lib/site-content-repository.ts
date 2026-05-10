import type { SiteContent } from "@/lib/site-content-model";
import {
  readSiteContentFromStorage,
  writeSiteContentToStorage,
  publishDraftToLive,
} from "@/lib/site-content-storage";

export type SiteContentStoreMode = "draft" | "live";

export interface SiteContentRepository {
  read(mode: SiteContentStoreMode, fallback: SiteContent): Promise<SiteContent>;
  write(mode: SiteContentStoreMode, content: SiteContent): Promise<void>;
  publishDraft(): Promise<void>;
}

class LocalJsonSiteContentRepository implements SiteContentRepository {
  async read(mode: SiteContentStoreMode, fallback: SiteContent): Promise<SiteContent> {
    return readSiteContentFromStorage(mode, fallback);
  }
  async write(mode: SiteContentStoreMode, content: SiteContent): Promise<void> {
    await writeSiteContentToStorage(mode, content);
  }
  async publishDraft(): Promise<void> {
    await publishDraftToLive();
  }
}

export function createSiteContentRepository(): SiteContentRepository {
  // TODO: switch by env: local_json | postgres | supabase
  return new LocalJsonSiteContentRepository();
}
