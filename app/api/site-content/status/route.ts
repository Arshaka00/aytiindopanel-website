import { NextResponse } from "next/server";

import { getSiteContent } from "@/lib/site-content";

export async function GET() {
  const content = await getSiteContent();
  const maintenanceActive = content.siteSettings.maintenanceMode || !content.siteSettings.published;
  return NextResponse.json(
    {
      maintenanceActive,
      published: content.siteSettings.published,
      maintenanceMode: content.siteSettings.maintenanceMode,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
