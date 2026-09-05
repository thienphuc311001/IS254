"use client";

import type { DatasetMeta, GradeOption } from "@/entities/diamond";
import { PURPOSE_LABEL, PURPOSE_ORDER, type Purpose } from "@/entities/criteria";
import { useCriteriaStore } from "@/features/configure-criteria";
import { fmtVND } from "@/shared/lib";
import { Field } from "@/shared/ui/field";
import { Slider } from "@/shared/ui/slider";
import { PairedNumberInput } from "@/shared/ui/paired-number-input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Checkbox } from "@/shared/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

const WEIGHT_LABELS = [
  "Ưu tiên kích thước",
  "Ưu tiên giữ giá",
  "Ưu tiên chất lượng",
  "Ưu tiên môi trường 🌱",
] as const;

/** Build option labels like "D–F" with the last (lowest) grade reading "D–J (mọi màu)". */
function gradeLabel(grades: GradeOption[], index: number, prefix: string, everySuffix: string) {
  const isLowest = index === grades.length - 1;
  return `${prefix}${grades[index].grade}${isLowest ? everySuffix : ""}`;
}

function GradeSelect({
  value,
  onChange,
  grades,
  prefix,
  everySuffix,
}: {
  value: string;
  onChange: (grade: string) => void;
  grades: GradeOption[];
  prefix: string;
  everySuffix: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-auto w-full rounded-[2px] border-line bg-panel-2 px-[10px] py-2 text-[13px] text-ink shadow-none focus-visible:border-gold focus-visible:ring-0 data-[size=default]:h-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-[2px] border-line bg-panel-2 text-ink">
        {grades.map((g, i) => (
          <SelectItem key={g.grade} value={g.grade} className="text-[13px] focus:bg-panel focus:text-ink">
            {gradeLabel(grades, i, prefix, everySuffix)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const Divider = () => <hr className="my-[2px] border-0 border-t border-line" />;

/** Left panel: budget, carat, purpose, 4 weights, eco toggle, color and clarity floors. */
export function CriteriaSidebar({ meta }: { meta: DatasetMeta }) {
  const s = useCriteriaStore();

  return (
    <aside className="sticky top-5 flex flex-col gap-[22px]">
      <div className="rounded-[2px] border border-line bg-panel px-5 py-[22px]">
        <Field label="Ngân sách" value={`${fmtVND(s.budget)} đ`}>
          <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-[10px]">
            <Slider
              value={[s.budget]}
              min={s.bounds.budget.min}
              max={s.bounds.budget.max}
              step={s.bounds.budget.step}
              onValueChange={([v]) => s.setBudget(v)}
              aria-label="Ngân sách"
            />
            <PairedNumberInput
              value={s.budget}
              min={s.bounds.budget.min}
              max={s.bounds.budget.max}
              step={s.bounds.budget.step}
              onCommit={s.setBudget}
              aria-label="Nhập ngân sách"
            />
          </div>
        </Field>

        <Field label="Carat tối thiểu" value={`${s.minCarat.toFixed(2)} ct`}>
          <div className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-[10px]">
            <Slider
              value={[s.minCarat]}
              min={s.bounds.carat.min}
              max={s.bounds.carat.max}
              step={s.bounds.carat.step}
              onValueChange={([v]) => s.setMinCarat(v)}
              aria-label="Carat tối thiểu"
            />
            <PairedNumberInput
              value={s.minCarat}
              min={s.bounds.carat.min}
              max={s.bounds.carat.max}
              step={s.bounds.carat.step}
              onCommit={s.setMinCarat}
              aria-label="Nhập carat tối thiểu"
            />
          </div>
        </Field>

        <Field label="Mục đích">
          <ToggleGroup
            type="single"
            value={s.purpose}
            // Radix reports "" when the active item is clicked again. The legacy UI
            // re-applied the preset on every click, so we do the same instead of deselecting.
            onValueChange={(v) => s.setPurpose((v || s.purpose) as Purpose)}
            className="w-full overflow-hidden rounded-[2px] border border-line"
          >
            {PURPOSE_ORDER.map((p) => (
              <ToggleGroupItem
                key={p}
                value={p}
                className="h-auto min-w-0 flex-1 rounded-none border-r border-line px-1.5 py-[9px] text-[12px] leading-tight font-normal whitespace-normal text-ink-dim last:border-r-0 hover:bg-panel-2 hover:text-ink data-[state=on]:bg-gold data-[state=on]:font-semibold data-[state=on]:text-[#15130A] data-[state=on]:hover:bg-gold"
              >
                {PURPOSE_LABEL[p]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Divider />

        <div className="mt-[22px]">
          {WEIGHT_LABELS.map((label, i) => (
            <Field key={label} label={label} value={stars(s.weights[i])}>
              <Slider
                value={[s.weights[i]]}
                min={0}
                max={5}
                step={1}
                onValueChange={([v]) => s.setWeight(i as 0 | 1 | 2 | 3, v)}
                aria-label={label}
              />
            </Field>
          ))}
        </div>

        <label
          htmlFor="ecoPreferred"
          className="mt-[14px] flex cursor-pointer items-center gap-[9px] text-[13px] text-ink-dim"
        >
          <Checkbox
            id="ecoPreferred"
            checked={s.ecoPreferred}
            onCheckedChange={(v) => s.setEcoPreferred(v === true)}
            className="size-4 rounded-[3px] border-ink-dim data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=checked]:text-background"
          />
          <span>Ưu tiên thân thiện môi trường</span>
        </label>

        <Divider />

        <div className="mt-[22px] grid grid-cols-2 gap-3">
          <Field label="Màu tối thiểu" className="mb-0">
            <GradeSelect
              value={s.minColor}
              onChange={s.setMinColor}
              grades={meta.colorGrades}
              prefix="D–"
              everySuffix=" (mọi màu)"
            />
          </Field>
          <Field label="Độ tinh khiết" className="mb-0">
            <GradeSelect
              value={s.minClarity}
              onChange={s.setMinClarity}
              grades={meta.clarityGrades}
              prefix="FL–"
              everySuffix=" (mọi loại)"
            />
          </Field>
        </div>
      </div>
    </aside>
  );
}
