/**
 * Store Zero Stage-2 pricing engine
 * Budgetary estimate only. Not a commercial quote. Not a seller-of-record.
 *
 * sell = ROUND(list_reference * 1.05, 2)   DECLARED_FIXTURE rule SZ-MARK-ON-5
 * cycle minutes are CALCULATED / MODELED under CYCLE_MODEL
 */
export const ENGINE = {
  id: "STB-STORE-ZERO-PRICE-1",
  version: "0.2.1",
  clock: "2026-09-10",
  documentKind: "BudgetaryEstimate"
};

/** Named Stage-2 cycle model. Not measured D-001 production data. */
export const CYCLE_MODEL = {
  id: "STB-D001-CYCLE-MODEL-S2-0.1",
  basis: "CALCULATED",
  measured: false,
  commissioned: false,
  purpose: "deterministic modeled economics now; measured machine economics later"
};

export const MARK_ON = 0.05;

export function sellingPrice(list) {
  return Math.round(list * (1 + MARK_ON) * 100) / 100;
}

export const RECOVERY = {
  setupCharge: 35,
  machineHourRate: 100
};

export const TOOLING = {
  saw: {
    diameterIn: 10,
    rpm: 3450,
    teeth: 60,
    chipLoadCrossSoft: 0.003,
    finishFactor: 0.5,
    deployMin: 0.08,
    retractMin: 0.08
  },
  rapidInPerMin: 480,
  accelMin: 0.05,
  loadSeatMin: 0.6,
  releaseLabelMin: 0.4,
  jobSetupMin: 8,
  drill: { rpm: 3000, ipr: 0.008 }
};

export const MILL = {
  longDeploy: 0.1,
  longFeedInPerMin: 48,
  longRepass: 0.08,
  longRetract: 0.1,
  endFeatureMin: 0.35
};

function round(n, p = 2) {
  const m = 10 ** p;
  return Math.round(n * m) / m;
}

export function sfm(saw = TOOLING.saw) {
  return (Math.PI * saw.diameterIn * saw.rpm) / 12;
}

export function feedFpm(saw = TOOLING.saw) {
  return ((saw.chipLoadCrossSoft * saw.teeth * saw.rpm) / 12) * saw.finishFactor;
}

export function sawCycleMin(widthIn, saw = TOOLING.saw) {
  return saw.deployMin + widthIn / (feedFpm(saw) * 12) + saw.retractMin;
}

export function drillCycleMin(depthIn, drill = TOOLING.drill) {
  return TOOLING.saw.deployMin + depthIn / (drill.ipr * drill.rpm) + TOOLING.saw.retractMin;
}

export function indexMin(keptLengthIn) {
  return TOOLING.accelMin + Math.abs(keptLengthIn) / TOOLING.rapidInPerMin;
}

export function millLongMin(profileLengthIn = 0, passes = 1) {
  if (!profileLengthIn) return 0;
  return MILL.longDeploy + profileLengthIn / MILL.longFeedInPerMin + (passes - 1) * MILL.longRepass + MILL.longRetract;
}

export function millEndMin(count = 0) {
  return count * MILL.endFeatureMin;
}

export function cycleOneStick({
  keptLengthIn,
  widthIn,
  holes = 0,
  depthIn = 0.75,
  millLongIn = 0,
  millEnds = 0,
  passes = 1
}) {
  const saw = sawCycleMin(widthIn);
  const total =
    TOOLING.loadSeatMin +
    saw +
    indexMin(keptLengthIn) +
    saw +
    holes * drillCycleMin(depthIn) +
    millLongMin(millLongIn, passes) +
    millEndMin(millEnds) +
    TOOLING.releaseLabelMin;
  return round(total, 3);
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

export function estimateJob(catalog, { title, classId, pieces, hardwareSku = null }) {
  const lines = pieces.map((p) => extendLine(catalog, p.storeSku, p.qty));
  if (lines.some((l) => l.status === "INCOMPLETE")) {
    return { status: "UNRESOLVED", reason: "MISSING_PRICE", title };
  }
  const cycleMin =
    TOOLING.jobSetupMin +
    pieces.reduce((s, p) => s + cycleOneStick(p) * p.qty, 0);
  const hours = cycleMin / 60;
  const material = round(lines.reduce((s, l) => s + l.extension, 0), 2);
  let hardware = 0;
  let hardwareLine = null;
  if (hardwareSku) {
    hardwareLine = extendLine(catalog, hardwareSku, 1);
    if (hardwareLine.status === "INCOMPLETE") {
      return { status: "UNRESOLVED", reason: "MISSING_HARDWARE_PRICE", title };
    }
    hardware = hardwareLine.extension;
  }
  const cell = round(RECOVERY.setupCharge + RECOVERY.machineHourRate * hours, 2);
  const Q = round(material + cell + hardware, 2);
  return {
    status: "BUDGETARY_ESTIMATE",
    title,
    classId,
    documentKind: ENGINE.documentKind,
    engine: ENGINE,
    material_lines: lines,
    hardware_line: hardwareLine,
    cycle: {
      model: CYCLE_MODEL.id,
      basis: CYCLE_MODEL.basis,
      measured: false,
      T_job_min: round(cycleMin, 3),
      T_job_hr: round(hours, 4),
      SFM: round(sfm(), 0),
      feed_fpm: round(feedFpm(), 2)
    },
    totals: {
      material,
      cell_recovery: cell,
      hardware,
      Q,
      Q_basis: "CALCULATED",
      note: "Budgetary estimate. Not a commercial quote."
    },
    not_claimed: [
      "commercial quote",
      "seller-of-record",
      "physical fabrication",
      "live motion",
      "physical stock count"
    ]
  };
}

/** Established pine alcove square-cut ticket. */
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
    pieces: [
      { storeSku: "STB-ZERO-SPF-2X4-72-001", qty: 1, keptLengthIn: 60, widthIn: 3.5 }
    ]
  });
}

/** Square picnic leg — no mill. Control ticket. */
export function estimatePicnicLegSquare(catalog) {
  return estimateJob(catalog, {
    title: "Picnic leg — square 28 in",
    classId: "picnic.leg.square",
    pieces: [
      { storeSku: "STB-ZERO-SPF-2X4-96-001", qty: 1, keptLengthIn: 28, widthIn: 3.5 }
    ]
  });
}

/** Same stick with declared longitudinal taper (+ optional end profile). */
export function estimatePicnicLegTapered(catalog, { millEnds = 1 } = {}) {
  return estimateJob(catalog, {
    title: "Picnic leg — longitudinal taper",
    classId: "picnic.leg.taper",
    pieces: [
      {
        storeSku: "STB-ZERO-SPF-2X4-96-001",
        qty: 1,
        keptLengthIn: 28,
        widthIn: 3.5,
        millLongIn: 28,
        millEnds,
        passes: 1
      }
    ]
  });
}
