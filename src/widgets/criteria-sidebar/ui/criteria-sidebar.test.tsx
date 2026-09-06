import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { buildMeta, makeDiamond } from "@/entities/diamond";
import { DEFAULT_CRITERIA, PRESETS } from "@/entities/criteria";
import { useCriteriaStore } from "@/features/configure-criteria";
import { CriteriaSidebar } from "./criteria-sidebar";

const meta = buildMeta([
  makeDiamond({ color: "D", colorCode: 10, clarity: "IF", clarityCode: 7, price: 5_000_000, carat: 0.3 }),
  makeDiamond({ color: "F", colorCode: 8, clarity: "VS2", clarityCode: 3 }),
  makeDiamond({ color: "J", colorCode: 4, clarity: "SI2", clarityCode: 1, price: 900_000_000, carat: 3 }),
]);

beforeEach(() => {
  useCriteriaStore.setState({ ...DEFAULT_CRITERIA });
  useCriteriaStore.getState().applyDatasetBounds(meta);
});

describe("CriteriaSidebar", () => {
  test("renders the legacy defaults: 60M budget, 0.50 ct, wedding, F / VS2, stars 4/2/3/1", () => {
    render(<CriteriaSidebar meta={meta} />);
    expect(screen.getByText("60.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("0.50 ct")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Nhẫn cưới" })).toHaveAttribute("data-state", "on");
    expect(screen.getByText("★★★★☆")).toBeInTheDocument(); // size 4
    expect(screen.getByText("★☆☆☆☆")).toBeInTheDocument(); // env 1
    expect(screen.getByRole("combobox", { name: "Màu tối thiểu" })).toHaveTextContent("D–F");
    expect(screen.getByRole("combobox", { name: "Độ tinh khiết" })).toHaveTextContent("FL–VS2");
  });

  test("choosing a purpose applies its weight preset to the store and the stars", async () => {
    const user = userEvent.setup();
    render(<CriteriaSidebar meta={meta} />);
    await user.click(screen.getByRole("radio", { name: "Tích trữ" }));
    expect(useCriteriaStore.getState().purpose).toBe("invest");
    expect(useCriteriaStore.getState().weights).toEqual(PRESETS.invest);
    expect(screen.getByText("★★★★★")).toBeInTheDocument(); // finance 5
  });

  test("clicking the already-active purpose re-applies its preset (legacy behaviour)", async () => {
    const user = userEvent.setup();
    render(<CriteriaSidebar meta={meta} />);
    expect(useCriteriaStore.getState().weights).toEqual([4, 2, 3, 1]);
    await user.click(screen.getByRole("radio", { name: "Nhẫn cưới" }));
    expect(useCriteriaStore.getState().purpose).toBe("wedding");
    expect(useCriteriaStore.getState().weights).toEqual(PRESETS.wedding);
  });

  test("eco checkbox toggles ecoPreferred", async () => {
    const user = userEvent.setup();
    render(<CriteriaSidebar meta={meta} />);
    await user.click(screen.getByLabelText("Ưu tiên thân thiện môi trường"));
    expect(useCriteriaStore.getState().ecoPreferred).toBe(true);
  });

  test("typing a budget in the number box updates the store and the gold value label", async () => {
    const user = userEvent.setup();
    render(<CriteriaSidebar meta={meta} />);
    const box = screen.getByLabelText("Nhập ngân sách");
    await user.clear(box);
    await user.type(box, "25000000{Enter}");
    expect(useCriteriaStore.getState().budget).toBe(25_000_000);
    expect(screen.getByText("25.000.000 đ")).toBeInTheDocument();
  });
});
