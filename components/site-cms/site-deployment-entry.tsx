"use client";

import { useCallback, useEffect, useState } from "react";

import { SiteDeploymentPanel } from "@/components/site-cms/site-deployment-panel";
import { SiteSettingsPasswordGate } from "@/components/site-cms/site-settings-password-gate";

const STORAGE_KEY = "site_settings_gate_token";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const t = sessionStorage.getItem(STORAGE_KEY)?.trim();
    return t && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

/** Gate sama dengan Site Settings — satu kunci per tab. */
export function SiteDeploymentEntry() {
  const [gateToken, setGateToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGateToken(readStoredToken());
    setReady(true);
  }, []);

  const handleUnlocked = useCallback((token: string) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, token);
    } catch {
      /* noop */
    }
    setGateToken(token);
  }, []);

  const handleGateInvalid = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setGateToken(null);
  }, []);

  if (!ready) {
    return (
      <p className="text-center text-sm text-slate-400" aria-live="polite">
        Memuat…
      </p>
    );
  }

  if (!gateToken) {
    return <SiteSettingsPasswordGate onUnlocked={handleUnlocked} />;
  }
  return <SiteDeploymentPanel gateToken={gateToken} onGateInvalid={handleGateInvalid} />;
}
