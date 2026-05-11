import type { ReactNode } from "react";

import { SiteAdminCmsChromeSessionGrant } from "@/components/site-cms/site-admin-cms-chrome-session-grant";

export default function SiteAdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteAdminCmsChromeSessionGrant />
      {children}
    </>
  );
}
