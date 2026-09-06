"use client";

import { useCriteriaStore } from "@/features/configure-criteria";
import { fmtVND } from "@/shared/lib";
import { Field } from "@/shared/ui/field";
import { PairedNumberInput } from "@/shared/ui/paired-number-input";
import { Slider } from "@/shared/ui/slider";
import { pairedRow } from "./styles";

export function BudgetField() {
  const budget = useCriteriaStore((s) => s.budget);
  const bounds = useCriteriaStore((s) => s.bounds.budget);
  const setBudget = useCriteriaStore((s) => s.setBudget);

  return (
    <Field label="Ngân sách" value={`${fmtVND(budget)} đ`}>
      <div className={pairedRow}>
        <Slider
          value={[budget]}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          onValueChange={([v]) => setBudget(v)}
          aria-label="Ngân sách"
        />
        <PairedNumberInput
          value={budget}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          onCommit={setBudget}
          aria-label="Nhập ngân sách"
        />
      </div>
    </Field>
  );
}
