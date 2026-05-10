import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { BackButton } from "@/components/common/BackButton";
import { GalleryAddProjectForm } from "@/components/aytipanel/gallery-add-project-form";
import { sectionInsetX, sectionMax } from "@/components/aytipanel/theme-section-ui";
import { getAdminCookieName, isAllowedAdminDevice, verifyAdminSessionToken } from "@/lib/gallery-admin-auth";

export const metadata: Metadata = {
  title: "Tambah Proyek | Gallery Project",
  description: "Buat proyek baru: folder media terstruktur, video, galeri, dan poster otomatis.",
};

export default async function TambahGalleryProjectPage() {
  const cookieStore = await cookies();
  const headersStore = await headers();
  const adminToken = cookieStore.get(getAdminCookieName())?.value ?? "";
  const allowed =
    isAllowedAdminDevice(headersStore, cookieStore) &&
    verifyAdminSessionToken(adminToken, headersStore);
  if (!allowed) redirect("/gallery-project");

  return (
    <main className="min-w-0 flex-1 bg-background text-foreground">
      <section
        className={`border-y border-border bg-[radial-gradient(140%_85%_at_50%_-10%,rgba(56,189,248,0.12),transparent_58%),linear-gradient(180deg,rgba(248,250,252,0.85),rgba(241,245,249,0.92))] ${sectionInsetX} py-10 md:py-14 dark:bg-[radial-gradient(140%_85%_at_50%_-10%,rgba(56,189,248,0.18),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.95))]`}
      >
        <div className={`mx-auto ${sectionMax} max-w-3xl space-y-7`}>
          <header className="space-y-3 rounded-2xl border border-border/70 bg-card/75 px-5 py-6 text-center shadow-[0_16px_42px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_22px_45px_-25px_rgba(0,0,0,0.72)] md:px-7 md:py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300/85">
              Gallery Project
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
              Tambah Proyek
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Lengkapi informasi proyek dan media secara rapi. Tampilan ini dioptimalkan untuk alur input cepat, konsisten,
              dan siap dipakai operasional harian.
            </p>
          </header>

          <GalleryAddProjectForm />

          <div className="flex justify-center">
            <BackButton
              label="Kembali ke Gallery Project"
              destination="previous"
              fallbackHref="/gallery-project"
              className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-xl border border-border/80 bg-card/85 px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_10px_30px_-22px_rgba(15,23,42,0.45)] transition-[border-color,background-color,transform] [-webkit-tap-highlight-color:transparent] hover:border-sky-400/40 hover:bg-muted-bg motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
