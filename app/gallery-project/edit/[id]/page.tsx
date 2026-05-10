import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { BackButton } from "@/components/common/BackButton";
import { GalleryProjectForm } from "@/components/aytipanel/gallery-project-form";
import { sectionInsetX, sectionMax } from "@/components/aytipanel/theme-section-ui";
import { getAdminCookieName, isAllowedAdminDevice, verifyAdminSessionToken } from "@/lib/gallery-admin-auth";

export const metadata: Metadata = {
  title: "Edit Proyek | Gallery Project",
  description: "Ubah dokumentasi proyek galeri (CMS) atau penyimpanan lokal browser.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditGalleryProjectPage({ params }: Props) {
  const cookieStore = await cookies();
  const headersStore = await headers();
  const adminToken = cookieStore.get(getAdminCookieName())?.value ?? "";
  const allowed =
    isAllowedAdminDevice(headersStore, cookieStore) &&
    verifyAdminSessionToken(adminToken, headersStore);
  if (!allowed) redirect("/gallery-project");

  const { id: rawId } = await params;
  const projectId = decodeURIComponent(rawId);

  return (
    <main className="min-w-0 flex-1 bg-background text-foreground">
      <section className={`border-y border-border bg-muted-bg ${sectionInsetX} py-10 md:py-14`}>
        <div className={`mx-auto ${sectionMax} max-w-3xl space-y-6`}>
          <header className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300/85">
              Gallery Project
            </p>
            <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
              Edit Proyek
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Perbarui data dokumentasi. Untuk proyek bawaan situs, perubahan disimpan sebagai override di browser ini;
              proyek tambahan Anda diperbarui di penyimpanan lokal.
            </p>
          </header>

          <GalleryProjectForm mode="edit" projectId={projectId} />

          <div className="flex justify-center">
            <BackButton
              label="Kembali ke Gallery Project"
              destination="previous"
              fallbackHref="/gallery-project"
              className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-[10px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors [-webkit-tap-highlight-color:transparent] hover:border-sky-400/40 hover:bg-muted-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
