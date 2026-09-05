/** What the buyer intends to do with the stone. Drives the weight presets and rule R4. */
export type Purpose = "wedding" | "invest" | "gift";

/** Raw slider values 0–5 in the order [size, finance, quality, environment]. */
export type Weights = [number, number, number, number];

/** Everything the user can change in the sidebar. This is the input of the engine. */
export interface Criteria {
  /** Max price in VND. */
  budget: number;
  /** Minimum carat weight. */
  minCarat: number;
  purpose: Purpose;
  weights: Weights;
  /** "Ưu tiên thân thiện môi trường" checkbox. */
  ecoPreferred: boolean;
  /** Worst acceptable color grade, e.g. "F" means D–F. */
  minColor: string;
  /** Worst acceptable clarity grade, e.g. "VS2" means FL–VS2. */
  minClarity: string;
}
