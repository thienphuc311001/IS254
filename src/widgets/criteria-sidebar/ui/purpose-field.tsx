"use client";

import { PURPOSE_LABEL, PURPOSE_ORDER, type Purpose } from "@/entities/criteria";
import { useCriteriaStore } from "@/features/configure-criteria";
import { Field } from "@/shared/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

export function PurposeField() {
  const purpose = useCriteriaStore((s) => s.purpose);
  const setPurpose = useCriteriaStore((s) => s.setPurpose);

  return (
    <Field label="Mục đích">
      <ToggleGroup
        type="single"
        value={purpose}
        // Radix reports "" when the active item is clicked again. The legacy UI
        // re-applied the preset on every click, so we do the same instead of deselecting.
        onValueChange={(v) => setPurpose((v || purpose) as Purpose)}
        className="w-full overflow-hidden rounded-xs border border-line"
      >
        {PURPOSE_ORDER.map((p) => (
          <ToggleGroupItem
            key={p}
            value={p}
            className="h-auto min-w-0 flex-1 rounded-none border-r border-line px-1.5 py-2 text-xs leading-tight font-normal whitespace-normal text-ink-dim transition-colors last:border-r-0 hover:bg-panel-2 hover:text-ink data-[state=on]:bg-gold data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
          >
            {PURPOSE_LABEL[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}
