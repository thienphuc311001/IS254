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
    <div className={cn("mb-5 last:mb-0", className)}>
      <div className="mb-2.5 flex items-baseline justify-between text-xs uppercase tracking-wider text-ink-dim">
        <span>{label}</span>
        {value !== undefined && (
          <span className="font-mono text-sm tracking-normal text-gold">{value}</span>
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
        "font-mono text-xs uppercase tracking-wider text-ink-dim",
        className,
      )}
      {...props}
    />
  );
}

/** Muted caption paragraph. */
export function Caption({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-xs text-ink-faint", className)} {...props} />;
}
