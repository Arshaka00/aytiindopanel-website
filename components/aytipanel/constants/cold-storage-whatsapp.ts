import { generateWhatsAppLink, generateWhatsAppMessage } from "@/utils/whatsapp";

/**
 * WhatsApp funnel khusus landing /cold-storage.
 * Satu sumber kebenaran untuk URL + pesan pra-isi + penanda lead.
 */
export const WHATSAPP_COLD_STORAGE_PREFILL_MESSAGE =
  generateWhatsAppMessage("Cold Storage System", "solusi_sistem");

export const WHATSAPP_COLD_STORAGE_URL =
  generateWhatsAppLink(WHATSAPP_COLD_STORAGE_PREFILL_MESSAGE);

/** Nilai untuk `data-source` pada taut WA dari halaman cold-storage. */
export const COLD_STORAGE_LEAD_SOURCE = "cold-storage" as const;
