"use client";

import { useEffect, useState } from "react";
import { loadDiamondData, type DiamondDataset } from "./load-xlsx";

export type DiamondDatasetState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | ({ status: "ready" } & DiamondDataset);

/** Load data_ready.xlsx once on mount and expose loading / error / ready state. */
export function useDiamondDataset(url = "/data_ready.xlsx"): DiamondDatasetState {
  const [state, setState] = useState<DiamondDatasetState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadDiamondData(url)
      .then((dataset) => {
        if (!cancelled) setState({ status: "ready", ...dataset });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ status: "error", error: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
