/**
 * Store Zero sheet-package evaluator: SHEET_PACKAGE_V1.
 *
 * A project (System) sends one parent sheet and the features it wants made from it. The evaluator
 * knows nothing about any project. Store Zero picks the sheet offering, checks every feature against
 * the S-001 Stage-2 envelope, plans retention tabs, times the router and the panel saw, prices the
 * sheet and the machine time, and answers SUPPORTABLE, or REFUSED / UNRESOLVED / UNAVAILABLE with
 * named reasons. It never moves, resizes or drops a feature to make the job fit.
 *
 * Definition (machine-neutral, part-relative; X along the sheet's long axis from the left end,
 * Y along the short axis from the bottom edge):
 *   {
 *     configurationId, configurationVersion,
 *     sheet: { thicknessIn, lengthIn, widthIn, species?, grade? },
 *     features: [
 *       { featureId, kind: "ARCHED_APERTURE", placement: "CENTERED", widthIn, straightHeightIn, riseIn,
 *         retain: "TABS", requestedTabCount },
 *       { featureId, kind: "STRAIGHT_SPLIT", within: <ARCHED_APERTURE featureId>, line: "VERTICAL_CENTERLINE" },
 *       { featureId, kind: "CROSSCUT", fromEnd: "LEFT" | "RIGHT", distanceIn }
 *     ],
 *     returnAllPieces: true,
 *     exteriorRatingRequested?: boolean
 *   }
 *
 * Order of work: load and reference the whole sheet → route every aperture (tabs kept) → route every
 * split → release the sheet → crosscut at the yard panel saw → label every piece. Routed pieces stay in
 * their frame on their tabs; the owner separates them. Every piece goes back to the owner.
 */
import { STORE_EVALUATION_FRESHNESS, loadCatalog, priceAnswer, stockAnswer } from "./store-zero-stage2-store.mjs";
import { calculationHash, D001_TRAVEL_STANDARD, storeMachineSellRate } from "./d001-travel-standard.mjs";
import { S001_STAGE2_ENVELOPE, centeredField } from "./s001-stage2-envelope.mjs";
import { evaluateCircularSegment } from "./circular-segment.mjs";
import { STENCIL_TAB_POLICY_V0, archedAperturePerimeter, planArchedStencilTabs, planSplitStencilTabs } from "./stencil-tab-policy.mjs";

export const SHEET_PACKAGE_STANDARD = Object.freeze({
  id: "STB-SHEET-PACKAGE-0.1",
  classId: "sheet_package.s001",
  rule: "ONE_SHEET_EVERY_FEATURE_ANSWERED_NO_MOVE_NO_RESIZE_NO_DROP",
  order: Object.freeze(["LOAD_REFERENCE", "ROUTE_APERTURES", "ROUTE_SPLITS", "RELEASE", "PANEL_SAW_CROSSCUTS", "LABEL"]),
  disposition: "EVERY_PIECE_RETURNED_TO_OWNER"
});

const ENV = S001_STAGE2_ENVELOPE;
const EPS = 1e-9;

function round(value, places = 2) {
  const m = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * m) / m;
}
const finite = (v) => typeof v === "number" && Number.isFinite(v);

function reasonRecord(category, code, subject, explanation) {
  return Object.freeze({ category, code, subject, authority: "STORE_ZERO", explanation });
}

// ---------- Material: the Store picks its own sheet offering from the stated facts ----------
function resolveSheet(catalog, sheet, neededOps) {
  const matches = catalog.offerings.filter((item) =>
    item.form === "sheet" &&
    Math.abs(Number(item.actualT) - Number(sheet.thicknessIn)) < 1e-6 &&
    Number(item.sheetL_in) === Number(sheet.lengthIn) &&
    Number(item.sheetW_in) === Number(sheet.widthIn) &&
    (sheet.species == null || item.species === sheet.species) &&
    (sheet.grade == null || item.grade === sheet.grade)
  );
  if (!matches.length) return { status: "REFUSED", code: "NO_MATCHING_SHEET_OFFERING" };
  const offered = matches.filter((item) => item.offered === true);
  if (!offered.length) return { status: "REFUSED", code: "SHEET_NOT_OFFERED" };
  const capable = offered.filter((item) =>
    (item.cellFamily || []).includes(ENV.cellFamily) &&
    neededOps.every((op) => (item.supportedOps || []).includes(op))
  );
  if (!capable.length) return { status: "REFUSED", code: "OPERATION_NOT_ON_SHEET_OFFERING", missing: neededOps };
  const priced = capable
    .filter((item) => item.sellingPrice != null)
    .sort((a, b) => a.sellingPrice - b.sellingPrice || String(a.storeSku).localeCompare(String(b.storeSku)));
  if (!priced.length) return { status: "UNRESOLVED", code: "MISSING_PRICE" };
  const inStock = priced.find((item) => stockAnswer(item, 1).sufficient === true);
  if (!inStock) return { status: "UNAVAILABLE", code: stockAnswer(priced[0], 1).status, item: priced[0] };
  return { status: "SUPPORTABLE", item: inStock, matchedOfferings: priced.map((item) => item.storeSku) };
}

// ---------- Features ----------
function evaluateAperture(feature, parent, field) {
  const refusals = [];
  const unresolved = [];
  if (feature.placement !== "CENTERED") refusals.push("APERTURE_PLACEMENT_NOT_DECLARED");
  if (feature.retain !== "TABS") refusals.push("APERTURE_RETENTION_MUST_BE_TABS");
  const w = feature.widthIn;
  const h = feature.straightHeightIn;
  const rise = feature.riseIn;
  if (![w, h, rise].every(finite)) {
    unresolved.push("APERTURE_SIZE_MISSING");
    return { refusals, unresolved };
  }
  if (!(w > 0 && h > 0 && rise > 0)) {
    refusals.push("APERTURE_SIZE_INVALID");
    return { refusals, unresolved };
  }
  const curve = evaluateCircularSegment({ chord_in: w, rise_in: rise });
  if (!curve.ok) {
    refusals.push(...curve.reasons);
    unresolved.push(...curve.unresolved);
    return { refusals, unresolved };
  }
  if (rise > w / 2 + EPS) refusals.push("ARCH_RISE_EXCEEDS_HALF_WIDTH");
  if (w < ENV.router.minRoutedFeatureIn - EPS || h < ENV.router.minRoutedFeatureIn - EPS) refusals.push("ROUTED_FEATURE_BELOW_MINIMUM");
  const height = h + rise;
  const x0 = (parent.lengthIn - w) / 2;
  const y0 = (parent.widthIn - height) / 2;
  const box = { x0, x1: x0 + w, y0, y1: y0 + height };
  const inField = box.x0 >= field.x0 - EPS && box.x1 <= field.x1 + EPS && box.y0 >= field.y0 - EPS && box.y1 <= field.y1 + EPS;
  if (!inField) refusals.push("CENTER_WORK_FIELD_EXCEEDED");

  let tabPlan = null;
  const requested = feature.requestedTabCount;
  if (requested == null) unresolved.push("TAB_COUNT_MISSING");
  else if (!Number.isInteger(requested) || requested < 1) refusals.push("TAB_PLAN_COUNT_INVALID");
  const perimeter = archedAperturePerimeter({ chord_in: w, rise_in: rise, radius_in: curve.radius_in, straightHeight_in: h });
  if (!refusals.length && !unresolved.length) {
    tabPlan = planArchedStencilTabs({ chord_in: w, rise_in: rise, radius_in: curve.radius_in, straightHeight_in: h, requestedTabCount: requested });
    if (!tabPlan.ok) (tabPlan.status === "REFUSED" ? refusals : unresolved).push(tabPlan.reason);
  }
  return {
    refusals,
    unresolved,
    geometry: {
      kind: "ARCHED_APERTURE",
      widthIn: w,
      straightHeightIn: h,
      riseIn: rise,
      heightIn: round(height, 6),
      radiusIn: round(curve.radius_in, 6),
      perimeterIn: perimeter ? round(perimeter.perimeter_in, 6) : null,
      box: { x0: round(box.x0, 6), x1: round(box.x1, 6), y0: round(box.y0, 6), y1: round(box.y1, 6) },
      insideWorkField: inField
    },
    tabPlan,
    tabGeometry: { chord_in: w, rise_in: rise, radius_in: curve.radius_in, straightHeight_in: h }
  };
}

function evaluateSplit(feature, apertures) {
  const refusals = [];
  const host = apertures.get(feature.within);
  if (!host) return { refusals: ["SPLIT_HOST_APERTURE_NOT_DEFINED"], unresolved: [] };
  if (feature.line !== "VERTICAL_CENTERLINE") refusals.push("SPLIT_LINE_NOT_DECLARED");
  if (!host.geometry) return { refusals, unresolved: [] };
  const pieceW = (host.geometry.widthIn - ENV.router.toolDiameterIn) / 2;
  if (pieceW < ENV.router.minSplitPieceWidthIn - EPS) refusals.push("SPLIT_PIECE_BELOW_MINIMUM");
  return {
    refusals,
    unresolved: [],
    host,
    geometry: {
      kind: "STRAIGHT_SPLIT",
      line: "VERTICAL_CENTERLINE",
      xIn: round((host.geometry.box.x0 + host.geometry.box.x1) / 2, 6),
      lengthIn: host.geometry.heightIn,
      pieceWidthIn: round(pieceW, 6)
    }
  };
}

function evaluateCrosscut(feature, parent, apertureBoxes) {
  const refusals = [];
  const unresolved = [];
  if (!["LEFT", "RIGHT"].includes(feature.fromEnd)) refusals.push("CROSSCUT_END_NOT_DECLARED");
  if (!finite(feature.distanceIn)) {
    unresolved.push("CROSSCUT_DISTANCE_MISSING");
    return { refusals, unresolved };
  }
  const x = feature.fromEnd === "RIGHT" ? parent.lengthIn - feature.distanceIn : feature.distanceIn;
  if (!(x > 0 && x < parent.lengthIn)) {
    refusals.push("CROSSCUT_OUTSIDE_SHEET");
    return { refusals, unresolved };
  }
  const clearance = ENV.panelSaw.minClearanceToRoutedFeatureIn;
  if (apertureBoxes.some((box) => x > box.x0 - clearance - EPS && x < box.x1 + clearance + EPS)) {
    refusals.push("CROSSCUT_INTERSECTS_ROUTED_FEATURE");
  }
  return { refusals, unresolved, geometry: { kind: "CROSSCUT", xIn: round(x, 6), lengthIn: parent.widthIn } };
}

// ---------- Pieces ----------
function piecesFor(parent, crosscutXs, apertures, splits) {
  const kerf = ENV.panelSaw.kerfIn;
  const xs = [...crosscutXs].sort((a, b) => a - b);
  const edges = [0, ...xs, parent.lengthIn];
  const pieces = [];
  const refusals = [];
  for (let i = 0; i + 1 < edges.length; i += 1) {
    const from = edges[i] + (i === 0 ? 0 : kerf / 2);
    const to = edges[i + 1] - (i + 1 === edges.length - 1 ? 0 : kerf / 2);
    const len = to - from;
    if (len < ENV.panelSaw.minPieceIn - EPS) refusals.push("CROSSCUT_PIECE_BELOW_MINIMUM");
    const holds = apertures.filter((a) => a.geometry.box.x0 >= from - EPS && a.geometry.box.x1 <= to + EPS);
    pieces.push({
      pieceId: "P" + (i + 1),
      kind: holds.length ? "FRAME" : "PANEL",
      lengthIn: round(len, 4),
      widthIn: parent.widthIn,
      fromXIn: round(from, 4),
      toXIn: round(to, 4),
      carries: holds.map((a) => a.featureId),
      disposition: "RETURNED_TO_OWNER"
    });
  }
  for (const a of apertures) {
    const frame = pieces.find((p) => p.carries.includes(a.featureId));
    const split = splits.find((s) => s.host === a);
    const tabs = a.tabPlan?.candidates || [];
    if (split) {
      for (const side of ["LEFT", "RIGHT"]) {
        pieces.push({
          pieceId: a.featureId + "-" + side,
          kind: "RETAINED_CENTER_PIECE",
          widthIn: split.geometry.pieceWidthIn,
          heightIn: a.geometry.heightIn,
          retainedBy: "TABS",
          tabs: (side === "LEFT" ? a.tabPlan?.split?.leftPieceTabs : a.tabPlan?.split?.rightPieceTabs) ?? null,
          inFrame: frame?.pieceId ?? null,
          disposition: "RETURNED_TO_OWNER"
        });
      }
    } else {
      pieces.push({
        pieceId: a.featureId + "-CENTER",
        kind: "RETAINED_CENTER_PIECE",
        widthIn: round(a.geometry.widthIn - ENV.router.toolDiameterIn, 4),
        heightIn: a.geometry.heightIn,
        retainedBy: "TABS",
        tabs: tabs.length || null,
        inFrame: frame?.pieceId ?? null,
        disposition: "RETURNED_TO_OWNER"
      });
    }
  }
  return { pieces, refusals };
}

// ---------- Time and price ----------
function timeFor(sheetItem, apertures, splits, crosscuts, pieceCount) {
  const r = ENV.router;
  const passes = Math.max(1, Math.ceil(Number(sheetItem.actualT) / r.passDepthIn - EPS));
  const routed = apertures.length + splits.length;
  const routeLengthIn = apertures.reduce((sum, a) => sum + a.geometry.perimeterIn, 0) + splits.reduce((sum, s) => sum + s.geometry.lengthIn, 0);
  const tabs = apertures.reduce((sum, a) => sum + (a.tabPlan?.plannedTabCount || 0), 0);
  const t = {
    T_LOAD_REFERENCE_sec: routed ? r.loadSeatReferenceSec : 0,
    T_ROUTE_sec: round((routeLengthIn * passes / r.routeFeedInPerMin) * 60, 3),
    T_PLUNGE_sec: routed * passes * r.plungeRetractSec,
    T_TAB_sec: tabs * passes * r.tabLiftSec,
    T_RELEASE_sec: routed ? r.releaseUnloadSec : 0,
    T_PANEL_SAW_sec: round(crosscuts.reduce((sum, c) => sum + ENV.panelSaw.setAndAlignSec + (c.geometry.lengthIn / ENV.panelSaw.cutFeedInPerMin) * 60, 0), 3),
    T_LABEL_sec: pieceCount * ENV.label.perPieceSec
  };
  const total = Object.values(t).reduce((sum, v) => sum + v, 0);
  return {
    ...t,
    T_MACHINE_sec: round(total, 3),
    T_MACHINE_min: round(total / 60, 4),
    routedLengthIn: round(routeLengthIn, 4),
    passes,
    basis: "DECLARED_STAGE2_MODEL",
    measured: false
  };
}

function operationsFor(apertures, splits, crosscuts, passes) {
  const ops = [{ seq: 1, opId: "LOAD_REFERENCE", station: ENV.router.station, note: "whole sheet seated and referenced to the machine centerline" }];
  for (const a of apertures) {
    ops.push({ seq: ops.length + 1, opId: "ROUTE_PROFILE", station: ENV.router.station, featureId: a.featureId, profile: "ARCHED_APERTURE", lengthIn: a.geometry.perimeterIn, passes, tabs: a.tabPlan.plannedTabCount });
  }
  for (const s of splits) {
    ops.push({ seq: ops.length + 1, opId: "ROUTE_PROFILE", station: ENV.router.station, featureId: s.featureId, profile: "STRAIGHT_SPLIT", lengthIn: s.geometry.lengthIn, passes });
  }
  if (apertures.length || splits.length) ops.push({ seq: ops.length + 1, opId: "RELEASE", station: ENV.router.station });
  for (const c of [...crosscuts].sort((a, b) => a.geometry.xIn - b.geometry.xIn)) {
    ops.push({ seq: ops.length + 1, opId: "CROSSCUT", station: ENV.panelSaw.station, featureId: c.featureId, xIn: c.geometry.xIn, lengthIn: c.geometry.lengthIn });
  }
  ops.push({ seq: ops.length + 1, opId: "LABEL", station: "YARD" });
  return ops;
}

// ---------- The answer ----------
export function evaluateSheetPackageJob(catalog, demand = {}) {
  const identity = {
    configurationId: String(demand.configurationId || ""),
    configurationVersion: String(demand.configurationVersion || ""),
    storeRevision: demand.storeRevision || null
  };
  const refusals = [];
  const unresolved = [];
  const records = [];
  const refuse = (code, subject, text, category = "CAPABILITY_GAP") => { refusals.push(code); records.push(reasonRecord(category, code, subject, text)); };
  const leave = (code, subject, text) => { unresolved.push(code); records.push(reasonRecord("DEFINITION_GAP", code, subject, text)); };

  if (!identity.configurationId || !identity.configurationVersion) leave("CONFIGURATION_IDENTITY_REQUIRED", "definition", "A sheet package names its configuration and version.");
  for (const key of ENV.machineLocalLanguage) {
    if (demand[key] != null) refuse("MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED", key, "Store Zero takes part definitions, not machine instructions.", "DEFINITION_GAP");
  }

  const sheet = demand.sheet || {};
  const parent = { lengthIn: Number(sheet.lengthIn), widthIn: Number(sheet.widthIn), thicknessIn: Number(sheet.thicknessIn) };
  if (![parent.lengthIn, parent.widthIn, parent.thicknessIn].every(Number.isFinite)) {
    leave("SHEET_SIZE_MISSING", "sheet", "The sheet needs a length, a width and a thickness in inches.");
  } else {
    if (parent.lengthIn !== ENV.stock.parentLengthIn || parent.widthIn !== ENV.stock.parentWidthIn) refuse("SHEET_SIZE_OUTSIDE_S001_ENVELOPE", "sheet", "The S-001 sheet cell takes a full 48 × 96 in sheet.");
    if (parent.thicknessIn > ENV.stock.maxThicknessIn + EPS || parent.thicknessIn < ENV.stock.minThicknessIn - EPS) refuse("SHEET_THICKNESS_OUTSIDE_S001_ENVELOPE", "sheet", "S-001 routes sheets from 1/4 in to 3/4 in thick.");
  }

  const features = Array.isArray(demand.features) ? demand.features : [];
  if (!features.length) leave("FEATURES_REQUIRED", "definition", "A sheet package names at least one feature.");
  const ids = features.map((f) => String(f?.featureId || ""));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) leave("UNIQUE_FEATURE_ID_REQUIRED", "features", "Every feature needs its own id.");

  const field = Number.isFinite(parent.lengthIn) && Number.isFinite(parent.widthIn) ? centeredField(parent.lengthIn, parent.widthIn) : null;
  const apertures = [];
  const apertureById = new Map();
  const splits = [];
  const crosscuts = [];
  for (const feature of features) {
    if (!ENV.featureKinds.includes(feature?.kind)) {
      refuse("FEATURE_KIND_NOT_DECLARED", feature?.featureId || "feature", "Store Zero's sheet cell does not declare this kind of feature.");
    }
  }
  if (field) {
    for (const feature of features.filter((f) => f?.kind === "ARCHED_APERTURE")) {
      const result = evaluateAperture(feature, parent, field);
      result.refusals.forEach((code) => refuse(code, feature.featureId, apertureText(code)));
      result.unresolved.forEach((code) => leave(code, feature.featureId, apertureText(code)));
      const entry = { featureId: feature.featureId, ...result };
      if (result.geometry) apertures.push(entry);
      apertureById.set(feature.featureId, entry);
    }
    for (const feature of features.filter((f) => f?.kind === "STRAIGHT_SPLIT")) {
      const result = evaluateSplit(feature, apertureById);
      result.refusals.forEach((code) => refuse(code, feature.featureId, splitText(code)));
      if (result.geometry) splits.push({ featureId: feature.featureId, ...result });
    }
    for (const feature of features.filter((f) => f?.kind === "CROSSCUT")) {
      const result = evaluateCrosscut(feature, parent, apertures.map((a) => a.geometry.box));
      result.refusals.forEach((code) => refuse(code, feature.featureId, crosscutText(code)));
      result.unresolved.forEach((code) => leave(code, feature.featureId, crosscutText(code)));
      if (result.geometry) crosscuts.push({ featureId: feature.featureId, ...result });
    }
  }
  // Splits make two retained pieces out of one center: each piece keeps its own tabs.
  for (const s of splits) {
    const host = s.host;
    if (host.tabPlan?.ok) host.tabPlan = planSplitStencilTabs(host.tabPlan, host.tabGeometry);
  }

  const neededOps = [...new Set(features.map((f) => ENV.requiredOps[f?.kind]).filter(Boolean))];
  const material = Number.isFinite(parent.thicknessIn) ? resolveSheet(catalog, { ...sheet, thicknessIn: parent.thicknessIn }, neededOps) : null;
  if (material && material.status === "REFUSED") refuse(material.code, "sheet", materialText(material.code), "MATERIAL_GAP");
  if (material && material.status === "UNRESOLVED") leave(material.code, "sheet", "Store Zero has no selling price for this sheet.");
  if (demand.exteriorRatingRequested === true && material?.item && !/exterior/i.test(String(material.item.grade))) {
    leave("EXTERIOR_RATING_NOT_ESTABLISHED_BY_SKU", "sheet", "This sheet is not sold as exterior rated.");
  }

  let pieces = [];
  if (field && Number.isFinite(parent.lengthIn)) {
    const cut = piecesFor(parent, crosscuts.map((c) => c.geometry.xIn), apertures, splits);
    pieces = cut.pieces;
    // A piece too short to cut belongs to the crosscuts that make it.
    [...new Set(cut.refusals)].forEach((code) => crosscuts.forEach((c) => refuse(code, c.featureId, crosscutText(code))));
  }

  // Every requested feature gets its own answer, so nothing is silently dropped.
  const featureAnswers = features.map((feature) => {
    const id = feature?.featureId || "feature";
    const codes = records.filter((r) => r.subject === id).map((r) => r.code);
    const refused = codes.some((code) => refusals.includes(code));
    const open = codes.some((code) => unresolved.includes(code));
    return {
      featureId: id,
      kind: feature?.kind ?? null,
      status: refused ? "REFUSED" : open ? "UNRESOLVED" : "ANSWERED",
      reasonCodes: [...new Set(codes)]
    };
  });

  const uniqueRefusals = [...new Set(refusals)];
  const uniqueUnresolved = [...new Set(unresolved)];
  const stockShort = material?.status === "UNAVAILABLE";
  const status = uniqueRefusals.length ? "REFUSED" : uniqueUnresolved.length ? "UNRESOLVED" : stockShort ? "UNAVAILABLE" : "SUPPORTABLE";
  if (stockShort) records.push(reasonRecord("AVAILABILITY_GAP", material.code, "sheet", "Store Zero does not have this sheet on hand."));

  const item = material?.item || null;
  let time = null;
  let totals = null;
  let operations = null;
  if (status === "SUPPORTABLE") {
    time = timeFor(item, apertures, splits, crosscuts, pieces.length);
    const rate = storeMachineSellRate(D001_TRAVEL_STANDARD.economics);
    const machine = round((time.T_MACHINE_sec / 3600) * rate.sellRatePerHour, 2);
    const materialPrice = round(Number(item.sellingPrice), 2);
    totals = {
      material: materialPrice,
      machine_service: machine,
      Q: round(materialPrice + machine, 2),
      sellRatePerHour: rate.sellRatePerHour,
      basis: "CALCULATED_FROM_DECLARED_STAGE2_MODEL"
    };
    operations = operationsFor(apertures, splits, crosscuts, time.passes);
  }

  const answerMaterial = item ? {
    storeSku: item.storeSku,
    description: item.description || null,
    thicknessIn: item.actualT,
    lengthIn: item.sheetL_in,
    widthIn: item.sheetW_in,
    species: item.species || null,
    grade: item.grade || null,
    price: priceAnswer(item),
    stock: stockAnswer(item, 1),
    matchedOfferings: material.matchedOfferings || null
  } : null;

  const resultCore = {
    standard: SHEET_PACKAGE_STANDARD.id,
    status,
    refusals: uniqueRefusals,
    unresolved: uniqueUnresolved,
    material: answerMaterial ? { storeSku: answerMaterial.storeSku } : null,
    features: [...apertures.map((a) => a.geometry), ...splits.map((s) => s.geometry), ...crosscuts.map((c) => c.geometry)],
    pieces,
    totals
  };
  return {
    classId: SHEET_PACKAGE_STANDARD.classId,
    standard: SHEET_PACKAGE_STANDARD.id,
    stage: 2,
    store: "Store Zero",
    cellFamily: ENV.cellFamily,
    envelope: ENV.id,
    configurationId: identity.configurationId,
    configurationVersion: identity.configurationVersion,
    status,
    complete: status === "SUPPORTABLE",
    refusalConditions: uniqueRefusals,
    unresolvedConditions: uniqueUnresolved,
    reasonCodes: [...uniqueRefusals, ...uniqueUnresolved, ...(stockShort ? [material.code] : [])],
    reasonRecords: records,
    material: answerMaterial,
    workField: field ? { id: ENV.workField.id, ...field } : null,
    featureAnswers,
    features: {
      apertures: apertures.map((a) => ({ featureId: a.featureId, ...a.geometry, tabPlan: a.tabPlan })),
      splits: splits.map((s) => ({ featureId: s.featureId, within: s.host.featureId, ...s.geometry })),
      crosscuts: crosscuts.map((c) => ({ featureId: c.featureId, ...c.geometry }))
    },
    operations,
    pieces,
    time,
    totals,
    Q: totals ? totals.Q : null,
    evidence: {
      evidenceClass: ENV.evidenceClass,
      capabilityBasis: ENV.assumptions.capabilityBasis,
      timingBasis: ENV.assumptions.timingBasis,
      assumptions: ENV.assumptions.status,
      measured: false,
      commissioned: false,
      physicalStatus: ENV.physicalStatus,
      physicalMachineEvidence: false,
      commercialQuote: false,
      replacedBy: ENV.assumptions.replacedBy,
      economics: ENV.economicsBasis,
      tabRetention: STENCIL_TAB_POLICY_V0.physicalRetentionStatus
    },
    note: "Budgetary estimate from declared Stage-2 reference capability. Not a commercial quote, not a cut.",
    not_claimed: [...ENV.notClaimed, "commercial quote", "seller-of-record"],
    calculationIdentity: {
      inputHash: calculationHash({ standard: SHEET_PACKAGE_STANDARD.id, demand }),
      resultHash: calculationHash(resultCore)
    }
  };
}

function apertureText(code) {
  return {
    APERTURE_PLACEMENT_NOT_DECLARED: "The sheet cell routes an arched opening centered on the sheet.",
    APERTURE_RETENTION_MUST_BE_TABS: "Routed pieces stay attached by tabs.",
    APERTURE_SIZE_MISSING: "The opening needs a width, a straight-side height and an arch rise.",
    APERTURE_SIZE_INVALID: "Opening sizes must be positive.",
    ARCH_RISE_EXCEEDS_HALF_WIDTH: "An arch on straight sides rises at most half the opening width.",
    ROUTED_FEATURE_BELOW_MINIMUM: "The opening is smaller than the smallest routed feature the sheet cell declares (6 in).",
    CENTER_WORK_FIELD_EXCEEDED: "The whole opening must fit inside the centered 48 × 36 in working field.",
    TAB_COUNT_MISSING: "State how many tabs should hold the center.",
    TAB_PLAN_COUNT_INVALID: "The tab count must be a whole number of at least one."
  }[code] || "The arch geometry is not constructible as stated.";
}
function splitText(code) {
  return {
    SPLIT_HOST_APERTURE_NOT_DEFINED: "A split runs inside an opening defined in the same package.",
    SPLIT_LINE_NOT_DECLARED: "The sheet cell declares only a split on the opening's vertical centerline.",
    SPLIT_PIECE_BELOW_MINIMUM: "Each split piece would be narrower than 3 in."
  }[code] || code;
}
function crosscutText(code) {
  return {
    CROSSCUT_END_NOT_DECLARED: "Measure a crosscut from the LEFT or RIGHT end of the sheet.",
    CROSSCUT_DISTANCE_MISSING: "State how far from the end to cut.",
    CROSSCUT_OUTSIDE_SHEET: "The cut line is off the sheet.",
    CROSSCUT_INTERSECTS_ROUTED_FEATURE: "The saw line would run through, or within 1 in of, a routed opening.",
    CROSSCUT_PIECE_BELOW_MINIMUM: "A crosscut would leave a piece shorter than the panel saw's 6 in minimum."
  }[code] || code;
}
function materialText(code) {
  return {
    NO_MATCHING_SHEET_OFFERING: "Store Zero stocks no sheet of this size and thickness.",
    SHEET_NOT_OFFERED: "Store Zero lists this sheet but does not offer it.",
    OPERATION_NOT_ON_SHEET_OFFERING: "The matching sheet is not offered for every operation this package needs."
  }[code] || code;
}

export function evaluateSheetPackageStoreRequest(catalog, demand = {}, request = {}) {
  const requestId = String(request.requestId || "").trim();
  if (!requestId) {
    return { classId: SHEET_PACKAGE_STANDARD.classId, status: "UNRESOLVED", freshEvaluation: false, unresolvedConditions: ["STORE_EVALUATION_REQUEST_ID_REQUIRED"], calculationIdentity: null, evaluationReceipt: null };
  }
  const evaluatedAt = String(request.evaluatedAt || new Date().toISOString());
  const storeRevision = String(request.storeRevision || process.env.STB_STORE_REVISION || demand.storeRevision || "LOCAL_UNPINNED_STORE_REVISION");
  const evaluation = evaluateSheetPackageJob(catalog, { ...demand, storeRevision });
  const receiptCore = {
    freshnessRule: STORE_EVALUATION_FRESHNESS.id,
    requestId,
    evaluatedAt,
    authority: {
      storeRevision,
      catalogHash: calculationHash(catalog),
      machineEnvelope: { id: S001_STAGE2_ENVELOPE.id, hash: calculationHash(S001_STAGE2_ENVELOPE) },
      tabPolicy: { id: STENCIL_TAB_POLICY_V0.id, hash: calculationHash(STENCIL_TAB_POLICY_V0) },
      economics: { id: D001_TRAVEL_STANDARD.economics.id, hash: calculationHash(D001_TRAVEL_STANDARD.economics) },
      sheetPackageStandard: { id: SHEET_PACKAGE_STANDARD.id, hash: calculationHash(SHEET_PACKAGE_STANDARD) }
    },
    demandHash: calculationHash(demand),
    status: evaluation.status,
    calculationIdentity: evaluation.calculationIdentity
  };
  return { ...evaluation, freshEvaluation: true, evaluationReceipt: Object.freeze({ ...receiptCore, receiptHash: calculationHash(receiptCore) }) };
}

export function requestSheetPackageStoreEvaluation(demand = {}, request = {}) {
  return evaluateSheetPackageStoreRequest(loadCatalog(), demand, request);
}
