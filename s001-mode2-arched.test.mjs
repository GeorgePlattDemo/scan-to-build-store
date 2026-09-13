import assert from "node:assert/strict";
import { radiusFromChordRise, evaluateCircularSegment } from "./circular-segment.mjs";
import { evaluateSheetMode2Arched, S001_MODE2_ARCHED_ENVELOPE } from "./s001-mode2-arched.mjs";
import {
  STENCIL_TAB_POLICY_V0,
  archedAperturePerimeter,
  planArchedStencilTabs
} from "./stencil-tab-policy.mjs";
import {
  loadCatalog,
  findSku,
  evaluateJob,
  evaluateSheetMode2Job,
  evaluateSheetMode2ArchedJob,
  estimateSheetMode2ArchedJob
} from "./store-zero-stage2-store.mjs";

const catalog = loadCatalog();
const ply050 = findSku(catalog, "STB-ZERO-PLY-050-48X96-001");
const ply075 = findSku(catalog, "STB-ZERO-PLY-075-48X96-001");
const osb = findSku(catalog, "STB-ZERO-OSB-075-48X96-001");
const board = findSku(catalog, "STB-ZERO-SPF-2X4-72-001");

assert.equal(S001_MODE2_ARCHED_ENVELOPE.capabilityId, "SHEET_MODE2_ARCHED_APERTURE_V0");
assert.equal(S001_MODE2_ARCHED_ENVELOPE.evidenceClass, "REFERENCE");
assert.equal(S001_MODE2_ARCHED_ENVELOPE.commissioned, false);
assert.equal(S001_MODE2_ARCHED_ENVELOPE.tabPolicyId, "S001-STENCIL-TAB-POLICY-V0");
assert.equal(radiusFromChordRise(36, 12), 19.5);

const goodCurve = evaluateCircularSegment({ chord_in: 36, rise_in: 12 });
assert.equal(goodCurve.ok, true);
assert.equal(goodCurve.derivedRadius_in, 19.5);

const supplied = evaluateCircularSegment({ chord_in: 36, rise_in: 12, radius_in: 19.5 });
assert.equal(supplied.ok, true);

const contradiction = evaluateCircularSegment({ chord_in: 36, rise_in: 12, radius_in: 40 });
assert.equal(contradiction.ok, false);
assert.ok(contradiction.reasons.includes("CURVE_RADIUS_CONTRADICTS_CHORD_RISE"));

const missingCurve = evaluateCircularSegment({});
assert.equal(missingCurve.status, "UNRESOLVED");

const perimeter = archedAperturePerimeter({
  chord_in: 36,
  rise_in: 12,
  radius_in: 19.5,
  straightHeight_in: 36
});
assert.ok(perimeter);
assert.equal(Number(perimeter.perimeter_in.toFixed(6)), 153.864203);
assert.equal(Number(perimeter.arcLength_in.toFixed(6)), 45.864203);
assert.equal(STENCIL_TAB_POLICY_V0.referenceBaseCount, 4);
assert.equal(STENCIL_TAB_POLICY_V0.planningReserveTabs, 1);
assert.equal(STENCIL_TAB_POLICY_V0.maxAllowedGap_in, null);
assert.equal(STENCIL_TAB_POLICY_V0.minBridgeWidth_in, null);

const tabPlan = planArchedStencilTabs({
  chord_in: 36,
  rise_in: 12,
  radius_in: 19.5,
  straightHeight_in: 36,
  requestedTabCount: 4
});
assert.equal(tabPlan.ok, true);
assert.equal(tabPlan.status, "REFERENCE_PLAN_READY");
assert.equal(tabPlan.requestedTabCount, 4);
assert.equal(tabPlan.plannedTabCount, 5);
assert.equal(tabPlan.candidates.length, 5);
assert.equal(tabPlan.physicalRetentionStatus, "NOT_MEASURED");
assert.ok(tabPlan.candidates.every((candidate) => candidate.distanceToNearestTransition_in > 0));

const userRequestsMore = planArchedStencilTabs({
  chord_in: 36,
  rise_in: 12,
  radius_in: 19.5,
  straightHeight_in: 36,
  requestedTabCount: 8
});
assert.equal(userRequestsMore.plannedTabCount, 8);

const ref = {
  outerL_in: 72,
  outerW_in: 48,
  apertureW_in: 36,
  apertureStraightH_in: 36,
  arcChord_in: 36,
  arcRise_in: 12,
  arcRadius_in: 19.5,
  tabCount: 4,
  routeDepthIn: 0.5
};

const support = evaluateSheetMode2Arched(ply050, ref);
assert.equal(support.status, "SUPPORTABLE");
assert.equal(support.geometryClass, "CURVILINEAR");
assert.equal(support.curve.radius_in, 19.5);
assert.equal(support.retention.class, "STENCIL_TABS");
assert.equal(support.retention.requestedTabCount, 4);
assert.equal(support.retention.plannedTabCount, 5);
assert.equal(support.retention.tabPolicyId, "S001-STENCIL-TAB-POLICY-V0");
assert.equal(support.retention.physicalRetentionStatus, "NOT_MEASURED");
assert.equal(support.retention.fullSeverance, false);

const flagOnly = evaluateSheetMode2Arched(ply050, {
  outerL_in: 72,
  outerW_in: 48,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(flagOnly.status, "UNRESOLVED");
assert.ok(flagOnly.unresolved.includes("CURVE_CHORD_OR_RISE_MISSING"));

const tooBig = evaluateSheetMode2Arched(ply050, {
  ...ref,
  apertureStraightH_in: 70,
  arcRise_in: 12
});
assert.equal(tooBig.status, "REFUSED");
assert.ok(tooBig.reasons.includes("APERTURE_OUTSIDE_OUTER_PANEL"));

const deep = evaluateSheetMode2Arched(ply050, { ...ref, routeDepthIn: 0.9 });
assert.equal(deep.status, "REFUSED");
assert.ok(deep.reasons.includes("ROUTE_DEPTH_EXCEEDS_REFERENCE_ENVELOPE"));

const noTabs = evaluateSheetMode2Arched(ply050, { ...ref, tabCount: 0 });
assert.equal(noTabs.status, "REFUSED");
assert.ok(noTabs.reasons.includes("STENCIL_TABS_REQUIRED"));

const gcode = evaluateSheetMode2Arched(ply050, { ...ref, gcode: "G2 X36 Y12 R19.5" });
assert.equal(gcode.status, "REFUSED");
assert.ok(gcode.reasons.includes("MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED"));

const exterior = evaluateSheetMode2Arched(ply050, { ...ref, exteriorRatingRequested: true });
assert.equal(exterior.status, "UNRESOLVED");
assert.ok(exterior.unresolved.includes("EXTERIOR_RATING_NOT_ESTABLISHED_BY_SKU"));

const dimensional = evaluateSheetMode2Arched(board, ref);
assert.equal(dimensional.status, "REFUSED");
assert.ok(dimensional.reasons.includes("SHEET_MODE2_NOT_DIMENSIONAL"));

const osbJob = evaluateSheetMode2Arched(osb, ref);
assert.equal(osbJob.status, "REFUSED");

const job = evaluateSheetMode2ArchedJob(catalog, {
  title: "reference arched aperture",
  line: { storeSku: "STB-ZERO-PLY-050-48X96-001", qty: 1, ...ref }
});
assert.equal(job.status, "SUPPORTABLE");
assert.equal(job.jobType, "SHEET_MODE2_ARCHED_APERTURE_V0");
assert.equal(job.geometryClass, "CURVILINEAR");
assert.equal(job.basis.observationId, "OBS-017");
assert.equal(job.basis.list_reference, 25.29);
assert.equal(job.basis.sellingPrice, 26.55);
assert.equal(job.line.capability.curve.radius_in, 19.5);
assert.equal(job.line.capability.retention.plannedTabCount, 5);
assert.equal(job.line.capability.retention.plan.perimeter_in, 153.864203);
assert.ok(job.not_claimed.includes("G-code"));
assert.ok(job.not_claimed.includes("Cycle Start"));

const estimate = estimateSheetMode2ArchedJob(catalog, {
  line: { storeSku: "STB-ZERO-PLY-050-48X96-001", qty: 1 }
});
assert.equal(estimate.status, "BUDGETARY_MATERIAL_ONLY");
assert.equal(estimate.processQ_status, "UNRESOLVED");
assert.equal(estimate.Q, 26.55);
assert.equal(estimate.observationId, "OBS-017");

const stencilStillWorks = evaluateSheetMode2Job(catalog, {
  title: "control stencil",
  line: {
    storeSku: "STB-ZERO-PLY-075-48X96-001",
    qty: 1,
    profileKind: "STRAIGHT_RECT",
    blankL_in: 24,
    blankW_in: 18,
    tabCount: 4,
    routeDepthIn: 0.5
  }
});
assert.equal(stencilStillWorks.status, "SUPPORTABLE");
assert.equal(stencilStillWorks.jobType, "SHEET_MODE2_STENCIL_V1");

const boardPath = evaluateJob(catalog, {
  title: "board control",
  lines: [{ storeSku: "STB-ZERO-SPF-2X4-72-001", qty: 1, requiredOps: ["CROSSCUT"], keptLengthIn: 45 }]
});
assert.equal(boardPath.status, "SUPPORTABLE");

void ply075;
console.log("s001-mode2-arched.test.mjs ok");
