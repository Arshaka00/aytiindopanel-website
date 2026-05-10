import type { ReactNode } from "react";

/**
 * Cegah geser halaman ke kiri/kanan (overflow horizontal & rubber-band horizontal).
 * Scroll horizontal hanya di dalam kontrol yang diberi `touch-pan-x` (pilih kategori).
 */
export default function GalleryProjectLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="gallery-project-root min-h-0 min-w-0 w-full overflow-x-clip overscroll-x-none touch-pan-y">
      {children}
    </div>
  );
}
