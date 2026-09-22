import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog } from "./store-zero-stage2-store.mjs";
import {
  estimatePineAlcove,
  estimateCut001,
  estimatePicnicLegSquare,
  estimatePicnicLegTapered,
  estimateBoardSequence,
  estimateJob,
  auditRealityBar,
  RECOVERY,
  TOOLING
} from "./store-zero-pricing-engine.mjs";

const catalog = loadCatalog();

function tickets() {
  return [
    estimatePineAlcove(catalog),
    estimateCut001(catalog),
    estimatePicnicLegSquare(catalog),
    estimatePicnicLegTapered(catalog),
    estimateBoardSequence(catalog, {
      storeSku: "STB-ZERO-SPF-2X4-72-001",
      definedWorkpieceLengthIn: 60,
      sawCuts: 3,
      sawAngleDeg: 30
    }),
    estimateJob(catalog, {
      title: "generic board",
      classId: "anything.else",
      pieces: [{ storeSku: "STB-ZERO-SPF-2X4-96-001", qty: 1, keptLengthIn: 28, widthIn: 3.5 }]
    })
  ];
}

test("every published ticket passes the reality bar", () => {
  for (const estimate of tickets()) {
    assert.equal(estimate.status, "PARTIAL_BUDGETARY_ESTIMATE", estimate.title);
    assert.equal(estimate.totals.cell_recovery, null, estimate.title);
    assert.equal(estimate.cycle.T_job_min, null, estimate.title);
    assert.equal(estimate.totals.Q, estimate.totals.material + (estimate.totals.hardware || 0));
    assert.notEqual(estimate.totals.Q, 54.27);
    assert.notEqual(estimate.totals.Q, 374.42);
    const bar = auditRealityBar(estimate);
    assert.equal(bar.status, "PASS", `${estimate.title}: ${bar.failures}`);
    assert.ok(estimate.unresolved.includes("PROCESSING_RATE_BASIS_REQUIRED"));
    assert.ok(estimate.unresolved.includes("SETUP_TIME_BASIS_REQUIRED"));
  }
});

test("mutating withdrawn placeholder rates cannot mint a complete Q", () => {
  const before = tickets().map((e) => e.totals.Q);
  try {
    RECOVERY.setupCharge = 999;
    RECOVERY.machineHourRate = 999;
    RECOVERY.mayFormCompleteQ = true;
    TOOLING.jobSetupMin = 999;
    const after = tickets();
    after.forEach((estimate, i) => {
      assert.equal(estimate.totals.Q, before[i], estimate.title);
      assert.equal(estimate.totals.cell_recovery, null);
    });
  } finally {
    RECOVERY.setupCharge = 35;
    RECOVERY.machineHourRate = 100;
    RECOVERY.mayFormCompleteQ = false;
    TOOLING.jobSetupMin = 8;
  }
});

test("reality bar fails an invented complete recovery total", () => {
  const fake = estimateCut001(catalog);
  fake.totals.cell_recovery = 51.14;
  fake.totals.Q = 54.27;
  fake.totals.Q_basis = "CALCULATED";
  const bar = auditRealityBar(fake);
  assert.equal(bar.status, "FAIL");
  assert.ok(bar.failures.includes("INVENTED_CELL_RECOVERY"));
});
