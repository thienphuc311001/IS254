import { describe, expect, test } from "vitest";
import { compute } from "./compute";
import { makeCriteria, makeDiamond } from "./test-helpers";

const byLink = <T extends { link: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.link, item])) as Record<string, T>;

describe("WSM scoring", () => {
  test("quality normalization keeps cut meaningful when certificates diverge", () => {
    const result = compute(
      makeCriteria({ budget: 20_000_000, weights: [0, 0, 1, 0] }),
      [
        makeDiamond({ key: "lgd-high-cert", origin: "lgd", resale: 0.6, certCode: 2, cutCode: 2 }),
        makeDiamond({ key: "nat-low-cert", origin: "natural", resale: 0.9, certCode: 1, cutCode: 3 }),
        makeDiamond({ key: "nat-high-cert-cut", origin: "natural", resale: 0.9, certCode: 3, cutCode: 3 }),
      ],
    );
    const s = byLink(result.scored);
    expect(s["nat-low-cert"].sQual).not.toBe(s["nat-high-cert-cut"].sQual);
  });

  test("finance score depends on resale rate rather than price", () => {
    const result = compute(
      makeCriteria({ budget: 12_000_000, weights: [0, 1, 0, 0] }),
      [
        makeDiamond({ key: "cheap", price: 9_000_000, resale: 0.9 }),
        makeDiamond({ key: "expensive", price: 11_000_000, resale: 0.9 }),
        makeDiamond({ key: "low-resale", price: 9_500_000, resale: 0.6 }),
      ],
    );
    const s = byLink(result.scored);
    expect(s.cheap.sFin).toBe(s.expensive.sFin);
    expect(s.cheap.sFin).not.toBe(s["low-resale"].sFin);
  });
});

describe("eco blend", () => {
  test("preserves total weight and applies the configured ratio", () => {
    const result = compute(
      makeCriteria({ budget: 20_000_000, weights: [3, 2, 4, 1], ecoPreferred: true }),
      [makeDiamond({ key: "natural" }), makeDiamond({ key: "lgd", origin: "lgd", resale: 0.6 })],
    );
    const expected = [
      0.6 * (3 / 10) + 0.4 * (0.18 / 0.99),
      0.6 * (2 / 10) + 0.4 * (0.18 / 0.99),
      0.6 * (4 / 10) + 0.4 * (0.18 / 0.99),
      0.6 * (1 / 10) + 0.4 * (0.45 / 0.99),
    ];
    expect(Math.abs(result.weights.reduce((a, b) => a + b, 0) - 1)).toBeLessThan(1e-12);
    expected.forEach((w, i) => expect(Math.abs(result.weights[i] - w)).toBeLessThan(1e-12));
  });

  test("is hidden from slider values and exposed in compute state", () => {
    const result = compute(
      makeCriteria({ weights: [3, 2, 4, 1], ecoPreferred: true }),
      [makeDiamond()],
    );
    expect(result.ecoPreferred).toBe(true);
    expect(result.weights[3]).toBe(0.6 * (1 / 10) + 0.4 * (0.45 / 0.99));
  });
});

describe("R2 · high price tag", () => {
  test("flags stones priced above the reference per-carat threshold", () => {
    const result = compute(makeCriteria({ budget: 120_000_000 }), [
      makeDiamond({ key: "pricey", carat: 0.5, price: 100_000_000 }),
      makeDiamond({ key: "fair", carat: 2, price: 100_000_000 }),
    ]);
    const t = byLink(result.top5);
    expect(t.pricey.flagOverpriced).toBe(true);
    expect(t.fair.flagOverpriced).toBe(false);
  });
});

describe("R3 · prefer GIA in the premium segment", () => {
  test("removes non-GIA stones when a GIA candidate is present", () => {
    const result = compute(makeCriteria({ budget: 150_000_000 }), [
      makeDiamond({ key: "natural-gia", certCode: 3 }),
      makeDiamond({ key: "lgd-gia", origin: "lgd", certCode: 3 }),
      makeDiamond({ key: "natural-not-gia", certCode: 2 }),
      makeDiamond({ key: "natural-unverified", certCode: 0 }),
    ]);
    expect(result.top5.map((d) => d.key)).toEqual([
      "store|Round|1|10000000|lgd-gia",
      "store|Round|1|10000000|natural-gia",
    ]);
    expect(result.flags.some((f) => f.id === "R3")).toBe(true);
  });

  test("stays inactive when the premium shortlist has no GIA stone", () => {
    const result = compute(makeCriteria({ budget: 150_000_000 }), [
      makeDiamond({ key: "lgd-first", origin: "lgd", certCode: 2, price: 120_000_000 }),
      makeDiamond({ key: "natural-second", certCode: 0, price: 130_000_000 }),
    ]);
    expect(result.top5.map((d) => d.key)).toEqual([
      "store|Round|1|120000000|lgd-first",
      "store|Round|1|130000000|natural-second",
    ]);
    expect(result.flags.some((f) => f.id === "R3")).toBe(false);
  });
});

describe("R4 · eco equivalence", () => {
  const closePair = (lgdOverrides = {}) => [
    makeDiamond({ key: "natural-top", carat: 1, price: 10_000_000, resale: 0.65, colorCode: 9, clarityCode: 7, certCode: 3 }),
    makeDiamond({ key: "lgd-close", origin: "lgd", carat: 0.995, price: 10_000_000, resale: 0.5851, colorCode: 10, clarityCode: 8, certCode: 3, ...lgdOverrides }),
    makeDiamond({ key: "scale-outlier", origin: "lgd", carat: 6, price: 10_000_000, resale: 0, colorCode: 3, clarityCode: 1, cutCode: 2, certCode: 0 }),
  ];
  const weights = [5, 5, 0, 0] as const;

  test("explains a close LGD alternative only when it already leads with eco enabled", () => {
    const data = closePair();
    const enabled = compute(makeCriteria({ budget: 20_000_000, ecoPreferred: true, weights: [...weights] }), data);
    const disabled = compute(makeCriteria({ budget: 20_000_000, ecoPreferred: false, weights: [...weights] }), data);

    expect(enabled.top5[0].link).toBe("lgd-close");
    expect(enabled.ecoOverride).toBe(true);
    expect(enabled.flags.some((f) => f.id === "R4" && f.level === "override")).toBe(true);
    expect(disabled.top5[0].link).toBe("natural-top");
    expect(disabled.ecoOverride).toBe(false);
    expect(disabled.flags.some((f) => f.id === "R4" && f.level === "override")).toBe(false);
  });

  test("does not activate when a natural candidate leads despite eco preference", () => {
    const result = compute(makeCriteria({ budget: 20_000_000, ecoPreferred: true }), [
      makeDiamond({ key: "natural-leader", carat: 1.1, colorCode: 10, clarityCode: 8 }),
      makeDiamond({ key: "lgd-close", origin: "lgd", carat: 1, resale: 0.6, colorCode: 9, clarityCode: 7 }),
    ]);
    expect(result.top5[0].link).toBe("natural-leader");
    expect(result.ecoOverride).toBe(false);
    expect(result.flags.some((f) => f.id === "R4")).toBe(false);
  });

  test("ignores alternatives that differ by more than the criterion gap limit", () => {
    const result = compute(
      makeCriteria({ budget: 20_000_000, ecoPreferred: true, weights: [...weights] }),
      closePair({ resale: 0.5201 }),
    );
    expect(result.top5[0].link).toBe("lgd-close");
    expect(result.ecoOverride).toBe(false);
    expect(result.flags.some((f) => f.id === "R4" && f.level === "override")).toBe(false);
  });

  test("handles an all-LGD shortlist without runtime errors", () => {
    const result = compute(makeCriteria({ budget: 20_000_000, ecoPreferred: true }), [
      makeDiamond({ key: "lgd-leader", origin: "lgd", resale: 0.6 }),
      makeDiamond({ key: "lgd-second", origin: "lgd", resale: 0.6, price: 10_000_001 }),
    ]);
    expect(result.top5[0].link).toBe("lgd-leader");
    expect(result.ecoOverride).toBe(false);
    expect(result.flags.some((f) => f.id === "R4")).toBe(false);
  });
});
