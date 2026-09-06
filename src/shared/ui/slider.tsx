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
        "relative flex w-full touch-none items-center select-none py-1.5 data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-0.5 w-full grow overflow-hidden bg-line"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-line" />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-3 shrink-0 cursor-pointer rounded-full border-2 border-background bg-ink ring-1 ring-ink-dim transition-shadow focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-hidden disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
