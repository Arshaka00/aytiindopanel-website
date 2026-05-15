import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LayananPagesFile } from "@/lib/layanan-pages/types";

const LIVE_PATH = path.join(process.cwd(), "data", "layanan-pages", "live.json");

export function getLayananPagesLivePath(): string {
  return LIVE_PATH;
}

export async function readLayananPagesFile(): Promise<LayananPagesFile> {
  const raw = await readFile(LIVE_PATH, "utf8");
  return JSON.parse(raw) as LayananPagesFile;
}
