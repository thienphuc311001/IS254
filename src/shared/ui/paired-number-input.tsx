"use client";

import * as React from "react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export interface PairedNumberInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onCommit: (value: number) => void;
  "aria-label": string;
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * Number box that sits next to a slider.
 *
 * - Not focused → shows the committed `value` (so slider moves are reflected immediately).
 * - Focused → shows what is being typed. A value inside [min, max] is applied at once
 *   (live preview); on blur / Enter the text is clamped into range and applied.
 *
 * This mirrors the `input` / `change` handlers of the legacy app.js without any
 * "reset state on prop change" bookkeeping: the draft only exists while editing.
 */
export function PairedNumberInput({
  value,
  min,
  max,
  step,
  onCommit,
  className,
  ...rest
}: PairedNumberInputProps) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const isEditing = draft !== null;

  const commit = () => {
    const n = Number(draft ?? value);
    if (Number.isFinite(n)) onCommit(clamp(n, min, max));
    setDraft(null);
  };

  return (
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={isEditing ? draft : String(value)}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        const n = Number(text);
        if (text !== "" && Number.isFinite(n) && n >= min && n <= max) onCommit(n);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "h-auto w-full rounded-lg border-line bg-panel-2 px-2 py-1.5 font-mono text-xs text-ink shadow-none focus-visible:border-gold focus-visible:ring-0 md:text-xs",
        className,
      )}
      {...rest}
    />
  );
}
