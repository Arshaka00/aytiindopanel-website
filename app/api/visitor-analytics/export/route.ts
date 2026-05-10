import { NextResponse, type NextRequest } from "next/server";

import { canAccessVisitorAnalytics } from "@/lib/visitor-analytics/admin-guard";
import { cleanupOldEventsIfNeeded, readAllVisitorEvents } from "@/lib/visitor-analytics/storage";

export async function GET(req: NextRequest) {
  if (!canAccessVisitorAnalytics(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupOldEventsIfNeeded(false).catch(() => {});

  const format = req.nextUrl.searchParams.get("format")?.toLowerCase() ?? "json";
  const events = await readAllVisitorEvents();

  if (format === "csv") {
    const header =
      "ts,kind,path,sid,browser,device,country,city,referrerHost,referrerKind,waDestSuffix\n";
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const lines = events.map((e) =>
      [
        e.ts,
        e.kind,
        e.path,
        e.sid,
        e.browser,
        e.device,
        e.country,
        e.city,
        e.referrerHost,
        e.referrerKind,
        e.waDestSuffix ?? "",
      ]
        .map(esc)
        .join(","),
    );
    const csv = header + lines.join("\n") + (lines.length ? "\n" : "");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="visitor-analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const body = JSON.stringify(events, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="visitor-analytics-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
