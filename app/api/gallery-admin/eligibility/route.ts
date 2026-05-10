import { NextResponse, type NextRequest } from "next/server";

import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export async function GET(req: NextRequest) {
  const eligible = isAllowedAdminDevice(req.headers, req.cookies);
  return NextResponse.json({ eligible });
}
