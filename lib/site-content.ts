import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

import { getSiteContentFileStoragePort } from "@/lib/cms-storage";
import { isGlobalPublishEnabled } from "@/lib/cms-global-publish-flag";
import { createDefaultSiteContent } from "@/lib/site-content-defaults";
import { deepMergeSitePatch, validateSiteContentMinimal } from "@/lib/site-content-merge";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import type { SiteContent, SiteContentOverridesFile } from "@/lib/site-content-model";
import { createSiteContentRepository } from "@/lib/site-content-repository";
import {
  getStorageVersionToken,
  writeSiteContentToStorage,
} from "@/lib/site-content-storage";
import { validateSiteContentStrict, type SiteContentValidationError } from "@/lib/site-content-schema";
import { runAfterSiteContentLiveUpdated } from "@/lib/site-content-after-publish";
import { logEvent } from "@/lib/structured-log";

export type { HeroIntroParts, SiteContent, SiteContentOverridesFile } from "@/lib/site-content-model";

const OVERRIDES_PATH = path.join(process.cwd(), "data", "site-content-overrides.json");

let defaultSiteContentCache: SiteContent | null = null;
const repository = createSiteContentRepository();

/** Referensi stabil untuk diff (tanpa clone). */
export function getDefaultSiteContentRef(): SiteContent {
  if (!defaultSiteContentCache) {
    defaultSiteContentCache = createDefaultSiteContent();
  }
  return defaultSiteContentCache;
}

export function mergeDefaultsWithOverrides(
  defaults: SiteContent,
  overrides: SiteContentOverridesFile,
): SiteContent {
  if (!overrides || typeof overrides !== "object") return structuredClone(defaults);
  const merged = deepMergeSitePatch(structuredClone(defaults), overrides as Record<string, unknown>);
  return merged ?? structuredClone(defaults);
}

export function mergeSiteContent(base: SiteContent, patch: unknown): SiteContent | null {
  if (patch === undefined) return structuredClone(base);
  if (patch === null || typeof patch !== "object") return null;
  const merged = deepMergeSitePatch(base, patch as Record<string, unknown>);
  if (!merged || !validateSiteContentMinimal(merged)) return null;
  return merged;
}

export async function readSiteContentOverrides(): Promise<SiteContentOverridesFile> {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as SiteContentOverridesFile;
  } catch {
    return {};
  }
}

export async function getSiteContentVersionToken(): Promise<string> {
  return getStorageVersionToken();
}

async function readLiveSiteContent(): Promise<SiteContent> {
  const defaults = getDefaultSiteContentRef();
  const migrated = await migrateLegacyOverridesIfNeeded(defaults);
  if (migrated) return migrated;
  return repository.read("live", defaults);
}

/** Dedupe pembacaan konten dalam satu request React (layout + halaman). */
export const getSiteContent = cache(readLiveSiteContent);

export async function writeSiteContentOverrides(content: SiteContent): Promise<void> {
  await writeSiteContentToStorage("live", content);
}

export async function applySiteContentPatch(patch: unknown): Promise<SiteContent | null> {
  const defaults = getDefaultSiteContentRef();
  const current = await repository.read("draft", defaults);
  const next = mergeSiteContent(current, patch);
  if (!next) return null;
  await repository.write("draft", next);
  // Public pages read from "live"; keep live in sync for inline CMS editing workflow.
  await repository.write("live", next);
  await runAfterSiteContentLiveUpdated().catch(() => {});
  return next;
}

export async function getDraftSiteContent(): Promise<SiteContent> {
  if (!isGlobalPublishEnabled()) {
    return getSiteContent();
  }
  return repository.read("draft", getDefaultSiteContentRef());
}

export async function restoreDraftSiteContent(content: SiteContent): Promise<void> {
  await repository.write("draft", content);
  if (!isGlobalPublishEnabled()) {
    await repository.write("live", content);
    await runAfterSiteContentLiveUpdated().catch(() => {});
  }
}

export async function publishSiteContentDraft(): Promise<SiteContent> {
  await repository.publishDraft();
  return getSiteContent();
}

export function validateSiteContentPayload(content: unknown): {
  ok: boolean;
  errors?: SiteContentValidationError[];
  content?: SiteContent;
} {
  const validated = validateSiteContentStrict(content);
  if (!validated.ok) return { ok: false, errors: validated.errors };
  return { ok: true, content: normalizeSiteContent(validated.content) };
}

async function migrateLegacyOverridesIfNeeded(defaults: SiteContent): Promise<SiteContent | null> {
  const port = getSiteContentFileStoragePort();
  const [liveRaw, draftRaw] = await Promise.all([port.readRawByMode("live"), port.readRawByMode("draft")]);
  if (liveRaw !== null || draftRaw !== null) return null;
  const overrides = await readSiteContentOverrides();
  const merged = mergeDefaultsWithOverrides(defaults, overrides);
  const normalized = normalizeSiteContent(merged);
  try {
    await Promise.all([
      writeSiteContentToStorage("live", normalized),
      writeSiteContentToStorage("draft", normalized),
    ]);
    return normalized;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logEvent("warn", "site_content_legacy_migrate_skipped", {
      message: msg.slice(0, 280),
      hint: "Periksa Vercel Blob: store aktif, token cocok dengan store, CMS_BLOB_PREFIX benar.",
    });
    return null;
  }
}
