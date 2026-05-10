import type { NextRequest } from "next/server";

import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

/** Sama dengan akses `/site-admin`: perangkat terdaftar. */
export function canAccessVisitorAnalytics(req: NextRequest): boolean {
  return isAllowedAdminDevice(req.headers, req.cookies);
}
