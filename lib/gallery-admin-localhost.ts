/**
 * Deteksi host pengembangan lokal untuk izin admin/CMS yang longgar (tanpa cookie bind).
 * Dipakai server (`isGalleryAdminLocalhostRequest`) dan boleh dipakai klien (`isLocalDevSiteHostname`).
 */

function firstForwardedHost(forwardedHost: string | null | undefined): string {
  if (!forwardedHost) return "";
  return forwardedHost.split(",")[0]?.trim() ?? "";
}

/** Ambil hostname saja (tanpa port); dukung `[::1]:port`. */
export function hostHeaderToHostname(hostHeader: string | null | undefined): string {
  const raw = (hostHeader ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("[")) {
    const end = raw.indexOf("]");
    if (end > 1) return raw.slice(1, end).toLowerCase();
  }
  const colon = raw.lastIndexOf(":");
  if (colon > 0 && /^[0-9]+$/.test(raw.slice(colon + 1))) {
    return raw.slice(0, colon).toLowerCase();
  }
  return raw.toLowerCase();
}

/**
 * Hostname (tanpa port) adalah lingkungan dev lokal: localhost, .local, atau RFC1918 saat NODE_ENV=development.
 */
export function isLocalDevSiteHostname(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  if (!h) return false;
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  if (h.endsWith(".local")) return true;
  if (process.env.NODE_ENV === "development") {
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  }
  return false;
}

/**
 * Permintaan ke server dari host dev (Host / X-Forwarded-Host).
 */
export function isGalleryAdminLocalhostRequest(host: string | null, forwardedHost: string | null): boolean {
  const fromXfh = hostHeaderToHostname(firstForwardedHost(forwardedHost));
  if (fromXfh && isLocalDevSiteHostname(fromXfh)) return true;
  return isLocalDevSiteHostname(hostHeaderToHostname(host));
}
