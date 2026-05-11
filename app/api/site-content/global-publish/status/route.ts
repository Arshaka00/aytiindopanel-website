import { NextResponse, type NextRequest } from "next/server";

import { getGlobalPublishStatusPayload } from "@/lib/global-publish-orchestrator";
import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

/**
 * Status publish global + heuristik draft/live (tanpa isi JSON penuh).
 * Memerlukan sesi admin; tidak mengekspos URL deploy hook.
 */
export async function GET(req: NextRequest) {
  if (!isAllowedAdminDevice(req.headers, req.cookies) || !hasValidAdminSessionFromRequest(req)) {
    return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 401 });
  }

  const payload = await getGlobalPublishStatusPayload();
  return NextResponse.json(payload, { headers: { "cache-control": "no-store" } });
}
