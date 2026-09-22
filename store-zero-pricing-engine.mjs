/**
 * Store Zero Stage-2 pricing engine
 * Budgetary estimate only. Not a commercial quote. Not a seller-of-record.
 *
 * sell = ROUND(list_reference * 1.05, 2)   DECLARED_FIXTURE rule SZ-MARK-ON-5
 * cycle minutes are CALCULATED / MODELED under CYCLE_MODEL
 * Processing dollars require a declared cost-pool basis. Placeholder
 * $35 / $100/hr / 8 min must not form a complete Q for any job class.
 */
import { millPassesForDepth, D001_STAGE2_ENVELOPE } from "./d001-stage2-envelope.mjs";

export const ENGINE = {
  id: "STB-STORE-ZERO-PRICE-1",
  version: "0.4.0",
  clock: "2026-09-22",
  documentKind: "BudgetaryEstimate"
};

/** Named Stage-2 cycle model. Not measured D-001 production data. */
export const CYCLE_MODEL = {
  id: "STB-D001-CYCLE-MODEL-S2-0.1",
  basis: "CALCULATED",
  measured: false,
  commissioned: false,
  purpose: "deterministic modeled economics now; measured machine economics later"
};

export const MARK_ON = 0.05;

export function sellingPrice(list) {
  return Math.round(list * (1 + MARK_ON) * 100) / 100;
}

/**
 * Withdrawn placeholder. Kept only so tests can prove mutation does not
 * change any job's money. Must not form cell_recovery or complete Q.
 */
export const RECOVERY = {
  setupCharge: 35,
  machineHourRate: 100,
  status: "WITHDRAWN_PLACEHOLDER",
  mayFormCompleteQ: false
};

/** Required recovery method. Values are absent until declared. */
export const PROCESSING_RECOVERY_POLICY = Object.freeze({
  status: "UNRESOLVED",
  method: "COST_POOL_DIVIDED_BY_FORECAST_PRODUCTIVE_HOURS",
  costPool: null,
  forecastProductiveHours: null,
  setupCharge: null,
  machineHourRate: null,
  jobSetupMin: null,
  reason: "PROCESSING_RATE_BASIS_REQUIRED",
  setupTimeReason: "SETUP_TIME_BASIS_REQUIRED",
  note: "Machine recovery is a declared cost pool divided by forecast productive hours, applied to modeled occupied time. Service policies stay separate. The withdrawn $35 / $100/hr / 8-minute stack is not a Store pricing basis."
});

/** @deprecated Use PROCESSING_RECOVERY_POLICY. Kept so older callers do not inherit rates. */
export const BOARD_PROCESSING_POLICY = Object.freeze({
  ...PROCESSING_RECOVERY_POLICY,
  classId: "user_defined_board"
});

function qualifyIncompleteProcessing(estimate) {
  if (!estimate?.totals) return estimate;
  const hardware = Number(estimate.totals.hardware || 0);
  const operationMin = Number(
    estimate.cycle?.modeledOperationSubtotalMin ?? estimate.cycle?.T_job_min ?? 0
  );
  return {
    ...estimate,
    status: "PARTIAL_BUDGETARY_ESTIMATE",
    processingPolicy: PROCESSING_RECOVERY_POLICY,
    realityBar: auditRealityBar(estimate, { afterQualify: true, operationMin, hardware }),
    unresolved: [...new Set([
      ...(estimate.unresolved ?? []),
      PROCESSING_RECOVERY_POLICY.reason,
      PROCESSING_RECOVERY_POLICY.setupTimeReason
    ])],
    cycle: {
      ...estimate.cycle,
      T_job_min: null,
      T_job_hr: null,
      modeledOperationSubtotalMin: operationMin,
      jobSetupMin: null,
      completeness: "PARTIAL_MODELED_OPERATION_TIME",
      measured: false
    },
    totals: {
      ...estimate.totals,
      cell_recovery: null,
      Q: round(estimate.totals.material + hardware, 2),
      Q_basis: "PARTIAL_CALCULATED",
      note: "Material/hardware subtotal only. Processing dollars and billed job time stay unresolved until a cost-pool / productive-hours basis and a setup-time basis are declared. Modeled operation minutes are not a price."
    }
  };
}

export function auditRealityBar(estimate, opts = {}) {
  const failures = [];
  const warnings = [];
  if (!estimate || estimate.status === "UNRESOLVED" || estimate.status === "REFUSED") {
    return { status: "NOT_APPLICABLE", failures, warnings };
  }
  const totals = estimate.totals || {};
  const cell = opts.afterQualify ? null : totals.cell_recovery;
  if (cell != null && Number(cell) !== 0) {
    failures.push("INVENTED_CELL_RECOVERY");
  }
  if (!opts.afterQualify && totals.Q_basis === "CALCULATED" && cell != null) {
    failures.push("COMPLETE_Q_FROM_PLACEHOLDER_RECOVERY");
  }
  if (!opts.afterQualify && Number(estimate.cycle?.jobSetupMin) > 0) {
    failures.push("INVENTED_SETUP_MINUTES_IN_BILLED_TIME");
  }
  if (RECOVERY.mayFormCompleteQ) {
    failures.push("PLACEHOLDER_RECOVERY_REACTIVATED");
  }
  for (const line of estimate.material_lines || []) {
    if (line.listReferenceBasis && line.listReferenceBasis !== "OBSERVED" && !line.observationId) {
      warnings.push(`UNOBSERVED_LIST:${line.storeSku}`);
    }
  }
  const status = failures.length ? "FAIL" : "PASS";
  return {
    status,
    rule: "No invented processing dollars. Q may contain only catalog material/hardware. Modeled minutes are not billed time.",
    failures,
    warnings,
    allowedInQ: ["material", "hardware"],
    forbiddenInQ: ["setupCharge", "machineHourRate", "placeholderRecovery"]
  };
}
