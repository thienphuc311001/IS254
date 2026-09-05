import type { Diamond } from "@/entities/diamond";
import type { Criteria } from "@/entities/criteria";

/** A default natural GIA stone; override any field. `link` doubles as the readable id. */
export function makeDiamond(overrides: Partial<Diamond> & { key?: string } = {}): Diamond {
  const { key, ...rest } = overrides;
  const id = key || `diamond-${Math.random()}`;
  return {
    origin: "natural",
    store: "store",
    shape: "Round",
    carat: 1,
    color: "G",
    clarity: "VS1",
    cut: "Excellent",
    cert: "GIA",
    price: 10_000_000,
    resale: 0.9,
    link: id,
    colorCode: 7,
    clarityCode: 4,
    cutCode: 3,
    certCode: 3,
    ...rest,
  };
}

/**
 * Criteria matching the legacy test harness defaults: every weight slider at 0
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
