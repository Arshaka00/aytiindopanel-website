/**
 * Pemeriksaan ringan di CI/lokal: provider navigasi membungkus SiteHeader
 * (bukan hanya "compile OK").
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const layoutPath = path.join(__dirname, "..", "app", "layout.tsx");
const raw = fs.readFileSync(layoutPath, "utf8");

if (!raw.includes("NavigationTransitionProvider")) {
  console.error("FAIL: layout.tsx tidak memuat NavigationTransitionProvider");
  process.exit(1);
}

const open = raw.indexOf("<NavigationTransitionProvider");
const header = raw.indexOf("<SiteHeader");
const closeProvider = raw.indexOf("</NavigationTransitionProvider>");

if (open === -1 || header === -1 || closeProvider === -1) {
  console.error("FAIL: struktur layout tidak lengkap");
  process.exit(1);
}

if (!(open < header && header < closeProvider)) {
  console.error("FAIL: SiteHeader harus di dalam NavigationTransitionProvider");
  process.exit(1);
}

const headerFile = path.join(__dirname, "..", "components", "aytipanel", "site-header.tsx");
const headerSrc = fs.readFileSync(headerFile, "utf8");
if (!headerSrc.includes("useNavigationTransition")) {
  console.error("FAIL: SiteHeader harus memakai useNavigationTransition");
  process.exit(1);
}
if (!headerSrc.includes("spaNavigate")) {
  console.error("FAIL: SiteHeader harus meneruskan spaNavigate ke navigateLandingHashFromNav");
  process.exit(1);
}

const navTs = fs.readFileSync(
  path.join(__dirname, "..", "components", "common", "home-nav-scroll.ts"),
  "utf8",
);
if (!navTs.includes("spaNavigate")) {
  console.error("FAIL: navigateLandingHashFromNav harus mendukung spaNavigate");
  process.exit(1);
}

console.log("OK: integrasi NavigationTransitionProvider + SiteHeader + spaNavigate terverifikasi (statis).");
