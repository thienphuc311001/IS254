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
 * While typing, a value inside [min, max] is applied immediately (live preview);
 * on blur / Enter the value is clamped into range and applied.
 * Mirrors the `input` / `change` handlers of the legacy app.js.
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
      value={draft ?? String(value)}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        const n = Number(text);
        if (Number.isFinite(n) && text !== "" && n >= min && n <= max) onCommit(n);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className={cn(
        "h-auto w-full rounded-lg border-line bg-panel-2 px-2 py-1.5 font-mono text-[12px] text-ink shadow-none focus-visible:border-gold focus-visible:ring-0 md:text-[12px]",
        className,
      )}
      {...rest}
    />
  );
}
