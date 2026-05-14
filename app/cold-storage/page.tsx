import type { Metadata } from "next";
import { ColdStorageLanding } from "@/components/aytipanel/cold-storage-landing";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const name = content.siteSettings.siteName.trim() || "PT AYTI INDO PANEL";
  return resolveSiteMetadataForPage("coldStorage", content, "/cold-storage", {
    titleFallback: `Jasa Cold Storage | ${name}`,
    descriptionFallback:
      "Jasa pembuatan cold storage lengkap panel dan sistem refrigerasi untuk industri.",
  });
}

export default async function ColdStoragePage() {
  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <ColdStorageLanding coldStoragePage={content.coldStoragePage} />
    </WhatsAppPhoneProvider>
  );
}
