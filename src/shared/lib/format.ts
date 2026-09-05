/** Format a VND amount with Vietnamese thousand separators, e.g. 6.500.000 */
export const fmtVND = (n: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n));

/** Short money label for chart axes: "6.5 tr" or "1.13 tỷ" */
export const fmtTrieu = (n: number): string =>
  n / 1e6 >= 1000 ? (n / 1e9).toFixed(2) + " tỷ" : (n / 1e6).toFixed(1) + " tr";
