import type { NextRequest } from "next/server";

import { hasValidAdminSessionFromRequest, isAllowedAdminDevice } from "@/lib/gallery-admin-auth";

export type CmsRole =
  | "super_admin"
  | "editor"
  | "viewer"
  | "seo_editor"
  | "content_editor";

export function resolveCmsRole(req: NextRequest): CmsRole {
  const allowed = isAllowedAdminDevice(req.headers, req.cookies);
  const validSession = allowed && hasValidAdminSessionFromRequest(req);
  if (!validSession) return "viewer";
  const raw = process.env.CMS_DEFAULT_ROLE?.trim().toLowerCase() || "super_admin";
  const map: Record<string, CmsRole> = {
    super_admin: "super_admin",
    editor: "editor",
    viewer: "viewer",
    seo_editor: "seo_editor",
    "seo-editor": "seo_editor",
    content_editor: "content_editor",
    "content-editor": "content_editor",
  };
  return map[raw] ?? "super_admin";
}

export function canEditContent(role: CmsRole): boolean {
  return (
    role === "super_admin" ||
    role === "editor" ||
    role === "content_editor" ||
    role === "seo_editor"
  );
}

export function canEditSiteSettingsSeo(role: CmsRole): boolean {
  return role === "super_admin" || role === "seo_editor" || role === "editor";
}

export function canPublish(role: CmsRole): boolean {
  return role === "super_admin";
}
