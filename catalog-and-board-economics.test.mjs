import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { loadCatalog, validateCatalog, addCatalogOfferings, reloadCatalog, resolveBoardMaterial, estimateResolvedBoardPlan } from './store-zero-stage2-store.mjs';
import { estimateBoardSequence, estimateJob, estimatePineAlcove, RECOVERY, TOOLING } from './store-zero-pricing-engine.mjs';

const catalog = loadCatalog();
const demand = { species: 'spf', form: 'board', nominalT: 2, nominalW: 4,
  finishedPartLengthIn: 16, quantity: 2, sawAngleDeg: 30, cutPlane: 'miter-face',
  endIdentity: 'both', endRelation: 'parallel', lengthDatum: 'long-long-outer-edge' };
const sixFoot = catalog.offerings.find(o => o.storeSku === 'STB-ZERO-SPF-2X4-72-001');
const quote = (c = catalog, d = demand, spots = 0) => {
  const material = resolveBoardMaterial(c, d);
  assert.equal(material.status, 'MAPPED');
  return estimateResolvedBoardPlan(c, material, { spotCycles: spots });
};

test('six-foot offering survives remove/add round trip and is used without changing finished demand', () => {
  assert.equal(sixFoot.stockL_in, 72);
  const before = structuredClone(catalog);
  before.offerings = before.offerings.filter(o => o.storeSku !== sixFoot.storeSku);
  before.skuCount = before.offerings.length;
  const snapshot = structuredClone(before);
  const added = addCatalogOfferings(before, [sixFoot]);
  assert.equal(added.status, 'ACCEPTED');
  assert.deepEqual(before, snapshot);
  assert.equal(added.catalog.skuCount, before.skuCount + 1);
  const answer = resolveBoardMaterial(added.catalog, demand);
  assert.equal(answer.plan.selected.parentStockLengthIn, 72);
  assert.equal(answer.plan.finishedPart.lengthIn, 16);
  assert.equal(answer.plan.intermediateBlank, null);
  assert.equal(answer.plan.parents[0].remainderIn, 39.625);
});

test('new stock length is data, not a SKU-specific code path', () => {
  const item = { ...structuredClone(sixFoot), storeSku: 'TEST-2X4-80', stockL_in: 80 };
  const before = structuredClone(catalog);
  for (const o of before.offerings) if (o.species === 'spf' && o.nominalT === 2 && o.nominalW === 4) o.offered = false;
  const added = addCatalogOfferings(before, [item]);
  assert.equal(added.status, 'ACCEPTED');
  const answer = resolveBoardMaterial(added.catalog, demand);
  assert.equal(answer.plan.selected.parentStockLengthIn, 80);
  assert.equal(answer.plan.parents[0].remainderIn, 47.625);
});

test('invalid entries and duplicates reject the entire addition without mutating the catalog', () => {
  const original = structuredClone(catalog);
  for (const bad of [sixFoot, { ...sixFoot, storeSku: 'BAD', stockL_in: -72 },
    { ...sixFoot, storeSku: 'BAD', sellingPrice: '3.13' },
    { ...sixFoot, storeSku: 'BAD', assertions: null }, null]) {
    const result = addCatalogOfferings(catalog, [bad]);
    assert.equal(result.status, 'REJECTED');
    assert.ok(result.errors.length);
    assert.equal(result.catalog, catalog);
    assert.deepEqual(catalog, original);
  }
  assert.equal(validateCatalog({ note: 'PLACEHOLDER_DO_NOT_USE' }).valid, false);
});

test('broken file reload retains last valid catalog and reports a named failure', () => {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-reload-'));
  try {
    const path = join(dir, 'catalog.json');
    for (const text of ['{', '{"note":"PLACEHOLDER_DO_NOT_USE"}']) {
      writeFileSync(path, text);
      const result = reloadCatalog(path, catalog);
      assert.equal(result.status, 'REJECTED');
      assert.equal(result.catalog, catalog);
      assert.match(result.errors[0], /^CATALOG_(READ_FAILED|INVALID):/);
      assert.equal(resolveBoardMaterial(result.catalog, demand).status, 'MAPPED');
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI writes validated additions and leaves output unchanged on rejection', () => {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-cli-'));
  try {
    const input = join(dir, 'input.json'), additions = join(dir, 'add.json'), output = join(dir, 'output.json');
    writeFileSync(input, JSON.stringify(catalog));
    writeFileSync(additions, JSON.stringify({ offerings: [{ ...sixFoot, storeSku: 'TEST-NEW-72' }] }));
    const run = () => spawnSync(process.execPath, ['catalog-add.mjs', input, additions, output], { encoding: 'utf8' });
    assert.equal(run().status, 0);
    assert.equal(loadCatalog(output).skuCount, catalog.skuCount + 1);
    const validBytes = readFileSync(output, 'utf8');
    writeFileSync(additions, JSON.stringify({ offerings: [sixFoot] }));
    const rejected = run();
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /CATALOG_UPDATE_REJECTED:.*duplicated/);
    assert.equal(readFileSync(output, 'utf8'), validBytes);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('No job can inherit undeclared rates or setup time through any pricing entry', () => {
  const recovery = { ...RECOVERY }, setup = TOOLING.jobSetupMin;
  const before = quote();
  try {
    RECOVERY.setupCharge = 12345;
    RECOVERY.machineHourRate = 67890;
    TOOLING.jobSetupMin = 54321;
    const contaminated = quote();
    assert.equal(contaminated.totals.Q, before.totals.Q);
    assert.deepEqual(contaminated.cycle, before.cycle);
    assert.equal(contaminated.realityBar.status, 'FAIL');
    assert.ok(contaminated.realityBar.failures.includes('UNDECLARED_RECOVERY_CONSTANT_PRESENT'));
    assert.ok(contaminated.realityBar.failures.includes('UNDECLARED_SETUP_TIME_PRESENT'));
    const sequence = estimateBoardSequence(catalog, { storeSku: sixFoot.storeSku,
      definedWorkpieceLengthIn: 60, sawCuts: 3, sawAngleDeg: 30 });
    const generic = estimateJob(catalog, { classId: 'user_defined_board', pieces: [
      { storeSku: sixFoot.storeSku, qty: 1, keptLengthIn: 16, widthIn: 3.5, sawCuts: 3 }
    ] });
    for (const estimate of [before, sequence, generic, quote(catalog, demand, 2)]) {
      assert.equal(estimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
      assert.equal(estimate.totals.cell_recovery, null);
      assert.equal(estimate.totals.Q, estimate.totals.material);
      assert.equal(estimate.cycle.T_job_min, null);
      assert.ok(estimate.cycle.modeledOperationSubtotalMin < 5);
      assert.ok(estimate.unresolved.includes('PROCESSING_RATE_BASIS_REQUIRED'));
      assert.ok(estimate.unresolved.includes('SETUP_TIME_BASIS_REQUIRED'));
    }
  } finally { Object.assign(RECOVERY, recovery); TOOLING.jobSetupMin = setup; }
});

test('price edits change material only; missing price is unresolved, not zero', () => {
  const changed = structuredClone(catalog);
  const item = changed.offerings.find(o => o.storeSku === sixFoot.storeSku);
  item.sellingPrice += 1;
  const original = quote(), updated = quote(changed);
  assert.equal(updated.totals.material, original.totals.material + 1);
  assert.deepEqual(updated.cycle, original.cycle);
  assert.equal(updated.totals.cell_recovery, null);
  item.sellingPrice = null;
  const resolution = resolveBoardMaterial(changed, demand);
  assert.equal(resolution.plan.selected.materialTotal, null);
  const missing = estimateResolvedBoardPlan(changed, resolution);
  assert.equal(missing.reason, 'MISSING_PRICE');
  const missingWithSpot = estimateBoardSequence(changed, { storeSku: sixFoot.storeSku,
    definedWorkpieceLengthIn: 60, sawCuts: 3, spotCycles: 2 });
  assert.equal(missingWithSpot.status, 'UNRESOLVED');
  assert.equal(missingWithSpot.reason, 'MISSING_PRICE');
  assert.equal(missingWithSpot.totals, undefined);
});

test('operations still determine modeled time and spot uncertainty remains explicit', () => {
  const base = quote();
  const prepared = quote(catalog, { ...demand, requestedFinishedBlankLengthIn: 64,
    requestedFinishedBlankSource: 'TEST_EXPLICIT_REQUIREMENT' });
  assert.equal(prepared.operationAccounting.preparationSawCuts, 1);
  assert.ok(prepared.cycle.modeledOperationSubtotalMin > base.cycle.modeledOperationSubtotalMin);
  assert.ok(quote(catalog, demand, 2).unresolved.includes('SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED'));
  assert.equal(resolveBoardMaterial(catalog, { ...demand, sawAngleDeg: 46 }).status, 'REFUSED');
  const alcove = estimatePineAlcove(catalog);
  assert.equal(alcove.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.equal(alcove.totals.cell_recovery, null);
  assert.equal(alcove.totals.Q, alcove.totals.material + alcove.totals.hardware);
});
