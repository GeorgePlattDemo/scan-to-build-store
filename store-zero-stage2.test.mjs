import assert from "node:assert/strict";
import { loadCatalog, loadObservations, findSku, pineAlcoveEvaluation, resolveBoardMaterial, estimateResolvedBoardPlan } from "./store-zero-stage2-store.mjs";
import { estimatePineAlcove, estimateBoardSequence, sellingPrice } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
const observations = loadObservations();

assert.equal(catalog.skuCount, catalog.offerings.length);
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
assert.equal(ticket.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(ticket.totals.material, 272.86);
assert.equal(ticket.hardware_line.extension, 18);
assert.equal(ticket.totals.Q_basis, "PARTIAL_CALCULATED");
assert.equal(ticket.totals.cell_recovery, null);
assert.equal(ticket.totals.Q, ticket.totals.material + ticket.totals.hardware);
assert.ok(ticket.unresolved.includes("PROCESSING_RATE_BASIS_REQUIRED"));
assert.ok(ticket.unresolved.includes("SETUP_TIME_BASIS_REQUIRED"));

const evaln = pineAlcoveEvaluation(catalog);
assert.equal(evaln.status, "SUPPORTABLE");
assert.equal(evaln.lines[0].stock.assertions.onHand.basis, "SYNTHETIC_FIXTURE");

const user1 = resolveBoardMaterial(catalog, {
  species: "spf",
  form: "board",
  nominalT: 2,
  nominalW: 4,
  finishedPartLengthIn: 16,
  quantity: 2,
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  endIdentity: "both",
  endRelation: "parallel",
  lengthDatum: "long-long-outer-edge"
});
assert.equal(user1.status, "MAPPED");
assert.equal(user1.plan.selected.storeSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(user1.plan.selected.parentStockLengthIn, 72);
assert.equal(user1.plan.accounting.productionSawCuts, 3);
assert.equal(user1.plan.accounting.preparationSawCuts, 0);
assert.equal(user1.plan.parents[0].remainderIn, 39.625);

const user1Estimate = estimateResolvedBoardPlan(catalog, user1, {
  title: "Start Your Own — two finished X-brace members",
  spotCycles: 0
});
assert.equal(user1Estimate.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(user1Estimate.totals.material, 3.13);
assert.equal(user1Estimate.cycle.T_job_min, null);
assert.equal(user1Estimate.totals.cell_recovery, null);
assert.equal(user1Estimate.totals.Q, user1Estimate.totals.material);
assert.equal(user1Estimate.engine.version, "0.4.0");

console.log("store-zero-stage2.test.mjs ok");
console.log("skuCount", catalog.skuCount);
console.log("observations", observations.observations.length);
console.log("pine Q", ticket.totals.Q);
