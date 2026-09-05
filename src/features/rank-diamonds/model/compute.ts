import { CLARITY_CODE, COLOR_CODE, type Diamond } from "@/entities/diamond";
import type { Criteria } from "@/entities/criteria";
import { SHORTLIST_SIZE, TOP_N } from "../config/rules";
import { applyEcoBlend } from "./eco-blend";
import { hardFilter } from "./hard-filter";
import { applyR1, applyR2, applyR3, applyR4Wedding, evaluateR4Eco } from "./rules";
import type { RankingResult, RuleFlag } from "./types";
import { scoreDiamonds } from "./wsm";

/**
 * The 3-step decision engine:
 *   1. Hard Filter        → drop stones that violate the constraints
 *   2. Weighted Scoring   → score and sort what remains
 *   3. Rule-based override → R1–R4 adjust the shortlist and explain themselves
 * Pure function: same criteria + data always give the same result.
 */
export function compute(criteria: Criteria, data: Diamond[]): RankingResult {
  const { budget, minCarat, purpose, ecoPreferred } = criteria;
  const weights = applyEcoBlend(criteria.weights, ecoPreferred);

  // ===== Step 1 · Hard Filter =====
  const filtered = hardFilter(data, {
    budget,
    minCarat,
    minColorCode: COLOR_CODE[criteria.minColor] ?? 0,
    minClarityCode: CLARITY_CODE[criteria.minClarity] ?? 0,
  });

  // ===== Step 2 · Weighted Scoring Model =====
  // Normalize over the filtered set; fall back to the whole dataset when it is empty.
  const base = filtered.length ? filtered : data;
  const scored = scoreDiamonds(filtered, base, weights);

  // ===== Step 3 · Rule-based override =====
  const flags: RuleFlag[] = [];
  const shortlist = scored.slice(0, SHORTLIST_SIZE);

  const r1 = applyR1(shortlist, data, budget, minCarat);
  if (r1.flag) flags.push(r1.flag);

  const r2 = applyR2(r1.list);

  const r3 = applyR3(r2, budget);
  if (r3.flag) flags.push(r3.flag);

  const r4a = applyR4Wedding(r3.list, purpose);
  if (r4a.flag) flags.push(r4a.flag);

  const r4b = evaluateR4Eco(r4a.list, ecoPreferred);
  if (r4b.flag) flags.push(r4b.flag);

  return {
    budget,
    minCarat,
    filtered,
    scored,
    weights,
    top5: r4a.list.slice(0, TOP_N),
    override: r1.flag !== null,
    ecoPreferred,
    ecoOverride: r4b.ecoOverride,
    flags,
  };
}
