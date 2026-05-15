import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SeoArticlesFile } from "@/lib/seo-articles/types";
import { mergeCmsFolderArticlesInto } from "@/lib/cms-content/merge-articles";

const DATA_DIR = path.join(process.cwd(), "data", "seo-articles");
const LIVE_PATH = path.join(DATA_DIR, "live.json");

export function getSeoArticlesLivePath(): string {
  return LIVE_PATH;
}

export async function readSeoArticlesFile(): Promise<SeoArticlesFile> {
  const raw = await readFile(LIVE_PATH, "utf8");
  return JSON.parse(raw) as SeoArticlesFile;
}

/** `live.json` + opsi merge `content/cms/articles/*.json` untuk halaman `/artikel/[slug]`. */
export async function readSeoArticlesFileMerged(): Promise<SeoArticlesFile> {
  const base = await readSeoArticlesFile();
  return mergeCmsFolderArticlesInto(base);
}

export async function writeSeoArticlesFile(data: SeoArticlesFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const next: SeoArticlesFile = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(LIVE_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}
