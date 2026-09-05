import type { Weights } from "@/entities/criteria";
import { ECO_BLEND } from "../config/rules";

/** Scale weights so they sum to 1. All-zero input falls back to equal weights. */
export function normalizeWeights(weights: readonly number[]): Weights {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return (total ? weights.map((weight) => weight / total) : [0.25, 0.25, 0.25, 0.25]) as Weights;
}

/**
 * Blend the user's weights 60/40 with a fixed eco-leaning vector when the eco toggle is on.
 * Off → plain normalization. The result always sums to 1.
 */
export function applyEcoBlend(baseWeights: readonly number[], ecoPreferred: boolean): Weights {
  if (!ecoPreferred) return normalizeWeights(baseWeights);
  const base = normalizeWeights(baseWeights);
  const eco = normalizeWeights(ECO_BLEND.ecoVector);
  return base.map(
    (weight, index) => ECO_BLEND.baseRatio * weight + ECO_BLEND.ecoRatio * eco[index],
  ) as Weights;
}
