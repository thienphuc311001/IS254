import { describe, expect, test } from "vitest";
import { COLOR_CODE, CLARITY_CODE } from "@/entities/diamond";
import { hardFilter } from "./hard-filter";
import { makeDiamond } from "./test-helpers";

const input = {
  budget: 50_000_000,
  minCarat: 1,
  minColorCode: COLOR_CODE.F,
  minClarityCode: CLARITY_CODE.VS2,
};

describe("hardFilter (Step 1)", () => {
  test("keeps a stone that satisfies every constraint", () => {
    const ok = makeDiamond({ price: 50_000_000, carat: 1, colorCode: 8, clarityCode: 3 });
    expect(hardFilter([ok], input)).toEqual([ok]);
  });

  test("drops stones over budget, under carat, or below the color / clarity floor", () => {
    const tooPricey = makeDiamond({ key: "p", price: 50_000_001 });
    const tooSmall = makeDiamond({ key: "s", carat: 0.99 });
    const tooYellow = makeDiamond({ key: "y", colorCode: COLOR_CODE.G });
    const tooIncluded = makeDiamond({ key: "i", clarityCode: CLARITY_CODE.SI1 });
    expect(hardFilter([tooPricey, tooSmall, tooYellow, tooIncluded], input)).toEqual([]);
  });

  test("treats a missing color / clarity code as the worst grade", () => {
    const unknown = makeDiamond({ colorCode: null, clarityCode: null });
    expect(hardFilter([unknown], input)).toEqual([]);
    expect(hardFilter([unknown], { ...input, minColorCode: 0, minClarityCode: 0 })).toHaveLength(1);
  });

  test("sanity filter removes malformed rows", () => {
    const free = makeDiamond({ key: "free", price: 0 });
    const huge = makeDiamond({ key: "huge", carat: 6.5 });
    const loose = { budget: 1e12, minCarat: 0, minColorCode: 0, minClarityCode: 0 };
    expect(hardFilter([free, huge], loose)).toEqual([]);
  });
});
