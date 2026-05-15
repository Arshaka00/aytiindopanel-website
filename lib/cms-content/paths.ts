import path from "node:path";

export const CONTENT_CMS_ROOT = path.join(process.cwd(), "content", "cms");

export function contentCmsSubdir(segment: string): string {
  return path.join(CONTENT_CMS_ROOT, segment);
}
