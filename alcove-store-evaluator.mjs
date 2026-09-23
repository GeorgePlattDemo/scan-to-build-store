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


const STORE_HARDWARE_REQUIREMENTS = Object.freeze({
  "ALCOVE-PINS-AND-SCREWS": "STB-ZERO-HW-ALCOVE-PACK-001"
});

function componentsForRequirement(componentPrograms, requirementId) {
  return componentPrograms
    .filter((component) => component?.requirementId === requirementId)
    .slice()
    .sort((a, b) =>
      Number(b.finishedLengthIn) - Number(a.finishedLengthIn) ||
      String(a.componentId || "").localeCompare(String(b.componentId || ""))
    );
}

function packComponentsIntoParents(stockLengthIn, components) {
  const kerfIn = Number(D001_TRAVEL_STANDARD.control.kerfIn);
  const capacityIn = Number(stockLengthIn) - kerfIn;
  if (!Number.isFinite(capacityIn) || capacityIn <= 0 || !components.length) return null;

  const bins = [];
  for (const component of components) {
    const finishedLengthIn = Number(component.finishedLengthIn);
    const needIn = finishedLengthIn + kerfIn;
    if (!Number.isFinite(needIn) || needIn <= kerfIn || needIn > capacityIn + 1e-9) return null;
    let placed = false;
    for (let index = 0; index < bins.length; index += 1) {
      if (bins[index] + 1e-9 >= needIn) {
        bins[index] -= needIn;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push(capacityIn - needIn);
    }
  }
  return {
    qty: bins.length,
    remainingIn: bins.map((value) => round(value, 6))
  };
}

function storeReason(category, code, subject, explanation) {
  return Object.freeze({
    category,
    code,
    subject,
    authority: "STORE_ZERO",
    explanation
  });
}

function evaluateBoardRequirement(catalog, demand, requirement, componentPrograms) {
  const materialDemand = demand.materialDemand || {};
  const components = componentsForRequirement(componentPrograms, requirement.requirementId);
  const requiredOps = Array.isArray(requirement.requiredOps)
    ? [...requirement.requiredOps]
    : ["CROSSCUT"];
  if (requirement.carriesSpotDemand === true && demand.spotDemand?.enabled === true) {
    if (!requiredOps.includes("SPOT_ON_LOCATION")) requiredOps.push("SPOT_ON_LOCATION");
  }

  if (!components.length) {
    return {
      requirementId: String(requirement.requirementId || ""),
      role: String(requirement.role || ""),
      status: "UNRESOLVED",
      demandedStockLengthIn: null,
      keptLengthIn: null,
      qty: null,
      requiredOps,
      storeSku: null,
      description: null,
      stock: { status: "UNRESOLVED", reason: "COMPONENT_PROGRAM_MISSING_FOR_REQUIREMENT" },
      price: { status: "UNRESOLVED", reason: "COMPONENT_PROGRAM_MISSING_FOR_REQUIREMENT" },
      capability: { status: "UNRESOLVED", unresolved: ["COMPONENT_PROGRAM_MISSING_FOR_REQUIREMENT"] },
      extension: null,
      selectionPolicy: "LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING",
      consideredCandidates: [],
      reasonRecord: storeReason(
        "DEFINITION_GAP",
        "COMPONENT_PROGRAM_MISSING_FOR_REQUIREMENT",
        String(requirement.role || requirement.requirementId || "BOARD_REQUIREMENT"),
        "Store cannot choose parent material until the finished components for this requirement are identified."
      )
    };
  }

  const maximumFinishedLengthIn = Math.max(...components.map((component) => Number(component.finishedLengthIn)));
  // The project currently supplies shelf-elevation spot intent, but does not yet
  // bind each spot to an identified physical upright component. Check that the
  // offering declares SPOT_ON_LOCATION via requiredOps, but do not promote the
  // unresolved project reference into Store geometry. The overall evaluation
  // returns ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED until that mapping exists.
  const spotDemand = null;

  const candidates = offerMaterial(catalog, {
    species: materialDemand.species,
    form: materialDemand.form || "board",
    nominalT: materialDemand.nominalT,
    nominalW: materialDemand.nominalW
  })
    .filter((item) => !materialDemand.grade || item.grade === materialDemand.grade)
    .sort((a, b) =>
      Number(a.stockL_in) - Number(b.stockL_in) ||
      Number(a.sellingPrice) - Number(b.sellingPrice) ||
      String(a.storeSku).localeCompare(String(b.storeSku))
    );

  const considered = candidates.map((item) => {
    const packing = packComponentsIntoParents(item.stockL_in, components);
    if (!packing) {
      return {
        item,
        packing: null,
        qty: null,
        stock: stockAnswer(item, 0),
        price: priceAnswer(item),
        capability: capabilityAnswer(item, requiredOps, {
          keptLengthIn: maximumFinishedLengthIn,
          spotDemand
        }),
        extension: null,
        status: "REFUSED",
        reason: "COMPONENTS_DO_NOT_FIT_PARENT_LENGTH"
      };
    }

    const qty = packing.qty;
    const stock = stockAnswer(item, qty);
    const price = priceAnswer(item);
    const capability = capabilityAnswer(item, requiredOps, {
      keptLengthIn: maximumFinishedLengthIn,
      spotDemand
    });
    let status;
    let reason = null;
    if (capability.status === "REFUSED") {
      status = "REFUSED";
      reason = capability.missing?.[0] || "STORE_CAPABILITY_REFUSED";
    } else if (price.status === "UNRESOLVED" || capability.status === "UNRESOLVED") {
      status = "UNRESOLVED";
      reason = price.reason || capability.unresolved?.[0] || "STORE_INPUT_UNRESOLVED";
    } else if (stock.sufficient !== true) {
      status = "UNAVAILABLE";
      reason = stock.status;
    } else {
      status = "SUPPORTABLE";
    }
    return {
      item,
      packing,
      qty,
      stock,
      price,
      capability,
      extension: price.status !== "UNRESOLVED"
        ? round(Number(item.sellingPrice) * qty, 2)
        : null,
      status,
      reason
    };
  });

  const supportive = considered
    .filter((entry) => entry.status === "SUPPORTABLE" && Number.isFinite(Number(entry.extension)))
    .sort((a, b) =>
      Number(a.extension) - Number(b.extension) ||
      Number(a.item.stockL_in) - Number(b.item.stockL_in) ||
      String(a.item.storeSku).localeCompare(String(b.item.storeSku))
    );
  let selected = supportive[0] || null;

  if (!selected) {
    selected = considered
      .slice()
      .sort((a, b) => {
        const rank = { UNRESOLVED: 0, REFUSED: 1, UNAVAILABLE: 2 };
        return (rank[a.status] ?? 9) - (rank[b.status] ?? 9) ||
          Number(a.item.stockL_in) - Number(b.item.stockL_in);
      })[0] || null;
  }

  if (!selected) {
    return {
      requirementId: String(requirement.requirementId || ""),
      role: String(requirement.role || ""),
      status: "UNAVAILABLE",
      demandedStockLengthIn: null,
      keptLengthIn: maximumFinishedLengthIn,
      qty: null,
      requiredOps,
      storeSku: null,
      description: null,
      stock: { status: "UNAVAILABLE", reason: "NO_MATCHING_BOARD_OFFERING" },
      price: { status: "UNRESOLVED", reason: "NO_MATCHING_BOARD_OFFERING" },
      capability: { status: "REFUSED", reason: "NO_OFFERING" },
      extension: null,
      selectionPolicy: "LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING",
      consideredCandidates: [],
      reasonRecord: storeReason(
        "MATERIAL_GAP",
        "NO_MATCHING_BOARD_OFFERING",
        String(requirement.role || requirement.requirementId || "BOARD_REQUIREMENT"),
        "Store has no offered board matching the requested material class."
      )
    };
  }

  const reasonRecord =
    selected.status === "REFUSED"
      ? storeReason(
          "CAPABILITY_GAP",
          selected.reason || "STORE_CAPABILITY_REFUSED",
          String(requirement.role || requirement.requirementId || "BOARD_REQUIREMENT"),
          "Matching Store material exists, but the requested work or parent handling is outside the declared Store capability."
        )
      : selected.status === "UNAVAILABLE"
        ? storeReason(
            "AVAILABILITY_GAP",
            selected.reason || "MATCHING_BOARD_NOT_AVAILABLE",
            String(requirement.role || requirement.requirementId || "BOARD_REQUIREMENT"),
            "A matching Store offering exists, but current declared availability is insufficient for the resolved parent quantity."
          )
        : selected.status === "UNRESOLVED"
          ? storeReason(
              "STORE_DATA_GAP",
              selected.reason || "STORE_INPUT_UNRESOLVED",
              String(requirement.role || requirement.requirementId || "BOARD_REQUIREMENT"),
              "Store has a candidate offering, but a Store-owned price or capability fact remains unresolved."
            )
          : null;

  return {
    requirementId: String(requirement.requirementId || ""),
    role: String(requirement.role || ""),
    status: selected.status,
    demandedStockLengthIn: Number(selected.item.stockL_in),
    keptLengthIn: maximumFinishedLengthIn,
    qty: selected.qty,
    requiredOps,
    storeSku: selected.item.storeSku,
    description: selected.item.description || null,
    stock: selected.stock,
    price: selected.price,
    capability: selected.capability,
    extension: selected.extension,
    packing: selected.packing,
    selectionPolicy: "LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING",
    consideredCandidates: considered.map((entry) => ({
      storeSku: entry.item.storeSku,
      stockLengthIn: entry.item.stockL_in,
      qty: entry.qty,
      materialExtension: entry.extension,
      status: entry.status,
      reason: entry.reason
    })),
    reasonRecord
  };
}

function evaluateHardware(catalog, demand) {
  const hardware = demand.hardwareDemand || null;
  if (!hardware) return null;
  const qty = Number.isFinite(Number(hardware.qty)) ? Number(hardware.qty) : 1;
  const requestedSku = typeof hardware.storeSku === "string" && hardware.storeSku
    ? hardware.storeSku
    : STORE_HARDWARE_REQUIREMENTS[String(hardware.requirementId || "")] || null;
  const item = requestedSku ? findSku(catalog, requestedSku) : null;
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
    requirementId: hardware.requirementId || null,
    storeSku: item?.storeSku || null,
    selectionPolicy: hardware.storeSku
      ? "LEGACY_EXPLICIT_STORE_SKU"
      : "STORE_HARDWARE_REQUIREMENT_MAP",
    qty,
    description: item?.description || hardware.description || null,
    stock,
    price,
    extension: item && price.status !== "UNRESOLVED"
      ? round(Number(item.sellingPrice) * qty, 2)
      : null,
    reasonRecord:
      status === "UNAVAILABLE"
        ? storeReason(
            item ? "AVAILABILITY_GAP" : "MATERIAL_GAP",
            item ? stock.status : "NO_MATCHING_HARDWARE_OFFERING",
            String(hardware.requirementId || "HARDWARE"),
            item
              ? "The Store hardware offering exists, but current declared availability is insufficient."
              : "Store has no mapped hardware offering for the requested functional hardware requirement."
          )
        : status === "UNRESOLVED"
          ? storeReason(
              "STORE_DATA_GAP",
              price.reason || "HARDWARE_PRICE_UNRESOLVED",
              String(hardware.requirementId || "HARDWARE"),
              "Store identified the hardware offering, but its Store-owned price basis is unresolved."
            )
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
    evaluateBoardRequirement(catalog, demand, requirement, componentPrograms)
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
      refusalConditions.push("ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE");
    } else {
      unresolvedConditions.push("ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED");
    }
  }

  const reasonRecords = [
    ...lines.map((line) => line.reasonRecord).filter(Boolean),
    ...(hardwareLine?.reasonRecord ? [hardwareLine.reasonRecord] : []),
    ...incomingUnresolved.map((code) => storeReason(
      "DEFINITION_GAP",
      code,
      "ALCOVE_DEFINITION",
      "The submitted project still carries an unresolved project condition."
    )),
    ...(materialCapacity.unresolved || []).map((code) => storeReason(
      "DEFINITION_GAP",
      code,
      "ALCOVE_COMPONENTS",
      "Store cannot complete material resolution because required component definition is incomplete."
    )),
    ...(materialCapacity.refused || []).map((code) => storeReason(
      "CAPABILITY_GAP",
      code,
      "ALCOVE_COMPONENTS",
      "The resolved component demand cannot be satisfied by the selected Store parent material."
    )),
    ...(Array.isArray(batch?.unresolved) ? batch.unresolved : []).map((code) => storeReason(
      "DEFINITION_GAP",
      code,
      "D001_COMPONENT_TRAVEL",
      "The declared D-001 component travel model requires additional definition before it can return a complete answer."
    )),
    ...(Array.isArray(batch?.reasons) ? batch.reasons : []).map((code) => storeReason(
      "CAPABILITY_GAP",
      code,
      "D001_COMPONENT_TRAVEL",
      "The requested component travel is outside the current declared D-001 capability."
    ))
  ];
  if (demand.spotDemand?.enabled === true && !reasonRecords.some((reason) => reason.code === "ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE")) {
    reasonRecords.push(storeReason(
      "DEFINITION_GAP",
      "ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED",
      "SPOT_ON_LOCATION",
      "Spot locations are defined by shelf elevation, but the current Alcove definition does not yet identify which physical upright component receives each spot."
    ));
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
    refusalConditions,
    reasonRecords
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
      selectionPolicy: "LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING",
      storeSkus: lines.map((line) => line.storeSku).filter(Boolean),
      parentSelections: lines.map((line) => ({
        requirementId: line.requirementId,
        role: line.role,
        storeSku: line.storeSku,
        stockLengthIn: line.demandedStockLengthIn,
        qty: line.qty,
        materialExtension: line.extension,
        selectionPolicy: line.selectionPolicy
      }))
    },
    lines,
    hardwareLine,
    materialCapacity,
    componentPrograms,
    machineEvaluation: batch,
    estimate,
    unresolvedConditions: [...new Set(unresolvedConditions)],
    refusalConditions: [...new Set(refusalConditions)],
    reasonRecords,
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
