import { OriginBadge } from "@/entities/diamond";
import type { RankedDiamond } from "@/features/rank-diamonds";
import { fmtVND } from "@/shared/lib";
import { Badge } from "@/shared/ui/badge";
import { SectionTitle } from "@/shared/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

const HEADERS = [
  "#", "Loại", "Dáng", "Carat", "Màu", "Độ trong",
  "Giác cắt", "Chứng nhận", "Giá (VNĐ)", "Điểm số", "Cửa hàng", "",
];

const dash = (v: string) => v || "—";

function ScoreBar({ score, origin }: { score: number; origin: RankedDiamond["origin"] }) {
  const pct = (score * 100).toFixed(0);
  return (
    <>
      <span className="mr-1.5 inline-block h-1 w-[60px] overflow-hidden rounded-[2px] bg-line align-middle">
        <i
          className={`block h-full ${origin === "natural" ? "bg-gold" : "bg-teal"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      {pct}
    </>
  );
}

const th =
  "h-auto whitespace-nowrap border-b border-line px-3.5 py-2.5 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.06em] text-ink-faint";
const td = "whitespace-nowrap border-b border-line px-3.5 py-3 text-ink-dim";

export interface ResultsTableProps {
  top5: RankedDiamond[];
  matchCount: number;
  total: number;
}

/** "Top 5 đề xuất": the final ranked shortlist with badges, score bars and store links. */
export function ResultsTable({ top5, matchCount, total }: ResultsTableProps) {
  return (
    <section className="overflow-hidden rounded-[2px] border border-line bg-panel">
      <div className="border-b border-line px-5 pt-[18px] pb-3">
        <SectionTitle className="mb-1">Top 5 đề xuất</SectionTitle>
        <p className="m-0 text-[12px] text-ink-faint">
          {matchCount} viên khớp bộ lọc trong tổng số {total} · hiển thị 5 điểm cao nhất
        </p>
      </div>
      <Table className="text-[12.5px]">
        <TableHeader>
          <TableRow className="border-0 hover:bg-transparent">
            {HEADERS.map((h, i) => (
              <TableHead key={i} className={th}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!top5.length ? (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={12} className="px-5 py-10 text-center text-[13px] text-ink-faint">
                Không tìm thấy kim cương phù hợp — hãy điều chỉnh bộ lọc bên trái.
              </TableCell>
            </TableRow>
          ) : (
            top5.map((d, i) => (
              <TableRow key={d.key} className="border-0 last:[&>td]:border-b-0 hover:bg-panel-2">
                <TableCell className={`${td} font-serif text-[16px] text-ink-faint`}>{i + 1}</TableCell>
                <TableCell className={td}>
                  <OriginBadge origin={d.origin} />
                  {d.flagOverpriced && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="ml-[3px] cursor-help rounded-[12px] border-coral/30 bg-coral/10 px-[5px] py-px align-middle font-mono text-[9.5px] font-normal tracking-[.02em] text-coral"
                        >
                          giá cao
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Giá trên mỗi carat cao hơn mặt bằng chung (R2)</TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell className={td}>{dash(d.shape)}</TableCell>
                <TableCell className={td}>{d.carat.toFixed(2)}</TableCell>
                <TableCell className={td}>{dash(d.color)}</TableCell>
                <TableCell className={td}>{dash(d.clarity)}</TableCell>
                <TableCell className={td}>{dash(d.cut)}</TableCell>
                <TableCell className={td}>{dash(d.cert)}</TableCell>
                <TableCell className={`${td} font-mono text-ink`}>{fmtVND(d.price)}</TableCell>
                <TableCell className={td}>
                  <ScoreBar score={d.score} origin={d.origin} />
                </TableCell>
                <TableCell className={td}>{d.store}</TableCell>
                <TableCell className={td}>
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[2px] border border-line px-2.5 py-[5px] font-mono text-[11.5px] text-ink no-underline transition-colors hover:border-gold hover:text-gold"
                  >
                    Xem →
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
