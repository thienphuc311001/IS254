/** Color grade → numeric code (whiter = higher). Matches the `color_code` column. */
export const COLOR_CODE: Record<string, number> = {
  D: 10, E: 9, F: 8, G: 7, H: 6, I: 5, J: 4, K: 3, L: 2, M: 1, N: 0,
};

/** Clarity grade → numeric code (cleaner = higher). Matches the `clarity_code` column. */
export const CLARITY_CODE: Record<string, number> = {
  FL: 8, IF: 7, VVS1: 6, VVS2: 5, VS1: 4, VS2: 3, SI1: 2, SI2: 1,
};

/** cut_code → quality score. 3 = Excellent, 2 = Very Good / missing. */
export const CUT_SCORE: Record<number, number> = { 3: 1.0, 2: 0.85 };

/** cert_code → quality score. 3 = GIA, 2 = IGI, 1 = DJL, 0 = unknown. */
export const CERT_SCORE: Record<number, number> = { 3: 1.0, 2: 0.9, 1: 0.8, 0: 0.7 };

/** cert_code value that means GIA. */
export const CERT_CODE_GIA = 3;
