import assert from "node:assert/strict";
import {
  evaluateSheetMode2,
  sheetMode2NeutralOps,
  S001_MODE2_ENVELOPE
} from "./s001-mode2-envelope.mjs";
import {
  loadCatalog,
  findSku,
  evaluateJob,
  evaluateSheetMode2Job,
  estimateSheetMode2Job
} from "./store-zero-stage2-store.mjs";
import { envelopeCheck } from "./d001-stage2-envelope.mjs";

const catalog = loadCatalog();
const ply = findSku(catalog, "STB-ZERO-PLY-075-48X96-001");
const osb = findSku(catalog, "STB-ZERO-OSB-075-48X96-001");
const board = findSku(catalog, "STB-ZERO-SPF-2X4-72-001");

assert.equal(S001_MODE2_ENVELOPE.evidenceClass, "REFERENCE");
assert.equal(S001_MODE2_ENVELOPE.commissioned, false);
assert.equal(S001_MODE2_ENVELOPE.physicalStatus, "NOT_CLAIMED");
assert.ok(ply.supportedOps.includes("ROUTE_PROFILE"));
assert.ok(ply.supportedOps.includes("RETAIN_TABS"));
assert.equal(osb.supportedOps.includes("ROUTE_PROFILE"), false);

const straight = evaluateSheetMode2(ply, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(straight.status, "SUPPORTABLE");
assert.equal(straight.profileKind, "STRAIGHT_RECT");

const curve = evaluateSheetMode2(ply, {
  profileKind: "CURVILINEAR_OUTLINE",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(curve.status, "UNRESOLVED");
assert.ok(curve.unresolved.includes("CURVILINEAR_GEOMETRY_REQUIRED"));

const tabsMissing = evaluateSheetMode2(ply, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  routeDepthIn: 0.5
});
assert.equal(tabsMissing.status, "UNRESOLVED");
assert.ok(tabsMissing.unresolved.includes("TAB_COUNT_MISSING"));

const noTabs = evaluateSheetMode2(ply, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 0,
  routeDepthIn: 0.5
});
assert.equal(noTabs.status, "REFUSED");
assert.ok(noTabs.reasons.includes("STENCIL_TABS_REQUIRED"));

const osbJob = evaluateSheetMode2(osb, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(osbJob.status, "REFUSED");
assert.ok(osbJob.reasons.some((r) => r.startsWith("OP_NOT_ON_OFFERING")));

const dimensional = evaluateSheetMode2(board, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(dimensional.status, "REFUSED");
assert.ok(dimensional.reasons.includes("SHEET_MODE2_NOT_DIMENSIONAL"));

const gcode = evaluateSheetMode2(ply, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 24,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5,
  gcode: "G0 X0"
});
assert.equal(gcode.status, "REFUSED");
assert.ok(gcode.reasons.includes("MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED"));

const tooBig = evaluateSheetMode2(ply, {
  profileKind: "STRAIGHT_RECT",
  blankL_in: 120,
  blankW_in: 18,
  tabCount: 4,
  routeDepthIn: 0.5
});
assert.equal(tooBig.status, "REFUSED");
assert.ok(tooBig.reasons.includes("BLANK_EXCEEDS_PARENT_SHEET"));

const fallthrough = envelopeCheck(ply, { requiredOps: ["CROSSCUT"] });
assert.equal(fallthrough.status, "REFUSED");
assert.ok(fallthrough.reasons.includes("SHEET_NOT_D001"));

const dimJob = evaluateJob(catalog, {
  title: "board control",
  lines: [{ storeSku: "STB-ZERO-SPF-2X4-72-001", qty: 1, requiredOps: ["CROSSCUT"], keptLengthIn: 45 }]
});
assert.equal(dimJob.status, "SUPPORTABLE");

const sheetAsDim = evaluateJob(catalog, {
  title: "sheet must not use D-001",
  lines: [{ storeSku: "STB-ZERO-PLY-075-48X96-001", qty: 1, requiredOps: ["CROSSCUT"] }]
});
assert.equal(sheetAsDim.status, "REFUSED");

const job = evaluateSheetMode2Job(catalog, {
  title: "straight stencil",
  line: {
    storeSku: "STB-ZERO-PLY-075-48X96-001",
    qty: 1,
    profileKind: "STRAIGHT_RECT",
    blankL_in: 24,
    blankW_in: 18,
    tabCount: 4,
    routeDepthIn: 0.5
  }
});
assert.equal(job.status, "SUPPORTABLE");
assert.equal(job.jobType, "SHEET_MODE2_STENCIL_V1");
assert.equal(job.evidenceClass, "REFERENCE");
assert.equal(job.commissioned, false);
assert.deepEqual(job.neutralOps, sheetMode2NeutralOps({ tabCount: 4 }));
assert.ok(job.not_claimed.includes("G-code"));
assert.ok(job.not_claimed.includes("Cycle Start"));

const estimate = estimateSheetMode2Job(catalog, {
  line: { storeSku: "STB-ZERO-PLY-075-48X96-001", qty: 1 }
});
assert.equal(estimate.status, "BUDGETARY_MATERIAL_ONLY");
assert.equal(estimate.processQ_status, "UNRESOLVED");
assert.equal(estimate.Q, ply.sellingPrice);
assert.match(estimate.note, /Not a commercial quote/);

console.log("s001-mode2-envelope.test.mjs ok");
