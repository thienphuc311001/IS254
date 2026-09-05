import { expect, type Locator, type Page } from "@playwright/test";

export type PurposeLabel = "Nhẫn cưới" | "Tích trữ" | "Quà tặng / Cá nhân";

/**
 * Page object for the single DSS page. Every interaction goes through accessible
 * roles / labels so the tests read like the README demo steps.
 */
export class DssPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
    // The dataset loads client-side; wait until the results table exists.
    await this.page.getByText("Top 5 đề xuất").waitFor();
  }

  // ---- inputs -------------------------------------------------------------

  async choosePurpose(label: PurposeLabel) {
    await this.page.getByRole("radio", { name: label }).click();
  }

  async setBudget(vnd: number) {
    await this.fillNumber("Nhập ngân sách", vnd);
  }

  async setMinCarat(carat: number) {
    await this.fillNumber("Nhập carat tối thiểu", carat);
  }

  /** Pick the worst acceptable color, e.g. "J" → option "D–J". */
  async setMinColor(grade: string) {
    await this.pickGrade(0, new RegExp(`^D–${grade}( |$)`));
  }

  /** Pick the worst acceptable clarity, e.g. "SI2" → option "FL–SI2". */
  async setMinClarity(grade: string) {
    await this.pickGrade(1, new RegExp(`^FL–${grade}( |$)`));
  }

  async toggleEco() {
    await this.page.getByLabel("Ưu tiên thân thiện môi trường").click();
  }

  private async fillNumber(label: string, value: number) {
    const input = this.page.getByLabel(label);
    await input.fill(String(value));
    await input.press("Enter");
  }

  private async pickGrade(comboboxIndex: number, option: RegExp) {
    await this.page.getByRole("combobox").nth(comboboxIndex).click();
    await this.page.getByRole("option", { name: option }).click();
  }

  // ---- outputs ------------------------------------------------------------

  get verdict(): Locator {
    return this.page.locator("h2").first();
  }

  get rows(): Locator {
    return this.page.locator("tbody tr");
  }

  /** Texts of the "[R…]" rule flags currently shown in the banner. */
  async flags(): Promise<string[]> {
    return this.page.locator("span", { hasText: /^\[R\d\]/ }).allInnerTexts();
  }

  async flagIds(): Promise<string[]> {
    return (await this.flags()).map((t) => t.slice(1, 3));
  }

  /** Parsed Top-5 rows: [origin, shape, carat, color, clarity, cut, cert, price]. */
  async topRows() {
    const rows = await this.rows.all();
    return Promise.all(
      rows.map(async (row) => {
        const cells = await row.locator("td").allInnerTexts();
        return {
          origin: cells[1].includes("LGD") ? "lgd" : "natural",
          overpriced: cells[1].includes("giá cao"),
          shape: cells[2],
          carat: Number(cells[3]),
          color: cells[4],
          clarity: cells[5],
          cut: cells[6],
          cert: cells[7],
          price: Number(cells[8].replace(/\./g, "")),
        };
      }),
    );
  }

  async expectAllOrigin(origin: "natural" | "lgd") {
    const rows = await this.topRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.origin).toBe(origin);
  }
}
