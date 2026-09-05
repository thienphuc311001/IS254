"use client";

import { create } from "zustand";
import type { DatasetMeta, GradeOption } from "@/entities/diamond";
import { DEFAULT_CRITERIA, PRESETS, type Criteria, type Purpose } from "@/entities/criteria";

export interface RangeBounds {
  min: number;
  max: number;
  step: number;
}

export interface CriteriaBounds {
  budget: RangeBounds;
  carat: RangeBounds;
}

/** Initial slider ranges (same as the legacy index.html); replaced by dataset bounds once loaded. */
const INITIAL_BOUNDS: CriteriaBounds = {
  budget: { min: 10_000_000, max: 1_126_391_200, step: 1_000_000 },
  carat: { min: 0.18, max: 5.0, step: 0.01 },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Keep the current grade if the dataset has it, else the default, else the lowest grade. */
function pickGrade(grades: GradeOption[], current: string, fallback: string): string {
  if (!grades.length) return current;
  const lowest = grades[grades.length - 1].grade;
  const chosen = [current, fallback].find((g) => grades.some((x) => x.grade === g));
  return chosen || lowest;
}

export interface CriteriaStore extends Criteria {
  bounds: CriteriaBounds;
  setBudget: (value: number) => void;
  setMinCarat: (value: number) => void;
  /** Also applies the purpose's weight preset, like clicking a segment in the legacy UI. */
  setPurpose: (purpose: Purpose) => void;
  setWeight: (index: 0 | 1 | 2 | 3, value: number) => void;
  setEcoPreferred: (value: boolean) => void;
  setMinColor: (grade: string) => void;
  setMinClarity: (grade: string) => void;
  /** Derive slider ranges and available grades from the loaded dataset, clamping current values. */
  applyDatasetBounds: (meta: DatasetMeta) => void;
}

export const useCriteriaStore = create<CriteriaStore>((set) => ({
  ...DEFAULT_CRITERIA,
  bounds: INITIAL_BOUNDS,

  setBudget: (value) =>
    set((s) => ({ budget: clamp(value, s.bounds.budget.min, s.bounds.budget.max) })),
  setMinCarat: (value) =>
    set((s) => ({ minCarat: clamp(value, s.bounds.carat.min, s.bounds.carat.max) })),
  setPurpose: (purpose) => set({ purpose, weights: [...PRESETS[purpose]] }),
  setWeight: (index, value) =>
    set((s) => {
      const weights = [...s.weights] as Criteria["weights"];
      weights[index] = value;
      return { weights };
    }),
  setEcoPreferred: (ecoPreferred) => set({ ecoPreferred }),
  setMinColor: (minColor) => set({ minColor }),
  setMinClarity: (minClarity) => set({ minClarity }),

  applyDatasetBounds: (meta) =>
    set((s) => {
      const bMin = Math.floor(meta.minPrice / 1e6) * 1e6;
      const bMax = Math.ceil(meta.maxPrice);
      const cMin = Math.floor((meta.minCarat || 0) * 100) / 100;
      const cMax = Math.ceil((meta.maxCarat || 1) * 100) / 100;
      return {
        bounds: {
          budget: { min: bMin, max: bMax, step: 1_000_000 },
          carat: { min: cMin, max: cMax, step: 0.01 },
        },
        budget: clamp(s.budget, bMin, bMax),
        minCarat: clamp(s.minCarat, cMin, cMax),
        minColor: pickGrade(meta.colorGrades, s.minColor, DEFAULT_CRITERIA.minColor),
        minClarity: pickGrade(meta.clarityGrades, s.minClarity, DEFAULT_CRITERIA.minClarity),
      };
    }),
}));

/** Select just the engine input (no actions, no bounds) from the store. */
export const selectCriteria = (s: CriteriaStore): Criteria => ({
  budget: s.budget,
  minCarat: s.minCarat,
  purpose: s.purpose,
  weights: s.weights,
  ecoPreferred: s.ecoPreferred,
  minColor: s.minColor,
  minClarity: s.minClarity,
});
