import assert from "node:assert/strict";
import fs from "node:fs";
import { loadCatalog, findSku } from "./store-zero-stage2-store.mjs";
import { CUT_PACKAGE_STANDARD, evaluateCutPackageJob, evaluateCutPackageStoreRequest } from "./cut-package-evaluator.mjs";
import { millLongitudinalCycleSec } from "./d001-travel-standard.mjs";

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
assert.equal(CUT_PACKAGE_STANDARD.cutRules.length, 6);
assert.ok(CUT_PACKAGE_STANDARD.cutRules.includes("EDGE_MILL_WHOLE_BOARD_BEFORE_PARTS"));

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

// Hardware requirement lines: neutral meaning in, Store-resolved SKU, packages and price out.
const hw = (lineId, qty, requirement) => ({ lineId, qty, requirement });
const screw = (lengthIn, finish) => ({ kind: "wood-screw", gauge: "#10", lengthIn, finish, unit: "piece" });
const carriageBolt = (lengthIn, finish) => ({ kind: "carriage-bolt", diameterIn: 0.375, lengthIn, finish, unit: "piece" });
const reqs = job([], [
  hw("S25", 100, screw(2.5, "coated")),
  hw("S45", 26, screw(4.5, "coated")),
  hw("B5", 8, carriageBolt(5, "coated")),
  hw("GALV", 48, screw(2.5, "hot-dip-galvanized")),
  hw("SS", 48, screw(2.5, "stainless")),
  hw("SIB", 48, screw(2.5, "silicon-bronze")),
  hw("BULK", 400, screw(2.5, "coated")),
  hw("NONE", 10, screw(2.0, "coated")),
  hw("NOFIN", 10, screw(2.5, "brass")),
  hw("PART", 10, { kind: "wood-screw", lengthIn: 2.5, finish: "coated" }),
  hw("BOTHSIZE", 10, { kind: "wood-screw", gauge: "#10", diameterIn: 0.19, lengthIn: 2.5, finish: "coated" }),
  hw("BYWEIGHT", 10, { ...screw(2.5, "coated"), unit: "pound" }),
  { lineId: "EXACT", storeSku: "STB-ZERO-HW-COATED-SCR10-2P5-90-001", qty: 2 }
]);
for (const [id, finish] of [["S25", "COATED"], ["S45", "COATED"], ["B5", "COATED"], ["GALV", "HOT_DIP_GALVANIZED"], ["SS", "STAINLESS"], ["SIB", "SILICON_BRONZE"]]) {
  const answer = line(reqs, id);
  assert.equal(answer.status, "SUPPORTABLE", id + " " + JSON.stringify(answer.reasonCodes));
  const item = findSku(catalog, answer.storeSku);
  assert.ok(item && item.offered, id + " resolves to an offered Store SKU");
  assert.equal(item.fastener.tier, finish, id + " keeps the stated finish");
  assert.equal(answer.piecesPerPackage, item.fastener.piecesPerPackage);
  assert.equal(answer.packages, Math.ceil(answer.requiredPieces / answer.piecesPerPackage));
  assert.equal(answer.piecesSupplied, answer.packages * answer.piecesPerPackage);
  assert.ok(answer.piecesSupplied >= answer.requiredPieces);
  assert.equal(answer.sellingPrice, item.sellingPrice);
  assert.equal(answer.Q, Math.round(item.sellingPrice * answer.packages * 100) / 100);
}
// Exact match on every field: a bolt line gets a bolt of that diameter and length; a screw line a #10 screw.
assert.equal(findSku(catalog, line(reqs, "B5").storeSku).fastener.kind, "CARRIAGE_BOLT_3_8_NUT_WASHER");
assert.equal(findSku(catalog, line(reqs, "S45").storeSku).fastener.lengthIn, 4.5);
// Packaging is the Store's: 100 pieces from 90-piece boxes is 2 boxes (180 pieces), cheaper than one 450 box.
assert.equal(line(reqs, "S25").piecesPerPackage, 90);
assert.equal(line(reqs, "S25").packages, 2);
assert.equal(line(reqs, "S25").piecesSupplied, 180);
// Several package sizes match: the lowest total Store cost wins, and the choice is reported.
const bulk = line(reqs, "BULK");
const totalFor = (sku, pieces) => { const item = findSku(catalog, sku); return Math.round(item.sellingPrice * Math.ceil(pieces / item.fastener.piecesPerPackage) * 100) / 100; };
assert.ok(bulk.matchedOfferings.length >= 2);
for (const sku of bulk.matchedOfferings) assert.ok(bulk.Q <= totalFor(sku, 400), "no matching package size is cheaper than " + bulk.storeSku);
assert.equal(bulk.storeSku, "STB-ZERO-HW-COATED-SCR10-2P5-450-001");
assert.deepEqual(job([], [hw("A", 400, screw(2.5, "coated"))]).items[0].storeSku, bulk.storeSku, "deterministic");
// Nothing close enough: no 2 in screw, no brass. Fail closed, no substitute.
for (const id of ["NONE", "NOFIN"]) {
  assert.equal(line(reqs, id).status, "REFUSED", id);
  assert.deepEqual(line(reqs, id).reasonCodes, ["NO_MATCHING_HARDWARE_OFFERING"], id);
  assert.equal(line(reqs, id).storeSku, null, id);
  assert.equal(line(reqs, id).Q, null, id);
}
// An incomplete or ambiguous requirement is unresolved.
for (const id of ["PART", "BOTHSIZE", "BYWEIGHT"]) {
  assert.equal(line(reqs, id).status, "UNRESOLVED", id);
  assert.deepEqual(line(reqs, id).reasonCodes, ["HARDWARE_REQUIREMENT_INCOMPLETE"], id);
}
// Exact-SKU mode is unchanged.
const exactLine = line(reqs, "EXACT");
assert.equal(exactLine.status, "SUPPORTABLE");
assert.equal(exactLine.storeSku, "STB-ZERO-HW-COATED-SCR10-2P5-90-001");
assert.equal(exactLine.Q, Math.round(findSku(catalog, exactLine.storeSku).sellingPrice * 2 * 100) / 100);
assert.equal(exactLine.packages, undefined, "exact-SKU lines count SKUs, not pieces");
// Not enough stock of any matching package: unavailable, reported against the cheapest match, never substituted.
const short = job([], [hw("SHORT", 100000, screw(2.5, "coated"))]).items[0];
assert.equal(short.status, "UNAVAILABLE");
assert.equal(short.Q, null);
// The resolver reads structured catalog facts, not SKU strings or descriptions.
assert.ok(!/storeSku\s*\.\s*(includes|match|startsWith|split)|description\s*\.\s*(includes|match)/.test(source), "no SKU or description parsing");


// Edge mill: a package may ask for its boards finished narrower than they come. Each board is fed through
// the longitudinal router at the finished width from the fence, over its whole length, before its parts
// are cut. Same timed mill model as the station profile; its time is machine service in Q.
{
  const pine8 = (id, parts, finishedWidthIn) => ({ packageId: id, material: { species: "pine", form: "board", nominalT: 1, nominalW: 8, grade: "select" },
    endCut: { angleDeg: 0 }, ...(finishedWidthIn != null ? { finishedWidthIn } : {}), parts });
  const parts = [{ partId: "A", lengthIn: 94 }, { partId: "B", lengthIn: 22.5 }, { partId: "C", lengthIn: 22.5 }];
  const plain = line(job([pine8("P", parts)]), "P");
  const milled = line(job([pine8("M", parts, 7)]), "M");
  const same = line(job([pine8("S", parts, 7.25)]), "S");
  assert.equal(plain.status, "SUPPORTABLE");
  assert.equal(milled.status, "SUPPORTABLE", JSON.stringify(milled.reasonCodes));
  assert.equal(milled.storeSku, plain.storeSku, "the wood is never changed to avoid milling");
  assert.ok(milled.requiredOps.includes("MILL_LONGITUDINAL_PROFILE"));
  assert.deepEqual(milled.edgeMill && [milled.edgeMill.boardWidthIn, milled.edgeMill.finishedWidthIn, milled.edgeMill.removedIn], [7.25, 7, 0.25]);
  assert.ok(milled.time.T_MILL_sec > 0 && plain.time.T_MILL_sec === 0);
  assert.ok(milled.totals.machine_service > plain.totals.machine_service, "mill time is priced");
  assert.equal(milled.totals.material, plain.totals.material);
  assert.equal(milled.Q, Math.round((milled.totals.material + milled.totals.machine_service) * 100) / 100);
  assert.ok(milled.cutPlan.every((b) => b.edgeMill && b.edgeMill.status === "SUPPORTABLE" && b.edgeMill.passes === 2));
  // The whole board is milled, so a board longer than the 60 in station profile cap still mills.
  assert.ok(milled.stockLengthIn > 60);
  // Its own width asks for no milling.
  assert.equal(same.edgeMill, undefined);
  assert.equal(same.Q, plain.Q);
  // Limits: up to 1 in off one edge; never wider than the board; a finished width must be a number.
  assert.ok(line(job([pine8("W", parts, 6)]), "W").reasonCodes.includes("EDGE_MILL_REMOVAL_EXCEEDS_D001_MAX_CUT_WIDTH"));
  assert.ok(line(job([pine8("X", parts, 7.5)]), "X").reasonCodes.includes("FINISHED_WIDTH_EXCEEDS_BOARD_WIDTH"));
  assert.deepEqual(line(job([pine8("U", parts, "seven")]), "U").reasonCodes, ["FINISHED_WIDTH_REQUIRED"]);
  // A spot centered on a milled board is centered on the finished width.
  const spotted = line(job([pine8("K", [{ partId: "K1", lengthIn: 30, spots: [{ xIn: 10, acrossWidthRule: "CENTERED_ON_WIDE_FACE" }] }], 7)]), "K");
  assert.equal(spotted.status, "SUPPORTABLE");
  // The station profile keeps its 60 in cap.
  assert.equal(millLongitudinalCycleSec({ pathLengthIn: 61, yIn: 5, totalDepthIn: 0.75 }).status, "REFUSED");
  assert.equal(millLongitudinalCycleSec({ pathLengthIn: 144, yIn: 5, totalDepthIn: 0.75, passThrough: true }).status, "SUPPORTABLE");
  assert.equal(millLongitudinalCycleSec({ pathLengthIn: 20, yIn: 5, totalDepthIn: 0.75, passThrough: true }).reason, "EDGE_MILL_BOARD_BELOW_TWO_ROLLER_CONTROL");
}

console.log("cut-package: ok", JSON.stringify({
  mixed: Object.fromEntries([...mixed.packages, ...mixed.items].map((l) => [l.packageId ?? l.lineId, l.status === "SUPPORTABLE" ? `${l.boards ? l.boards + "x" + l.storeSku.replace("STB-ZERO-", "") + " " : ""}$${l.Q}` : l.reasonCodes[0]])),
  sum: mixed.totals.sumOfSupportableLines
}));
