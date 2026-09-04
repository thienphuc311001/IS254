const RULES = {
  // R2 · ngưỡng giá trên mỗi carat để gắn nhãn "giá cao"
  R2_HIGH_PRICE_PER_CT: { natural: 150e6, lgd: 30e6 },
  // R3 · ngân sách tối thiểu để ưu tiên nhóm Natural GIA
  R3_PREMIUM_GIA: { budget: 100e6, certCode: 3 },
  // R4 · chênh lệch điểm WSM tối đa giữa LGD và Natural để kích hoạt ưu tiên LGD (mục đích Môi trường)
  R4_MAX_CRITERION_GAP: 0.10,
  // Lọc dữ liệu bất thường ở Bước 1 (Hard Filter) — không phải rule override
  SANITY_FILTER: { maxCarat: 6, maxPrice: 2e9 },
};

const COLOR_CODE = {D:10,E:9,F:8,G:7,H:6,I:5,J:4,K:3,L:2,M:1,N:0};
const CLARITY_CODE = {FL:8,IF:7,VVS1:6,VVS2:5,VS1:4,VS2:3,SI1:2,SI2:1};
const CUT_SCORE = {3:1.0, 2:0.85};
const CERT_SCORE = {3:1.0, 2:0.9, 1:0.8, 0:0.7};

const PURPOSE = {
  WEDDING: 'wedding',
  INVESTMENT: 'invest',
  GIFT_PERSONAL: 'gift',
};

const PRESETS = {
  [PURPOSE.WEDDING]: [3, 2, 4, 1],
  [PURPOSE.INVESTMENT]: [2, 5, 3, 1],
  [PURPOSE.GIFT_PERSONAL]: [3, 3, 3, 2],
};

const ECO_BLEND = {
  baseRatio: 0.6,
  ecoRatio: 0.4,
  ecoVector: [0.18, 0.18, 0.18, 0.45],
};

function normalizeWeights(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return total ? weights.map(weight => weight / total) : [0.25, 0.25, 0.25, 0.25];
}

function applyEcoBlend(baseWeights, ecoPreferred) {
  if (!ecoPreferred) return normalizeWeights(baseWeights);
  const base = normalizeWeights(baseWeights);
  const eco = normalizeWeights(ECO_BLEND.ecoVector);
  return base.map((weight, index) =>
    ECO_BLEND.baseRatio * weight + ECO_BLEND.ecoRatio * eco[index]
  );
}
