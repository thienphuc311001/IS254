import type { DatasetMeta } from "@/entities/diamond";

/** Data sources (derived from the `store` column) and a one-line model description. */
export function AppFooter({ meta }: { meta: DatasetMeta }) {
  return (
    <footer className="mt-[34px] flex flex-wrap justify-between gap-2 border-t border-line pt-[18px] font-mono text-[11px] text-ink-faint">
      <span>
        {meta.storeList.length
          ? "Nguồn dữ liệu: " + meta.storeList.join(" · ")
          : "Nguồn dữ liệu: data_ready.xlsx"}
      </span>
      <span>Mô hình: Hard Filter → Weighted Scoring (WSM) → Rule-based override</span>
    </footer>
  );
}
