import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { SiteSettingsEntry } from "@/components/site-cms/site-settings-entry";
import { isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export default async function SiteSettingsPage() {
  const allowed = isAllowedAdminDevice(await headers(), await cookies());
  if (!allowed) notFound();
  return (
    <main className="min-h-[85vh] bg-[radial-gradient(120%_85%_at_50%_-15%,rgba(56,189,248,0.14),transparent_55%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-12 text-slate-100">
      <SiteSettingsEntry />
    </main>
  );
}
