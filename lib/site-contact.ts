import { WHATSAPP_PHONE_NUMBER } from "@/components/aytipanel/constants/whatsapp";
import type { SiteContent } from "@/lib/site-content-model";

/** Nomor canonical untuk wa.me (hanya digit, tanpa +). */
export function sanitizeWhatsAppToDigits(input: string): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return "";

  let candidate = raw;
  try {
    if (/\bwa\.me\b/i.test(candidate) || candidate.includes("api.whatsapp.com")) {
      const withProto = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
      const u = new URL(withProto);
      const seg = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
      if (seg) candidate = seg;
    }
  } catch {
    // lanjut parse digit dari string mentah
  }

  const digits = candidate.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (
    digits.length >= 9 &&
    digits.length <= 11 &&
    digits.startsWith("8") &&
    !digits.startsWith("62")
  ) {
    return `62${digits}`;
  }
  return digits;
}

/** Tampilan umum untuk Indonesia: 628xx → 08xx */
export function formatWhatsAppDisplayLocal(digits: string): string {
  if (!digits) return "";
  if (digits.startsWith("62") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeEmail(input: string): string {
  return typeof input === "string" ? input.trim() : "";
}

export function isValidEmail(input: string): boolean {
  const s = sanitizeEmail(input);
  return s.length > 0 && EMAIL_RE.test(s);
}

export function resolvePrimaryWhatsAppDigits(settings: SiteContent["siteSettings"]): string {
  const list = settings.whatsappNumbers ?? [];
  const primaryFirst = [...list].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
  for (const row of primaryFirst) {
    const d = sanitizeWhatsAppToDigits(row.number);
    if (d) return d;
  }
  return WHATSAPP_PHONE_NUMBER;
}

export function resolvePrimaryEmail(settings: SiteContent["siteSettings"], fallback: string): string {
  const list = settings.emails ?? [];
  const primaryFirst = [...list].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
  for (const row of primaryFirst) {
    const e = sanitizeEmail(row.email);
    if (e && isValidEmail(e)) return e;
  }
  return sanitizeEmail(fallback) || fallback;
}
