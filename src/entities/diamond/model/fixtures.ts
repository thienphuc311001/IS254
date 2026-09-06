import type { Diamond } from "./types";

/**
 * Test fixture: a default natural GIA stone; override any field.
 * `key` is a convenience alias that sets `link`, which doubles as a readable id in tests.
 */
export function makeDiamond(overrides: Partial<Diamond> & { key?: string } = {}): Diamond {
  const { key, ...rest } = overrides;
  const id = key || `diamond-${Math.random()}`;
  return {
    origin: "natural",
    store: "store",
    shape: "Round",
    carat: 1,
    color: "G",
    clarity: "VS1",
    cut: "Excellent",
    cert: "GIA",
    price: 10_000_000,
    resale: 0.9,
    link: id,
    colorCode: 7,
    clarityCode: 4,
    cutCode: 3,
    certCode: 3,
    ...rest,
  };
}
