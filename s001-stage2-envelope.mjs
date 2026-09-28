/**
 * S-001 Stage-2 reference envelope: the sheet cell and the yard panel saw.
 * Declared capability. measured = false. commissioned = false. Not Cycle Start. Not generic CNC.
 *
 * Human copy: S-001-STAGE2-ENVELOPE-0.1.md. Every number here is a Stage-2 fixture assumption.
 * Sheet work never falls through D-001 dimensional logic, and D-001 never accepts a sheet.
 *
 * Two stations carry sheet work:
 *
 *   S001-ROUTER  the Mode-2 sheet cell. The tooling stays at the machine centerline in X; the tooling
 *                platform moves in Y; the sheet itself moves in X under servo-driven manipulating rollers.
 *                Coordinated sheet-X and tool-Y routing makes straight and curvilinear profiles inside one
 *                centered working field. Routed pieces stay attached to the sheet by tabs.
 *
 *   YARD-PANEL-SAW  a vertical panel saw in the yard, run by a yard operator to a measured line.
 *                   It makes the straight full-width crosscuts and rips already declared on sheet
 *                   offerings (CROSSCUT, RIP). It runs after routing, so the sheet stays whole and
 *                   registered while it is routed.
 */
export const S001_STAGE2_ENVELOPE = Object.freeze({
  id: "S001-STAGE2-ENVELOPE-0.1",
  cellFamily: "S-001",
  basis: "DECLARED_STAGE2_CAPABILITY",
  evidenceClass: "REFERENCE",
  measured: false,
  commissioned: false,
  physicalStatus: "NOT_CLAIMED",
  relationship: Object.freeze({
    toolingX: "vertical tooling assembly remains at the machine centerline in X",
    toolingY: "tooling platform moves vertically / in Y",
    sheetX: "the sheet itself moves along X under servo-driven manipulating rollers / rotating yokes",
    tool: "router",
    depthZ: "bounded router depth; not commissioned sensor-controlled Z",
    profiles: "straight and curvilinear two-dimensional profiles",
    stencil: "routed pieces stay attached by tabs; the owner separates them later",
    not: "Mode 3 moving-tool X/Y carrier-plate architecture; generic CNC router flattening"
  }),
  // Parent sheet, as loaded: long axis = machine X (0 at the left end), short axis = machine Y (0 at the bottom).
  stock: Object.freeze({
    form: "sheet",
    parentLengthIn: 96,
    parentWidthIn: 48,
    maxThicknessIn: 0.75,
    minThicknessIn: 0.25
  }),
  // Everything the router touches stays inside this centered field. There is no edge-routing exception.
  workField: Object.freeze({
    id: "S001-CENTER-WORK-FIELD-V0",
    placement: "CENTERED_ON_PARENT",
    horizontalSpanIn: 48,
    verticalSpanIn: 36,
    containment: "WHOLE_PROFILE",
    edgeWork: "REFUSED_OUTSIDE_FIELD"
  }),
  router: Object.freeze({
    station: "S001-ROUTER",
    toolDiameterIn: 0.25,
    passDepthIn: 0.5,
    routeFeedInPerMin: 60,
    plungeRetractSec: 10,
    tabLiftSec: 2,
    loadSeatReferenceSec: 120,
    releaseUnloadSec: 60,
    minRoutedFeatureIn: 6,
    minSplitPieceWidthIn: 3,
    toolPath: "CENTERED_ON_THE_DEFINED_LINE"
  }),
  panelSaw: Object.freeze({
    station: "YARD-PANEL-SAW",
    kerfIn: 0.125,
    setAndAlignSec: 45,
    cutFeedInPerMin: 150,
    minPieceIn: 6,
    minClearanceToRoutedFeatureIn: 1,
    runsAfterRouting: true
  }),
  label: Object.freeze({ perPieceSec: 10 }),
  // Stage 2 uses the one declared Store Zero machine-hour basis for every station (see d001-travel-standard.mjs
  // economics). S-001 has no separate measured economics.
  economicsBasis: "STB-D001-STORE-ECONOMICS-S2-0.1",
  featureKinds: Object.freeze(["ARCHED_APERTURE", "STRAIGHT_SPLIT", "CROSSCUT"]),
  requiredOps: Object.freeze({
    ARCHED_APERTURE: "ROUTE_PROFILE",
    STRAIGHT_SPLIT: "ROUTE_PROFILE",
    CROSSCUT: "CROSSCUT"
  }),
  machineLocalLanguage: Object.freeze(["spline", "toolpath", "gcode", "controller", "servoSteps"]),
  notClaimed: Object.freeze([
    "physical workholding or measured tab retention",
    "commissioned sheet cell",
    "measured feeds or cycle time",
    "Cycle Start",
    "exterior rating unless the sheet is sold as exterior"
  ])
});

// Where a sheet feature sits on the parent. The centered field is fixed by the parent size.
export function centeredField(parentLengthIn, parentWidthIn, field = S001_STAGE2_ENVELOPE.workField) {
  return {
    x0: (parentLengthIn - field.horizontalSpanIn) / 2,
    x1: (parentLengthIn + field.horizontalSpanIn) / 2,
    y0: (parentWidthIn - field.verticalSpanIn) / 2,
    y1: (parentWidthIn + field.verticalSpanIn) / 2
  };
}
