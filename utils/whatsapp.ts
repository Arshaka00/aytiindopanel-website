import {
  WHATSAPP_PHONE_NUMBER,
  type WhatsAppMessageKey,
  getWhatsAppProductName,
} from "@/components/aytipanel/constants/whatsapp";

export type WhatsAppMessageContext =
  | "produk"
  | "solusi_sistem"
  | "accessories"
  | "maintenance"
  | "troubleshooting"
  | "after_sales"
  | "konsultasi";

export function generateWhatsAppMessage(
  productName: string,
  context: WhatsAppMessageContext = "konsultasi"
): string {
  switch (context) {
    case "produk":
      return `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi mengenai ${productName}.
Terima kasih.`.trim();
    case "solusi_sistem":
      return `Halo PT AYTI INDO PANEL,
Kami sedang mencari solusi ${productName}.
Mohon informasi lebih lanjut.
Terima kasih.`.trim();
    case "accessories":
      return `Halo PT AYTI INDO PANEL,
Mohon info ${productName} dan sistem instalasinya.
Terima kasih.`.trim();
    case "maintenance":
      return `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi mengenai layanan maintenance berkala.
Terima kasih.`.trim();
    case "troubleshooting":
      return `Halo PT AYTI INDO PANEL,
Kami membutuhkan bantuan troubleshooting untuk sistem pendingin.
Terima kasih.`.trim();
    case "after_sales":
      return `Halo PT AYTI INDO PANEL,
Mohon informasi terkait after sales support.
Terima kasih.`.trim();
    case "konsultasi":
    default:
      return `Halo PT AYTI INDO PANEL,
Saya ingin berkonsultasi terkait kebutuhan ${productName}.
Terima kasih.`.trim();
  }
}

export function generateWhatsAppLink(
  message: string | null | undefined,
  phoneDigits?: string,
): string {
  const safeMessage = typeof message === "string" ? message.trim() : "";
  const digits =
    typeof phoneDigits === "string" && phoneDigits.replace(/\D/g, "").length > 0
      ? phoneDigits.replace(/\D/g, "")
      : WHATSAPP_PHONE_NUMBER;
  return `https://wa.me/${digits}?text=${encodeURIComponent(safeMessage)}`;
}

export function getWhatsAppLinkByKey(messageKey?: WhatsAppMessageKey): string {
  return generateWhatsAppLink(generateWhatsAppMessage(getWhatsAppProductName(messageKey), "konsultasi"));
}

export function getWhatsAppMessageByKey(messageKey?: WhatsAppMessageKey): string {
  return generateWhatsAppMessage(getWhatsAppProductName(messageKey), "konsultasi");
}

export function openWhatsAppWithMessage(message: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.open(generateWhatsAppLink(message), "_blank", "noopener,noreferrer");
}
