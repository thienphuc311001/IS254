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
 * Initial sidebar state. Mirrors the default `value` attributes of the legacy index.html:
 * note the sliders start at [4, 2, 3, 1] even though "Nhẫn cưới" is pre-selected; the
 * wedding preset [3, 2, 4, 1] is only applied when the user clicks a purpose button.
 */
export const DEFAULT_CRITERIA: Criteria = {
  budget: 60_000_000,
  minCarat: 0.5,
  purpose: "wedding",
  weights: [4, 2, 3, 1],
  ecoPreferred: false,
  minColor: "F",
  minClarity: "VS2",
};
