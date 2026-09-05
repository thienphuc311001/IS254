import { CERT_SCORE, CUT_SCORE, type Diamond, type DiamondOrigin } from "@/entities/diamond";
import type { Weights } from "@/entities/criteria";
import { normalize } from "@/shared/lib";
import { ENV_SCORE, QUALITY_FALLBACK } from "../config/rules";
import type { ScoredDiamond } from "./types";

// ---- Raw (un-normalized) values of the 4 criteria ----

/** Size: carat per million VND. Bigger and cheaper → higher. */
export const sizeRaw = (d: Diamond): number => d.carat / (d.price / 1e6);
/** Finance: resale retention rate, independent of price. */
export const finRaw = (d: Diamond): number => d.resale ?? 0;
export const cutScore = (d: Diamond): number =>
  (d.cutCode != null ? CUT_SCORE[d.cutCode] : undefined) ?? QUALITY_FALLBACK;
export const certScore = (d: Diamond): number =>
  (d.certCode != null ? CERT_SCORE[d.certCode] : undefined) ?? QUALITY_FALLBACK;
/** Environment: LGD avoids mining. */
export const envScore = (origin: DiamondOrigin): number => ENV_SCORE[origin];

/**
 * Step 2 · Weighted Scoring Model.
 * Each criterion is min-max normalized over `base` (the filtered set, or the whole
 * dataset when nothing survived the filter), then combined:
 *   score = w1·Size + w2·Finance + w3·Quality + w4·Environment
 * Quality is the average of the normalized cut and certificate scores.
 * Returns `candidates` sorted by score, highest first.
 */
export function scoreDiamonds(
  candidates: Diamond[],
  base: Diamond[],
  [w1, w2, w3, w4]: Weights,
): ScoredDiamond[] {
  const sizeNorm = normalize(base.map(sizeRaw));
  const finNorm = normalize(base.map(finRaw));
  const cutNorm = normalize(base.map(cutScore));
  const certNorm = normalize(base.map(certScore));
  const envNorm = normalize(base.map((d) => envScore(d.origin)));

  return candidates
    .map((d) => {
      const sSize = sizeNorm(sizeRaw(d));
      const sFin = finNorm(finRaw(d));
      const sQual = (cutNorm(cutScore(d)) + certNorm(certScore(d))) / 2;
      const sEnv = envNorm(envScore(d.origin));
      const score = w1 * sSize + w2 * sFin + w3 * sQual + w4 * sEnv;
      return { ...d, sSize, sFin, sQual, sEnv, score };
    })
    .sort((a, b) => b.score - a.score);
}
