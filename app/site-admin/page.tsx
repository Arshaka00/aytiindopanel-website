import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { SiteAdminDashboard } from "@/components/site-cms/site-admin-dashboard";
import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export default async function SiteAdminPage() {
  const allowed = isAllowedAdminDevice(await headers(), await cookies());
  if (!allowed) notFound();
  return <SiteAdminDashboard />;
}
