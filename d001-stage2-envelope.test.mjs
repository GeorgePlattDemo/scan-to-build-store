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
assert.equal(D001_STAGE2_ENVELOPE.id, "D001-STAGE2-ENVELOPE-0.4");
assert.equal(D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN, 14);
assert.equal(D001_STAGE2_ENVELOPE.stock.maxWidthIn, 12);
assert.equal(D001_STAGE2_ENVELOPE.saw.motion, "DOWNSTROKE");
assert.equal(D001_STAGE2_ENVELOPE.saw.miter.maxDeg, 45);
assert.equal(D001_STAGE2_ENVELOPE.spot.toolDiameterIn, 0.1875);
assert.equal(D001_STAGE2_ENVELOPE.spot.fullDiameterPenetrationIn, 0.1875);
assert.equal(D001_STAGE2_ENVELOPE.spot.depthReference, "ENTRY_SURFACE_ALONG_DRILL_AXIS");
assert.equal(D001_STAGE2_ENVELOPE.spot.pointGeometryStatus, "UNRESOLVED");
assert.equal(D001_STAGE2_ENVELOPE.spot.pointAngleDeg, null);
assert.equal(D001_STAGE2_ENVELOPE.spot.pointAxialLengthIn, null);
assert.equal(D001_STAGE2_ENVELOPE.spot.totalTipPenetrationIn, null);
assert.equal(D001_STAGE2_ENVELOPE.spot.customerDepthProgrammingRequired, false);
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
    cutPlane: "miter-face"
  }).status,
  "SUPPORTABLE"
);
assert.equal(
  capabilityAnswer(spf72, ["MITER_LIMITED"], {
    keptLengthIn: 60,
    sawAngleDeg: 45,
    cutPlane: "miter-face"
  }).status,
  "SUPPORTABLE"
);
const over45 = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  sawAngleDeg: 46,
  cutPlane: "miter-face"
});
assert.equal(over45.status, "REFUSED");
assert.ok(over45.missing.includes("MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE"));

const missingAngle = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  cutPlane: "miter-face"
});
assert.equal(missingAngle.status, "UNRESOLVED");
assert.ok(missingAngle.unresolved.includes("MITER_ANGLE_REQUIRED"));

const depthDefinedSpot = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  spotDemand: spot
});
assert.equal(depthDefinedSpot.status, "UNRESOLVED");
assert.ok(depthDefinedSpot.unresolved.includes("SPOT_TOOL_POINT_GEOMETRY_REQUIRED"));
assert.equal(depthDefinedSpot.envelope.derived.spot.toolDiameterIn, 0.1875);
assert.equal(depthDefinedSpot.envelope.derived.spot.fullDiameterPenetrationIn, 0.1875);
assert.equal(depthDefinedSpot.envelope.derived.spot.depthReference, "ENTRY_SURFACE_ALONG_DRILL_AXIS");
assert.equal(depthDefinedSpot.envelope.derived.spot.pointGeometryStatus, "UNRESOLVED");
assert.equal(depthDefinedSpot.envelope.derived.spot.totalTipPenetrationIn, null);
assert.equal(depthDefinedSpot.envelope.derived.spot.depthClaimed, true);

const missingSpotLocation = capabilityAnswer(spf72, ["MITER_LIMITED"], {
  keptLengthIn: 60,
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  spotDemand: {
    ...spot,
    locationAlongLengthIn: undefined
  }
});
assert.equal(missingSpotLocation.status, "UNRESOLVED");
assert.ok(missingSpotLocation.unresolved.includes("SPOT_LOCATION_REQUIRED"));
assert.ok(missingSpotLocation.unresolved.includes("SPOT_TOOL_POINT_GEOMETRY_REQUIRED"));

const genericDrill = capabilityAnswer(spf72, ["DRILL"], { keptLengthIn: 60 });
assert.equal(genericDrill.status, "UNRESOLVED");
assert.ok(genericDrill.unresolved.includes("GENERIC_DRILL_ENVELOPE_NOT_DECLARED_BEYOND_SPOT"));

const material = resolveBoardMaterial(catalog, {
  species: "spf",
  form: "board",
  nominalT: 2,
  nominalW: 4,
  finishedPartLengthIn: 16,
  quantity: 2,
  requiredOps: ["MITER_LIMITED"],
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  lengthDatum: "long-long-outer-edge",
  endIdentity: "both",
  endRelation: "parallel",
  spotDemand: spot
});
assert.equal(material.status, "MAPPED");
assert.equal(material.finishedPartLengthIn, 16);
assert.equal(material.quantity, 2);
assert.equal(material.allocationClaimed, false);
assert.equal(material.pricingReferenceSku, "STB-ZERO-SPF-2X4-72-001");
assert.equal(material.pricingReferenceStockLengthIn, 72);
assert.equal(material.plan.selected.parentCount, 1);
assert.equal(material.plan.parents[0].remainderIn, 39.625);
assert.ok(material.capability.unresolved.includes("SPOT_TOOL_POINT_GEOMETRY_REQUIRED"));

const materialNoSpot = resolveBoardMaterial(catalog, {
  species: "spf",
  form: "board",
  nominalT: 2,
  nominalW: 4,
  finishedPartLengthIn: 16,
  quantity: 2,
  requiredOps: ["MITER_LIMITED"],
  sawAngleDeg: 30,
  cutPlane: "miter-face",
  lengthDatum: "long-long-outer-edge",
  endIdentity: "both",
  endRelation: "parallel"
});
assert.equal(materialNoSpot.status, "MAPPED");
assert.equal(materialNoSpot.capability.status, "SUPPORTABLE");

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
assert.equal(ticket.totals.Q, 374.42);
const taper = estimatePicnicLegTapered(catalog);
assert.ok(taper.totals.Q > 50);

console.log("d001-stage2-envelope.test.mjs ok");
