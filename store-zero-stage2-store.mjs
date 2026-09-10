/**
 * Store Zero Stage-2 callable Store
 * Ask for the answer, not the database.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { estimatePineAlcove, estimateJob } from "./store-zero-pricing-engine.mjs";

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

export function capabilityAnswer(item, requiredOps = []) {
  if (!item) return { status: "REFUSED", reason: "NO_OFFERING" };
  const have = new Set(item.supportedOps || []);
  const missing = requiredOps.filter((op) => !have.has(op));
  if (missing.length) {
    return {
      status: "REFUSED",
      missing,
      declared: item.supportedOps,
      cellFamily: item.cellFamily,
      basis: "DECLARED_STAGE2_CAPABILITY"
    };
  }
  return {
    status: "SUPPORTABLE",
    declared: item.supportedOps,
    cellFamily: item.cellFamily,
    limitations: item.limitations || [],
    basis: "DECLARED_STAGE2_CAPABILITY"
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
    const cap = capabilityAnswer(item, line.requiredOps || ["CROSSCUT"]);
    if (!item || price.status === "UNRESOLVED") unresolved = true;
    if (cap.status === "REFUSED") refused = true;
    if (stock.status === "NOT_ON_HAND") unavailable = true;
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
