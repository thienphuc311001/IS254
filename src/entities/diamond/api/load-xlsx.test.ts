import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { parseDiamondXlsx } from "./load-xlsx";

describe("parseDiamondXlsx on public/data_ready.xlsx", () => {
  test("reads every row and derives dataset metadata", async () => {
    const bytes = fs.readFileSync(path.resolve(__dirname, "../../../../public/data_ready.xlsx"));
    const { records, meta } = await parseDiamondXlsx(new Uint8Array(bytes));

    expect(records).toHaveLength(763);
    expect(meta.total).toBe(763);
    expect(meta.natural).toBe(645);
    expect(meta.lgd).toBe(118);
    expect(meta.stores).toBe(5);
    expect(meta.storeList).toEqual(
      expect.arrayContaining(["tierra.vn", "jemmia.vn", "mayadiamond.vn", "thaolinhjewelry.vn", "trangsuc.doji.vn"]),
    );
    expect(meta.minPrice).toBe(2_808_000);
    expect(meta.maxPrice).toBe(1_126_391_200);
    expect(Math.round(meta.avgResale.natural * 100)).toBe(90);
    expect(Math.round(meta.avgResale.lgd * 100)).toBe(60);

    // Grades come sorted best → worst so the dropdowns can list them directly.
    expect(meta.colorGrades[0].grade).toBe("D");
    expect(meta.clarityGrades.map((g) => g.code)).toEqual(
      [...meta.clarityGrades.map((g) => g.code)].sort((a, b) => b - a),
    );

    const first = records[0];
    expect(typeof first.carat).toBe("number");
    expect(typeof first.price).toBe("number");
    expect(["natural", "lgd"]).toContain(first.origin);
  });

  test("rejects empty input", async () => {
    await expect(parseDiamondXlsx(new Uint8Array())).rejects.toThrow();
  });
});
