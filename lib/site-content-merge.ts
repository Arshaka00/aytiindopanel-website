import type { SiteContent } from "@/lib/site-content-model";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function mergeArrayByIdentity(baseArr: unknown[], patchArr: unknown[]): unknown[] {
  const allPatchObj = patchArr.every((x) => isPlainObject(x));
  const allBaseObj = baseArr.every((x) => isPlainObject(x));
  if (!allPatchObj || !allBaseObj) return structuredClone(patchArr);

  const hasIdOrSlug = (o: Record<string, unknown>) =>
    typeof o.id === "string" || typeof o.slug === "string";
  if (!patchArr.every((x) => hasIdOrSlug(x as Record<string, unknown>))) {
    return structuredClone(patchArr);
  }

  const keyOf = (o: Record<string, unknown>): string | null => {
    if (typeof o.id === "string") return `id:${o.id}`;
    if (typeof o.slug === "string") return `slug:${o.slug}`;
    return null;
  };

  const baseByKey = new Map<string, Record<string, unknown>>();
  for (const b of baseArr as Record<string, unknown>[]) {
    const k = keyOf(b);
    if (k) baseByKey.set(k, b);
  }

  const merged: unknown[] = [];
  const used = new Set<string>();
  for (const p of patchArr as Record<string, unknown>[]) {
    const k = keyOf(p);
    if (!k) {
      merged.push(structuredClone(p));
      continue;
    }
    const base = baseByKey.get(k);
    used.add(k);
    if (!base) {
      merged.push(structuredClone(p));
      continue;
    }
    merged.push(mergePatchOnto(base, p));
  }

  // Tambahkan item default yang belum ada di patch agar konten tetap utuh.
  for (const b of baseArr as Record<string, unknown>[]) {
    const k = keyOf(b);
    if (!k || used.has(k)) continue;
    merged.push(structuredClone(b));
  }

  return merged;
}

/** Merge patch ke nilai existing; mendukung indeks array sebagai key numerik ("0","1",…) untuk patch bertingkat dari `nestPatch`. */
export function mergePatchOnto(existing: unknown, patch: unknown): unknown {
  if (patch === undefined) return existing;
  if (patch === null) return null;
  if (Array.isArray(patch)) {
    if (Array.isArray(existing)) return mergeArrayByIdentity(existing, patch);
    return structuredClone(patch);
  }
  if (typeof patch !== "object") return patch;
  const p = patch as Record<string, unknown>;
  if (Array.isArray(existing)) {
    const keys = Object.keys(p);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      const arr = structuredClone(existing) as unknown[];
      for (const [ks, pv] of Object.entries(p)) {
        const idx = Number(ks);
        arr[idx] = mergePatchOnto(arr[idx], pv);
      }
      return arr;
    }
    return structuredClone(p);
  }
  if (isPlainObject(existing)) {
    const base = structuredClone(existing) as Record<string, unknown>;
    for (const [k, v] of Object.entries(p)) {
      base[k] = mergePatchOnto(base[k], v);
    }
    return base;
  }
  return structuredClone(p);
}

/**
 * Gabungan dalam untuk patch CMS: objek di-merge rekursif; array & primitif mengganti nilai.
 */
export function deepMergeSitePatch(base: SiteContent, patch: Record<string, unknown>): SiteContent | null {
  try {
    const out = structuredClone(base) as Record<string, unknown>;
    const stack: { target: Record<string, unknown>; source: Record<string, unknown> }[] = [
      { target: out, source: patch },
    ];
    while (stack.length > 0) {
      const { target, source } = stack.pop()!;
      for (const [key, value] of Object.entries(source)) {
        if (value === undefined) continue;
        if (value === null) {
          target[key] = null;
          continue;
        }
        if (key === "version" && typeof value === "number" && value !== 1) return null;
        if (Array.isArray(value)) {
          const existing = target[key];
          if (Array.isArray(existing)) target[key] = mergeArrayByIdentity(existing, value);
          else target[key] = structuredClone(value);
          continue;
        }
        if (isPlainObject(value)) {
          const existing = target[key];
          if (Array.isArray(existing)) {
            const idxKeys = Object.keys(value as Record<string, unknown>);
            if (idxKeys.length > 0 && idxKeys.every((k) => /^\d+$/.test(k))) {
              target[key] = mergePatchOnto(existing, value);
              continue;
            }
            target[key] = structuredClone(value);
            continue;
          }
          if (existing !== undefined && isPlainObject(existing)) {
            stack.push({
              target: existing as Record<string, unknown>,
              source: value as Record<string, unknown>,
            });
          } else {
            target[key] = structuredClone(value);
          }
          continue;
        }
        target[key] = value;
      }
    }
    return out as unknown as SiteContent;
  } catch {
    return null;
  }
}

export function validateSiteContentMinimal(c: SiteContent): boolean {
  if (c.version !== 1) return false;
  if (!c.siteSettings || typeof c.siteSettings !== "object") return false;
  if (typeof c.siteSettings.published !== "boolean") return false;
  if (typeof c.siteSettings.maintenanceMode !== "boolean") return false;
  const hasVideo = Boolean(c.hero?.backgroundVideo && c.hero.backgroundVideo.src?.startsWith("/"));
  const hasSlides = (c.hero?.slides?.length ?? 0) > 0;
  if (!hasVideo && !hasSlides) return false;
  if (!Array.isArray(c.produk?.categories)) return false;
  if (!c.serviceMaintenance?.cards) return false;
  return true;
}

function isPlainObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Hanya cabang yang berbeda dari defaults — untuk `site-content-overrides.json`. */
export function deepDiffFromDefaults(defaults: SiteContent, current: SiteContent): Record<string, unknown> {
  const diff = diffRecursive(defaults, current);
  return (diff && typeof diff === "object" && !Array.isArray(diff) ? diff : {}) as Record<string, unknown>;
}

function diffRecursive(a: unknown, b: unknown): unknown {
  if (Object.is(a, b)) return undefined;
  if (a === null || b === null) return b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (JSON.stringify(a) === JSON.stringify(b)) return undefined;
    return structuredClone(b);
  }
  if (isPlainObj(a) && isPlainObj(b)) {
    const out: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const sub = diffRecursive(a[k], b[k]);
      if (sub !== undefined) out[k] = sub;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return structuredClone(b);
}
