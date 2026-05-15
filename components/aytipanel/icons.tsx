import type { SVGProps } from "react";

import { mergeAytiIconClass } from "@/lib/ayti-icon-cold";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const strokeIcon = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Pendinginan industri / HVAC — motif salju */
export function IconSnowflake({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Kontrol suhu / sistem monitoring */
export function IconThermostat({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <path d="M8 10h8M8 14h5" />
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Kompresor / sirkuit refrigerasi ringkas */
export function IconCompressor({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M7 10h6l2-3h5v10h-5l-2-3H7a3 3 0 110-4z" />
      <path d="M4 14v4h3" />
      <circle cx="7" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Rantai dingin / suhu terkontrol */
export function IconColdChain({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M12 3v18M9 5l6 14M15 5l-6 14M5 9l14 6M19 9l-14 6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Makanan & minuman */
export function IconFoodBeverage({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M18 8h1a3 3 0 010 6h-1M2 8h16v5a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <path d="M6 2s2 2 2 5M10 2s1 2 1 5M14 2s2 2 2 5" />
    </svg>
  );
}

/** Logistik & pergudangan */
export function IconLogistics({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M14 18V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10M14 9h3l3 3v6h-3M6 18h12M8 18v-4m8 4v-4m4 4v-4" />
      <circle cx="8" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Penyesuaian / solusi custom */
export function IconSliders({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="17" cy="15" r="2" />
    </svg>
  );
}

/** Manufaktur & pabrik */
export function IconManufacturing({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M4 21h16M6 21V10l3-1v3l3-1v4l3-2v6l3-2v7M9 9V7a2 2 0 012-2h2a2 2 0 012 2v2M12 5V3" />
    </svg>
  );
}

/** Retail & gerai */
export function IconRetail({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M3 10h18v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9zM3 10l2.5-5h13L21 10M9 14h6M10 14v4M14 14v4" />
    </svg>
  );
}

/** Distribusi & jaringan pasokan */
export function IconDistribution({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M12 3v6M12 15v6M4 12h6M14 12h6M7 7l5 5M12 12l5-5M7 17l5-5M12 12l5 5" />
      <circle cx="12" cy="12" r="2" fill="none" />
      <circle cx="12" cy="5" r="1.5" fill="none" />
      <circle cx="12" cy="19" r="1.5" fill="none" />
      <circle cx="5" cy="12" r="1.5" fill="none" />
      <circle cx="19" cy="12" r="1.5" fill="none" />
    </svg>
  );
}

export function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function IconFacebook({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={mergeAytiIconClass(className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function IconTikTok({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.918-.02.08 1.53.63 3.09 1.75 4.17 1.13 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.01-1-.01-1.49 1.89 1.01 4.14 1.46 6.34 1.11 1.32-.21 2.6-.72 3.66-1.51.03-3.13.02-6.26.02-9.38z" />
    </svg>
  );
}

export function IconYouTube({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/** X (sebelumnya Twitter) — logo monogram resmi. */
export function IconX({ className }: { className?: string }) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.964 6.817H1.68l7.73-8.836L1.254 2.25h6.83l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/** Footer: Tentang / perusahaan */
export function IconCompanyAbout({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-6h6v6M10 13h4" />
    </svg>
  );
}

/** Footer: Kontak */
export function IconCompanyContact({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

/** Kontak cepat: telepon */
export function IconPhone({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

/** Kontak cepat: WhatsApp (message circle) */
export function IconMessageCircle({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M7.9 20A9 9 0 104 16.1L2 22l4.9-2z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}

/** Kontak cepat: email */
export function IconMail({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" fill="none" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  );
}

/** Footer: Lokasi */
export function IconCompanyLocation({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" fill="none" />
    </svg>
  );
}

/** Proses kerja: konsultasi */
export function IconProcessConsult({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

/** Proses kerja: survey */
export function IconProcessSurvey({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <path d="M15 2H9a1 1 0 00-1 1v2h8V3a1 1 0 00-1-1z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

/** Proses kerja: instalasi */
export function IconProcessInstall({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** Sandwich Panel PU — cross-section: dua skin metal tipis + core PU foam (hatching diagonal). */
export function IconSandwichPanelPU({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="0.75" />
      <path d="M2.5 8.75h19M2.5 15.25h19" />
      <path d="M6 14.75l2.5-4M10.25 14.75l2.5-4M14.5 14.75l2.5-4" />
    </svg>
  );
}

/** Sandwich Panel EPS — cross-section: skin metal + core EPS (butiran bulat). */
export function IconSandwichPanelEPS({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="0.75" />
      <path d="M2.5 8.75h19M2.5 15.25h19" />
      <circle cx="6.25" cy="11.25" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="8.75" cy="12.75" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="11.25" cy="11.25" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="13.75" cy="12.75" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="16.25" cy="11.25" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="18.75" cy="12.75" r="0.65" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Cold storage — ruang dingin + salju. */
export function IconColdStorage({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M4 20V11.5l8-4.5 8 4.5V20H4z" />
      <path d="M10 20v-4.5h4V20" />
      <path d="M12 9.5v2.25M10.75 10.625h2.5" />
      <path d="M16.5 7.25l.9.9M18.75 9.5l.9.9M18.75 7.25l.9-.9" />
    </svg>
  );
}

/** Sistem pendingin — unit kompresor / refrigerasi (alias visual kompresor). */
export function IconRefrigerationSystem({ className, ...props }: IconProps) {
  return <IconCompressor className={className} {...props} />;
}

/** Door & dock — pintu cold room + area bongkar muat. */
export function IconDoorDock({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M3 15.5h18v5.5H3z" />
      <path d="M7.5 15.5V9.25a1.75 1.75 0 011.75-1.75H11v8" />
      <path d="M11 7.5h2.25a1.25 1.25 0 011.25 1.25V15.5" />
      <path d="M14.25 16.25H20v3.25a1 1 0 01-1 1h-4.5a1 1 0 01-1-1v-3.25z" />
      <circle cx="16" cy="19.75" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="19.25" cy="19.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Proses kerja: selesai */
export function IconProcessComplete({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Unduh katalog / dokumen */
export function IconDownload({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

/** Pencarian / filter teks */
export function IconSearch({ className, ...props }: IconProps) {
  return (
    <svg
      className={mergeAytiIconClass(className)}
      viewBox="0 0 24 24"
      aria-hidden
      {...strokeIcon}
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}
