import type { DatasetMeta } from "@/entities/diamond";

/** Page header: brand + live dataset counts (total, stores, natural, LGD). */
export function Masthead({ meta }: { meta: DatasetMeta }) {
  return (
    <header className="mb-[30px] flex flex-wrap items-end justify-between gap-5 border-b border-line pb-[22px]">
      <div>
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-gold">
          Decision Support System · Diamond Selection
        </div>
        <h1 className="m-0 font-serif text-[38px] font-medium tracking-[-0.01em] text-ink">
          DSS <em className="font-normal italic text-teal">Diamond</em>
        </h1>
      </div>
      <div className="text-right font-mono text-[11.5px] leading-[1.7] text-ink-faint">
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
