"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { WHATSAPP_PHONE_NUMBER } from "@/components/aytipanel/constants/whatsapp";

const WhatsAppPhoneDigitsContext = createContext<string>(WHATSAPP_PHONE_NUMBER);

export function WhatsAppPhoneProvider({
  phoneDigits,
  children,
}: {
  /** Digit wa.me canonical (mis. 6281234567890), tanpa spasi/+ */
  phoneDigits: string;
  children: ReactNode;
}) {
  const safe = phoneDigits.replace(/\D/g, "") || WHATSAPP_PHONE_NUMBER;
  return (
    <WhatsAppPhoneDigitsContext.Provider value={safe}>{children}</WhatsAppPhoneDigitsContext.Provider>
  );
}

export function useWhatsAppPhoneDigits(): string {
  return useContext(WhatsAppPhoneDigitsContext);
}
