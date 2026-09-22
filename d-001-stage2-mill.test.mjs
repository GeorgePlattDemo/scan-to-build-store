import assert from "node:assert/strict";
import { loadCatalog, findSku, capabilityAnswer, evaluateJob } from "./store-zero-stage2-store.mjs";
import {
  estimatePicnicLegSquare,
  estimatePicnicLegTapered
} from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
const sku = findSku(catalog, "STB-ZERO-SPF-2X4-96-001");
assert.ok(sku);
assert.ok(sku.supportedOps.includes("MILL_LONGITUDINAL_PROFILE"));
assert.ok(sku.supportedOps.includes("MILL_END_PROFILE"));

const cap = capabilityAnswer(sku, ["CROSSCUT", "MILL_LONGITUDINAL_PROFILE", "MILL_END_PROFILE"]);
assert.equal(cap.status, "SUPPORTABLE");

// Capability remains declared, but these historical count/path summaries do not
// carry the complete identified feature/operation travel record required for Q.
const square = estimatePicnicLegSquare(catalog);
const tapered = estimatePicnicLegTapered(catalog);
assert.equal(square.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(tapered.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(square.totals.material, tapered.totals.material);
assert.equal(square.totals.Q, null);
assert.equal(tapered.totals.Q, null);
assert.ok(square.unresolvedConditions.includes("DIMENSIONAL_TRAVEL_STANDARD_INPUT_REQUIRED"));
assert.ok(tapered.unresolvedConditions.includes("DIMENSIONAL_TRAVEL_STANDARD_INPUT_REQUIRED"));

const evaln = evaluateJob(catalog, {
  title: tapered.title,
  estimate: tapered,
  lines: [
    {
      storeSku: "STB-ZERO-SPF-2X4-96-001",
      qty: 1,
      requiredOps: ["CROSSCUT", "MILL_LONGITUDINAL_PROFILE", "MILL_END_PROFILE"]
    }
  ]
});
assert.equal(evaln.status, "SUPPORTABLE");

console.log("d-001-stage2-mill.test.mjs ok");
console.log("picnic capability remains SUPPORTABLE; complete Q waits for travel-standard migration");
