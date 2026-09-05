"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { Slider as SliderPrimitive } from "radix-ui"

/**
 * shadcn/ui Slider restyled to the legacy look: a 2px line track and a 13px
 * ink-coloured thumb with a thin ring (see legacy style.css `input[type=range]`).
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none py-[6px] data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-[2px] w-full grow overflow-hidden bg-line"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-line" />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-[13px] shrink-0 cursor-pointer rounded-full border-2 border-background bg-ink shadow-[0_0_0_1px_var(--ink-dim)] transition-[box-shadow] focus-visible:shadow-[0_0_0_2px_var(--gold)] focus-visible:outline-hidden disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
