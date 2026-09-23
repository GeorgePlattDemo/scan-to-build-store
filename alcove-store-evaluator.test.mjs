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
  withPrograms = true,
  unresolvedConditions = []
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
        requiredOps: ["CROSSCUT"],
        carriesSpotDemand: true,
        selectionAuthority: "STORE_ZERO"
      },
      {
        requirementId: "ALCOVE-SHELF-PARENTS",
        role: "SHELVES",
        requiredOps: ["CROSSCUT"],
        carriesSpotDemand: false,
        selectionAuthority: "STORE_ZERO"
      }
    ],
    componentPrograms: withPrograms
      ? componentPrograms({ height, depth, span, shelfCount })
      : [],
    hardwareDemand: {
      requirementId: "ALCOVE-PINS-AND-SCREWS",
      description: "pins + screws",
      qty: 1,
      selectionAuthority: "STORE_ZERO"
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
assert.equal(pine.status, "SUPPORTABLE");
assert.equal(pine.complete, true);
assert.deepEqual(
  pine.lines.map((line) => [line.role, line.storeSku, line.qty, line.status]),
  [
    ["UPRIGHTS", "STB-ZERO-PINE-1X6-72-001", 4, "SUPPORTABLE"],
    ["SHELVES", "STB-ZERO-PINE-1X6-96-001", 8, "SUPPORTABLE"]
  ]
);
assert.equal(pine.materialResolution.selectionPolicy, "LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING");
assert.equal(pine.materialResolution.parentSelections[1].stockLengthIn, 96);
assert.equal(pine.materialResolution.parentSelections[1].qty, 8);
assert.equal(pine.estimate.totals.material, 230.88);
assert.equal(pine.estimate.totals.hardware, 18);
assert.ok(Number.isFinite(pine.estimate.totals.machine_service));
assert.ok(Number.isFinite(pine.estimate.totals.Q));

const poplar = evaluateAlcoveJob(catalog, demand("poplar"));
assert.equal(poplar.status, "SUPPORTABLE");
assert.deepEqual(
  poplar.lines.map((line) => line.storeSku),
  ["STB-ZERO-POP-1X6-72-001", "STB-ZERO-POP-1X6-96-001"]
);
assert.ok(poplar.estimate.totals.material > pine.estimate.totals.material);
assert.ok(poplar.estimate.totals.Q > pine.estimate.totals.Q);

const oakCutMill = evaluateAlcoveJob(catalog, demand("oak", { depth: 14 }));
assert.equal(oakCutMill.status, "REFUSED");
assert.equal(oakCutMill.complete, false);
assert.equal(oakCutMill.reasonRecords.some((reason) => reason.category === "CAPABILITY_GAP"), true);
assert.equal(oakCutMill.estimate.totals.Q, null);

const cherryCutMill = evaluateAlcoveJob(catalog, demand("cherry", { depth: 14 }));
assert.equal(cherryCutMill.status, "REFUSED");
assert.equal(cherryCutMill.complete, false);
assert.equal(cherryCutMill.reasonRecords.some((reason) => reason.category === "CAPABILITY_GAP"), true);

const oakCutOnly = evaluateAlcoveJob(catalog, demand("oak", { depth: 11 }));
assert.equal(oakCutOnly.status, "SUPPORTABLE");
assert.equal(oakCutOnly.complete, true);
assert.equal(oakCutOnly.machineEvaluation.time.T_MILL_sec, 0);

const cherryCutOnly = evaluateAlcoveJob(catalog, demand("cherry", { depth: 11 }));
assert.equal(cherryCutOnly.status, "SUPPORTABLE");
assert.equal(cherryCutOnly.complete, true);
assert.equal(cherryCutOnly.machineEvaluation.time.T_MILL_sec, 0);

const exact72 = evaluateAlcoveJob(catalog, demand("pine", { height: 72 }));
assert.equal(exact72.status, "SUPPORTABLE");
assert.equal(
  exact72.lines.find((line) => line.role === "UPRIGHTS").storeSku,
  "STB-ZERO-PINE-1X6-96-001"
);
assert.equal(
  exact72.lines.find((line) => line.role === "UPRIGHTS").demandedStockLengthIn,
  96
);

const deeper = evaluateAlcoveJob(catalog, demand("pine", { depth: 11 }));
assert.equal(deeper.status, "SUPPORTABLE");
assert.notEqual(deeper.calculationIdentity.inputHash, pine.calculationIdentity.inputHash);
assert.notEqual(deeper.estimate.totals.material, pine.estimate.totals.material);

const spotted = evaluateAlcoveJob(catalog, demand("pine", { pilot: true }));
assert.equal(spotted.status, "UNRESOLVED");
assert.equal(spotted.lines[0].requiredOps.includes("SPOT_ON_LOCATION"), true);
assert.equal(
  spotted.reasonRecords.some((reason) =>
    reason.category === "DEFINITION_GAP" &&
    reason.code === "ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED"
  ),
  true
);
assert.equal(spotted.estimate.totals.Q, null);

const noMaterial = evaluateAlcoveJob(catalog, demand("walnut"));
assert.equal(noMaterial.status, "UNAVAILABLE");
assert.equal(noMaterial.reasonRecords.some((reason) => reason.category === "MATERIAL_GAP"), true);

const noPrograms = evaluateAlcoveJob(catalog, demand("pine", { withPrograms: false }));
assert.equal(noPrograms.status, "UNRESOLVED");
assert.equal(noPrograms.reasonRecords.some((reason) => reason.category === "DEFINITION_GAP"), true);

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

console.log("PASS · Alcove Store resolves parent stock from finished demand and returns reasoned gaps");
console.log("pine Q", pine.estimate.totals.Q, pine.materialResolution.parentSelections);
console.log("poplar Q", poplar.estimate.totals.Q);
console.log("oak cut+mill", oakCutMill.status, oakCutMill.reasonRecords);
console.log("spot status", spotted.status, spotted.reasonRecords);
console.log("72 in upright parent", exact72.lines.find((line) => line.role === "UPRIGHTS").storeSku);
