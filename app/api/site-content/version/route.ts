import { NextResponse } from "next/server";

import { getSiteContentVersionToken } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const version = await getSiteContentVersionToken();
  return NextResponse.json(
    { version },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
        pragma: "no-cache",
        expires: "0",
      },
    },
  );
}
