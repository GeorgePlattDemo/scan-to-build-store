import test from "node:test";
import assert from "node:assert/strict";
import {
  SHEET_PACKAGE_STANDARD,
  evaluateSheetPackageJob,
  evaluateSheetPackageStoreRequest,
  requestSheetPackageStoreEvaluation
} from "../../src/evaluators/sheet-package-evaluator.mjs";
import { S001_STAGE2_ENVELOPE } from "../../src/envelopes/s001-stage2-envelope.mjs";
import { loadCatalog } from "../../src/store-zero-stage2-store.mjs";
import { evaluateCutPackageJob } from "../../src/evaluators/cut-package-evaluator.mjs";

// The canonical playhouse window: one 1/2 in sheet, a centered 36 in arched opening split down the middle,
// and two crosscuts 18 in from each end. Every piece goes back to the owner.
function playhouse({ widthIn = 36, straightHeightIn = 24, riseIn = 12, cuts = [18, 18], ...extra } = {}) {
  const features = [
    { featureId: "OPENING", kind: "ARCHED_APERTURE", placement: "CENTERED", widthIn, straightHeightIn, riseIn, retain: "TABS", requestedTabCount: 4 },
    { featureId: "CENTER-SPLIT", kind: "STRAIGHT_SPLIT", within: "OPENING", line: "VERTICAL_CENTERLINE" }
  ];
  if (cuts[0] != null) features.push({ featureId: "CUT-LEFT", kind: "CROSSCUT", fromEnd: "LEFT", distanceIn: cuts[0] });
  if (cuts[1] != null) features.push({ featureId: "CUT-RIGHT", kind: "CROSSCUT", fromEnd: "RIGHT", distanceIn: cuts[1] });
  return {
    configurationId: "PLAYHOUSE-ARCHED-WINDOW",
    configurationVersion: `w${widthIn}-h${straightHeightIn}-r${riseIn}-c${cuts.join("/")}`,
    sheet: { thicknessIn: 0.5, lengthIn: 96, widthIn: 48 },
    features,
    returnAllPieces: true,
    ...extra
  };
}

test("canonical playhouse window is SUPPORTABLE with a complete budgetary Q", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse());
  assert.equal(answer.status, "SUPPORTABLE");
  assert.equal(answer.material.storeSku, "STB-ZERO-PLY-050-48X96-001");
  assert.equal(answer.totals.material, 26.55);
  assert.ok(answer.totals.machine_service > 0);
  assert.equal(answer.totals.Q, Math.round((answer.totals.material + answer.totals.machine_service) * 100) / 100);
  // Radius from chord + rise: 36² / (8·12) + 12/2 = 19.5.
  assert.equal(answer.features.apertures[0].radiusIn, 19.5);
  assert.deepEqual(answer.operations.map((op) => op.opId), ["LOAD_REFERENCE", "ROUTE_PROFILE", "ROUTE_PROFILE", "RELEASE", "CROSSCUT", "CROSSCUT", "LABEL"]);
  // Routing happens on the sheet cell; crosscuts happen after, at the yard panel saw.
  assert.deepEqual([...new Set(answer.operations.filter((op) => op.opId === "CROSSCUT").map((op) => op.station))], ["YARD-PANEL-SAW"]);
  assert.deepEqual(answer.operations.filter((op) => op.opId === "CROSSCUT").map((op) => op.xIn), [18, 78]);
  assert.equal(answer.evidence.measured, false);
  assert.equal(answer.evidence.commissioned, false);
});

test("every piece comes back to the owner and each split half keeps two tabs", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse());
  assert.ok(answer.pieces.every((piece) => piece.disposition === "RETURNED_TO_OWNER"));
  const kinds = answer.pieces.map((piece) => piece.kind).sort();
  assert.deepEqual(kinds, ["FRAME", "PANEL", "PANEL", "RETAINED_CENTER_PIECE", "RETAINED_CENTER_PIECE"]);
  const split = answer.features.apertures[0].tabPlan.split;
  assert.ok(split.leftPieceTabs >= 2 && split.rightPieceTabs >= 2);
  const frame = answer.pieces.find((piece) => piece.kind === "FRAME");
  assert.deepEqual(frame.carries, ["OPENING"]);
});

test("an opening past the centered working field is REFUSED with a reason and no price", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse({ straightHeightIn: 30 }));
  assert.equal(answer.status, "REFUSED");
  assert.deepEqual(answer.refusalConditions, ["CENTER_WORK_FIELD_EXCEEDED"]);
  assert.equal(answer.Q, null);
  assert.equal(answer.totals, null);
  assert.equal(answer.operations, null);
});

test("a crosscut through the routed opening is REFUSED, never moved", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse({ cuts: [40, 18] }));
  assert.equal(answer.status, "REFUSED");
  assert.ok(answer.refusalConditions.includes("CROSSCUT_INTERSECTS_ROUTED_FEATURE"));
  assert.equal(answer.features.crosscuts.find((cut) => cut.featureId === "CUT-LEFT").xIn, 40);
});

test("a crosscut piece under the panel-saw minimum is REFUSED", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse({ cuts: [4, 18] }));
  assert.equal(answer.status, "REFUSED");
  assert.ok(answer.refusalConditions.includes("CROSSCUT_PIECE_BELOW_MINIMUM"));
});

test("an arch taller than half its width is REFUSED", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse({ widthIn: 20, straightHeightIn: 10, riseIn: 12 }));
  assert.equal(answer.status, "REFUSED");
  assert.ok(answer.refusalConditions.includes("ARCH_RISE_EXCEEDS_HALF_WIDTH"));
});

test("missing tab count is UNRESOLVED; machine-local language and undeclared features are REFUSED", () => {
  const noTabs = playhouse();
  delete noTabs.features[0].requestedTabCount;
  assert.equal(evaluateSheetPackageJob(loadCatalog(), noTabs).status, "UNRESOLVED");
  const gcode = evaluateSheetPackageJob(loadCatalog(), playhouse({ gcode: "G1 X10" }));
  assert.equal(gcode.status, "REFUSED");
  assert.ok(gcode.refusalConditions.includes("MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED"));
  const undeclared = playhouse();
  undeclared.features.push({ featureId: "HINGE-HOLES", kind: "DRILL", xIn: 30 });
  assert.ok(evaluateSheetPackageJob(loadCatalog(), undeclared).refusalConditions.includes("FEATURE_KIND_NOT_DECLARED"));
});

test("exterior rating on a sheathing sheet stays UNRESOLVED", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse({ exteriorRatingRequested: true }));
  assert.equal(answer.status, "UNRESOLVED");
  assert.ok(answer.unresolvedConditions.includes("EXTERIOR_RATING_NOT_ESTABLISHED_BY_SKU"));
});

test("no sheet on hand makes the job UNAVAILABLE, not a fallback", () => {
  const catalog = loadCatalog();
  const sheet = catalog.offerings.find((item) => item.storeSku === "STB-ZERO-PLY-050-48X96-001");
  sheet.onHand = 0;
  const answer = evaluateSheetPackageJob(catalog, playhouse());
  assert.equal(answer.status, "UNAVAILABLE");
  assert.equal(answer.Q, null);
});

test("a sheet the cell cannot route is REFUSED; a half sheet is outside the S-001 envelope", () => {
  const half = playhouse();
  half.sheet = { thicknessIn: 0.375, lengthIn: 48, widthIn: 48 };
  const answer = evaluateSheetPackageJob(loadCatalog(), half);
  assert.equal(answer.status, "REFUSED");
  assert.ok(answer.refusalConditions.includes("SHEET_SIZE_OUTSIDE_S001_ENVELOPE"));
});

test("every request is freshly evaluated with a receipt bound to this request and this Store", () => {
  const first = evaluateSheetPackageStoreRequest(loadCatalog(), playhouse(), { requestId: "req-1", storeRevision: "abc" });
  const second = evaluateSheetPackageStoreRequest(loadCatalog(), playhouse(), { requestId: "req-2", storeRevision: "abc" });
  assert.equal(first.freshEvaluation, true);
  assert.equal(first.evaluationReceipt.requestId, "req-1");
  assert.equal(first.evaluationReceipt.freshnessRule, "STB-STORE-FRESH-EVALUATION-0.1");
  assert.equal(first.evaluationReceipt.authority.storeRevision, "abc");
  assert.equal(first.evaluationReceipt.authority.machineEnvelope.id, S001_STAGE2_ENVELOPE.id);
  assert.equal(first.evaluationReceipt.authority.sheetPackageStandard.id, SHEET_PACKAGE_STANDARD.id);
  assert.notEqual(first.evaluationReceipt.receiptHash, second.evaluationReceipt.receiptHash);
  // Same definition, same Store: same calculation. A changed definition is a new calculation.
  assert.deepEqual(first.calculationIdentity, second.calculationIdentity);
  const changed = requestSheetPackageStoreEvaluation(playhouse({ widthIn: 30 }), { requestId: "req-3", storeRevision: "abc" });
  assert.notEqual(changed.calculationIdentity.inputHash, first.calculationIdentity.inputHash);
  assert.notEqual(changed.calculationIdentity.resultHash, first.calculationIdentity.resultHash);
  const missingId = evaluateSheetPackageStoreRequest(loadCatalog(), playhouse(), {});
  assert.equal(missingId.freshEvaluation, false);
});

test("D-001 still refuses sheets: a sheet never falls through dimensional cut packages", () => {
  const answer = evaluateCutPackageJob(loadCatalog(), {
    configurationId: "X", configurationVersion: "1",
    cutPackages: [{ packageId: "P", material: { species: "pine", form: "sheet", nominalT: 0.5, nominalW: 48, grade: "sheathing-4ply" }, parts: [{ partId: "A", lengthIn: 24 }] }]
  });
  assert.notEqual(answer.status, "SUPPORTABLE");
});

test("every requested feature is answered; nothing is silently dropped", () => {
  const withExtra = playhouse({ cuts: [4, 18] });
  withExtra.features.push({ featureId: "HINGE-HOLES", kind: "DRILL", xIn: 30 });
  const answer = evaluateSheetPackageJob(loadCatalog(), withExtra);
  assert.deepEqual(answer.featureAnswers.map((f) => f.featureId), withExtra.features.map((f) => f.featureId));
  const byId = Object.fromEntries(answer.featureAnswers.map((f) => [f.featureId, f]));
  assert.equal(byId["HINGE-HOLES"].status, "REFUSED");
  assert.deepEqual(byId["HINGE-HOLES"].reasonCodes, ["FEATURE_KIND_NOT_DECLARED"]);
  assert.equal(byId["CUT-LEFT"].status, "REFUSED");
  assert.equal(byId["OPENING"].status, "ANSWERED");
  // The requested geometry is echoed as asked, not simplified.
  assert.equal(answer.features.apertures[0].widthIn, 36);
  assert.equal(answer.features.crosscuts.find((c) => c.featureId === "CUT-LEFT").xIn, 4);
});

test("assumptions are labeled as newly adopted Stage-2 reference, not measured or quoted", () => {
  const answer = evaluateSheetPackageJob(loadCatalog(), playhouse());
  assert.equal(answer.evidence.capabilityBasis, "DECLARED_STAGE2_CAPABILITY");
  assert.equal(answer.evidence.timingBasis, "DECLARED_STAGE2_MODEL");
  assert.equal(answer.evidence.assumptions, "NEWLY_ADOPTED_REFERENCE_ASSUMPTIONS");
  assert.equal(answer.evidence.measured, false);
  assert.equal(answer.evidence.commissioned, false);
  assert.equal(answer.evidence.physicalMachineEvidence, false);
  assert.equal(answer.evidence.commercialQuote, false);
  assert.equal(answer.evidence.replacedBy, "MEASURED_STAGE3_EVIDENCE");
  assert.equal(answer.evidence.economics.use, "SHARED_STORE_ZERO_STAGE2_MACHINE_HOUR_RATE");
  assert.equal(answer.time.measured, false);
  assert.ok(!JSON.stringify(answer).match(/G0|G1 |M3|cycleStart/i));
});
