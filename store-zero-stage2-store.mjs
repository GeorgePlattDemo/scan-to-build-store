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
import { estimatePineAlcove, estimateJob, estimateBoardPlan } from "./store-zero-pricing-engine.mjs";
import { D001_STAGE2_ENVELOPE, envelopeCheck } from "./d001-stage2-envelope.mjs";

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

export const BOARD_SEQUENCE_POLICY = Object.freeze({
  id: "FEWEST_PARENTS_THEN_SHORTEST_PARENT",
  basis: "TASK_FALLBACK_NO_EXISTING_MULTI_PART_SELECTION_POLICY",
  claimsCheapest: false,
  claimsLeastWaste: false
});

export const BOARD_SEQUENCE_RULES = Object.freeze({
  kerfIn: 0.125,
  retainedControlTailIn: D001_STAGE2_ENVELOPE.stock.minControlledLengthIn,
  presentation: "2X4_WIDE_FACE_ON_TABLE",
  separatingCutRule: "ONE_SEPARATOR_MAY_END_ONE_PART_AND_BEGIN_THE_NEXT_WHEN_ENDS_ARE_PARALLEL"
});

function finitePositive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function integerPositive(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function sequenceCandidate(item, demand, capability) {
  const finishedLengthIn = finitePositive(demand.finishedPartLengthIn);
  const quantity = integerPositive(demand.quantity);
  if (finishedLengthIn == null || quantity == null) {
    return { feasible: false, reason: "FINISHED_PART_DEMAND_INVALID", item, capability };
  }

  const kerfIn = BOARD_SEQUENCE_RULES.kerfIn;
  const retainedTailIn = BOARD_SEQUENCE_RULES.retainedControlTailIn;
  const angleDeg = Number(demand.sawAngleDeg);
  const requestedBlank = demand.requestedFinishedBlankLengthIn == null
    ? null
    : finitePositive(demand.requestedFinishedBlankLengthIn);
  if (demand.requestedFinishedBlankLengthIn != null && requestedBlank == null) {
    return { feasible: false, reason: "REQUESTED_FINISHED_BLANK_INVALID", item, capability };
  }

  const parentLengthIn = Number(item.stockL_in);
  const workingLengthIn = requestedBlank ?? parentLengthIn;
  if (!Number.isFinite(parentLengthIn) || workingLengthIn > parentLengthIn) {
    return { feasible: false, reason: "PARENT_SHORTER_THAN_REQUIRED_BLANK", item, capability };
  }

  let prep = null;
  if (requestedBlank != null && requestedBlank < parentLengthIn) {
    const prepRemainderIn = Number((parentLengthIn - requestedBlank - kerfIn).toFixed(6));
    if (prepRemainderIn < retainedTailIn) {
      return {
        feasible: false,
        reason: "PREP_CUT_VIOLATES_RETAINED_CONTROL_TAIL",
        item,
        capability,
        preparation: {
          required: true,
          reason: "REQUESTED_FINISHED_BLANK",
          source: demand.requestedFinishedBlankSource ?? "DEMAND.REQUESTED_FINISHED_BLANK",
          inputLengthIn: parentLengthIn,
          outputLengthIn: requestedBlank,
          kerfLossIn: kerfIn,
          parentRemainderIn: prepRemainderIn
        }
      };
    }
    prep = {
      required: true,
      operation: "CROSSCUT",
      reason: "REQUESTED_FINISHED_BLANK",
      source: demand.requestedFinishedBlankSource ?? "DEMAND.REQUESTED_FINISHED_BLANK",
      inputLengthIn: parentLengthIn,
      outputLengthIn: requestedBlank,
      kerfLossIn: kerfIn,
      parentRemainderIn: prepRemainderIn,
      economics: "INCLUDED_AS_ONE_MODELED_SAW_CYCLE_PER_PARENT"
    };
  }

  const establishCut = angleDeg !== 0 ? 1 : 0;
  const usableForParts = workingLengthIn - establishCut * kerfIn - retainedTailIn;
  const perPartDemandIn = finishedLengthIn + kerfIn;
  const partsPerParent = Math.floor((usableForParts + 1e-9) / perPartDemandIn);
  if (partsPerParent < 1) {
    return {
      feasible: false,
      reason: "INSUFFICIENT_PARENT_FOR_FINISHED_DEMAND_AND_RETAINED_TAIL",
      item,
      capability,
      finishedPartLengthIn: finishedLengthIn,
      retainedTailIn
    };
  }

  const parentCount = Math.ceil(quantity / partsPerParent);
  const stock = stockAnswer(item, parentCount);
  if (!stock.sufficient) {
    return { feasible: false, reason: "PARENT_QUANTITY_UNAVAILABLE", item, capability, stock, parentCount };
  }

  const parents = [];
  let partsRemaining = quantity;
  let productionSawCuts = 0;
  let preparationSawCuts = 0;
  for (let parentIndex = 0; parentIndex < parentCount; parentIndex += 1) {
    const producedParts = Math.min(partsPerParent, partsRemaining);
    partsRemaining -= producedParts;
    let remainderIn = workingLengthIn;
    const operations = [];
    if (prep) {
      preparationSawCuts += 1;
      operations.push({
        sequence: operations.length + 1,
        operation: "PREPARE_FINISHED_BLANK",
        machineOperation: "CROSSCUT",
        reason: prep.reason,
        source: prep.source,
        inputLengthIn: prep.inputLengthIn,
        outputLengthIn: prep.outputLengthIn,
        kerfLossIn: prep.kerfLossIn
      });
    }
    if (establishCut) {
      remainderIn = Number((remainderIn - kerfIn).toFixed(6));
      productionSawCuts += 1;
      operations.push({
        sequence: operations.length + 1,
        operation: "ESTABLISH_FIRST_END",
        machineOperation: "MITER_LIMITED",
        angleDeg,
        cutPlane: demand.cutPlane,
        kerfLossIn: kerfIn
      });
    }
    for (let partIndex = 0; partIndex < producedParts; partIndex += 1) {
      remainderIn = Number((remainderIn - finishedLengthIn - kerfIn).toFixed(6));
      productionSawCuts += 1;
      operations.push({
        sequence: operations.length + 1,
        operation: "SEPARATE_FINISHED_PART",
        machineOperation: angleDeg === 0 ? "CROSSCUT" : "MITER_LIMITED",
        partNumber: quantity - partsRemaining - producedParts + partIndex + 1,
        finishedLengthIn,
        lengthDatum: demand.lengthDatum,
        angleDeg,
        cutPlane: demand.cutPlane,
        endIdentity: demand.endIdentity,
        endRelation: demand.endRelation,
        kerfLossIn: kerfIn,
        sharedBoundaryWithNextPart: angleDeg !== 0 && partIndex < producedParts - 1
      });
    }
    parents.push({
      parentNumber: parentIndex + 1,
      storeSku: item.storeSku,
      parentStockLengthIn: parentLengthIn,
      workingLengthIn,
      producedParts,
      remainderIn,
      retainedControlTailIn: retainedTailIn,
      retainedControlSatisfied: remainderIn >= retainedTailIn,
      operations
    });
  }

  return {
    feasible: true,
    item,
    capability,
    stock,
    parentCount,
    partsPerParent,
    parentLengthIn,
    workingLengthIn,
    remainderIn: parents.length === 1 ? parents[0].remainderIn : null,
    parents,
    preparation: prep ? parents.map((parent) => parent.operations[0]).filter((op) => op?.operation === "PREPARE_FINISHED_BLANK") : [],
    accounting: {
      productionSawCuts,
      preparationSawCuts,
      totalModeledSawCuts: productionSawCuts + preparationSawCuts
    }
  };
}

export function resolveBoardMaterial(catalog, demand = {}) {
  const finishedPartLengthIn = finitePositive(demand.finishedPartLengthIn);
  const quantity = integerPositive(demand.quantity);
  const sawAngleDeg = Number(demand.sawAngleDeg);
  if (finishedPartLengthIn == null || quantity == null || !Number.isFinite(sawAngleDeg)) {
    return {
      status: "UNRESOLVED",
      reason: "FINISHED_PART_DEMAND_INVALID",
      finishedPartLengthIn,
      quantity
    };
  }

  const requiredOps = sawAngleDeg === 0 ? ["CROSSCUT"] : ["MITER_LIMITED"];
  for (const op of Array.isArray(demand.requiredOps) ? demand.requiredOps : []) {
    if (!requiredOps.includes(op)) requiredOps.push(op);
  }

  const candidates = offerMaterial(catalog, {
    species: demand.species,
    form: demand.form || "board",
    nominalT: demand.nominalT,
    nominalW: demand.nominalW
  });

  const considered = candidates.map((item) => {
    const capability = capabilityAnswer(item, requiredOps, {
      finishedPartLengthIn,
      sawAngleDeg,
      cutPlane: demand.cutPlane,
      spotDemand: demand.spotDemand
    });
    if (capability.status === "REFUSED") {
      return {
        feasible: false,
        reason: "CAPABILITY_REFUSED",
        item,
        capability
      };
    }
    return sequenceCandidate(item, { ...demand, finishedPartLengthIn, quantity, sawAngleDeg }, capability);
  });

  const feasible = considered
    .filter((entry) => entry.feasible)
    .sort((a, b) =>
      a.parentCount - b.parentCount ||
      a.parentLengthIn - b.parentLengthIn ||
      String(a.item.storeSku).localeCompare(String(b.item.storeSku))
    );

  const selected = feasible[0] ?? null;
  if (!selected) {
    const capabilityRefusals = considered.flatMap((entry) => entry.capability?.missing ?? []);
    return {
      status: capabilityRefusals.length ? "REFUSED" : "UNAVAILABLE",
      reason: capabilityRefusals.length ? "NO_ELIGIBLE_STORE_STOCK_WITHIN_CAPABILITY" : "NO_ELIGIBLE_STORE_STOCK_SEQUENCE",
      finishedPartLengthIn,
      quantity,
      selectionPolicy: BOARD_SEQUENCE_POLICY,
      considered,
      refusalConditions: [...new Set(capabilityRefusals)]
    };
  }

  const unresolved = [
    ...new Set([
      ...(selected.capability?.unresolved ?? [])
    ])
  ];
  const planId = [
    "BOARD-PLAN",
    selected.item.storeSku,
    quantity,
    String(finishedPartLengthIn).replace(".", "_"),
    String(sawAngleDeg).replace(".", "_")
  ].join("-");

  const plan = {
    planId,
    selectionPolicy: BOARD_SEQUENCE_POLICY,
    sequenceRules: BOARD_SEQUENCE_RULES,
    selected: {
      storeSku: selected.item.storeSku,
      parentStockLengthIn: selected.parentLengthIn,
      parentCount: selected.parentCount,
      unitPrice: selected.item.sellingPrice,
      materialTotal: Number((selected.item.sellingPrice * selected.parentCount).toFixed(2))
    },
    finishedPart: {
      lengthIn: finishedPartLengthIn,
      quantity,
      lengthDatum: demand.lengthDatum,
      angleDeg: sawAngleDeg,
      cutPlane: demand.cutPlane,
      endIdentity: demand.endIdentity,
      endRelation: demand.endRelation
    },
    intermediateBlank: demand.requestedFinishedBlankLengthIn == null
      ? null
      : {
          lengthIn: Number(demand.requestedFinishedBlankLengthIn),
          reason: "REQUESTED_FINISHED_BLANK",
          source: demand.requestedFinishedBlankSource ?? "DEMAND.REQUESTED_FINISHED_BLANK"
        },
    preparation: selected.preparation,
    parents: selected.parents,
    accounting: selected.accounting,
    unresolvedConditions: unresolved,
    noPreparationRequired: selected.preparation.length === 0
  };

  return {
    status: "MAPPED",
    reason: unresolved.length ? "MAPPED_WITH_UNRESOLVED_OPERATION_DETAIL" : null,
    item: selected.item,
    storeSku: selected.item.storeSku,
    pricingReferenceSku: selected.item.storeSku,
    pricingReferenceStockLengthIn: selected.parentLengthIn,
    parentCount: selected.parentCount,
    allocationClaimed: false,
    finishedPartLengthIn,
    quantity,
    stock: selected.stock,
    price: priceAnswer(selected.item),
    capability: selected.capability,
    selectionPolicy: BOARD_SEQUENCE_POLICY,
    plan,
    considered
  };
}

export function estimateResolvedBoardPlan(catalog, materialResolution, { title, classId = "user_defined_board", spotCycles = 0 } = {}) {
  if (!materialResolution?.plan) {
    return { status: "UNRESOLVED", reason: "RESOLVED_BOARD_PLAN_REQUIRED", title };
  }
  return estimateBoardPlan(catalog, {
    title,
    classId,
    plan: materialResolution.plan,
    spotCycles
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
