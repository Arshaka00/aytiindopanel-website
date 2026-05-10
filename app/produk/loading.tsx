/** Skeleton route katalog — menghindari flash kosong saat navigasi. */
export default function ProdukCatalogLoading() {
  return (
    <div className="mx-auto max-w-[min(100%,80rem)] px-4 py-6 sm:px-6 sm:py-7 md:py-9 lg:px-10">
      <div className="mx-auto max-w-3xl animate-pulse space-y-2.5 text-center motion-reduce:animate-none">
        <div className="mx-auto h-3 w-24 rounded-full bg-muted" />
        <div className="mx-auto h-9 max-w-md rounded-lg bg-muted md:h-11" />
        <div className="mx-auto h-12 max-w-2xl rounded-lg bg-muted/80" />
        <div className="mx-auto mt-5 flex max-w-xl justify-center gap-2.5">
          <div className="h-[4.5rem] min-w-0 flex-1 rounded-xl bg-muted/70 sm:max-w-[12rem]" />
          <div className="h-[4.5rem] min-w-0 flex-1 rounded-xl bg-muted/70 sm:max-w-[12rem]" />
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1.35rem] bg-gradient-to-br from-sky-400/35 via-slate-200/60 to-blue-600/30 p-[1px] shadow-[0_22px_48px_-28px_rgba(14,165,233,0.18)] motion-reduce:animate-none dark:from-sky-500/25 dark:via-white/[0.12] dark:to-blue-950/50 dark:shadow-[0_28px_56px_-32px_rgba(0,0,0,0.65)]"
          >
            <div className="overflow-hidden rounded-[1.3rem] border border-white/50 bg-gradient-to-b from-card/95 to-muted/20 shadow-inner dark:border-white/[0.08] dark:from-card/85 dark:to-transparent">
            <div className="aspect-[3/2] min-h-[9.5rem] animate-pulse bg-muted motion-reduce:animate-none sm:aspect-[16/9] sm:min-h-0 lg:aspect-[2/1]">
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
