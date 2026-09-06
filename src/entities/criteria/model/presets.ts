import type { Criteria, Purpose, Weights } from "./types";

export const PURPOSE = {
  WEDDING: "wedding",
  INVESTMENT: "invest",
  GIFT_PERSONAL: "gift",
} as const satisfies Record<string, Purpose>;

export const PURPOSE_LABEL: Record<Purpose, string> = {
  wedding: "Nhẫn cưới",
  invest: "Tích trữ",
  gift: "Quà tặng / Cá nhân",
};

/** Ordered list used to render the segmented control. */
export const PURPOSE_ORDER: Purpose[] = ["wedding", "invest", "gift"];

/** Weight presets [size, finance, quality, environment] applied when a purpose is chosen. */
export const PRESETS: Record<Purpose, Weights> = {
  wedding: [3, 2, 4, 1],
  invest: [2, 5, 3, 1],
  gift: [3, 3, 3, 2],
};

/**
 * Initial sidebar state. "Nhẫn cưới" is pre-selected, so the weights start at the wedding
 * preset from Bảng 4 of the report. (The legacy index.html shipped 4/2/3/1 here by mistake,
 * which made the default screen disagree with the documented preset.)
 */
export const DEFAULT_CRITERIA: Criteria = {
  budget: 60_000_000,
  minCarat: 0.5,
  purpose: "wedding",
  weights: [...PRESETS.wedding],
  ecoPreferred: false,
  minColor: "F",
  minClarity: "VS2",
};
