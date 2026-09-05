import type { Diamond } from "@/entities/diamond";
import { RULES } from "../config/rules";

export interface HardFilterInput {
  budget: number;
  minCarat: number;
  minColorCode: number;
  minClarityCode: number;
}

/**
 * Step 1 · Hard Filter.
 * Drop stones over budget, under the minimum carat, or below the color / clarity floor.
 * Also drops malformed rows (price 0, or values outside the plausible data range).
 */
export function hardFilter(data: Diamond[], input: HardFilterInput): Diamond[] {
  const { budget, minCarat, minColorCode, minClarityCode } = input;
  return data.filter((d) => {
    if (d.price > budget || d.carat < minCarat) return false;
    if ((d.colorCode ?? 0) < minColorCode || (d.clarityCode ?? 0) < minClarityCode) return false;
    if (
      d.price === 0 ||
      d.carat > RULES.SANITY_FILTER.maxCarat ||
      d.price > RULES.SANITY_FILTER.maxPrice
    )
      return false;
    return true;
  });
}
