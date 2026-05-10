"use client";

import type { SiteSocialPromotionProfiles } from "@/lib/site-content-model";
import {
  promoCaptionForStories,
  shareUrlEmail,
  shareUrlFacebook,
  shareUrlLinkedIn,
  shareUrlReddit,
  shareUrlTelegram,
  shareUrlWhatsApp,
  shareUrlX,
} from "@/lib/site-share-links";

const promoBtn =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-35";

type Props = {
  shareUrl: string;
  siteName: string;
  profiles: SiteSocialPromotionProfiles;
  onUpdateProfiles: (patch: Partial<SiteSocialPromotionProfiles>) => void;
  onPromoStatus: (msg: string) => void;
};

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

function openProfileUrl(raw: string) {
  const t = raw.trim();
  if (!t) return;
  try {
    const href = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    openExternal(href);
  } catch {
    /* ignore */
  }
}

export function SitePromotionSection({
  shareUrl,
  siteName,
  profiles,
  onUpdateProfiles,
  onPromoStatus,
}: Props) {
  const safeUrl = shareUrl.trim();
  const title = siteName.trim() || "Website kami";
  const canShare = safeUrl.length > 0;

  const copyText = async (text: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onPromoStatus(ok);
    } catch {
      onPromoStatus("Gagal menyalin — pilih teks secara manual.");
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg backdrop-blur-md motion-safe:animate-[premium-page-reveal_400ms_var(--ease-premium-soft)_both]">
      <h2 className="text-base font-semibold text-white">Promosikan situs</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Bagikan URL situs utama ke jejaring sosial. Untuk Instagram &amp; TikTok tidak ada tombol share web
        universal — gunakan salin teks, lalu tempel di aplikasi. Isi tautan profil di bawah agar tombol{" "}
        <span className="text-slate-300">Buka profil</span> aktif (simpan pengaturan setelah mengubah tautan).
      </p>

      {!canShare ? (
        <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Atur minimal satu URL situs produksi (yang Utama) di atas agar tautan promosi terisi.
        </p>
      ) : (
        <p className="mt-3 rounded-lg border border-white/10 bg-slate-950/35 px-3 py-2 font-mono text-[11px] text-sky-200/90">
          URL dibagikan: {safeUrl}
        </p>
      )}

      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bagikan langsung</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlFacebook(safeUrl))}
          >
            Facebook
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlX(safeUrl, title))}
          >
            X (Twitter)
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlLinkedIn(safeUrl))}
          >
            LinkedIn
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlWhatsApp(safeUrl, title))}
          >
            WhatsApp
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlTelegram(safeUrl, title))}
          >
            Telegram
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlEmail(safeUrl, title))}
          >
            Email
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => openExternal(shareUrlReddit(safeUrl, title))}
          >
            Reddit
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Instagram &amp; TikTok (salin)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() =>
              void copyText(promoCaptionForStories(title, safeUrl), "Teks promosi disalin — tempel di aplikasi.")
            }
          >
            Salin teks promosi
          </button>
          <button
            type="button"
            disabled={!canShare}
            className={promoBtn}
            onClick={() => void copyText(safeUrl, "URL situs disalin.")}
          >
            Salin URL saja
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Tautan halaman profil (opsional)
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Dipakai tombol &quot;Buka profil&quot;. Contoh:{" "}
          <span className="text-slate-400">https://www.instagram.com/brand_anda</span>
        </p>

        <div className="mt-4 space-y-4">
          <ProfileRow
            label="Facebook (halaman)"
            value={profiles.facebookPageUrl}
            onChange={(v) => onUpdateProfiles({ facebookPageUrl: v })}
            actionLabel="Buka Facebook"
            onAction={() => openProfileUrl(profiles.facebookPageUrl)}
          />
          <ProfileRow
            label="Instagram"
            value={profiles.instagramProfileUrl}
            onChange={(v) => onUpdateProfiles({ instagramProfileUrl: v })}
            actionLabel="Buka Instagram"
            onAction={() => openProfileUrl(profiles.instagramProfileUrl)}
          />
          <ProfileRow
            label="TikTok"
            value={profiles.tiktokProfileUrl}
            onChange={(v) => onUpdateProfiles({ tiktokProfileUrl: v })}
            actionLabel="Buka TikTok"
            onAction={() => openProfileUrl(profiles.tiktokProfileUrl)}
          />
          <ProfileRow
            label="YouTube"
            value={profiles.youtubeChannelUrl}
            onChange={(v) => onUpdateProfiles({ youtubeChannelUrl: v })}
            actionLabel="Buka YouTube"
            onAction={() => openProfileUrl(profiles.youtubeChannelUrl)}
          />
          <ProfileRow
            label="X (Twitter)"
            value={profiles.xProfileUrl}
            onChange={(v) => onUpdateProfiles({ xProfileUrl: v })}
            actionLabel="Buka X"
            onAction={() => openProfileUrl(profiles.xProfileUrl)}
          />
        </div>
      </div>
    </section>
  );
}

function ProfileRow({
  label,
  value,
  onChange,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  actionLabel: string;
  onAction: () => void;
}) {
  const has = value.trim().length > 0;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <div className="min-w-0 flex-1">
        <label className="text-[11px] text-slate-500">{label}</label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/12 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/40"
          placeholder="https://…"
        />
      </div>
      <button
        type="button"
        disabled={!has}
        onClick={onAction}
        className="shrink-0 rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {actionLabel}
      </button>
    </div>
  );
}
