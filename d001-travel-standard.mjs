import { createHash } from "node:crypto";
import { D001_STAGE2_ENVELOPE, millPassesForDepth } from "./d001-stage2-envelope.mjs";

export const D001_TRAVEL_STANDARD = Object.freeze({
  id: "STB-D001-DIMENSIONAL-TRAVEL-0.1",
  version: "0.2.0",
  basis: "DECLARED_STAGE2_MODEL",
  measured: false,
  commissioned: false,
  standardFile: "DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md",
  datums: Object.freeze({
    A: Object.freeze({ id: "DATUM_A", meaning: "fixed fence reference", axis: "Y", valueIn: 0 }),
    B: Object.freeze({ id: "DATUM_B", meaning: "fixed table/support reference", axis: "Z", valueIn: 0 }),
    C: Object.freeze({
      id: "DATUM_C",
      meaning: "dynamic longitudinal workpiece origin",
      axis: "X",
      allowedEstablishmentMethods: Object.freeze(["REFERENCE_CUT", "MECHANICAL_REFERENCE", "SENSED_FACE"])
    })
  }),
  stations: Object.freeze({
    sawMiter: Object.freeze({
      id: "SAW-L",
      xIn: 0,
      motion: "DOWNSTROKE",
      capability: "SINGLE_PLANE_FACE_MITER_0_45"
    }),
    sawSquare: Object.freeze({
      id: "SAW-R",
      xIn: 72,
      motion: "DOWNSTROKE",
      capability: "SQUARE_FINISHED_CUT",
      note: "Store Job 001 modeled outfeed finished-cut station; not commissioned iron."
    }),
    millLong: Object.freeze({
      id: "MILL_LONG",
      xIn: 36,
      axisReference: "DATUM_A",
      capability: "MILL_LONGITUDINAL_PROFILE",
      note: "Stage-2 longitudinal mill station from the declared D-001 envelope; not commissioned iron."
    }),
    spotFace: Object.freeze({
      id: "SPOT-FACE-REF",
      xIn: 36,
      axisReference: "DATUM_A",
      plungeAxis: "Z",
      capability: "SPOT_ON_LOCATION_3_16_WIDE_FACE",
      note: "Stage-2 modeled tooling plane co-located with the declared X=36 tooling center; not commissioned iron."
    })
  }),
  motion: Object.freeze({
    x: Object.freeze({
      maxLoadedVelocityInPerMin: 480,
      accelerationInPerSec2: 32,
      basis: "DECLARED_STAGE2_MODEL"
    }),
    yTool: Object.freeze({
      maxVelocityInPerMin: 240,
      accelerationInPerSec2: 16,
      basis: "DECLARED_STAGE2_MODEL"
    })
  }),
  handling: Object.freeze({
    loadSeatSec: 36,
    releaseLabelSec: 24,
    basis: "DECLARED_STAGE2_MODEL",
    note: "Modeled cell-occupied handling segments; not setup time and not a setup charge."
  }),
  saw: Object.freeze({
    diameterIn: 20,
    rpm: 1800,
    teeth: 80,
    chipLoadInPerTooth: 0.003,
    finishFactor: 0.5,
    deploySec: 1,
    retractSec: 1,
    basis: "DECLARED_STAGE2_MODEL",
    note: "Reference commercial downstroke saw model. Not an installed or commissioned blade/motor claim."
  }),
  spot: Object.freeze({
    toolDiameterIn: 0.1875,
    rpm: 3000,
    feedPerRevIn: 0.008,
    timingReferencePlungeIn: 0.125,
    approachSec: 0.35,
    retractSec: 0.35,
    depthIsPartRequirement: false,
    basis: "DECLARED_STAGE2_MODEL",
    note: "0.125 in is a timing reference only. The current SPOT_ON_LOCATION definition does not claim a finished-hole depth."
  }),
  mill: Object.freeze({
    cuttingFeedInPerMin: D001_STAGE2_ENVELOPE.motion.MILL_CUTTING_FEED_IN_PER_MIN,
    maxYIn: D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN,
    maxProfileLengthIn: D001_STAGE2_ENVELOPE.millLong.maxProfileLengthIn,
    maxDepthPerPassIn: D001_STAGE2_ENVELOPE.millLong.maxDepthPerPassIn,
    passReturnModel: "RETURN_AT_X_INDEX_RATE",
    basis: "DECLARED_STAGE2_MODEL",
    note: "Modeled longitudinal profile time = cutting path per pass plus rapid X return between repeated depth passes. No species-specific feed multiplier is claimed."
  }),
  control: Object.freeze({
    minRetainedControlIn: 24,
    kerfIn: 0.125,
    basis: "DECLARED_STAGE2_MODEL"
  }),
  economics: Object.freeze({
    id: "STB-D001-STORE-ECONOMICS-S2-0.1",
    version: "0.1.0",
    basis: "DECLARED_STAGE2_MODEL",
    measured: false,
    annualCostPoolUsd: 120000,
    forecastProductiveHours: 600,
    targetGrossMargin: 0.20,
    costPoolComponentsUsd: Object.freeze({
      operatorBurden: 50000,
      capitalRecovery: 25000,
      facilityInsuranceAdmin: 20000,
      maintenanceTooling: 15000,
      energyDustIt: 10000
    }),
    note: "Explicit Stage-2 scenario economics. Replace with measured Store evidence later; do not rewrite historical results."
  })
});

function round(value, places = 3) {
  const m = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * m) / m;
}

function stable(value) {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map((key) => JSON.stringify(key) + ":" + stable(value[key])).join(",") + "}";
  }
  return JSON.stringify(value);
}

export function calculationHash(value) {
  return createHash("sha256").update(stable(value)).digest("hex");
}

export function xIndexTimeSec(distanceIn, model = D001_TRAVEL_STANDARD.motion.x) {
  const D = Math.abs(Number(distanceIn));
  if (!Number.isFinite(D)) return NaN;
  if (D === 0) return 0;
  const V = Number(model.maxLoadedVelocityInPerMin) / 60;
  const A = Number(model.accelerationInPerSec2);
  const threshold = (V * V) / A;
  if (D >= threshold) {
    return (2 * V) / A + (D - threshold) / V;
  }
  return 2 * Math.sqrt(D / A);
}

export function yIndexTimeSec(distanceIn, model = D001_TRAVEL_STANDARD.motion.yTool) {
  const D = Math.abs(Number(distanceIn));
  if (!Number.isFinite(D)) return NaN;
  if (D === 0) return 0;
  const V = Number(model.maxVelocityInPerMin) / 60;
  const A = Number(model.accelerationInPerSec2);
  const threshold = (V * V) / A;
  if (D >= threshold) {
    return (2 * V) / A + (D - threshold) / V;
  }
  return 2 * Math.sqrt(D / A);
}

export function sawFeedInPerMin(saw = D001_TRAVEL_STANDARD.saw) {
  return saw.chipLoadInPerTooth * saw.teeth * saw.rpm * saw.finishFactor;
}

export function sawCycleSec(widthIn, angleDeg = 0, saw = D001_TRAVEL_STANDARD.saw) {
  const width = Number(widthIn);
  const angle = Number(angleDeg);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(angle) || angle < 0 || angle >= 90) {
    return NaN;
  }
  const traverseIn = width / Math.cos((angle * Math.PI) / 180);
  const cutSec = (traverseIn / sawFeedInPerMin(saw)) * 60;
  return saw.deploySec + cutSec + saw.retractSec;
}

export function spotCycleSec(widthIn, spot = D001_TRAVEL_STANDARD.spot) {
  const width = Number(widthIn);
  if (!Number.isFinite(width) || width <= 0) return NaN;
  const acrossWidthIn = width / 2;
  const yPositionSec = yIndexTimeSec(acrossWidthIn);
  const drillFeedInPerMin = spot.rpm * spot.feedPerRevIn;
  const plungeSec = (spot.timingReferencePlungeIn / drillFeedInPerMin) * 60;
  return {
    acrossWidthIn,
    yPositionSec,
    plungeSec,
    totalSec: yPositionSec + spot.approachSec + plungeSec + spot.retractSec
  };
}

export function millLongitudinalCycleSec({
  pathLengthIn,
  yIn,
  totalDepthIn,
} = {}, mill = D001_TRAVEL_STANDARD.mill) {
  const path = Number(pathLengthIn);
  const y = Number(yIn);
  const depth = Number(totalDepthIn);
  if (
    !Number.isFinite(path) || path <= 0 ||
    !Number.isFinite(y) || y < 0 ||
    !Number.isFinite(depth) || depth <= 0
  ) {
    return { status: "UNRESOLVED", reason: "MILL_FEATURE_GEOMETRY_REQUIRED" };
  }
  if (path > mill.maxProfileLengthIn) {
    return { status: "REFUSED", reason: "MILL_PROFILE_LENGTH_EXCEEDS_D001_STAGE2_ENVELOPE" };
  }
  if (y > mill.maxYIn) {
    return { status: "REFUSED", reason: "MILL_Y_EXCEEDS_TOOL_TRAVEL" };
  }
  const passes = millPassesForDepth(depth);
  const cutPerPassSec = (path / Number(mill.cuttingFeedInPerMin)) * 60;
  const passReturnSec = passes > 1 ? xIndexTimeSec(path) * (passes - 1) : 0;
  const yPositionSec = yIndexTimeSec(y);
  return {
    status: "SUPPORTABLE",
    pathLengthIn: round(path, 6),
    yIn: round(y, 6),
    totalDepthIn: round(depth, 6),
    passes,
    cuttingFeedInPerMin: mill.cuttingFeedInPerMin,
    cutPerPassSec: round(cutPerPassSec, 4),
    passReturnSec: round(passReturnSec, 4),
    yPositionSec: round(yPositionSec, 4),
    totalSec: round(yPositionSec + cutPerPassSec * passes + passReturnSec, 4)
  };
}

export function storeMachineSellRate(model = D001_TRAVEL_STANDARD.economics) {
  const breakEvenPerHour = model.annualCostPoolUsd / model.forecastProductiveHours;
  const sellRatePerHour = breakEvenPerHour / (1 - model.targetGrossMargin);
  return {
    breakEvenPerHour: round(breakEvenPerHour, 2),
    sellRatePerHour: round(sellRatePerHour, 2)
  };
}

function unresolvedResult(codes, details = {}) {
  return {
    status: "UNRESOLVED",
    complete: false,
    unresolved: [...new Set(codes)],
    standard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version,
      basis: D001_TRAVEL_STANDARD.basis
    },
    ...details
  };
}

function refusedResult(codes, details = {}) {
  return {
    status: "REFUSED",
    complete: false,
    reasons: [...new Set(codes)],
    standard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version,
      basis: D001_TRAVEL_STANDARD.basis
    },
    ...details
  };
}

function normalizedFeature(feature, part, widthIn) {
  if (!feature || feature.kind !== "SPOT_ON_LOCATION") {
    return { error: "UNSUPPORTED_OR_MISSING_FEATURE_KIND" };
  }
  const xIn = Number(feature.xIn);
  if (!Number.isFinite(xIn)) {
    return { error: "SPOT_LOCATION_REQUIRED" };
  }
  if (xIn < 0 || xIn > part.lengthIn) {
    return { error: "SPOT_LOCATION_OUTSIDE_PART" };
  }
  if (feature.acrossWidthRule !== "CENTERED_ON_WIDE_FACE") {
    return { error: "SPOT_ACROSS_WIDTH_RULE_NOT_DECLARED" };
  }
  return {
    featureId: String(feature.featureId || ""),
    kind: "SPOT_ON_LOCATION",
    xIn,
    acrossWidthRule: "CENTERED_ON_WIDE_FACE",
    acrossWidthIn: widthIn / 2
  };
}

function normalizedDemand(demand, item) {
  const unresolved = [];
  const refused = [];
  if (!demand || typeof demand !== "object") unresolved.push("DIMENSIONAL_TRAVEL_DEMAND_REQUIRED");
  if (!item || item.form !== "board") unresolved.push("BOARD_OFFERING_REQUIRED");
  if (unresolved.length) return { unresolved, refused };

  const definedWorkpieceLengthIn = Number(demand.definedWorkpieceLengthIn);
  if (!Number.isFinite(definedWorkpieceLengthIn) || definedWorkpieceLengthIn <= 0) {
    unresolved.push("DEFINED_WORKPIECE_LENGTH_REQUIRED");
  }

  const angleDeg = Number(demand.cut?.angleDeg);
  if (!Number.isFinite(angleDeg)) {
    unresolved.push("MITER_ANGLE_REQUIRED");
  } else if (angleDeg < 0 || angleDeg > 45) {
    refused.push("MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE");
  }
  if (demand.cut?.plane !== "miter-face") refused.push("MITER_PLANE_NOT_DECLARED");

  const datumCMethod = demand.datumC?.method;
  if (!D001_TRAVEL_STANDARD.datums.C.allowedEstablishmentMethods.includes(datumCMethod)) {
    unresolved.push("DATUM_C_ESTABLISHMENT_METHOD_REQUIRED");
  }
  if (demand.datumC?.stationId !== D001_TRAVEL_STANDARD.stations.sawMiter.id) {
    unresolved.push("DATUM_C_REFERENCE_STATION_REQUIRED");
  }

  const widthIn = Number(item.actualW);
  if (!Number.isFinite(widthIn) || widthIn <= 0) unresolved.push("ACTUAL_BOARD_WIDTH_REQUIRED");

  const parts = Array.isArray(demand.parts) ? demand.parts : [];
  if (!parts.length) unresolved.push("IDENTIFIED_PARTS_REQUIRED");

  const seen = new Set();
  const normalizedParts = [];
  for (const raw of parts) {
    const partId = String(raw?.partId || "");
    const lengthIn = Number(raw?.lengthIn);
    if (!partId || seen.has(partId)) unresolved.push("UNIQUE_PART_ID_REQUIRED");
    seen.add(partId);
    if (!Number.isFinite(lengthIn) || lengthIn <= 0) unresolved.push("PART_LENGTH_REQUIRED");
    const part = { partId, lengthIn, features: [] };
    const features = Array.isArray(raw?.features) ? raw.features : [];
    for (const feature of features) {
      const normalized = normalizedFeature(feature, part, widthIn);
      if (normalized.error) {
        if (normalized.error.includes("OUTSIDE") || normalized.error.includes("NOT_DECLARED")) refused.push(normalized.error);
        else unresolved.push(normalized.error);
      } else {
        part.features.push(normalized);
      }
    }
    normalizedParts.push(part);
  }

  const incomingUnresolved = Array.isArray(demand.unresolvedConditions)
    ? demand.unresolvedConditions.filter((v) => typeof v === "string" && v.trim())
    : [];
  unresolved.push(...incomingUnresolved);

  return {
    unresolved,
    refused,
    value: {
      configurationId: String(demand.configurationId || ""),
      configurationVersion: String(demand.configurationVersion || ""),
      classId: String(demand.classId || "user_defined_board"),
      definedWorkpieceLengthIn,
      angleDeg,
      datumCMethod,
      widthIn,
      parts: normalizedParts,
      declaredSawCuts: demand.declaredSawCuts == null ? null : Number(demand.declaredSawCuts),
      declaredSpotCount: demand.declaredSpotCount == null ? null : Number(demand.declaredSpotCount)
    }
  };
}

function deriveOperationPlan(normalized) {
  const M = D001_TRAVEL_STANDARD;
  const sawX = M.stations.sawMiter.xIn;
  const spotX = M.stations.spotFace.xIn;
  const kerfIn = M.control.kerfIn;
  const operations = [];
  let currentCIn = sawX;
  let tIndexSec = 0;
  let tSawSec = 0;
  let tSpotSec = 0;
  let tReferenceSec = 0;

  const sawSec = sawCycleSec(normalized.widthIn, normalized.angleDeg);
  tReferenceSec += sawSec;
  operations.push({
    sequence: operations.length + 1,
    opId: "OP-REF-CUT",
    kind: "REFERENCE_CUT",
    stationId: M.stations.sawMiter.id,
    datumEffect: "ESTABLISH_DATUM_C",
    angleDeg: normalized.angleDeg,
    indexDistanceIn: 0,
    timeSec: round(sawSec, 4)
  });

  let partStartIn = 0;
  const spots = [];
  for (let i = 0; i < normalized.parts.length; i += 1) {
    const part = normalized.parts[i];
    for (const feature of part.features) {
      spots.push({
        ...feature,
        partId: part.partId,
        partStartIn,
        workpieceFeatureXIn: partStartIn + feature.xIn
      });
    }
    partStartIn += part.lengthIn + kerfIn;
  }

  spots.sort((a, b) => a.workpieceFeatureXIn - b.workpieceFeatureXIn);
  for (const feature of spots) {
    const targetCIn = spotX - feature.workpieceFeatureXIn;
    const distanceIn = Math.abs(targetCIn - currentCIn);
    const xSec = xIndexTimeSec(distanceIn);
    tIndexSec += xSec;
    operations.push({
      sequence: operations.length + 1,
      opId: `OP-INDEX-${operations.length + 1}`,
      kind: "INDEX",
      purpose: `POSITION_${feature.featureId || feature.partId}`,
      fromCIn: round(currentCIn, 6),
      toCIn: round(targetCIn, 6),
      distanceIn: round(distanceIn, 6),
      timeSec: round(xSec, 4)
    });
    currentCIn = targetCIn;

    const spotTiming = spotCycleSec(normalized.widthIn);
    tSpotSec += spotTiming.totalSec;
    operations.push({
      sequence: operations.length + 1,
      opId: feature.featureId || `SPOT-${feature.partId}`,
      kind: "SPOT_ON_LOCATION",
      stationId: M.stations.spotFace.id,
      partId: feature.partId,
      partRelativeXIn: round(feature.xIn, 6),
      workpieceFeatureXIn: round(feature.workpieceFeatureXIn, 6),
      acrossWidthRule: feature.acrossWidthRule,
      acrossWidthIn: round(spotTiming.acrossWidthIn, 6),
      timingReferencePlungeIn: M.spot.timingReferencePlungeIn,
      depthIsPartRequirement: false,
      timeSec: round(spotTiming.totalSec, 4)
    });
  }

  let remainingIn = normalized.definedWorkpieceLengthIn - kerfIn;
  const cutRows = [];
  for (let i = 0; i < normalized.parts.length; i += 1) {
    const part = normalized.parts[i];
    const targetCIn = sawX - part.lengthIn;
    const distanceIn = Math.abs(targetCIn - currentCIn);
    const xSec = xIndexTimeSec(distanceIn);
    tIndexSec += xSec;
    operations.push({
      sequence: operations.length + 1,
      opId: `OP-INDEX-CUT-${i + 1}`,
      kind: "INDEX",
      purpose: `POSITION_CUTOFF_${part.partId}`,
      fromCIn: round(currentCIn, 6),
      toCIn: round(targetCIn, 6),
      distanceIn: round(distanceIn, 6),
      timeSec: round(xSec, 4)
    });
    currentCIn = targetCIn;

    const cutSec = sawCycleSec(normalized.widthIn, normalized.angleDeg);
    tSawSec += cutSec;
    remainingIn -= part.lengthIn + kerfIn;
    const controlPass = remainingIn >= M.control.minRetainedControlIn - 1e-9;
    cutRows.push({
      partId: part.partId,
      retainedAfterIn: round(remainingIn, 6),
      minRetainedControlIn: M.control.minRetainedControlIn,
      pass: controlPass
    });
    operations.push({
      sequence: operations.length + 1,
      opId: `OP-CUTOFF-${i + 1}`,
      kind: "MITER_CUTOFF",
      stationId: M.stations.sawMiter.id,
      partId: part.partId,
      partLengthIn: part.lengthIn,
      angleDeg: normalized.angleDeg,
      kerfIn,
      retainedAfterIn: round(remainingIn, 6),
      controlPass,
      timeSec: round(cutSec, 4)
    });

    operations.push({
      sequence: operations.length + 1,
      opId: `OP-REBASE-C-${i + 1}`,
      kind: "REBASE_DATUM_C",
      stationId: M.stations.sawMiter.id,
      method: "FRESH_CUT_FACE",
      timeSec: 0
    });
    currentCIn = sawX;
  }

  return {
    operations,
    cutRows,
    derivedSawCuts: 1 + normalized.parts.length,
    derivedSpotCount: spots.length,
    finalRemainderIn: round(remainingIn, 6),
    time: {
      T_LOAD_SEAT_sec: M.handling.loadSeatSec,
      T_REFERENCE_sec: round(tReferenceSec, 4),
      T_INDEX_sec: round(tIndexSec, 4),
      T_SAW_sec: round(tSawSec, 4),
      T_DRILL_SPOT_sec: round(tSpotSec, 4),
      T_MILL_sec: 0,
      T_RELEASE_LABEL_sec: M.handling.releaseLabelSec
    }
  };
}

export function evaluateD001UserDefinedBoard({ item, demand, storeRevision = null } = {}) {
  const normalized = normalizedDemand(demand, item);
  if (normalized.unresolved?.length) return unresolvedResult(normalized.unresolved);
  if (normalized.refused?.length) return refusedResult(normalized.refused);

  const plan = deriveOperationPlan(normalized.value);
  const unresolved = [];
  const refused = [];

  if (normalized.value.declaredSawCuts != null && normalized.value.declaredSawCuts !== plan.derivedSawCuts) {
    unresolved.push("DECLARED_SAW_COUNT_MISMATCH");
  }
  if (normalized.value.declaredSpotCount != null && normalized.value.declaredSpotCount !== plan.derivedSpotCount) {
    unresolved.push("DECLARED_SPOT_COUNT_MISMATCH");
  }
  if (plan.cutRows.some((row) => row.pass !== true)) {
    refused.push("LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL");
  }
  if (unresolved.length) return unresolvedResult(unresolved, { operationPlan: plan.operations });
  if (refused.length) return refusedResult(refused, { operationPlan: plan.operations });

  const tMachineSec =
    plan.time.T_LOAD_SEAT_sec +
    plan.time.T_REFERENCE_sec +
    plan.time.T_INDEX_sec +
    plan.time.T_SAW_sec +
    plan.time.T_DRILL_SPOT_sec +
    plan.time.T_MILL_sec +
    plan.time.T_RELEASE_LABEL_sec;
  const tMachineMin = tMachineSec / 60;
  const rates = storeMachineSellRate();
  const material = round(Number(item.sellingPrice), 2);
  const machineService = round((tMachineMin / 60) * rates.sellRatePerHour, 2);
  const Q = round(material + machineService, 2);

  const governingInput = {
    travelStandard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version
    },
    economics: {
      id: D001_TRAVEL_STANDARD.economics.id,
      version: D001_TRAVEL_STANDARD.economics.version,
      annualCostPoolUsd: D001_TRAVEL_STANDARD.economics.annualCostPoolUsd,
      forecastProductiveHours: D001_TRAVEL_STANDARD.economics.forecastProductiveHours,
      targetGrossMargin: D001_TRAVEL_STANDARD.economics.targetGrossMargin
    },
    storeRevision,
    offering: {
      storeSku: item.storeSku,
      sellingPrice: item.sellingPrice,
      actualW: item.actualW,
      actualT: item.actualT,
      stockL_in: item.stockL_in
    },
    demand: normalized.value
  };
  const inputHash = calculationHash(governingInput);

  const resultCore = {
    material,
    machineService,
    Q,
    derivedSawCuts: plan.derivedSawCuts,
    derivedSpotCount: plan.derivedSpotCount,
    finalRemainderIn: plan.finalRemainderIn,
    time: {
      ...plan.time,
      T_MACHINE_sec: round(tMachineSec, 4),
      T_MACHINE_min: round(tMachineMin, 4),
      T_MACHINE_hr: round(tMachineMin / 60, 6)
    },
    sellRatePerHour: rates.sellRatePerHour,
    operationPlan: plan.operations
  };
  const resultHash = calculationHash({ inputHash, resultCore });

  return {
    status: "BUDGETARY_ESTIMATE",
    complete: true,
    completeness: "COMPLETE_FOR_TRAVEL_STANDARD",
    unresolved: [],
    standard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version,
      basis: D001_TRAVEL_STANDARD.basis,
      measured: false,
      commissioned: false
    },
    economics: {
      ...D001_TRAVEL_STANDARD.economics,
      ...rates,
      setupCharge: 0,
      setupTimeMin: 0,
      formula: "Q = stock/sourced selling price + (T_MACHINE_hr × STORE_MACHINE_SELL_RATE)"
    },
    travel: {
      configurationId: normalized.value.configurationId,
      configurationVersion: normalized.value.configurationVersion,
      datumA: D001_TRAVEL_STANDARD.datums.A,
      datumB: D001_TRAVEL_STANDARD.datums.B,
      datumC: {
        ...D001_TRAVEL_STANDARD.datums.C,
        establishmentMethod: normalized.value.datumCMethod,
        stationId: D001_TRAVEL_STANDARD.stations.sawMiter.id
      },
      positionValidRequired: true,
      parts: normalized.value.parts,
      operationPlan: plan.operations,
      derivedSawCuts: plan.derivedSawCuts,
      derivedSpotCount: plan.derivedSpotCount,
      finalRemainderIn: plan.finalRemainderIn,
      time: resultCore.time
    },
    totals: {
      material,
      hardware: 0,
      machine_service: machineService,
      Q,
      Q_basis: "CALCULATED_FROM_DECLARED_STAGE2_MODEL"
    },
    calculationIdentity: {
      inputHash,
      resultHash
    },
    not_claimed: [
      "commercial quote",
      "seller-of-record",
      "physical fabrication",
      "live motion",
      "physical stock count",
      "measured machine performance"
    ]
  };
}

function normalizeBatchComponent(raw, item) {
  const unresolved = [];
  const refused = [];
  if (!raw || typeof raw !== "object") unresolved.push("COMPONENT_PROGRAM_REQUIRED");
  if (!item || item.form !== "board") unresolved.push("COMPONENT_STORE_BOARD_REQUIRED");
  if (unresolved.length) return { unresolved, refused };

  const componentId = String(raw.componentId || "");
  const finishedLengthIn = Number(raw.finishedLengthIn);
  const finishedWidthIn = Number(raw.finishedWidthIn);
  if (!componentId) unresolved.push("COMPONENT_ID_REQUIRED");
  if (!Number.isFinite(finishedLengthIn) || finishedLengthIn <= 0) unresolved.push("COMPONENT_FINISHED_LENGTH_REQUIRED");
  if (!Number.isFinite(finishedWidthIn) || finishedWidthIn <= 0) unresolved.push("COMPONENT_FINISHED_WIDTH_REQUIRED");
  if (finishedLengthIn < D001_STAGE2_ENVELOPE.stock.minControlledLengthIn) {
    refused.push("COMPONENT_LENGTH_BELOW_TWO_ROLLER_CONTROL");
  }
  if (finishedLengthIn > D001_TRAVEL_STANDARD.stations.sawSquare.xIn) {
    refused.push("COMPONENT_LENGTH_EXCEEDS_D001_TWO_SAW_SPAN");
  }
  if (Number.isFinite(finishedWidthIn) && Number.isFinite(Number(item.actualW)) && finishedWidthIn > Number(item.actualW) + 1e-9) {
    refused.push("COMPONENT_WIDTH_EXCEEDS_STORE_BOARD_WIDTH");
  }

  const features = Array.isArray(raw.features) ? raw.features : [];
  const normalizedFeatures = [];
  for (const feature of features) {
    if (!feature || feature.kind !== "MILL_LONGITUDINAL_PROFILE") {
      unresolved.push("UNSUPPORTED_OR_MISSING_BATCH_FEATURE_KIND");
      continue;
    }
    if (!(item.supportedOps || []).includes("MILL_LONGITUDINAL_PROFILE")) {
      refused.push("OP_NOT_ON_OFFERING:MILL_LONGITUDINAL_PROFILE");
      continue;
    }
    const pathLengthIn = Number(feature.pathLengthIn);
    const yIn = Number(feature.yIn);
    const totalDepthIn = Number(feature.totalDepthIn);
    if (
      !Number.isFinite(pathLengthIn) ||
      !Number.isFinite(yIn) ||
      !Number.isFinite(totalDepthIn)
    ) {
      unresolved.push("MILL_FEATURE_GEOMETRY_REQUIRED");
      continue;
    }
    if (Math.abs(pathLengthIn - finishedLengthIn) > 1e-6) {
      unresolved.push("MILL_PATH_MUST_MATCH_COMPONENT_LENGTH");
    }
    if (Math.abs(yIn - finishedWidthIn) > 1e-6) {
      unresolved.push("MILL_Y_MUST_MATCH_FINISHED_WIDTH");
    }
    if (totalDepthIn > Number(item.actualT) + 1e-9) {
      refused.push("MILL_DEPTH_EXCEEDS_STOCK_THICKNESS");
    }
    const timing = millLongitudinalCycleSec({ pathLengthIn, yIn, totalDepthIn });
    if (timing.status === "UNRESOLVED") unresolved.push(timing.reason);
    if (timing.status === "REFUSED") refused.push(timing.reason);
    normalizedFeatures.push({
      featureId: String(feature.featureId || ""),
      kind: "MILL_LONGITUDINAL_PROFILE",
      pathLengthIn,
      yIn,
      totalDepthIn,
      timing
    });
  }

  return {
    unresolved,
    refused,
    value: {
      componentId,
      requirementId: String(raw.requirementId || ""),
      finishedLengthIn,
      finishedWidthIn,
      features: normalizedFeatures
    }
  };
}

function deriveBatchComponentPlan(component, item) {
  const M = D001_TRAVEL_STANDARD;
  const operations = [];
  let currentCIn = M.stations.sawMiter.xIn;
  let tReferenceSec = 0;
  let tIndexSec = 0;
  let tSawSec = 0;
  let tMillSec = 0;

  const referenceSec = sawCycleSec(item.actualW, 0);
  tReferenceSec += referenceSec;
  operations.push({
    sequence: operations.length + 1,
    opId: component.componentId + ":REF",
    kind: "REFERENCE_CUT",
    stationId: M.stations.sawMiter.id,
    datumEffect: "ESTABLISH_DATUM_C",
    angleDeg: 0,
    timeSec: round(referenceSec, 4)
  });

  const cutCIn = M.stations.sawSquare.xIn - component.finishedLengthIn;
  const cutIndexDistanceIn = Math.abs(cutCIn - currentCIn);
  const cutIndexSec = xIndexTimeSec(cutIndexDistanceIn);
  tIndexSec += cutIndexSec;
  operations.push({
    sequence: operations.length + 1,
    opId: component.componentId + ":INDEX-CUT",
    kind: "INDEX",
    purpose: "POSITION_FINISHED_CUT",
    fromCIn: round(currentCIn, 6),
    toCIn: round(cutCIn, 6),
    distanceIn: round(cutIndexDistanceIn, 6),
    timeSec: round(cutIndexSec, 4)
  });
  currentCIn = cutCIn;

  const finishedCutSec = sawCycleSec(item.actualW, 0);
  tSawSec += finishedCutSec;
  operations.push({
    sequence: operations.length + 1,
    opId: component.componentId + ":CUT",
    kind: "CROSSCUT",
    stationId: M.stations.sawSquare.id,
    finishedLengthIn: round(component.finishedLengthIn, 6),
    angleDeg: 0,
    timeSec: round(finishedCutSec, 4)
  });

  for (const feature of component.features) {
    const startXIn = 0;
    const millCIn = M.stations.millLong.xIn - startXIn;
    const millIndexDistanceIn = Math.abs(millCIn - currentCIn);
    const millIndexSec = xIndexTimeSec(millIndexDistanceIn);
    tIndexSec += millIndexSec;
    operations.push({
      sequence: operations.length + 1,
      opId: feature.featureId + ":INDEX",
      kind: "INDEX",
      purpose: "POSITION_LONGITUDINAL_MILL",
      fromCIn: round(currentCIn, 6),
      toCIn: round(millCIn, 6),
      distanceIn: round(millIndexDistanceIn, 6),
      timeSec: round(millIndexSec, 4)
    });
    currentCIn = millCIn;
    tMillSec += feature.timing.totalSec;
    operations.push({
      sequence: operations.length + 1,
      opId: feature.featureId || component.componentId + ":MILL",
      kind: "MILL_LONGITUDINAL_PROFILE",
      stationId: M.stations.millLong.id,
      componentId: component.componentId,
      pathLengthIn: feature.timing.pathLengthIn,
      yIn: feature.timing.yIn,
      totalDepthIn: feature.timing.totalDepthIn,
      passes: feature.timing.passes,
      cuttingFeedInPerMin: feature.timing.cuttingFeedInPerMin,
      cutPerPassSec: feature.timing.cutPerPassSec,
      passReturnSec: feature.timing.passReturnSec,
      yPositionSec: feature.timing.yPositionSec,
      timeSec: feature.timing.totalSec
    });
  }

  const tMachineSec =
    M.handling.loadSeatSec +
    tReferenceSec +
    tIndexSec +
    tSawSec +
    tMillSec +
    M.handling.releaseLabelSec;

  return {
    componentId: component.componentId,
    requirementId: component.requirementId,
    storeSku: item.storeSku,
    operations,
    time: {
      T_LOAD_SEAT_sec: M.handling.loadSeatSec,
      T_REFERENCE_sec: round(tReferenceSec, 4),
      T_INDEX_sec: round(tIndexSec, 4),
      T_SAW_sec: round(tSawSec, 4),
      T_DRILL_SPOT_sec: 0,
      T_MILL_sec: round(tMillSec, 4),
      T_RELEASE_LABEL_sec: M.handling.releaseLabelSec,
      T_MACHINE_sec: round(tMachineSec, 4),
      T_MACHINE_min: round(tMachineSec / 60, 4)
    }
  };
}

export function evaluateD001DimensionalBatch({ componentRuns = [], storeRevision = null } = {}) {
  const unresolved = [];
  const refused = [];
  const normalized = [];
  const seen = new Set();

  if (!Array.isArray(componentRuns) || componentRuns.length === 0) {
    return unresolvedResult(["DIMENSIONAL_COMPONENT_RUNS_REQUIRED"]);
  }

  for (const run of componentRuns) {
    const item = run?.item || null;
    const parsed = normalizeBatchComponent(run?.component, item);
    unresolved.push(...(parsed.unresolved || []));
    refused.push(...(parsed.refused || []));
    if (parsed.value) {
      if (seen.has(parsed.value.componentId)) unresolved.push("UNIQUE_COMPONENT_ID_REQUIRED");
      seen.add(parsed.value.componentId);
      normalized.push({ component: parsed.value, item });
    }
  }

  if (unresolved.length) return unresolvedResult(unresolved);
  if (refused.length) return refusedResult(refused);

  const plans = normalized.map(({ component, item }) => deriveBatchComponentPlan(component, item));
  const totals = plans.reduce((acc, plan) => {
    for (const key of [
      "T_LOAD_SEAT_sec",
      "T_REFERENCE_sec",
      "T_INDEX_sec",
      "T_SAW_sec",
      "T_DRILL_SPOT_sec",
      "T_MILL_sec",
      "T_RELEASE_LABEL_sec",
      "T_MACHINE_sec"
    ]) {
      acc[key] += Number(plan.time[key] || 0);
    }
    return acc;
  }, {
    T_LOAD_SEAT_sec: 0,
    T_REFERENCE_sec: 0,
    T_INDEX_sec: 0,
    T_SAW_sec: 0,
    T_DRILL_SPOT_sec: 0,
    T_MILL_sec: 0,
    T_RELEASE_LABEL_sec: 0,
    T_MACHINE_sec: 0
  });
  totals.T_MACHINE_min = totals.T_MACHINE_sec / 60;
  totals.T_MACHINE_hr = totals.T_MACHINE_min / 60;

  const rates = storeMachineSellRate();
  const machineService = round(totals.T_MACHINE_hr * rates.sellRatePerHour, 2);
  const governingInput = {
    travelStandard: { id: D001_TRAVEL_STANDARD.id, version: D001_TRAVEL_STANDARD.version },
    storeRevision,
    componentRuns: normalized.map(({ component, item }) => ({
      component,
      offering: {
        storeSku: item.storeSku,
        actualW: item.actualW,
        actualT: item.actualT,
        stockL_in: item.stockL_in
      }
    }))
  };
  const inputHash = calculationHash(governingInput);
  const resultCore = {
    componentCount: plans.length,
    time: Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, round(value, key.endsWith("_hr") ? 6 : 4)])),
    machineService,
    sellRatePerHour: rates.sellRatePerHour,
    componentPlans: plans
  };
  const resultHash = calculationHash({ inputHash, resultCore });

  return {
    status: "BUDGETARY_MACHINE_ESTIMATE",
    complete: true,
    completeness: "COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL",
    standard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version,
      basis: D001_TRAVEL_STANDARD.basis,
      measured: false,
      commissioned: false
    },
    economics: {
      ...D001_TRAVEL_STANDARD.economics,
      ...rates,
      setupCharge: 0,
      setupTimeMin: 0,
      formula: "machine_service = T_MACHINE_hr × STORE_MACHINE_SELL_RATE"
    },
    time: resultCore.time,
    machineService,
    componentPlans: plans,
    calculationIdentity: { inputHash, resultHash },
    not_claimed: [
      "commercial quote",
      "physical fabrication",
      "live motion",
      "measured machine performance",
      "commissioned workholding"
    ]
  };
}
