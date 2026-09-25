import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  loadCatalog,
  evaluateDimensionalTravelJob,
  evaluateDimensionalStoreRequest,
  requestDimensionalStoreEvaluation,
  STORE_EVALUATION_FRESHNESS
} from "./store-zero-stage2-store.mjs";
import {
  D001_TRAVEL_STANDARD,
  storeMachineSellRate
} from "./d001-travel-standard.mjs";
import { USER1_DIMENSIONAL_TRAVEL_DEMAND } from "./user1-dimensional-travel-fixture.mjs";

const catalog = loadCatalog();

const STORE_REVISION = process.env.STB_STORE_REVISION || "LOCAL_UNPINNED_STORE_REVISION";
const USER1 = { ...structuredClone(USER1_DIMENSIONAL_TRAVEL_DEMAND), storeRevision: STORE_REVISION };

const passA = evaluateDimensionalTravelJob(catalog, USER1);
const passB = evaluateDimensionalTravelJob(catalog, structuredClone(USER1));

assert.equal(passA.status, "SUPPORTABLE");
assert.equal(passA.estimate.status, "BUDGETARY_ESTIMATE");
assert.equal(passA.estimate.complete, true);
assert.equal(passA.estimate.completeness, "COMPLETE_FOR_TRAVEL_STANDARD");
assert.deepEqual(passA.estimate.unresolved, []);
assert.equal(passA.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-60-001");
assert.equal(passA.materialResolution.pricingReferenceStockLengthIn, 60);
assert.equal(passA.materialResolution.workpieceLengthIn, 60);
assert.equal(passA.materialResolution.selectionPolicy, "SHORTEST_COMPLETE_STORE_OFFERING");
assert.equal(passA.estimate.totals.material, 2.61);
assert.equal(passA.estimate.travel.derivedSawCuts, 3);
assert.equal(passA.estimate.travel.derivedSpotCount, 2);
assert.equal(passA.estimate.travel.finalRemainderIn, 27.625);
assert.equal(passA.estimate.travel.time.T_MACHINE_min, 1.4227);
assert.equal(passA.estimate.totals.machine_service, 5.93);
assert.equal(passA.estimate.totals.Q, 8.54);

const ops = passA.estimate.travel.operationPlan;
assert.equal(ops.filter((op) => op.kind === "REFERENCE_CUT").length, 1);
assert.equal(ops.filter((op) => op.kind === "MITER_CUTOFF").length, 2);
assert.equal(ops.filter((op) => op.kind === "SPOT_ON_LOCATION").length, 2);
assert.deepEqual(
  ops.filter((op) => op.kind === "SPOT_ON_LOCATION").map((op) => [op.partId, op.partRelativeXIn, op.acrossWidthIn]),
  [["PART-1", 8, 1.75], ["PART-2", 8, 1.75]]
);
assert.ok(ops.every((op) => op.kind !== "DRILL"), "SPOT_ON_LOCATION was silently converted to generic DRILL");
assert.ok(passA.estimate.travel.positionValidRequired);

const rates = storeMachineSellRate();
assert.equal(rates.breakEvenPerHour, 200);
assert.equal(rates.sellRatePerHour, 250);
assert.equal(passA.estimate.economics.setupCharge, 0);
assert.equal(passA.estimate.economics.setupTimeMin, 0);
assert.equal(passA.estimate.economics.targetGrossMargin, 0.20);

assert.equal(passA.estimate.travel.configurationVersion, "0.1");
assert.equal(passA.calculationIdentity.inputHash, passB.calculationIdentity.inputHash);
assert.equal(passA.calculationIdentity.resultHash, passB.calculationIdentity.resultHash);
assert.equal(passA.estimate.totals.Q, passB.estimate.totals.Q);


const USER1_18 = structuredClone(USER1);
USER1_18.configurationVersion = "0.2";
USER1_18.parts = USER1_18.parts.map((part, index) => ({
  ...part,
  lengthIn: 18,
  features: part.features.map((feature) => ({
    ...feature,
    featureId: "SPOT-" + (index + 1),
    xIn: 9
  }))
}));
const resolved18 = evaluateDimensionalTravelJob(catalog, USER1_18);
assert.equal(resolved18.status, "SUPPORTABLE");
assert.equal(resolved18.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(resolved18.materialResolution.pricingReferenceStockLengthIn, 72);
assert.equal(resolved18.materialResolution.workpieceLengthIn, 72);
assert.equal(resolved18.materialResolution.selectionPolicy, "SHORTEST_COMPLETE_STORE_OFFERING");
assert.deepEqual(
  resolved18.materialResolution.consideredCandidates.slice(0, 2).map((entry) => [
    entry.storeSku,
    entry.stockLengthIn,
    entry.candidateStatus,
    entry.reason
  ]),
  [
    ["STB-ZERO-SPF-2X4-60-001", 60, "REFUSED", "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL"],
    ["STB-ZERO-SPF-2X4-72-001", 72, "SUPPORTABLE", null]
  ]
);
assert.equal(resolved18.estimate.travel.finalRemainderIn, 35.625);

// The real catalog ladder is itself the extensibility proof. A larger demand
// walks the same Store candidates in order without any project-specific SKU rule:
// 60 fails, 72 fails, 96 passes.
const USER1_24 = structuredClone(USER1);
USER1_24.configurationVersion = "0.3";
USER1_24.parts = USER1_24.parts.map((part, index) => ({
  ...part,
  lengthIn: 24,
  features: part.features.map((feature) => ({
    ...feature,
    featureId: "SPOT-" + (index + 1),
    xIn: 12
  }))
}));
const resolved24 = evaluateDimensionalTravelJob(catalog, USER1_24);
assert.equal(resolved24.status, "SUPPORTABLE");
assert.equal(resolved24.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-96-001");
assert.equal(resolved24.materialResolution.pricingReferenceStockLengthIn, 96);
assert.equal(resolved24.materialResolution.workpieceLengthIn, 96);
assert.deepEqual(
  resolved24.materialResolution.consideredCandidates.slice(0, 3).map((entry) => [
    entry.storeSku,
    entry.stockLengthIn,
    entry.candidateStatus,
    entry.reason
  ]),
  [
    ["STB-ZERO-SPF-2X4-60-001", 60, "REFUSED", "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL"],
    ["STB-ZERO-SPF-2X4-72-001", 72, "REFUSED", "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL"],
    ["STB-ZERO-SPF-2X4-96-001", 96, "SUPPORTABLE", null]
  ]
);
assert.equal(resolved24.estimate.travel.finalRemainderIn, 47.625);

// Removing a SKU is equally data-driven: the 16-in job falls through to 72
// without changing resolver code.
const catalogWithout60 = structuredClone(catalog);
catalogWithout60.offerings = catalogWithout60.offerings.filter((o) => o.storeSku !== "STB-ZERO-SPF-2X4-60-001");
catalogWithout60.skuCount = catalogWithout60.offerings.length;
const fallback16 = evaluateDimensionalTravelJob(catalogWithout60, USER1);
assert.equal(fallback16.status, "SUPPORTABLE");
assert.equal(fallback16.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(fallback16.materialResolution.pricingReferenceStockLengthIn, 72);

// Every formal Store submission is a fresh evaluation with a new receipt.
// The same definition may calculate to the same Q, but the prior answer is never
// accepted as authority for a later Store request.
const requestA = evaluateDimensionalStoreRequest(structuredClone(catalog), USER1, {
  requestId: "USER1-REQ-A",
  evaluatedAt: "2026-09-22T18:30:00.000Z",
  storeRevision: STORE_REVISION
});
const requestB = evaluateDimensionalStoreRequest(structuredClone(catalog), USER1, {
  requestId: "USER1-REQ-B",
  evaluatedAt: "2026-09-22T18:31:00.000Z",
  storeRevision: STORE_REVISION
});
assert.equal(STORE_EVALUATION_FRESHNESS.rule, "EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE");
assert.equal(STORE_EVALUATION_FRESHNESS.priorAnswerMayAuthorizeNewRequest, false);
assert.equal(requestA.freshEvaluation, true);
assert.equal(requestB.freshEvaluation, true);
assert.equal(requestA.evaluationReceipt.requestId, "USER1-REQ-A");
assert.equal(requestB.evaluationReceipt.requestId, "USER1-REQ-B");
assert.notEqual(requestA.evaluationReceipt.receiptHash, requestB.evaluationReceipt.receiptHash);
assert.equal(requestA.calculationIdentity.inputHash, requestB.calculationIdentity.inputHash);
assert.equal(requestA.calculationIdentity.resultHash, requestB.calculationIdentity.resultHash);
assert.equal(requestA.estimate.totals.Q, requestB.estimate.totals.Q);

// A Store price change must alter the current evaluation rather than allowing the
// previously returned Q to survive as authority.
const repricedCatalog = structuredClone(catalog);
const repricedItem = repricedCatalog.offerings.find((o) => o.storeSku === "STB-ZERO-SPF-2X4-60-001");
repricedItem.sellingPrice = 2.99;
const repriced = evaluateDimensionalStoreRequest(repricedCatalog, USER1, {
  requestId: "USER1-REQ-PRICE-CHANGED",
  evaluatedAt: "2026-09-22T18:32:00.000Z",
  storeRevision: STORE_REVISION + "-PRICE-CHANGED"
});
assert.equal(repriced.freshEvaluation, true);
assert.equal(repriced.status, "SUPPORTABLE");
assert.equal(repriced.estimate.totals.material, 2.99);
assert.notEqual(repriced.estimate.totals.Q, requestA.estimate.totals.Q);
assert.notEqual(repriced.calculationIdentity.inputHash, requestA.calculationIdentity.inputHash);
assert.notEqual(repriced.calculationIdentity.resultHash, requestA.calculationIdentity.resultHash);
assert.notEqual(repriced.evaluationReceipt.authority.catalogHash, requestA.evaluationReceipt.authority.catalogHash);

// A capability failure on the current request must surface immediately and carry
// a fresh receipt; the prior supportable answer cannot be reused.
const capabilityChanged = structuredClone(USER1);
capabilityChanged.sawAngleDeg = 46;
const refusedCurrent = evaluateDimensionalStoreRequest(structuredClone(catalog), capabilityChanged, {
  requestId: "USER1-REQ-CAPABILITY-CHANGED",
  evaluatedAt: "2026-09-22T18:33:00.000Z",
  storeRevision: STORE_REVISION
});
assert.equal(refusedCurrent.freshEvaluation, true);
assert.equal(refusedCurrent.status, "REFUSED");
assert.equal(refusedCurrent.evaluationReceipt.status, "REFUSED");
assert.equal(refusedCurrent.calculationIdentity, null);

// Formal request API fails closed without a request identity and reloads Store
// state internally instead of accepting a cached prior answer.
const missingRequestIdentity = requestDimensionalStoreEvaluation(USER1, {
  evaluatedAt: "2026-09-22T18:34:00.000Z",
  storeRevision: STORE_REVISION
});
assert.equal(missingRequestIdentity.status, "UNRESOLVED");
assert.equal(missingRequestIdentity.freshEvaluation, false);
assert.ok(missingRequestIdentity.unresolvedConditions.includes("STORE_EVALUATION_REQUEST_ID_REQUIRED"));

const missingSpotCoordinate = structuredClone(USER1);
delete missingSpotCoordinate.parts[1].features[0].xIn;
const unresolved = evaluateDimensionalTravelJob(catalog, missingSpotCoordinate);
assert.equal(unresolved.status, "UNRESOLVED");
assert.equal(unresolved.estimate.status, "UNRESOLVED");
assert.equal(unresolved.estimate.complete, false);
assert.ok(unresolved.estimate.unresolved.includes("SPOT_LOCATION_REQUIRED"));
assert.equal(unresolved.estimate.totals, undefined);

const badAngle = structuredClone(USER1);
badAngle.sawAngleDeg = 46;
const refused = evaluateDimensionalTravelJob(catalog, badAngle);
assert.equal(refused.status, "REFUSED");

const mismatch = structuredClone(USER1);
mismatch.declaredSpotCount = 1;
const countMismatch = evaluateDimensionalTravelJob(catalog, mismatch);
assert.equal(countMismatch.status, "UNRESOLVED");
assert.ok(countMismatch.estimate.unresolved.includes("DECLARED_SPOT_COUNT_MISMATCH"));

const storeSource = readFileSync(new URL("./store-zero-stage2-store.mjs", import.meta.url), "utf8");
assert.match(
  storeSource,
  /return evaluateDimensionalStoreRequest\(loadCatalog\(\), demand, request\)/,
  "formal Store request no longer reloads current catalog state"
);
assert.equal(
  /prior(Store)?Answer/.test(storeSource) && /accepted as an input/.test(storeSource),
  true,
  "fresh-evaluation anti-cache invariant disappeared from Store source"
);

const engineSource = readFileSync(new URL("./store-zero-pricing-engine.mjs", import.meta.url), "utf8");
for (const rejected of ["setupCharge: 35", "machineHourRate: 100", "jobSetupMin: 8"]) {
  assert.equal(engineSource.includes(rejected), false, "rejected legacy constant returned: " + rejected);
}

assert.equal(D001_TRAVEL_STANDARD.measured, false);
assert.equal(D001_TRAVEL_STANDARD.commissioned, false);
assert.equal(D001_TRAVEL_STANDARD.basis, "DECLARED_STAGE2_MODEL");

console.log("d001-travel-standard.test.mjs ok");
console.log("User 1 Q", passA.estimate.totals.Q);
console.log("User 1 modeled minutes", passA.estimate.travel.time.T_MACHINE_min);
console.log("User 1 Store SKU", passA.materialResolution.pricingReferenceSku);
console.log("18-in Store SKU", resolved18.materialResolution.pricingReferenceSku);
console.log("18-in Q", resolved18.estimate.totals.Q);
console.log("18-in modeled minutes", resolved18.estimate.travel.time.T_MACHINE_min);
console.log("24-in Store SKU", resolved24.materialResolution.pricingReferenceSku);
console.log("inputHash", passA.calculationIdentity.inputHash);
console.log("resultHash", passA.calculationIdentity.resultHash);
