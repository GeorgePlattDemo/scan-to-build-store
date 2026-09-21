/**
 * D-001 Stage-2 machine-readable envelope
 * DECLARED_STAGE2_CAPABILITY. measured = false. commissioned = false.
 * Numbers exist to exercise fit → ops → minutes → Q. They do not authorize live motion.
 */
export const D001_STAGE2_ENVELOPE = {
  id: "D001-STAGE2-ENVELOPE-0.3",
  basis: "DECLARED_STAGE2_CAPABILITY",
  measured: false,
  commissioned: false,
  axes: {
    X: "along fence / workpiece feed",
    Y: "perpendicular to fence / across width",
    Z: "vertical tool engagement / depth",
    fenceY: 0,
    tableZ: 0
  },
  base: {
    lengthIn: 72,
    note: "Stage-2 fixture base geometry only. This is not a required stock length or project workpiece length."
  },
  stock: {
    maxWidthIn: 12.0,
    minWidthIn: 1.5,
    minThicknessIn: 0.75,
    maxThicknessSawIn: 3.5,
    maxThicknessMillIn: 1.5,
    maxParentLengthWithoutExternalSupportIn: 96,
    minControlledLengthIn: 24,
    externalSupport: "UNRESOLVED"
  },
  saw: {
    motion: "DOWNSTROKE",
    miter: {
      operation: "MITER_LIMITED",
      plane: "SINGLE_PLANE_FACE",
      minDeg: 0,
      maxDeg: 45,
      compound: false
    }
  },
  spot: {
    operation: "SPOT_ON_LOCATION",
    mode: "SPOT_ON_LOCATION",
    toolDiameterIn: 0.1875,
    toolDiameterLabel: "3/16 in",
    locationRule: "CENTERED_ON_PART",
    acrossWidthRule: "CENTERED_ON_WIDE_FACE",
    depthClaimed: false,
    note: "Declared fixed 3/16 in spot/pilot tool. This is not a generic finished-hole envelope."
  },
  motion: {
    FEED_X_MAX_LOADED_IN_PER_MIN: 480,
    MILL_CUTTING_FEED_IN_PER_MIN: 48,
    Y_MILL_TRAVEL_MAX_IN: 14.0,
    note: "14 in is tool travel. 12 in is max stock width. Do not equate them."
  },
  stations: {
    "SAW-L": { xIn: 0, role: "infeed-end downstroke chop / single-plane miter 0–45 deg" },
    R1: { xIn: 24, role: "manipulating roller" },
    MILL_LONG: { xIn: 36, role: "longitudinal mill between R1 and R2" },
    R2: { xIn: 48, role: "manipulating roller" },
    "SAW-R": { xIn: 72, role: "outfeed-end downstroke square chop" },
    MILL_END: { xIn: -6, role: "end mill outside roller interference" }
  },
  exclusion: ["R1", "R2", "SAW-L", "SAW-R"],
  millLong: {
    maxProfileLengthIn: 60,
    maxDepthPerPassIn: 0.375,
    maxCutWidthIn: 1.0
  },
  millEnd: {
    reachFromEndIn: 8,
    maxDepthIn: 0.5
  },
  unresolvedNamed: [
    "third manipulating roller (patent 504 is three; Stage-2 fixture names two)",
    "radial-arm vs second chop as distinct saw types",
    "third router/drill on a vertical way",
    "generic DRILL diameter / depth / location beyond the declared 3/16 SPOT_ON_LOCATION operation",
    "unsupported overhang geometry",
    "whether a short part may run on one roller"
  ]
};

export function millPassesForDepth(totalDepthIn) {
  if (!totalDepthIn || totalDepthIn <= 0) return 1;
  return Math.ceil(totalDepthIn / D001_STAGE2_ENVELOPE.millLong.maxDepthPerPassIn);
}

function finiteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function envelopeCheck(item, req = {}) {
  const reasons = [];
  const unresolved = [];
  if (!item) return { status: "REFUSED", reasons: ["NO_OFFERING"], unresolved, envelope: D001_STAGE2_ENVELOPE.id };
  if (item.form === "sheet") {
    return { status: "REFUSED", reasons: ["SHEET_NOT_D001"], unresolved, envelope: D001_STAGE2_ENVELOPE.id };
  }
  if (item.form === "hardware") {
    return { status: "SOURCED", reasons: [], unresolved, envelope: D001_STAGE2_ENVELOPE.id };
  }

  const w = item.actualW;
  const t = item.actualT;
  const L = item.stockL_in;
  const e = D001_STAGE2_ENVELOPE.stock;
  const ops = req.requiredOps || [];

  if (w != null && w > e.maxWidthIn) reasons.push("STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE");
  if (w != null && w < e.minWidthIn) reasons.push("STOCK_WIDTH_BELOW_D001_STAGE2_ENVELOPE");
  if (L != null && L > e.maxParentLengthWithoutExternalSupportIn) {
    reasons.push("PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT");
  }

  const needsMill = ops.some((op) =>
    ["MILL_LONGITUDINAL_PROFILE", "MILL_END_PROFILE", "DADO", "GROOVE", "RABBET"].includes(op)
  );
  const maxT = needsMill ? e.maxThicknessMillIn : e.maxThicknessSawIn;
  if (t != null && t > maxT) reasons.push("STOCK_THICKNESS_EXCEEDS_D001_STAGE2_ENVELOPE");
  if (t != null && t < e.minThicknessIn) reasons.push("STOCK_THICKNESS_BELOW_D001_STAGE2_ENVELOPE");

  if (req.keptLengthIn != null && req.keptLengthIn < e.minControlledLengthIn) {
    reasons.push("KEPT_LENGTH_BELOW_TWO_ROLLER_CONTROL");
  }
  if (req.millYIn != null && req.millYIn > D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN) {
    reasons.push("MILL_Y_EXCEEDS_TOOL_TRAVEL");
  }

  if (ops.includes("MITER_LIMITED")) {
    const angle = finiteNumber(req.sawAngleDeg);
    if (angle == null) {
      unresolved.push("MITER_ANGLE_REQUIRED");
    } else if (
      angle < D001_STAGE2_ENVELOPE.saw.miter.minDeg ||
      angle > D001_STAGE2_ENVELOPE.saw.miter.maxDeg
    ) {
      reasons.push("MITER_ANGLE_OUTSIDE_D001_STAGE2_ENVELOPE");
    }
    if (req.cutPlane != null && req.cutPlane !== "miter-face") {
      reasons.push("MITER_PLANE_NOT_DECLARED");
    }
  }

  if (ops.includes("DRILL")) {
    unresolved.push("GENERIC_DRILL_ENVELOPE_NOT_DECLARED_BEYOND_SPOT");
  }

  const spot = req.spotDemand;
  if (spot && spot.required !== false) {
    if (spot.mode !== D001_STAGE2_ENVELOPE.spot.mode) {
      reasons.push("SPOT_MODE_NOT_DECLARED");
    }
    if (spot.locationRule !== D001_STAGE2_ENVELOPE.spot.locationRule) {
      reasons.push("SPOT_LOCATION_RULE_NOT_DECLARED");
    }
    if (spot.acrossWidthRule !== D001_STAGE2_ENVELOPE.spot.acrossWidthRule) {
      reasons.push("SPOT_ACROSS_WIDTH_RULE_NOT_DECLARED");
    }
    const along = finiteNumber(spot.locationAlongLengthIn);
    if (along == null) {
      unresolved.push("SPOT_LOCATION_REQUIRED");
    } else if (
      along < 0 ||
      (finiteNumber(req.keptLengthIn) != null && along > Number(req.keptLengthIn))
    ) {
      reasons.push("SPOT_LOCATION_OUTSIDE_WORKPIECE");
    }
  }

  const have = new Set(item.supportedOps || []);
  const missing = ops.filter((op) => !have.has(op));
  if (missing.length) reasons.push(`OP_NOT_ON_OFFERING:${missing.join(",")}`);

  const family = item.cellFamily || [];
  if (family.length && !family.includes("D-001")) reasons.push("CELL_FAMILY_NOT_D001");

  const status = reasons.length ? "REFUSED" : unresolved.length ? "UNRESOLVED" : "SUPPORTABLE";
  return {
    status,
    reasons,
    unresolved,
    envelope: D001_STAGE2_ENVELOPE.id,
    derived: {
      millPasses: millPassesForDepth(req.millDepthIn || 0),
      miter:
        ops.includes("MITER_LIMITED")
          ? {
              requestedDeg: finiteNumber(req.sawAngleDeg),
              minDeg: D001_STAGE2_ENVELOPE.saw.miter.minDeg,
              maxDeg: D001_STAGE2_ENVELOPE.saw.miter.maxDeg,
              motion: D001_STAGE2_ENVELOPE.saw.motion
            }
          : null,
      spot:
        spot && spot.required !== false
          ? {
              mode: D001_STAGE2_ENVELOPE.spot.mode,
              toolDiameterIn: D001_STAGE2_ENVELOPE.spot.toolDiameterIn,
              depthClaimed: false
            }
          : null
    }
  };
}
