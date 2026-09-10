# STB-STORE-CELL-STAGES-0.1

Store and cell evidence stages for Scan-to-Build.

This document is a navigation contract. It is not a machine specification, not a Store catalog, and not an application page contract.

The application that consumes this layer may later say only:

> This application currently consumes Stage-2 Store Zero capability.

These stages are evidence levels, not release marketing. Stage 2 must not dress itself up as Stage 3.

```
STAGE 1 — CUT-001
one board, one finished requirement, one auditable chain
        ↓
STAGE 2 — STORE ZERO + D-001 REFERENCE CELL
callable fictional Store, useful bounded capability,
deterministic pricing and refusal
        ↓
STAGE 3 — PILOT STORE + PILOT CELL
real Store adapter; physical support and workholding;
guarding, safety-rated controls, interlocks;
commissioning and measured machine behavior
        ↓
STAGE 4 — EVIDENCE-INFORMED SYSTEM
demand, refusals, outcomes, real cycle data,
material behavior and economics determine
what the mature architecture should become
```

Research context only: a related North Carolina study has been accepted through UNC Charlotte to ask whether there is a practical productive middle between conventional yard/manual processing and distant custom-shop / factory / high-capability automation. That student project is independent. It does not study our machine specifications. It does not validate Scan-to-Build. This internal Store/cell roadmap is not a UNC deliverable and does not establish that the answer is yes. A negative answer remains legitimate.

Future Store shape (not implemented here):

```
Application
     ↓
bounded Store interface
     ├── Store Zero adapter      — Stage-2 reference / test oracle
     └── Actual Store adapter    — Stage-3 real implementation
```

A real Store does not adopt Store Zero's internal fixture. Its adapter answers the same bounded questions.

---

## Stage 1 — CUT-001

**What question does this stage answer?**  
Can one finished requirement travel from information through Store and machine boundaries without being redrawn, retyped, manually marked, or silently reinterpreted?

**What exists at this stage?**  
CUT-001 is the first concrete reference:

- 1 × nominal 2×4×6 ft SPF parent stock  
- 60.000 in finished kept length  
- square crosscut after an origin / cleanup cut  
- label  
- staged pickup  

The chain is: human requirement → material → bounded operation → finished part.

**What may we truthfully claim?**  
The information path for one square finished-length part can be written down and followed. The part definition is not reconstructed at the saw.

**What remains modeled / unresolved?**  
Physical commissioning. Safety-rated controls. Live inventory. Commercial quote authority. Remote Cycle Start. Network as a safety loop. Upstroke saw. Compound miter.

**What evidence allows advancement to the next stage?**  
The CUT-001 chain is explicit enough that a larger but still fictional Store can ask more questions without breaking the one-board proof.

CUT-001 remains the live bridge. Later stages must still reduce to it.

---

## Stage 2 — Store Zero + D-001 reference cell

**What question does this stage answer?**  
Can a sufficiently realistic but still fictional reference lumberyard accept structured demand, answer material / stock / capability / pricing questions, and route bounded work to a useful reference cell without pretending the Store or machine has been physically commissioned?

**What exists at this stage?**  
- Store Zero as a callable reference Store (ask for the answer, not the database).  
- A frozen basket of public price observations used as calibration pegs, not as a copied retailer catalog.  
- Store Zero merchant identifiers (example: `STB-ZERO-PINE-1X6-96-001`).  
- Assertion-level basis on each Store fact.  
- D-001 declared Stage-2 envelope: Stage-1 square-cut path plus bounded `MILL_LONGITUDINAL_PROFILE` and `MILL_END_PROFILE`.  
- Deterministic budgetary estimate and refusal vocabulary: `SUPPORTABLE`, `DEFERRED`, `REFERRED`, `REFUSED`, plus `UNRESOLVED` / `UNAVAILABLE` / `UNSUPPORTED` where those are the honest Store answers.

**What may we truthfully claim?**  
Store Zero can be asked questions and will answer from fixture facts. A configuration change that adds a declared mill feature can change modeled cycle time and therefore the budgetary estimate. The estimate is not a commercial quote.

**What remains modeled / unresolved?**  
Fixture-declared on-hand quantity is not a physical count. Allocation is simulated state. Cycle time is calculated / modeled. Mill station geometry is a reference-envelope assumption, not a commissioned layout. No physical validation values (forces, guard performance, PL/SIL, measured feeds).

**What evidence allows advancement to the next stage?**  
The Stage-2 contract is stable enough that a real Store adapter and a physically supported cell can be attached without rewriting the questions.

Stage 2 is the currently targeted environment for application planning.

---

## Stage 3 — Pilot Store + pilot cell

**What question does this stage answer?**  
Can the Stage-2 architecture operate against a real commercial source and a substantially developed physical safety and control boundary?

**What exists at this stage?**  
Store Zero remains the test oracle. A separate actual-Store adapter may answer the same bounded interface. The cell work becomes physical support, restraint, workholding, guarding, access control, safety-rated controls, interlocks, safe stopping and restart behavior, commissioning, and validation. Measured machine behavior begins to replace modeled minutes.

**What may we truthfully claim?**  
Only what the adapter and the commissioned cell actually return. Network presence is still not Cycle Start.

**What remains modeled / unresolved?**  
Anything not yet commissioned or measured. Do not design those systems in this document.

**What evidence allows advancement to the next stage?**  
Recorded demand, Store resolutions, refusals, measured cycles, material behavior, operator observations, and cost / yield data sufficient to judge the architecture.

---

## Stage 4 — Evidence-informed system

**What question does this stage answer?**  
Given what Stages 1–3 actually taught us, what Store and machine architecture is justified?

**What exists at this stage?**  
Whatever the evidence supports. Multiple real Store adapters are possible. The capability envelope is based on measured performance and commissioned limits.

**What may we truthfully claim?**  
Claims that cite observed records.

**What remains modeled / unresolved?**  
Stage 4 is intentionally not predetermined. It is not “Stage 3 plus more features.”

**What evidence allows advancement?**  
Stage 4 is the culmination, not a gate to a numbered Stage 5 in this document.

---

## What the application may imply

| Stage | May say | May not say |
|---|---|---|
| 1 | This 2×4 path is traceable | We cut production work |
| 2 | Store Zero answered this budgetary estimate | This is a live yard, Menards, or authorized motion |
| 3 | A real Store adapter returned this | Network presence is Cycle Start |
| 4 | These numbers were measured | Anything Stages 1–3 already forbade |

Demand remains upstream of machine capability. A new envelope operation does not create a project-class feature.

Related working files (introduced after this document, in later commits on this branch):

- Stage-2 Store Zero observations, catalog, callable Store, pricing engine  
- D-001 Stage-2 envelope  

Those files implement Stage 2. They do not change the meaning of this lineage.
