import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateJob,
  evaluateSheetMode2Job,
  evaluateSheetMode2ArchedJob,
  loadCatalog
} from "./store-zero-stage2-store.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const published = JSON.parse(readFileSync(join(ROOT, "store-published-jobs.json"), "utf8"));
const catalog = loadCatalog();

assert.equal(published.status, "CANDIDATE");
assert.equal(published.jobs.length, 3);
assert.deepEqual(
  published.jobs.map((job) => job.publicName),
  ["Square 2x4", "Rectangular sheet stencil", "Arched opening in 1/2 in plywood"]
);

const square = published.jobs.find((job) => job.id === "PUB-SQUARE-STICK-001");
assert.equal(square.currentAppPin, "CONNECTED");
const squareResult = evaluateJob(catalog, {
  title: square.publicName,
  lines: [{
    storeSku: square.stock[0].storeSku,
    qty: square.stock[0].qty,
    requiredOps: square.implementationDefaults.requiredOps,
    keptLengthIn: square.defaults.finishedLengthIn
  }]
});
assert.equal(squareResult.status, "SUPPORTABLE");

const rect = published.jobs.find((job) => job.id === "PUB-RECT-STENCIL-001");
assert.equal(rect.currentAppPin, "NOT_CONNECTED");
const rectResult = evaluateSheetMode2Job(catalog, {
  title: rect.publicName,
  line: {
    storeSku: rect.stock[0].storeSku,
    qty: rect.stock[0].qty,
    profileKind: rect.implementationDefaults.profileKind,
    blankL_in: rect.defaults.blankLengthIn,
    blankW_in: rect.defaults.blankWidthIn,
    tabCount: rect.implementationDefaults.tabCount,
    routeDepthIn: rect.implementationDefaults.routeDepthIn
  }
});
assert.equal(rectResult.status, "SUPPORTABLE");
assert.equal(rectResult.physicalStatus, "NOT_CLAIMED");
assert.equal(rectResult.estimate, null);

const arch = published.jobs.find((job) => job.id === "PUB-ARCHED-OPENING-001");
assert.equal(arch.currentAppPin, "NOT_CONNECTED");
const archResult = evaluateSheetMode2ArchedJob(catalog, {
  title: arch.publicName,
  line: {
    storeSku: arch.stock[0].storeSku,
    qty: arch.stock[0].qty,
    outerL_in: arch.defaults.outerLengthIn,
    outerW_in: arch.defaults.outerWidthIn,
    apertureW_in: arch.defaults.openingWidthIn,
    apertureStraightH_in: arch.defaults.straightHeightIn,
    arcChord_in: arch.defaults.openingWidthIn,
    arcRise_in: arch.defaults.riseIn,
    tabCount: arch.implementationDefaults.tabCount,
    routeDepthIn: arch.implementationDefaults.routeDepthIn
  }
});
assert.equal(archResult.status, "SUPPORTABLE");
assert.equal(archResult.physicalStatus, "NOT_CLAIMED");
assert.equal(archResult.line.capability.curve.radius_in, 19.5);
assert.equal(archResult.line.capability.retention.physicalRetentionStatus, "NOT_MEASURED");

for (const job of published.jobs) {
  assert.ok(job.notClaimed.includes("Cycle Start"));
  assert.ok(job.notClaimed.includes("physical fabrication"));
}

console.log("store-published-jobs.test.mjs ok");
