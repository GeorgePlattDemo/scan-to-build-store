/**
 * S-001 Mode-2 Stage-2 REFERENCE envelope.
 * measured = false. commissioned = false.
 * Does not replace D-001 envelopeCheck. Sheet must not fall through dimensional logic.
 *
 * Declared relationship (issued specification / claims; not commissioned hardware):
 * - vertical tooling assembly remains at machine centerline in X
 * - tooling platform moves vertically / in Y
 * - sheet itself moves along X via servo-controlled manipulating rollers / rotating yokes
 * - router provides the cutting tool; depth is bounded in Z
 * - coordinated sheet-X and tool-Y permit straight and curvilinear 2D profiles
 * - selected attachment points may remain; secondary separation is later
 */
export const S001_MODE2_ENVELOPE = {
  id: "S001-MODE2-STENCIL-V1",
  capabilityId: "SHEET_MODE2_STENCIL_V1",
  basis: "DECLARED_STAGE2_CAPABILITY",
  evidenceClass: "REFERENCE",
  measured: false,
  commissioned: false,
  physicalStatus: "NOT_CLAIMED",
  relationship: {
    toolingX: "vertical tooling assembly remains at machine centerline in X",
    toolingY: "tooling platform moves vertically / in Y",
    sheetX: "sheet itself moves along X via servo-controlled manipulating rollers / rotating yokes",
    tool: "router",
    depthZ: "bounded router depth; not commissioned sensor-controlled Z",
    profiles: "straight and curvilinear two-dimensional profiles",
    stencil: "selected attachment points may remain; secondary separation later",
    not: "Mode 3 moving-tool X/Y carrier-plate architecture; generic CNC router flattening"
  },
  stock: {
    form: "sheet",
    parentW_in: 48,
    parentL_in: 96,
    minBlankIn: 6,
    maxRouteDepthIn: 0.75
  },
  profileKinds: ["STRAIGHT_RECT", "CURVILINEAR_OUTLINE"],
  requiredOps: ["ROUTE_PROFILE", "RETAIN_TABS"],
  cellFamily: "S-001"
};

export const SHEET_MODE2_PROFILE_KINDS = S001_MODE2_ENVELOPE.profileKinds;

export function evaluateSheetMode2(item, req = {}) {
  const reasons = [];
  const unresolved = [];
  const env = S001_MODE2_ENVELOPE;

  if (!item) {
    return { status: "REFUSED", reasons: ["NO_OFFERING"], unresolved, envelope: env.id, capabilityId: env.capabilityId };
  }
  if (item.form !== "sheet") {
    return {
      status: "REFUSED",
      reasons: ["SHEET_MODE2_NOT_DIMENSIONAL", `FORM_${String(item.form).toUpperCase()}`],
      unresolved,
      envelope: env.id,
      capabilityId: env.capabilityId
    };
  }

  const family = item.cellFamily || [];
  if (family.length && !family.includes("S-001")) reasons.push("CELL_FAMILY_NOT_S001");

  const have = new Set(item.supportedOps || []);
  const missing = env.requiredOps.filter((op) => !have.has(op));
  if (missing.length) reasons.push(`OP_NOT_ON_OFFERING:${missing.join(",")}`);

  const kind = req.profileKind;
  if (!kind) unresolved.push("PROFILE_KIND_MISSING");
  else if (!env.profileKinds.includes(kind)) reasons.push("PROFILE_KIND_UNSUPPORTED");

  const L = req.blankL_in;
  const W = req.blankW_in;
  if (L == null || W == null) unresolved.push("BLANK_SIZE_MISSING");
  else if (!(Number.isFinite(L) && Number.isFinite(W))) unresolved.push("BLANK_SIZE_NOT_NUMERIC");
  else {
    if (L < env.stock.minBlankIn || W < env.stock.minBlankIn) reasons.push("BLANK_BELOW_REFERENCE_MINIMUM");
    const parentW = item.sheetW_in ?? env.stock.parentW_in;
    const parentL = item.sheetL_in ?? env.stock.parentL_in;
    if (L > parentL || W > parentW) reasons.push("BLANK_EXCEEDS_PARENT_SHEET");
  }

  const tabs = req.tabCount;
  if (tabs == null) unresolved.push("TAB_COUNT_MISSING");
  else if (!Number.isInteger(tabs) || tabs < 1) reasons.push("STENCIL_TABS_REQUIRED");

  if (req.routeDepthIn == null) unresolved.push("ROUTE_DEPTH_UNRESOLVED");
  else if (!Number.isFinite(req.routeDepthIn) || req.routeDepthIn <= 0) reasons.push("ROUTE_DEPTH_INVALID");
  else {
    if (req.routeDepthIn > env.stock.maxRouteDepthIn) reasons.push("ROUTE_DEPTH_EXCEEDS_REFERENCE_ENVELOPE");
    if (item.actualT != null && req.routeDepthIn > item.actualT) reasons.push("ROUTE_DEPTH_EXCEEDS_STOCK_THICKNESS");
  }

  if (req.spline || req.toolpath || req.gcode || req.controller) {
    reasons.push("MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED");
  }

  if (reasons.length) {
    return { status: "REFUSED", reasons, unresolved, envelope: env.id, capabilityId: env.capabilityId };
  }
  if (unresolved.length) {
    return { status: "UNRESOLVED", reasons, unresolved, envelope: env.id, capabilityId: env.capabilityId };
  }
  return {
    status: "SUPPORTABLE",
    reasons: [],
    unresolved: [],
    envelope: env.id,
    capabilityId: env.capabilityId,
    evidenceClass: "REFERENCE",
    physicalStatus: "NOT_CLAIMED",
    measured: false,
    commissioned: false,
    profileKind: kind,
    secondarySeparation: "OPERATOR_OR_LATER — not claimed automated"
  };
}

export function sheetMode2NeutralOps(req = {}) {
  return [
    "LOAD",
    "SEAT",
    "REGISTER",
    "ROUTE_PROFILE",
    req.tabCount ? "RETAIN_TABS" : null,
    "RELEASE",
    "SECONDARY_SEPARATION",
    "LABEL"
  ].filter(Boolean);
}
