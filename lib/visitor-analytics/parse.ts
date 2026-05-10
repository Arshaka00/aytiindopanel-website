const BOT_SUBSTRINGS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "bingpreview",
  "facebookexternalhit",
  "embedly",
  "mediapartners-google",
  "telegram",
  "lighthouse",
  "pagespeed",
];

export function isLikelyBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  if (!ua.trim()) return true;
  return BOT_SUBSTRINGS.some((s) => ua.includes(s));
}

export function classifyDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const u = ua.toLowerCase();
  if (/ipad|tablet|playbook/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|webos|blackberry|opera mini/i.test(u)) return "mobile";
  if (/android/i.test(u)) return "mobile";
  return "desktop";
}

export function classifyBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("edg/")) return "Edge";
  if (u.includes("opr/") || u.includes("opera")) return "Opera";
  if (u.includes("chrome") && !u.includes("edg")) return "Chrome";
  if (u.includes("firefox")) return "Firefox";
  if (u.includes("safari") && !u.includes("chrome")) return "Safari";
  if (u.includes("android")) return "Chrome Android";
  return "Other";
}

export function parseReferrer(referrerHeader: string | null): {
  host: string;
  kind: "direct" | "search" | "social" | "other";
} {
  const raw = referrerHeader?.trim() ?? "";
  if (!raw) return { host: "", kind: "direct" };
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const searchEngines = [
      "google.",
      "bing.com",
      "yahoo.",
      "duckduckgo.com",
      "yandex.",
      "baidu.com",
    ];
    const social = [
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "x.com",
      "linkedin.com",
      "tiktok.com",
      "youtube.com",
      "wa.me",
    ];
    if (searchEngines.some((s) => host.includes(s.replace(/\.$/, "")) || host.startsWith("google"))) {
      return { host, kind: "search" };
    }
    if (social.some((s) => host.endsWith(s) || host.includes(s))) {
      return { host, kind: "social" };
    }
    return { host, kind: "other" };
  } catch {
    return { host: "", kind: "other" };
  }
}

/** Ekstrak sufiks digit untuk laporan tanpa menyimpan nomor lengkap. */
export function waHrefToSafeSuffix(href: string): string {
  try {
    const u = new URL(href, "https://wa.me");
    const qPhone = u.searchParams.get("phone");
    if (qPhone && /\d/.test(qPhone)) {
      const digits = qPhone.replace(/\D/g, "");
      return digits.length >= 4 ? digits.slice(-4) : digits || "unknown";
    }
    const phone = u.pathname.replace(/\D/g, "");
    if (phone.length >= 4) return phone.slice(-4);
    return phone || "unknown";
  } catch {
    const digits = href.replace(/\D/g, "");
    return digits.length >= 4 ? digits.slice(-4) : digits || "unknown";
  }
}
