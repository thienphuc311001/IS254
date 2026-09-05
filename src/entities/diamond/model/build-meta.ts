import type { DatasetMeta, Diamond, DiamondOrigin, GradeOption } from "./types";

/** Every statistic shown in the app is derived from the records; nothing is hard-coded. */
export function buildMeta(records: Diamond[]): DatasetMeta {
  const prices = records.map((r) => r.price).filter((p) => p > 0);
  const carats = records.map((r) => r.carat).filter((c) => c > 0);

  const avgResaleOf = (origin: DiamondOrigin): number => {
    const list = records.filter((r) => r.origin === origin && r.resale != null);
    return list.length
      ? list.reduce((s, r) => s + (r.resale as number), 0) / list.length
      : 0;
  };

  // Distinct grades present in the data, sorted best → worst.
  const distinctGrades = (
    gradeKey: "color" | "clarity",
    codeKey: "colorCode" | "clarityCode",
  ): GradeOption[] => {
    const seen = new Map<string, number>();
    records.forEach((r) => {
      const grade = r[gradeKey];
      const code = r[codeKey];
      if (grade && code != null) seen.set(grade, code);
    });
    return [...seen.entries()]
      .map(([grade, code]) => ({ grade, code }))
      .sort((a, b) => b.code - a.code);
  };

  return {
    total: records.length,
    natural: records.filter((r) => r.origin === "natural").length,
    lgd: records.filter((r) => r.origin === "lgd").length,
    stores: new Set(records.map((r) => r.store)).size,
    storeList: [...new Set(records.map((r) => r.store).filter(Boolean))],
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    minCarat: carats.length ? Math.min(...carats) : 0,
    maxCarat: carats.length ? Math.max(...carats) : 0,
    avgResale: { natural: avgResaleOf("natural"), lgd: avgResaleOf("lgd") },
    colorGrades: distinctGrades("color", "colorCode"),
    clarityGrades: distinctGrades("clarity", "clarityCode"),
  };
}

/** Average resale retention as a whole percentage, e.g. 90. */
export function resalePct(meta: DatasetMeta, origin: DiamondOrigin): number {
  return Math.round(meta.avgResale[origin] * 100);
}
