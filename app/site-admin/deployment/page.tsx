import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { SiteDeploymentEntry } from "@/components/site-cms/site-deployment-entry";
import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export const dynamic = "force-dynamic";

export default async function SiteAdminDeploymentPage() {
  const allowed = isAllowedAdminDevice(await headers(), await cookies());
  if (!allowed) notFound();
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_82%_at_50%_-12%,rgba(139,92,246,0.1),transparent_56%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100 sm:px-5 md:py-14">
      <SiteDeploymentEntry />
    </main>
  );
}
