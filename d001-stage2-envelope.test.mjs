import assert from "node:assert/strict";
import { loadCatalog, findSku, capabilityAnswer, evaluateJob } from "./store-zero-stage2-store.mjs";
import { envelopeCheck, millPassesForDepth, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
import { estimatePineAlcove, estimatePicnicLegTapered } from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();
assert.equal(D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN, 14);
assert.equal(D001_STAGE2_ENVELOPE.stock.maxWidthIn, 12);
assert.equal(millPassesForDepth(0.75), 2);

const pine = findSku(catalog, "STB-ZERO-PINE-1X6-96-001");
assert.equal(capabilityAnswer(pine, ["CROSSCUT"]).status, "SUPPORTABLE");

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
