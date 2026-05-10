export type VisitorEventKind = "pageview" | "visit" | "whatsapp_click";

export type VisitorAnalyticsEvent = {
  ts: string;
  kind: VisitorEventKind;
  /** Normalized path, mis. `/cold-storage` */
  path: string;
  /** UUID pengunjung — dari cookie HttpOnly, tanpa data pribadi */
  sid: string;
  browser: string;
  device: "mobile" | "tablet" | "desktop";
  country: string;
  city: string;
  /** Host referer saja; kosong = direct */
  referrerHost: string;
  referrerKind: "direct" | "search" | "social" | "other";
  /** Untuk WhatsApp: hanya sufiks digit aman (mis. 4 digit terakhir), atau "unknown" */
  waDestSuffix?: string;
};
