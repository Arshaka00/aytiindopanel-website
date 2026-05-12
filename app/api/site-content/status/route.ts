import { NextResponse } from "next/server";

import { isGlobalPublishEnabled } from "@/lib/cms-global-publish-flag";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  const maintenanceActive = content.siteSettings.maintenanceMode || !content.siteSettings.published;
  return NextResponse.json(
    {
      maintenanceActive,
      published: content.siteSettings.published,
      maintenanceMode: content.siteSettings.maintenanceMode,
      globalPublishWorkflowEnabled: isGlobalPublishEnabled(),
    },
    { headers: { "cache-control": "private, no-store, max-age=0, must-revalidate" } },
  );
}
