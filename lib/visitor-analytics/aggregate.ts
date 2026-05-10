import type { VisitorAnalyticsEvent } from "@/lib/visitor-analytics/types";

export type DailyBucket = { date: string; visits: number; uniqueSid: number };

export function startOfUtcDayIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function aggregateDashboard(events: VisitorAnalyticsEvent[]) {
  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const pageviews = events.filter((e) => e.kind === "pageview");
  const sessionVisits = events.filter((e) => e.kind === "visit");
  const waClicks = events.filter((e) => e.kind === "whatsapp_click");

  const todayVisits = sessionVisits.filter((e) => Date.parse(e.ts) >= todayStart.getTime());

  const sidToday = new Set<string>();
  for (const e of todayVisits) {
    if (e.sid) sidToday.add(e.sid);
  }

  /** Satu hitungan per “masuk” (sesi tab), bukan per halaman */
  const visitsToday = todayVisits.length;
  const uniqueToday = sidToday.size;

  const waToday = waClicks.filter((e) => Date.parse(e.ts) >= todayStart.getTime()).length;

  const pathCounts = countBy(
    pageviews.map((e) => normalizePathForStats(e.path)),
    (a, b) => b - a,
  );
  const cityCounts = countBy(
    pageviews.map((e) => (e.city || e.country || "—").trim() || "—"),
    (a, b) => b - a,
  );
  const deviceCounts = countBy(pageviews.map((e) => e.device), (a, b) => b - a);
  const browserCounts = countBy(pageviews.map((e) => e.browser), (a, b) => b - a);

  const daily = buildDailyVisits(sessionVisits, 30);

  return {
    visitsToday,
    uniqueVisitorsToday: uniqueToday,
    whatsappClicksToday: waToday,
    topPage: pathCounts[0]?.key ?? "—",
    topCity: cityCounts[0]?.key ?? "—",
    pathCounts: pathCounts.slice(0, 10),
    cityCounts: cityCounts.slice(0, 10),
    deviceCounts,
    browserCounts,
    dailyBuckets: daily,
    whatsappClicksTotal: waClicks.length,
  };
}

function normalizePathForStats(p: string): string {
  const t = p.trim() || "/";
  if (t.length > 200) return `${t.slice(0, 197)}…`;
  return t.startsWith("/") ? t : `/${t}`;
}

function countBy(
  keys: string[],
  sortCmp: (a: number, b: number) => number,
): { key: string; count: number }[] {
  const m = new Map<string, number>();
  for (const k of keys) {
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((x, y) => sortCmp(x.count, y.count));
}

function buildDailyVisits(sessionEntries: VisitorAnalyticsEvent[], days: number): DailyBucket[] {
  const byDay = new Map<string, Set<string>>();
  const counts = new Map<string, number>();

  const start = Date.now() - days * 86400000;

  for (const e of sessionEntries) {
    const t = Date.parse(e.ts);
    if (!Number.isFinite(t) || t < start) continue;
    const day = e.ts.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
    if (!byDay.has(day)) byDay.set(day, new Set());
    byDay.get(day)!.add(e.sid);
  }

  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toISOString().slice(0, 10));
  }

  return labels.map((date) => ({
    date,
    visits: counts.get(date) ?? 0,
    uniqueSid: byDay.get(date)?.size ?? 0,
  }));
}
