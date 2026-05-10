import type { Metadata } from "next";

import { ProdukCatalogView } from "@/components/aytipanel/produk-catalog-view";
import { SiteFooter } from "@/components/aytipanel/site-footer";
import { ForceScrollTopOnLoad } from "@/components/common/force-scroll-top-on-load";
import { WhatsAppPhoneProvider } from "@/components/common/whatsapp-phone-context";
import { getSiteContent } from "@/lib/site-content";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";
import { resolveSiteMetadataForPage } from "@/lib/site-seo-resolve";
import { generateWhatsAppMessage } from "@/utils/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return resolveSiteMetadataForPage("produk", content, "/produk");
}

/** Katalog produk — data dari konten situs (kategori + service & maintenance). */
export default async function ProdukHubPage() {
  const content = await getSiteContent();
  const waDigits = resolvePrimaryWhatsAppDigits(content.siteSettings);
  const catalogWaMessage = generateWhatsAppMessage("katalog produk & solusi industri", "konsultasi");

  return (
    <WhatsAppPhoneProvider phoneDigits={waDigits}>
      <div className="flex min-h-full flex-col bg-background text-foreground">
        <main className="flex min-h-0 flex-1 flex-col">
          <ForceScrollTopOnLoad />
          <ProdukCatalogView content={content} />
        </main>
        <SiteFooter
          footer={content.footer}
          footerSeoText={content.siteSettings.seoContent.footerSeoText}
          whatsappFunnel={{ message: catalogWaMessage, dataSource: "produk:katalog" }}
        />
      </div>
    </WhatsAppPhoneProvider>
  );
}
