import { COLOR_CODE, type Diamond } from "@/entities/diamond";
import type { Purpose } from "@/entities/criteria";
import { fmtVND } from "@/shared/lib";
import { RULES } from "../config/rules";
import type { RankedDiamond, RuleFlag, ScoredDiamond } from "./types";

/**
 * Step 3 · Rule-based override.
 * The WSM ranking stays the primary order; each rule below only adjusts it under a
 * specific business condition and reports a flag explaining what it did.
 */

/**
 * R1 · No certified natural stone exists anywhere in the dataset within budget + carat
 * → push every LGD in the shortlist ahead of the naturals.
 * Note: the condition scans the whole dataset, not just the shortlist.
 */
export function applyR1(
  shortlist: ScoredDiamond[],
  data: Diamond[],
  budget: number,
  minCarat: number,
): { list: ScoredDiamond[]; flag: RuleFlag | null } {
  const noNaturalAtThreshold = !data.some(
    (d) =>
      d.origin === "natural" &&
      d.carat >= minCarat &&
      d.price <= budget &&
      (d.certCode ?? 0) > 0,
  );
  if (!noNaturalAtThreshold) return { list: shortlist, flag: null };

  const list = [...shortlist].sort(
    (a, b) => (a.origin === "lgd" ? 0 : 1) - (b.origin === "lgd" ? 0 : 1),
  );
  return {
    list,
    flag: {
      id: "R1",
      level: "override",
      msg: `Ngân sách ${fmtVND(budget)} đ với carat ≥ ${minCarat.toFixed(2)} ct không có kim cương Tự nhiên nào thỏa mãn — hệ thống ghi đè gợi ý sang LGD.`,
    },
  };
}

/** R2 · Tag (never remove) stones whose price per carat exceeds the reference threshold. */
export function applyR2(shortlist: ScoredDiamond[]): RankedDiamond[] {
  return shortlist.map((d) => {
    const ppc = d.price / d.carat;
    const limit =
      d.origin === "natural" ? RULES.R2_HIGH_PRICE_PER_CT.natural : RULES.R2_HIGH_PRICE_PER_CT.lgd;
    return {
      ...d,
      flagOverpriced: ppc > limit,
      key: `${d.store}|${d.shape}|${d.carat}|${d.price}|${d.link}`,
    };
  });
}

/**
 * R3 · Premium segment (budget ≥ 100M) and a natural GIA stone is in the shortlist
 * → keep only GIA-certified stones (of any origin).
 */
export function applyR3(
  shortlist: RankedDiamond[],
  budget: number,
): { list: RankedDiamond[]; flag: RuleFlag | null } {
  const giaAvailable = shortlist.some(
    (d) => d.origin === "natural" && (d.certCode ?? 0) === RULES.R3_PREMIUM_GIA.certCode,
  );
  const active = budget >= RULES.R3_PREMIUM_GIA.budget && giaAvailable;
  if (!active) return { list: shortlist, flag: null };
  return {
    list: shortlist.filter((d) => (d.certCode ?? 0) === RULES.R3_PREMIUM_GIA.certCode),
    flag: {
      id: "R3",
      level: "info",
      msg: "Phân khúc trên 100 triệu — hệ thống ưu tiên chứng nhận GIA theo chuẩn ngành.",
    },
  };
}

/**
 * R4a · Wedding: if the Top 1 is color J or worse, swap in the first brighter stone (≥ I).
 */
export function applyR4Wedding(
  shortlist: RankedDiamond[],
  purpose: Purpose,
): { list: RankedDiamond[]; flag: RuleFlag | null } {
  if (purpose !== "wedding" || shortlist.length <= 1) return { list: shortlist, flag: null };
  const t1 = shortlist[0];
  if ((t1.colorCode ?? 99) > COLOR_CODE.J) return { list: shortlist, flag: null };

  const betterIdx = shortlist.findIndex((d, i) => i > 0 && (d.colorCode ?? 0) > COLOR_CODE.J);
  if (betterIdx < 0) return { list: shortlist, flag: null };

  const list = [...shortlist];
  [list[0], list[betterIdx]] = [list[betterIdx], list[0]];
  return {
    list,
    flag: {
      id: "R4",
      level: "info",
      msg: "Mục đích Cưới / Diện: hệ thống ưu tiên viên có màu sáng hơn (≥ I) cho Top 1.",
    },
  };
}

/**
 * R4b · Environment: with the eco toggle on, if an LGD already leads and the nearest natural
 * is within R4_MAX_CRITERION_GAP on all of size / finance / quality, declare them equivalent.
 * Does not reorder; it only explains why the LGD leader is a sound choice.
 */
export function evaluateR4Eco(
  shortlist: RankedDiamond[],
  ecoPreferred: boolean,
): { ecoOverride: boolean; flag: RuleFlag | null } {
  if (!ecoPreferred || shortlist.length === 0) return { ecoOverride: false, flag: null };
  const top = shortlist[0];
  const naturals = shortlist.slice(1).filter((d) => d.origin === "natural");
  if (top.origin !== "lgd" || naturals.length === 0) return { ecoOverride: false, flag: null };

  const nearestNaturalGap = Math.min(
    ...naturals.map((d) =>
      Math.max(
        Math.abs(top.sSize - d.sSize),
        Math.abs(top.sFin - d.sFin),
        Math.abs(top.sQual - d.sQual),
      ),
    ),
  );
  if (nearestNaturalGap > RULES.R4_MAX_CRITERION_GAP) return { ecoOverride: false, flag: null };

  return {
    ecoOverride: true,
    flag: {
      id: "R4",
      level: "override",
      msg: "Mục đích Môi trường: đã ưu tiên kim cương nhân tạo vì tương đương chất lượng, thân thiện môi trường hơn.",
    },
  };
}
