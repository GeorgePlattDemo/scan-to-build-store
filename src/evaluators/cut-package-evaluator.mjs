/**
 * Store Zero cut-package evaluator: a la carte lines in, one answer per line out.
 *
 * A project (System) sends two kinds of lines. The evaluator knows nothing about any project.
 *
 *   cutPackages: one wood choice plus the parts to cut from it.
 *     { packageId, material: { species, nominalT, nominalW, grade }, endCut: { angleDeg }, finishedWidthIn?,
 *       parts: [{ partId, lengthIn, spots: [{ xIn, acrossWidthRule, insetFromEdgeIn? }] }] }
 *     finishedWidthIn (optional): every board in the package is edge-milled to this width before its parts
 *     are cut. The rollers hold the board to the fence and feed it past the longitudinal router, set at the
 *     finished width from the fence; the fence edge is kept and the far edge is milled (one board stays one
 *     board). It is the same timed mill Alcove uses, run over the whole board, and its time is machine
 *     service in Q. Leave it out, or send the board's own width, and nothing is milled.
 *     Store Zero picks the offered board length, nests the parts, times the D-001 cell and prices it,
 *     or refuses with a reason. It never changes the wood the customer chose.
 *
 *   itemLines: either an exact catalog SKU and a count, for example a box of screws:
 *     { lineId, storeSku, qty }
 *     Store Zero answers whether that SKU is offered and in stock, and its price. It never substitutes it.
 *   or a neutral hardware requirement counted in pieces:
 *     { lineId, qty, requirement: { kind, gauge | diameterIn, lengthIn, finish, unit: "piece" } }
 *     Store Zero resolves it to its own offering by exact match on structured catalog facts, works out
 *     the packages, and answers the SKU, packages and price, or refuses. No nearest size, no finish swap.
 *
 * Every line is answered on its own. A refused line does not stop the others, and nothing is
 * combined into a kit price. The sum of the supportable lines is reported for convenience only.
 *
 * Cut rules (how Store Zero cuts a package):
 *   1. Every part gets a saw cut on both ends (a reference cut, then a length cut).
 *   2. A part is at least 1/2 in shorter than the board it comes from.
 *   3. Spots are measured from the fresh reference cut.
 *   4. Short pieces are cut first from one board while the control length remains to hold;
 *      what is left is a stub, returned with the package.
 *   5. Length: only the stocked board lengths and the D-001 cell's own saw span and control length
 *      limit a part. There is no separate board-length ceiling in this evaluator.
 *   6. Edge mill first: a board milled to a finished width is milled over its whole length while it is
 *      long and held by both rollers, then its parts are cut. Up to 1 in comes off one edge.
 *
 * Two declared D-001 paths carry the work:
 *   - sequence path (evaluateD001UserDefinedBoard): parts cut off one after another at the miter saw,
 *     each cut leaving at least the control length; one angle per board; the stub is reported.
 *   - long-part path (evaluateD001DimensionalBatch): one square part per board, for parts too long to
 *     leave a controlled remain.
 */
import {
  STORE_EVALUATION_FRESHNESS,
  capabilityAnswer,
  findSku,
  loadCatalog,
  offerMaterial,
  priceAnswer,
  stockAnswer
} from "../store-zero-stage2-store.mjs";
import { D001_STAGE2_ENVELOPE } from "../envelopes/d001-stage2-envelope.mjs";
import {
  calculationHash,
  D001_TRAVEL_STANDARD,
  evaluateD001DimensionalBatch,
  evaluateD001UserDefinedBoard,
  millLongitudinalCycleSec,
  storeMachineSellRate
} from "../engine/d001-travel-standard.mjs";

export const CUT_PACKAGE_STANDARD = Object.freeze({
  id: "STB-CUT-PACKAGE-0.1",
  classId: "cut_package.d001",
  rule: "EACH_LINE_ANSWERED_ON_ITS_OWN_NO_SUBSTITUTION_NO_RECOMMENDATION",
  endCleanupMinIn: 0.5,
  cutRules: Object.freeze([
    "EVERY_PART_CUT_BOTH_ENDS",
    "PART_AT_LEAST_HALF_INCH_UNDER_BOARD",
    "SPOTS_FROM_FRESH_REFERENCE_CUT",
    "SHORT_PIECES_FIRST_STUB_RETURNED",
    "LENGTH_LIMITED_ONLY_BY_STOCK_AND_CELL_GEOMETRY",
    "EDGE_MILL_WHOLE_BOARD_BEFORE_PARTS"
  ])
});

const KERF_IN = Number(D001_TRAVEL_STANDARD.control.kerfIn);
const CONTROL_IN = Number(D001_TRAVEL_STANDARD.control.minRetainedControlIn);
const MIN_COMPONENT_IN = Number(D001_STAGE2_ENVELOPE.stock.minControlledLengthIn);
const SAW_SPAN_IN = Number(D001_TRAVEL_STANDARD.stations.sawSquare.xIn);
const EDGE_MILL_MAX_CUT_IN = Number(D001_STAGE2_ENVELOPE.millPassThrough.maxCutWidthIn);

// The edge mill a package needs on this board, or null when the finished width is the board's own width.
function edgeMillFor(item, finishedWidthIn) {
  if (finishedWidthIn == null) return null;
  const boardW = Number(item.actualW);
  if (Math.abs(boardW - finishedWidthIn) < 1e-6) return null;
  if (finishedWidthIn > boardW) return { refused: "FINISHED_WIDTH_EXCEEDS_BOARD_WIDTH" };
  const removedIn = boardW - finishedWidthIn;
  if (removedIn > EDGE_MILL_MAX_CUT_IN + 1e-9) return { refused: "EDGE_MILL_REMOVAL_EXCEEDS_D001_MAX_CUT_WIDTH" };
  return { finishedWidthIn, boardWidthIn: boardW, removedIn: round(removedIn, 6) };
}
const TIME_KEYS = ["T_LOAD_SEAT_sec", "T_REFERENCE_sec", "T_INDEX_sec", "T_SAW_sec", "T_DRILL_SPOT_sec", "T_MILL_sec", "T_RELEASE_LABEL_sec", "T_MACHINE_sec"];

function round(value, places = 2) {
  const m = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * m) / m;
}

function reason(category, code, subject, explanation) {
  return Object.freeze({ category, code, subject, authority: "STORE_ZERO", explanation });
}

function spotFeatures(part) {
  return (Array.isArray(part.spots) ? part.spots : []).map((spot, index) => ({
    featureId: String(spot.featureId || `${part.partId}-SPOT-${index + 1}`),
    kind: "SPOT_ON_LOCATION",
    xIn: Number(spot.xIn),
    acrossWidthRule: spot.acrossWidthRule,
    ...(spot.insetFromEdgeIn != null ? { insetFromEdgeIn: Number(spot.insetFromEdgeIn) } : {})
  }));
}

// Sequence-path capacity: after the reference cut and every part (plus kerf), the control length must remain.
function sequenceUsableIn(stockLengthIn) {
  return Number(stockLengthIn) - KERF_IN - CONTROL_IN;
}

// First-fit decreasing into boards; each board is then cut short pieces first.
function packSequence(stockLengthIn, parts) {
  const usable = sequenceUsableIn(stockLengthIn);
  const boards = [];
  const sorted = parts.slice().sort((a, b) => b.lengthIn - a.lengthIn || a.partId.localeCompare(b.partId));
  for (const part of sorted) {
    const need = part.lengthIn + KERF_IN;
    let board = boards.find((candidate) => candidate.freeIn + 1e-9 >= need);
    if (!board) {
      board = { freeIn: usable, parts: [] };
      boards.push(board);
    }
    board.freeIn -= need;
    board.parts.push(part);
  }
  for (const board of boards) board.parts.sort((a, b) => a.lengthIn - b.lengthIn || a.partId.localeCompare(b.partId));
  return boards;
}

function planForBoard(item, angleDeg, parts) {
  const S = Number(item.stockL_in);
  const refusals = [];
  const sequenceParts = [];
  const longParts = [];
  for (const part of parts) {
    if (part.lengthIn + KERF_IN <= sequenceUsableIn(S) + 1e-9) {
      sequenceParts.push(part);
    } else if (part.lengthIn > S - CUT_PACKAGE_STANDARD.endCleanupMinIn + 1e-9) {
      refusals.push("PART_NOT_HALF_INCH_UNDER_BOARD");
    } else if (angleDeg !== 0) {
      refusals.push("ANGLED_PART_LEAVES_LESS_THAN_CONTROL_LENGTH");
    } else if (part.lengthIn > SAW_SPAN_IN + 1e-9) {
      refusals.push("COMPONENT_LENGTH_EXCEEDS_D001_TWO_SAW_SPAN");
    } else if (part.lengthIn < MIN_COMPONENT_IN - 1e-9) {
      refusals.push("COMPONENT_LENGTH_BELOW_TWO_ROLLER_CONTROL");
    } else {
      longParts.push(part);
    }
  }
  const boards = packSequence(S, sequenceParts);
  return { refusals: [...new Set(refusals)], sequenceBoards: boards, longParts, qty: boards.length + longParts.length };
}

function validateParts(pkg) {
  const problems = [];
  const parts = [];
  const seen = new Set();
  for (const raw of Array.isArray(pkg.parts) ? pkg.parts : []) {
    const partId = String(raw?.partId || "");
    const lengthIn = Number(raw?.lengthIn);
    if (!partId || seen.has(partId)) { problems.push("UNIQUE_PART_ID_REQUIRED"); continue; }
    seen.add(partId);
    if (!Number.isFinite(lengthIn) || lengthIn <= 0) { problems.push("PART_LENGTH_REQUIRED"); continue; }
    parts.push({ partId, lengthIn, spots: Array.isArray(raw.spots) ? raw.spots : [] });
  }
  if (!parts.length && !problems.length) problems.push("PACKAGE_PARTS_REQUIRED");
  return { parts, problems: [...new Set(problems)] };
}

function answerLine(base, status, code, category, explanation, extra = {}) {
  return {
    ...base,
    status,
    Q: null,
    reasonCodes: code ? [code] : [],
    reasonRecord: code ? reason(category, code, base.packageId || base.lineId, explanation) : null,
    ...extra
  };
}

function machineForPackage(stockItem, angleDeg, plan, packageId, identity, edgeMill = null) {
  const answers = [];
  const boards = [];
  // After the edge mill the board is the finished width; the saw and the spots work on that board.
  const item = edgeMill ? { ...stockItem, actualW: edgeMill.finishedWidthIn } : stockItem;
  const millRefused = [];
  const millUnresolved = [];
  let millSec = 0;
  function millBoard() {
    if (!edgeMill) return null;
    const timing = millLongitudinalCycleSec({
      pathLengthIn: Number(stockItem.stockL_in),
      yIn: edgeMill.finishedWidthIn,
      totalDepthIn: Number(stockItem.actualT),
      passThrough: true
    });
    if (timing.status === "REFUSED") millRefused.push(timing.reason);
    else if (timing.status !== "SUPPORTABLE") millUnresolved.push(timing.reason);
    else millSec += timing.totalSec;
    return {
      kind: "EDGE_MILL_PASS_THROUGH",
      finishedWidthIn: edgeMill.finishedWidthIn,
      removedIn: edgeMill.removedIn,
      passes: timing.passes ?? null,
      timeSec: timing.totalSec ?? null,
      status: timing.status
    };
  }
  plan.sequenceBoards.forEach((board, index) => {
    const edge = millBoard();
    const answer = evaluateD001UserDefinedBoard({
      item,
      storeRevision: identity.storeRevision || null,
      demand: {
        configurationId: identity.configurationId,
        configurationVersion: identity.configurationVersion,
        classId: CUT_PACKAGE_STANDARD.classId,
        definedWorkpieceLengthIn: Number(item.stockL_in),
        cut: { angleDeg, plane: "miter-face" },
        datumC: { method: "REFERENCE_CUT", stationId: D001_TRAVEL_STANDARD.stations.sawMiter.id },
        parts: board.parts.map((part) => ({ partId: part.partId, lengthIn: part.lengthIn, features: spotFeatures(part) }))
      }
    });
    answers.push(answer);
    boards.push({
      boardId: `${packageId}-B${index + 1}`,
      path: "SEQUENCE",
      storeSku: item.storeSku,
      stockLengthIn: Number(item.stockL_in),
      partsInCutOrder: board.parts.map((part) => ({ partId: part.partId, lengthIn: part.lengthIn })),
      stubIn: answer.travel?.finalRemainderIn ?? null,
      ...(edge ? { edgeMill: edge } : {}),
      status: answer.status
    });
  });
  if (plan.longParts.length) {
    const batch = evaluateD001DimensionalBatch({
      storeRevision: identity.storeRevision || null,
      componentRuns: plan.longParts.map((part) => ({
        item,
        component: {
          componentId: part.partId,
          requirementId: packageId,
          finishedLengthIn: part.lengthIn,
          finishedWidthIn: Number(item.actualW),
          // milled boards arrive at the batch already at their finished width
          features: spotFeatures(part)
        }
      }))
    });
    answers.push(batch);
    for (const part of plan.longParts) {
      const edge = millBoard();
      boards.push({
        boardId: `${packageId}-${part.partId}`,
        path: "LONG_PART",
        storeSku: item.storeSku,
        stockLengthIn: Number(item.stockL_in),
        partsInCutOrder: [{ partId: part.partId, lengthIn: part.lengthIn }],
        stubIn: null,
        offcutIn: round(Number(item.stockL_in) - part.lengthIn, 3),
        ...(edge ? { edgeMill: edge } : {}),
        status: batch.status
      });
    }
  }
  const refused = [...millRefused];
  const unresolved = [...millUnresolved];
  for (const answer of answers) {
    if (answer.status === "REFUSED") refused.push(...(answer.reasons || answer.refused || ["MACHINE_REFUSED"]));
    else if (answer.complete !== true) unresolved.push(...(answer.unresolved || ["MACHINE_UNRESOLVED"]));
  }
  const time = Object.fromEntries(TIME_KEYS.map((key) => [key, 0]));
  for (const answer of answers) {
    const t = answer.travel?.time || answer.time || {};
    for (const key of TIME_KEYS) time[key] += Number(t[key] || 0);
  }
  time.T_MILL_sec += millSec;
  time.T_MACHINE_sec += millSec;
  const rates = storeMachineSellRate();
  const hours = time.T_MACHINE_sec / 3600;
  return {
    refused: [...new Set(refused.map(String))],
    unresolved: [...new Set(unresolved.map(String))],
    boards,
    time: { ...Object.fromEntries(TIME_KEYS.map((key) => [key, round(time[key], 4)])), T_MACHINE_min: round(time.T_MACHINE_sec / 60, 4) },
    sellRatePerHour: rates.sellRatePerHour,
    machineService: round(hours * rates.sellRatePerHour, 2)
  };
}

function evaluatePackage(catalog, pkg, identity) {
  const packageId = String(pkg?.packageId || "");
  const material = pkg?.material || {};
  const angleDeg = Number(pkg?.endCut?.angleDeg ?? 0);
  const hasFinishedWidth = pkg?.finishedWidthIn != null;
  const finishedWidthIn = hasFinishedWidth ? Number(pkg.finishedWidthIn) : null;
  const base = { kind: "CUT_PACKAGE", packageId, material: { ...material }, endCut: { angleDeg, plane: "miter-face", ends: "BOTH_PARALLEL" },
    ...(hasFinishedWidth ? { finishedWidthIn } : {}) };
  if (!packageId) return answerLine(base, "UNRESOLVED", "PACKAGE_ID_REQUIRED", "DEFINITION_GAP", "Each cut package needs its own id.");
  const { parts, problems } = validateParts(pkg);
  if (problems.length) return answerLine(base, "UNRESOLVED", problems[0], "DEFINITION_GAP", "The cut package is missing a definition Store Zero needs.");
  if (!Number.isFinite(angleDeg)) return answerLine(base, "UNRESOLVED", "END_CUT_ANGLE_REQUIRED", "DEFINITION_GAP", "The end-cut angle must be a number.");
  if (hasFinishedWidth && !(Number.isFinite(finishedWidthIn) && finishedWidthIn > 0)) {
    return answerLine(base, "UNRESOLVED", "FINISHED_WIDTH_REQUIRED", "DEFINITION_GAP", "A finished width must be a positive number of inches.");
  }
  if (!material.species || !material.nominalT || !material.nominalW) {
    return answerLine(base, "UNRESOLVED", "MATERIAL_CHOICE_REQUIRED", "DEFINITION_GAP", "The customer's wood choice (species, thickness, width) must be sent.");
  }

  const matches = offerMaterial(catalog, { species: material.species, form: material.form || "board", nominalT: material.nominalT, nominalW: material.nominalW });
  const grades = [...new Set(matches.map((item) => item.grade))];
  if (!material.grade && grades.length > 1) {
    return answerLine(base, "UNRESOLVED", "GRADE_CHOICE_REQUIRED", "DEFINITION_GAP", "More than one grade is offered for this wood; the customer's grade must be sent.", { offeredGrades: grades.sort() });
  }
  const candidates = matches
    .filter((item) => !material.grade || item.grade === material.grade)
    .sort((a, b) => Number(a.stockL_in) - Number(b.stockL_in) || String(a.storeSku).localeCompare(String(b.storeSku)));
  if (!candidates.length) {
    return answerLine(base, "REFUSED", "NO_MATCHING_BOARD_OFFERING", "MATERIAL_GAP", "Store Zero does not offer a board in the wood that was chosen.");
  }

  const requiredOps = [angleDeg === 0 ? "CROSSCUT" : "MITER_LIMITED"];
  if (parts.some((part) => part.spots.length)) requiredOps.push("SPOT_ON_LOCATION");

  const considered = candidates.map((item) => {
    const plan = planForBoard(item, angleDeg, parts);
    const edgeMill = edgeMillFor(item, finishedWidthIn);
    if (edgeMill?.refused) plan.refusals.push(edgeMill.refused);
    const ops = edgeMill && !edgeMill.refused ? [...requiredOps, "MILL_LONGITUDINAL_PROFILE"] : requiredOps;
    const capability = capabilityAnswer(item, ops, { sawAngleDeg: angleDeg, cutPlane: "miter-face", ...(edgeMill && !edgeMill.refused ? { millYIn: edgeMill.finishedWidthIn } : {}) });
    // Rule 5: the envelope's board-length support note is not applied to cut packages.
    const capabilityMissing = (capability.missing || []).filter((code) => code !== "PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT");
    const stock = stockAnswer(item, Math.max(plan.qty, 1));
    const price = priceAnswer(item);
    let status = "SUPPORTABLE";
    let why = null;
    if (plan.refusals.length) { status = "REFUSED"; why = plan.refusals[0]; }
    else if (capability.status === "REFUSED" && capabilityMissing.length) { status = "REFUSED"; why = capabilityMissing[0]; }
    else if (capability.status === "UNRESOLVED" || price.status === "UNRESOLVED") { status = "UNRESOLVED"; why = capability.unresolved?.[0] || price.reason || "STORE_INPUT_UNRESOLVED"; }
    else if (stock.sufficient !== true) { status = "UNAVAILABLE"; why = stock.status; }
    return { item, plan, edgeMill: edgeMill && !edgeMill.refused ? edgeMill : null, ops, status, reason: why, extension: price.status !== "UNRESOLVED" ? round(Number(item.sellingPrice) * plan.qty, 2) : null };
  });

  const consideredPublic = considered.map((entry) => ({
    storeSku: entry.item.storeSku,
    stockLengthIn: Number(entry.item.stockL_in),
    boards: entry.plan.qty,
    materialExtension: entry.extension,
    status: entry.status,
    reason: entry.reason
  }));

  const supportable = considered
    .filter((entry) => entry.status === "SUPPORTABLE")
    .sort((a, b) => a.extension - b.extension || Number(a.item.stockL_in) - Number(b.item.stockL_in) || String(a.item.storeSku).localeCompare(String(b.item.storeSku)));

  // Among board lengths that can each cut the package, try the lowest material cost first; if the
  // cell refuses it, the next one is tried. The wood itself is never changed.
  const machineRefusals = [];
  for (const entry of supportable) {
    const machine = machineForPackage(entry.item, angleDeg, entry.plan, packageId, identity, entry.edgeMill);
    if (machine.refused.length || machine.unresolved.length) {
      machineRefusals.push({ storeSku: entry.item.storeSku, refused: machine.refused, unresolved: machine.unresolved });
      continue;
    }
    const materialExt = entry.extension;
    return {
      ...base,
      status: "SUPPORTABLE",
      storeSku: entry.item.storeSku,
      stockLengthIn: Number(entry.item.stockL_in),
      boards: entry.plan.qty,
      sellingPrice: Number(entry.item.sellingPrice),
      requiredOps: entry.ops,
      ...(entry.edgeMill ? { edgeMill: { mode: "EDGE_MILL_PASS_THROUGH", boardWidthIn: entry.edgeMill.boardWidthIn, finishedWidthIn: entry.edgeMill.finishedWidthIn, removedIn: entry.edgeMill.removedIn, boards: entry.plan.qty } } : {}),
      cutPlan: machine.boards,
      stubs: machine.boards.filter((board) => board.stubIn != null).map((board) => ({ boardId: board.boardId, stubIn: board.stubIn })),
      spotCount: parts.reduce((sum, part) => sum + part.spots.length, 0),
      time: machine.time,
      sellRatePerHour: machine.sellRatePerHour,
      totals: { material: materialExt, machine_service: machine.machineService, Q: round(materialExt + machine.machineService, 2) },
      Q: round(materialExt + machine.machineService, 2),
      reasonCodes: [],
      reasonRecord: null,
      considered: consideredPublic
    };
  }

  if (machineRefusals.length) {
    const first = machineRefusals[0];
    const code = first.refused[0] || first.unresolved[0];
    return answerLine(base, first.refused.length ? "REFUSED" : "UNRESOLVED", code, "CAPABILITY_GAP",
      "The D-001 cell cannot run this package as sent.", { requiredOps, considered: consideredPublic, machineRefusals });
  }
  const rank = { UNRESOLVED: 0, UNAVAILABLE: 1, REFUSED: 2 };
  const best = considered.slice().sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || Number(a.item.stockL_in) - Number(b.item.stockL_in))[0];
  const codes = new Set(considered.filter((entry) => entry.status === best.status).map((entry) => entry.reason).filter(Boolean));
  const longest = Math.max(...parts.map((part) => part.lengthIn));
  const longestStock = Math.max(...candidates.map((item) => Number(item.stockL_in)));
  if (longest > longestStock - CUT_PACKAGE_STANDARD.endCleanupMinIn + 1e-9) codes.add("PART_LONGER_THAN_LONGEST_STOCKED_BOARD");
  const line = answerLine(base, best.status, best.reason, best.status === "UNAVAILABLE" ? "AVAILABILITY_GAP" : best.status === "REFUSED" ? "CAPABILITY_GAP" : "STORE_DATA_GAP",
    best.status === "REFUSED" ? "No offered board in the chosen wood lets the D-001 cell cut these parts." : "A board in the chosen wood exists, but a Store stock, price or capability fact is not satisfied.",
    { requiredOps, considered: consideredPublic });
  line.reasonCodes = [...codes];
  return line;
}

// Hardware requirement resolution (item lines with no storeSku).
// A line may state neutral hardware meaning instead of a SKU:
//   { lineId, qty (pieces), requirement: { kind, gauge | diameterIn, lengthIn, finish, unit: "piece" } }
// Store Zero matches it only against its own structured catalog facts (offering.fastener), never against
// SKU strings or descriptions. Every stated field must match exactly; there is no nearest size and no
// finish substitution. Store Zero owns packaging: packages = ceil(pieces / piecesPerPackage). When more than
// one package size matches, it picks the single SKU with the lowest total Store cost (sellingPrice x
// packages) whose stock covers the packages, ties broken by SKU; it never mixes package sizes.
// The vocabulary below reads Store Zero's own fastener codes; it names no project.
const FASTENER_KINDS = Object.freeze({
  WOOD_SCREW_10: Object.freeze({ kind: "wood-screw", gauge: "#10" }),
  CARRIAGE_BOLT_3_8_NUT_WASHER: Object.freeze({ kind: "carriage-bolt", diameterIn: 0.375, includes: "nut and washer" })
});
const FASTENER_FINISHES = Object.freeze({
  COATED: "coated",
  HOT_DIP_GALVANIZED: "hot-dip-galvanized",
  STAINLESS: "stainless",
  SILICON_BRONZE: "silicon-bronze",
  ZINC_INTERIOR: "zinc-interior"
});
const REQUIREMENT_FIELDS = ["kind", "gauge", "diameterIn", "lengthIn", "finish", "unit"];

function fastenerMeaning(item) {
  const f = item?.fastener;
  if (!f || typeof f !== "object") return null;
  const kind = FASTENER_KINDS[f.kind];
  const finish = FASTENER_FINISHES[f.tier];
  const pieces = Number(f.piecesPerPackage);
  if (!kind || !finish || !Number.isFinite(Number(f.lengthIn)) || !Number.isInteger(pieces) || pieces <= 0) return null;
  return { ...kind, lengthIn: Number(f.lengthIn), finish, unit: "piece", piecesPerPackage: pieces };
}

function requirementIncomplete(req) {
  if (!req || typeof req !== "object" || Array.isArray(req)) return "The requirement must be an object.";
  const extra = Object.keys(req).filter((key) => !REQUIREMENT_FIELDS.includes(key));
  if (extra.length) return "Unknown requirement fields: " + extra.join(", ") + ".";
  if (!req.kind || !req.finish || req.lengthIn == null) return "A hardware requirement states kind, lengthIn and finish.";
  if ((req.gauge == null) === (req.diameterIn == null)) return "A hardware requirement states exactly one of gauge or diameterIn.";
  if (!Number.isFinite(Number(req.lengthIn)) || Number(req.lengthIn) <= 0) return "lengthIn must be a positive number.";
  if (req.diameterIn != null && (!Number.isFinite(Number(req.diameterIn)) || Number(req.diameterIn) <= 0)) return "diameterIn must be a positive number.";
  if (req.unit != null && req.unit !== "piece") return "Hardware requirements are counted in pieces.";
  return null;
}

function meaningMatches(meaning, req) {
  if (meaning.kind !== req.kind || meaning.finish !== req.finish) return false;
  if (meaning.lengthIn !== Number(req.lengthIn)) return false;
  if (req.gauge != null) return meaning.gauge === req.gauge;
  return meaning.diameterIn === Number(req.diameterIn);
}

function evaluateRequirement(catalog, line, lineId, qty) {
  const req = line.requirement;
  const base = { kind: "ITEM", lineId, storeSku: null, qty, requirement: req, requiredPieces: qty };
  const incomplete = requirementIncomplete(req);
  if (incomplete) return answerLine(base, "UNRESOLVED", "HARDWARE_REQUIREMENT_INCOMPLETE", "DEFINITION_GAP", incomplete);
  if (!Number.isInteger(qty) || qty <= 0) return answerLine(base, "UNRESOLVED", "WHOLE_QUANTITY_REQUIRED", "DEFINITION_GAP", "A hardware requirement needs a whole number of pieces.");
  const candidates = catalog.offerings
    .filter((item) => item.offered === true)
    .map((item) => ({ item, meaning: fastenerMeaning(item) }))
    .filter(({ meaning }) => meaning && meaningMatches(meaning, req))
    .map(({ item, meaning }) => {
      const packages = Math.ceil(qty / meaning.piecesPerPackage);
      const price = priceAnswer(item);
      return { item, meaning, packages, price, total: price.status === "UNRESOLVED" ? null : round(Number(item.sellingPrice) * packages, 2) };
    });
  if (!candidates.length) {
    return answerLine(base, "REFUSED", "NO_MATCHING_HARDWARE_OFFERING", "MATERIAL_GAP", "Store Zero offers no hardware that matches every stated field of this requirement.");
  }
  const priced = candidates
    .filter((c) => c.total != null)
    .sort((a, b) => a.total - b.total || String(a.item.storeSku).localeCompare(String(b.item.storeSku)));
  if (!priced.length) {
    return answerLine(base, "UNRESOLVED", "MISSING_PRICE", "STORE_DATA_GAP", "Store Zero has no selling price for the hardware that matches this requirement.");
  }
  const chosen = priced.find((c) => stockAnswer(c.item, c.packages).sufficient === true);
  const resolution = (c) => ({
    storeSku: c.item.storeSku,
    description: c.item.description || null,
    uom: c.item.uom || null,
    piecesPerPackage: c.meaning.piecesPerPackage,
    packages: c.packages,
    piecesSupplied: c.packages * c.meaning.piecesPerPackage,
    sellingPrice: Number(c.item.sellingPrice),
    resolvedBy: "HARDWARE_REQUIREMENT_EXACT_MATCH",
    resolutionPolicy: "lowest total Store cost among exact matches with stock; ties by SKU; one package size",
    matchedOfferings: priced.map((p) => p.item.storeSku)
  });
  if (!chosen) {
    const cheapest = priced[0];
    return answerLine(base, "UNAVAILABLE", stockAnswer(cheapest.item, cheapest.packages).status, "AVAILABILITY_GAP", "Store Zero does not have enough packages of the matching hardware on hand.", resolution(cheapest));
  }
  const extension = chosen.total;
  return {
    ...base,
    ...resolution(chosen),
    status: "SUPPORTABLE",
    totals: { item: extension, Q: extension },
    Q: extension,
    reasonCodes: [],
    reasonRecord: null
  };
}

function evaluateItem(catalog, line) {
  const lineId = String(line?.lineId || "");
  if (lineId && !line?.storeSku && line?.requirement != null) return evaluateRequirement(catalog, line, lineId, Number(line?.qty));
  const storeSku = String(line?.storeSku || "");
  const qty = Number(line?.qty);
  const base = { kind: "ITEM", lineId, storeSku, qty };
  if (!lineId) return answerLine(base, "UNRESOLVED", "LINE_ID_REQUIRED", "DEFINITION_GAP", "Each item line needs its own id.");
  if (!storeSku) return answerLine(base, "UNRESOLVED", "STORE_SKU_REQUIRED", "DEFINITION_GAP", "An item line names an exact Store SKU.");
  if (!Number.isInteger(qty) || qty <= 0) return answerLine(base, "UNRESOLVED", "WHOLE_QUANTITY_REQUIRED", "DEFINITION_GAP", "An item line needs a whole-number quantity.");
  const item = findSku(catalog, storeSku);
  if (!item) return answerLine(base, "REFUSED", "NO_OFFERING", "MATERIAL_GAP", "Store Zero has no item with this SKU.");
  if (item.offered !== true) return answerLine(base, "REFUSED", "NOT_OFFERED", "MATERIAL_GAP", "Store Zero lists this SKU but does not offer it.");
  const price = priceAnswer(item);
  if (price.status === "UNRESOLVED") return answerLine(base, "UNRESOLVED", price.reason || "MISSING_PRICE", "STORE_DATA_GAP", "Store Zero has no selling price for this SKU.");
  const stock = stockAnswer(item, qty);
  if (stock.sufficient !== true) return answerLine(base, "UNAVAILABLE", stock.status, "AVAILABILITY_GAP", "Store Zero does not have this quantity on hand.");
  const extension = round(Number(item.sellingPrice) * qty, 2);
  return {
    ...base,
    status: "SUPPORTABLE",
    description: item.description || null,
    uom: item.uom || null,
    sellingPrice: Number(item.sellingPrice),
    totals: { item: extension, Q: extension },
    Q: extension,
    reasonCodes: [],
    reasonRecord: null
  };
}

export function evaluateCutPackageJob(catalog, demand = {}) {
  const identity = {
    configurationId: String(demand.configurationId || ""),
    configurationVersion: String(demand.configurationVersion || ""),
    storeRevision: demand.storeRevision || null
  };
  const packages = (Array.isArray(demand.cutPackages) ? demand.cutPackages : []).map((pkg) => evaluatePackage(catalog, pkg, identity));
  const items = (Array.isArray(demand.itemLines) ? demand.itemLines : []).map((line) => evaluateItem(catalog, line));
  const definitionGaps = [];
  if (!identity.configurationId || !identity.configurationVersion) definitionGaps.push("CONFIGURATION_IDENTITY_REQUIRED");
  if (!packages.length && !items.length) definitionGaps.push("LINES_REQUIRED");
  const lines = [...packages, ...items];
  const ids = lines.map((line) => line.packageId ?? line.lineId);
  if (new Set(ids).size !== ids.length) definitionGaps.push("UNIQUE_LINE_ID_REQUIRED");

  const supportable = lines.filter((line) => line.status === "SUPPORTABLE");
  const status = definitionGaps.length ? "UNRESOLVED" : supportable.length === lines.length ? "SUPPORTABLE" : "NOT_ALL_LINES_SUPPORTABLE";
  const totals = {
    linesSupportable: supportable.length,
    linesNotSupportable: lines.length - supportable.length,
    material: round(packages.filter((p) => p.status === "SUPPORTABLE").reduce((sum, p) => sum + p.totals.material, 0), 2),
    machine_service: round(packages.filter((p) => p.status === "SUPPORTABLE").reduce((sum, p) => sum + p.totals.machine_service, 0), 2),
    items: round(items.filter((i) => i.status === "SUPPORTABLE").reduce((sum, i) => sum + i.Q, 0), 2),
    sumOfSupportableLines: round(supportable.reduce((sum, line) => sum + line.Q, 0), 2),
    basis: "CALCULATED_FROM_DECLARED_STAGE2_MODEL"
  };
  const resultCore = { standard: CUT_PACKAGE_STANDARD.id, status, packages, items, totals };
  return {
    classId: CUT_PACKAGE_STANDARD.classId,
    standard: CUT_PACKAGE_STANDARD.id,
    cutRules: CUT_PACKAGE_STANDARD.cutRules,
    stage: 2,
    store: "Store Zero",
    configurationId: identity.configurationId,
    configurationVersion: identity.configurationVersion,
    status,
    definitionGaps,
    packages,
    items,
    totals,
    note: "Each line is answered on its own. Budgetary estimate, not a commercial quote.",
    calculationIdentity: {
      inputHash: calculationHash({ standard: CUT_PACKAGE_STANDARD.id, demand }),
      resultHash: calculationHash(resultCore)
    },
    not_claimed: ["commercial quote", "seller-of-record", "physical fabrication", "live motion", "measured machine performance", "structural adequacy"]
  };
}

export function evaluateCutPackageStoreRequest(catalog, demand = {}, request = {}) {
  const requestId = String(request.requestId || "").trim();
  if (!requestId) {
    return { classId: CUT_PACKAGE_STANDARD.classId, status: "UNRESOLVED", freshEvaluation: false, definitionGaps: ["STORE_EVALUATION_REQUEST_ID_REQUIRED"], calculationIdentity: null, evaluationReceipt: null };
  }
  const evaluatedAt = String(request.evaluatedAt || new Date().toISOString());
  const storeRevision = String(request.storeRevision || process.env.STB_STORE_REVISION || demand.storeRevision || "LOCAL_UNPINNED_STORE_REVISION");
  const evaluation = evaluateCutPackageJob(catalog, { ...demand, storeRevision });
  const receiptCore = {
    freshnessRule: STORE_EVALUATION_FRESHNESS.id,
    requestId,
    evaluatedAt,
    authority: {
      storeRevision,
      catalogHash: calculationHash(catalog),
      machineEnvelope: { id: D001_STAGE2_ENVELOPE.id, hash: calculationHash(D001_STAGE2_ENVELOPE) },
      travelStandard: { id: D001_TRAVEL_STANDARD.id, version: D001_TRAVEL_STANDARD.version, hash: calculationHash(D001_TRAVEL_STANDARD) },
      cutPackageStandard: { id: CUT_PACKAGE_STANDARD.id, hash: calculationHash(CUT_PACKAGE_STANDARD) }
    },
    demandHash: calculationHash(demand),
    status: evaluation.status,
    calculationIdentity: evaluation.calculationIdentity
  };
  return { ...evaluation, freshEvaluation: true, evaluationReceipt: Object.freeze({ ...receiptCore, receiptHash: calculationHash(receiptCore) }) };
}

export function requestCutPackageStoreEvaluation(demand = {}, request = {}) {
  return evaluateCutPackageStoreRequest(loadCatalog(), demand, request);
}
