import { z } from "zod";

import { plainTextFromRichValue } from "@/lib/cms-rich-text";
import { validateSiteContentMinimal } from "@/lib/site-content-merge";
import { normalizeSiteContent } from "@/lib/site-content-normalize";
import type { SiteContent } from "@/lib/site-content-model";

const navItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shortLabel: z.string().min(1),
  href: z.string().min(1),
});

/** String CMS atau blok `{ text, style, … }` — teks minimum untuk judul hero. */
const cmsRichTextField = z.union([
  z.string().min(1),
  z
    .object({ text: z.string() })
    .passthrough()
    .superRefine((val, ctx) => {
      const t = plainTextFromRichValue(val, "").trim();
      if (t.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teks tidak boleh kosong." });
      }
    }),
]);

const siteContentSchemaBase = z
  .object({
    version: z.literal(1),
    siteSettings: z
      .object({
        published: z.boolean(),
        maintenanceMode: z.boolean(),
        maintenanceHeadline: z.string().min(1),
        maintenanceSubtext: z.string().min(1),
        maintenanceShowWhatsApp: z.boolean(),
        maintenanceWhatsAppLabel: z.string().min(1),
        maintenanceWhatsAppMessage: z.string().min(1),
      })
      .passthrough(),
    header: z.object({
      brandName: z.string().min(1),
      logoAriaLabel: z.string().min(1),
      navAriaLabel: z.string().min(1),
      mobileMenuAriaLabel: z.string().min(1),
      mobileMenuOpenAriaLabel: z.string().min(1),
      mobileMenuCloseAriaLabel: z.string().min(1),
      navItems: z.array(navItemSchema).min(1),
      mobileNavIds: z.array(z.string().min(1)),
    }),
    hero: z
      .object({
        headingLine1: cmsRichTextField,
        headingMiddle: cmsRichTextField.optional(),
        headingLine2: cmsRichTextField,
        slides: z.array(z.object({ src: z.string().min(1) })).min(1),
        ctaWhatsApp: z.object({ label: z.string().min(1), message: z.string().min(1) }),
        ctaSecondary: z.object({ label: z.string().min(1), href: z.string().min(1) }),
      })
      .passthrough(),
    tentang: z.object({ heading: z.string().min(1), lead: z.string().min(1), body: z.string().min(1) }),
    layanan: z.object({ heading: z.string().min(1), cards: z.array(z.object({ id: z.string().min(1) })) }),
    produk: z.object({ heading: z.string().min(1), categories: z.array(z.any()) }),
    serviceMaintenance: z.object({ cards: z.array(z.any()) }),
    portfolio: z.object({ heading: z.string().min(1), projects: z.array(z.object({ id: z.string().min(1) })) }),
    customersPartners: z.object({
      heading: z.string().min(1),
      industries: z.array(z.object({ id: z.string().min(1) })),
      partners: z.array(z.object({ id: z.string().min(1) })),
    }),
    keunggulan: z.object({
      heading: z.string().min(1),
      cards: z.array(z.object({ id: z.string().min(1) })),
      stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })),
    }),
    ctaMid: z.object({ title: z.string().min(1), subtitle: z.string().min(1) }),
    faq: z.object({ heading: z.string().min(1), items: z.array(z.object({ id: z.string().min(1) })) }),
    kontak: z.object({ heading: z.string().min(1), mapEmbedUrl: z.string().min(1) }),
    footer: z.object({ copyrightLine: z.string().min(1), quickLinks: z.array(z.object({ id: z.string().min(1) })) }),
    galleryPage: z.object({ title: z.string().min(1) }),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    const normalized = normalizeSiteContent(value as unknown as SiteContent);
    if (!validateSiteContentMinimal(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konten tidak memenuhi validasi minimal situs.",
      });
    }
  });

export type SiteContentValidationError = {
  path: string;
  message: string;
};

export function validateSiteContentStrict(input: unknown): {
  ok: true;
  content: SiteContent;
} | {
  ok: false;
  errors: SiteContentValidationError[];
} {
  const parsed = siteContentSchemaBase.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "root",
        message: issue.message,
      })),
    };
  }
  return { ok: true, content: normalizeSiteContent(input as unknown as SiteContent) };
}
