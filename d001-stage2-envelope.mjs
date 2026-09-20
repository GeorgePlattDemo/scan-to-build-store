/**
 * D-001 Stage-2 machine-readable envelope
 * DECLARED_STAGE2_CAPABILITY. measured = false. commissioned = false.
 * Numbers exist to exercise fit → ops → minutes → Q. They do not pre-commit Stage-3 iron.
 */
export const D001_STAGE2_ENVELOPE = {
  id: "D001-STAGE2-ENVELOPE-0.4",
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
    maxParentLengthIn: 192,
    support: {
      infeedRollerLengthIn: 168,
      outfeedRollerLengthIn: 168,
      basis: "DECLARED_TEST_MACHINE_REFERENCE",
      measured: false,
      commissioned: false,
      note: "Store Zero test-machine support declaration. All current dimensional-lumber catalog parents through 16 ft are inside the declared parent-stock envelope."
    },
    presentation: {
      defaultMode: "WIDE_FACE_ON_TABLE_NARROW_EDGE_TO_FENCE",
      defaultRule: "Dimensional lumber runs with the wide face on the table/base and the narrow edge to the fence.",
      edgeException: {
        nominalT: 2,
        nominalW: 4,
        mode: "NARROW_FACE_ON_TABLE_WIDE_FACE_TO_FENCE",
        allowedOps: ["CROSSCUT", "MITER_LIMITED"],
        rule: "Nominal 2x4 is the only declared lumber member that may run on its narrow face with the 3.5 in face against the fence."
      }
    }
  },
  cutoffControl: {
    id: "D001-CUTOFF-HOLD-0.1",
    basis: "DECLARED_TEST_MACHINE_REFERENCE",
    measured: false,
    commissioned: false,
    retainedTailIn: 24,
    kerfIn: 0.125,
    sawToNearestRotorCenterIn: 24,
    rule: "RETAINED_DRIVEN_STOCK_GE_NEAREST_ROTOR_CENTER",
    note: "The 24 in value constrains the retained driven parent after a cutoff. It is not a minimum finished-part length."
  },
  saw: {
    id: "D001-DOWNSTROKE-MITER-CROSSCUT-0.1",
    architecture: "FIXED_STATION_DOWNSTROKE_MITER_CROSSCUT",
    bladeDiameterIn: 20,
    strokeDirection: "DOWN",
    forceIntent: "cutting reaction resolves downward into table and rearward toward fence",
    miterPlane: "FACE",
    miterAbsMaxDeg: 45,
    maxMiterStockWidthIn: 7.25,
    maxMiterStockThicknessIn: 3.5,
    bevelAxis: "NOT_DECLARED",
    compoundMiter: false,
    workholding: {
      positiveHoldDownRequired: true,
      fenceRestraintRequired: true,
      clampsBeforeSawMotion: true,
      clampActuation: "STAGE3_UNRESOLVED",
      clampPressure: "STAGE3_UNRESOLVED"
    }
  },
  motion: {
    FEED_X_MAX_LOADED_IN_PER_MIN: 480,
    MILL_CUTTING_FEED_IN_PER_MIN: 48,
    Y_MILL_TRAVEL_MAX_IN: 14.0,
    note: "14 in is tool travel. 12 in is max stock width. Do not equate them."
  },
  stations: {
    "SAW-L": { xIn: 0, role: "20 in fixed-station downstroke miter/crosscut" },
    R1: { xIn: 24, role: "manipulating roller" },
    MILL_LONG: { xIn: 36, role: "longitudinal mill between R1 and R2" },
    R2: { xIn: 48, role: "manipulating roller" },
    "SAW-R": { xIn: 72, role: "20 in fixed-station downstroke miter/crosscut" },
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
    "third router/drill on a vertical way",
    "DRILL diameter / depth / location envelope",
    "final physical design and commissioning of the declared infeed/outfeed roller support",
    "whether an independently loaded short parent may run on one roller"
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

  const presentation = req.workpiecePresentation ?? e.presentation.defaultMode;
  const edgeMode = e.presentation.edgeException.mode;
  const defaultMode = e.presentation.defaultMode;
  const edgePresented = presentation === edgeMode;
  const isNominal2x4 = item.nominalT === e.presentation.edgeException.nominalT &&
    item.nominalW === e.presentation.edgeException.nominalW;

  if (presentation !== defaultMode && presentation !== edgeMode) reasons.push("WORKPIECE_PRESENTATION_NOT_DECLARED");
  if (edgePresented && !isNominal2x4) reasons.push("EDGE_PRESENTATION_RESERVED_FOR_NOMINAL_2X4");
  if (edgePresented && ops.some((op) => !e.presentation.edgeException.allowedOps.includes(op))) reasons.push("EDGE_PRESENTATION_OPERATION_NOT_DECLARED");

  const presentedW = edgePresented ? t : w;
  const presentedT = edgePresented ? w : t;

  if (presentedW != null && presentedW > e.maxWidthIn) reasons.push("STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE");
  if (presentedW != null && presentedW < e.minWidthIn) reasons.push("STOCK_WIDTH_BELOW_D001_STAGE2_ENVELOPE");
  if (L != null && L > e.maxParentLengthIn) reasons.push("PARENT_LENGTH_EXCEEDS_DECLARED_D001_SUPPORT");

  const needsMill = ops.some((op) =>
    ["MILL_LONGITUDINAL_PROFILE", "MILL_END_PROFILE", "DADO", "GROOVE", "RABBET"].includes(op)
  );
  const maxT = needsMill ? e.maxThicknessMillIn : e.maxThicknessSawIn;
  if (presentedT != null && presentedT > maxT) reasons.push("STOCK_THICKNESS_EXCEEDS_D001_STAGE2_ENVELOPE");
  if (presentedT != null && presentedT < e.minThicknessIn) reasons.push("STOCK_THICKNESS_BELOW_D001_STAGE2_ENVELOPE");

  if (req.retainedTailIn != null && req.retainedTailIn < D001_STAGE2_ENVELOPE.cutoffControl.retainedTailIn) reasons.push("LAST_REMAIN_BELOW_ROTOR_SAW_CENTER");
  if (req.millYIn != null && req.millYIn > D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN) {
    reasons.push("MILL_Y_EXCEEDS_TOOL_TRAVEL");
  }
  if (req.millDepthIn != null && req.millDepthIn > 0) {
    /* passes derived; depth itself may exceed one pass */
  }

  if (ops.includes("MITER_LIMITED")) {
    const saw = D001_STAGE2_ENVELOPE.saw;
    const angle = req.miterAngleDeg;
    const plane = req.miterPlane ?? "FACE";
    const bevel = req.bevelAngleDeg ?? 0;
    if (!Number.isFinite(angle)) reasons.push("MITER_ANGLE_REQUIRED");
    else if (Math.abs(angle) > saw.miterAbsMaxDeg) reasons.push("MITER_ANGLE_EXCEEDS_D001_STAGE2_ENVELOPE");
    if (plane !== saw.miterPlane) reasons.push("MITER_PLANE_NOT_SUPPORTED");
    if (Number(bevel) !== 0) reasons.push("BEVEL_OR_COMPOUND_MITER_NOT_DECLARED");
    if (presentedW != null && presentedW > saw.maxMiterStockWidthIn) reasons.push("MITER_STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE");
    if (presentedT != null && presentedT > saw.maxMiterStockThicknessIn) reasons.push("MITER_STOCK_THICKNESS_EXCEEDS_D001_STAGE2_ENVELOPE");
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
      millPasses: millPassesForDepth(req.millDepthIn || 0),
      workpiecePresentation: presentation,
      presentedWidthIn: presentedW ?? null,
      presentedThicknessIn: presentedT ?? null,
      cutoffControl: D001_STAGE2_ENVELOPE.cutoffControl.id
    }
  };
}
