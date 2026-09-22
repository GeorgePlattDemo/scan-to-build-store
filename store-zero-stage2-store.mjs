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
import { envelopeCheck } from "./d001-stage2-envelope.mjs";

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

export function evaluateDimensionalTravelJob(catalog, demand = {}) {
  const parts = Array.isArray(demand.parts) ? demand.parts : [];
  const firstSpot = parts
    .flatMap((part) => Array.isArray(part?.features) ? part.features : [])
    .find((feature) => feature?.kind === "SPOT_ON_LOCATION") || null;

  const requiredOps = Array.isArray(demand.requiredOps) && demand.requiredOps.length
    ? [...demand.requiredOps]
    : ["MITER_LIMITED"];

  const materialResolution = resolveBoardMaterial(catalog, {
    ...(demand.materialDemand || {}),
    definedWorkpieceLengthIn: demand.definedWorkpieceLengthIn,
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
    definedWorkpieceLengthIn: demand.definedWorkpieceLengthIn,
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
      workpieceLengthIn: demand.definedWorkpieceLengthIn
    },
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
