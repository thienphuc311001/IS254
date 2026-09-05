import { describe, expect, test } from "vitest";
import { fmtTrieu, fmtVND } from "./format";
import { normalize } from "./normalize";

describe("fmtVND", () => {
  test("uses Vietnamese thousand separators and rounds", () => {
    expect(fmtVND(6_500_000)).toBe("6.500.000");
    expect(fmtVND(1_126_391_200)).toBe("1.126.391.200");
    expect(fmtVND(999.6)).toBe("1.000");
  });
});

describe("fmtTrieu", () => {
  test("switches from 'tr' to 'tỷ' at one billion", () => {
    expect(fmtTrieu(5_000_000)).toBe("5.0 tr");
    expect(fmtTrieu(150_000_000)).toBe("150.0 tr");
    expect(fmtTrieu(1_000_000_000)).toBe("1.00 tỷ");
    expect(fmtTrieu(1_126_391_200)).toBe("1.13 tỷ");
  });
});

describe("normalize", () => {
  test("maps the range onto [0, 1]", () => {
    const n = normalize([10, 20, 30]);
    expect(n(10)).toBe(0);
    expect(n(20)).toBe(0.5);
    expect(n(30)).toBe(1);
  });

  test("degenerate range maps everything to 0.5", () => {
    const n = normalize([7, 7, 7]);
    expect(n(7)).toBe(0.5);
    expect(n(100)).toBe(0.5);
  });
});
