/**
 * Store Zero Stage-2 pricing engine.
 *
 * DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md controls complete dimensional Q.
 * Legacy wrappers may still extend material lines, but they may not issue a
 * complete dimensional Q without the travel-standard physical demand.
 */
import {
  D001_TRAVEL_STANDARD,
  D001_WHOLE_PARENT_BOARD_RUN,
  evaluateD001UserDefinedBoard,
  evaluateD001WholeParentBoard,
  sawFeedInPerMin,
  sawCycleSec,
  xIndexTimeSec,
  spotCycleSec,
  storeMachineSellRate
} from "./d001-travel-standard.mjs";

export const ENGINE = Object.freeze({
  id: "STB-STORE-ZERO-PRICE-1",
  version: "0.3.0",
  clock: "2026-09-22",
  documentKind: "BudgetaryEstimate",
  governingStandard: D001_TRAVEL_STANDARD.standardFile
});

export const CYCLE_MODEL = Object.freeze({
  id: D001_TRAVEL_STANDARD.id,
  version: D001_TRAVEL_STANDARD.version,
  basis: D001_TRAVEL_STANDARD.basis,
  measured: false,
  commissioned: false,
  purpose: "one declared kinematic/travel model for complete dimensional Store economics"
});

export const ECONOMICS_MODEL = Object.freeze({
  ...D001_TRAVEL_STANDARD.economics,
  ...storeMachineSellRate()
});

export const MARK_ON = 0.05;

function round(n, p = 2) {
  const m = 10 ** p;
  return Math.round((Number(n) + Number.EPSILON) * m) / m;
}

export function sellingPrice(list) {
  return Math.round(list * (1 + MARK_ON) * 100) / 100;
}

export function sfm(saw = D001_TRAVEL_STANDARD.saw) {
  return (Math.PI * saw.diameterIn * saw.rpm) / 12;
}

export function feedFpm(saw = D001_TRAVEL_STANDARD.saw) {
  return sawFeedInPerMin(saw) / 12;
}

export function sawCycleMin(widthIn, angleDeg = 0) {
  return sawCycleSec(widthIn, angleDeg) / 60;
}

export function indexMin(distanceIn) {
  return xIndexTimeSec(distanceIn) / 60;
}

export function spotCycleMin(widthIn) {
  const result = spotCycleSec(widthIn);
  return result.totalSec / 60;
}

export function findOffering(catalog, storeSku) {
  return catalog.offerings.find((o) => o.storeSku === storeSku) || null;
}

export function extendLine(catalog, storeSku, qty) {
  const item = findOffering(catalog, storeSku);
  if (!item || item.sellingPrice == null) {
    return { storeSku, qty, status: "INCOMPLETE", reason: "MISSING_PRICE" };
  }
  return {
    storeSku,
    description: item.description,
    qty,
    list_reference: item.list_reference,
    listReferenceBasis: item.listReferenceBasis,
    mark_on: MARK_ON,
    selling_price: item.sellingPrice,
    extension: round(item.sellingPrice * qty, 2),
    sellingPriceBasis: "CALCULATED",
    observationId: item.observationId || null
  };
}

function materialAndHardware(catalog, { pieces = [], hardwareSku = null } = {}) {
  const lines = pieces.map((p) => extendLine(catalog, p.storeSku, p.qty));
  if (lines.some((l) => l.status === "INCOMPLETE")) {
    return { ok: false, reason: "MISSING_PRICE", lines };
  }
  let hardwareLine = null;
  if (hardwareSku) {
    hardwareLine = extendLine(catalog, hardwareSku, 1);
    if (hardwareLine.status === "INCOMPLETE") {
      return { ok: false, reason: "MISSING_HARDWARE_PRICE", lines, hardwareLine };
    }
  }
  return {
    ok: true,
    lines,
    hardwareLine,
    material: round(lines.reduce((sum, line) => sum + line.extension, 0), 2),
    hardware: hardwareLine ? hardwareLine.extension : 0
  };
}

/**
 * Legacy/project wrapper.
 *
 * A count-only "pieces" ticket no longer has enough information to issue a
 * complete dimensional Q under the Travel Standard. It may retain material and
 * sourced-item facts while the owning configurator is migrated.
 */
export function estimateJob(catalog, { title, classId, pieces = [], hardwareSku = null, travelDemand = null } = {}) {
  if (travelDemand) {
    const item = findOffering(catalog, travelDemand.storeSku);
    if (!item) return { status: "UNRESOLVED", reason: "BOARD_OFFERING_REQUIRED", title };
    return estimateUserDefinedBoardTravel(catalog, {
      ...travelDemand,
      title: title ?? travelDemand.title,
      classId: classId ?? travelDemand.classId
    });
  }

  const extended = materialAndHardware(catalog, { pieces, hardwareSku });
  if (!extended.ok) return { status: "UNRESOLVED", reason: extended.reason, title };

  return {
    status: "PARTIAL_BUDGETARY_ESTIMATE",
    complete: false,
    completeness: "TRAVEL_STANDARD_INPUT_REQUIRED",
    title,
    classId,
    documentKind: ENGINE.documentKind,
    engine: ENGINE,
    material_lines: extended.lines,
    hardware_line: extended.hardwareLine,
    cycle: null,
    unresolvedConditions: ["DIMENSIONAL_TRAVEL_STANDARD_INPUT_REQUIRED"],
    totals: {
      material: extended.material,
      hardware: extended.hardware,
      machine_service: null,
      Q: null,
      Q_basis: "UNRESOLVED",
      note: "Material/sourced subtotal only. Complete dimensional Q requires the governing travel-standard demand."
    },
    not_claimed: [
      "complete dimensional Q",
      "commercial quote",
      "seller-of-record",
      "physical fabrication",
      "live motion",
      "physical stock count"
    ]
  };
}

export function estimateUserDefinedBoardTravel(catalog, {
  title = "User-defined Board",
  classId = "user_defined_board",
  configurationId,
  configurationVersion,
  storeSku,
  definedWorkpieceLengthIn,
  sawAngleDeg,
  cutPlane = "miter-face",
  datumCMethod = "REFERENCE_CUT",
  parts,
  declaredSawCuts = null,
  declaredSpotCount = null,
  unresolvedConditions = [],
  storeRevision = null
} = {}) {
  const item = findOffering(catalog, storeSku);
  if (!item) return { status: "UNRESOLVED", complete: false, reason: "BOARD_OFFERING_REQUIRED", title };

  const evaluated = evaluateD001UserDefinedBoard({
    item,
    storeRevision,
    demand: {
      configurationId,
      configurationVersion,
      classId,
      definedWorkpieceLengthIn,
      cut: {
        angleDeg: sawAngleDeg,
        plane: cutPlane,
        kerfIn: D001_TRAVEL_STANDARD.control.kerfIn
      },
      datumC: {
        method: datumCMethod,
        stationId: D001_TRAVEL_STANDARD.stations.sawMiter.id
      },
      parts,
      declaredSawCuts,
      declaredSpotCount,
      unresolvedConditions
    }
  });

  return {
    ...evaluated,
    title,
    classId,
    documentKind: ENGINE.documentKind,
    engine: ENGINE,
    cycle: evaluated.complete
      ? {
          model: CYCLE_MODEL.id,
          version: CYCLE_MODEL.version,
          basis: CYCLE_MODEL.basis,
          measured: false,
          commissioned: false,
          T_job_min: evaluated.travel.time.T_MACHINE_min,
          T_job_hr: evaluated.travel.time.T_MACHINE_hr,
          SFM: round(sfm(), 0),
          feed_fpm: round(feedFpm(), 2)
        }
      : null
  };
}

export function estimateWholeParentBoardTravel(catalog, {
  title = "Whole-parent Board",
  classId = "whole_parent_board",
  configurationId,
  configurationVersion,
  storeSku,
  definedWorkpieceLengthIn,
  datumCMethod = "MECHANICAL_REFERENCE",
  parts,
  declaredSawCuts = 0,
  declaredSpotCount = null,
  unresolvedConditions = [],
  storeRevision = null
} = {}) {
  const item = findOffering(catalog, storeSku);
  if (!item) return { status: "UNRESOLVED", complete: false, reason: "BOARD_OFFERING_REQUIRED", title };

  const evaluated = evaluateD001WholeParentBoard({
    item,
    storeRevision,
    demand: {
      executionPattern: D001_WHOLE_PARENT_BOARD_RUN.executionPattern,
      configurationId,
      configurationVersion,
      classId,
      definedWorkpieceLengthIn,
      datumC: {
        method: datumCMethod,
        stationId: D001_TRAVEL_STANDARD.stations.sawMiter.id
      },
      parts,
      declaredSawCuts,
      declaredSpotCount,
      unresolvedConditions
    }
  });

  return {
    ...evaluated,
    title,
    classId,
    documentKind: ENGINE.documentKind,
    engine: ENGINE,
    cycle: evaluated.complete
      ? {
          model: CYCLE_MODEL.id,
          version: CYCLE_MODEL.version,
          executionPattern: D001_WHOLE_PARENT_BOARD_RUN.id,
          basis: CYCLE_MODEL.basis,
          measured: false,
          commissioned: false,
          T_job_min: evaluated.travel.time.T_MACHINE_min,
          T_job_hr: evaluated.travel.time.T_MACHINE_hr
        }
      : null
  };
}

/**
 * Historical count-only wrapper retained to make migration failure explicit.
 * It does not turn counts into anonymous machine work.
 */
export function estimateBoardSequence(catalog, args = {}) {
  const item = findOffering(catalog, args.storeSku);
  if (!item) return { status: "UNRESOLVED", complete: false, reason: "BOARD_OFFERING_REQUIRED", title: args.title };
  return {
    status: "UNRESOLVED",
    complete: false,
    title: args.title,
    classId: args.classId ?? "user_defined_board",
    reason: "IDENTIFIED_PART_FEATURES_REQUIRED",
    unresolvedConditions: ["IDENTIFIED_PART_FEATURES_REQUIRED"],
    legacyInput: {
      definedWorkpieceLengthIn: args.definedWorkpieceLengthIn ?? null,
      sawCuts: args.sawCuts ?? null,
      sawAngleDeg: args.sawAngleDeg ?? null,
      drillCycles: args.drillCycles ?? null,
      spotCycles: args.spotCycles ?? null
    },
    engine: ENGINE
  };
}

/** Alcove material/sourced ticket retained until its configurator emits travel-standard demand. */
export function estimatePineAlcove(catalog, shelfCount = 5) {
  const kept = 45.5 - 2 * 0.75 - 0.125;
  const across = Math.ceil(14 / 5.5);
  const boardsPerShelf = Math.ceil(across / 2);
  const shelfBoards = boardsPerShelf * shelfCount;
  return estimateJob(catalog, {
    title: "Alcove insert — select pine",
    classId: "alcove.insert.square_shelves",
    pieces: [
      { storeSku: "STB-ZERO-PINE-1X6-72-001", qty: 4, keptLengthIn: 65, widthIn: 5.5 },
      { storeSku: "STB-ZERO-PINE-1X6-96-001", qty: shelfBoards, keptLengthIn: kept, widthIn: 5.5 }
    ],
    hardwareSku: "STB-ZERO-HW-ALCOVE-PACK-001"
  });
}

export function estimateCut001(catalog) {
  return estimateJob(catalog, {
    title: "CUT-001 — 2x4 finished 60.000 in",
    classId: "cut-001",
    pieces: [{ storeSku: "STB-ZERO-SPF-2X4-72-001", qty: 1, keptLengthIn: 60, widthIn: 3.5 }]
  });
}

export function estimatePicnicLegSquare(catalog) {
  return estimateJob(catalog, {
    title: "Picnic leg — square 28 in",
    classId: "picnic.leg.square",
    pieces: [{ storeSku: "STB-ZERO-SPF-2X4-96-001", qty: 1, keptLengthIn: 28, widthIn: 3.5 }]
  });
}

export function estimatePicnicLegTapered(catalog, { millEnds = 1 } = {}) {
  return estimateJob(catalog, {
    title: "Picnic leg — longitudinal taper",
    classId: "picnic.leg.taper",
    pieces: [{
      storeSku: "STB-ZERO-SPF-2X4-96-001",
      qty: 1,
      keptLengthIn: 28,
      widthIn: 3.5,
      millLongIn: 28,
      millEnds,
      passes: 1
    }]
  });
}
