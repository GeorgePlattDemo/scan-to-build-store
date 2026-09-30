# Scan-to-Build Store

**The yard's answer: yes, no, or not yet — and why.**

<a href="https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html"><kbd>▶ OPEN THE APP</kbd></a>

3D Solutions LLC · Greensboro, North Carolina

---

## What this repository owns

System defines the job. Store answers what this Store can provide.

A Store answer comes from Store-owned facts: catalog, declared stock, capability, modeled work, and economics. Store does not rewrite the customer's project to make it fit.

The Stage-2 reference implementation returns one of four bounded outcomes:

- `SUPPORTABLE`
- `UNRESOLVED`
- `REFUSED`
- `UNAVAILABLE`

The reason travels with the answer.

## Current status

Four statements matter at the front door:

- **Fixture declared.** [Store Zero](STORE-ZERO.md) is a fictional lumber and building-materials dealer with controlled declarations for stock, commercial practices, capability, and economics.
- **Evaluator implemented.** The Store code evaluates bounded requests against those declared facts and returns Store-owned outcomes. The application calls that Store through a pinned version.
- **Economics modeled.** Material and machine-work values are budgetary reference estimates. Machine time is calculated from declared assumptions, not measured commissioned production.
- **Production not commissioned.** Current software evidence does not establish a commissioned D-001 or S-001 machine, physical fabrication, live inventory allocation, binding quotation, payment, or production authority.

That boundary is deliberate: Stage 2 is a software/reference Store, not Stage 3 physical commissioning. See the [Store and cell stages](STB-STORE-CELL-STAGES-0.1.md).

## What runs here

The top-level implementation contains the reference Store facts, evaluators, capability envelopes, pricing logic, and tests.

| Surface | Role |
| --- | --- |
| [`store-zero-catalog.json`](store-zero-catalog.json) | Store Zero offerings, declared stock, price basis, and item identity |
| [`store-zero-pricing-engine.mjs`](store-zero-pricing-engine.mjs) | Reference material + modeled machine-work economics |
| [`d001-travel-standard.mjs`](d001-travel-standard.mjs) | Governing dimensional fit / travel / modeled-work evaluation |
| [`cut-package-evaluator.mjs`](cut-package-evaluator.mjs) · [`alcove-store-evaluator.mjs`](alcove-store-evaluator.mjs) | Multi-part dimensional Store requests |
| [`sheet-package-evaluator.mjs`](sheet-package-evaluator.mjs) | Bounded sheet-package Store requests |
| [`d001-stage2-envelope.mjs`](d001-stage2-envelope.mjs) · [`s001-stage2-envelope.mjs`](s001-stage2-envelope.mjs) | Machine-readable Stage-2 capability declarations |

Run the repository tests on Node 22:

```sh
node --test *.test.mjs
```

The working application consumes one exact Store version. The current pin owner is System `STORE_PIN` in [`apps/stb/shared/contracts.mjs`](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/apps/stb/shared/contracts.mjs). A new Store commit does not move that pin.

## Machine detail lives below the front door

The README does not define the machines. Store-owned capability is recorded in the envelope documents and their machine-readable counterparts:

- [D-001 Stage-2 envelope](D-001-STAGE2-ENVELOPE-0.1.md) — declared dimensional capability, limits, and unresolved items.
- [S-001 Stage-2 envelope](S-001-STAGE2-ENVELOPE-0.1.md) — declared sheet capability, limits, and unresolved items.
- [Dimensional Store travel standard](DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md) — the governing dimensional completion rule.
- [Store and cell stages](STB-STORE-CELL-STAGES-0.1.md) — what Stage 1, Stage 2, Stage 3, and Stage 4 may claim.

Candidate machine engineering that is not admitted Store capability belongs in the [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program).

## How Store Zero should be read

Store Zero is a controlled test fixture, not a claim about how lumberyards generally operate. Another Store may use different stock, systems, suppliers, equipment, services, prices, and refusal rules while answering the same bounded interface.

The Store membrane is the key boundary: outside demand may ask for selected Store answers without taking possession of the Store's internal systems or authority.

If a required Store-owned fact is missing, the answer remains unresolved, refused, or unavailable. Missing facts are not permission for System or a project wrapper to substitute a fallback Store answer.

## Where the support lives

| If you want to know… | Read | What it establishes |
| --- | --- | --- |
| What Store Zero is | [Store Zero](STORE-ZERO.md) | The declared reference dealer, Store membrane, and status boundaries |
| What the machines accept or refuse | [D-001 envelope](D-001-STAGE2-ENVELOPE-0.1.md) · [S-001 envelope](S-001-STAGE2-ENVELOPE-0.1.md) | Store-owned Stage-2 capability and limits |
| How dimensional work becomes a Store answer | [Travel standard](DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md) | Fit, modeled work, time, and reference economics through one Store rule |
| What each evidence stage may claim | [Stages](STB-STORE-CELL-STAGES-0.1.md) | Reference software vs. later physical commissioning |
| What one modeled Store-side sequence looks like | [Store Job 001](STORE-JOB-001.md) | A reference production narrative explicitly marked as modeled, not an observed run |
| What an actual Store adapter would add | [Store 1](store-1/README.md) | The bounded surface for a later real Store implementation |
| What shared words mean | [System definitions](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md) · [Store terms](DEFINITIONS.md) | Shared meaning in System; Store-local commerce and capability terms here |

The customer/job-definition side lives in [Scan-to-Build System](https://github.com/GeorgePlattDemo/scan-to-build-system). The research question and candidate engineering live in the [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program).

## Limits

Store Zero is fictional. Declared stock is not counted inventory. Reference prices are budgetary, not binding quotations. Machine time is modeled, not measured. No physical D-001 or S-001 cell has been commissioned by the current software evidence. Publication here grants no patent license.

**NO BLOOD ON WOOD.**
