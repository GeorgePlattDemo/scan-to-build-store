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
import {
  calculationHash,
  D001_TRAVEL_STANDARD,
  evaluateD001DimensionalBatch
} from "./d001-travel-standard.mjs";

export const ALCOVE_STORE_STANDARD = Object.freeze({
  id: "STB-ALCOVE-STORE-REQUEST-0.1",
  classId: "alcove.insert.square_shelves",
  completeMachineEconomics: true,
  unresolvedMachineCondition: "ALCOVE_COMPONENT_PROGRAMS_REQUIRED",
  rule: "PROJECT_DERIVES_DEMAND_STORE_RESOLVES_SKU_STOCK_PRICE_CAPABILITY"
});

function round(value, places = 2) {
  const m = 10 ** places;
  return Math.round((Number(value) + Number.EPSILON) * m) / m;
}

function currentStoreRevision(demand = {}, request = {}) {
  return String(
    request.storeRevision ||
    globalThis.process?.env?.STB_STORE_REVISION ||
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


function requiredOpsForRequirement(requirement, componentPrograms) {
  const ops = new Set(Array.isArray(requirement.requiredOps) ? requirement.requiredOps : ["CROSSCUT"]);
  for (const component of componentPrograms) {
    if (component.requirementId !== requirement.requirementId) continue;
    for (const feature of Array.isArray(component.features) ? component.features : []) {
      if (feature?.kind === "MILL_LONGITUDINAL_PROFILE") ops.add("MILL_LONGITUDINAL_PROFILE");
    }
  }
  return [...ops];
}

function validateComponentMaterialCapacity(lines, componentPrograms) {
  const unresolved = [];
  const refused = [];
  const kerfIn = Number(D001_TRAVEL_STANDARD.control.kerfIn);

  for (const line of lines) {
    const components = componentPrograms
      .filter((component) => component.requirementId === line.requirementId)
      .slice()
      .sort((a, b) => Number(b.finishedLengthIn) - Number(a.finishedLengthIn));
    if (!components.length) {
      unresolved.push("COMPONENT_PROGRAM_MISSING_FOR_REQUIREMENT:" + line.requirementId);
      continue;
    }
    const bins = Array.from({ length: Number(line.qty) }, () =>
      Number(line.demandedStockLengthIn) - kerfIn
    );
    for (const component of components) {
      const need = Number(component.finishedLengthIn) + kerfIn;
      if (!Number.isFinite(need) || need <= kerfIn) {
        unresolved.push("COMPONENT_FINISHED_LENGTH_REQUIRED:" + String(component.componentId || ""));
        continue;
      }
      let placed = false;
      for (let i = 0; i < bins.length; i += 1) {
        if (bins[i] + 1e-9 >= need) {
          bins[i] -= need;
          placed = true;
          break;
        }
      }
      if (!placed) {
        refused.push("COMPONENTS_EXCEED_DECLARED_PARENT_MATERIAL:" + line.requirementId);
        break;
      }
    }
  }

  const knownRequirementIds = new Set(lines.map((line) => line.requirementId));
  for (const component of componentPrograms) {
    if (!knownRequirementIds.has(component.requirementId)) {
      unresolved.push("COMPONENT_REQUIREMENT_ID_NOT_FOUND:" + String(component.requirementId || ""));
    }
  }

  return {
    status: refused.length ? "REFUSED" : unresolved.length ? "UNRESOLVED" : "SUPPORTABLE",
    unresolved,
    refused
  };
}

function componentRunsForStore(catalog, lines, componentPrograms) {
  const lineByRequirement = new Map(lines.map((line) => [line.requirementId, line]));
  return componentPrograms.map((component) => {
    const line = lineByRequirement.get(component.requirementId);
    return {
      component: structuredClone(component),
      item: line?.storeSku ? findSku(catalog, line.storeSku) : null
    };
  });
}

export function evaluateAlcoveJob(catalog, demand = {}) {
  const componentPrograms = Array.isArray(demand.componentPrograms)
    ? demand.componentPrograms
    : [];
  const requirements = Array.isArray(demand.boardRequirements)
    ? demand.boardRequirements.map((requirement) => ({
        ...requirement,
        requiredOps: requiredOpsForRequirement(requirement, componentPrograms)
      }))
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
  const incomingUnresolved = Array.isArray(demand.unresolvedConditions)
    ? demand.unresolvedConditions.filter((value) => typeof value === "string" && value.trim())
    : [];

  const materialCapacity = componentPrograms.length
    ? validateComponentMaterialCapacity(lines, componentPrograms)
    : {
        status: "UNRESOLVED",
        unresolved: [ALCOVE_STORE_STANDARD.unresolvedMachineCondition],
        refused: []
      };

  let batch = null;
  if (
    componentPrograms.length &&
    !statuses.includes("REFUSED") &&
    !statuses.includes("UNAVAILABLE") &&
    materialCapacity.status === "SUPPORTABLE" &&
    incomingUnresolved.length === 0 &&
    demand.spotDemand?.enabled !== true
  ) {
    batch = evaluateD001DimensionalBatch({
      componentRuns: componentRunsForStore(catalog, lines, componentPrograms),
      storeRevision: demand.storeRevision || null
    });
  }

  const unresolvedConditions = [
    ...incomingUnresolved,
    ...(materialCapacity.unresolved || []),
    ...(Array.isArray(batch?.unresolved) ? batch.unresolved : [])
  ];
  const refusalConditions = [
    ...(materialCapacity.refused || []),
    ...(Array.isArray(batch?.reasons) ? batch.reasons : [])
  ];

  if (demand.spotDemand?.enabled === true) {
    const spotLine = lines.find((line) => line.requiredOps.includes("SPOT_ON_LOCATION"));
    if (spotLine?.capability?.status === "REFUSED") {
      unresolvedConditions.push("ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE");
    }
  }

  let status;
  if (statuses.includes("REFUSED") || refusalConditions.length || batch?.status === "REFUSED") status = "REFUSED";
  else if (statuses.includes("UNAVAILABLE")) status = "UNAVAILABLE";
  else if (unresolvedConditions.length || !batch || batch.complete !== true) status = "UNRESOLVED";
  else status = "SUPPORTABLE";

  const machineService = batch?.complete === true ? round(Number(batch.machineService), 2) : null;
  const Q =
    status === "SUPPORTABLE" &&
    Number.isFinite(Number(material)) &&
    Number.isFinite(Number(hardware)) &&
    Number.isFinite(Number(machineService))
      ? round(Number(material) + Number(hardware) + Number(machineService), 2)
      : null;

  const estimate = {
    status: Q == null ? "PARTIAL_BUDGETARY_ESTIMATE" : "BUDGETARY_ESTIMATE",
    complete: Q != null,
    completeness: Q == null
      ? "ALCOVE_COMPONENT_TRAVEL_INCOMPLETE"
      : "COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL",
    documentKind: "BudgetaryEstimate",
    cycle: batch
      ? {
          model: batch.standard.id,
          version: batch.standard.version,
          T_job_min: batch.time.T_MACHINE_min,
          T_job_hr: batch.time.T_MACHINE_hr,
          measured: false,
          commissioned: false
        }
      : null,
    machine: batch,
    totals: {
      material,
      hardware,
      machine_service: machineService,
      Q,
      Q_basis: Q == null ? "UNRESOLVED" : "CALCULATED_FROM_DECLARED_STAGE2_MODEL"
    },
    unresolvedConditions: [...new Set(unresolvedConditions)],
    refusalConditions: [...new Set(refusalConditions)],
    note: Q == null
      ? "Store material/stock/price/capability was evaluated, but the complete component travel record did not support a full Q."
      : "Store material plus the governed D-001 cut/mill component travel model produced this budgetary Q. It is not a commercial quote."
  };

  const resultCore = {
    standard: ALCOVE_STORE_STANDARD.id,
    status,
    materialDemand: demand.materialDemand || null,
    boardRequirements: requirements,
    componentPrograms,
    materialCapacity,
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
    machineCalculationIdentity: batch?.calculationIdentity || null,
    unresolvedConditions,
    refusalConditions
  };

  return {
    title: demand.title || "Alcove insert",
    classId: demand.classId || ALCOVE_STORE_STANDARD.classId,
    stage: 2,
    store: "Store Zero",
    status,
    complete: Q != null,
    materialResolution: {
      status: lines.every((line) => line.storeSku) ? "MAPPED" : status,
      species: demand.materialDemand?.species || null,
      selectionPolicy: "EXACT_PROJECT_STOCK_LENGTH_CLASS_STORE_SKU_BY_MATERIAL",
      storeSkus: lines.map((line) => line.storeSku).filter(Boolean)
    },
    lines,
    hardwareLine,
    materialCapacity,
    componentPrograms,
    machineEvaluation: batch,
    estimate,
    unresolvedConditions: [...new Set(unresolvedConditions)],
    refusalConditions: [...new Set(refusalConditions)],
    calculationIdentity: {
      inputHash: calculationHash({
        standard: ALCOVE_STORE_STANDARD.id,
        demand
      }),
      resultHash: calculationHash(resultCore)
    },
    not_claimed: [
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
