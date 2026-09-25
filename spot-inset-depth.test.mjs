import assert from "node:assert/strict";
import { loadCatalog } from "./store-zero-stage2-store.mjs";
import { ALCOVE_STORE_STANDARD, evaluateAlcoveJob } from "./alcove-store-evaluator.mjs";
import { D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
import { spotPlungeIn, spotPointLengthIn } from "./d001-travel-standard.mjs";

// Declared spot: 3/16 in wide, one depth of 3/16 in at full diameter measured after the 118 degree point.
// Placement across the board: centered, or inset 1 1/2 in or 2 in from an edge.
// Time = travel to the spot location + travel across the board + plunge to depth at feed + retract.

const catalog = loadCatalog();
const SHELVES = [12, 24, 36, 45, 65];

assert.equal(D001_STAGE2_ENVELOPE.spot.toolDiameterIn, 0.1875);
assert.equal(D001_STAGE2_ENVELOPE.spot.fullDiameterDepthIn, 0.1875);
assert.equal(D001_STAGE2_ENVELOPE.spot.pointAngleDeg, 118);
assert.equal(D001_STAGE2_ENVELOPE.spot.depthMeasuredFrom, "AFTER_DRILL_POINT");
assert.deepEqual(D001_STAGE2_ENVELOPE.spot.insetFromEdgeOptionsIn, [1.5, 2]);
assert.ok(Math.abs(spotPointLengthIn() - 0.056333) < 1e-5, "118 degree point on a 3/16 in bit is 0.0563 in long");
assert.ok(Math.abs(spotPlungeIn() - 0.243833) < 1e-5, "plunge = point + 3/16 in");

function programs({ spots = null, height = 72, depth = 14, span = 44 } = {}) {
  const out = [];
  for (let i = 0; i < 4; i += 1) {
    const componentId = `ALCOVE-UPRIGHT-${String(i + 1).padStart(2, "0")}`;
    out.push({
      componentId,
      requirementId: "ALCOVE-UPRIGHT-PARENTS",
      finishedLengthIn: height,
      finishedWidthIn: 5.5,
      // one spot per shelf on each upright board, inset from its outer edge: 4 spots per shelf
      features: spots
        ? SHELVES.map((xIn, s) => ({
            featureId: `${componentId}-SPOT-${s + 1}`,
            kind: "SPOT_ON_LOCATION",
            xIn: spots.xIn ?? xIn,
            acrossWidthRule: "INSET_FROM_EDGE",
            insetFromEdgeIn: spots.inset
          }))
        : []
    });
  }
  const across = Math.ceil(depth / 5.5);
  SHELVES.forEach((_, shelf) => {
    for (let strip = 0; strip < across; strip += 1) {
      const finishedWidthIn = Math.min(5.5, Math.max(0, depth - 5.5 * strip));
      const needsMill = finishedWidthIn < 5.5 - 1e-9;
      out.push({
        componentId: `ALCOVE-SHELF-${String(shelf + 1).padStart(2, "0")}-STRIP-${String(strip + 1).padStart(2, "0")}`,
        requirementId: "ALCOVE-SHELF-PARENTS",
        finishedLengthIn: span,
        finishedWidthIn,
        features: needsMill
          ? [{ featureId: `ALCOVE-SHELF-${shelf + 1}-STRIP-${strip + 1}-RIP`, kind: "MILL_LONGITUDINAL_PROFILE", pathLengthIn: span, yIn: finishedWidthIn, totalDepthIn: 0.75 }]
          : []
      });
    }
  });
  return out;
}

function demand({ spotsRequested = false, spots = null } = {}) {
  return {
    title: "Alcove insert - spot test",
    classId: ALCOVE_STORE_STANDARD.classId,
    configurationId: "ALCOVE-SPOT-TEST",
    configurationVersion: "1",
    materialDemand: { species: "pine", form: "board", nominalT: 1, nominalW: 6, grade: "select" },
    boardRequirements: [
      { requirementId: "ALCOVE-UPRIGHT-PARENTS", role: "UPRIGHTS", requiredOps: ["CROSSCUT"], carriesSpotDemand: true, selectionAuthority: "STORE_ZERO" },
      { requirementId: "ALCOVE-SHELF-PARENTS", role: "SHELVES", requiredOps: ["CROSSCUT"], carriesSpotDemand: false, selectionAuthority: "STORE_ZERO" }
    ],
    componentPrograms: programs({ spots }),
    hardwareDemand: { requirementId: "ALCOVE-PINS-AND-SCREWS", description: "pins + screws", qty: 1, selectionAuthority: "STORE_ZERO" },
    spotDemand: { enabled: spotsRequested, mode: "SPOT_ON_LOCATION", toolDiameterIn: 0.1875, source: "SHELF_ELEVATIONS" },
    unresolvedConditions: [],
    materialSource: "STORE_ZERO"
  };
}

const spotOps = (job) => (job.machineEvaluation?.componentPlans || []).flatMap((plan) => plan.operations.filter((op) => op.kind === "SPOT_ON_LOCATION"));

// Baseline: no spots.
const plain = evaluateAlcoveJob(catalog, demand());
assert.equal(plain.status, "SUPPORTABLE");
assert.equal(plain.machineEvaluation.time.T_DRILL_SPOT_sec, 0);

// 1 1/2 in inset: 4 spots per shelf, timed, priced, resolved.
const at15 = evaluateAlcoveJob(catalog, demand({ spotsRequested: true, spots: { inset: 1.5 } }));
assert.equal(at15.status, "SUPPORTABLE", JSON.stringify(at15.unresolvedConditions || at15.refusalConditions));
assert.ok(!at15.unresolvedConditions.includes("ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED"));
const ops15 = spotOps(at15);
assert.equal(ops15.length, 4 * SHELVES.length);
assert.ok(ops15.every((op) => op.acrossWidthIn === 1.5 && op.insetFromEdgeIn === 1.5));
assert.ok(ops15.every((op) => Math.abs(op.plungeIn - 0.243833) < 1e-5 && op.fullDiameterDepthIn === 0.1875));
assert.ok(at15.machineEvaluation.time.T_DRILL_SPOT_sec > 0, "spot drilling time is no longer zero");
assert.ok(at15.machineEvaluation.time.T_MACHINE_sec > plain.machineEvaluation.time.T_MACHINE_sec);
assert.ok(at15.estimate.totals.Q > plain.estimate.totals.Q, "spots are priced through machine time");

// 2 in inset: declared, travels further across the board.
const at2 = evaluateAlcoveJob(catalog, demand({ spotsRequested: true, spots: { inset: 2 } }));
assert.equal(at2.status, "SUPPORTABLE");
assert.ok(spotOps(at2).every((op) => op.acrossWidthIn === 2));
assert.ok(at2.machineEvaluation.time.T_DRILL_SPOT_sec > at15.machineEvaluation.time.T_DRILL_SPOT_sec);

// An inset that is not declared is refused, not rounded.
const at175 = evaluateAlcoveJob(catalog, demand({ spotsRequested: true, spots: { inset: 1.75 } }));
assert.equal(at175.status, "REFUSED");
assert.ok(JSON.stringify(at175).includes("SPOT_INSET_NOT_DECLARED"));

// A spot beyond the upright is refused.
const past = evaluateAlcoveJob(catalog, demand({ spotsRequested: true, spots: { inset: 1.5, xIn: 80 } }));
assert.equal(past.status, "REFUSED");
assert.ok(JSON.stringify(past).includes("SPOT_LOCATION_OUTSIDE_COMPONENT"));

// Spots requested without saying which upright gets them: still unresolved, as before.
const unmapped = evaluateAlcoveJob(catalog, demand({ spotsRequested: true, spots: null }));
assert.equal(unmapped.status, "UNRESOLVED");
assert.ok(unmapped.unresolvedConditions.includes("ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED"));

console.log("spot-inset-depth: ok", {
  plungeIn: Number(spotPlungeIn().toFixed(6)),
  noSpots: { min: plain.machineEvaluation.time.T_MACHINE_min, Q: plain.estimate.totals.Q },
  inset15: { spotSec: at15.machineEvaluation.time.T_DRILL_SPOT_sec, min: at15.machineEvaluation.time.T_MACHINE_min, Q: at15.estimate.totals.Q },
  inset2: { spotSec: at2.machineEvaluation.time.T_DRILL_SPOT_sec, min: at2.machineEvaluation.time.T_MACHINE_min, Q: at2.estimate.totals.Q }
});
