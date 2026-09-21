/**
 * D-001 Stage-2 machine-readable envelope
 * DECLARED_STAGE2_CAPABILITY. measured = false. commissioned = false.
 * Numbers exist to exercise fit → ops → minutes → Q. They do not pre-commit Stage-3 iron.
 */
export const D001_STAGE2_ENVELOPE = {
  id: "D001-STAGE2-ENVELOPE-0.2",
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
    note: "Stage-2 fixture base length. Patent correspondence: central base 501."
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
  motion: {
    FEED_X_MAX_LOADED_IN_PER_MIN: 480,
    MILL_CUTTING_FEED_IN_PER_MIN: 48,
    Y_MILL_TRAVEL_MAX_IN: 14.0,
    note: "14 in is tool travel. 12 in is max stock width. Do not equate them."
  },
  stations: {
    "SAW-L": { xIn: 0, role: "infeed-end chop / limited miter" },
    R1: { xIn: 24, role: "manipulating roller" },
    MILL_LONG: { xIn: 36, role: "longitudinal mill between R1 and R2" },
    R2: { xIn: 48, role: "manipulating roller" },
    "SAW-R": { xIn: 72, role: "outfeed-end square chop" },
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
    "MITER_LIMITED numeric angle range",
    "DRILL diameter / depth / location envelope",
    "unsupported overhang geometry",
    "whether a short part may run on one roller"
  ]
};

export function millPassesForDepth(totalDepthIn) {
  if (!totalDepthIn || totalDepthIn <= 0) return 1;
  return Math.ceil(totalDepthIn / D001_STAGE2_ENVELOPE.millLong.maxDepthPerPassIn);
}

export function envelopeCheck(item, req = {}) {
  const reasons = [];
  if (!item) return { status: "REFUSED", reasons: ["NO_OFFERING"], envelope: D001_STAGE2_ENVELOPE.id };
  if (item.form === "sheet") {
    return { status: "REFUSED", reasons: ["SHEET_NOT_D001"], envelope: D001_STAGE2_ENVELOPE.id };
  }
  if (item.form === "hardware") {
    return { status: "SOURCED", reasons: [], envelope: D001_STAGE2_ENVELOPE.id };
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
  if (req.millDepthIn != null && req.millDepthIn > 0) {
    /* passes derived; depth itself may exceed one pass */
  }

  const have = new Set(item.supportedOps || []);
  const missing = ops.filter((op) => !have.has(op));
  if (missing.length) reasons.push(`OP_NOT_ON_OFFERING:${missing.join(",")}`);

  const family = item.cellFamily || [];
  if (family.length && !family.includes("D-001")) reasons.push("CELL_FAMILY_NOT_D001");

  return {
    status: reasons.length ? "REFUSED" : "SUPPORTABLE",
    reasons,
    envelope: D001_STAGE2_ENVELOPE.id,
    derived: {
      millPasses: millPassesForDepth(req.millDepthIn || 0)
    }
  };
}
