import { revalidatePath } from "next/cache";

import { clearMiddlewareLiveSiteContentCache } from "@/lib/site-content-middleware";

/**
 * Dipanggil setelah `live.json` terbarui: bust cache middleware lokal + invalidasi Data Cache Next.js
 * untuk layout root (seluruh halaman yang memakai `getSiteContent` di bawah layout yang sama).
 */
export async function runAfterSiteContentLiveUpdated(): Promise<{ revalidated: boolean }> {
  clearMiddlewareLiveSiteContentCache();
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    return { revalidated: true };
  } catch {
    return { revalidated: false };
  }
}
