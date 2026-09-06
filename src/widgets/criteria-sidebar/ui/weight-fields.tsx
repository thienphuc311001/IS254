"use client";

import { useCriteriaStore } from "@/features/configure-criteria";
import { Field } from "@/shared/ui/field";
import { Slider } from "@/shared/ui/slider";

type WeightIndex = 0 | 1 | 2 | 3;

const WEIGHT_LABELS: Record<WeightIndex, string> = {
  0: "Ưu tiên kích thước",
  1: "Ưu tiên giữ giá",
  2: "Ưu tiên chất lượng",
  3: "Ưu tiên môi trường 🌱",
};

/** "★★★☆☆" for a 0–5 slider value, exactly as the legacy UI rendered it. */
export const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

function WeightField({ index }: { index: WeightIndex }) {
  const weight = useCriteriaStore((s) => s.weights[index]);
  const setWeight = useCriteriaStore((s) => s.setWeight);
  const label = WEIGHT_LABELS[index];

  return (
    <Field label={label} value={stars(weight)}>
      <Slider
        value={[weight]}
        min={0}
        max={5}
        step={1}
        onValueChange={([v]) => setWeight(index, v)}
        aria-label={label}
      />
    </Field>
  );
}

/** The four WSM weight sliders. Each subscribes only to its own weight. */
export function WeightFields() {
  return (
    <>
      <WeightField index={0} />
      <WeightField index={1} />
      <WeightField index={2} />
      <WeightField index={3} />
    </>
  );
}
