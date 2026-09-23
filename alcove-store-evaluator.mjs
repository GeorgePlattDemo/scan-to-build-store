import {
  STORE_EVALUATION_FRESHNESS,
  capabilityAnswer,
  findSku,
  loadCatalog,
  offerMaterial,
  priceAnswer,
  stockAnswer
} from "./store-zero-stage2-store.mjs";
import { D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";
import { calculationHash, D001_TRAVEL_STANDARD } from "./d001-travel-standard.mjs";

export const ALCOVE_STORE_STANDARD = Object.freeze({
  id: "STB-ALCOVE-STORE-REQUEST-0.1",
  classId: "alcove.insert.square_shelves",
  completeMachineEconomics: false,
  unresolvedMachineCondition: "ALCOVE_WHOLE_BOARD_TRAVEL_STANDARD_REQUIRED",
  rule: "PROJECT_DERIVES_DEMAND_STORE_RESOLVES_SKU_STOCK_PRICE_CAPABILITY"
});

function round(value, places = 2) {
  const m = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * m) / m;
}

function currentStoreRevision(demand = {}, request = {}) {
  return String(
    request.storeRevision ||
    process.env.STB_STORE_REVISION ||
    demand.storeRevision ||
    "LOCAL_UNPINNED_STORE_REVISION"
  );
}

function storeAuthority(catalog, storeRevision) {
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
    },
    alcoveStandard: {
      id: ALCOVE_STORE_STANDARD.id,
      hash: calculationHash(ALCOVE_STORE_STANDARD)
    }
  };
}

function spotFeatureForCapability(spotDemand) {
  if (!spotDemand || spotDemand.enabled !== true) return null;
  const first = Array.isArray(spotDemand.features) ? spotDemand.features[0] : null;
  return {
    required: true,
    mode: spotDemand.mode || "SPOT_ON_LOCATION",
    locationRule: first?.reference || spotDemand.locationRule || null,
    locationAlongLengthIn: first?.xIn ?? first?.partRelativeXIn ?? null,
    acrossWidthRule: first?.acrossWidthRule || spotDemand.acrossWidthRule || null
  };
}

function evaluateBoardRequirement(catalog, demand, requirement) {
  const materialDemand = demand.materialDemand || {};
  const candidates = offerMaterial(catalog, {
    species: materialDemand.species,
    form: materialDemand.form || "board",
    nominalT: materialDemand.nominalT,
    nominalW: materialDemand.nominalW,
    stockL_in: Number(requirement.stockLengthIn)
  }).filter((item) => !materialDemand.grade || item.grade === materialDemand.grade);

  const item = candidates
    .slice()
    .sort((a, b) =>
      Number(a.sellingPrice) - Number(b.sellingPrice) ||
      String(a.storeSku).localeCompare(String(b.storeSku))
    )[0] || null;

  const qty = Number(requirement.qty);
  const requiredOps = Array.isArray(requirement.requiredOps)
    ? [...requirement.requiredOps]
    : ["CROSSCUT"];
  if (requirement.carriesSpotDemand === true && demand.spotDemand?.enabled === true) {
    if (!requiredOps.includes("SPOT_ON_LOCATION")) requiredOps.push("SPOT_ON_LOCATION");
  }

  const stock = stockAnswer(item, Number.isFinite(qty) ? qty : 0);
  const price = priceAnswer(item);
  const spotDemand = requirement.carriesSpotDemand === true
    ? spotFeatureForCapability(demand.spotDemand)
    : null;
  let capability = capabilityAnswer(item, requiredOps, {
    keptLengthIn: Number(requirement.keptLengthIn),
    spotDemand
  });

  if (
    item &&
    Number.isFinite(Number(requirement.keptLengthIn)) &&
    Number(requirement.keptLengthIn) > Number(item.stockL_in)
  ) {
    capability = {
      ...capability,
      status: "REFUSED",
      missing: [
        "KEPT_LENGTH_EXCEEDS_STOCK_LENGTH",
        ...((capability && Array.isArray(capability.missing)) ? capability.missing : [])
      ]
    };
  }

  let status;
  if (!item) status = "UNAVAILABLE";
  else if (capability.status === "REFUSED") status = "REFUSED";
  else if (price.status === "UNRESOLVED" || capability.status === "UNRESOLVED") status = "UNRESOLVED";
  else if (stock.status === "NOT_ON_HAND" || stock.status === "ON_HAND_SHORT") status = "UNAVAILABLE";
  else status = "SUPPORTABLE";

  const extension = item && Number.isFinite(qty) && price.status !== "UNRESOLVED"
    ? round(Number(item.sellingPrice) * qty, 2)
    : null;

  return {
    requirementId: String(requirement.requirementId || ""),
    role: String(requirement.role || ""),
    status,
    demandedStockLengthIn: Number(requirement.stockLengthIn),
    keptLengthIn: Number(requirement.keptLengthIn),
    qty,
    requiredOps,
    storeSku: item?.storeSku || null,
    description: item?.description || null,
    stock,
    price,
    capability,
    extension,
    selectionPolicy: "EXACT_PROJECT_STOCK_LENGTH_CLASS_STORE_SKU_BY_MATERIAL"
  };
}

function evaluateHardware(catalog, demand) {
  const hardware = demand.hardwareDemand || null;
  if (!hardware) return null;
  const item = findSku(catalog, hardware.storeSku);
  const qty = Number.isFinite(Number(hardware.qty)) ? Number(hardware.qty) : 1;
  const stock = stockAnswer(item, qty);
  const price = priceAnswer(item);
  const status = !item
    ? "UNAVAILABLE"
    : price.status === "UNRESOLVED"
      ? "UNRESOLVED"
      : stock.sufficient === true
        ? "SUPPORTABLE"
        : "UNAVAILABLE";
  return {
    status,
    storeSku: hardware.storeSku,
    qty,
    description: item?.description || null,
    stock,
    price,
    extension: item && price.status !== "UNRESOLVED"
      ? round(Number(item.sellingPrice) * qty, 2)
      : null
  };
}

export function evaluateAlcoveJob(catalog, demand = {}) {
  const requirements = Array.isArray(demand.boardRequirements)
    ? demand.boardRequirements
    : [];
  if (!requirements.length) {
    return {
      title: demand.title || "Alcove insert",
      classId: demand.classId || ALCOVE_STORE_STANDARD.classId,
      stage: 2,
      store: "Store Zero",
      status: "UNRESOLVED",
      complete: false,
      unresolvedConditions: ["ALCOVE_BOARD_REQUIREMENTS_REQUIRED"],
      lines: [],
      hardwareLine: null,
      estimate: null,
      calculationIdentity: null,
      not_claimed: ["commercial quote", "physical fabrication", "live motion"]
    };
  }

  const lines = requirements.map((requirement) =>
    evaluateBoardRequirement(catalog, demand, requirement)
  );
  const hardwareLine = evaluateHardware(catalog, demand);

  const material = lines.every((line) => Number.isFinite(Number(line.extension)))
    ? round(lines.reduce((sum, line) => sum + Number(line.extension), 0), 2)
    : null;
  const hardware = hardwareLine == null
    ? 0
    : Number.isFinite(Number(hardwareLine.extension))
      ? round(Number(hardwareLine.extension), 2)
      : null;

  const statuses = [
    ...lines.map((line) => line.status),
    ...(hardwareLine ? [hardwareLine.status] : [])
  ];
  let status;
  if (statuses.includes("REFUSED")) status = "REFUSED";
  else if (statuses.includes("UNAVAILABLE")) status = "UNAVAILABLE";
  else if (statuses.includes("UNRESOLVED")) status = "UNRESOLVED";
  else status = "UNRESOLVED";

  const unresolvedConditions = [];
  if (!statuses.includes("REFUSED") && !statuses.includes("UNAVAILABLE")) {
    unresolvedConditions.push(ALCOVE_STORE_STANDARD.unresolvedMachineCondition);
  }
  if (demand.spotDemand?.enabled === true) {
    const spotLine = lines.find((line) => line.requiredOps.includes("SPOT_ON_LOCATION"));
    if (spotLine?.capability?.status === "REFUSED") {
      unresolvedConditions.push("ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE");
    }
  }

  const estimate = {
    status: "PARTIAL_BUDGETARY_ESTIMATE",
    complete: false,
    completeness: "ALCOVE_MACHINE_TRAVEL_STANDARD_REQUIRED",
    documentKind: "BudgetaryEstimate",
    totals: {
      material,
      hardware,
      machine_service: null,
      Q: null,
      Q_basis: "UNRESOLVED"
    },
    unresolvedConditions: [
      ALCOVE_STORE_STANDARD.unresolvedMachineCondition
    ],
    note: "Current Store material, stock, price and declared capability are evaluated. Complete Alcove machine time/service/Q is withheld until the whole-board travel standard is declared."
  };

  const resultCore = {
    standard: ALCOVE_STORE_STANDARD.id,
    status,
    materialDemand: demand.materialDemand || null,
    boardRequirements: requirements,
    spotDemand: demand.spotDemand || null,
    lines: lines.map((line) => ({
      requirementId: line.requirementId,
      status: line.status,
      storeSku: line.storeSku,
      qty: line.qty,
      demandedStockLengthIn: line.demandedStockLengthIn,
      keptLengthIn: line.keptLengthIn,
      requiredOps: line.requiredOps,
      stockStatus: line.stock?.status || null,
      sellingPrice: line.price?.sellingPrice ?? null,
      extension: line.extension,
      capabilityStatus: line.capability?.status || null
    })),
    hardwareLine: hardwareLine
      ? {
          status: hardwareLine.status,
          storeSku: hardwareLine.storeSku,
          qty: hardwareLine.qty,
          sellingPrice: hardwareLine.price?.sellingPrice ?? null,
          extension: hardwareLine.extension
        }
      : null,
    totals: estimate.totals,
    unresolvedConditions
  };

  return {
    title: demand.title || "Alcove insert",
    classId: demand.classId || ALCOVE_STORE_STANDARD.classId,
    stage: 2,
    store: "Store Zero",
    status,
    complete: false,
    materialResolution: {
      status: lines.every((line) => line.storeSku) ? "MAPPED" : status,
      species: demand.materialDemand?.species || null,
      selectionPolicy: "EXACT_PROJECT_STOCK_LENGTH_CLASS_STORE_SKU_BY_MATERIAL",
      storeSkus: lines.map((line) => line.storeSku).filter(Boolean)
    },
    lines,
    hardwareLine,
    estimate,
    unresolvedConditions,
    calculationIdentity: {
      inputHash: calculationHash({
        standard: ALCOVE_STORE_STANDARD.id,
        demand
      }),
      resultHash: calculationHash(resultCore)
    },
    not_claimed: [
      "complete dimensional Q",
      "commercial quote",
      "seller-of-record",
      "physical fabrication",
      "live motion",
      "measured machine performance"
    ]
  };
}

export function evaluateAlcoveStoreRequest(catalog, demand = {}, request = {}) {
  const requestId = String(request.requestId || "").trim();
  if (!requestId) {
    return {
      title: demand.title || "Alcove insert",
      classId: demand.classId || ALCOVE_STORE_STANDARD.classId,
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
  const authority = storeAuthority(catalog, storeRevision);
  const evaluation = evaluateAlcoveJob(catalog, {
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

export function requestAlcoveStoreEvaluation(demand = {}, request = {}) {
  return evaluateAlcoveStoreRequest(loadCatalog(), demand, request);
}
