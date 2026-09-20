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
import {
  estimatePineAlcove,
  estimateJob,
  estimateUserDefinedMiterReference
} from "./store-zero-pricing-engine.mjs";
import { envelopeCheck, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
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
      millDepthIn: line.millDepthIn,
      miterAngleDeg: line.miterAngleDeg,
      miterPlane: line.miterPlane,
      bevelAngleDeg: line.bevelAngleDeg
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

function nominalSize(sizeKey) {
  const match = /^([124])x(\d+)$/.exec(String(sizeKey || ""));
  if (!match) return null;
  return { nominalT: Number(match[1]), nominalW: Number(match[2]) };
}

export function sequenceCrosscuts({
  parentLengthIn,
  parts = [],
  establishAngledEnd = false,
  holdIn = D001_STAGE2_ENVELOPE.cutoffControl.retainedTailIn,
  kerfIn = D001_STAGE2_ENVELOPE.cutoffControl.kerfIn
} = {}) {
  const parent = Number(parentLengthIn);
  const hold = Number(holdIn);
  const kerf = Number(kerfIn);
  const pieces = parts.map(Number).filter((len) => Number.isFinite(len) && len > 0).sort((a, b) => b - a);
  if (!Number.isFinite(parent) || parent <= 0 || !pieces.length) {
    return { status: "UNRESOLVED", code: "INVALID_CUTOFF_SEQUENCE_INPUT", rows: [] };
  }
  if (!Number.isFinite(hold) || hold <= 0) {
    return { status: "UNRESOLVED", code: "HOLD_LENGTH_UNPUBLISHED", rows: [] };
  }
  if (!Number.isFinite(kerf) || kerf < 0) {
    return { status: "UNRESOLVED", code: "KERF_UNPUBLISHED", rows: [] };
  }

  const rows = [];
  for (const len of pieces) {
    let selected = null;
    for (const row of rows) {
      if (row.remainingIn - len - kerf >= hold - 1e-9) {
        selected = row;
        break;
      }
    }
    if (!selected) {
      const establishKerf = establishAngledEnd ? kerf : 0;
      const startRemaining = parent - establishKerf;
      if (startRemaining - len - kerf < hold - 1e-9) {
        return {
          status: "UNRESOLVED",
          code: "LAST_REMAIN_BELOW_ROTOR_SAW_CENTER",
          holdIn: hold,
          kerfIn: kerf,
          parentLengthIn: parent,
          rows
        };
      }
      selected = {
        parentLengthIn: parent,
        establishAngledEnd,
        cuts: [],
        remainingIn: startRemaining,
        establishKerfIn: establishKerf
      };
      rows.push(selected);
    }
    const before = selected.remainingIn;
    selected.remainingIn = Number((selected.remainingIn - len - kerf).toFixed(6));
    selected.cuts.push({
      partLengthIn: len,
      kerfIn: kerf,
      retainedBeforeIn: Number(before.toFixed(6)),
      retainedAfterIn: selected.remainingIn,
      holdRequiredIn: hold,
      pass: selected.remainingIn >= hold - 1e-9
    });
  }

  const cutCount = pieces.length + (establishAngledEnd ? rows.length : 0);
  return {
    status: "SEQUENCED",
    code: null,
    policyId: D001_STAGE2_ENVELOPE.cutoffControl.id,
    holdIn: hold,
    kerfIn: kerf,
    parentLengthIn: parent,
    sticks: rows.length,
    cutCount,
    indexMoves: pieces.length,
    rows,
    minRetainedAfterIn: Math.min(...rows.flatMap((row) => row.cuts.map((cut) => cut.retainedAfterIn)))
  };
}

export function resolveUserDefinedBoardMaterial(catalog, input = {}) {
  const size = nominalSize(input.sizeKey);
  const finishedLengthIn = Number(input.finishedLengthIn);
  const partQty = Number(input.partQty);
  const angleDeg = Number(input.angleDeg || 0);
  const cutPlane = String(input.cutPlane || "");
  const endIdentity = String(input.endIdentity || "");
  const endRelation = String(input.endRelation || "");
  const lengthDatum = String(input.lengthDatum || "");
  if (!size || !Number.isFinite(finishedLengthIn) || finishedLengthIn <= 0 ||
      !Number.isInteger(partQty) || partQty <= 0) {
    return { status: "UNRESOLVED", code: "INVALID_PART_DEMAND" };
  }
  if (endIdentity !== "both" || endRelation !== "parallel") {
    return {
      status: "UNRESOLVED",
      code: "MATERIAL_NESTING_NOT_DECLARED_FOR_END_RELATION",
      details: { endIdentity, endRelation }
    };
  }
  if (lengthDatum !== "long-long-outer-edge") {
    return {
      status: "UNRESOLVED",
      code: "MATERIAL_NESTING_NOT_DECLARED_FOR_LENGTH_DATUM",
      details: { lengthDatum }
    };
  }

  const offerings = catalog.offerings.filter((item) =>
    item?.offered === true &&
    item.form === "board" &&
    item.species === "spf" &&
    item.grade === "construction" &&
    item.nominalT === size.nominalT &&
    item.nominalW === size.nominalW &&
    Number.isFinite(item.stockL_in) &&
    Number.isFinite(item.sellingPrice)
  );

  const candidates = [];
  const sequenceFailures = [];
  for (const item of offerings) {
    const workpiecePresentation = cutPlane === "bevel-thickness"
      ? D001_STAGE2_ENVELOPE.stock.presentation.edgeException.mode
      : D001_STAGE2_ENVELOPE.stock.presentation.defaultMode;
    const baseFit = envelopeCheck(item, { requiredOps: ["CROSSCUT"], workpiecePresentation });
    if (baseFit.status === "REFUSED") continue;

    const parts = Array.from({ length: partQty }, () => finishedLengthIn);
    const sequence = sequenceCrosscuts({
      parentLengthIn: item.stockL_in,
      parts,
      establishAngledEnd: angleDeg !== 0
    });
    if (sequence.status !== "SEQUENCED") {
      sequenceFailures.push({ storeSku: item.storeSku, stockLengthIn: item.stockL_in, code: sequence.code });
      continue;
    }

    const cutWidth = cutPlane === "bevel-thickness" ? item.actualT : item.actualW;
    const endAllowanceIn = Math.abs(cutWidth * Math.tan(angleDeg * Math.PI / 180));
    const quantity = sequence.sticks;
    const materialTotal = Math.round(quantity * item.sellingPrice * 100) / 100;
    candidates.push({
      status: "MAPPED",
      form: "board",
      storeSku: item.storeSku,
      stockLengthIn: item.stockL_in,
      quantity,
      unitPrice: item.sellingPrice,
      materialTotal,
      sequence,
      rows: sequence.rows,
      endAllowanceIn,
      actualW: item.actualW,
      actualT: item.actualT,
      workpiecePresentation,
      presentedWidthIn: workpiecePresentation === D001_STAGE2_ENVELOPE.stock.presentation.edgeException.mode ? item.actualT : item.actualW,
      presentedThicknessIn: workpiecePresentation === D001_STAGE2_ENVELOPE.stock.presentation.edgeException.mode ? item.actualW : item.actualT,
      supportedOps: item.supportedOps || [],
      cellFamily: item.cellFamily || [],
      modeledWork: {
        parentBoards: quantity,
        finishedParts: partQty,
        cutCount: sequence.cutCount,
        indexMoves: sequence.indexMoves
      }
    });
  }
  if (!candidates.length) {
    const holdFailure = sequenceFailures.find((failure) => failure.code === "LAST_REMAIN_BELOW_ROTOR_SAW_CENTER");
    if (holdFailure) {
      return {
        status: "UNRESOLVED",
        code: "LAST_REMAIN_BELOW_ROTOR_SAW_CENTER",
        policyId: D001_STAGE2_ENVELOPE.cutoffControl.id,
        holdIn: D001_STAGE2_ENVELOPE.cutoffControl.retainedTailIn,
        candidates: sequenceFailures
      };
    }
    return { status: "UNRESOLVED", code: "STORE_STOCK_CONTAINMENT_UNRESOLVED" };
  }
  candidates.sort((a, b) =>
    a.materialTotal - b.materialTotal ||
    a.stockLengthIn - b.stockLengthIn
  );
  return candidates[0];
}

export function evaluateUserDefinedBoardJob(catalog, spec = {}) {
  const materialResolution = resolveUserDefinedBoardMaterial(catalog, spec);
  if (materialResolution.status !== "MAPPED") {
    return {
      status: "UNRESOLVED",
      stage: 2,
      store: "Store Zero",
      jobType: "USER_DEFINED_BOARD_V1",
      materialResolution,
      capability: null,
      estimate: null,
      not_claimed: ["commercial quote", "physical fabrication", "Cycle Start"]
    };
  }
  const item = findSku(catalog, materialResolution.storeSku);
  const requiredOps = Number(spec.angleDeg) === 0 ? ["CROSSCUT"] : ["MITER_LIMITED"];
  const workpiecePresentation = materialResolution.workpiecePresentation ||
    D001_STAGE2_ENVELOPE.stock.presentation.defaultMode;
  const capability = capabilityAnswer(item, requiredOps, {
    workpiecePresentation,
    retainedTailIn: materialResolution.sequence?.minRetainedAfterIn,
    miterAngleDeg: Number(spec.angleDeg),
    miterPlane: Number(spec.angleDeg) === 0 ? null : "FACE",
    bevelAngleDeg: 0
  });
  const stock = stockAnswer(item, materialResolution.quantity);
  let status = "SUPPORTABLE";
  if (capability.status === "REFUSED") status = "REFUSED";
  else if (stock.status === "NOT_ON_HAND" || stock.status === "ON_HAND_SHORT") status = "UNAVAILABLE";

  const estimate = status === "SUPPORTABLE"
    ? estimateUserDefinedMiterReference(catalog, {
        title: spec.title || "User-defined mitered board parts",
        classId: "user-defined-board.miter.v1",
        materialResolution,
        finishedLengthIn: Number(spec.finishedLengthIn),
        faceWidthIn: materialResolution.presentedWidthIn ?? item.actualW
      })
    : null;

  return {
    status,
    stage: 2,
    store: "Store Zero",
    jobType: "USER_DEFINED_BOARD_V1",
    materialResolution,
    stock,
    capability,
    workpiecePresentation,
    cutoffSequence: materialResolution.sequence ?? null,
    estimate,
    not_claimed: [
      "complete price unless estimate supplies a class-scoped recovery",
      "commercial quote",
      "seller-of-record",
      "physical fabrication",
      "Cycle Start",
      "physical stock count"
    ]
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

export { estimateJob, estimatePineAlcove, estimateUserDefinedMiterReference };

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
