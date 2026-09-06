import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { buildMeta, makeDiamond } from "@/entities/diamond";
import { makeCriteria } from "@/entities/criteria";
import { compute } from "@/features/rank-diamonds";
import { RecommendationBanner } from "./recommendation-banner";

const renderWith = (criteria = makeCriteria(), data = [makeDiamond()]) => {
  const result = compute(criteria, data);
  render(<RecommendationBanner result={result} meta={buildMeta(data)} />);
  return result;
};

describe("RecommendationBanner", () => {
  test("empty result → 'Chưa có kết quả' with guidance", () => {
    renderWith(makeCriteria({ budget: 1_000 }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Chưa có kết quả");
    expect(screen.getByText(/Hãy tăng ngân sách/)).toBeInTheDocument();
  });

  test("natural GIA leader → 'Kim cương Tự nhiên' verdict", () => {
    renderWith(makeCriteria(), [makeDiamond({ certCode: 3 })]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Kim cương Tự nhiên");
  });

  test("R1 override → LGD verdict, resale percentages from the dataset, and the [R1] flag", () => {
    const data = [
      makeDiamond({ key: "lgd", origin: "lgd", resale: 0.6, certCode: 0 }),
      makeDiamond({ key: "nat-too-pricey", price: 90_000_000 }),
    ];
    renderWith(makeCriteria({ budget: 20_000_000 }), data);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Kim cương Nhân tạo (LGD)");
    expect(screen.getByText(/~60% so với 90%/)).toBeInTheDocument();
    expect(screen.getByText(/^\[R1\]/)).toHaveTextContent("hệ thống ghi đè gợi ý sang LGD");
    expect(screen.queryByText("Eco override · R4")).not.toBeInTheDocument();
  });

  test("eco equivalence → the R4 eco banner is shown", () => {
    const data = [
      makeDiamond({ key: "natural-top", resale: 0.65, colorCode: 9, clarityCode: 7 }),
      makeDiamond({ key: "lgd-close", origin: "lgd", carat: 0.995, resale: 0.5851, colorCode: 10, clarityCode: 8 }),
      makeDiamond({ key: "outlier", origin: "lgd", carat: 6, resale: 0, cutCode: 2, certCode: 0 }),
    ];
    const result = renderWith(
      makeCriteria({ budget: 20_000_000, ecoPreferred: true, weights: [5, 5, 0, 0] }),
      data,
    );
    expect(result.ecoOverride).toBe(true);
    expect(screen.getByText("Eco override · R4")).toBeInTheDocument();
  });
});
