import assert from "node:assert/strict";
import {
  capabilityAnswer,
  evaluateDimensionalTravelJob,
  findSku,
  loadCatalog
} from "./store-zero-stage2-store.mjs";
import { estimatePineAlcove } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();

const FROZEN_ALCOVE_DEFAULT = Object.freeze({
  source: "scan-to-build-review@d99285cbc4e05a3f8123301c33f66e2f184ae2e4/system-build-base-8d8a9dd.html",
  configuration: Object.freeze({
    heightIn: 72,
    widthIn: 45.5,
    depthIn: 14,
    shelfCount: 5,
    shelfElevationsIn: Object.freeze([12, 24, 36, 45, 65]),
    interiorSpanIn: 44,
    species: "pine"
  }),
  materialParents: Object.freeze([
    Object.freeze({ nominalT: 1, nominalW: 6, minimumParentLengthIn: 72, qty: 4, role: "side-members" }),
    Object.freeze({ nominalT: 1, nominalW: 6, minimumParentLengthIn: 96, qty: 10, role: "shelf-parents" })
  ]),
  shelfOrderedCutLengthIn: null,
  shelfMillingDemand: null,
  pilot: Object.freeze({
    toolDiameterIn: 0.1875,
    mode: "SPOT_ON_LOCATION",
    reference: "FROM_BASE",
    acrossWidthRule: "CENTERED_ON_WIDE_FACE"
  })
});

assert.equal(FROZEN_ALCOVE_DEFAULT.configuration.heightIn, 72);
assert.equal(FROZEN_ALCOVE_DEFAULT.configuration.widthIn, 45.5);
assert.equal(FROZEN_ALCOVE_DEFAULT.configuration.depthIn, 14);
assert.equal(FROZEN_ALCOVE_DEFAULT.configuration.interiorSpanIn, 44);
assert.deepEqual(FROZEN_ALCOVE_DEFAULT.configuration.shelfElevationsIn, [12, 24, 36, 45, 65]);
assert.equal(FROZEN_ALCOVE_DEFAULT.shelfOrderedCutLengthIn, null);
assert.equal(FROZEN_ALCOVE_DEFAULT.shelfMillingDemand, null);

const pine72 = findSku(catalog, "STB-ZERO-PINE-1X6-72-001");
const pine96 = findSku(catalog, "STB-ZERO-PINE-1X6-96-001");
assert.ok(pine72 && pine96);
for (const item of [pine72, pine96]) {
  assert.equal(item.actualT, 0.75);
  assert.equal(item.actualW, 5.5);
  assert.ok(item.stockL_in <= 96);
}

const noOpCapability = capabilityAnswer(pine72, [], {
  keptLengthIn: 72
});
assert.equal(noOpCapability.status, "SUPPORTABLE");

const spotCapability = capabilityAnswer(pine72, ["SPOT_ON_LOCATION"], {
  keptLengthIn: 72,
  spotDemand: {
    required: true,
    mode: "SPOT_ON_LOCATION",
    locationRule: "CENTERED_ON_PART",
    locationAlongLengthIn: 65,
    acrossWidthRule: "CENTERED_ON_WIDE_FACE"
  }
});
assert.equal(spotCapability.status, "SUPPORTABLE");

function uprightDemand({ pilot }) {
  const features = pilot
    ? FROZEN_ALCOVE_DEFAULT.configuration.shelfElevationsIn.map((xIn, index) => ({
        featureId: "ALCOVE-L-SPOT-" + String(index + 1).padStart(2, "0"),
        kind: "SPOT_ON_LOCATION",
        targetRole: "LEFT_UPRIGHT",
        partRelativeXIn: xIn,
        xIn,
        reference: "FROM_BASE",
        acrossWidthRule: "CENTERED_ON_WIDE_FACE",
        toolDiameterIn: 0.1875,
        basis: "DERIVED_FROM_SHELF_ELEVATION"
      }))
    : [];

  return {
    title: "Alcove default — representative whole-parent upright",
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
    sawAngleDeg: 0,
    cutPlane: "miter-face",
    datumCMethod: "MECHANICAL_REFERENCE",
    parts: [{
      partId: "LEFT_UPRIGHT",
      lengthIn: 72,
      features
    }],
    declaredSpotCount: features.length,
    unresolvedConditions: []
  };
}

const pilotOff = evaluateDimensionalTravelJob(catalog, uprightDemand({ pilot: false }));
assert.equal(pilotOff.status, "REFUSED");
assert.equal(pilotOff.materialResolution.reason, "NO_COMPLETE_DIMENSIONAL_CANDIDATE");
assert.ok(pilotOff.materialResolution.consideredCandidates.length >= 2);
assert.equal(pilotOff.materialResolution.consideredCandidates[0].storeSku, "STB-ZERO-PINE-1X6-72-001");
assert.equal(pilotOff.materialResolution.consideredCandidates[0].capabilityStatus, "SUPPORTABLE");
assert.equal(pilotOff.materialResolution.consideredCandidates[0].reason, "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL");
assert.equal(pilotOff.materialResolution.consideredCandidates[1].storeSku, "STB-ZERO-PINE-1X6-96-001");
assert.equal(pilotOff.materialResolution.consideredCandidates[1].capabilityStatus, "SUPPORTABLE");
assert.equal(pilotOff.materialResolution.consideredCandidates[1].reason, "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL");

const pilotOn = evaluateDimensionalTravelJob(catalog, uprightDemand({ pilot: true }));
assert.equal(pilotOn.status, "REFUSED");
assert.equal(pilotOn.materialResolution.reason, "NO_COMPLETE_DIMENSIONAL_CANDIDATE");
assert.ok(pilotOn.materialResolution.consideredCandidates.length >= 2);
assert.equal(pilotOn.materialResolution.consideredCandidates[0].capabilityStatus, "SUPPORTABLE");
assert.equal(pilotOn.materialResolution.consideredCandidates[0].reason, "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL");
assert.equal(pilotOn.materialResolution.consideredCandidates[1].capabilityStatus, "SUPPORTABLE");
assert.equal(pilotOn.materialResolution.consideredCandidates[1].reason, "LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL");

const legacy = estimatePineAlcove(catalog, 5);
assert.equal(legacy.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(legacy.complete, false);
assert.equal(legacy.totals.material, 272.86);
assert.equal(legacy.totals.hardware, 18);
assert.equal(legacy.totals.machine_service, null);
assert.equal(legacy.totals.Q, null);
assert.ok(legacy.unresolvedConditions.includes("DIMENSIONAL_TRAVEL_STANDARD_INPUT_REQUIRED"));

console.log("alcove-whole-parent-fail-first.test.mjs ok");
console.log("pilot OFF", pilotOff.status, pilotOff.materialResolution.consideredCandidates.map((x) => [x.storeSku, x.capabilityStatus, x.reason]));
console.log("pilot ON", pilotOn.status, pilotOn.materialResolution.consideredCandidates.map((x) => [x.storeSku, x.capabilityStatus, x.reason]));
console.log("legacy Alcove Q", legacy.totals.Q);
