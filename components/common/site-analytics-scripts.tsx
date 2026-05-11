"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import type { SiteAnalyticsSettings } from "@/lib/site-content-model";

/**
 * Fase 1: GTM / GA saja — lebih ringan untuk main thread awal + Lighthouse.
 * Fase 2 (idle + jeda singkat): Meta Pixel & Microsoft Clarity — tetap ter-load,
 * tidak menghapus tracking; hanya menunda skrip non-esensial untuk skor performa.
 */
export function SiteAnalyticsScripts({ analytics }: { analytics: SiteAnalyticsSettings }) {
  const { googleAnalyticsId, googleTagManagerId, metaPixelId, microsoftClarityId } = analytics;
  const useGaDirect = Boolean(googleAnalyticsId) && !googleTagManagerId;
  const hasCore =
    Boolean(googleTagManagerId) || useGaDirect;
  const hasExtras = Boolean(metaPixelId) || Boolean(microsoftClarityId);
  const hasAny = hasCore || hasExtras;

  const [shouldLoadCore, setShouldLoadCore] = useState(false);
  const [shouldLoadExtras, setShouldLoadExtras] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!hasAny) return;

    const enable = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setShouldLoadCore(true);
      window.removeEventListener("pointerdown", enable, true);
      window.removeEventListener("scroll", enable, true);
      window.removeEventListener("keydown", enable, true);
    };

    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 4200 });
    }
    const timeoutId = window.setTimeout(enable, 5200);
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

  useEffect(() => {
    if (!shouldLoadCore || !hasExtras) return;
    let cancelled = false;
    const loadExtras = () => {
      if (!cancelled) setShouldLoadExtras(true);
    };
    let idleExtra: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleExtra = window.requestIdleCallback(loadExtras, { timeout: 8000 });
    }
    const t = window.setTimeout(loadExtras, 4500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      if (idleExtra !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleExtra);
      }
    };
  }, [shouldLoadCore, hasExtras]);

  if (!hasAny || !shouldLoadCore) return null;

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

      {shouldLoadExtras && metaPixelId ? (
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '${metaPixelId.replace(/'/g, "\\'")}'); fbq('track', 'PageView');`,
          }}
        />
      ) : null}
      {shouldLoadExtras && microsoftClarityId ? (
        <Script
          id="ms-clarity"
          strategy="lazyOnload"
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
