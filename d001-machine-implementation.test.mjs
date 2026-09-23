import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, evaluateDimensionalTravelJob, evaluateDimensionalStoreRequest, capabilityAnswer, findSku } from './store-zero-stage2-store.mjs';
import { USER1_DIMENSIONAL_TRAVEL_DEMAND } from './user1-dimensional-travel-fixture.mjs';

const catalog = loadCatalog();
const job = () => structuredClone(USER1_DIMENSIONAL_TRAVEL_DEMAND);
const reasons = result => JSON.stringify(result);

// Exercise the Store consumer, not a mock evaluator or copied expected calculator.
test('existing centered spot model remains traceable; it does not claim the new depth', () => {
  const result = evaluateDimensionalStoreRequest(catalog, job(), { requestId: 'station-baseline' });
  assert.equal(result.status, 'SUPPORTABLE');
  assert.equal(result.estimate.travel.finalRemainderIn, 27.625);
  assert.equal(result.estimate.travel.derivedSawCuts, 3);
  assert.ok(result.estimate.travel.operationPlan.filter(op => op.kind === 'SPOT_ON_LOCATION')
    .every(op => op.timingReferencePlungeIn === 0.125));
  assert.equal(result.evaluationReceipt.authority.machineEnvelope.id, 'D001-STAGE2-ENVELOPE-0.5');
});

for (const index of [0, 1]) {
  test(`edge orientation on part ${index + 1} cannot be silently priced as a face spot`, () => {
    const demand = job();
    demand.parts[index].features[0].orientation = 'EDGE';
    const result = evaluateDimensionalTravelJob(catalog, demand);
    assert.equal(result.status, 'UNRESOLVED');
    assert.notEqual(result.estimate?.complete, true);
    assert.match(reasons(result), /T5_EDGE_SPOT_ENVELOPE_REQUIRED/);
  });
  test(`depth-defined spot on part ${index + 1} cannot reuse the legacy plunge time`, () => {
    const demand = job();
    Object.assign(demand.parts[index].features[0], {
      operationContract: 'SPOT_ON_LOCATION/0.2', fullDiameterPenetrationIn: 0.1875
    });
    const result = evaluateDimensionalTravelJob(catalog, demand);
    assert.equal(result.status, 'UNRESOLVED');
    assert.notEqual(result.estimate?.complete, true);
    assert.match(reasons(result), /SPOT_TOOL_POINT_GEOMETRY_REQUIRED/);
  });
  test(`different cutter diameter on part ${index + 1} is refused`, () => {
    const demand = job();
    demand.parts[index].features[0].toolDiameterIn = 0.25;
    const result = evaluateDimensionalTravelJob(catalog, demand);
    assert.equal(result.status, 'REFUSED');
    assert.notEqual(result.estimate?.complete, true);
    assert.match(reasons(result), /SPOT_DIAMETER_FIXED_3_16/);
  });
}

test('valid 45-degree demand passes and 46-degree demand is refused by Store', () => {
  for (const [angle, expected] of [[45, 'SUPPORTABLE'], [46, 'REFUSED']]) {
    const demand = job();
    demand.sawAngleDeg = angle;
    assert.equal(evaluateDimensionalTravelJob(catalog, demand).status, expected);
  }
});

test('blank and null angle are missing facts, not square-cut capability', () => {
  const item = findSku(catalog, 'STB-ZERO-SPF-2X4-72-001');
  for (const value of [null, '', false]) {
    const result = capabilityAnswer(item, ['MITER_LIMITED'], { sawAngleDeg: value });
    assert.equal(result.status, 'UNRESOLVED');
    assert.ok(result.unresolved.includes('MITER_ANGLE_REQUIRED'));
  }
});

test('customer-supplied point geometry cannot impersonate Store tooling configuration', () => {
  const demand = job();
  demand.parts[1].features[0].pointAngleDeg = 118;
  const result = evaluateDimensionalTravelJob(catalog, demand);
  assert.equal(result.status, 'UNRESOLVED');
  assert.match(reasons(result), /SPOT_DEPTH_REQUIRES_STORE_TOOL_CONFIGURATION/);
});
