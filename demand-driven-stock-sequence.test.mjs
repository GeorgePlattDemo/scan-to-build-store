import assert from "node:assert/strict";
import {
  loadCatalog,
  resolveBoardMaterial,
  estimateResolvedBoardPlan,
  BOARD_SEQUENCE_POLICY
} from "./store-zero-stage2-store.mjs";

const catalog = loadCatalog();
const baseDemand = Object.freeze({
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

function expectNamedFailure(name, fn) {
  assert.throws(fn, (error) => error instanceof Error && error.message === name);
}

function assertPlanDemandConsistency(plan, demand) {
  if (plan.intermediateBlank && (!plan.intermediateBlank.reason || !plan.intermediateBlank.source)) {
    throw new Error("ASSERT_UNJUSTIFIED_INTERMEDIATE_BLANK");
  }
  if (
    Number(plan.finishedPart.lengthIn) !== Number(demand.finishedPartLengthIn) ||
    Number(plan.finishedPart.quantity) !== Number(demand.quantity)
  ) {
    throw new Error("ASSERT_STOCK_LENGTH_OVERWRITES_FINISHED_GEOMETRY");
  }
}

function assertPricedPlanConsistency(plan, estimate) {
  if (
    Number(estimate.operationAccounting.totalModeledSawCuts) !==
    Number(plan.accounting.totalModeledSawCuts)
  ) {
    throw new Error("ASSERT_PRICED_PLAN_OMITS_NECESSARY_OPERATION");
  }
}

// Expected values below are independently stated from geometry/catalog facts:
// 72 - .125 establish kerf - 2 * (16 + .125) = 39.625 in.
// 30-degree wide-face traverse = 3.5/cos(30deg), with the existing Stage-2 cycle constants.
// A. Direct use. No intermediate blank.
const direct = resolveBoardMaterial(catalog, baseDemand);
assert.equal(direct.status, "MAPPED");
assert.equal(direct.selectionPolicy.id, "FEWEST_PARENTS_THEN_SHORTEST_PARENT");
assert.equal(direct.selectionPolicy.basis, BOARD_SEQUENCE_POLICY.basis);
assert.equal(direct.plan.selected.storeSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(direct.plan.selected.parentStockLengthIn, 72);
assert.equal(direct.plan.selected.parentCount, 1);
assert.equal(direct.plan.intermediateBlank, null);
assert.equal(direct.plan.noPreparationRequired, true);
assert.equal(direct.plan.accounting.productionSawCuts, 3);
assert.equal(direct.plan.accounting.preparationSawCuts, 0);
assert.equal(direct.plan.parents[0].remainderIn, 39.625);
assert.equal(direct.plan.parents[0].retainedControlSatisfied, true);
assertPlanDemandConsistency(direct.plan, baseDemand);

const directEstimate = estimateResolvedBoardPlan(catalog, direct, {
  title: "Demand-driven direct-use acceptance",
  spotCycles: 0
});
assert.equal(directEstimate.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(directEstimate.totals.material, 3.13);
assert.equal(directEstimate.cycle.T_job_min, null);
assert.equal(directEstimate.totals.cell_recovery, null);
assert.equal(directEstimate.totals.Q, directEstimate.totals.material);
assertPricedPlanConsistency(direct.plan, directEstimate);

// B. A different eligible Store offering changes parent/sequence/remainder, not finished demand.
const catalog96 = structuredClone(catalog);
for (const item of catalog96.offerings) {
  if (item.species === "spf" && item.form === "board" && item.nominalT === 2 && item.nominalW === 4) {
    item.offered = item.stockL_in === 96;
  }
}
const only96 = resolveBoardMaterial(catalog96, baseDemand);
assert.equal(only96.status, "MAPPED");
assert.equal(only96.finishedPartLengthIn, 16);
assert.equal(only96.quantity, 2);
assert.equal(only96.plan.selected.parentStockLengthIn, 96);
assert.equal(only96.plan.parents[0].remainderIn, 63.625);
assert.equal(only96.plan.accounting.productionSawCuts, 3);

// C. A requested finished blank creates a named, sourced, priced preparation operation.
const prepDemand = {
  ...baseDemand,
  requestedFinishedBlankLengthIn: 64,
  requestedFinishedBlankSource: "ACCEPTANCE_CASE_C.REQUESTED_FINISHED_BLANK"
};
const prepared = resolveBoardMaterial(catalog, prepDemand);
assert.equal(prepared.status, "MAPPED");
assert.equal(prepared.plan.selected.parentStockLengthIn, 96);
assert.equal(prepared.plan.intermediateBlank.lengthIn, 64);
assert.equal(prepared.plan.intermediateBlank.reason, "REQUESTED_FINISHED_BLANK");
assert.equal(prepared.plan.preparation.length, 1);
assert.equal(prepared.plan.preparation[0].source, "ACCEPTANCE_CASE_C.REQUESTED_FINISHED_BLANK");
assert.equal(prepared.plan.accounting.productionSawCuts, 3);
assert.equal(prepared.plan.accounting.preparationSawCuts, 1);
assert.equal(prepared.plan.parents[0].remainderIn, 31.625);
const preparedEstimate = estimateResolvedBoardPlan(catalog, prepared, {
  title: "Demand-driven requested-blank acceptance",
  spotCycles: 0
});
assert.equal(preparedEstimate.totals.material, 4.18);
assert.equal(preparedEstimate.cycle.T_job_min, null);
assert.equal(preparedEstimate.totals.cell_recovery, null);
assert.equal(preparedEstimate.totals.Q, preparedEstimate.totals.material);
assertPricedPlanConsistency(prepared.plan, preparedEstimate);

// D. Bad/short stock is refused/unavailable; the finished job is never resized.
const shortCatalog = structuredClone(catalog);
const template = shortCatalog.offerings.find((item) => item.storeSku === "STB-ZERO-SPF-2X4-72-001");
for (const item of shortCatalog.offerings) {
  if (item.species === "spf" && item.form === "board" && item.nominalT === 2 && item.nominalW === 4) item.offered = false;
}
shortCatalog.offerings.push({
  ...structuredClone(template),
  storeSku: "ACCEPTANCE-SHORT-2X4-32",
  stockL_in: 32,
  description: "Acceptance short 2x4 x 32 in",
  offered: true,
  onHand: 10,
  allocated: 0
});
shortCatalog.skuCount = shortCatalog.offerings.length;
const shortAnswer = resolveBoardMaterial(shortCatalog, baseDemand);
assert.equal(shortAnswer.status, "UNAVAILABLE");
assert.equal(shortAnswer.finishedPartLengthIn, 16);
assert.equal(shortAnswer.quantity, 2);
assert.equal(shortAnswer.reason, "NO_ELIGIBLE_STORE_STOCK_SEQUENCE");

// E. 30 degrees is supported; 46 degrees reaches Store and is refused.
assert.equal(direct.capability.status, "SUPPORTABLE");
const overAngle = resolveBoardMaterial(catalog, { ...baseDemand, sawAngleDeg: 46 });
assert.equal(overAngle.status, "REFUSED");
assert.ok(overAngle.refusalConditions.includes("MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE"));
assert.equal(overAngle.finishedPartLengthIn, 16);

// F. Spot OFF leaves the saw/material plan complete. Spot ON preserves that plan and qualifies economics.
const spotDemand = {
  required: true,
  mode: "SPOT_ON_LOCATION",
  countPerPart: 1,
  totalCount: 2,
  locationRule: "CENTERED_ON_PART",
  locationAlongLengthIn: 8,
  acrossWidthRule: "CENTERED_ON_WIDE_FACE"
};
const withSpot = resolveBoardMaterial(catalog, { ...baseDemand, spotDemand });
assert.equal(withSpot.status, "MAPPED");
assert.equal(withSpot.plan.selected.storeSku, direct.plan.selected.storeSku);
assert.equal(withSpot.plan.selected.parentStockLengthIn, direct.plan.selected.parentStockLengthIn);
assert.equal(withSpot.plan.parents[0].remainderIn, direct.plan.parents[0].remainderIn);
assert.ok(withSpot.plan.unresolvedConditions.includes("SPOT_TOOL_POINT_GEOMETRY_REQUIRED"));
const spotEstimate = estimateResolvedBoardPlan(catalog, withSpot, {
  title: "Demand-driven spot-on acceptance",
  spotCycles: 2
});
assert.equal(spotEstimate.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(spotEstimate.totals.material, 3.13);
assert.equal(spotEstimate.totals.cell_recovery, null);
assert.equal(spotEstimate.totals.Q, spotEstimate.totals.material);
assert.equal(spotEstimate.totals.Q_basis, "PARTIAL_CALCULATED");
assert.ok(spotEstimate.unresolved.includes("SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED"));

// Qty edit: four 16-in parts cannot remain on one 72-in parent; one 96-in parent is selected.
const qty4 = resolveBoardMaterial(catalog, { ...baseDemand, quantity: 4 });
assert.equal(qty4.status, "MAPPED");
assert.equal(qty4.plan.selected.storeSku, "STB-ZERO-SPF-2X4-96-001");
assert.equal(qty4.plan.selected.parentCount, 1);
assert.equal(qty4.plan.parents[0].remainderIn, 31.375);
assert.equal(qty4.plan.accounting.productionSawCuts, 5);

// Length edit: 16.5 remains one 72-in parent and recomputes remainder.
const length165 = resolveBoardMaterial(catalog, { ...baseDemand, finishedPartLengthIn: 16.5 });
assert.equal(length165.status, "MAPPED");
assert.equal(length165.plan.selected.storeSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(length165.plan.parents[0].remainderIn, 38.625);

// Fault copies must fail the named assertion, not merely crash elsewhere.
const unjustifiedBlank = structuredClone(direct.plan);
unjustifiedBlank.intermediateBlank = { lengthIn: 60, reason: "", source: "" };
expectNamedFailure("ASSERT_UNJUSTIFIED_INTERMEDIATE_BLANK", () =>
  assertPlanDemandConsistency(unjustifiedBlank, baseDemand)
);

const overwrittenFinished = structuredClone(direct.plan);
overwrittenFinished.finishedPart.lengthIn = overwrittenFinished.selected.parentStockLengthIn;
expectNamedFailure("ASSERT_STOCK_LENGTH_OVERWRITES_FINISHED_GEOMETRY", () =>
  assertPlanDemandConsistency(overwrittenFinished, baseDemand)
);

const omittedOperationEstimate = structuredClone(directEstimate);
omittedOperationEstimate.operationAccounting.totalModeledSawCuts -= 1;
expectNamedFailure("ASSERT_PRICED_PLAN_OMITS_NECESSARY_OPERATION", () =>
  assertPricedPlanConsistency(direct.plan, omittedOperationEstimate)
);

console.log("demand-driven-stock-sequence.test.mjs ok");
