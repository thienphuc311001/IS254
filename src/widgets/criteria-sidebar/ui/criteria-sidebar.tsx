"use client";

import type { DatasetMeta } from "@/entities/diamond";
import { BudgetField } from "./budget-field";
import { CaratField } from "./carat-field";
import { EcoToggle } from "./eco-toggle";
import { GradeFields } from "./grade-fields";
import { PurposeField } from "./purpose-field";
import { divider } from "./styles";
import { WeightFields } from "./weight-fields";

/**
 * Left panel: budget, carat, purpose, 4 weights, eco toggle, color and clarity floors.
 * Each field subscribes to its own slice of the criteria store, so moving one slider
 * re-renders only that field.
 */
export function CriteriaSidebar({ meta }: { meta: DatasetMeta }) {
  return (
    <aside className="sticky top-5 flex flex-col gap-5">
      <div className="rounded-xs border border-line bg-panel px-5 py-5">
        <BudgetField />
        <CaratField />
        <PurposeField />

        <hr className={`${divider} mt-5`} />

        <div className="mt-5">
          <WeightFields />
        </div>
        <EcoToggle />

        <hr className={`${divider} mt-5`} />

        <div className="mt-5">
          <GradeFields meta={meta} />
        </div>
      </div>
    </aside>
  );
}
