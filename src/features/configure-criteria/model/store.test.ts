import { beforeEach, describe, expect, test } from "vitest";
import type { DatasetMeta } from "@/entities/diamond";
import { DEFAULT_CRITERIA, PRESETS } from "@/entities/criteria";
import { selectCriteria, useCriteriaStore } from "./store";

const meta: DatasetMeta = {
  total: 3, natural: 2, lgd: 1, stores: 1, storeList: ["s"],
  minPrice: 2_808_000, maxPrice: 1_126_391_200,
  minCarat: 0.18, maxCarat: 4.93,
  avgResale: { natural: 0.9, lgd: 0.6 },
  colorGrades: [{ grade: "D", code: 10 }, { grade: "F", code: 8 }, { grade: "J", code: 4 }],
  clarityGrades: [{ grade: "IF", code: 7 }, { grade: "VS2", code: 3 }, { grade: "SI2", code: 1 }],
};

beforeEach(() => {
  useCriteriaStore.setState({
    ...DEFAULT_CRITERIA,
    bounds: {
      budget: { min: 10_000_000, max: 1_126_391_200, step: 1_000_000 },
      carat: { min: 0.18, max: 5, step: 0.01 },
    },
  });
});

describe("criteria store", () => {
  test("starts with the legacy index.html defaults", () => {
    expect(selectCriteria(useCriteriaStore.getState())).toEqual(DEFAULT_CRITERIA);
  });

  test("choosing a purpose applies its weight preset", () => {
    useCriteriaStore.getState().setPurpose("invest");
    const s = useCriteriaStore.getState();
    expect(s.purpose).toBe("invest");
    expect(s.weights).toEqual(PRESETS.invest);
  });

  test("setWeight changes one slider without touching the others", () => {
    useCriteriaStore.getState().setWeight(3, 5);
    expect(useCriteriaStore.getState().weights).toEqual([4, 2, 3, 5]);
  });

  test("budget and carat are clamped to the current bounds", () => {
    const s = useCriteriaStore.getState();
    s.setBudget(1);
    s.setMinCarat(99);
    expect(useCriteriaStore.getState().budget).toBe(10_000_000);
    expect(useCriteriaStore.getState().minCarat).toBe(5);
  });

  test("applyDatasetBounds derives slider ranges from the dataset", () => {
    useCriteriaStore.getState().applyDatasetBounds(meta);
    const { bounds } = useCriteriaStore.getState();
    expect(bounds.budget).toEqual({ min: 2_000_000, max: 1_126_391_200, step: 1_000_000 });
    expect(bounds.carat).toEqual({ min: 0.18, max: 4.93, step: 0.01 });
  });

  test("applyDatasetBounds keeps a grade the data has, else falls back to the default, else the lowest", () => {
    const s = useCriteriaStore.getState();
    s.setMinColor("J");
    s.setMinClarity("VVS1"); // not in this dataset → falls back to default VS2
    s.applyDatasetBounds(meta);
    expect(useCriteriaStore.getState().minColor).toBe("J");
    expect(useCriteriaStore.getState().minClarity).toBe("VS2");

    useCriteriaStore.getState().setMinClarity("FL");
    useCriteriaStore.getState().applyDatasetBounds({ ...meta, clarityGrades: [{ grade: "SI1", code: 2 }] });
    expect(useCriteriaStore.getState().minClarity).toBe("SI1");
  });
});
