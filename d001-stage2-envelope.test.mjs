import assert from "node:assert/strict";
import {
  loadCatalog,
  findSku,
  capabilityAnswer,
  evaluateJob,
  resolveBoardMaterial
} from "./store-zero-stage2-store.mjs";
import { envelopeCheck, millPassesForDepth, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
import { estimatePineAlcove, estimatePicnicLegTapered } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
assert.equal(D001_STAGE2_ENVELOPE.id, "D001-STAGE2-ENVELOPE-0.3");
assert.equal(D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN, 14);
assert.equal(D001_STAGE2_ENVELOPE.stock.maxWidthIn, 12);
assert.equal(D001_STAGE2_ENVELOPE.saw.motion, "DOWNSTROKE");
assert.equal(D001_STAGE2_ENVELOPE.saw.miter.maxDeg, 45);
assert.equal(D001_STAGE2_ENVELOPE.spot.toolDiameterIn, 0.1875);
assert.equal(millPassesForDepth(0.75), 2);

const pine = findSku(catalog, "STB-ZERO-PINE-1X6-96-001");
assert.equal(capabilityAnswer(pine, ["CROSSCUT"]).status, "SUPPORTABLE");

const spf72 = findSku(catalog, "STB-ZERO-SPF-2X4-72-001");
const spot = {
  required: true,
  mode: "SPOT_ON_LOCATION",
  countPerPart: 1,
  totalCount: 2,
  locationRule: "CENTERED_ON_PART",
  locationAlongLengthIn: 8,
  acrossWidthRule: "CENTERED_ON_WIDE_FACE"
};

assert.equal(
  capabilityAnswer(spf72, ["MITER_LIMITED"], {
    keptLengthIn: 60,
    sawAngleDeg: 30,
    cutPlane: "miter-face",
    spotDemand: spot
  }).status,
  "SUPPORTABLE"
);
assert.equal(
  capabilityAnswer(spf72, ["MITER_LIMITED"], {
    keptLengthIn: 60,
    sawAngleDeg: 45,
    cutPlane: "miter-face",
    spotDemand: spot
  }).status,
  "SUPPORTABLE"
);
const over45 = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  sawAngleDeg: 46,
  cutPlane: "miter-face",
  spotDemand: spot
});
assert.equal(over45.status, "REFUSED");
assert.ok(over45.missing.includes("MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE"));

const missingAngle = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  cutPlane: "miter-face",
  spotDemand: spot
});
assert.equal(missingAngle.status, "UNRESOLVED");
assert.ok(missingAngle.unresolved.includes("MITER_ANGLE_REQUIRED"));

const genericDrill = capabilityAnswer(spf72, ["DRILL"], { keptLengthIn: 60 });
assert.equal(genericDrill.status, "UNRESOLVED");
assert.ok(genericDrill.unresolved.includes("GENERIC_DRILL_ENVELOPE_NOT_DECLARED_BEYOND_SPOT"));

const material = resolveBoardMaterial(catalog, {
  species: "spf",
  form: "board",
  nominalT: 2,
  nominalW: 4,
  definedWorkpieceLengthIn: 60,
  qty: 1,
  requiredOps: ["MITER_LIMITED"],
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  spotDemand: spot
});
assert.equal(material.status, "MAPPED");
assert.equal(material.workpieceLengthIn, 60);
assert.equal(material.allocationClaimed, false);
assert.equal(material.pricingReferenceSku, "STB-ZERO-SPF-2X4-60-001");
assert.equal(material.pricingReferenceStockLengthIn, 60);

const wide = { ...pine, actualW: 13.25 };
assert.equal(envelopeCheck(wide, { requiredOps: ["CROSSCUT"] }).status, "REFUSED");
assert.ok(envelopeCheck(wide, { requiredOps: ["CROSSCUT"] }).reasons.includes("STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE"));

const long = findSku(catalog, "STB-ZERO-SPF-2X4-144-001");
const longCap = capabilityAnswer(long, ["CROSSCUT"]);
assert.equal(longCap.status, "REFUSED");
assert.ok(longCap.missing.includes("PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT"));

const post = findSku(catalog, "STB-ZERO-SPF-4X4-96-001");
assert.equal(capabilityAnswer(post, ["CROSSCUT"]).status, "SUPPORTABLE");
assert.equal(capabilityAnswer(post, ["MILL_LONGITUDINAL_PROFILE"]).status, "REFUSED");

const shortKept = evaluateJob(catalog, {
  title: "too short",
  lines: [{ storeSku: "STB-ZERO-SPF-2X4-96-001", qty: 1, requiredOps: ["CROSSCUT"], keptLengthIn: 16 }]
});
assert.equal(shortKept.status, "REFUSED");

const ticket = estimatePineAlcove(catalog);
assert.equal(ticket.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(ticket.totals.material, 272.86);
assert.equal(ticket.totals.Q, null);
const taper = estimatePicnicLegTapered(catalog);
assert.equal(taper.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(taper.totals.Q, null);

console.log("d001-stage2-envelope.test.mjs ok");
