import assert from "node:assert/strict";
import {
  evaluateDimensionalStoreRequest,
  evaluateDimensionalWholeParentJob,
  loadCatalog
} from "./store-zero-stage2-store.mjs";
import { D001_WHOLE_PARENT_BOARD_RUN } from "./d001-travel-standard.mjs";

const catalog = loadCatalog();
const STORE_REVISION = process.env.STB_STORE_REVISION || "LOCAL_UNPINNED_STORE_REVISION";
const shelfElevations = [12, 24, 36, 45, 65];

// This is a candidate bridge demand used to prove the reusable Store pattern.
 // The current visible Alcove has not yet bound its pilot target roles to a
 // specific 72-in parent, so this test must not be cited as a complete project run.
function demand({ pilot = false } = {}) {
  const features = pilot
    ? shelfElevations.map((xIn, index) => ({
        featureId: "ALCOVE-L-SPOT-" + String(index + 1).padStart(2, "0"),
        kind: "SPOT_ON_LOCATION",
        xIn,
        acrossWidthRule: "CENTERED_ON_WIDE_FACE",
        toolDiameterIn: 0.1875
      }))
    : [];
  return {
    executionPattern: D001_WHOLE_PARENT_BOARD_RUN.executionPattern,
    title: "Alcove bridge candidate — 72-in representative whole-parent upright",
    classId: "alcove.insert.square_shelves",
    configurationId: "ALCOVE-DEFAULT-2026-09-22",
    configurationVersion: pilot ? "pilot-on" : "pilot-off",
    definedWorkpieceLengthIn: 72,
    materialDemand: {
      species: "pine",
      form: "board",
      nominalT: 1,
      nominalW: 6
    },
    requiredOps: pilot ? ["SPOT_ON_LOCATION"] : [],
    datumCMethod: "MECHANICAL_REFERENCE",
    parts: [{
      partId: "LEFT_UPRIGHT",
      lengthIn: 72,
      features
    }],
    declaredSawCuts: 0,
    declaredSpotCount: features.length,
    unresolvedConditions: [],
    storeRevision: STORE_REVISION
  };
}

const off = evaluateDimensionalWholeParentJob(catalog, demand({ pilot: false }));
assert.equal(off.status, "SUPPORTABLE");
assert.equal(off.materialResolution.pricingReferenceSku, "STB-ZERO-PINE-1X6-72-001");
assert.equal(off.materialResolution.pricingReferenceStockLengthIn, 72);
assert.equal(off.materialResolution.workpieceLengthIn, 72);
assert.equal(off.materialResolution.selectionPolicy, "EXACT_COMPLETE_STORE_OFFERING");
assert.equal(off.estimate.complete, true);
assert.equal(off.estimate.completeness, "COMPLETE_FOR_WHOLE_PARENT_TRAVEL_STANDARD");
assert.equal(off.estimate.executionPattern.id, "STB-D001-WHOLE-PARENT-BOARD-RUN-0.1");
assert.equal(off.estimate.travel.wholeParent, true);
assert.equal(off.estimate.travel.retainedControlRuleApplied, false);
assert.equal(off.estimate.travel.derivedSawCuts, 0);
assert.equal(off.estimate.travel.derivedSpotCount, 0);
assert.equal(off.estimate.travel.finalRemainderIn, null);
assert.equal(off.estimate.travel.time.T_SAW_sec, 0);
assert.equal(off.estimate.travel.time.T_MACHINE_min, 1);
assert.equal(off.estimate.totals.material, 15.74);
assert.equal(off.estimate.totals.machine_service, 4.17);
assert.equal(off.estimate.totals.Q, 19.91);
assert.ok(off.estimate.travel.operationPlan.every((op) => op.kind !== "REFERENCE_CUT"));
assert.ok(off.estimate.travel.operationPlan.every((op) => op.kind !== "MITER_CUTOFF"));

const on = evaluateDimensionalWholeParentJob(catalog, demand({ pilot: true }));
assert.equal(on.status, "SUPPORTABLE");
assert.equal(on.materialResolution.pricingReferenceSku, "STB-ZERO-PINE-1X6-72-001");
assert.equal(on.estimate.travel.derivedSawCuts, 0);
assert.equal(on.estimate.travel.derivedSpotCount, 5);
assert.equal(on.estimate.travel.retainedControlRuleApplied, false);
assert.equal(on.estimate.travel.time.T_MACHINE_sec, 80.625);
assert.equal(on.estimate.travel.time.T_MACHINE_min, 1.3438);
assert.equal(on.estimate.totals.material, 15.74);
assert.equal(on.estimate.totals.machine_service, 5.6);
assert.equal(on.estimate.totals.Q, 21.34);
assert.equal(on.estimate.travel.operationPlan.filter((op) => op.kind === "SPOT_ON_LOCATION").length, 5);
assert.deepEqual(
  on.estimate.travel.operationPlan
    .filter((op) => op.kind === "SPOT_ON_LOCATION")
    .map((op) => [op.partId, op.partRelativeXIn, op.acrossWidthIn, op.toolDiameterIn]),
  [
    ["LEFT_UPRIGHT", 12, 2.75, 0.1875],
    ["LEFT_UPRIGHT", 24, 2.75, 0.1875],
    ["LEFT_UPRIGHT", 36, 2.75, 0.1875],
    ["LEFT_UPRIGHT", 45, 2.75, 0.1875],
    ["LEFT_UPRIGHT", 65, 2.75, 0.1875]
  ]
);
assert.ok(on.estimate.totals.Q > off.estimate.totals.Q);

// Exact whole-parent identity is preserved. Removing 72-in stock must not let
// Store silently substitute a 96-in parent and invent a trimming operation.
const without72 = structuredClone(catalog);
without72.offerings = without72.offerings.filter((o) => o.storeSku !== "STB-ZERO-PINE-1X6-72-001");
without72.skuCount = without72.offerings.length;
const noExactParent = evaluateDimensionalWholeParentJob(without72, demand({ pilot: false }));
assert.equal(noExactParent.status, "REFUSED");
assert.equal(noExactParent.materialResolution.reason, "NO_COMPLETE_WHOLE_PARENT_CANDIDATE");
assert.equal(noExactParent.materialResolution.consideredCandidates[0].storeSku, "STB-ZERO-PINE-1X6-96-001");
assert.equal(noExactParent.materialResolution.consideredCandidates[0].reason, "WHOLE_PARENT_EXACT_STOCK_LENGTH_REQUIRED");

// Whole-parent scope does not become generic drilling or arbitrary spot tooling.
const genericDrill = structuredClone(demand({ pilot: false }));
genericDrill.requiredOps = ["DRILL"];
const drillRefused = evaluateDimensionalWholeParentJob(catalog, genericDrill);
assert.equal(drillRefused.status, "REFUSED");
assert.equal(drillRefused.materialResolution.reason, "WHOLE_PARENT_OPERATION_NOT_DECLARED");

const wrongSpotTool = structuredClone(demand({ pilot: true }));
wrongSpotTool.parts[0].features[0].toolDiameterIn = 0.25;
const wrongToolRefused = evaluateDimensionalWholeParentJob(catalog, wrongSpotTool);
assert.equal(wrongToolRefused.status, "REFUSED");
assert.equal(
  wrongToolRefused.materialResolution.consideredCandidates[0].reason,
  "SPOT_TOOL_DIAMETER_NOT_DECLARED"
);

// Formal Store request dispatches the explicit pattern and still produces a
// fresh Store receipt; no cached project answer becomes authority.
const formal = evaluateDimensionalStoreRequest(catalog, demand({ pilot: true }), {
  requestId: "ALCOVE-WHOLE-PARENT-REQ-001",
  evaluatedAt: "2026-09-22T21:00:00-04:00",
  storeRevision: STORE_REVISION
});
assert.equal(formal.status, "SUPPORTABLE");
assert.equal(formal.freshEvaluation, true);
assert.equal(formal.evaluationReceipt.requestId, "ALCOVE-WHOLE-PARENT-REQ-001");
assert.equal(formal.estimate.executionPattern.executionPattern, "WHOLE_PARENT_BOARD_RUN");
assert.equal(formal.estimate.totals.Q, 21.34);

console.log("d001-whole-parent-board-run.test.mjs ok — reusable Store pattern proven with candidate Alcove bridge demand");
console.log("pilot OFF Q", off.estimate.totals.Q, "minutes", off.estimate.travel.time.T_MACHINE_min);
console.log("pilot ON Q", on.estimate.totals.Q, "minutes", on.estimate.travel.time.T_MACHINE_min);
console.log("exact-parent fallback", noExactParent.status, noExactParent.materialResolution.consideredCandidates);
