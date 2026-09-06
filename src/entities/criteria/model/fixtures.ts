import type { Criteria } from "./types";

/**
 * Test fixture matching the legacy test harness defaults: every weight slider at 0
 * (→ equal weights after normalization), no color / clarity floor, wedding purpose.
 */
export function makeCriteria(overrides: Partial<Criteria> = {}): Criteria {
  return {
    budget: 60_000_000,
    minCarat: 0.5,
    purpose: "wedding",
    weights: [0, 0, 0, 0],
    ecoPreferred: false,
    minColor: "",
    minClarity: "",
    ...overrides,
  };
}
