# Catalog and User 1 pricing repair

Starting candidate: f5c76ceb9c9964033887821e39978d7128d802e2 (Store PR #5).

## Confirmed defects

The latest candidate replaced `store-zero-catalog.json` with a three-field
`PLACEHOLDER_DO_NOT_USE` object. All five existing test files failed because the
catalog had no offerings. Restore the complete catalog byte-for-byte from
01f9c5580cea262bd898a9f2c1ac2cd89d02845f. It already contains the 72-inch (six-foot)
SPF 2x4. No new material price or stock quantity is invented by this repair.

`store-zero-catalog-additions.json` is an unadopted five-foot (60-inch) proposal,
not the six-foot offering and not a second runtime catalog. It is deliberately
not automatically loaded. Its existing price and availability declarations have
not been independently approved by this repair.

User 1 inherited legacy setup dollars, machine hourly recovery, and eight minutes
of setup time. Its estimates now exclude all three. Other reference-ticket
classes retain their existing economics. No Window Seat model is changed.

## Current result

User 1 returns `PARTIAL_BUDGETARY_ESTIMATE`, `cell_recovery: null`, and a material /
hardware subtotal in Q with `Q_basis: PARTIAL_CALCULATED`. Q is not a complete job
price. Missing processing rates and setup-time basis have separate named reasons.
`T_job_min` and `T_job_hr` are null; `modeledOperationSubtotalMin` contains only the
existing modeled operation terms, not measured or complete job time. Requested
spots also retain their independent unresolved cycle-time reason.

Do not introduce a replacement rate until its source, applicable project class,
version, units, and authorization are declared. Do not make legacy recovery the
fallback for User 1. Existing modeled operation terms have not become measured
machine economics through this repair.

## Add an offering

Use a complete offering record with a unique storeSku, offered flag, form,
dimensions in inches (nominal and actual separately), supported operations,
cell family, explicit stock assertions, and price basis. Missing price may be
null; it is not a zero price. A six-foot board uses stockL_in: 72. Do not derive
physical dimensions by parsing the SKU name.

Place records in an additions file: `{ "offerings": [ ... ] }`.

```
node catalog-add.mjs store-zero-catalog.json proposed-offerings.json candidate-catalog.json
```

The command validates the entire candidate, derives skuCount, and writes through
an atomic rename. It rejects duplicates and malformed entries before writing.
Use a separate output path for review. There is no automatic catalog promotion.
The callable `addCatalogOfferings` does not mutate its input. A running consumer
can use `reloadCatalog(path, currentCatalog)` to retain its last valid catalog
while displaying an explicit rejection. Initial load without a valid catalog
fails with a named catalog error, never a fabricated empty catalog.

## Verification and integration boundary

Run `node --test *.test.mjs`. New tests exercise actual addition, selection,
pricing, reload, and CLI functions. They mutate legacy rates to prove User 1
cannot inherit them; they do not require a former placeholder-derived quote.

This change is Store-only. Downstream System/Review pins and generated packages
must be updated and their visible paths checked in a separate integration change
before claiming the browser application uses the repair. This branch does not
merge, deploy, repoint the public button, or authorize physical execution.
