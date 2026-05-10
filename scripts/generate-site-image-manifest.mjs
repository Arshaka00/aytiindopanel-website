/**
 * Memindai semua file gambar di public/images/** dan menulis
 * components/aytipanel/site-image-upload-dates.generated.ts
 *
 * Jalankan lewat npm run prebuild atau npm run site:manifest
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const imagesRoot = path.join(repoRoot, "public", "images");
const outFile = path.join(
  repoRoot,
  "components",
  "aytipanel",
  "site-image-upload-dates.generated.ts",
);

const EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

function walk(dir, map) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(fp, map);
      continue;
    }
    const ext = path.extname(ent.name).toLowerCase();
    if (!EXT.has(ext)) continue;
    const rel = path.relative(imagesRoot, fp).split(path.sep).join("/");
    const urlPath = `/images/${rel}`;
    map[urlPath] = fs.statSync(fp).mtime.toISOString();
  }
}

function main() {
  /** @type {Record<string, string>} */
  const map = {};
  walk(imagesRoot, map);

  const keys = Object.keys(map).sort();
  const lines = keys.map(
    (k) => `  ${JSON.stringify(k)}: ${JSON.stringify(map[k])},`,
  );
  const body = [
    "/**",
    " * AUTO-GENERATED oleh scripts/generate-site-image-manifest.mjs — jangan edit manual.",
    " * Nilai: ISO 8601 dari mtime file di disk (waktu terakhir gambar ditulis / diganti).",
    " * Tambah/ganti file di public/images lalu jalankan build atau npm run site:manifest.",
    " */",
    "export const SITE_IMAGE_UPLOAD_ISO: Record<string, string> = {",
    ...lines,
    "};",
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, body, "utf8");
  console.log(
    "[site-image-manifest] wrote",
    keys.length,
    "entries →",
    path.relative(repoRoot, outFile),
  );
}

main();
