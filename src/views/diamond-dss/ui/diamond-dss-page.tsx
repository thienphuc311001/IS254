"use client";

import { useEffect, useMemo } from "react";
import { useDiamondDataset } from "@/entities/diamond";
import { useCriteria, useCriteriaStore } from "@/features/configure-criteria";
import { compute } from "@/features/rank-diamonds";
import { Masthead } from "@/widgets/masthead";
import { CriteriaSidebar } from "@/widgets/criteria-sidebar";
import { RecommendationBanner } from "@/widgets/recommendation-banner";
import { TradeoffCards } from "@/widgets/tradeoff-cards";
import { EnvironmentImpact } from "@/widgets/environment-impact";
import { MarketLoupe } from "@/widgets/market-loupe";
import { ResultsTable } from "@/widgets/results-table";
import { AppFooter } from "@/widgets/app-footer";

const wrap = "mx-auto max-w-[1240px] px-7 pt-9 pb-20";

/**
 * The single page of the app. Loads the dataset, feeds the user's criteria into the
 * engine, and lays out the widgets in the same grid as the legacy index.html.
 */
export function DiamondDssPage() {
  const dataset = useDiamondDataset();
  const criteria = useCriteria();
  const applyDatasetBounds = useCriteriaStore((s) => s.applyDatasetBounds);

  const meta = dataset.status === "ready" ? dataset.meta : null;
  const records = dataset.status === "ready" ? dataset.records : null;

  // Once the data is in, derive slider ranges and dropdown options from it.
  useEffect(() => {
    if (meta) applyDatasetBounds(meta);
  }, [meta, applyDatasetBounds]);

  const result = useMemo(
    () => (records ? compute(criteria, records) : null),
    [criteria, records],
  );

  if (dataset.status === "loading") {
    return (
      <main className={wrap}>
        <p className="font-mono text-[12px] text-ink-dim">Đang nạp dữ liệu từ data_ready.xlsx…</p>
      </main>
    );
  }

  if (dataset.status === "error" || !meta || !records || !result) {
    return (
      <main className={wrap}>
        <p className="font-mono text-[12px] text-coral">
          Không đọc được data_ready.xlsx
          {dataset.status === "error" ? ` — ${dataset.error}` : ""}
        </p>
      </main>
    );
  }

  return (
    <main className={wrap}>
      <Masthead meta={meta} />

      <div className="grid grid-cols-1 items-start gap-6 min-[900px]:grid-cols-[300px_minmax(0,1fr)]">
        <CriteriaSidebar meta={meta} />

        <div className="min-w-0">
          <RecommendationBanner result={result} meta={meta} />
          <TradeoffCards filtered={result.filtered} />
          <EnvironmentImpact />
          <MarketLoupe
            data={records}
            filtered={result.filtered}
            top5={result.top5}
            budget={result.budget}
            minCarat={result.minCarat}
          />
          <ResultsTable top5={result.top5} matchCount={result.filtered.length} total={records.length} />
          <AppFooter meta={meta} />
        </div>
      </div>
    </main>
  );
}
