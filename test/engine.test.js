const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const elementCache = new Map();

function elementStub(id) {
  return {
    id,
    value: id === 'budget' ? '60000000' : id === 'minCarat' ? '0.5' : '0',
    checked: false,
    max: Number.MAX_SAFE_INTEGER,
    textContent: '',
    className: '',
    innerHTML: '',
    children: [],
    dataset: {},
    parentElement: { querySelector: () => elementStub(`${id}-value`) },
    classList: { remove() {}, add() {} },
    addEventListener() {},
    setAttribute() {},
    querySelector: () => elementStub(`${id}-child`),
  };
}

function element(context, id) {
  if (!context.__elements.has(id)) context.__elements.set(id, elementStub(id));
  const created = context.__elements.get(id);
  if (id === 'ecoPreferred') created.type = 'checkbox';
  return created;
}

function makeDiamond(overrides = {}) {
  const uniqueKey = overrides.key || `diamond-${Math.random()}`;
  return {
    origin: 'natural',
    store: 'store',
    shape: 'Round',
    carat: 1,
    color: 'G',
    clarity: 'VS1',
    cut: 'Excellent',
    cert: 'GIA',
    price: 10000000,
    resale: 0.9,
    link: 'link',
    colorCode: 7,
    clarityCode: 4,
    cutCode: 3,
    certCode: 3,
    link: uniqueKey,
    key: uniqueKey,
    ...overrides,
  };
}

function loadApp(data) {
  const context = {
    document: { getElementById: (id) => element(context, id) },
    Intl,
    Math,
    Number,
    Set,
    DATA: data,
    META: { total: data.length, natural: 0, lgd: 0, stores: 0 },
    updateMasthead() {},
    __elements: new Map(),
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'diamond-config.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  vm.runInContext(source, context);
  return context;
}

function computeWith(data, overrides = {}) {
  const context = loadApp(data);
  for (const [id, value] of Object.entries(overrides)) {
    const input = element(context, id);
    if (input.type === 'checkbox') {
      input.checked = Boolean(value);
      input.value = 'on';
    } else {
      input.value = String(value);
    }
  }
  return context.compute();
}

test('quality normalization keeps cut meaningful when certificates diverge', () => {
  const result = computeWith([
    makeDiamond({ key: 'lgd-high-cert', origin: 'lgd', resale: 0.6, certCode: 2, cutCode: 2 }),
    makeDiamond({ key: 'nat-low-cert', origin: 'natural', resale: 0.9, certCode: 1, cutCode: 3 }),
    makeDiamond({ key: 'nat-high-cert-cut', origin: 'natural', resale: 0.9, certCode: 3, cutCode: 3 }),
  ], { budget: 20000000, wSize: 0, wFin: 0, wQual: 1, wEnv: 0 });
  const byKey = Object.fromEntries(result.scored.map(item => [item.key, item]));
  assert.notEqual(byKey['nat-low-cert'].sQual, byKey['nat-high-cert-cut'].sQual);
});

test('finance score depends on resale rate rather than price', () => {
  const result = computeWith([
    makeDiamond({ key: 'cheap', price: 9000000, resale: 0.9 }),
    makeDiamond({ key: 'expensive', price: 11000000, resale: 0.9 }),
    makeDiamond({ key: 'low-resale', price: 9500000, resale: 0.6 }),
  ], { budget: 12000000, wSize: 0, wFin: 1, wQual: 0, wEnv: 0 });
  const byKey = Object.fromEntries(result.scored.map(item => [item.key, item]));
  assert.equal(byKey.cheap.sFin, byKey.expensive.sFin);
  assert.notEqual(byKey.cheap.sFin, byKey['low-resale'].sFin);
});

test('R2 flags stones priced above the reference per-carat threshold', () => {
  const result = computeWith([
    makeDiamond({ key: 'pricey', carat: 0.5, price: 100000000 }),
    makeDiamond({ key: 'fair', carat: 2, price: 100000000 }),
  ], { budget: 120000000 });
  const pricey = result.top5.find(item => /\|pricey$/.test(item.key));
  const fair = result.top5.find(item => /\|fair$/.test(item.key));
  assert.equal(pricey.flagOverpriced, true);
  assert.equal(fair.flagOverpriced, false);
});

test('eco blend preserves total weight and applies the configured ratio', () => {
  const result = computeWith([
    makeDiamond({ key: 'natural' }),
    makeDiamond({ key: 'lgd', origin: 'lgd', resale: 0.6 }),
  ], {
    budget: 20000000,
    wSize: 3,
    wFin: 2,
    wQual: 4,
    wEnv: 1,
    ecoPreferred: true,
  });

  const expected = [
    0.6 * (3 / 10) + 0.4 * (0.18 / 0.99),
    0.6 * (2 / 10) + 0.4 * (0.18 / 0.99),
    0.6 * (4 / 10) + 0.4 * (0.18 / 0.99),
    0.6 * (1 / 10) + 0.4 * (0.45 / 0.99),
  ];
  const actual = [result.w1, result.w2, result.w3, result.w4];
  assert.ok(Math.abs(actual.reduce((sum, weight) => sum + weight, 0) - 1) < 1e-12);
  expected.forEach((weight, index) => {
  assert.ok(Math.abs(actual[index] - weight) < 1e-12);
  });
});

function makeClosePair(naturalOverrides = {}, lgdOverrides = {}) {
  const data = [
    makeDiamond({
      key: 'natural-top',
      carat: 1,
      price: 10000000,
      resale: 0.65,
      colorCode: 9,
      clarityCode: 7,
      certCode: 3,
      ...naturalOverrides,
    }),
    makeDiamond({
      key: 'lgd-close',
      origin: 'lgd',
      carat: 0.995,
      price: 10000000,
      resale: 0.5851,
      colorCode: 10,
      clarityCode: 8,
      certCode: 3,
      ...lgdOverrides,
    }),
    makeDiamond({
      key: 'scale-outlier',
      origin: 'lgd',
      carat: 6,
      price: 10000000,
      resale: 0,
      colorCode: 3,
      clarityCode: 1,
      cutCode: 2,
      certCode: 0,
    }),
  ];
  return data;
}

test('R4 explains a close LGD alternative only when it already leads with eco enabled', () => {
  const data = makeClosePair();
  const weights = { wSize: 5, wFin: 5, wQual: 0, wEnv: 0 };
  const enabled = computeWith(data, { budget: 20000000, ecoPreferred: true, ...weights });
  const disabled = computeWith(data, { budget: 20000000, ecoPreferred: false, ...weights });

  assert.match(enabled.top5[0].key, /\|lgd-close$/);
  assert.equal(enabled.ecoOverride, true);
  assert.ok(enabled.flags.some(flag => flag.id === 'R4' && flag.level === 'override'));
  assert.doesNotMatch(enabled.top5[0].key, /\|natural-top$/);
  assert.match(disabled.top5[0].key, /\|natural-top$/);
  assert.equal(disabled.ecoOverride, false);
  assert.ok(!disabled.flags.some(flag => flag.id === 'R4' && flag.level === 'override'));
});

test('R4 does not activate when a natural candidate leads despite eco preference', () => {
  const data = [
    makeDiamond({ key: 'natural-leader', carat: 1.1, colorCode: 10, clarityCode: 8 }),
    makeDiamond({ key: 'lgd-close', origin: 'lgd', carat: 1, resale: 0.6, colorCode: 9, clarityCode: 7 }),
  ];
  const result = computeWith(data, { budget: 20000000, ecoPreferred: true });
  assert.match(result.top5[0].key, /\|natural-leader$/);
  assert.equal(result.ecoOverride, false);
  assert.ok(!result.flags.some(flag => flag.id === 'R4'));
});

test('R4 ignores alternatives that differ by more than the criterion gap limit', () => {
  const data = makeClosePair(
    {},
    { resale: 0.5201 },
  );
  const result = computeWith(data, {
    budget: 20000000,
    ecoPreferred: true,
    wSize: 5,
    wFin: 5,
    wQual: 0,
    wEnv: 0,
  });
  assert.match(result.top5[0].key, /\|lgd-close$/);
  assert.equal(result.ecoOverride, false);
  assert.ok(!result.flags.some(flag => flag.id === 'R4' && flag.level === 'override'));
});

test('R3 removes non-GIA stones when a GIA candidate is present', () => {
  const data = [
    makeDiamond({ key: 'natural-gia', certCode: 3 }),
    makeDiamond({ key: 'lgd-gia', origin: 'lgd', certCode: 3 }),
    makeDiamond({ key: 'natural-not-gia', certCode: 2 }),
    makeDiamond({ key: 'natural-unverified', certCode: 0 }),
  ];
  const result = computeWith(data, { budget: 150000000 });
  assert.deepEqual(result.top5.map(item => item.key), [
    'store|Round|1|10000000|lgd-gia',
    'store|Round|1|10000000|natural-gia',
  ]);
  assert.equal(result.flags.some(flag => flag.id === 'R3'), true);
});

test('R3 stays inactive when the premium shortlist has no GIA stone', () => {
  const data = [
    makeDiamond({ key: 'lgd-first', origin: 'lgd', certCode: 2, price: 120000000 }),
    makeDiamond({ key: 'natural-second', certCode: 0, price: 130000000 }),
  ];
  const result = computeWith(data, { budget: 150000000 });
  const expectedKeys = [
    'store|Round|1|120000000|lgd-first',
    'store|Round|1|130000000|natural-second',
  ];
  assert.equal(JSON.stringify(result.top5.map(item => item.key)), JSON.stringify(expectedKeys));
  assert.equal(result.flags.some(flag => flag.id === 'R3'), false);
});

test('R4 handles an all-LGD shortlist without runtime errors', () => {
  const data = [
    makeDiamond({ key: 'lgd-leader', origin: 'lgd', resale: 0.6 }),
    makeDiamond({ key: 'lgd-second', origin: 'lgd', resale: 0.6, price: 10000001 }),
  ];
  const result = computeWith(data, { budget: 20000000, ecoPreferred: true });
  assert.match(result.top5[0].key, /\|lgd-leader$/);
  assert.equal(result.ecoOverride, false);
  assert.ok(!result.flags.some(flag => flag.id === 'R4'));
});

test('eco blend is hidden from slider values and exposed in compute state', () => {
  const result = computeWith([makeDiamond()], {
    wSize: 3,
    wFin: 2,
    wQual: 4,
    wEnv: 1,
    ecoPreferred: true,
  });
  assert.equal(result.ecoPreferred, true);
  assert.equal(result.w4, 0.6 * (1 / 10) + 0.4 * (0.45 / 0.99));
});
