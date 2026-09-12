/**
 * Store Zero Stage-2 callable Store
 * Ask for the answer, not the database.
 *
 * Job dispositions declared at Stage 2:
 *   UNRESOLVED  missing SKU or missing price
 *   REFUSED     required operation not in the offering / no offering
 *   UNAVAILABLE fixture-declared available stock < qty needed
 *               (ON_HAND_SHORT and NOT_ON_HAND both fail the job)
 *   SUPPORTABLE every line priced, capable, and sufficient
 *
 * Line stock facts remain: ON_HAND_SUFFICIENT | ON_HAND_SHORT | NOT_ON_HAND
 * DEFERRED and REFERRED are not Stage-2 Store Zero meanings.
 * A synthetic supplierPath does not convert a shortage into SUPPORTABLE.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { estimatePineAlcove, estimateJob } from "./store-zero-pricing-engine.mjs";
import { envelopeCheck } from "./d001-stage2-envelope.mjs";
import { evaluateSheetMode2, sheetMode2NeutralOps, S001_MODE2_ENVELOPE } from "./s001-mode2-envelope.mjs";
import {
  evaluateSheetMode2Arched,
  sheetMode2ArchedNeutralOps,
  S001_MODE2_ARCHED_ENVELOPE
} from "./s001-mode2-arched.mjs";

export const STAGE2_JOB_DISPOSITIONS = [
  "SUPPORTABLE",
  "UNRESOLVED",
  "REFUSED",
  "UNAVAILABLE"
];

const ROOT = dirname(fileURLToPath(import.meta.url));

export function loadCatalog(path = join(ROOT, "store-zero-catalog.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadObservations(path = join(ROOT, "store-zero-observations.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function findSku(catalog, storeSku) {
  return catalog.offerings.find((o) => o.storeSku === storeSku) || null;
}

export function offerMaterial(catalog, q) {
  return catalog.offerings.filter((o) => {
    if (q.species && o.species !== q.species) return false;
    if (q.form && o.form !== q.form) return false;
    if (q.nominalT != null && o.nominalT !== q.nominalT) return false;
    if (q.nominalW != null && o.nominalW !== q.nominalW) return false;
    if (q.stockL_in != null && o.stockL_in !== q.stockL_in) return false;
    return o.offered;
  });
}

export function stockAnswer(item, qtyNeeded = 1) {
  if (!item) return { status: "UNAVAILABLE", reason: "SKU_NOT_OFFERED" };
  const available = item.onHand - item.allocated;
  return {
    status: available >= qtyNeeded ? "ON_HAND_SUFFICIENT" : available > 0 ? "ON_HAND_SHORT" : "NOT_ON_HAND",
    offered: item.offered,
    fixtureDeclaredOnHand: item.onHand,
    allocatedSimulated: item.allocated,
    available,
    qtyNeeded,
    sufficient: available >= qtyNeeded,
    supplierPath: item.supplierPath,
    assertions: {
      onHand: item.assertions.onHand,
      allocation: item.assertions.allocation,
      supplierPath: item.assertions.supplierPath
    },
    asOf: "2026-09-10"
  };
}

export function priceAnswer(item) {
  if (!item || item.sellingPrice == null) return { status: "UNRESOLVED", reason: "MISSING_PRICE" };
  return {
    status: "STORE_ZERO_SELLING_PRICE",
    list_reference: item.list_reference,
    listReferenceBasis: item.listReferenceBasis,
    mark_on: item.mark_on,
    sellingPrice: item.sellingPrice,
    sellingPriceBasis: "CALCULATED",
    observationId: item.observationId || null,
    asOf: "2026-09-10",
    note: "Budgetary fixture price. Not a commercial quote."
  };
}

export function capabilityAnswer(item, requiredOps = [], feature = {}) {
  if (!item) return { status: "REFUSED", reason: "NO_OFFERING" };
  const env = envelopeCheck(item, { requiredOps, ...feature });
  if (env.status === "SOURCED") {
    return { status: "SOURCED", envelope: env };
  }
  if (env.status === "REFUSED") {
    return {
      status: "REFUSED",
      missing: env.reasons,
      declared: item.supportedOps,
      cellFamily: item.cellFamily,
      basis: "DECLARED_STAGE2_CAPABILITY",
      envelope: env
    };
  }
  return {
    status: "SUPPORTABLE",
    declared: item.supportedOps,
    cellFamily: item.cellFamily,
    limitations: item.limitations || [],
    basis: "DECLARED_STAGE2_CAPABILITY",
    envelope: env
  };
}

export function evaluateJob(catalog, spec) {
  const lines = [];
  let unresolved = false;
  let refused = false;
  let unavailable = false;
  for (const line of spec.lines) {
    const item = findSku(catalog, line.storeSku);
    const stock = stockAnswer(item, line.qty);
    const price = priceAnswer(item);
    const cap = capabilityAnswer(item, line.requiredOps || ["CROSSCUT"], {
      keptLengthIn: line.keptLengthIn,
      millYIn: line.millYIn,
      millDepthIn: line.millDepthIn
    });
    if (!item || price.status === "UNRESOLVED") unresolved = true;
    if (cap.status === "REFUSED") refused = true;
    if (stock.status === "NOT_ON_HAND" || stock.status === "ON_HAND_SHORT") unavailable = true;
    lines.push({
      storeSku: line.storeSku,
      description: item?.description,
      qty: line.qty,
      stock,
      price,
      capability: cap
    });
  }
  const status = unresolved ? "UNRESOLVED" : refused ? "REFUSED" : unavailable ? "UNAVAILABLE" : "SUPPORTABLE";
  return {
    title: spec.title,
    stage: 2,
    store: "Store Zero",
    status,
    lines,
    estimate: spec.estimate || null,
    not_claimed: ["live ERP", "Cycle Start", "Menards integration", "physical stock count", "commercial quote"]
  };
}

export function pineAlcoveEvaluation(catalog) {
  const estimate = estimatePineAlcove(catalog);
  return evaluateJob(catalog, {
    title: estimate.title,
    estimate,
    lines: [
      { storeSku: "STB-ZERO-PINE-1X6-72-001", qty: 4, requiredOps: ["CROSSCUT"] },
      { storeSku: "STB-ZERO-PINE-1X6-96-001", qty: 10, requiredOps: ["CROSSCUT"] }
    ]
  });
}

export { estimateJob, estimatePineAlcove };

const SHEET_NOT_CLAIMED = [
  "live ERP",
  "Cycle Start",
  "physical stock count",
  "commercial quote",
  "commissioned S-001",
  "automated secondary separation",
  "G-code",
  "measured cycle time"
];

export function evaluateSheetMode2Job(catalog, spec) {
  const line = spec.line || spec.lines?.[0] || {};
  const item = findSku(catalog, line.storeSku);
  const stock = stockAnswer(item, line.qty || 1);
  const price = priceAnswer(item);
  const cap = evaluateSheetMode2(item, {
    profileKind: line.profileKind,
    blankL_in: line.blankL_in,
    blankW_in: line.blankW_in,
    tabCount: line.tabCount,
    routeDepthIn: line.routeDepthIn,
    spline: line.spline,
    toolpath: line.toolpath,
    gcode: line.gcode,
    controller: line.controller
  });
  let status;
  if (!item || price.status === "UNRESOLVED" || cap.status === "UNRESOLVED") status = "UNRESOLVED";
  else if (cap.status === "REFUSED") status = "REFUSED";
  else if (stock.status === "NOT_ON_HAND" || stock.status === "ON_HAND_SHORT") status = "UNAVAILABLE";
  else status = "SUPPORTABLE";
  return {
    title: spec.title || "Sheet Mode-2 stencil",
    stage: 2,
    store: "Store Zero",
    jobType: "SHEET_MODE2_STENCIL_V1",
    status,
    capabilityId: S001_MODE2_ENVELOPE.capabilityId,
    evidenceClass: "REFERENCE",
    physicalStatus: "NOT_CLAIMED",
    measured: false,
    commissioned: false,
    neutralOps: sheetMode2NeutralOps(line),
    line: {
      storeSku: line.storeSku,
      description: item?.description,
      qty: line.qty || 1,
      stock,
      price,
      capability: cap
    },
    estimate: spec.estimate || null,
    not_claimed: SHEET_NOT_CLAIMED
  };
}

export function evaluateSheetMode2ArchedJob(catalog, spec) {
  const line = spec.line || spec.lines?.[0] || {};
  const item = findSku(catalog, line.storeSku);
  const stock = stockAnswer(item, line.qty || 1);
  const price = priceAnswer(item);
  const cap = evaluateSheetMode2Arched(item, {
    geometryClass: line.geometryClass || "CURVILINEAR",
    outerL_in: line.outerL_in ?? line.blankL_in,
    outerW_in: line.outerW_in ?? line.blankW_in,
    apertureW_in: line.apertureW_in,
    apertureStraightH_in: line.apertureStraightH_in,
    arcChord_in: line.arcChord_in,
    arcRise_in: line.arcRise_in,
    arcRadius_in: line.arcRadius_in,
    tabCount: line.tabCount,
    routeDepthIn: line.routeDepthIn,
    exteriorRatingRequested: line.exteriorRatingRequested,
    spline: line.spline,
    toolpath: line.toolpath,
    gcode: line.gcode,
    controller: line.controller
  });
  let status;
  if (!item || price.status === "UNRESOLVED" || cap.status === "UNRESOLVED") status = "UNRESOLVED";
  else if (cap.status === "REFUSED") status = "REFUSED";
  else if (stock.status === "NOT_ON_HAND" || stock.status === "ON_HAND_SHORT") status = "UNAVAILABLE";
  else status = "SUPPORTABLE";
  return {
    title: spec.title || "Sheet Mode-2 arched aperture",
    stage: 2,
    store: "Store Zero",
    jobType: "SHEET_MODE2_ARCHED_APERTURE_V0",
    status,
    capabilityId: S001_MODE2_ARCHED_ENVELOPE.capabilityId,
    evidenceClass: "REFERENCE",
    physicalStatus: "NOT_CLAIMED",
    measured: false,
    commissioned: false,
    geometryClass: cap.geometryClass,
    processClass: cap.processClass,
    referenceArchitecture: S001_MODE2_ARCHED_ENVELOPE.referenceArchitecture,
    controlsReference: S001_MODE2_ARCHED_ENVELOPE.controlsReference,
    basis: {
      materialSku: line.storeSku || null,
      materialForm: item?.form || null,
      materialThicknessIn: item?.actualT ?? null,
      parentW_in: item?.sheetW_in ?? null,
      parentL_in: item?.sheetL_in ?? null,
      observationId: item?.observationId || null,
      list_reference: item?.list_reference ?? null,
      mark_on: item?.mark_on ?? null,
      sellingPrice: item?.sellingPrice ?? null,
      sellingPriceBasis: item ? "CALCULATED" : null,
      capabilityId: S001_MODE2_ARCHED_ENVELOPE.capabilityId,
      envelope: S001_MODE2_ARCHED_ENVELOPE.id,
      geometryClass: cap.geometryClass,
      processClass: cap.processClass,
      retention: cap.retention,
      curve: cap.curve,
      evidenceClass: "REFERENCE",
      physicalStatus: "NOT_CLAIMED",
      processQ_status: "UNRESOLVED"
    },
    neutralOps: sheetMode2ArchedNeutralOps(line),
    line: {
      storeSku: line.storeSku,
      description: item?.description,
      qty: line.qty || 1,
      stock,
      price,
      capability: cap
    },
    estimate: spec.estimate || null,
    not_claimed: SHEET_NOT_CLAIMED
  };
}

export function estimateSheetMode2Job(catalog, spec) {
  const line = spec.line || spec.lines?.[0] || {};
  const item = findSku(catalog, line.storeSku);
  const qty = line.qty || 1;
  if (!item || item.sellingPrice == null) {
    return { status: "UNRESOLVED", reason: "MISSING_PRICE", jobType: "SHEET_MODE2_STENCIL_V1" };
  }
  const material = Number((item.sellingPrice * qty).toFixed(2));
  return {
    status: "BUDGETARY_MATERIAL_ONLY",
    jobType: "SHEET_MODE2_STENCIL_V1",
    title: spec.title || "Sheet Mode-2 stencil",
    material,
    processQ: null,
    processQ_status: "UNRESOLVED",
    Q: material,
    Q_basis: "MATERIAL_FIXTURE_ONLY",
    note: "Budgetary material fixture only. Process time and fabrication Q are unresolved. Not a commercial quote."
  };
}

export function estimateSheetMode2ArchedJob(catalog, spec) {
  const line = spec.line || spec.lines?.[0] || {};
  const item = findSku(catalog, line.storeSku);
  const qty = line.qty || 1;
  if (!item || item.sellingPrice == null) {
    return { status: "UNRESOLVED", reason: "MISSING_PRICE", jobType: "SHEET_MODE2_ARCHED_APERTURE_V0" };
  }
  const material = Number((item.sellingPrice * qty).toFixed(2));
  return {
    status: "BUDGETARY_MATERIAL_ONLY",
    jobType: "SHEET_MODE2_ARCHED_APERTURE_V0",
    title: spec.title || "Sheet Mode-2 arched aperture",
    material,
    processQ: null,
    processQ_status: "UNRESOLVED",
    Q: material,
    Q_basis: "MATERIAL_FIXTURE_ONLY",
    list_reference: item.list_reference,
    mark_on: item.mark_on,
    observationId: item.observationId || null,
    note: "Budgetary material fixture only. Process time and fabrication Q are unresolved. Not a commercial quote."
  };
}

export {
  evaluateSheetMode2,
  sheetMode2NeutralOps,
  S001_MODE2_ENVELOPE,
  evaluateSheetMode2Arched,
  sheetMode2ArchedNeutralOps,
  S001_MODE2_ARCHED_ENVELOPE
};
