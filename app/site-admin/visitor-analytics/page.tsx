import { cookies, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VisitorAnalyticsDashboard } from "@/components/site-cms/visitor-analytics-dashboard";
import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export default async function VisitorAnalyticsPage() {
  const allowed = isAllowedAdminDevice(await headers(), await cookies());
  if (!allowed) notFound();

  return (
    <>
      <div className="border-b border-white/10 bg-[#0b1224]/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/site-admin"
            className="text-xs font-medium text-sky-300/90 transition hover:text-sky-200 hover:underline"
          >
            ← Panel CMS
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Visitor Analytics
          </span>
        </div>
      </div>
      <VisitorAnalyticsDashboard />
    </>
  );
}
