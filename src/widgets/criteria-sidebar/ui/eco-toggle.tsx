"use client";

import { useCriteriaStore } from "@/features/configure-criteria";
import { Checkbox } from "@/shared/ui/checkbox";

export function EcoToggle() {
  const ecoPreferred = useCriteriaStore((s) => s.ecoPreferred);
  const setEcoPreferred = useCriteriaStore((s) => s.setEcoPreferred);

  return (
    <label
      htmlFor="ecoPreferred"
      className="mt-3.5 flex cursor-pointer items-center gap-2 text-sm text-ink-dim"
    >
      <Checkbox
        id="ecoPreferred"
        checked={ecoPreferred}
        onCheckedChange={(c) => setEcoPreferred(c === true)}
        className="size-4 rounded-xs border-ink-dim data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=checked]:text-background"
      />
      <span>Ưu tiên thân thiện môi trường</span>
    </label>
  );
}
