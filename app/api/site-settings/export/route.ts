import { NextResponse, type NextRequest } from "next/server";

import { getDraftSiteContent } from "@/lib/site-content";
import { siteSettingsGateAuthorized, siteSettingsGateForbiddenResponse } from "@/lib/site-settings-gate";

/** Ekspor Site Settings mentah (JSON) untuk backup / migrasi. */
export async function GET(req: NextRequest) {
  if (!siteSettingsGateAuthorized(req)) return siteSettingsGateForbiddenResponse();
  const content = await getDraftSiteContent();
  const body = JSON.stringify({ siteSettings: content.siteSettings }, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="site-settings-export.json"`,
    },
  });
}
