import assert from "node:assert/strict";
import { loadCatalog, findSku, evaluateJob } from "./store-zero-stage2-store.mjs";
import {
  D001_FIVE_TOOL_REFERENCE,
  evaluateD001FeaturedBoard,
  estimateD001FeaturedBoardMaterial,
} from "./d001-five-tool.mjs";

const catalog = loadCatalog();
const board = findSku(catalog, "STB-ZERO-SPF-2X4-72-001");

assert.equal(D001_FIVE_TOOL_REFERENCE.setupToolLimit, 5);
assert.equal(D001_FIVE_TOOL_REFERENCE.tools.T1.xOffsetFromBaseCenterIn, -3);
assert.equal(D001_FIVE_TOOL_REFERENCE.tools.T2.xOffsetFromBaseCenterIn, 3);
assert.equal(D001_FIVE_TOOL_REFERENCE.tools.T1.offsetStatus, "REFERENCE_PACKAGING_ASSUMPTION");
assert.equal(D001_FIVE_TOOL_REFERENCE.tools.T2.offsetStatus, "REFERENCE_PACKAGING_ASSUMPTION");
assert.equal(D001_FIVE_TOOL_REFERENCE.pilotDiameterIn, 0.1875);

const dado = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    {
      featureId: "F-DADO-1",
      kind: "DADO",
      xFromLeftIn: 18,
      widthIn: 0.75,
      depthIn: 0.375,
      extent: "FULL_WIDTH",
    },
  ],
});
assert.equal(dado.status, "SUPPORTABLE");
assert.equal(dado.featureResults[0].toolSlot, "T2");
assert.equal(dado.neutralOps.some((op) => op.op === "MILL_TRANSVERSE_DADO"), true);
assert.equal(dado.neutralOps.some((op) => "gcode" in op), false);

const dadoTooDeep = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "DADO", xFromLeftIn: 18, widthIn: 0.75, depthIn: 0.5, extent: "FULL_WIDTH" },
  ],
});
assert.equal(dadoTooDeep.status, "REFUSED");
assert.ok(dadoTooDeep.reasons.includes("DADO:DADO_DEPTH_EXCEEDS_REFERENCE_ENVELOPE"));

const facePilot = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "PILOT_FACE_3_16", xFromLeftIn: 20, yFromFenceIn: 1.75 },
  ],
});
assert.equal(facePilot.status, "SUPPORTABLE");
assert.equal(facePilot.featureResults[0].toolSlot, "T4");
assert.equal(facePilot.featureResults[0].derived.diameterIn, 0.1875);
assert.equal(facePilot.featureResults[0].derived.physicalDepthIn, null);

const edgePilot = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "PILOT_EDGE_3_16", xFromLeftIn: 30, zFromTableIn: 0.75 },
  ],
});
assert.equal(edgePilot.status, "SUPPORTABLE");
assert.equal(edgePilot.featureResults[0].toolSlot, "T5");

const wrongPilot = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "PILOT_FACE_3_16", xFromLeftIn: 20, yFromFenceIn: 1.75, diameterIn: 0.25 },
  ],
});
assert.equal(wrongPilot.status, "REFUSED");
assert.ok(wrongPilot.reasons.includes("PILOT_FACE_3_16:PILOT_DIAMETER_FIXED_3_16"));

const miter = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [{ kind: "ANGLED_END_SINGLE_PLANE", end: "RIGHT", angleDeg: 30 }],
});
assert.equal(miter.status, "UNRESOLVED");
assert.ok(miter.unresolved.includes("ANGLED_END_SINGLE_PLANE:MITER_RANGE_NOT_PUBLISHED"));

const notch = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [{ kind: "EDGE_NOTCH", xFromLeftIn: 12 }],
});
assert.equal(notch.status, "UNRESOLVED");
assert.ok(notch.capabilityGaps.some((gap) => gap.featureKind === "EDGE_NOTCH"));

const routedEnd = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [{ kind: "ROUTED_END", end: "RIGHT" }],
});
assert.equal(routedEnd.status, "UNRESOLVED");

const leaked = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "DADO", xFromLeftIn: 18, widthIn: 0.75, depthIn: 0.25, gcode: "G1 X18" },
  ],
});
assert.equal(leaked.status, "REFUSED");
assert.ok(leaked.reasons.some((reason) => reason.includes("MACHINE_LOCAL_FIELD_NOT_ACCEPTED:gcode")));

const leakedNotch = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "EDGE_NOTCH", xFromLeftIn: 12, controller: "linuxcnc" },
  ],
});
assert.equal(leakedNotch.status, "REFUSED");
assert.ok(leakedNotch.reasons.includes("EDGE_NOTCH:MACHINE_LOCAL_FIELD_NOT_ACCEPTED:controller"));

const leakedRoutedEnd = evaluateD001FeaturedBoard(board, {
  keptLengthIn: 60,
  features: [
    { kind: "ROUTED_END", end: "RIGHT", spindleRpm: 18000 },
  ],
});
assert.equal(leakedRoutedEnd.status, "REFUSED");
assert.ok(leakedRoutedEnd.reasons.includes("ROUTED_END:MACHINE_LOCAL_FIELD_NOT_ACCEPTED:spindleRpm"));

const materialOnly = estimateD001FeaturedBoardMaterial(board, 1);
assert.equal(materialOnly.status, "BUDGETARY_MATERIAL_ONLY");
assert.equal(materialOnly.processQ_status, "UNRESOLVED");
assert.equal(materialOnly.Q, board.sellingPrice);

const oldSquare = evaluateJob(catalog, {
  title: "square regression",
  lines: [{ storeSku: board.storeSku, qty: 1, requiredOps: ["CROSSCUT"], keptLengthIn: 60 }],
});
assert.equal(oldSquare.status, "SUPPORTABLE");

console.log("d001-five-tool.test.mjs ok");
