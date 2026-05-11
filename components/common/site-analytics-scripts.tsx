"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import type { SiteAnalyticsSettings } from "@/lib/site-content-model";

/**
 * Tunda injeksi GTM / GA / Meta / Clarity sampai idle atau interaksi pertama,
 * supaya main thread awal lebih longgar (mobile + TBT). Setelah aktif, perilaku
 * sama seperti sebelumnya (`afterInteractive` pada mount komponen ini).
 */
export function SiteAnalyticsScripts({ analytics }: { analytics: SiteAnalyticsSettings }) {
  const { googleAnalyticsId, googleTagManagerId, metaPixelId, microsoftClarityId } = analytics;
  const useGaDirect = Boolean(googleAnalyticsId) && !googleTagManagerId;
  const hasAny =
    Boolean(googleTagManagerId) ||
    useGaDirect ||
    Boolean(metaPixelId) ||
    Boolean(microsoftClarityId);

  const [shouldLoad, setShouldLoad] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!hasAny) return;

    const enable = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setShouldLoad(true);
      window.removeEventListener("pointerdown", enable, true);
      window.removeEventListener("scroll", enable, true);
      window.removeEventListener("keydown", enable, true);
    };

    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 5200 });
    }
    const timeoutId = window.setTimeout(enable, 6200);
    window.addEventListener("pointerdown", enable, { capture: true, passive: true });
    window.addEventListener("scroll", enable, { capture: true, passive: true });
    window.addEventListener("keydown", enable, { capture: true, passive: true });

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", enable, true);
      window.removeEventListener("scroll", enable, true);
      window.removeEventListener("keydown", enable, true);
    };
  }, [hasAny]);

  if (!hasAny || !shouldLoad) return null;

  return (
    <>
      {googleTagManagerId ? (
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId.replace(/'/g, "\\'")}');`,
          }}
        />
      ) : null}
      {useGaDirect ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date()); gtag('config', '${googleAnalyticsId.replace(/'/g, "\\'")}', { anonymize_ip: true });`,
            }}
          />
        </>
      ) : null}
      {metaPixelId ? (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${metaPixelId.replace(/'/g, "\\'")}'); fbq('track', 'PageView');`,
          }}
        />
      ) : null}
      {microsoftClarityId ? (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${microsoftClarityId.replace(/'/g, "\\'")}");`,
          }}
        />
      ) : null}
    </>
  );
}
