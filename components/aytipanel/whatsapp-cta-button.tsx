"use client";

import type { ReactNode } from "react";
import { type WhatsAppMessageKey } from "@/components/aytipanel/constants/whatsapp";
import { useWhatsAppPhoneDigits } from "@/components/common/whatsapp-phone-context";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";
import { generateWhatsAppLink, getWhatsAppMessageByKey } from "@/utils/whatsapp";

type WhatsAppCTAButtonProps = {
  className: string;
  children: ReactNode;
  ariaLabel: string;
  message?: string;
  messageKey?: WhatsAppMessageKey;
  dataSource?: string;
  /** Override digit dari CMS / konteks — jika tidak diisi memakai WhatsAppPhoneProvider / fallback bawaan. */
  phoneDigits?: string;
};

export function WhatsAppCTAButton({
  className,
  children,
  ariaLabel,
  message,
  messageKey,
  dataSource,
  phoneDigits,
}: WhatsAppCTAButtonProps) {
  const ctxDigits = useWhatsAppPhoneDigits();
  const resolvedMessage = message ?? getWhatsAppMessageByKey(messageKey);
  const digits = phoneDigits ?? ctxDigits;
  const href = generateWhatsAppLink(resolvedMessage, digits);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={mergeAytiCtaClass(className)}
      aria-label={ariaLabel}
      data-source={dataSource}
    >
      {children}
    </a>
  );
}
