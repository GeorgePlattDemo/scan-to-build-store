/**
 * D-001 five-tool dimensional reference capability.
 *
 * This is a bounded Stage-2 REFERENCE model. It does not claim installed or
 * commissioned machinery. User/Store semantics remain part-relative; station
 * coordinates, controller language, feed/speed, and Cycle Start stay machine-local.
 */
import { D001_STAGE2_ENVELOPE, envelopeCheck } from "./d001-stage2-envelope.mjs";

export const D001_FIVE_TOOL_REFERENCE = Object.freeze({
  id: "D001-FIVE-TOOL-REFERENCE-0.1",
  capabilityId: "D001_FEATURED_BOARD_V0",
  evidenceClass: "REFERENCE",
  physicalStatus: "NOT_CLAIMED",
  measured: false,
  commissioned: false,
  fixedSawFunctions: Object.freeze(["SAW-L", "SAW-R"]),
  setupToolLimit: 5,
  setupRule: "Tool changes are setup/changeover events; jobs use only the declared homed configuration.",
  pilotDiameterIn: 0.1875,
  pilotDepthPolicy: "MACHINE_CONFIGURED_STARTER_DEPTH",
  tools: Object.freeze({
    T1: Object.freeze({
      role: "CENTER_HORIZONTAL_ROUTER",
      xOffsetFromBaseCenterIn: -3,
      offsetStatus: "REFERENCE_PACKAGING_ASSUMPTION",
      motion: Object.freeze(["VERTICAL_POSITION", "IN_OUT_PLUNGE"]),
      featureFamilies: Object.freeze(["EDGE_NOTCH"]),
    }),
    T2: Object.freeze({
      role: "CENTER_TRANSVERSE_ROUTER_FROM_BELOW",
      xOffsetFromBaseCenterIn: 3,
      offsetStatus: "REFERENCE_PACKAGING_ASSUMPTION",
      motion: Object.freeze(["ACROSS_STOCK", "CONTROLLED_DEPTH"]),
      featureFamilies: Object.freeze(["DADO", "TRANSVERSE_GROOVE"]),
    }),
    T3: Object.freeze({
      role: "END_ROUTER",
      location: "END_STATION",
      plungeRequired: false,
      featureFamilies: Object.freeze(["ROUTED_END"]),
    }),
    T4: Object.freeze({
      role: "VERTICAL_PILOT_DRILL",
      fixedDiameterIn: 0.1875,
      featureFamilies: Object.freeze(["PILOT_FACE_3_16"]),
    }),
    T5: Object.freeze({
      role: "HORIZONTAL_PILOT_DRILL",
      fixedDiameterIn: 0.1875,
      featureFamilies: Object.freeze(["PILOT_EDGE_3_16"]),
    }),
  }),
  publishedReferenceLimits: Object.freeze({
    maxStockWidthIn: D001_STAGE2_ENVELOPE.stock.maxWidthIn,
    maxMillStockThicknessIn: D001_STAGE2_ENVELOPE.stock.maxThicknessMillIn,
    maxTransverseTravelIn: D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN,
    maxDadoWidthIn: D001_STAGE2_ENVELOPE.millLong.maxCutWidthIn,
    maxDadoDepthIn: D001_STAGE2_ENVELOPE.millLong.maxDepthPerPassIn,
    maxMiterAngleAbsDeg: D001_STAGE2_ENVELOPE.saw.miterAbsMaxDeg,
    maxMiterStockWidthIn: D001_STAGE2_ENVELOPE.saw.maxMiterStockWidthIn,
  }),
  unresolved: Object.freeze([
    "T1 horizontal-router notch travel/depth envelope",
    "T3 end-router profile envelope",
    "pilot-hole physical starter depth",
    "final tool offsets after component selection / packaging review",
  ]),
});

const FORBIDDEN_MACHINE_FIELDS = Object.freeze([
  "gcode",
  "controller",
  "toolNumber",
  "stationXIn",
  "feedRate",
  "feedInPerMin",
  "spindleRpm",
  "cycleStart",
]);

const FEATURE_TOOL_REFERENCE = Object.freeze({
  DADO: "T2",
  TRANSVERSE_GROOVE: "T2",
  PILOT_FACE_3_16: "T4",
  PILOT_EDGE_3_16: "T5",
  ANGLED_END_SINGLE_PLANE: "SAW-L/SAW-R",
  EDGE_NOTCH: "T1",
  ROUTED_END: "T3",
});

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function featureResult(feature, toolSlot, status, reasons = [], derived = {}) {
  return {
    kind: feature?.kind ?? null,
    featureId: feature?.featureId ?? null,
    toolSlot,
    status,
    reasons,
    derived,
  };
}

function machineLanguageReasons(feature) {
  if (!feature || typeof feature !== "object" || Array.isArray(feature)) return [];
  return FORBIDDEN_MACHINE_FIELDS.filter((key) => feature[key] != null)
    .map((key) => `MACHINE_LOCAL_FIELD_NOT_ACCEPTED:${key}`);
}

function evaluateDado(feature, item, keptLengthIn) {
  const reasons = machineLanguageReasons(feature);
  if (reasons.length) return featureResult(feature, "T2", "REFUSED", reasons);
  if (!finitePositive(feature.xFromLeftIn)) reasons.push("DADO_X_REQUIRED");
  if (!finitePositive(feature.widthIn)) reasons.push("DADO_WIDTH_REQUIRED");
  if (!finitePositive(feature.depthIn)) reasons.push("DADO_DEPTH_REQUIRED");
  if ((feature.extent ?? "FULL_WIDTH") !== "FULL_WIDTH") reasons.push("DADO_EXTENT_NOT_SUPPORTED");
  if (reasons.length) return featureResult(feature, "T2", "REFUSED", reasons);

  if (feature.xFromLeftIn >= keptLengthIn) reasons.push("DADO_OUTSIDE_FINISHED_LENGTH");
  if (feature.widthIn > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxDadoWidthIn) {
    reasons.push("DADO_WIDTH_EXCEEDS_REFERENCE_ENVELOPE");
  }
  if (feature.depthIn > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxDadoDepthIn) {
    reasons.push("DADO_DEPTH_EXCEEDS_REFERENCE_ENVELOPE");
  }
  if (item.actualW > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxStockWidthIn) {
    reasons.push("DADO_STOCK_WIDTH_EXCEEDS_REFERENCE_ENVELOPE");
  }
  if (item.actualT > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxMillStockThicknessIn) {
    reasons.push("DADO_STOCK_THICKNESS_EXCEEDS_REFERENCE_ENVELOPE");
  }
  if (!new Set(item.supportedOps || []).has("MILL_LONGITUDINAL_PROFILE")) {
    reasons.push("DADO_PARENT_MILL_CAPABILITY_NOT_ON_OFFERING");
  }
  return featureResult(
    feature,
    "T2",
    reasons.length ? "REFUSED" : "SUPPORTABLE",
    reasons,
    {
      xFromLeftIn: feature.xFromLeftIn,
      widthIn: feature.widthIn,
      depthIn: feature.depthIn,
      extent: "FULL_WIDTH",
      processClass: "CENTER_TRANSVERSE_ROUTER",
    },
  );
}

function evaluatePilot(feature, item, keptLengthIn, orientation) {
  const toolSlot = orientation === "FACE" ? "T4" : "T5";
  const reasons = machineLanguageReasons(feature);
  if (reasons.length) return featureResult(feature, toolSlot, "REFUSED", reasons);
  if (feature.diameterIn != null && feature.diameterIn !== D001_FIVE_TOOL_REFERENCE.pilotDiameterIn) {
    reasons.push("PILOT_DIAMETER_FIXED_3_16");
  }
  if (!Number.isFinite(feature.xFromLeftIn) || feature.xFromLeftIn < 0 || feature.xFromLeftIn > keptLengthIn) {
    reasons.push("PILOT_X_OUTSIDE_FINISHED_LENGTH");
  }
  if (orientation === "FACE") {
    if (!Number.isFinite(feature.yFromFenceIn) || feature.yFromFenceIn < 0 || feature.yFromFenceIn > item.actualW) {
      reasons.push("PILOT_Y_OUTSIDE_BOARD_FACE");
    }
  } else if (
    feature.zFromTableIn != null &&
    (!Number.isFinite(feature.zFromTableIn) || feature.zFromTableIn < 0 || feature.zFromTableIn > item.actualT)
  ) {
    reasons.push("PILOT_Z_OUTSIDE_BOARD_EDGE");
  }
  if (!new Set(item.supportedOps || []).has("DRILL")) reasons.push("DRILL_NOT_ON_OFFERING");
  return featureResult(
    feature,
    toolSlot,
    reasons.length ? "REFUSED" : "SUPPORTABLE",
    reasons,
    {
      orientation,
      diameterIn: D001_FIVE_TOOL_REFERENCE.pilotDiameterIn,
      depthPolicy: D001_FIVE_TOOL_REFERENCE.pilotDepthPolicy,
      physicalDepthIn: null,
    },
  );
}

function evaluateFeature(feature, item, keptLengthIn) {
  if (!feature || typeof feature !== "object" || Array.isArray(feature)) {
    return featureResult(feature, null, "REFUSED", ["FEATURE_OBJECT_REQUIRED"]);
  }
  const machineReasons = machineLanguageReasons(feature);
  if (machineReasons.length && FEATURE_TOOL_REFERENCE[feature.kind]) {
    return featureResult(feature, FEATURE_TOOL_REFERENCE[feature.kind], "REFUSED", machineReasons);
  }
  switch (feature.kind) {
    case "DADO":
    case "TRANSVERSE_GROOVE":
      return evaluateDado(feature, item, keptLengthIn);
    case "PILOT_FACE_3_16":
      return evaluatePilot(feature, item, keptLengthIn, "FACE");
    case "PILOT_EDGE_3_16":
      return evaluatePilot(feature, item, keptLengthIn, "EDGE");
    case "ANGLED_END_SINGLE_PLANE": {
      if (!Number.isFinite(feature.angleDeg)) {
        return featureResult(feature, "SAW-L/SAW-R", "REFUSED", ["ANGLE_DEGREES_REQUIRED"]);
      }
      if (feature.angleDeg === 0) {
        return featureResult(feature, "SAW-L/SAW-R", "SUPPORTABLE", [], { processClass: "SQUARE_END" });
      }
      if (Math.abs(feature.angleDeg) > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxMiterAngleAbsDeg) {
        return featureResult(feature, "SAW-L/SAW-R", "REFUSED", ["MITER_ANGLE_EXCEEDS_REFERENCE_ENVELOPE"], {
          angleDeg: feature.angleDeg,
          maxAbsDeg: D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxMiterAngleAbsDeg,
        });
      }
      if (item.actualW > D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxMiterStockWidthIn) {
        return featureResult(feature, "SAW-L/SAW-R", "REFUSED", ["MITER_STOCK_WIDTH_EXCEEDS_REFERENCE_ENVELOPE"], {
          angleDeg: feature.angleDeg,
          maxStockWidthIn: D001_FIVE_TOOL_REFERENCE.publishedReferenceLimits.maxMiterStockWidthIn,
        });
      }
      return featureResult(feature, "SAW-L/SAW-R", "SUPPORTABLE", [], {
        processClass: "FACE_MITER",
        angleDeg: feature.angleDeg,
        miterPlane: D001_STAGE2_ENVELOPE.saw.miterPlane,
        sawArchitecture: D001_STAGE2_ENVELOPE.saw.architecture,
      });
    }
    case "EDGE_NOTCH":
      return featureResult(feature, "T1", "UNRESOLVED", ["HORIZONTAL_ROUTER_ENVELOPE_NOT_PUBLISHED"]);
    case "ROUTED_END":
      return featureResult(feature, "T3", "UNRESOLVED", ["END_ROUTER_ENVELOPE_NOT_PUBLISHED"]);
    default:
      return featureResult(feature, null, "REFUSED", ["FEATURE_KIND_NOT_SUPPORTED"]);
  }
}

export function d001FiveToolNeutralOps(spec = {}) {
  const features = Array.isArray(spec.features) ? spec.features : [];
  return [
    { op: "LOAD" },
    { op: "SEAT_REGISTER" },
    { op: "INDEX_FINISHED_LENGTH", keptLengthIn: spec.keptLengthIn ?? null },
    ...features.map((feature) => {
      switch (feature.kind) {
        case "DADO":
        case "TRANSVERSE_GROOVE":
          return {
            op: "MILL_TRANSVERSE_DADO",
            xFromLeftIn: feature.xFromLeftIn ?? null,
            widthIn: feature.widthIn ?? null,
            depthIn: feature.depthIn ?? null,
            extent: feature.extent ?? "FULL_WIDTH",
          };
        case "PILOT_FACE_3_16":
          return {
            op: "PILOT_BORE",
            orientation: "FACE",
            xFromLeftIn: feature.xFromLeftIn ?? null,
            yFromFenceIn: feature.yFromFenceIn ?? null,
            diameterIn: D001_FIVE_TOOL_REFERENCE.pilotDiameterIn,
          };
        case "PILOT_EDGE_3_16":
          return {
            op: "PILOT_BORE",
            orientation: "EDGE",
            xFromLeftIn: feature.xFromLeftIn ?? null,
            zFromTableIn: feature.zFromTableIn ?? null,
            diameterIn: D001_FIVE_TOOL_REFERENCE.pilotDiameterIn,
          };
        case "ANGLED_END_SINGLE_PLANE":
          return { op: "END_ANGLE", end: feature.end ?? null, angleDeg: feature.angleDeg ?? null };
        case "EDGE_NOTCH":
          return { op: "EDGE_NOTCH", requirement: "PART_RELATIVE" };
        case "ROUTED_END":
          return { op: "ROUTED_END", end: feature.end ?? null, requirement: "PART_RELATIVE" };
        default:
          return { op: "UNSUPPORTED_FEATURE", kind: feature.kind ?? null };
      }
    }),
    { op: "LABEL" },
  ];
}

export function evaluateD001FeaturedBoard(item, spec = {}) {
  if (!item) {
    return {
      status: "REFUSED",
      reasons: ["NO_OFFERING"],
      unresolved: [],
      featureResults: [],
      capabilityId: D001_FIVE_TOOL_REFERENCE.capabilityId,
    };
  }
  const keptLengthIn = spec.keptLengthIn;
  const base = envelopeCheck(item, { requiredOps: ["CROSSCUT"], keptLengthIn });
  if (base.status === "REFUSED") {
    return {
      status: "REFUSED",
      reasons: [...base.reasons],
      unresolved: [],
      featureResults: [],
      capabilityId: D001_FIVE_TOOL_REFERENCE.capabilityId,
      envelope: D001_FIVE_TOOL_REFERENCE.id,
      parentEnvelope: base.envelope,
    };
  }
  if (!Number.isFinite(keptLengthIn)) {
    return {
      status: "UNRESOLVED",
      reasons: [],
      unresolved: ["FINISHED_LENGTH_REQUIRED"],
      featureResults: [],
      capabilityId: D001_FIVE_TOOL_REFERENCE.capabilityId,
      envelope: D001_FIVE_TOOL_REFERENCE.id,
      parentEnvelope: base.envelope,
    };
  }
  if (!Array.isArray(spec.features)) {
    return {
      status: "UNRESOLVED",
      reasons: [],
      unresolved: ["FEATURE_LIST_REQUIRED"],
      featureResults: [],
      capabilityId: D001_FIVE_TOOL_REFERENCE.capabilityId,
      envelope: D001_FIVE_TOOL_REFERENCE.id,
      parentEnvelope: base.envelope,
    };
  }

  const featureResults = spec.features.map((feature) => evaluateFeature(feature, item, keptLengthIn));
  const reasons = featureResults.flatMap((result) =>
    result.status === "REFUSED" ? result.reasons.map((reason) => `${result.kind ?? "UNKNOWN"}:${reason}`) : [],
  );
  const unresolved = featureResults.flatMap((result) =>
    result.status === "UNRESOLVED" ? result.reasons.map((reason) => `${result.kind ?? "UNKNOWN"}:${reason}`) : [],
  );
  const status = reasons.length ? "REFUSED" : unresolved.length ? "UNRESOLVED" : "SUPPORTABLE";
  return {
    status,
    reasons,
    unresolved,
    featureResults,
    capabilityId: D001_FIVE_TOOL_REFERENCE.capabilityId,
    envelope: D001_FIVE_TOOL_REFERENCE.id,
    parentEnvelope: base.envelope,
    evidenceClass: D001_FIVE_TOOL_REFERENCE.evidenceClass,
    physicalStatus: D001_FIVE_TOOL_REFERENCE.physicalStatus,
    measured: false,
    commissioned: false,
    neutralOps: d001FiveToolNeutralOps(spec),
    capabilityGaps: featureResults
      .filter((result) => result.status !== "SUPPORTABLE")
      .map((result) => ({
        featureKind: result.kind,
        featureId: result.featureId,
        status: result.status,
        reasons: result.reasons,
      })),
    not_claimed: [
      "installed five-tool D-001",
      "commissioned machining",
      "measured tolerance",
      "machine approval",
      "G-code",
      "Cycle Start",
    ],
  };
}

export function estimateD001FeaturedBoardMaterial(item, qty = 1) {
  if (!item || item.sellingPrice == null) {
    return { status: "UNRESOLVED", reason: "MISSING_PRICE", jobType: "D001_FEATURED_BOARD_V0" };
  }
  const material = Number((item.sellingPrice * qty).toFixed(2));
  return {
    status: "BUDGETARY_MATERIAL_ONLY",
    jobType: "D001_FEATURED_BOARD_V0",
    material,
    processQ: null,
    processQ_status: "UNRESOLVED",
    Q: material,
    Q_basis: "MATERIAL_FIXTURE_ONLY",
    note: "Budgetary material fixture only. New five-tool process time is unresolved. Not a commercial quote.",
  };
}
