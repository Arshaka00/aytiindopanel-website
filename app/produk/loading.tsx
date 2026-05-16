/** Skeleton rute /produk/* — ringan di mobile (tanpa pulse/gradient berat). */
export default function ProdukSegmentLoading() {
  return (
    <div className="mx-auto max-w-[min(100%,80rem)] px-4 py-6 sm:px-6 sm:py-7 md:py-9 lg:px-10">
      <div className="mx-auto max-w-3xl space-y-2.5 text-center max-md:animate-none md:animate-pulse motion-reduce:animate-none">
        <div className="mx-auto h-3 w-24 rounded-full bg-muted max-md:bg-muted/80" />
        <div className="mx-auto h-9 max-w-md rounded-lg bg-muted max-md:h-8 md:h-11" />
        <div className="mx-auto h-10 max-w-2xl rounded-lg bg-muted/80 max-md:hidden md:block md:h-12" />
        <div className="mx-auto mt-4 flex max-w-xs justify-center gap-2 md:mt-5 md:max-w-xl md:gap-2.5">
          <div className="h-14 min-w-0 flex-1 rounded-lg bg-muted/70 max-md:h-12 md:h-[4.5rem] md:rounded-xl md:max-w-[12rem]" />
          <div className="h-14 min-w-0 flex-1 rounded-lg bg-muted/60 max-md:h-12 md:h-[4.5rem] md:rounded-xl md:max-w-[12rem]" />
        </div>
      </div>

      {/* Mobile: 2 kartu statis — tanpa gradient/pulse */}
      <div className="mx-auto mt-6 grid max-w-6xl gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 md:hidden">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/40 bg-muted/25"
          >
            <div className="aspect-[3/2] bg-muted/60" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 rounded bg-muted/80" />
              <div className="h-3 w-full rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Tablet/desktop: skeleton lebih kaya */}
      <div className="mx-auto mt-8 hidden max-w-6xl gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 md:mt-8 md:animate-pulse motion-reduce:animate-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1.35rem] bg-gradient-to-br from-sky-400/35 via-slate-200/60 to-blue-600/30 p-[1px] shadow-[0_22px_48px_-28px_rgba(14,165,233,0.18)] dark:from-sky-500/25 dark:via-white/[0.12] dark:to-blue-950/50 dark:shadow-[0_28px_56px_-32px_rgba(0,0,0,0.65)]"
          >
            <div className="overflow-hidden rounded-[1.3rem] border border-white/50 bg-gradient-to-b from-card/95 to-muted/20 shadow-inner dark:border-white/[0.08] dark:from-card/85 dark:to-transparent">
              <div className="aspect-[3/2] min-h-[9.5rem] bg-muted sm:aspect-[16/9] sm:min-h-0 lg:aspect-[2/1]">
                <div className="grid h-full grid-cols-2 gap-2 bg-muted/90 sm:gap-2.5">
                  <div className="bg-muted/80" />
                  <div className="bg-muted/70" />
                </div>
              </div>
              <div className="space-y-2 border-t border-border/30 p-4 dark:border-white/[0.06]">
                <div className="h-5 w-4/5 rounded-md bg-muted" />
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-60 dark:via-white/15" />
                <div className="h-4 w-full rounded-md bg-muted/80" />
                <div className="h-4 w-2/3 rounded-md bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
