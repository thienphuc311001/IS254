import { cn } from "@/shared/lib";
import type { DiamondOrigin } from "../model/types";

/** Small coloured circle used in legends and card headers. */
export function OriginDot({ origin, className }: { origin: DiamondOrigin; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-[9px] rounded-full",
        origin === "natural" ? "bg-gold" : "bg-teal",
        className,
      )}
    />
  );
}
