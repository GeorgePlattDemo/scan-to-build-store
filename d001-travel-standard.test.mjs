import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  loadCatalog,
  evaluateDimensionalTravelJob
} from "./store-zero-stage2-store.mjs";
import {
  D001_TRAVEL_STANDARD,
  storeMachineSellRate
} from "./d001-travel-standard.mjs";
import { USER1_DIMENSIONAL_TRAVEL_DEMAND } from "./user1-dimensional-travel-fixture.mjs";

const catalog = loadCatalog();

const USER1 = { ...structuredClone(USER1_DIMENSIONAL_TRAVEL_DEMAND), storeRevision: "TESTED_BRANCH_REVISION" };

const passA = evaluateDimensionalTravelJob(catalog, USER1);
const passB = evaluateDimensionalTravelJob(catalog, structuredClone(USER1));

assert.equal(passA.status, "SUPPORTABLE");
assert.equal(passA.estimate.status, "BUDGETARY_ESTIMATE");
assert.equal(passA.estimate.complete, true);
assert.equal(passA.estimate.completeness, "COMPLETE_FOR_TRAVEL_STANDARD");
assert.deepEqual(passA.estimate.unresolved, []);
assert.equal(passA.materialResolution.pricingReferenceSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(passA.estimate.totals.material, 3.13);
assert.equal(passA.estimate.travel.derivedSawCuts, 3);
assert.equal(passA.estimate.travel.derivedSpotCount, 2);
assert.equal(passA.estimate.travel.finalRemainderIn, 27.625);
assert.equal(passA.estimate.travel.time.T_MACHINE_min, 1.4128);
assert.equal(passA.estimate.totals.machine_service, 5.89);
assert.equal(passA.estimate.totals.Q, 9.02);

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

assert.equal(passA.calculationIdentity.inputHash, passB.calculationIdentity.inputHash);
assert.equal(passA.calculationIdentity.resultHash, passB.calculationIdentity.resultHash);
assert.equal(passA.estimate.totals.Q, passB.estimate.totals.Q);

const missingSpotCoordinate = structuredClone(USER1);
delete missingSpotCoordinate.parts[1].features[0].xIn;
const unresolved = evaluateDimensionalTravelJob(catalog, missingSpotCoordinate);
assert.equal(unresolved.status, "UNRESOLVED");
assert.equal(unresolved.estimate, null);

const badAngle = structuredClone(USER1);
badAngle.sawAngleDeg = 46;
const refused = evaluateDimensionalTravelJob(catalog, badAngle);
assert.equal(refused.status, "REFUSED");

const mismatch = structuredClone(USER1);
mismatch.declaredSpotCount = 1;
const countMismatch = evaluateDimensionalTravelJob(catalog, mismatch);
assert.equal(countMismatch.status, "UNRESOLVED");
assert.ok(countMismatch.estimate.unresolved.includes("DECLARED_SPOT_COUNT_MISMATCH"));

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
console.log("inputHash", passA.calculationIdentity.inputHash);
console.log("resultHash", passA.calculationIdentity.resultHash);
