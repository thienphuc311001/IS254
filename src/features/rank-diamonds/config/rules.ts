/** Thresholds for the rule-based override step (R1–R4) and the sanity filter. */
export const RULES = {
  /** R2 · price-per-carat above which a stone is tagged "giá cao". */
  R2_HIGH_PRICE_PER_CT: { natural: 150e6, lgd: 30e6 },
  /** R3 · minimum budget at which the shortlist is restricted to GIA-certified stones. */
  R3_PREMIUM_GIA: { budget: 100e6, certCode: 3 },
  /** R4 · max per-criterion gap between an LGD leader and the nearest natural to call them equivalent. */
  R4_MAX_CRITERION_GAP: 0.1,
  /** Step 1 sanity filter for malformed rows (not an override rule). */
  SANITY_FILTER: { maxCarat: 6, maxPrice: 2e9 },
} as const;

/** Weight blend applied when "Ưu tiên thân thiện môi trường" is on. */
export const ECO_BLEND = {
  baseRatio: 0.6,
  ecoRatio: 0.4,
  ecoVector: [0.18, 0.18, 0.18, 0.45] as const,
} as const;

/** Environment score by origin: LGD avoids mining. */
export const ENV_SCORE = { lgd: 0.85, natural: 0.15 } as const;

/** Fallback quality score when a cut / cert code is missing from the lookup tables. */
export const QUALITY_FALLBACK = 0.7;

/** How many stones the WSM hands to the rules so they have room to reorder. */
export const SHORTLIST_SIZE = 8;
export const TOP_N = 5;
