"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { CmsToastStack, type ToastItem } from "@/components/site-cms/cms-toast-stack";
import { isSiteCmsSurfaceOriginAllowed } from "@/lib/cms-chrome-gate";
import type { SiteContent } from "@/lib/site-content";

const SiteMediaLibraryModal = dynamic(
  () =>
    import("@/components/site-cms/site-media-library-modal").then((m) => m.SiteMediaLibraryModal),
  { ssr: false },
);

const MAX_UNDO_STACK = 10;

export type SiteCmsSaveState = "idle" | "saving" | "saved" | "error";

export type SiteCmsContextValue = {
  eligible: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  ensureWriteSession: () => Promise<boolean>;
  refreshPage: () => void;
  patchContent: (path: string, value: string) => Promise<void>;
  patchDeep: (patch: Record<string, unknown>) => Promise<void>;
  stageMediaChange: (path: string, url: string) => void;
  saveStagedMedia: () => Promise<void>;
  discardStagedMedia: () => void;
  stagedMediaCount: number;
  stagedMediaByPath: Record<string, string>;
  /** Buka media library; dengan `assignPath`, pilih/unggah langsung mengisi field. */
  openMediaLibrary: (opts?: { assignPath?: string }) => void;
  closeMediaLibrary: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  dirtyEditingCount: number;
  /** Status simpan terakhir (debounced). */
  saveState: SiteCmsSaveState;
  /** Ada perubahan belum di-refresh (setelah patch sukses, sebelum refresh). */
  pendingRefresh: boolean;
  pushToast: (message: string, kind?: "ok" | "err") => void;
};

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  const cookie = document.cookie.split("; ").find((c) => c.startsWith(key));
  return cookie ? decodeURIComponent(cookie.slice(key.length)) : "";
}

function nestPatch(path: string, value: string): Record<string, unknown> {
  const keys = path.split(".").filter(Boolean);
  if (keys.length === 0) return {};
  let obj: Record<string, unknown> = { [keys[keys.length - 1]]: value };
  for (let i = keys.length - 2; i >= 0; i--) {
    obj = { [keys[i]]: obj };
  }
  return obj;
}

function deepMergeRecords(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k];
    if (
      cur &&
      v &&
      typeof cur === "object" &&
      typeof v === "object" &&
      !Array.isArray(cur) &&
      !Array.isArray(v)
    ) {
      out[k] = deepMergeRecords(cur as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

const SiteCmsContext = createContext<SiteCmsContextValue | null>(null);

export function useSiteCmsOptional() {
  return useContext(SiteCmsContext);
}

export function useSiteCms(): SiteCmsContextValue {
  const ctx = useContext(SiteCmsContext);
  if (!ctx) {
    throw new Error("useSiteCms harus di dalam SiteCmsProvider");
  }
  return ctx;
}

export function nestContentPatch(path: string, value: string): Record<string, unknown> {
  return nestPatch(path, value);
}

export function SiteCmsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [eligible, setEligible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveState, setSaveState] = useState<SiteCmsSaveState>("idle");
  const [pendingRefresh, setPendingRefresh] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pastRef = useRef<SiteContent[]>([]);
  const futureRef = useRef<SiteContent[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [dirtyEditingCount, setDirtyEditingCount] = useState(0);
  const dirtyEditorsRef = useRef<Set<string>>(new Set());
  const [mediaLibOpen, setMediaLibOpen] = useState(false);
  const [mediaLibAssignPath, setMediaLibAssignPath] = useState<string | null>(null);
  const [stagedMediaMap, setStagedMediaMap] = useState<Record<string, string>>({});
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const pendingAuthRef = useRef<((ok: boolean) => void) | null>(null);
  const lastViewRef = useRef<{ y: number; hash: string; sectionId: string }>({
    y: 0,
    hash: "",
    sectionId: "",
  });

  const detectActiveSectionId = useCallback((): string => {
    if (typeof document === "undefined") return "";
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("section[id], [data-cms-section][id]"));
    if (candidates.length === 0) return "";
    const viewportMid = window.innerHeight * 0.35;
    let bestId = "";
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const el of candidates) {
      const rect = el.getBoundingClientRect();
      const inRange = rect.bottom >= 0 && rect.top <= window.innerHeight;
      if (!inRange) continue;
      const distance = Math.abs(rect.top - viewportMid);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = el.id;
      }
    }
    return bestId;
  }, []);

  const snapshotViewport = useCallback(() => {
    if (typeof window === "undefined") return;
    lastViewRef.current = {
      y: window.scrollY,
      hash: window.location.hash,
      sectionId: detectActiveSectionId(),
    };
  }, [detectActiveSectionId]);

  const restoreViewport = useCallback(() => {
    if (typeof window === "undefined") return;
    const { y, hash, sectionId } = lastViewRef.current;
    const targetId = sectionId || (hash.startsWith("#") ? hash.slice(1) : "");
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "auto" });
      }
      const nextHash = `#${targetId}`;
      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
      }
    } else if (hash && window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
    window.scrollTo({ top: y, behavior: "auto" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/gallery-admin/eligibility", { credentials: "include" });
        const j = (await r.json().catch(() => ({}))) as { eligible?: boolean };
        const apiOk = r.ok && j.eligible === true;
        const originOk = isSiteCmsSurfaceOriginAllowed();
        if (!cancelled) setEligible(apiOk && originOk);
      } catch {
        if (!cancelled) setEligible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshPage = useCallback(() => {
    snapshotViewport();
    router.refresh();
    if (typeof window !== "undefined") {
      window.setTimeout(restoreViewport, 80);
      window.setTimeout(restoreViewport, 240);
    }
    setPendingRefresh(false);
  }, [restoreViewport, router, snapshotViewport]);

  const scheduleRefresh = useCallback(() => {
    setPendingRefresh(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    snapshotViewport();
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      router.refresh();
      if (typeof window !== "undefined") {
        window.setTimeout(restoreViewport, 80);
        window.setTimeout(restoreViewport, 240);
      }
      setPendingRefresh(false);
      setSaveState("idle");
    }, 520);
  }, [restoreViewport, router, snapshotViewport]);

  const pushToast = useCallback((message: string, kind: "ok" | "err" = "ok") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((t) => [...t, { id, message, kind }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const fetchContentSnapshot = useCallback(async (): Promise<SiteContent | null> => {
    try {
      const r = await fetch("/api/site-content", { credentials: "include" });
      if (!r.ok) return null;
      const j = (await r.json().catch(() => ({}))) as { content?: SiteContent };
      return j.content ?? null;
    } catch {
      return null;
    }
  }, []);

  const pushUndoSnapshot = useCallback(
    (before: SiteContent | null) => {
      if (!before) return;
      pastRef.current.push(structuredClone(before));
      if (pastRef.current.length > MAX_UNDO_STACK) pastRef.current.shift();
      futureRef.current = [];
      syncHistoryFlags();
    },
    [syncHistoryFlags],
  );

  const restoreSnapshot = useCallback(
    async (snapshot: SiteContent) => {
      const r = await fetch("/api/site-content/restore", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-cms-csrf-token": readCookie("cms_csrf_token"),
        },
        body: JSON.stringify({ content: snapshot }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal memulihkan.");
      }
      setSaveState("saved");
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  const openMediaLibrary = useCallback((opts?: { assignPath?: string }) => {
    setMediaLibAssignPath(typeof opts?.assignPath === "string" ? opts.assignPath : null);
    setMediaLibOpen(true);
  }, []);

  const closeMediaLibrary = useCallback(() => {
    setMediaLibOpen(false);
    setMediaLibAssignPath(null);
  }, []);

  const stageMediaChange = useCallback((path: string, url: string) => {
    if (!path || !url) return;
    setStagedMediaMap((prev) => ({ ...prev, [path]: url }));
  }, []);

  const discardStagedMedia = useCallback(() => {
    const stagedPaths = Object.keys(stagedMediaMap);
    for (const path of stagedPaths) {
      window.dispatchEvent(new CustomEvent("cms-image-preview-reset", { detail: { path } }));
    }
    setStagedMediaMap({});
    if (stagedPaths.length > 0) pushToast("Perubahan media dibatalkan", "ok");
  }, [pushToast, stagedMediaMap]);

  const ensureWriteSession = useCallback(async (): Promise<boolean> => {
    try {
      const r = await fetch("/api/gallery-admin/session", { credentials: "include" });
      const j = (await r.json().catch(() => ({}))) as { deviceOk?: boolean; sessionOk?: boolean };
      if (r.ok && j.deviceOk && j.sessionOk) return true;
    } catch {
      /* noop */
    }
    return await new Promise<boolean>((resolve) => {
      setPwdError(null);
      setPassword("");
      pendingAuthRef.current = resolve;
      setPwdOpen(true);
    });
  }, []);

  const submitPassword = useCallback(async () => {
    setPwdBusy(true);
    setPwdError(null);
    try {
      const r = await fetch("/api/gallery-admin/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setPwdError(j.error ?? "Autentikasi gagal.");
        pendingAuthRef.current?.(false);
        pendingAuthRef.current = null;
        return;
      }
      pendingAuthRef.current?.(true);
      pendingAuthRef.current = null;
      setPwdOpen(false);
      setPassword("");
    } catch {
      setPwdError("Jaringan bermasalah.");
      pendingAuthRef.current?.(false);
      pendingAuthRef.current = null;
    } finally {
      setPwdBusy(false);
    }
  }, [password]);

  const cancelPassword = useCallback(() => {
    pendingAuthRef.current?.(false);
    pendingAuthRef.current = null;
    setPwdOpen(false);
    setPassword("");
    setPwdError(null);
  }, []);

  const undo = useCallback(async () => {
    if (pastRef.current.length === 0) return;
    const ok = await ensureWriteSession();
    if (!ok) return;
    const cur = await fetchContentSnapshot();
    if (!cur) {
      pushToast("Tidak dapat memuat konten.", "err");
      return;
    }
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(structuredClone(cur));
    setSaveState("saving");
    try {
      await restoreSnapshot(prev);
      pushToast("Dibatalkan", "ok");
      syncHistoryFlags();
    } catch (e) {
      pastRef.current.push(prev);
      futureRef.current.pop();
      setSaveState("error");
      pushToast(e instanceof Error ? e.message : "Undo gagal", "err");
      syncHistoryFlags();
    }
  }, [
    ensureWriteSession,
    fetchContentSnapshot,
    pushToast,
    restoreSnapshot,
    syncHistoryFlags,
  ]);

  const redo = useCallback(async () => {
    if (futureRef.current.length === 0) return;
    const ok = await ensureWriteSession();
    if (!ok) return;
    const cur = await fetchContentSnapshot();
    if (!cur) {
      pushToast("Tidak dapat memuat konten.", "err");
      return;
    }
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(structuredClone(cur));
    if (pastRef.current.length > MAX_UNDO_STACK) pastRef.current.shift();
    setSaveState("saving");
    try {
      await restoreSnapshot(next);
      pushToast("Dipulihkan lagi", "ok");
      syncHistoryFlags();
    } catch (e) {
      futureRef.current.push(next);
      pastRef.current.pop();
      setSaveState("error");
      pushToast(e instanceof Error ? e.message : "Redo gagal", "err");
      syncHistoryFlags();
    }
  }, [
    ensureWriteSession,
    fetchContentSnapshot,
    pushToast,
    restoreSnapshot,
    syncHistoryFlags,
  ]);

  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const el = e.target as HTMLElement | null;
      if (el?.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      if (e.shiftKey) void redo();
      else void undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editMode, redo, undo]);

  useEffect(() => {
    const onDirty = (ev: Event) => {
      const ce = ev as CustomEvent<{ editorId?: string; dirty?: boolean }>;
      const editorId = ce.detail?.editorId;
      if (!editorId) return;
      if (ce.detail?.dirty) dirtyEditorsRef.current.add(editorId);
      else dirtyEditorsRef.current.delete(editorId);
      setDirtyEditingCount(dirtyEditorsRef.current.size);
    };
    window.addEventListener("cms-text-dirty", onDirty as EventListener);
    return () => window.removeEventListener("cms-text-dirty", onDirty as EventListener);
  }, []);

  const patchContent = useCallback(
    async (path: string, value: string) => {
      const ok = await ensureWriteSession();
      if (!ok) return;
      const before = await fetchContentSnapshot();
      setSaveState("saving");
      const patch = nestPatch(path, value);
      try {
        const r = await fetch("/api/site-content", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-cms-csrf-token": readCookie("cms_csrf_token"),
          },
          body: JSON.stringify({ patch }),
        });
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? "Gagal menyimpan.");
        }
        pushUndoSnapshot(before);
        setSaveState("saved");
        pushToast("Tersimpan", "ok");
        scheduleRefresh();
      } catch (e) {
        setSaveState("error");
        pushToast(e instanceof Error ? e.message : "Gagal menyimpan", "err");
        throw e;
      }
    },
    [ensureWriteSession, fetchContentSnapshot, pushToast, pushUndoSnapshot, scheduleRefresh],
  );

  const patchDeep = useCallback(
    async (patch: Record<string, unknown>) => {
      const ok = await ensureWriteSession();
      if (!ok) return;
      const before = await fetchContentSnapshot();
      setSaveState("saving");
      try {
        const r = await fetch("/api/site-content", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-cms-csrf-token": readCookie("cms_csrf_token"),
          },
          body: JSON.stringify({ patch }),
        });
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? "Gagal menyimpan.");
        }
        pushUndoSnapshot(before);
        setSaveState("saved");
        pushToast("Tersimpan", "ok");
        scheduleRefresh();
      } catch (e) {
        setSaveState("error");
        pushToast(e instanceof Error ? e.message : "Gagal menyimpan", "err");
        throw e;
      }
    },
    [ensureWriteSession, fetchContentSnapshot, pushToast, pushUndoSnapshot, scheduleRefresh],
  );

  const saveStagedMedia = useCallback(async () => {
    const entries = Object.entries(stagedMediaMap);
    if (entries.length === 0) {
      pushToast("Tidak ada perubahan media untuk disimpan", "ok");
      return;
    }
    const ok = await ensureWriteSession();
    if (!ok) return;
    const before = await fetchContentSnapshot();
    setSaveState("saving");
    let patch: Record<string, unknown> = {};
    for (const [path, url] of entries) {
      const nested = nestPatch(path, url);
      patch = deepMergeRecords(patch, nested);
    }
    try {
      const r = await fetch("/api/site-content", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-cms-csrf-token": readCookie("cms_csrf_token"),
        },
        body: JSON.stringify({ patch }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Gagal menyimpan media.");
      }
      pushUndoSnapshot(before);
      setStagedMediaMap({});
      setSaveState("saved");
      pushToast("Perubahan media tersimpan", "ok");
      scheduleRefresh();
    } catch (e) {
      setSaveState("error");
      pushToast(e instanceof Error ? e.message : "Gagal menyimpan media", "err");
      throw e;
    }
  }, [
    ensureWriteSession,
    fetchContentSnapshot,
    pushToast,
    pushUndoSnapshot,
    scheduleRefresh,
    stagedMediaMap,
  ]);

  const value = useMemo(
    () =>
      ({
        eligible,
        editMode,
        setEditMode,
        ensureWriteSession,
        refreshPage,
        patchContent,
        patchDeep,
        stageMediaChange,
        saveStagedMedia,
        discardStagedMedia,
        stagedMediaCount: Object.keys(stagedMediaMap).length,
        stagedMediaByPath: stagedMediaMap,
        openMediaLibrary,
        closeMediaLibrary,
        undo,
        redo,
        canUndo,
        canRedo,
        dirtyEditingCount,
        saveState,
        pendingRefresh,
        pushToast,
      }) satisfies SiteCmsContextValue,
    [
      eligible,
      editMode,
      ensureWriteSession,
      refreshPage,
      patchContent,
      patchDeep,
      stageMediaChange,
      saveStagedMedia,
      discardStagedMedia,
      stagedMediaMap,
      openMediaLibrary,
      closeMediaLibrary,
      undo,
      redo,
      canUndo,
      canRedo,
      dirtyEditingCount,
      saveState,
      pendingRefresh,
      pushToast,
    ],
  );

  return (
    <SiteCmsContext.Provider value={value}>
      <CmsToastStack toasts={toasts} onDismiss={dismissToast} />
      {children}
      <SiteMediaLibraryModal
        open={mediaLibOpen}
        onClose={closeMediaLibrary}
        assignPath={mediaLibAssignPath ?? undefined}
      />
      {pwdOpen ? (
        <div
          className="fixed inset-0 z-[62000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-cms-pwd-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <h2 id="site-cms-pwd-title" className="text-base font-semibold text-slate-50">
              Autentikasi admin
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Masukkan password untuk menyimpan perubahan. Password hanya diverifikasi di server.
            </p>
            <label className="mt-4 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitPassword();
                  if (e.key === "Escape") cancelPassword();
                }}
                className="mt-2 w-full rounded-xl border border-white/12 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-600 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-400/25"
              />
            </label>
            {pwdError ? <p className="mt-2 text-sm text-red-300">{pwdError}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelPassword}
                className="rounded-xl border border-white/12 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pwdBusy || password.length === 0}
                onClick={() => void submitPassword()}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(14,165,233,0.35)] transition hover:bg-sky-400 disabled:opacity-50"
              >
                {pwdBusy ? "Memproses…" : "Masuk"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SiteCmsContext.Provider>
  );
}
