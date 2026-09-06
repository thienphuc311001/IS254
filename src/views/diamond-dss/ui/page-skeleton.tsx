import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Shown while data_ready.xlsx is being fetched and parsed. Mirrors the final layout
 * (masthead, sidebar, banner, cards, chart, table) so the page does not jump when data lands.
 */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-gold">
            Decision Support System · Diamond Selection
          </div>
          <h1 className="m-0 font-serif text-4xl font-medium tracking-tight text-ink">
            DSS <em className="font-normal italic text-teal">Diamond</em>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-3.5 w-52 bg-panel-2" />
          <Skeleton className="h-3.5 w-40 bg-panel-2" />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-xs border border-line bg-panel px-5 py-5">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <Skeleton className="mb-2.5 h-3 w-28 bg-panel-2" />
              <Skeleton className="h-0.5 w-full bg-line" />
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <div className="mb-5 rounded-xs border border-line bg-panel p-6">
            <Skeleton className="mb-2.5 h-3 w-44 bg-panel-2" />
            <Skeleton className="mb-2.5 h-8 w-72 bg-panel-2" />
            <p className="m-0 font-mono text-xs text-ink-dim">Đang nạp dữ liệu từ data_ready.xlsx…</p>
          </div>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-56 rounded-xs bg-panel" />
            <Skeleton className="h-56 rounded-xs bg-panel" />
          </div>
          <Skeleton className="mb-5 h-96 rounded-xs bg-panel" />
          <Skeleton className="h-80 rounded-xs bg-panel" />
        </div>
      </div>
    </div>
  );
}
