import dynamic from "next/dynamic";

import { HomeMainSections } from "@/components/aytipanel/home-main-sections";
import { HomeInitialHashScroll } from "@/components/common/home-initial-hash-scroll";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { ScrollToSectionOnLoad } from "@/components/common/scroll-to-section-on-load";

import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

const SiteFooter = dynamic(() =>
  import("@/components/aytipanel/site-footer").then((m) => m.SiteFooter),
);

export async function AytiIndoPanelLanding() {
  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <div className="flex w-full flex-col bg-background text-foreground">
        <main className="min-w-0">
          <HomeInitialHashScroll />
          <ScrollToSectionOnLoad />
          <HomeMainSections content={content} waPhoneDigits={waDigits} />
        </main>
        <SiteFooter
          footer={content.footer}
          footerSeoText={content.siteSettings.seoContent.footerSeoText}
        />
      </div>
    </WhatsAppPhoneProvider>
  );
}
