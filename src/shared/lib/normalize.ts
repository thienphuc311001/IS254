/**
 * Min-max normalization to [0, 1].
 * Returns a function that maps any raw value onto the range of `values`.
 * When every value is identical the range is degenerate and every input maps to 0.5.
 */
export function normalize(values: number[]): (value: number) => number {
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  return mx > mn ? (value) => (value - mn) / (mx - mn) : () => 0.5;
}
