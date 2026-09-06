"use client";

import { useCriteriaStore } from "@/features/configure-criteria";
import { Field } from "@/shared/ui/field";
import { PairedNumberInput } from "@/shared/ui/paired-number-input";
import { Slider } from "@/shared/ui/slider";
import { pairedRow } from "./styles";

export function CaratField() {
  const minCarat = useCriteriaStore((s) => s.minCarat);
  const bounds = useCriteriaStore((s) => s.bounds.carat);
  const setMinCarat = useCriteriaStore((s) => s.setMinCarat);

  return (
    <Field label="Carat tối thiểu" value={`${minCarat.toFixed(2)} ct`}>
      <div className={pairedRow}>
        <Slider
          value={[minCarat]}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          onValueChange={([v]) => setMinCarat(v)}
          aria-label="Carat tối thiểu"
        />
        <PairedNumberInput
          value={minCarat}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          onCommit={setMinCarat}
          aria-label="Nhập carat tối thiểu"
        />
      </div>
    </Field>
  );
}
