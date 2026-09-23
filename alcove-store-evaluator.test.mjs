import assert from "node:assert/strict";
import { loadCatalog } from "./store-zero-stage2-store.mjs";
import {
  ALCOVE_STORE_STANDARD,
  evaluateAlcoveJob,
  evaluateAlcoveStoreRequest
} from "./alcove-store-evaluator.mjs";

const catalog = loadCatalog();

function componentPrograms({ height = 65, depth = 14, span = 44, shelfCount = 5 } = {}) {
  const stockWidth = 5.5;
  const across = Math.ceil(depth / stockWidth);
  const programs = [];

  for (let index = 0; index < 4; index += 1) {
    programs.push({
      componentId: `ALCOVE-UPRIGHT-${String(index + 1).padStart(2, "0")}`,
      requirementId: "ALCOVE-UPRIGHT-PARENTS",
      finishedLengthIn: height,
      finishedWidthIn: stockWidth,
      features: []
    });
  }

  for (let shelf = 0; shelf < shelfCount; shelf += 1) {
    for (let strip = 0; strip < across; strip += 1) {
      const remaining = depth - stockWidth * strip;
      const finishedWidthIn = Math.min(stockWidth, Math.max(0, remaining));
      const needsMill = finishedWidthIn < stockWidth - 1e-9;
      programs.push({
        componentId: `ALCOVE-SHELF-${String(shelf + 1).padStart(2, "0")}-STRIP-${String(strip + 1).padStart(2, "0")}`,
        requirementId: "ALCOVE-SHELF-PARENTS",
        finishedLengthIn: span,
        finishedWidthIn,
        features: needsMill
          ? [{
              featureId: `ALCOVE-SHELF-${String(shelf + 1).padStart(2, "0")}-RIP`,
              kind: "MILL_LONGITUDINAL_PROFILE",
              pathLengthIn: span,
              yIn: finishedWidthIn,
              totalDepthIn: 0.75
            }]
          : []
      });
    }
  }
  return programs;
}

function demand(species = "pine", {
  pilot = false,
  height = 65,
  depth = 14,
  span = 44,
  shelfCount = 5,
  withPrograms = false,
  unresolvedConditions = [
    "FLOOR_SLOPE_RECORDED",
    "WALL_BOW_RECORDED",
    "ORDERED_SIZE_ADJUSTMENT_NOT_ESTABLISHED"
  ]
} = {}) {
  const shelfElevations = [12, 24, 36, 45, 65].slice(0, shelfCount);
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
  const across = Math.ceil(depth / 5.5);
  const boardsPerShelf = Math.ceil(across / 2);
  const shelfParentQty = boardsPerShelf * shelfCount;

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
        keptLengthIn: span,
        qty: shelfParentQty,
        requiredOps: ["CROSSCUT"],
        carriesSpotDemand: false
      }
    ],
    componentPrograms: withPrograms
      ? componentPrograms({ height, depth, span, shelfCount })
      : [],
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
    unresolvedConditions
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
assert.ok(pine.unresolvedConditions.includes("ALCOVE_COMPONENT_PROGRAMS_REQUIRED"));
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

const pineCutMill = evaluateAlcoveJob(catalog, demand("pine", {
  height: 65,
  depth: 14,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(pineCutMill.status, "SUPPORTABLE");
assert.equal(pineCutMill.complete, true);
assert.equal(pineCutMill.estimate.status, "BUDGETARY_ESTIMATE");
assert.ok(Number.isFinite(pineCutMill.estimate.totals.machine_service));
assert.ok(pineCutMill.estimate.totals.machine_service > 0);
assert.ok(Number.isFinite(pineCutMill.estimate.totals.Q));
assert.ok(pineCutMill.estimate.totals.Q > pineCutMill.estimate.totals.material + pineCutMill.estimate.totals.hardware);
assert.ok(pineCutMill.machineEvaluation.time.T_MILL_sec > 0);
assert.equal(pineCutMill.componentPrograms.length, 19);
assert.ok(
  pineCutMill.lines.find((line) => line.role === "SHELVES").requiredOps.includes("MILL_LONGITUDINAL_PROFILE")
);

const poplarCutMill = evaluateAlcoveJob(catalog, demand("poplar", {
  height: 65,
  depth: 14,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(poplarCutMill.status, "SUPPORTABLE");
assert.equal(poplarCutMill.complete, true);
assert.ok(poplarCutMill.estimate.totals.Q > pineCutMill.estimate.totals.Q);
assert.ok(poplarCutMill.machineEvaluation.time.T_MILL_sec > 0);

const oakCutMill = evaluateAlcoveJob(catalog, demand("oak", {
  height: 65,
  depth: 14,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(oakCutMill.status, "REFUSED");
assert.equal(oakCutMill.complete, false);
assert.ok(
  oakCutMill.lines
    .find((line) => line.role === "SHELVES")
    .capability.missing
    .includes("OP_NOT_ON_OFFERING:MILL_LONGITUDINAL_PROFILE")
);
assert.equal(oakCutMill.estimate.totals.Q, null);

const cherryCutMill = evaluateAlcoveJob(catalog, demand("cherry", {
  height: 65,
  depth: 14,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(cherryCutMill.status, "REFUSED");
assert.equal(cherryCutMill.complete, false);
assert.equal(cherryCutMill.estimate.totals.Q, null);

const oakCutOnly = evaluateAlcoveJob(catalog, demand("oak", {
  height: 65,
  depth: 11,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(oakCutOnly.status, "SUPPORTABLE");
assert.equal(oakCutOnly.complete, true);
assert.equal(oakCutOnly.machineEvaluation.time.T_MILL_sec, 0);
assert.ok(Number.isFinite(oakCutOnly.estimate.totals.Q));

const cherryCutOnly = evaluateAlcoveJob(catalog, demand("cherry", {
  height: 65,
  depth: 11,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(cherryCutOnly.status, "SUPPORTABLE");
assert.equal(cherryCutOnly.complete, true);
assert.equal(cherryCutOnly.machineEvaluation.time.T_MILL_sec, 0);
assert.ok(Number.isFinite(cherryCutOnly.estimate.totals.Q));

const exact72From72 = evaluateAlcoveJob(catalog, demand("pine", {
  height: 72,
  depth: 14,
  withPrograms: true,
  unresolvedConditions: []
}));
assert.equal(exact72From72.status, "REFUSED");
assert.ok(
  exact72From72.refusalConditions.includes(
    "COMPONENTS_EXCEED_DECLARED_PARENT_MATERIAL:ALCOVE-UPRIGHT-PARENTS"
  )
);
assert.equal(exact72From72.estimate.totals.Q, null);

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
console.log("pine cut+mill Q", pineCutMill.estimate.totals.Q, "machine min", pineCutMill.estimate.cycle.T_job_min);
console.log("poplar cut+mill Q", poplarCutMill.estimate.totals.Q, "machine min", poplarCutMill.estimate.cycle.T_job_min);
console.log("oak cut-only Q", oakCutOnly.estimate.totals.Q);
console.log("cherry cut-only Q", cherryCutOnly.estimate.totals.Q);
console.log("72-from-72 status", exact72From72.status, exact72From72.refusalConditions);
