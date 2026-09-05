import { expect, test } from "@playwright/test";
import { DssPage } from "./dss-page";

test.describe("page loads", () => {
  test("shows dataset counts derived from data_ready.xlsx", async ({ page }) => {
    const dss = new DssPage(page);
    await dss.goto();

    await expect(page).toHaveTitle("DSS Diamond");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DSS Diamond");
    await expect(page.getByText("763 viên đã ghi nhận")).toBeVisible();
    await expect(page.getByText("645 Tự nhiên")).toBeVisible();
    await expect(page.getByText("118 Nhân tạo LGD")).toBeVisible();
    await expect(page.getByText(/Nguồn dữ liệu: .*tierra\.vn/)).toBeVisible();
  });

  test("default state matches the legacy defaults", async ({ page }) => {
    const dss = new DssPage(page);
    await dss.goto();

    await expect(page.getByLabel("Nhập ngân sách")).toHaveValue("60000000");
    await expect(page.getByLabel("Nhập carat tối thiểu")).toHaveValue("0.5");
    await expect(page.getByRole("radio", { name: "Nhẫn cưới" })).toHaveAttribute("data-state", "on");
    await expect(page.getByRole("combobox").nth(0)).toContainText("D–F");
    await expect(page.getByRole("combobox").nth(1)).toContainText("FL–VS2");
    await expect(dss.rows).toHaveCount(5);
    await expect(page.getByText(/viên khớp bộ lọc trong tổng số 763/)).toBeVisible();
  });

  test("grade dropdowns list every grade present in the data, best → worst", async ({ page }) => {
    const dss = new DssPage(page);
    await dss.goto();

    await page.getByRole("combobox").nth(0).click();
    const colors = await page.getByRole("option").allInnerTexts();
    expect(colors[0]).toBe("D–D");
    expect(colors.at(-1)).toMatch(/\(mọi màu\)$/);
    await page.keyboard.press("Escape");

    await page.getByRole("combobox").nth(1).click();
    const clarities = await page.getByRole("option").allInnerTexts();
    expect(clarities[0]).toBe("FL–FL");
    expect(clarities.at(-1)).toMatch(/\(mọi loại\)$/);
  });

  test("an impossible filter shows the empty state", async ({ page }) => {
    const dss = new DssPage(page);
    await dss.goto();

    await dss.setBudget(3_000_000);
    await dss.setMinCarat(3);
    await expect(dss.verdict).toHaveText("Chưa có kết quả");
    await expect(page.getByText("Không tìm thấy kim cương phù hợp")).toBeVisible();
  });
});
