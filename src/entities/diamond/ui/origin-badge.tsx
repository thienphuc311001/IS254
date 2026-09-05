import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib";
import type { DiamondOrigin } from "../model/types";

export const ORIGIN_LABEL: Record<DiamondOrigin, string> = {
  natural: "Tự nhiên",
  lgd: "LGD",
};

/** Pill showing whether a stone is natural or lab-grown, coloured gold / teal. */
export function OriginBadge({ origin, className }: { origin: DiamondOrigin; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-[7px] py-[2px] font-mono text-[10.5px] font-normal tracking-[.03em]",
        origin === "natural"
          ? "border-gold/40 bg-gold/12 text-gold"
          : "border-teal/40 bg-teal/12 text-teal",
        className,
      )}
    >
      {ORIGIN_LABEL[origin]}
    </Badge>
  );
}
