/**
 * Store Zero Stage-2 pricing engine
 * Budgetary estimate only. Not a commercial quote. Not a seller-of-record.
 *
 * sell = ROUND(list_reference * 1.05, 2)   DECLARED_FIXTURE rule SZ-MARK-ON-5
 * cycle minutes are CALCULATED / MODELED under CYCLE_MODEL
 */
import { millPassesForDepth, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";

export const ENGINE = {
  id: "STB-STORE-ZERO-PRICE-1",
  version: "0.4.0",
  clock: "2026-09-22",
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

/**
 * Processing economics are not declared yet.
 * Numeric recovery values are intentionally absent. Tests may mutate these
 * fields to prove that undeclared values cannot affect a Store answer.
 */
export const RECOVERY = {
  setupCharge: null,
  machineHourRate: null,
  status: "UNDECLARED",
  mayFormCompleteQ: false
};

export const PROCESSING_RECOVERY_POLICY = Object.freeze({
  status: "UNRESOLVED",
  method: "COST_POOL_DIVIDED_BY_FORECAST_PRODUCTIVE_HOURS",
  costPool: null,
  forecastProductiveHours: null,
  setupCharge: null,
  machineHourRate: null,
  jobSetupMin: null,
  reason: "PROCESSING_RATE_BASIS_REQUIRED",
  setupTimeReason: "SETUP_TIME_BASIS_REQUIRED",
  note: "Processing dollars require a declared cost pool and forecast productive hours. Setup time requires its own declared basis. Modeled operation minutes are not billed time."
});

/** Compatibility alias for older callers. It does not grant separate authority. */
export const BOARD_PROCESSING_POLICY = Object.freeze({
  ...PROCESSING_RECOVERY_POLICY,
  classId: "user_defined_board"
});

function qualifyIncompleteProcessing(estimate) {
  if (!estimate?.totals) return estimate;
  const hardware = Number(estimate.totals.hardware || 0);
  const operationMin = Number(
    estimate.cycle?.modeledOperationSubtotalMin ?? estimate.cycle?.T_job_min ?? 0
  );
  const qualified = {
    ...estimate,
    status: "PARTIAL_BUDGETARY_ESTIMATE",
    processingPolicy: PROCESSING_RECOVERY_POLICY,
    unresolved: [...new Set([
      ...(estimate.unresolved ?? []),
      PROCESSING_RECOVERY_POLICY.reason,
      PROCESSING_RECOVERY_POLICY.setupTimeReason
    ])],
    cycle: {
      ...estimate.cycle,
      T_job_min: null,
      T_job_hr: null,
      modeledOperationSubtotalMin: operationMin,
      jobSetupMin: null,
      completeness: "PARTIAL_MODELED_OPERATION_TIME",
      measured: false
    },
    totals: {
      ...estimate.totals,
      cell_recovery: null,
      Q: round(estimate.totals.material + hardware, 2),
      Q_basis: "PARTIAL_CALCULATED",
      note: "Material/hardware subtotal only. Processing dollars and billed setup time remain unresolved until their declared bases exist. Modeled operation minutes are not a price."
    }
  };
  return { ...qualified, realityBar: auditRealityBar(qualified) };
}

export function auditRealityBar(estimate) {
  const failures = [];
  const warnings = [];
  if (!estimate || estimate.status === "UNRESOLVED" || estimate.status === "REFUSED") {
    return { status: "NOT_APPLICABLE", failures, warnings };
  }
  const totals = estimate.totals || {};
  const expectedQ = round(Number(totals.material || 0) + Number(totals.hardware || 0), 2);
  if (totals.cell_recovery != null && Number(totals.cell_recovery) !== 0) {
    failures.push("INVENTED_CELL_RECOVERY");
  }
  if (estimate.cycle?.T_job_min != null || estimate.cycle?.T_job_hr != null) {
    failures.push("UNDECLARED_BILLED_JOB_TIME");
  }
  if (Number.isFinite(Number(totals.Q)) && Number(totals.Q) !== expectedQ) {
    failures.push("Q_INCLUDES_UNSUPPORTED_DOLLARS");
  }
  if (RECOVERY.mayFormCompleteQ) {
    failures.push("UNDECLARED_RECOVERY_AUTHORIZED");
  }
  if (RECOVERY.setupCharge != null || RECOVERY.machineHourRate != null) {
    failures.push("UNDECLARED_RECOVERY_CONSTANT_PRESENT");
  }
  if (TOOLING?.jobSetupMin != null) {
    failures.push("UNDECLARED_SETUP_TIME_PRESENT");
  }
  for (const line of estimate.material_lines || []) {
    if (line.listReferenceBasis && line.listReferenceBasis !== "OBSERVED" && !line.observationId) {
      warnings.push(`UNOBSERVED_LIST:${line.storeSku}`);
    }
  }
  return {
    status: failures.length ? "FAIL" : "PASS",
    rule: "No invented processing dollars. Q may contain only catalog material/hardware until processing economics are declared.",
    failures,
    warnings,
    allowedInQ: ["material", "hardware"],
    forbiddenInQ: ["undeclared setup charge", "undeclared machine rate", "undeclared billed setup time"]
  };
}

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
  rapidInPerMin: D001_STAGE2_ENVELOPE.motion.FEED_X_MAX_LOADED_IN_PER_MIN,
  accelMin: 0.05,
  loadSeatMin: 0.6,
  releaseLabelMin: 0.4,
  jobSetupMin: null,
  drill: { rpm: 3000, ipr: 0.008 },
  spot: {
    diameterIn: 0.1875,
    fullDiameterPenetrationIn: 0.1875,
    depthReference: "ENTRY_SURFACE_ALONG_DRILL_AXIS",
    pointGeometryStatus: D001_STAGE2_ENVELOPE.spot.pointGeometryStatus,
    pointAngleDeg: D001_STAGE2_ENVELOPE.spot.pointAngleDeg,
    pointAxialLengthIn: D001_STAGE2_ENVELOPE.spot.pointAxialLengthIn,
    legacyFixedCycleMin: 0.16,
    legacyCycleBasis: "DECLARED_FIXTURE_DEPTH_UNDEFINED",
    applicabilityStatus: "UNRESOLVED_FOR_DEPTH_DEFINED_SPOT",
    note: "The prior fixed 0.16 min spot cycle belongs to the depth-undefined spot model. Applicability to the new 3/16 full-diameter penetration is unresolved until tool-point geometry and depth-cycle basis are declared."
  }
};

export const MILL = {
  longDeploy: 0.1,
  longFeedInPerMin: D001_STAGE2_ENVELOPE.motion.MILL_CUTTING_FEED_IN_PER_MIN,
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

export function spotCycleMin() {
  if (TOOLING.spot.applicabilityStatus !== "APPLICABLE") {
    throw new Error("SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED");
  }
  return TOOLING.spot.legacyFixedCycleMin;
}

export function spotEconomicsAssessment() {
  return {
    status: TOOLING.spot.applicabilityStatus,
    legacyFixedCycleMin: TOOLING.spot.legacyFixedCycleMin,
    legacyCycleBasis: TOOLING.spot.legacyCycleBasis,
    fullDiameterPenetrationIn: TOOLING.spot.fullDiameterPenetrationIn,
    pointGeometryStatus: TOOLING.spot.pointGeometryStatus,
    note: TOOLING.spot.note
  };
}

export function indexMin(keptLengthIn) {
  return TOOLING.accelMin + Math.abs(keptLengthIn) / TOOLING.rapidInPerMin;
}

export function millLongMin(profileLengthIn = 0, passes = 1) {
  if (!profileLengthIn) return 0;
  const n = Math.max(1, passes);
  return MILL.longDeploy + profileLengthIn / MILL.longFeedInPerMin + (n - 1) * MILL.longRepass + MILL.longRetract;
}

export function millEndMin(count = 0) {
  return count * MILL.endFeatureMin;
}

export function cycleOneStick({
  keptLengthIn,
  widthIn,
  holes = 0,
  spots = 0,
  depthIn = 0.75,
  sawCuts = 2,
  sawTraverseIn = null,
  millLongIn = 0,
  millEnds = 0,
  millDepthIn = 0,
  passes = 1
}) {
  const cutCount = Math.max(0, Number(sawCuts) || 0);
  const traverse = Number.isFinite(Number(sawTraverseIn)) && Number(sawTraverseIn) > 0
    ? Number(sawTraverseIn)
    : widthIn;
  const saw = sawCycleMin(traverse);
  const millPasses = millDepthIn ? millPassesForDepth(millDepthIn) : passes;
  const total =
    TOOLING.loadSeatMin +
    cutCount * saw +
    indexMin(keptLengthIn) +
    holes * drillCycleMin(depthIn) +
    (spots > 0 ? spots * spotCycleMin() : 0) +
    millLongMin(millLongIn, millPasses) +
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
  const cycleMin = pieces.reduce((s, p) => s + cycleOneStick(p) * p.qty, 0);
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
  const cell = null;
  const Q = round(material + hardware, 2);
  return qualifyIncompleteProcessing({
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
  });
}

export function estimateBoardSequence(catalog, {
  title,
  classId = "user_defined_board",
  storeSku,
  qty = 1,
  definedWorkpieceLengthIn,
  sawCuts,
  sawAngleDeg = 0,
  drillCycles = 0,
  spotCycles = 0,
  drillReferenceDepthIn = 0.75
}) {
  const item = findOffering(catalog, storeSku);
  if (!item || item.form !== "board" || item.actualW == null) {
    return { status: "UNRESOLVED", reason: "BOARD_OFFERING_REQUIRED", title };
  }
  const angle = Math.max(0, Math.min(89, Number(sawAngleDeg) || 0));
  const radians = angle * Math.PI / 180;
  const sawTraverseIn = angle > 0
    ? item.actualW / Math.cos(radians)
    : item.actualW;
  const spotCount = Math.max(0, Number(spotCycles) || 0);
  const spotAssessment = spotEconomicsAssessment();
  const spotEconomicsResolved =
    spotCount === 0 || spotAssessment.status === "APPLICABLE";

  const estimate = estimateJob(catalog, {
    title,
    classId,
    pieces: [{
      storeSku,
      qty,
      keptLengthIn: definedWorkpieceLengthIn,
      widthIn: item.actualW,
      sawCuts,
      sawTraverseIn,
      holes: drillCycles,
      spots: spotEconomicsResolved ? spotCount : 0,
      depthIn: drillReferenceDepthIn
    }]
  });

  if (!estimate.totals) return estimate;

  if (spotCount > 0 && !spotEconomicsResolved) {
    return {
      ...estimate,
      status: "PARTIAL_BUDGETARY_ESTIMATE",
      unresolved: [...(estimate.unresolved ?? []), "SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED"],
      operationEconomics: {
        spot: {
          requestedCycles: spotCount,
          status: spotAssessment.status,
          legacyFixedCycleMin: spotAssessment.legacyFixedCycleMin,
          legacyCycleBasis: spotAssessment.legacyCycleBasis,
          excludedFromResolvedSubtotal: true
        }
      },
      cycle: {
        ...estimate.cycle,
        excludedSpotCycles: spotCount,
        spotCycleStatus: spotAssessment.status
      },
      totals: {
        ...estimate.totals,
        Q_basis: "PARTIAL_CALCULATED",
        note: `${estimate.totals?.note ?? ""} Excludes unresolved depth-defined spot-cycle time.`
      }
    };
  }

  return estimate;
}


export function estimateBoardPlan(catalog, {
  title,
  classId = "user_defined_board",
  plan,
  spotCycles = 0
}) {
  const selected = plan?.selected;
  const item = selected ? findOffering(catalog, selected.storeSku) : null;
  if (!item || item.form !== "board" || item.actualW == null || !Number.isInteger(selected.parentCount) || selected.parentCount < 1) {
    return { status: "UNRESOLVED", reason: "SELECTED_BOARD_PLAN_REQUIRED", title };
  }

  const materialLine = extendLine(catalog, selected.storeSku, selected.parentCount);
  if (materialLine.status === "INCOMPLETE") {
    return { status: "UNRESOLVED", reason: "MISSING_PRICE", title };
  }

  const angle = Number(plan.finishedPart?.angleDeg ?? 0);
  const radians = angle * Math.PI / 180;
  const miterTraverseIn = angle > 0 ? item.actualW / Math.cos(radians) : item.actualW;
  const productionSawCuts = Number(plan.accounting?.productionSawCuts ?? 0);
  const preparationSawCuts = Number(plan.accounting?.preparationSawCuts ?? 0);
  const producedParts = Number(plan.finishedPart?.quantity ?? 0);
  const finishedLengthIn = Number(plan.finishedPart?.lengthIn ?? 0);

  const cycleMin =
    selected.parentCount * (TOOLING.loadSeatMin + TOOLING.releaseLabelMin) +
    productionSawCuts * sawCycleMin(miterTraverseIn) +
    preparationSawCuts * sawCycleMin(item.actualW) +
    producedParts * indexMin(finishedLengthIn);

  const spotCount = Math.max(0, Number(spotCycles) || 0);
  const spotAssessment = spotEconomicsAssessment();
  const spotEconomicsResolved = spotCount === 0 || spotAssessment.status === "APPLICABLE";
  const resolvedCycleMin = cycleMin + (spotEconomicsResolved && spotCount > 0 ? spotCount * spotCycleMin() : 0);
  const hours = resolvedCycleMin / 60;
  const material = materialLine.extension;
  const cell = null;
  const Q = round(material, 2);

  const estimate = {
    status: "BUDGETARY_ESTIMATE",
    title,
    classId,
    documentKind: ENGINE.documentKind,
    engine: ENGINE,
    material_lines: [materialLine],
    hardware_line: null,
    planIdentity: plan.planId ?? null,
    operationAccounting: {
      parentCount: selected.parentCount,
      productionSawCuts,
      preparationSawCuts,
      totalModeledSawCuts: productionSawCuts + preparationSawCuts,
      producedParts,
      spotCyclesRequested: spotCount,
      preparation: Array.isArray(plan.preparation) ? plan.preparation : []
    },
    cycle: {
      model: CYCLE_MODEL.id,
      basis: CYCLE_MODEL.basis,
      measured: false,
      T_job_min: round(resolvedCycleMin, 3),
      T_job_hr: round(hours, 4),
      SFM: round(sfm(), 0),
      feed_fpm: round(feedFpm(), 2)
    },
    totals: {
      material,
      cell_recovery: cell,
      hardware: 0,
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

  if (spotCount > 0 && !spotEconomicsResolved) {
    return qualifyIncompleteProcessing({
      ...estimate,
      status: "PARTIAL_BUDGETARY_ESTIMATE",
      unresolved: ["SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED"],
      operationEconomics: {
        spot: {
          requestedCycles: spotCount,
          status: spotAssessment.status,
          legacyFixedCycleMin: spotAssessment.legacyFixedCycleMin,
          legacyCycleBasis: spotAssessment.legacyCycleBasis,
          excludedFromResolvedSubtotal: true
        }
      },
      cycle: {
        ...estimate.cycle,
        excludedSpotCycles: spotCount,
        spotCycleStatus: spotAssessment.status
      },
      totals: {
        ...estimate.totals,
        Q_basis: "PARTIAL_CALCULATED",
        note: "Partial budgetary subtotal. Excludes unresolved depth-defined spot-cycle time."
      }
    });
  }

  return qualifyIncompleteProcessing(estimate);
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
