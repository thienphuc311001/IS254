import type { Diamond } from "@/entities/diamond";
import type { Weights } from "@/entities/criteria";

/** A stone after Step 2 (WSM): normalized criterion scores + weighted total. */
export interface ScoredDiamond extends Diamond {
  sSize: number;
  sFin: number;
  sQual: number;
  sEnv: number;
  score: number;
}

/** A stone after Step 3 (rules): carries the R2 tag and a stable key for React lists. */
export interface RankedDiamond extends ScoredDiamond {
  flagOverpriced: boolean;
  key: string;
}

export type RuleId = "R1" | "R2" | "R3" | "R4";
export type RuleLevel = "override" | "warn" | "info";

export interface RuleFlag {
  id: RuleId;
  level: RuleLevel;
  msg: string;
}

export interface RankingResult {
  budget: number;
  minCarat: number;
  /** Stones surviving Step 1. */
  filtered: Diamond[];
  /** Stones after Step 2, sorted by score desc. */
  scored: ScoredDiamond[];
  /** Final normalized weights actually used (after eco blend). Sum = 1. */
  weights: Weights;
  /** Final Top 5 after rules. */
  top5: RankedDiamond[];
  /** True when R1 forced LGD ahead of natural. */
  override: boolean;
  ecoPreferred: boolean;
  /** True when R4 (eco) judged the LGD leader equivalent to the nearest natural. */
  ecoOverride: boolean;
  flags: RuleFlag[];
}
