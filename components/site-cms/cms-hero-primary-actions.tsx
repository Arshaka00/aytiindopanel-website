"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppCTAButton } from "@/components/aytipanel/whatsapp-cta-button";
import { IconWhatsApp } from "@/components/aytipanel/icons";
import { mergeAytiCtaClass } from "@/lib/ayti-icon-cold";
import { navigateLandingHashFromNav } from "@/components/common/home-nav-scroll";
import { CmsText } from "@/components/site-cms/cms-text";
import { useSiteCmsOptional } from "@/components/site-cms/site-cms-provider";
import { useCallback, useEffect, useState, type ReactNode } from "react";

/** Legacy CMS / konten lama: anchor section beranda tetap ke path beranda + hash. */
function normalizeHeroSecondaryHref(href: string): string {
  const t = href.trim();
  if (t === "#produk" || t === "/#produk") return "/#produk";
  return t;
}

function isExternalOrProtoHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
}

/** `/#section` di beranda — scroll harus pakai offset header, bukan navigasi Link polos (pathname `/` tidak berubah). */
function isBerandaSectionHashHref(dest: string): boolean {
  try {
    const u = new URL(dest, "https://aytipanel.invalid");
    return u.pathname === "/" && u.hash.length > 1;
  } catch {
    return false;
  }
}

function HeroSecondaryNavLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dest = normalizeHeroSecondaryHref(href.trim());
  const cls = mergeAytiCtaClass(className);

  if (!dest) {
    return (
      <span className={className} aria-hidden>
        {children}
      </span>
    );
  }

  if (isExternalOrProtoHref(dest)) {
    const http = /^https?:/i.test(dest);
    return (
      <a
        href={dest}
        aria-label={ariaLabel}
        className={cls}
        {...(http ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  if (dest.startsWith("/")) {
    if (pathname === "/" && isBerandaSectionHashHref(dest)) {
      return (
        <a
          href={dest}
          className={cls}
          aria-label={ariaLabel}
          onClick={(e) => {
            e.preventDefault();
            navigateLandingHashFromNav(pathname, dest);
          }}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={dest} scroll className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <a href={dest} aria-label={ariaLabel} className={cls}>
      {children}
    </a>
  );
}

type Props = {
  whatsappClassName: string;
  secondaryClassName: string;
  heroWhatsAppLabel: string;
  heroWhatsAppMessage: string;
  heroWhatsAppAriaLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  secondaryAriaLabel: string;
};

export function CmsHeroPrimaryActions({
  whatsappClassName,
  secondaryClassName,
  heroWhatsAppLabel,
  heroWhatsAppMessage,
  heroWhatsAppAriaLabel,
  secondaryLabel,
  secondaryHref,
  secondaryAriaLabel,
}: Props) {
  const cms = useSiteCmsOptional();
  const [msgDraft, setMsgDraft] = useState(heroWhatsAppMessage);
  const [hrefDraft, setHrefDraft] = useState(secondaryHref);

  useEffect(() => {
    setMsgDraft(heroWhatsAppMessage);
  }, [heroWhatsAppMessage]);
  useEffect(() => {
    setHrefDraft(secondaryHref);
  }, [secondaryHref]);

  const edit = Boolean(cms?.eligible && cms.editMode);

  const openHrefEditor = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    const next = window.prompt("Link tombol (href), mis. /#produk, #layanan, atau https://…", hrefDraft);
    if (next === null) return;
    setHrefDraft(next);
    try {
      await cms.patchContent("hero.ctaSecondary.href", next.trim());
      cms.refreshPage();
    } catch (e) {
      console.error(e);
    }
  }, [cms, hrefDraft]);

  const openMsgEditor = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    const next = window.prompt("Teks pesan WhatsApp (boleh beberapa baris):", msgDraft || heroWhatsAppMessage);
    if (next === null) return;
    setMsgDraft(next);
    try {
      await cms.patchContent("hero.ctaWhatsApp.message", next);
      cms.refreshPage();
    } catch (e) {
      console.error(e);
    }
  }, [cms, heroWhatsAppMessage, msgDraft]);

  const openSecondaryAriaEditor = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    const next = window.prompt("Label aksesibilitas tombol sekunder (aria-label):", secondaryAriaLabel);
    if (next === null) return;
    try {
      await cms.patchContent("hero.ctaSecondary.ariaLabel", next.trim());
      cms.refreshPage();
    } catch (e) {
      console.error(e);
    }
  }, [cms, secondaryAriaLabel]);

  const openWhatsAppAriaEditor = useCallback(async () => {
    if (!cms) return;
    const ok = await cms.ensureWriteSession();
    if (!ok) return;
    const next = window.prompt("Label aksesibilitas tombol WhatsApp (aria-label):", heroWhatsAppAriaLabel);
    if (next === null) return;
    try {
      await cms.patchContent("hero.ctaWhatsApp.ariaLabel", next.trim());
      cms.refreshPage();
    } catch (e) {
      console.error(e);
    }
  }, [cms, heroWhatsAppAriaLabel]);

  if (!edit) {
    return (
      <>
        <WhatsAppCTAButton
          ariaLabel={heroWhatsAppAriaLabel}
          className={whatsappClassName}
          message={heroWhatsAppMessage}
        >
          <IconWhatsApp className="h-5 w-5 shrink-0 text-[#25D366]" />
          <CmsText path="hero.ctaWhatsApp.label" text={heroWhatsAppLabel} />
        </WhatsAppCTAButton>
        <HeroSecondaryNavLink
          href={secondaryHref}
          ariaLabel={secondaryAriaLabel}
          className={secondaryClassName}
        >
          <CmsText path="hero.ctaSecondary.label" text={secondaryLabel} />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ayti-icon-cold size-4 shrink-0 transition-transform duration-300 ease-out motion-safe:group-hover/ghost:translate-x-0.5"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </HeroSecondaryNavLink>
      </>
    );
  }

  return (
    <>
      <div className="flex w-full min-w-0 flex-col items-stretch gap-1 md:flex-1">
        <WhatsAppCTAButton
          ariaLabel={heroWhatsAppAriaLabel}
          className={whatsappClassName}
          message={msgDraft}
        >
          <IconWhatsApp className="h-5 w-5 shrink-0 text-[#25D366]" />
          <CmsText path="hero.ctaWhatsApp.label" text={heroWhatsAppLabel} />
        </WhatsAppCTAButton>
        <button
          type="button"
          onClick={() => void openMsgEditor()}
          className="self-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
        >
          Edit pesan WhatsApp
        </button>
        <button
          type="button"
          onClick={() => void openWhatsAppAriaEditor()}
          className="self-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
        >
          Edit label aria WhatsApp
        </button>
      </div>
      <div className="flex w-full min-w-0 flex-col items-stretch gap-1 md:flex-1">
        <HeroSecondaryNavLink
          href={hrefDraft || secondaryHref}
          ariaLabel={secondaryAriaLabel}
          className={secondaryClassName}
        >
          <CmsText path="hero.ctaSecondary.label" text={secondaryLabel} />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ayti-icon-cold size-4 shrink-0 transition-transform duration-300 ease-out motion-safe:group-hover/ghost:translate-x-0.5"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </HeroSecondaryNavLink>
        <button
          type="button"
          onClick={() => void openHrefEditor()}
          className="self-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
        >
          Edit link tombol
        </button>
        <button
          type="button"
          onClick={() => void openSecondaryAriaEditor()}
          className="self-center rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 hover:bg-white/10"
        >
          Edit label aria tombol
        </button>
      </div>
    </>
  );
}
