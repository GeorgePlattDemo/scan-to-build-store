import assert from "node:assert/strict";
import { loadCatalog } from "./store-zero-stage2-store.mjs";
import {
  ALCOVE_STORE_STANDARD,
  evaluateAlcoveJob,
  evaluateAlcoveStoreRequest
} from "./alcove-store-evaluator.mjs";

const catalog = loadCatalog();

function demand(species = "pine", { pilot = false, height = 65 } = {}) {
  const shelfElevations = [12, 24, 36, 45, 65];
  const features = pilot
    ? shelfElevations.flatMap((xIn, index) => [
        {
          featureId: `ALCOVE-L-SPOT-${index + 1}`,
          targetRole: "LEFT_UPRIGHT",
          kind: "SPOT_ON_LOCATION",
          xIn,
          partRelativeXIn: xIn,
          reference: "FROM_BASE",
          acrossWidthRule: "CENTERED_ON_WIDE_FACE",
          toolDiameterIn: 0.1875
        },
        {
          featureId: `ALCOVE-R-SPOT-${index + 1}`,
          targetRole: "RIGHT_UPRIGHT",
          kind: "SPOT_ON_LOCATION",
          xIn,
          partRelativeXIn: xIn,
          reference: "FROM_BASE",
          acrossWidthRule: "CENTERED_ON_WIDE_FACE",
          toolDiameterIn: 0.1875
        }
      ])
    : [];

  return {
    title: "Alcove insert — Store-owned material answer",
    classId: ALCOVE_STORE_STANDARD.classId,
    configurationId: "ALCOVE-USER1",
    configurationVersion: "1",
    materialDemand: {
      species,
      form: "board",
      nominalT: 1,
      nominalW: 6,
      grade: "select"
    },
    boardRequirements: [
      {
        requirementId: "ALCOVE-UPRIGHT-PARENTS",
        role: "UPRIGHTS",
        stockLengthIn: 72,
        keptLengthIn: height,
        qty: 4,
        requiredOps: ["CROSSCUT"],
        carriesSpotDemand: true
      },
      {
        requirementId: "ALCOVE-SHELF-PARENTS",
        role: "SHELVES",
        stockLengthIn: 96,
        keptLengthIn: 44,
        qty: 10,
        requiredOps: ["CROSSCUT"],
        carriesSpotDemand: false
      }
    ],
    hardwareDemand: {
      storeSku: "STB-ZERO-HW-ALCOVE-PACK-001",
      qty: 1
    },
    spotDemand: {
      enabled: pilot,
      mode: "SPOT_ON_LOCATION",
      toolDiameterIn: 0.1875,
      source: "SHELF_ELEVATIONS",
      features
    },
    unresolvedConditions: [
      "FLOOR_SLOPE_RECORDED",
      "WALL_BOW_RECORDED",
      "ORDERED_SIZE_ADJUSTMENT_NOT_ESTABLISHED"
    ]
  };
}

const pine = evaluateAlcoveJob(catalog, demand("pine"));
assert.equal(pine.status, "UNRESOLVED");
assert.equal(pine.complete, false);
assert.deepEqual(
  pine.lines.map((line) => [line.role, line.storeSku, line.qty, line.status]),
  [
    ["UPRIGHTS", "STB-ZERO-PINE-1X6-72-001", 4, "SUPPORTABLE"],
    ["SHELVES", "STB-ZERO-PINE-1X6-96-001", 10, "SUPPORTABLE"]
  ]
);
assert.equal(pine.estimate.totals.material, 272.86);
assert.equal(pine.estimate.totals.hardware, 18);
assert.equal(pine.estimate.totals.machine_service, null);
assert.equal(pine.estimate.totals.Q, null);
assert.ok(pine.unresolvedConditions.includes("ALCOVE_WHOLE_BOARD_TRAVEL_STANDARD_REQUIRED"));
assert.equal(
  pine.materialResolution.selectionPolicy,
  "EXACT_PROJECT_STOCK_LENGTH_CLASS_STORE_SKU_BY_MATERIAL"
);

const poplar = evaluateAlcoveJob(catalog, demand("poplar"));
assert.equal(poplar.status, "UNRESOLVED");
assert.deepEqual(
  poplar.lines.map((line) => line.storeSku),
  ["STB-ZERO-POP-1X6-72-001", "STB-ZERO-POP-1X6-96-001"]
);
assert.equal(poplar.estimate.totals.material, 418.36);
assert.equal(poplar.estimate.totals.hardware, 18);
assert.equal(poplar.estimate.totals.Q, null);

const oak = evaluateAlcoveJob(catalog, demand("oak"));
assert.equal(oak.status, "UNAVAILABLE");
assert.equal(oak.lines[0].stock.status, "ON_HAND_SUFFICIENT");
assert.equal(oak.lines[1].storeSku, "STB-ZERO-OAK-1X6-96-001");
assert.equal(oak.lines[1].stock.status, "ON_HAND_SHORT");
assert.equal(oak.lines[1].stock.available, 8);
assert.equal(oak.lines[1].stock.qtyNeeded, 10);
assert.equal(oak.estimate.totals.material, 454.86);
assert.equal(oak.estimate.totals.Q, null);

const cherry = evaluateAlcoveJob(catalog, demand("cherry"));
assert.equal(cherry.status, "UNAVAILABLE");
assert.equal(cherry.lines[1].storeSku, "STB-ZERO-CHR-1X6-96-001");
assert.equal(cherry.lines[1].stock.status, "ON_HAND_SHORT");
assert.equal(cherry.lines[1].stock.available, 6);
assert.equal(cherry.estimate.totals.material, 727.72);
assert.equal(cherry.estimate.totals.Q, null);

const spotted = evaluateAlcoveJob(catalog, demand("pine", { pilot: true }));
assert.equal(spotted.status, "REFUSED");
assert.equal(spotted.lines[0].requiredOps.includes("SPOT_ON_LOCATION"), true);
assert.equal(spotted.lines[0].capability.status, "REFUSED");
assert.ok(spotted.lines[0].capability.missing.includes("SPOT_LOCATION_RULE_NOT_DECLARED"));
assert.ok(
  spotted.unresolvedConditions.includes(
    "ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE"
  )
);
assert.equal(spotted.estimate.totals.Q, null);

const tooTall = evaluateAlcoveJob(catalog, demand("pine", { height: 73 }));
assert.equal(tooTall.status, "REFUSED");
assert.ok(tooTall.lines[0].capability.missing.includes("KEPT_LENGTH_EXCEEDS_STOCK_LENGTH"));

const requestA = evaluateAlcoveStoreRequest(catalog, demand("pine"), {
  requestId: "ALCOVE-REQ-PINE",
  evaluatedAt: "2026-09-22T23:00:00.000Z",
  storeRevision: "STORE-TEST-REV"
});
const requestB = evaluateAlcoveStoreRequest(catalog, demand("poplar"), {
  requestId: "ALCOVE-REQ-POPLAR",
  evaluatedAt: "2026-09-22T23:00:00.000Z",
  storeRevision: "STORE-TEST-REV"
});
assert.equal(requestA.freshEvaluation, true);
assert.equal(requestA.evaluationReceipt.freshnessRule, "STB-STORE-FRESH-EVALUATION-0.1");
assert.equal(requestA.evaluationReceipt.authority.storeRevision, "STORE-TEST-REV");
assert.notEqual(requestA.calculationIdentity.inputHash, requestB.calculationIdentity.inputHash);
assert.notEqual(requestA.calculationIdentity.resultHash, requestB.calculationIdentity.resultHash);
assert.notEqual(requestA.evaluationReceipt.receiptHash, requestB.evaluationReceipt.receiptHash);

console.log("PASS · Alcove Store request is catalog-owned, fail-first, and species-sensitive");
console.log("pine material", pine.estimate.totals.material);
console.log("poplar material", poplar.estimate.totals.material);
console.log("oak status", oak.status, oak.lines[1].stock.status);
console.log("cherry status", cherry.status, cherry.lines[1].stock.status);
console.log("pilot status", spotted.status, spotted.lines[0].capability.missing);
