import * as React from "react";
import { cn } from "@/shared/lib/utils";

/** A labelled sidebar control. `value` renders right-aligned in gold mono text. */
export function Field({
  label,
  value,
  className,
  children,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mb-[22px] last:mb-0", className)}>
      <div className="mb-[10px] flex items-baseline justify-between text-[11.5px] uppercase tracking-[.08em] text-ink-dim">
        <span>{label}</span>
        {value !== undefined && (
          <span className="font-mono text-[12.5px] tracking-normal text-gold">{value}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Small uppercase mono heading used above charts, tables and card groups. */
export function SectionTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-mono text-[12px] uppercase tracking-[.06em] text-ink-dim",
        className,
      )}
      {...props}
    />
  );
}

/** Muted caption paragraph. */
export function Caption({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-[11.5px] text-ink-faint", className)} {...props} />;
}
