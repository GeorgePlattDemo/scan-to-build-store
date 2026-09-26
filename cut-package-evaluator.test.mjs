import assert from "node:assert/strict";
import fs from "node:fs";
import { loadCatalog, findSku } from "./store-zero-stage2-store.mjs";
import { CUT_PACKAGE_STANDARD, evaluateCutPackageJob, evaluateCutPackageStoreRequest } from "./cut-package-evaluator.mjs";

// Neutral test lines only. What a cut list means belongs to the project that sends it.
const catalog = loadCatalog();
const PT = (nominalT, nominalW, grade) => ({ species: "syp-treated", nominalT, nominalW, grade });
const many = (prefix, count, lengthIn, spots = []) =>
  Array.from({ length: count }, (_, i) => ({ partId: `${prefix}-${String(i + 1).padStart(2, "0")}`, lengthIn, spots }));
const centered = (xs) => xs.map((xIn) => ({ xIn, acrossWidthRule: "CENTERED_ON_WIDE_FACE" }));
const inset = (xs, insetFromEdgeIn) => xs.map((xIn) => ({ xIn, acrossWidthRule: "INSET_FROM_EDGE", insetFromEdgeIn }));
const job = (cutPackages = [], itemLines = []) => evaluateCutPackageJob(catalog, { configurationId: "CUT-TEST", configurationVersion: "1", cutPackages, itemLines });
const line = (answer, id) => [...answer.packages, ...answer.items].find((entry) => (entry.packageId ?? entry.lineId) === id);

// 1. The file carries no project knowledge.
const source = fs.readFileSync(new URL("./cut-package-evaluator.mjs", import.meta.url), "utf8");
assert.ok(!/picnic|ana white|myoutdoor|make.it.yours|\bbench|\btables?\b/i.test(source), "no project names in the Store evaluator");
assert.equal(CUT_PACKAGE_STANDARD.cutRules.length, 5);

// 2. A mixed order: every line answered on its own, nothing combined.
const mixed = job(
  [
    { packageId: "LONG", material: PT(2, 6, "ground-contact"), endCut: { angleDeg: 0 }, parts: many("L", 6, 71.5, centered([4.75, 35.75, 66.75])) },
    { packageId: "ANGLED", material: PT(2, 6, "ground-contact"), endCut: { angleDeg: 25 }, parts: many("A", 4, 31.375) },
    { packageId: "SHORT", material: PT(2, 4, "ground-contact"), endCut: { angleDeg: 0 }, parts: [...many("S", 4, 26), ...many("T", 8, 11.5)] },
    { packageId: "TEN-FOOT", material: PT(2, 6, "ground-contact"), endCut: { angleDeg: 0 }, parts: many("X", 2, 119) },
    { packageId: "TOO-LONG", material: PT(2, 6, "ground-contact"), endCut: { angleDeg: 0 }, parts: many("Y", 1, 200) }
  ],
  [
    { lineId: "BOLTS", storeSku: "STB-ZERO-HW-CARRIAGE-BOLT-PACK-001", qty: 2 },
    { lineId: "GHOST", storeSku: "STB-ZERO-NO-SUCH-SKU", qty: 1 }
  ]
);
assert.equal(mixed.status, "NOT_ALL_LINES_SUPPORTABLE");
for (const id of ["LONG", "ANGLED", "SHORT", "TEN-FOOT", "BOLTS"]) assert.equal(line(mixed, id).status, "SUPPORTABLE", id);
assert.equal(line(mixed, "TOO-LONG").status, "REFUSED");
assert.ok(line(mixed, "TOO-LONG").reasonCodes.includes("PART_LONGER_THAN_LONGEST_STOCKED_BOARD"));
assert.equal(line(mixed, "GHOST").status, "REFUSED");
assert.deepEqual(line(mixed, "GHOST").reasonCodes, ["NO_OFFERING"]);
const supportableSum = [...mixed.packages, ...mixed.items].filter((l) => l.status === "SUPPORTABLE").reduce((s, l) => s + l.Q, 0);
assert.equal(mixed.totals.sumOfSupportableLines, Math.round(supportableSum * 100) / 100);

// 3. The wood is never changed: every board comes from the chosen species and grade.
for (const pkg of mixed.packages.filter((p) => p.status === "SUPPORTABLE")) {
  const item = findSku(catalog, pkg.storeSku);
  assert.equal(item.species, pkg.material.species, pkg.packageId);
  assert.equal(item.grade, pkg.material.grade, pkg.packageId);
  assert.equal(Number(item.nominalW), Number(pkg.material.nominalW), pkg.packageId);
  for (const board of pkg.cutPlan) assert.equal(board.storeSku, pkg.storeSku);
}

// 4. Price is material plus machine time at the Store rate, from the catalog price.
const long = line(mixed, "LONG");
assert.equal(long.totals.material, Math.round(long.sellingPrice * long.boards * 100) / 100);
assert.equal(long.Q, Math.round((long.totals.material + long.totals.machine_service) * 100) / 100);
assert.ok(long.time.T_MACHINE_min > 0);
assert.equal(long.spotCount, 18);

// 5. Every part is cut both ends and at least 1/2 in under its board; short pieces first; stubs returned.
for (const pkg of mixed.packages.filter((p) => p.status === "SUPPORTABLE")) {
  for (const board of pkg.cutPlan) {
    for (const part of board.partsInCutOrder) assert.ok(part.lengthIn <= board.stockLengthIn - 0.5, `${pkg.packageId} ${part.partId}`);
    const lengths = board.partsInCutOrder.map((part) => part.lengthIn);
    assert.deepEqual(lengths, [...lengths].sort((a, b) => a - b), `${board.boardId} cuts short pieces first`);
  }
}
assert.ok(line(mixed, "SHORT").stubs.length >= 1);

// 6. No length ceiling of our own: 119 in parts are cut from a longer stocked board.
assert.ok(line(mixed, "TEN-FOOT").stockLengthIn > 119.5);

// 7. The Store does not choose a grade for the customer.
const noGrade = job([{ packageId: "P", material: { species: "syp-treated", nominalT: 2, nominalW: 6 }, parts: many("N", 1, 20) }]);
assert.equal(line(noGrade, "P").status, "UNRESOLVED");
assert.deepEqual(line(noGrade, "P").reasonCodes, ["GRADE_CHOICE_REQUIRED"]);
assert.ok(line(noGrade, "P").offeredGrades.length > 1);

// 8. Spots: 1 1/2 in and 2 in insets are timed and priced; any other inset is refused on that package only.
const spots = job([
  { packageId: "IN-150", material: PT(2, 6, "ground-contact"), parts: many("A", 2, 40, inset([6, 34], 1.5)) },
  { packageId: "IN-200", material: PT(2, 6, "ground-contact"), parts: many("B", 2, 40, inset([6, 34], 2)) },
  { packageId: "IN-175", material: PT(2, 6, "ground-contact"), parts: many("C", 2, 40, inset([6, 34], 1.75)) }
]);
assert.equal(line(spots, "IN-150").status, "SUPPORTABLE");
assert.equal(line(spots, "IN-200").status, "SUPPORTABLE");
assert.equal(line(spots, "IN-175").status, "REFUSED");
assert.equal(spots.status, "NOT_ALL_LINES_SUPPORTABLE");

// 9. Item lines: offered SKUs are priced at the catalog selling price times the count; not-offered SKUs are refused.
const notOffered = catalog.offerings.find((item) => item.offered === false);
const items = job([], [
  { lineId: "A", storeSku: "STB-ZERO-HW-CARRIAGE-BOLT-PACK-001", qty: 3 },
  { lineId: "B", storeSku: notOffered.storeSku, qty: 1 },
  { lineId: "C", storeSku: "STB-ZERO-HW-CARRIAGE-BOLT-PACK-001", qty: 1.5 }
]);
const bolt = findSku(catalog, "STB-ZERO-HW-CARRIAGE-BOLT-PACK-001");
assert.equal(line(items, "A").Q, Math.round(Number(bolt.sellingPrice) * 3 * 100) / 100);
assert.deepEqual(line(items, "B").reasonCodes, ["NOT_OFFERED"]);
assert.deepEqual(line(items, "C").reasonCodes, ["WHOLE_QUANTITY_REQUIRED"]);

// 10. Same demand, same answer; a fresh request carries a receipt bound to the Store revision.
assert.equal(job([], []).status, "UNRESOLVED", "an empty order is not an answer");
const demand = { configurationId: "CUT-TEST", configurationVersion: "1", cutPackages: [{ packageId: "P", material: PT(2, 4, "ground-contact"), parts: many("Q", 3, 30) }] };
const one = evaluateCutPackageJob(catalog, demand);
const two = evaluateCutPackageJob(catalog, demand);
assert.deepEqual(one.calculationIdentity, two.calculationIdentity);
const fresh = evaluateCutPackageStoreRequest(catalog, demand, { requestId: "REQ-1", storeRevision: "TEST-REV", evaluatedAt: "2026-09-26T00:00:00Z" });
assert.equal(fresh.freshEvaluation, true);
assert.equal(fresh.evaluationReceipt.authority.storeRevision, "TEST-REV");
assert.equal(fresh.evaluationReceipt.authority.cutPackageStandard.id, CUT_PACKAGE_STANDARD.id);
assert.equal(evaluateCutPackageStoreRequest(catalog, demand, {}).freshEvaluation, false);

console.log("cut-package: ok", JSON.stringify({
  mixed: Object.fromEntries([...mixed.packages, ...mixed.items].map((l) => [l.packageId ?? l.lineId, l.status === "SUPPORTABLE" ? `${l.boards ? l.boards + "x" + l.storeSku.replace("STB-ZERO-", "") + " " : ""}$${l.Q}` : l.reasonCodes[0]])),
  sum: mixed.totals.sumOfSupportableLines
}));
