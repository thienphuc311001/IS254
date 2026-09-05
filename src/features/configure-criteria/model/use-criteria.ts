"use client";

import { useShallow } from "zustand/react/shallow";
import type { Criteria } from "@/entities/criteria";
import { selectCriteria, useCriteriaStore } from "./store";

/** Current engine input. Re-renders only when one of the criteria fields changes. */
export function useCriteria(): Criteria {
  return useCriteriaStore(useShallow(selectCriteria));
}
