import assert from "node:assert/strict";
import { loadCatalog, evaluateJob, STAGE2_JOB_DISPOSITIONS } from "./store-zero-stage2-store.mjs";
import { estimatePineAlcove, CYCLE_MODEL } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
assert.deepEqual(STAGE2_JOB_DISPOSITIONS.sort(), [
  "REFUSED",
  "SUPPORTABLE",
  "UNAVAILABLE",
  "UNRESOLVED"
]);
assert.equal(CYCLE_MODEL.id, "STB-D001-CYCLE-MODEL-S2-0.1");
assert.equal(CYCLE_MODEL.measured, false);

function withOnHand(storeSku, onHand, allocated = 0) {
  return {
    ...catalog,
    offerings: catalog.offerings.map((o) =>
      o.storeSku === storeSku ? { ...o, onHand, allocated } : o
    )
  };
}

const ok = evaluateJob(catalog, {
  title: "sufficient",
  lines: [{ storeSku: "STB-ZERO-PINE-1X6-96-001", qty: 1, requiredOps: ["CROSSCUT"] }]
});
assert.equal(ok.status, "SUPPORTABLE");
assert.equal(ok.lines[0].stock.status, "ON_HAND_SUFFICIENT");

const short = evaluateJob(withOnHand("STB-ZERO-PINE-1X6-96-001", 3, 0), {
  title: "short",
  lines: [{ storeSku: "STB-ZERO-PINE-1X6-96-001", qty: 10, requiredOps: ["CROSSCUT"] }]
});
assert.equal(short.lines[0].stock.status, "ON_HAND_SHORT");
assert.equal(short.status, "UNAVAILABLE");

const empty = evaluateJob(withOnHand("STB-ZERO-PINE-1X6-96-001", 0, 0), {
  title: "empty",
  lines: [{ storeSku: "STB-ZERO-PINE-1X6-96-001", qty: 1, requiredOps: ["CROSSCUT"] }]
});
assert.equal(empty.lines[0].stock.status, "NOT_ON_HAND");
assert.equal(empty.status, "UNAVAILABLE");

const missing = evaluateJob(catalog, {
  title: "missing sku",
  lines: [{ storeSku: "STB-ZERO-DOES-NOT-EXIST", qty: 1, requiredOps: ["CROSSCUT"] }]
});
assert.equal(missing.status, "UNRESOLVED");

const refused = evaluateJob(catalog, {
  title: "op not offered",
  lines: [
    {
      storeSku: "STB-ZERO-PINESTD-1X4-96-001",
      qty: 1,
      requiredOps: ["MILL_LONGITUDINAL_PROFILE"]
    }
  ]
});
assert.equal(refused.status, "REFUSED");

const pine = estimatePineAlcove(catalog);
assert.equal(pine.totals.material, 272.86);
assert.equal(pine.totals.Q, null);
assert.equal(pine.cycle.model, "STB-D001-CYCLE-MODEL-S2-0.1");

console.log("store-zero-disposition.test.mjs ok");
