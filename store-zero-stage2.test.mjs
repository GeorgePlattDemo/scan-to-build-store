import assert from "node:assert/strict";
import { loadCatalog, loadObservations, findSku, pineAlcoveEvaluation } from "./store-zero-stage2-store.mjs";
import { estimatePineAlcove, estimateBoardSequence, sellingPrice } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
const observations = loadObservations();

assert.equal(catalog.skuCount, 92);
assert.equal(catalog.offerings.length, 92);
assert.equal(observations.observations.length, 20);
assert.equal(catalog.pricingRule.ruleId, "SZ-MARK-ON-5");
assert.equal(catalog.pricingRule.basis, "DECLARED_FIXTURE");

for (const o of catalog.offerings) {
  assert.ok(o.assertions, o.storeSku);
  assert.equal(o.assertions.sellingPrice.basis, "CALCULATED");
  assert.equal(o.assertions.pricingRule.basis, "DECLARED_FIXTURE");
  assert.equal(o.assertions.onHand.basis, "SYNTHETIC_FIXTURE");
  assert.equal(o.assertions.allocation.basis, "SIMULATED_STATE");
  assert.equal(o.assertions.supplierPath.basis, "SYNTHETIC_FIXTURE");
  assert.equal(o.assertions.cellCompatibility.basis, "DECLARED_STAGE2_CAPABILITY");
  if (o.list_reference != null) {
    assert.equal(o.sellingPrice, sellingPrice(o.list_reference));
  }
  if (o.listReferenceBasis === "OBSERVED") {
    assert.equal(o.assertions.externalListPrice.basis, "OBSERVED");
    assert.ok(o.observationId, o.storeSku);
    const obs = observations.observations.find((x) => x.id === o.observationId);
    assert.ok(obs, o.observationId);
  } else {
    assert.notEqual(o.assertions.externalListPrice.basis, "OBSERVED");
  }
}

const cherry = catalog.offerings.filter((o) => o.species === "cherry");
assert.ok(cherry.length >= 1);
for (const c of cherry) {
  assert.equal(c.listReferenceBasis, "CALCULATED");
  assert.equal(c.assertions.externalListPrice.basis, "NONE");
  assert.equal(c.assertions.listReferenceDerivation.basis, "CALCULATED");
}

const pine72 = findSku(catalog, "STB-ZERO-PINE-1X6-72-001");
const pine96 = findSku(catalog, "STB-ZERO-PINE-1X6-96-001");
assert.equal(pine72.list_reference, 14.99);
assert.equal(pine72.sellingPrice, 15.74);
assert.equal(pine72.listReferenceBasis, "OBSERVED");
assert.equal(pine96.list_reference, 19.99);
assert.equal(pine96.sellingPrice, 20.99);

const ticket = estimatePineAlcove(catalog);
assert.equal(ticket.status, "BUDGETARY_ESTIMATE");
assert.equal(ticket.totals.material, 272.86);
assert.equal(ticket.hardware_line.extension, 18);
assert.equal(ticket.totals.Q_basis, "CALCULATED");
assert.ok(ticket.totals.Q > ticket.totals.material);

const evaln = pineAlcoveEvaluation(catalog);
assert.equal(evaln.status, "SUPPORTABLE");
assert.equal(evaln.lines[0].stock.assertions.onHand.basis, "SYNTHETIC_FIXTURE");

const xBrace = estimateBoardSequence(catalog, {
  title: "Start Your Own — X brace",
  classId: "user_defined_board.x_brace",
  storeSku: "STB-ZERO-SPF-2X4-72-001",
  qty: 1,
  definedWorkpieceLengthIn: 60,
  sawCuts: 3,
  sawAngleDeg: 30,
  drillCycles: 0,
  spotCycles: 2
});
assert.equal(xBrace.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.deepEqual(xBrace.unresolved, ["SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED"]);
assert.equal(xBrace.totals.material, 3.13);
assert.equal(xBrace.cycle.T_job_min, 9.694);
assert.equal(xBrace.cycle.excludedSpotCycles, 2);
assert.equal(xBrace.cycle.spotCycleStatus, "UNRESOLVED_FOR_DEPTH_DEFINED_SPOT");
assert.equal(xBrace.totals.cell_recovery, 51.16);
assert.equal(xBrace.totals.Q, 54.29);
assert.equal(xBrace.totals.Q_basis, "PARTIAL_CALCULATED");
assert.equal(xBrace.operationEconomics.spot.excludedFromResolvedSubtotal, true);
assert.equal(xBrace.operationEconomics.spot.legacyFixedCycleMin, 0.16);
assert.equal(xBrace.cycle.model, "STB-D001-CYCLE-MODEL-S2-0.1");
assert.equal(xBrace.engine.version, "0.2.4");

console.log("store-zero-stage2.test.mjs ok");
console.log("skuCount", catalog.skuCount);
console.log("observations", observations.observations.length);
console.log("pine Q", ticket.totals.Q);
