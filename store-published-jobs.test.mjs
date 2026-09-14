import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateJob,
  evaluateSheetMode2Job,
  evaluateSheetMode2ArchedJob,
  loadCatalog,
} from './store-zero-stage2-store.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const published = JSON.parse(readFileSync(join(ROOT, 'store-published-jobs.json'), 'utf8'));
const catalog = loadCatalog();

assert.equal(published.status, 'CANDIDATE');
assert.equal(published.version, '0.2-reconciled');
assert.equal(published.runtimeBasis.commit, '0da283c01ae9980b39c94e41437bf34340b7c337');
assert.equal(published.namedJobSource.commit, '0023b39a9a59c7cd2c882627c78ef59236f553e4');
assert.equal(published.jobs.length, 3);
assert.deepEqual(
  published.jobs.map((job) => job.id),
  ['square-stick', 'rect-stencil', 'arched-opening'],
);
assert.deepEqual(
  published.jobs.map((job) => job.publicName),
  ['Square 2x4', 'Rectangular sheet stencil', 'Centered arched cutout in 1/2 in ply'],
);

const square = published.jobs.find((job) => job.id === 'square-stick');
assert.equal(square.currentAppPin, 'CONNECTED');
assert.equal(square.currentAppPinKind, 'STORE_PIN');
assert.equal(square.currentAppPinValue, 'b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d');
const squareResult = evaluateJob(catalog, {
  title: square.publicName,
  lines: [{
    storeSku: square.stock[0].storeSku,
    qty: square.stock[0].qty,
    requiredOps: square.implementationDefaults.requiredOps,
    keptLengthIn: square.defaults.keptLengthIn,
  }],
});
assert.equal(squareResult.status, 'SUPPORTABLE');

const rect = published.jobs.find((job) => job.id === 'rect-stencil');
assert.equal(rect.currentAppPin, 'CONNECTED');
assert.equal(rect.currentAppPinKind, 'PUBLISHED_JOB_STORE_PIN');
assert.equal(rect.currentAppPinValue, '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc');
const rectResult = evaluateSheetMode2Job(catalog, {
  title: rect.publicName,
  line: {
    storeSku: rect.stock[0].storeSku,
    qty: rect.stock[0].qty,
    profileKind: rect.implementationDefaults.profileKind,
    blankL_in: rect.defaults.lengthIn,
    blankW_in: rect.defaults.widthIn,
    tabCount: rect.implementationDefaults.tabCount,
    routeDepthIn: rect.implementationDefaults.routeDepthIn,
  },
});
assert.equal(rectResult.status, 'SUPPORTABLE');
assert.equal(rectResult.physicalStatus, 'NOT_CLAIMED');
assert.equal(rectResult.estimate, null);

const arch = published.jobs.find((job) => job.id === 'arched-opening');
assert.equal(arch.currentAppPin, 'CONNECTED');
assert.equal(arch.currentAppPinKind, 'PUBLISHED_JOB_STORE_PIN');
assert.equal(arch.currentAppPinValue, '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc');
assert.deepEqual(
  {
    outerLengthIn: arch.defaults.outerLengthIn,
    outerWidthIn: arch.defaults.outerWidthIn,
    openingWidthIn: arch.defaults.openingWidthIn,
    straightHeightIn: arch.defaults.straightHeightIn,
    riseIn: arch.defaults.riseIn,
  },
  {
    outerLengthIn: 96,
    outerWidthIn: 48,
    openingWidthIn: 36,
    straightHeightIn: 24,
    riseIn: 12,
  },
);
assert.deepEqual(arch.workField, {
  id: 'S001-CENTER-WORK-FIELD-V0',
  horizontalIn: 48,
  verticalIn: 36,
  placement: 'CENTERED_ON_PARENT',
  containment: 'WHOLE_PROFILE',
});

const archResult = evaluateSheetMode2ArchedJob(catalog, {
  title: arch.publicName,
  line: {
    storeSku: arch.stock[0].storeSku,
    qty: arch.stock[0].qty,
    outerL_in: arch.defaults.outerLengthIn,
    outerW_in: arch.defaults.outerWidthIn,
    apertureW_in: arch.defaults.openingWidthIn,
    apertureStraightH_in: arch.defaults.straightHeightIn,
    arcChord_in: arch.defaults.openingWidthIn,
    arcRise_in: arch.defaults.riseIn,
    tabCount: arch.implementationDefaults.tabCount,
    routeDepthIn: arch.implementationDefaults.routeDepthIn,
  },
});
assert.equal(archResult.status, 'SUPPORTABLE');
assert.equal(archResult.physicalStatus, 'NOT_CLAIMED');
assert.equal(archResult.line.capability.curve.radius_in, 19.5);
assert.equal(archResult.line.capability.retention.physicalRetentionStatus, 'NOT_MEASURED');
assert.equal(archResult.line.capability.workField.id, 'S001-CENTER-WORK-FIELD-V0');
assert.equal(archResult.line.capability.workField.profileInsideField, true);

for (const job of published.jobs) {
  assert.ok(job.notClaimed.includes('Cycle Start'));
  assert.ok(job.notClaimed.includes('physical fabrication'));
}

console.log('store-published-jobs.test.mjs ok');
