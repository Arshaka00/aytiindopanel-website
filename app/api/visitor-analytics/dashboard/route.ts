import { NextResponse, type NextRequest } from "next/server";

import { aggregateDashboard } from "@/lib/visitor-analytics/aggregate";
import { canAccessVisitorAnalytics } from "@/lib/visitor-analytics/admin-guard";
import { cleanupOldEventsIfNeeded, readAllVisitorEvents } from "@/lib/visitor-analytics/storage";
import type { VisitorAnalyticsEvent } from "@/lib/visitor-analytics/types";

export async function GET(req: NextRequest) {
  if (!canAccessVisitorAnalytics(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupOldEventsIfNeeded(false).catch(() => {});

  const events = await readAllVisitorEvents();
  const summary = aggregateDashboard(events);

  const page = Math.max(1, Number.parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10) || 1);
  const limitRaw = Number.parseInt(req.nextUrl.searchParams.get("limit") ?? "25", 10);
  const limit = Math.min(100, Math.max(10, Number.isFinite(limitRaw) ? limitRaw : 25));

  const sorted = [...events].sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const rows: VisitorAnalyticsEvent[] = sorted.slice(start, start + limit);

  return NextResponse.json({
    summary,
    rows,
    page,
    limit,
    total,
    totalPages,
  });
}
