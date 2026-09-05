import { OriginDot, type Diamond } from "@/entities/diamond";
import type { RankedDiamond } from "@/features/rank-diamonds";
import { fmtTrieu } from "@/shared/lib";
import { Caption, SectionTitle } from "@/shared/ui/field";

const W = 1160;
const H = 380;
const PAD = { l: 54, r: 20, t: 16, b: 34 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;

const GRID = "#1D2129";
const TICK = "#5B626D";
const GOLD = "#C9A24B";
const TEAL = "#4FD1C5";
const CORAL = "#E8664A";
const INK = "#E9ECEF";

const idOf = (d: Diamond) => d.link + d.carat + d.price + d.store;

export interface MarketLoupeProps {
  data: Diamond[];
  filtered: Diamond[];
  top5: RankedDiamond[];
  budget: number;
  minCarat: number;
}

/**
 * Scatter plot of the whole market: carat (x, linear) × price (y, log10).
 * Faded points are outside the current filter; ringed points are the Top 5.
 * Axes are derived from the data range, never hard-coded.
 */
export function MarketLoupe({ data, filtered, top5, budget, minCarat }: MarketLoupeProps) {
  const prices = data.map((d) => d.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const maxCarat = Math.max(1, Math.ceil(Math.max(...data.map((d) => d.carat || 0))));
  const minPriceLog = Math.log10(minPrice || 1);
  const maxPriceLog = maxPrice > minPrice ? Math.log10(maxPrice) : minPriceLog + 1;

  const x = (c: number) => PAD.l + (c / maxCarat) * PLOT_W;
  const y = (p: number) =>
    PAD.t +
    PLOT_H -
    ((Math.log10(Math.max(p, minPrice)) - minPriceLog) / (maxPriceLog - minPriceLog)) * PLOT_H;

  const filteredIds = new Set(filtered.map(idOf));
  const top5Ids = new Set(top5.map(idOf));

  // Carat gridlines at a "nice" step for the data range.
  const caratStep = maxCarat <= 2 ? 0.25 : maxCarat <= 5 ? 0.5 : 1;
  const caratTicks: number[] = [];
  for (let c = 0; c <= maxCarat + 1e-9; c += caratStep) caratTicks.push(Math.round(c * 100) / 100);

  // Price gridlines at 1-2-3-5 × 10ⁿ inside the data range.
  const priceTicks: number[] = [];
  for (let exp = Math.floor(minPriceLog); exp <= Math.ceil(maxPriceLog); exp++) {
    for (const m of [1, 2, 3, 5]) {
      const t = m * Math.pow(10, exp);
      if (t >= minPrice && t <= maxPrice) priceTicks.push(t);
    }
  }

  const budgetY = y(Math.min(budget, maxPrice));
  const caratX = x(Math.min(minCarat, maxCarat));

  return (
    <section className="mb-5 rounded-[2px] border border-line bg-panel px-5 pt-5 pb-[10px]">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1.5">
        <SectionTitle>Bản đồ thị trường — Carat × Giá (thang log)</SectionTitle>
        <div className="flex gap-4 text-[11.5px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <OriginDot origin="natural" className="size-2" />
            Tự nhiên
          </span>
          <span className="inline-flex items-center gap-1.5">
            <OriginDot origin="lgd" className="size-2" />
            Nhân tạo LGD
          </span>
          <span className="text-coral">┅ Ngân sách</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Bản đồ thị trường carat và giá">
        {caratTicks.map((c) => (
          <g key={`c${c}`}>
            <line x1={x(c)} y1={PAD.t} x2={x(c)} y2={PAD.t + PLOT_H} stroke={GRID} strokeWidth={1} />
            <text x={x(c)} y={H - 12} fill={TICK} fontSize={10} textAnchor="middle" className="font-mono">
              {c}ct
            </text>
          </g>
        ))}
        {priceTicks.map((p) => (
          <g key={`p${p}`}>
            <line x1={PAD.l} y1={y(p)} x2={W - PAD.r} y2={y(p)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.l - 8} y={y(p) + 3} fill={TICK} fontSize={10} textAnchor="end" className="font-mono">
              {fmtTrieu(p)}
            </text>
          </g>
        ))}

        <line x1={PAD.l} y1={budgetY} x2={W - PAD.r} y2={budgetY} stroke={CORAL} strokeWidth={1.3} strokeDasharray="4 4" />
        {minCarat > 0 && (
          <line x1={caratX} y1={PAD.t} x2={caratX} y2={PAD.t + PLOT_H} stroke={CORAL} strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
        )}

        {data.map((d, i) => {
          const key = idOf(d);
          const inFilter = filteredIds.has(key);
          const inTop5 = top5Ids.has(key);
          return (
            <circle
              key={`${key}-${i}`}
              cx={x(Math.min(d.carat, maxCarat))}
              cy={y(d.price)}
              r={inTop5 ? 6 : 3}
              fill={d.origin === "natural" ? GOLD : TEAL}
              fillOpacity={inFilter ? 0.85 : 0.12}
              stroke={inTop5 ? INK : undefined}
              strokeWidth={inTop5 ? 1.5 : undefined}
            />
          );
        })}
      </svg>

      <Caption className="px-[2px] pt-2 pb-[14px]">
        Mỗi điểm là một viên kim cương trong dữ liệu. Điểm mờ nằm ngoài bộ lọc hiện tại; điểm sáng
        viền trắng là 5 lựa chọn được xếp hạng cao nhất bên dưới.
      </Caption>
    </section>
  );
}
