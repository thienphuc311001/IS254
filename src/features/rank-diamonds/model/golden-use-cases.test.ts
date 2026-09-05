/**
 * Golden tests: the 5 demo use cases documented in README.md, run against the real
 * public/data_ready.xlsx. They are the parity contract with the legacy vanilla-JS app.
 */
import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, test } from "vitest";
import { parseDiamondXlsx, type Diamond } from "@/entities/diamond";
import { PRESETS, type Criteria } from "@/entities/criteria";
import { compute } from "./compute";

let data: Diamond[];

beforeAll(async () => {
  const bytes = fs.readFileSync(path.resolve(__dirname, "../../../../public/data_ready.xlsx"));
  ({ records: data } = await parseDiamondXlsx(new Uint8Array(bytes)));
});

const base: Criteria = {
  budget: 60_000_000,
  minCarat: 0.5,
  purpose: "wedding",
  weights: [...PRESETS.wedding],
  ecoPreferred: false,
  minColor: "F",
  minClarity: "VS2",
};

const ids = (flags: { id: string }[]) => flags.map((f) => f.id);

describe("README demo use cases", () => {
  test("dataset shape: 763 stones · 645 natural · 118 LGD", () => {
    expect(data).toHaveLength(763);
    expect(data.filter((d) => d.origin === "natural")).toHaveLength(645);
    expect(data.filter((d) => d.origin === "lgd")).toHaveLength(118);
  });

  test("UC1 · tight budget, ≥ 1 ct → R1 overrides to LGD", () => {
    const r = compute(
      { ...base, budget: 25_000_000, minCarat: 1.0, minColor: "J", minClarity: "SI2" },
      data,
    );
    expect(r.flags.find((f) => f.id === "R1")?.level).toBe("override");
    expect(r.override).toBe(true);
    expect(r.top5.every((d) => d.origin === "lgd")).toBe(true);
    const top = r.top5[0];
    expect(top.carat).toBe(1.73);
    expect(top.color).toBe("E");
    expect(top.clarity).toBe("VS1");
    expect(top.price).toBe(6_500_000);
  });

  test("UC2 · wedding ring needs a bright color → R4 swaps Top 1, R3 keeps GIA only", () => {
    const r = compute(
      { ...base, budget: 120_000_000, minCarat: 1.2, minColor: "J", minClarity: "VS2" },
      data,
    );
    // WSM alone puts the J-colored stone first…
    expect(r.scored[0].color).toBe("J");
    expect(r.scored[0].carat).toBe(1.23);
    // …but R4 (wedding) swaps in the brighter H.
    expect(ids(r.flags)).toEqual(expect.arrayContaining(["R3", "R4"]));
    const top = r.top5[0];
    expect(top.carat).toBe(1.22);
    expect(top.color).toBe("H");
    expect(top.clarity).toBe("VS2");
    expect(top.cert).toBe("GIA");
    expect(top.price).toBe(108_000_000);
    expect(r.top5.every((d) => d.certCode === 3)).toBe(true);
  });

  test("UC3 · investment → R3 prefers natural GIA", () => {
    const r = compute(
      { ...base, purpose: "invest", weights: [...PRESETS.invest], budget: 150_000_000, minCarat: 0.5 },
      data,
    );
    expect(r.flags.find((f) => f.id === "R3")?.level).toBe("info");
    expect(r.top5).toHaveLength(5);
    expect(r.top5.every((d) => d.origin === "natural" && d.cert === "GIA")).toBe(true);
    const top = r.top5[0];
    expect(top.carat).toBe(0.5);
    expect(top.color).toBe("D");
    expect(top.clarity).toBe("VS1");
    expect(top.price).toBe(29_900_000);
    expect(top.score).toBeCloseTo(0.74, 1);
  });

  test("UC4 · ultra-premium ≥ 2 ct → R2 tags 'giá cao' on every remaining stone", () => {
    const r = compute({ ...base, budget: 800_000_000, minCarat: 2.0 }, data);
    expect(r.top5).toHaveLength(2);
    expect(r.top5.every((d) => d.flagOverpriced)).toBe(true);
    expect(ids(r.flags)).toContain("R3");
    const example = r.top5.find((d) => d.carat === 2.01);
    expect(example?.price).toBe(678_000_000);
    expect(example?.color).toBe("D");
  });

  test("UC5 · gift + eco toggle → Top 5 flips from natural GIA to all LGD", () => {
    const gift: Criteria = { ...base, purpose: "gift", weights: [...PRESETS.gift], budget: 120_000_000 };

    const a = compute(gift, data);
    expect(a.top5.every((d) => d.origin === "natural" && d.cert === "GIA")).toBe(true);
    expect(ids(a.flags)).toContain("R3");
    expect(a.weights[3]).toBeCloseTo(0.182, 3);

    const b = compute({ ...gift, ecoPreferred: true }, data);
    expect(b.weights[3]).toBeCloseTo(0.291, 3);
    expect(b.top5.every((d) => d.origin === "lgd")).toBe(true);
    expect(b.top5[0].carat).toBe(1.73);
    expect(b.top5[0].price).toBe(6_500_000);
    expect(ids(b.flags)).not.toContain("R3");
    // README: the R4 eco banner does not fire on the real data (gap ≈ 1.0 > 0.10).
    expect(b.ecoOverride).toBe(false);
  });
});
