import type { SiteContent } from "@/lib/site-content-model";
import { mergeAytiCardClass } from "@/lib/ayti-icon-cold";
import { generateWhatsAppLink } from "@/utils/whatsapp";
import { resolvePrimaryWhatsAppDigits } from "@/lib/site-contact";

function joinAddress(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join(", ");
}

type LocalNapVariant = "full" | "inline";

/**
 * NAP (Name, Address, Phone) konsisten dengan JSON-LD LocalBusiness — sumber sama dengan CMS.
 */
export function LocalNapBlock({
  content,
  variant = "full",
  headingId = "kontak-nap-heading",
}: {
  content: SiteContent;
  variant?: LocalNapVariant;
  /** Untuk menghindari bentrok id bila beberapa blok di satu halaman */
  headingId?: string;
}) {
  const ss = content.siteSettings;
  const k = content.kontak;
  const name = ss.siteName.trim() || "PT AYTI INDO PANEL";
  const address = joinAddress(k.addressLines) || ss.companyAddress.trim();
  const tel = k.phoneTel.trim() || k.phone.trim();
  const telHref = tel.replace(/\s/g, "");
  const waDigits = resolvePrimaryWhatsAppDigits(ss);
  const waDisplay = k.whatsappDisplay.trim();
  const waHref = generateWhatsAppLink(`Halo ${name}, saya ingin bertanya terkait proyek.`, waDigits);
  const email = k.email.trim();

  if (variant === "inline") {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{name}</span>
        {address ? (
          <>
            {" · "}
            <span>{address}</span>
          </>
        ) : null}
        {tel ? (
          <>
            {" · "}
            <a className="text-accent underline-offset-2 hover:underline" href={`tel:${telHref}`}>
              {tel}
            </a>
          </>
        ) : null}
        {waDisplay ? (
          <>
            {" · "}
            <a className="text-accent underline-offset-2 hover:underline" href={waHref} target="_blank" rel="noopener noreferrer">
              WhatsApp {waDisplay}
            </a>
          </>
        ) : null}
        {email ? (
          <>
            {" · "}
            <a className="text-accent underline-offset-2 hover:underline" href={`mailto:${encodeURIComponent(email)}`}>
              {email}
            </a>
          </>
        ) : null}
      </p>
    );
  }

  return (
    <section className="mt-10" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-lg font-semibold text-foreground">
        Kontak & alamat
      </h2>
      <div
        className={mergeAytiCardClass(
          "mt-3 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground shadow-sm sm:p-5",
        )}
      >
        <p className="font-semibold text-foreground">{name}</p>
        {address ? <p className="mt-2 whitespace-pre-line">{address}</p> : null}
        <ul className="mt-3 space-y-2">
          {tel ? (
            <li>
              <span className="text-muted-foreground">{k.phoneLabel}: </span>
              <a className="font-medium text-accent underline-offset-2 hover:underline" href={`tel:${telHref}`}>
                {tel}
              </a>
            </li>
          ) : null}
          {waDisplay ? (
            <li>
              <span className="text-muted-foreground">{k.whatsappLabel}: </span>
              <a
                className="font-medium text-accent underline-offset-2 hover:underline"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {waDisplay}
              </a>
            </li>
          ) : null}
          {email ? (
            <li>
              <span className="text-muted-foreground">{k.emailLabel}: </span>
              <a className="font-medium text-accent underline-offset-2 hover:underline" href={`mailto:${encodeURIComponent(email)}`}>
                {email}
              </a>
            </li>
          ) : null}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Data ini sama dengan yang dipakai di schema LocalBusiness halaman ini — ubah lewat pengaturan situs bila alamat atau nomor resmi berubah.
        </p>
      </div>
    </section>
  );
}
