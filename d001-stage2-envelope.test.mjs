import assert from "node:assert/strict";
import {
  loadCatalog,
  findSku,
  capabilityAnswer,
  evaluateJob,
  evaluateUserDefinedBoardJob,
  sequenceCrosscuts
} from "./store-zero-stage2-store.mjs";
import { envelopeCheck, millPassesForDepth, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
import { estimatePineAlcove, estimatePicnicLegTapered } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
assert.equal(D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN, 14);
assert.equal(D001_STAGE2_ENVELOPE.stock.maxWidthIn, 12);
assert.equal(D001_STAGE2_ENVELOPE.saw.bladeDiameterIn, 20);
assert.equal(D001_STAGE2_ENVELOPE.saw.strokeDirection, "DOWN");
assert.equal(D001_STAGE2_ENVELOPE.saw.miterAbsMaxDeg, 45);
assert.equal(D001_STAGE2_ENVELOPE.saw.maxMiterStockWidthIn, 7.25);
assert.equal(D001_STAGE2_ENVELOPE.saw.workholding.positiveHoldDownRequired, true);
assert.equal(D001_STAGE2_ENVELOPE.saw.workholding.fenceRestraintRequired, true);
assert.equal(D001_STAGE2_ENVELOPE.stock.maxParentLengthIn, 192);
assert.equal(D001_STAGE2_ENVELOPE.stock.support.infeedRollerLengthIn, 168);
assert.equal(D001_STAGE2_ENVELOPE.stock.support.outfeedRollerLengthIn, 168);
assert.equal(D001_STAGE2_ENVELOPE.cutoffControl.retainedTailIn, 24);
assert.equal(D001_STAGE2_ENVELOPE.cutoffControl.kerfIn, 0.125);
assert.equal(millPassesForDepth(0.75), 2);

const pine = findSku(catalog, "STB-ZERO-PINE-1X6-96-001");
assert.equal(capabilityAnswer(pine, ["CROSSCUT"]).status, "SUPPORTABLE");

const wide = { ...pine, actualW: 13.25 };
assert.equal(envelopeCheck(wide, { requiredOps: ["CROSSCUT"] }).status, "REFUSED");
assert.ok(envelopeCheck(wide, { requiredOps: ["CROSSCUT"] }).reasons.includes("STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE"));

const long = findSku(catalog, "STB-ZERO-SPF-2X4-192-001");
const longCap = capabilityAnswer(long, ["CROSSCUT"]);
assert.equal(longCap.status, "SUPPORTABLE");

const tooLong = { ...long, stockL_in: 204 };
const tooLongCap = capabilityAnswer(tooLong, ["CROSSCUT"]);
assert.equal(tooLongCap.status, "REFUSED");
assert.ok(tooLongCap.missing.includes("PARENT_LENGTH_EXCEEDS_DECLARED_D001_SUPPORT"));

const post = findSku(catalog, "STB-ZERO-SPF-4X4-96-001");
assert.equal(capabilityAnswer(post, ["CROSSCUT"]).status, "SUPPORTABLE");
assert.equal(capabilityAnswer(post, ["MILL_LONGITUDINAL_PROFILE"]).status, "REFUSED");

const miter2x8 = findSku(catalog, "STB-ZERO-SPF-2X8-96-001");
const miter30 = evaluateJob(catalog, {
  title: "2x8 30 degree face miter",
  lines: [{
    storeSku: miter2x8.storeSku,
    qty: 1,
    requiredOps: ["MITER_LIMITED"],
    keptLengthIn: 32.75,
    miterAngleDeg: 30,
    miterPlane: "FACE"
  }]
});
assert.equal(miter30.status, "SUPPORTABLE");
assert.equal(miter30.lines[0].capability.envelope.derived.millPasses, 1);

const miter45 = envelopeCheck(miter2x8, {
  requiredOps: ["MITER_LIMITED"],
  keptLengthIn: 32.75,
  miterAngleDeg: -45,
  miterPlane: "FACE"
});
assert.equal(miter45.status, "SUPPORTABLE");

const miterOver = envelopeCheck(miter2x8, {
  requiredOps: ["MITER_LIMITED"],
  keptLengthIn: 32.75,
  miterAngleDeg: 45.5,
  miterPlane: "FACE"
});
assert.equal(miterOver.status, "REFUSED");
assert.ok(miterOver.reasons.includes("MITER_ANGLE_EXCEEDS_D001_STAGE2_ENVELOPE"));

const compound = envelopeCheck(miter2x8, {
  requiredOps: ["MITER_LIMITED"],
  keptLengthIn: 32.75,
  miterAngleDeg: 30,
  miterPlane: "FACE",
  bevelAngleDeg: 5
});
assert.equal(compound.status, "REFUSED");
assert.ok(compound.reasons.includes("BEVEL_OR_COMPOUND_MITER_NOT_DECLARED"));

const shortKept = evaluateJob(catalog, {
  title: "short finished part is not itself a control failure",
  lines: [{ storeSku: "STB-ZERO-SPF-2X4-96-001", qty: 1, requiredOps: ["CROSSCUT"], keptLengthIn: 16 }]
});
assert.equal(shortKept.status, "SUPPORTABLE");

const defaultPresentation = D001_STAGE2_ENVELOPE.stock.presentation.defaultMode;
const edgePresentation = D001_STAGE2_ENVELOPE.stock.presentation.edgeException.mode;
const twoByFour = findSku(catalog, "STB-ZERO-SPF-2X4-96-001");
assert.equal(envelopeCheck(twoByFour, {
  requiredOps: ["MITER_LIMITED"],
  workpiecePresentation: edgePresentation,
  miterAngleDeg: 10,
  miterPlane: "FACE"
}).status, "SUPPORTABLE");
const twoByEightEdge = envelopeCheck(miter2x8, {
  requiredOps: ["MITER_LIMITED"],
  workpiecePresentation: edgePresentation,
  miterAngleDeg: 10,
  miterPlane: "FACE"
});
assert.equal(twoByEightEdge.status, "REFUSED");
assert.ok(twoByEightEdge.reasons.includes("EDGE_PRESENTATION_RESERVED_FOR_NOMINAL_2X4"));
assert.equal(envelopeCheck(miter2x8, {
  requiredOps: ["MITER_LIMITED"],
  workpiecePresentation: defaultPresentation,
  miterAngleDeg: 10,
  miterPlane: "FACE"
}).status, "SUPPORTABLE");

const picnic15 = Array.from({ length: 8 }, () => 15.5);
const seq12 = sequenceCrosscuts({ parentLengthIn: 144, parts: picnic15, establishAngledEnd: true });
const seq14 = sequenceCrosscuts({ parentLengthIn: 168, parts: picnic15, establishAngledEnd: true });
const seq16 = sequenceCrosscuts({ parentLengthIn: 192, parts: picnic15, establishAngledEnd: true });
assert.equal(seq12.status, "SEQUENCED");
assert.equal(seq12.sticks, 2);
assert.equal(seq14.status, "SEQUENCED");
assert.equal(seq14.sticks, 1);
assert.equal(seq16.status, "SEQUENCED");
assert.equal(seq16.sticks, 1);
assert.ok(seq14.minRetainedAfterIn >= 24);

const picnic16 = Array.from({ length: 8 }, () => 16.5);
const seq14Custom = sequenceCrosscuts({ parentLengthIn: 168, parts: picnic16, establishAngledEnd: true });
assert.equal(seq14Custom.status, "SEQUENCED");
assert.equal(seq14Custom.sticks, 1);
assert.ok(seq14Custom.minRetainedAfterIn >= 24);

const userLeg = evaluateUserDefinedBoardJob(catalog, {
  title: "Claude Grab a Board default",
  sizeKey: "2x8",
  finishedLengthIn: 33.75,
  partQty: 8,
  angleDeg: 30,
  cutPlane: "miter-face",
  endIdentity: "both",
  endRelation: "parallel",
  lengthDatum: "long-long-outer-edge"
});
assert.equal(userLeg.status, "SUPPORTABLE");
assert.equal(userLeg.materialResolution.storeSku, "STB-ZERO-SPF-2X8-96-001");
assert.equal(userLeg.materialResolution.quantity, 4);
assert.equal(userLeg.materialResolution.materialTotal, 39.8);
assert.equal(userLeg.materialResolution.modeledWork.cutCount, 12);
assert.equal(userLeg.capability.status, "SUPPORTABLE");
assert.equal(userLeg.estimate.status, "BUDGETARY_PARTIAL");
assert.equal(userLeg.estimate.totals.material, 39.8);
assert.equal(userLeg.estimate.totals.cell_recovery, null);
assert.equal(userLeg.estimate.totals.Q, null);
assert.equal(userLeg.estimate.economics.status, "UNRESOLVED_CLASS_SCOPED_RECOVERY");

const benchEightPack = evaluateUserDefinedBoardJob(catalog, {
  title: "2x4 bench-leg eight-pack",
  sizeKey: "2x4",
  finishedLengthIn: 16.5,
  partQty: 8,
  angleDeg: 10,
  cutPlane: "miter-face",
  endIdentity: "both",
  endRelation: "parallel",
  lengthDatum: "long-long-outer-edge"
});
assert.equal(benchEightPack.status, "SUPPORTABLE");
assert.equal(benchEightPack.materialResolution.storeSku, "STB-ZERO-SPF-2X4-168-001");
assert.equal(benchEightPack.materialResolution.quantity, 1);
assert.equal(benchEightPack.materialResolution.sequence.sticks, 1);
assert.ok(benchEightPack.materialResolution.sequence.minRetainedAfterIn >= 24);
assert.equal(benchEightPack.workpiecePresentation, defaultPresentation);
assert.equal(benchEightPack.estimate.economics.status, "UNRESOLVED_CLASS_SCOPED_RECOVERY");

const edgeAngleEightPack = evaluateUserDefinedBoardJob(catalog, {
  title: "2x4 thickness-plane angle by declared edge presentation",
  sizeKey: "2x4",
  finishedLengthIn: 16.5,
  partQty: 8,
  angleDeg: 10,
  cutPlane: "bevel-thickness",
  endIdentity: "both",
  endRelation: "parallel",
  lengthDatum: "long-long-outer-edge"
});
assert.equal(edgeAngleEightPack.status, "SUPPORTABLE");
assert.equal(edgeAngleEightPack.workpiecePresentation, edgePresentation);
assert.equal(edgeAngleEightPack.capability.status, "SUPPORTABLE");

const unsupportedDatum = evaluateUserDefinedBoardJob(catalog, {
  title: "same numeric length, unsupported datum",
  sizeKey: "2x8",
  finishedLengthIn: 33.75,
  partQty: 8,
  angleDeg: 30,
  cutPlane: "miter-face",
  endIdentity: "both",
  endRelation: "parallel",
  lengthDatum: "long-short"
});
assert.equal(unsupportedDatum.status, "UNRESOLVED");
assert.equal(unsupportedDatum.materialResolution.code, "MATERIAL_NESTING_NOT_DECLARED_FOR_LENGTH_DATUM");

const ticket = estimatePineAlcove(catalog);
assert.equal(ticket.totals.Q, 374.42);
const taper = estimatePicnicLegTapered(catalog);
assert.ok(taper.totals.Q > 50);

console.log("d001-stage2-envelope.test.mjs ok");
