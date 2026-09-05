/**
 * The 5 demo use cases from README.md, driven through the real UI.
 * The engine-level equivalents live in src/features/rank-diamonds/model/golden-use-cases.test.ts;
 * these specs prove the sidebar controls are wired to that engine.
 */
import { expect, test } from "@playwright/test";
import { DssPage } from "./dss-page";

test("UC1 · budget 25M, ≥ 1 ct → R1 overrides to LGD", async ({ page }) => {
  const dss = new DssPage(page);
  await dss.goto();

  await dss.choosePurpose("Nhẫn cưới");
  await dss.setBudget(25_000_000);
  await dss.setMinCarat(1.0);
  await dss.setMinColor("J");
  await dss.setMinClarity("SI2");

  await expect(dss.verdict).toHaveText("Kim cương Nhân tạo (LGD)");
  expect(await dss.flagIds()).toEqual(["R1"]);
  expect((await dss.flags())[0]).toContain("hệ thống ghi đè gợi ý sang LGD");
  await dss.expectAllOrigin("lgd");

  const [top] = await dss.topRows();
  expect(top).toMatchObject({ carat: 1.73, color: "E", clarity: "VS1", price: 6_500_000 });
});

test("UC2 · wedding, 120M, ≥ 1.20 ct → R4 swaps Top 1 to a brighter stone, R3 keeps GIA", async ({ page }) => {
  const dss = new DssPage(page);
  await dss.goto();

  await dss.choosePurpose("Nhẫn cưới");
  await dss.setBudget(120_000_000);
  await dss.setMinCarat(1.2);
  await dss.setMinColor("J");
  await dss.setMinClarity("VS2");

  expect(await dss.flagIds()).toEqual(expect.arrayContaining(["R3", "R4"]));
  const rows = await dss.topRows();
  expect(rows[0]).toMatchObject({ carat: 1.22, color: "H", clarity: "VS2", cert: "GIA", price: 108_000_000 });
  for (const r of rows) expect(r.cert).toBe("GIA");
});

test("UC3 · investment, 150M → R3 prefers natural GIA", async ({ page }) => {
  const dss = new DssPage(page);
  await dss.goto();

  await dss.choosePurpose("Tích trữ");
  await dss.setBudget(150_000_000);
  await dss.setMinCarat(0.5);
  await dss.setMinColor("F");
  await dss.setMinClarity("VS2");

  await expect(dss.verdict).toHaveText("Kim cương Tự nhiên");
  expect(await dss.flagIds()).toEqual(["R3"]);
  const rows = await dss.topRows();
  expect(rows).toHaveLength(5);
  for (const r of rows) expect(r).toMatchObject({ origin: "natural", cert: "GIA" });
  expect(rows[0]).toMatchObject({ carat: 0.5, color: "D", clarity: "VS1", price: 29_900_000 });
});

test("UC4 · 800M, ≥ 2 ct → R2 tags every remaining stone 'giá cao'", async ({ page }) => {
  const dss = new DssPage(page);
  await dss.goto();

  await dss.choosePurpose("Nhẫn cưới");
  await dss.setBudget(800_000_000);
  await dss.setMinCarat(2.0);
  await dss.setMinColor("F");
  await dss.setMinClarity("VS2");

  const rows = await dss.topRows();
  expect(rows).toHaveLength(2);
  for (const r of rows) expect(r.overpriced).toBe(true);
  expect(rows.find((r) => r.carat === 2.01)).toMatchObject({ color: "D", price: 678_000_000 });
  expect(await dss.flagIds()).toContain("R3");

  // The R2 badge explains itself on hover.
  await page.getByText("giá cao").first().hover();
  await expect(page.getByRole("tooltip")).toContainText("(R2)");
});

test("UC5 · gift, 120M: eco toggle flips the Top 5 from natural GIA to all LGD", async ({ page }) => {
  const dss = new DssPage(page);
  await dss.goto();

  await dss.choosePurpose("Quà tặng / Cá nhân");
  await dss.setBudget(120_000_000);
  await dss.setMinCarat(0.5);
  await dss.setMinColor("F");
  await dss.setMinClarity("VS2");

  // (a) default
  await dss.expectAllOrigin("natural");
  expect(await dss.flagIds()).toContain("R3");

  // (b) eco on
  await dss.toggleEco();
  await dss.expectAllOrigin("lgd");
  expect(await dss.flagIds()).not.toContain("R3");
  const [top] = await dss.topRows();
  expect(top).toMatchObject({ carat: 1.73, price: 6_500_000 });
  // README: the R4 eco banner does not fire on the real data.
  await expect(page.getByText("Eco override · R4")).toHaveCount(0);
});
