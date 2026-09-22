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
import { estimatePineAlcove, estimateJob, estimateUserDefinedBoardTravel } from "./store-zero-pricing-engine.mjs";
import { D001_STAGE2_ENVELOPE, envelopeCheck } from "./d001-stage2-envelope.mjs";
import { calculationHash, D001_TRAVEL_STANDARD } from "./d001-travel-standard.mjs";

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

export const STORE_EVALUATION_FRESHNESS = Object.freeze({
  id: "STB-STORE-FRESH-EVALUATION-0.1",
  rule: "EVERY_STORE_REQUEST_REEVALUATES_CURRENT_STORE_STATE",
  priorAnswerMayAuthorizeNewRequest: false,
  priorReceiptMayAuthorizeNewRequest: false
});

function currentStoreRevision(demand = {}, request = {}) {
  return String(
    request.storeRevision ||
    process.env.STB_STORE_REVISION ||
    demand.storeRevision ||
    "LOCAL_UNPINNED_STORE_REVISION"
  );
}

function storeEvaluationAuthority(catalog, storeRevision) {
  return {
    storeRevision,
    catalogHash: calculationHash(catalog),
    machineEnvelope: {
      id: D001_STAGE2_ENVELOPE.id,
      hash: calculationHash(D001_STAGE2_ENVELOPE)
    },
    travelStandard: {
      id: D001_TRAVEL_STANDARD.id,
      version: D001_TRAVEL_STANDARD.version,
      hash: calculationHash(D001_TRAVEL_STANDARD)
    },
    economics: {
      id: D001_TRAVEL_STANDARD.economics.id,
      version: D001_TRAVEL_STANDARD.economics.version,
      hash: calculationHash(D001_TRAVEL_STANDARD.economics)
    }
  };
}

export function evaluateDimensionalStoreRequest(catalog, demand = {}, request = {}) {
  const requestId = String(request.requestId || "").trim();
  if (!requestId) {
    return {
      title: demand.title || "Dimensional travel job",
      stage: 2,
      store: "Store Zero",
      status: "UNRESOLVED",
      complete: false,
      freshEvaluation: false,
      unresolvedConditions: ["STORE_EVALUATION_REQUEST_ID_REQUIRED"],
      estimate: null,
      calculationIdentity: null,
      evaluationReceipt: null,
      not_claimed: ["commercial quote", "physical fabrication", "live motion"]
    };
  }

  const evaluatedAt = String(request.evaluatedAt || new Date().toISOString());
  const storeRevision = currentStoreRevision(demand, request);
  const authority = storeEvaluationAuthority(catalog, storeRevision);

  // Deliberately call the governing evaluator for every Store request.
  // No prior Store answer or receipt is accepted as an input to this function.
  const evaluation = evaluateDimensionalTravelJob(catalog, {
    ...demand,
    storeRevision
  });

  const receiptCore = {
    freshnessRule: STORE_EVALUATION_FRESHNESS.id,
    requestId,
    evaluatedAt,
    authority,
    demandHash: calculationHash(demand),
    status: evaluation.status,
    calculationIdentity: evaluation.calculationIdentity || null
  };

  return {
    ...evaluation,
    freshEvaluation: true,
    evaluationReceipt: Object.freeze({
      ...receiptCore,
      receiptHash: calculationHash(receiptCore)
    })
  };
}

export function requestDimensionalStoreEvaluation(demand = {}, request = {}) {
  // Reload Store catalog state on every formal Store request.
  return evaluateDimensionalStoreRequest(loadCatalog(), demand, request);
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

export function resolveBoardMaterial(catalog, demand = {}) {
  const definedWorkpieceLengthIn = Number(demand.definedWorkpieceLengthIn);
  const qty = Number.isFinite(Number(demand.qty)) ? Number(demand.qty) : 1;
  const requiredOps = Array.isArray(demand.requiredOps) ? demand.requiredOps : [];
  const feature = {
    keptLengthIn: definedWorkpieceLengthIn,
    sawAngleDeg: demand.sawAngleDeg,
    cutPlane: demand.cutPlane,
    spotDemand: demand.spotDemand,
    millYIn: demand.millYIn,
    millDepthIn: demand.millDepthIn
  };
  const candidates = offerMaterial(catalog, {
    species: demand.species,
    form: demand.form || "board",
    nominalT: demand.nominalT,
    nominalW: demand.nominalW
  })
    .filter((item) =>
      Number.isFinite(definedWorkpieceLengthIn)
        ? Number(item.stockL_in) >= definedWorkpieceLengthIn
        : true
    )
    .sort((a, b) => Number(a.stockL_in) - Number(b.stockL_in) || Number(a.sellingPrice) - Number(b.sellingPrice));

  const considered = candidates.map((item) => ({
    item,
    stock: stockAnswer(item, qty),
    price: priceAnswer(item),
    capability: capabilityAnswer(item, requiredOps, feature)
  }));
  const mapped = considered.find((entry) =>
    entry.stock.sufficient === true &&
    entry.price.status !== "UNRESOLVED" &&
    entry.capability.status === "SUPPORTABLE"
  );
  if (mapped) {
    return {
      status: "MAPPED",
      item: mapped.item,
      storeSku: mapped.item.storeSku,
      pricingReferenceSku: mapped.item.storeSku,
      pricingReferenceStockLengthIn: mapped.item.stockL_in,
      allocationClaimed: false,
      workpieceLengthIn: definedWorkpieceLengthIn,
      stock: mapped.stock,
      price: mapped.price,
      capability: mapped.capability
    };
  }
  if (!candidates.length) {
    return { status: "UNAVAILABLE", reason: "NO_MATCHING_BOARD_OFFERING", workpieceLengthIn: definedWorkpieceLengthIn };
  }
  if (considered.some((entry) => entry.capability.status === "UNRESOLVED")) {
    return { status: "UNRESOLVED", reason: "CAPABILITY_INPUT_UNRESOLVED", considered };
  }
  if (considered.every((entry) => entry.capability.status === "REFUSED")) {
    return { status: "REFUSED", reason: "NO_MATCHING_BOARD_WITHIN_ENVELOPE", considered };
  }
  return { status: "UNAVAILABLE", reason: "MATCHING_BOARD_NOT_AVAILABLE", considered };
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
  if (env.status === "UNRESOLVED") {
    return {
      status: "UNRESOLVED",
      unresolved: env.unresolved,
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
      sawAngleDeg: line.sawAngleDeg,
      cutPlane: line.cutPlane,
      spotDemand: line.spotDemand,
      millYIn: line.millYIn,
      millDepthIn: line.millDepthIn
    });
    if (!item || price.status === "UNRESOLVED" || cap.status === "UNRESOLVED") unresolved = true;
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

export const DIMENSIONAL_WORKPIECE_POLICY = Object.freeze({
  PRESERVE_DEFINED: "PRESERVE_DEFINED",
  GROW_TO_RETAINED_CONTROL: "GROW_TO_RETAINED_CONTROL"
});

function roundWorkpiece(value) {
  return Math.round(Number(value) * 1000000) / 1000000;
}

export function resolveDimensionalWorkpiece(demand = {}) {
  const requested = Number(demand.definedWorkpieceLengthIn);
  const parts = Array.isArray(demand.parts) ? demand.parts : [];
  const partLengths = parts.map((part) => Number(part?.lengthIn));
  const kerfIn = Number(D001_TRAVEL_STANDARD.control.kerfIn);
  const minRetainedControlIn = Number(D001_TRAVEL_STANDARD.control.minRetainedControlIn);
  const policy = String(
    demand.workpiecePolicy || DIMENSIONAL_WORKPIECE_POLICY.PRESERVE_DEFINED
  );

  if (!Number.isFinite(requested) || requested <= 0) {
    return {
      status: "UNRESOLVED",
      reason: "DEFINED_WORKPIECE_LENGTH_REQUIRED",
      requestedDefinedWorkpieceLengthIn: Number.isFinite(requested) ? requested : null,
      requiredMinimumWorkpieceLengthIn: null,
      definedWorkpieceLengthIn: null,
      adjusted: false,
      policy
    };
  }
  if (!parts.length || partLengths.some((lengthIn) => !Number.isFinite(lengthIn) || lengthIn <= 0)) {
    return {
      status: "UNRESOLVED",
      reason: "IDENTIFIED_PART_LENGTHS_REQUIRED",
      requestedDefinedWorkpieceLengthIn: requested,
      requiredMinimumWorkpieceLengthIn: null,
      definedWorkpieceLengthIn: requested,
      adjusted: false,
      policy
    };
  }

  const requiredMinimumWorkpieceLengthIn = roundWorkpiece(
    minRetainedControlIn +
    kerfIn +
    partLengths.reduce((sum, lengthIn) => sum + lengthIn + kerfIn, 0)
  );
  const mayGrow = policy === DIMENSIONAL_WORKPIECE_POLICY.GROW_TO_RETAINED_CONTROL;
  const definedWorkpieceLengthIn = mayGrow
    ? Math.max(requested, requiredMinimumWorkpieceLengthIn)
    : requested;

  return {
    status: "RESOLVED",
    requestedDefinedWorkpieceLengthIn: requested,
    requiredMinimumWorkpieceLengthIn,
    definedWorkpieceLengthIn: roundWorkpiece(definedWorkpieceLengthIn),
    adjusted: definedWorkpieceLengthIn > requested + 1e-9,
    adjustmentIn: roundWorkpiece(Math.max(0, definedWorkpieceLengthIn - requested)),
    policy,
    basis: "D001_RETAINED_CONTROL_MINIMUM"
  };
}

export function evaluateDimensionalTravelJob(catalog, demand = {}) {
  const parts = Array.isArray(demand.parts) ? demand.parts : [];
  const workpieceResolution = resolveDimensionalWorkpiece(demand);
  const effectiveDefinedWorkpieceLengthIn = workpieceResolution.status === "RESOLVED"
    ? workpieceResolution.definedWorkpieceLengthIn
    : demand.definedWorkpieceLengthIn;
  const firstSpot = parts
    .flatMap((part) => Array.isArray(part?.features) ? part.features : [])
    .find((feature) => feature?.kind === "SPOT_ON_LOCATION") || null;

  const requiredOps = Array.isArray(demand.requiredOps) && demand.requiredOps.length
    ? [...demand.requiredOps]
    : ["MITER_LIMITED"];

  const materialResolution = resolveBoardMaterial(catalog, {
    ...(demand.materialDemand || {}),
    definedWorkpieceLengthIn: effectiveDefinedWorkpieceLengthIn,
    qty: 1,
    requiredOps,
    sawAngleDeg: demand.sawAngleDeg,
    cutPlane: demand.cutPlane,
    spotDemand: firstSpot
      ? {
          required: true,
          mode: "SPOT_ON_LOCATION",
          locationRule: "CENTERED_ON_PART",
          locationAlongLengthIn: firstSpot.xIn,
          acrossWidthRule: firstSpot.acrossWidthRule
        }
      : null
  });

  if (materialResolution.status !== "MAPPED") {
    return {
      title: demand.title || "Dimensional travel job",
      stage: 2,
      store: "Store Zero",
      status: materialResolution.status,
      materialResolution,
      estimate: null,
      calculationIdentity: null,
      not_claimed: ["commercial quote", "physical fabrication", "live motion"]
    };
  }

  const item = materialResolution.item;
  const estimate = estimateUserDefinedBoardTravel(catalog, {
    title: demand.title || "Dimensional travel job",
    classId: demand.classId || "user_defined_board",
    configurationId: demand.configurationId,
    configurationVersion: demand.configurationVersion,
    storeSku: item.storeSku,
    definedWorkpieceLengthIn: effectiveDefinedWorkpieceLengthIn,
    sawAngleDeg: demand.sawAngleDeg,
    cutPlane: demand.cutPlane,
    datumCMethod: demand.datumCMethod || "REFERENCE_CUT",
    parts,
    declaredSawCuts: demand.declaredSawCuts,
    declaredSpotCount: demand.declaredSpotCount,
    unresolvedConditions: demand.unresolvedConditions || [],
    storeRevision: demand.storeRevision || null
  });

  const status = estimate.complete
    ? "SUPPORTABLE"
    : estimate.status === "REFUSED"
      ? "REFUSED"
      : "UNRESOLVED";

  return {
    title: demand.title || "Dimensional travel job",
    stage: 2,
    store: "Store Zero",
    status,
    lines: [{
      storeSku: item.storeSku,
      description: item.description,
      qty: 1,
      stock: materialResolution.stock,
      price: materialResolution.price,
      capability: materialResolution.capability
    }],
    materialResolution: {
      status: materialResolution.status,
      storeSku: item.storeSku,
      pricingReferenceSku: item.storeSku,
      pricingReferenceStockLengthIn: item.stockL_in,
      allocationClaimed: false,
      requestedDefinedWorkpieceLengthIn: workpieceResolution.requestedDefinedWorkpieceLengthIn ?? null,
      requiredMinimumWorkpieceLengthIn: workpieceResolution.requiredMinimumWorkpieceLengthIn ?? null,
      workpieceLengthIn: effectiveDefinedWorkpieceLengthIn,
      workpieceAdjusted: workpieceResolution.adjusted === true,
      workpieceAdjustmentIn: workpieceResolution.adjustmentIn || 0,
      workpiecePolicy: workpieceResolution.policy
    },
    workpieceResolution,
    estimate,
    calculationIdentity: estimate.calculationIdentity || null,
    not_claimed: ["commercial quote", "physical fabrication", "live motion", "measured machine performance"]
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

export { estimateJob, estimatePineAlcove, estimateUserDefinedBoardTravel };
