"use client";

import type { DatasetMeta, GradeOption } from "@/entities/diamond";
import { useCriteriaStore } from "@/features/configure-criteria";
import { Field } from "@/shared/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

/**
 * Option labels exactly as the legacy `populateGradeSelect` built them:
 * "D–F", "D–H", … and the lowest grade gets the "(mọi …)" suffix.
 */
function gradeLabel(grades: GradeOption[], i: number, prefix: string, everySuffix: string) {
  const isLowest = i === grades.length - 1;
  return isLowest ? `${prefix}${grades[i].grade}${everySuffix}` : `${prefix}${grades[i].grade}`;
}

function GradeSelect({
  label,
  value,
  onChange,
  grades,
  prefix,
  everySuffix,
}: {
  label: string;
  value: string;
  onChange: (grade: string) => void;
  grades: GradeOption[];
  prefix: string;
  everySuffix: string;
}) {
  return (
    <Field label={label} className="mb-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className="w-full rounded-xs border-line bg-panel-2 px-2.5 py-2 text-sm text-ink shadow-none data-[size=default]:h-auto focus-visible:border-gold focus-visible:ring-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xs border-line bg-panel-2 text-ink">
          {grades.map((g, i) => (
            <SelectItem key={g.grade} value={g.grade} className="text-sm">
              {gradeLabel(grades, i, prefix, everySuffix)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Color and clarity floors, side by side. Options come from the dataset, not a hard-coded list. */
export function GradeFields({ meta }: { meta: DatasetMeta }) {
  const minColor = useCriteriaStore((s) => s.minColor);
  const minClarity = useCriteriaStore((s) => s.minClarity);
  const setMinColor = useCriteriaStore((s) => s.setMinColor);
  const setMinClarity = useCriteriaStore((s) => s.setMinClarity);

  return (
    <div className="grid grid-cols-2 gap-3">
      <GradeSelect
        label="Màu tối thiểu"
        value={minColor}
        onChange={setMinColor}
        grades={meta.colorGrades}
        prefix="D–"
        everySuffix=" (mọi màu)"
      />
      <GradeSelect
        label="Độ tinh khiết"
        value={minClarity}
        onChange={setMinClarity}
        grades={meta.clarityGrades}
        prefix="FL–"
        everySuffix=" (mọi loại)"
      />
    </div>
  );
}
