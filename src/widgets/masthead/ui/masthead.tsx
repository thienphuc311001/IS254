import type { DatasetMeta } from "@/entities/diamond";

/** Page header: brand + live dataset counts (total, stores, natural, LGD). */
export function Masthead({ meta }: { meta: DatasetMeta }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
      <div>
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-gold">
          Decision Support System · Diamond Selection
        </div>
        <h1 className="m-0 font-serif text-4xl font-medium tracking-tight text-ink">
          DSS <em className="font-normal italic text-teal">Diamond</em>
        </h1>
      </div>
      <div className="text-right font-mono text-xs leading-relaxed text-ink-faint">
        <div>
          <b className="font-medium text-ink-dim">{meta.total}</b> viên đã ghi nhận ·{" "}
          <span>{meta.stores}</span> cửa hàng
        </div>
        <div>
          <span>{meta.natural}</span> Tự nhiên · <span>{meta.lgd}</span> Nhân tạo LGD
        </div>
      </div>
    </header>
  );
}
