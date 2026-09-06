import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { makeDiamond } from "@/entities/diamond";
import { makeCriteria } from "@/entities/criteria";
import { compute } from "@/features/rank-diamonds";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ResultsTable } from "./results-table";

const renderTable = (props: React.ComponentProps<typeof ResultsTable>) =>
  render(
    <TooltipProvider>
      <ResultsTable {...props} />
    </TooltipProvider>,
  );

describe("ResultsTable", () => {
  test("empty shortlist → single explanatory row and match-count line", () => {
    renderTable({ top5: [], matchCount: 0, total: 763 });
    expect(screen.getByText("0 viên khớp bộ lọc trong tổng số 763 · hiển thị 5 điểm cao nhất")).toBeInTheDocument();
    expect(screen.getByText(/Không tìm thấy kim cương phù hợp/)).toBeInTheDocument();
  });

  test("renders one row per stone with rank, badge, formatted price, score and link", () => {
    // Budget < 100M keeps R3 inactive so both stones stay in the shortlist.
    const { top5 } = compute(makeCriteria({ budget: 50_000_000 }), [
      makeDiamond({ key: "fair", carat: 2, price: 40_000_000, store: "tierra.vn", link: "https://x/fair" }),
      makeDiamond({ key: "lgd", origin: "lgd", carat: 1, price: 40_000_000, resale: 0.6, cert: "Không rõ", certCode: 0 }),
    ]);
    renderTable({ top5, matchCount: 2, total: 2 });

    const rows = screen.getAllByRole("row").slice(1); // skip header
    expect(rows).toHaveLength(2);

    const first = within(rows[0]);
    expect(first.getByText("1")).toBeInTheDocument();
    expect(first.getByText("Tự nhiên")).toBeInTheDocument();
    expect(first.getByText("40.000.000")).toBeInTheDocument();
    expect(first.getByRole("link", { name: "Xem →" })).toHaveAttribute("href", "https://x/fair");
    expect(first.getByRole("link")).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  test("R2-tagged stones carry the 'giá cao' badge, others do not", () => {
    const { top5 } = compute(makeCriteria({ budget: 120_000_000 }), [
      makeDiamond({ key: "pricey", carat: 0.5, price: 100_000_000 }),
      makeDiamond({ key: "fair", carat: 2, price: 100_000_000 }),
    ]);
    renderTable({ top5, matchCount: 2, total: 2 });
    expect(screen.getAllByText("giá cao")).toHaveLength(1);
  });
});
