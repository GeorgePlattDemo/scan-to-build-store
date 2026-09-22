import assert from "node:assert/strict";
import {
  loadCatalog,
  loadObservations,
  findSku,
  pineAlcoveEvaluation,
  evaluateDimensionalTravelJob
} from "./store-zero-stage2-store.mjs";
import { estimatePineAlcove, sellingPrice, ENGINE } from "./store-zero-pricing-engine.mjs";
import { USER1_DIMENSIONAL_TRAVEL_DEMAND } from "./user1-dimensional-travel-fixture.mjs";

const catalog = loadCatalog();
const observations = loadObservations();

assert.equal(catalog.skuCount, catalog.offerings.length);
assert.ok(catalog.skuCount >= 1);
assert.equal(new Set(catalog.offerings.map((o) => o.storeSku)).size, catalog.offerings.length, "Store SKU ids must be unique");
assert.equal(observations.observations.length, 20);
assert.equal(catalog.pricingRule.ruleId, "SZ-MARK-ON-5");
assert.equal(catalog.pricingRule.basis, "DECLARED_FIXTURE");

const spf60 = findSku(catalog, "STB-ZERO-SPF-2X4-60-001");
assert.ok(spf60, "60-in SPF 2x4 offering is missing");
assert.equal(spf60.stockL_in, 60);
assert.equal(spf60.listReferenceBasis, "CALCULATED");
assert.equal(spf60.list_reference, 2.49);
assert.equal(spf60.sellingPrice, 2.61);
assert.equal(spf60.assertions.listReferenceDerivation.basis, "CALCULATED");
assert.equal(spf60.assertions.listReferenceDerivation.sourceObservationId, "OBS-001");


const spf72Modeled = findSku(catalog, "STB-ZERO-SPF-2X4-72-001");
const spf96Observed = findSku(catalog, "STB-ZERO-SPF-2X4-96-001");
assert.ok(spf72Modeled && spf96Observed);
assert.ok(spf60.sellingPrice < spf72Modeled.sellingPrice);
assert.ok(spf72Modeled.sellingPrice < spf96Observed.sellingPrice);
const sameClassPricePerIn = [spf60, spf72Modeled, spf96Observed].map((o) => o.sellingPrice / o.stockL_in);
assert.ok(
  Math.max(...sameClassPricePerIn) - Math.min(...sameClassPricePerIn) < 0.001,
  "modeled SPF 2x4 length ladder lost its declared price/length correlation"
);

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
    assert.ok(observations.observations.find((x) => x.id === o.observationId), o.observationId);
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

// Alcove material/sourced truth is preserved, but complete Q is intentionally
// withheld until the Alcove configurator emits the governing travel-standard demand.
const ticket = estimatePineAlcove(catalog);
assert.equal(ticket.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(ticket.totals.material, 272.86);
assert.equal(ticket.hardware_line.extension, 18);
assert.equal(ticket.totals.Q, null);
assert.ok(ticket.unresolvedConditions.includes("DIMENSIONAL_TRAVEL_STANDARD_INPUT_REQUIRED"));

const alcoveCapability = pineAlcoveEvaluation(catalog);
assert.equal(alcoveCapability.status, "SUPPORTABLE");
assert.equal(alcoveCapability.lines[0].stock.assertions.onHand.basis, "SYNTHETIC_FIXTURE");

// User 1 is the first complete job under the new governing standard.
const user1 = evaluateDimensionalTravelJob(catalog, {
  ...structuredClone(USER1_DIMENSIONAL_TRAVEL_DEMAND),
  storeRevision: process.env.STB_STORE_REVISION || "LOCAL_UNPINNED_STORE_REVISION"
});
assert.equal(user1.status, "SUPPORTABLE");
assert.equal(user1.estimate.complete, true);
assert.equal(user1.estimate.travel.derivedSawCuts, 3);
assert.equal(user1.estimate.travel.derivedSpotCount, 2);
assert.equal(user1.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-60-001");
assert.equal(user1.materialResolution.pricingReferenceStockLengthIn, 60);
assert.equal(user1.materialResolution.selectionPolicy, "SHORTEST_COMPLETE_STORE_OFFERING");
assert.equal(user1.estimate.totals.material, 2.61);
assert.equal(user1.estimate.totals.machine_service, 5.89);
assert.equal(user1.estimate.totals.Q, 8.50);
assert.equal(user1.estimate.travel.time.T_MACHINE_min, 1.4128);
assert.equal(user1.estimate.engine.version, "0.3.0");
assert.equal(ENGINE.version, "0.3.0");

console.log("store-zero-stage2.test.mjs ok");
console.log("skuCount", catalog.skuCount);
console.log("observations", observations.observations.length);
console.log("User 1 Q", user1.estimate.totals.Q);
