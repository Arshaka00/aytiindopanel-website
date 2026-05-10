export const WHATSAPP_PHONE_NUMBER = "6285121104411" as const;

export type WhatsAppMessageKey =
  | "sandwich_pu_camelock"
  | "sandwich_pu_full_knock_down"
  | "sandwich_panel_eps"
  | "cold_storage_system"
  | "air_blast_freezer"
  | "portable_cold_storage"
  | "cold_room_door"
  | "loading_dock_system"
  | "refrigeration_system"
  | "maintenance_berkala"
  | "perbaikan_troubleshooting"
  | "after_sales_support"
  | "general_consultation"
  | "generic_inquiry";

export const WHATSAPP_PRODUCT_NAMES: Record<WhatsAppMessageKey, string> = {
  sandwich_pu_camelock: "Sandwich Panel PU Camelock",
  sandwich_pu_full_knock_down: "Sandwich Panel PU Full Knock Down",
  sandwich_panel_eps: "Sandwich Panel EPS",
  cold_storage_system: "Cold Storage System",
  air_blast_freezer: "Air Blast Freezer",
  portable_cold_storage: "Portable Cold Storage",
  cold_room_door: "Cold Room Door",
  loading_dock_system: "Loading Dock System",
  refrigeration_system: "Refrigeration System",
  maintenance_berkala: "layanan Maintenance Berkala",
  perbaikan_troubleshooting: "layanan Perbaikan & Troubleshooting",
  after_sales_support: "layanan After Sales Support",
  general_consultation: "solusi cold storage dan refrigerasi",
  generic_inquiry: "solusi cold storage dan refrigerasi",
};

export function getWhatsAppProductName(messageKey?: WhatsAppMessageKey): string {
  if (!messageKey) return "produk/layanan";
  return WHATSAPP_PRODUCT_NAMES[messageKey] ?? "produk/layanan";
}

export const PRODUCT_SLUG_TO_WHATSAPP_KEY: Partial<Record<string, WhatsAppMessageKey>> = {
  "sandwich-panel-pu-camelock": "sandwich_pu_camelock",
  "sandwich-panel-pu-full-knock-down": "sandwich_pu_full_knock_down",
  "sandwich-panel-eps": "sandwich_panel_eps",
  "cold-storage-custom": "cold_storage_system",
  "pembekuan-cepat-abf": "air_blast_freezer",
  "cold-storage-portable": "portable_cold_storage",
  "pintu-panel": "cold_room_door",
  "loading-dock-system": "loading_dock_system",
  "sistem-refrigerasi": "refrigeration_system",
  "maintenance-berkala": "maintenance_berkala",
  "perbaikan-troubleshooting": "perbaikan_troubleshooting",
  "after-sales-support": "after_sales_support",
};
