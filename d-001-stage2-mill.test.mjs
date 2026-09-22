import assert from "node:assert/strict";
import { loadCatalog, findSku, capabilityAnswer, evaluateJob } from "./store-zero-stage2-store.mjs";
import {
  estimatePicnicLegSquare,
  estimatePicnicLegTapered,
  millLongMin,
  millEndMin
} from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
const sku = findSku(catalog, "STB-ZERO-SPF-2X4-96-001");
assert.ok(sku);
assert.ok(sku.supportedOps.includes("MILL_LONGITUDINAL_PROFILE"));
assert.ok(sku.supportedOps.includes("MILL_END_PROFILE"));

const cap = capabilityAnswer(sku, ["CROSSCUT", "MILL_LONGITUDINAL_PROFILE", "MILL_END_PROFILE"]);
assert.equal(cap.status, "SUPPORTABLE");

const square = estimatePicnicLegSquare(catalog);
const tapered = estimatePicnicLegTapered(catalog);
assert.equal(square.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(tapered.status, "PARTIAL_BUDGETARY_ESTIMATE");
assert.equal(square.totals.material, tapered.totals.material);
assert.equal(square.cycle.T_job_min, null);
assert.equal(tapered.cycle.T_job_min, null);
assert.ok(tapered.cycle.modeledOperationSubtotalMin > square.cycle.modeledOperationSubtotalMin);
assert.equal(square.totals.cell_recovery, null);
assert.equal(tapered.totals.cell_recovery, null);
assert.equal(tapered.totals.Q, square.totals.Q);
assert.ok(tapered.cycle.modeledOperationSubtotalMin - square.cycle.modeledOperationSubtotalMin >= millLongMin(28) + millEndMin(1) - 0.001);

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
console.log("square Q", square.totals.Q, "modeled min", square.cycle.modeledOperationSubtotalMin);
console.log("taper Q", tapered.totals.Q, "modeled min", tapered.cycle.modeledOperationSubtotalMin);
console.log("delta Q", +(tapered.totals.Q - square.totals.Q).toFixed(2));
