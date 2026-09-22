# STB DIMENSIONAL STORE TRAVEL STANDARD — 0.1

**Purpose:** One auditable governing rule connecting every complete dimensional configuration to Store validity, modeled D-001 work, Store economics, budgetary `Q`, confirmation, and Store completion.

**Status:** Stage-2 reference standard · simulation/model basis · not commissioned production data · no live-motion authority.

## 1. Governing chain

Every dimensional configuration travels through:

`DEFINITION → STORE CAPABILITY → MACHINE WORK → MODELED TIME → STORE PRICE → CONFIRMATION → STORE RECONCILIATION`

A complete Store value exists only when the identified configuration resolves defined part demand, Store material/sourced lines, declared D-001 capability, a valid A/B/C reference chain, calculable modeled occupied-cell time, and the declared Store machine-service selling-rate model.

`Q = Σ Stock/Sourced Selling Price + Machine Service Price`

`Machine Service Price = T_MACHINE(hr) × STORE_MACHINE_SELL_RATE`

The Store rate is derived from one named/versioned Store economics model. No per-cut fee, per-hole fee, arbitrary setup charge, arbitrary setup time, project-name price, historical placeholder, application estimate, or undeclared fallback may substitute for it.

If a required input is absent: **NO COMPLETE Q.**

## 2. D-001 reference model

- **Datum A** — fixed fence reference, `Y=0`.
- **Datum B** — fixed table/support reference, `Z=0`.
- **Datum C** — dynamic longitudinal workpiece origin, established per loaded workpiece by a declared reference event (for example cleanup/reference cut, mechanical reference, sensed face, or other admitted method).

A and B are machine/configuration facts. C remains valid only while the workpiece reference chain remains valid.

If the machine can no longer support the claimed workpiece/reference relationship: `POSITION_VALID=false`. No geometry-dependent operation may proceed until C is re-established by a declared procedure.

The current Stage-2 model may use declared fixture geometry and modeled kinematic values. Every such value must remain named, versioned, and labeled modeled/unmeasured until Stage-3 evidence replaces it.

## 3. Configuration → physical demand

Every configuration choice that changes the physical part must resolve before pricing into explicit part-relative demand: finished dimensions, identified parts, feature coordinates, quantities, and required operations.

Examples: shelf elevation → spot/drill coordinates; finished length → crosscut; miter selection → angle + plane; groove/rabbet/profile → path + depth + passes.

The configuration defines **what and where on the part**. The D-001 model defines **station/tool, machine movement, and modeled timing**. Project/configurator data shall not invent machine coordinates, Store capability, Store economics, or Store answers.

## 3A. Store SKU resolution is catalog-driven

Dimensional material resolution is a Store function, not a project/configurator function.

For a complete dimensional demand, Store evaluates matching offered SKUs in ascending stock length. A candidate is selectable only when the complete Store evaluation for that candidate passes current stock sufficiency, price completeness, declared capability, dimensional containment, retained-control, reference, operation, and travel requirements.

A candidate that fails the complete job does **not** end the search. Store continues to the next matching candidate until one complete candidate passes or all matching candidates are exhausted.

The governing selection policy is:

`SHORTEST_COMPLETE_STORE_OFFERING`

Consequences:

- adding a valid SKU is a catalog-data change; it must not require project-specific resolver code;
- removing, repricing, or changing availability of a SKU is reevaluated on the next Store request;
- a shorter candidate may replace a longer candidate automatically when it completely supports the same demand;
- if the shortest candidate fails retained-control, capability, availability, price, or another governing Store requirement, Store evaluates the next candidate;
- the application/configurator may describe material class and physical demand, but it may not nominate, hard-code, or prefer a Store SKU;
- Store SKU length is a Store material/fulfillment answer. It must not silently rewrite finished part geometry.

Tests may preserve named historical fixtures where required, but generic Store acceptance must not freeze catalog membership, SKU count, or one preferred stock length as eternal truth.

## 4. Valid operation sequence

Operations may be reordered only by the Store/machine planner and only while preserving geometry, dependencies, material identity, and the reference chain.

For each stationary processing operation:

`INDEX → STOP → HOLD/POSITION CONFIRMED → TOOL ENGAGE → PROCESS → TOOL RETRACT → NEXT INDEX`

Indexing and stationary-tool engagement do not overlap unless a separately declared machine mode explicitly permits it.

## 5. Modeled occupied-cell time

For every complete dimensional job:

`T_MACHINE = T_REFERENCE + ΣT_INDEX + ΣT_SAW + ΣT_DRILL/SPOT + ΣT_MILL + ΣT_OTHER_DECLARED_CELL_OPERATION`

Declared load/seat/release segments may be included when they occupy the cell and are explicitly identified as modeled cell-cycle segments. They are not hidden setup charges. Unrelated customer time is not silently embedded.

For servo/index motion, with distance `D`, max loaded velocity `V`, and acceleration/deceleration `A`:

If `D ≥ V²/A`:

`T_INDEX = 2(V/A) + (D − V²/A)/V`

If `D < V²/A`:

`T_INDEX = 2√(D/A)`

For a tool:

`T_TOOL = position/approach + engage/plunge + cutting/path time + retract`

Examples: drill feed = RPM × feed/revolution; drill cutting time = plunge distance ÷ drill feed; mill cutting time = path length ÷ cutting feed × passes; saw time = declared deploy/downstroke + calculated cutting traverse + clear/retract.

No universal fixed cut/drill time may substitute where the declared model has sufficient parameters.

## 6. Validity gate before Q

A complete `Q` exists only when all applicable conditions pass:

1. configuration/version identified and complete;
2. Store offerings, quantities, prices, and sourced lines resolved;
3. every physical feature carries sufficient units and part-relative definition;
4. every required operation maps to declared D-001 capability;
5. A/B/C reference requirements can be satisfied;
6. operation order preserves `POSITION_VALID`;
7. all occupied-cell time is calculable from the identified model;
8. Store economics model/rate is identified and versioned;
9. no required fact remains `UNRESOLVED`, `REFUSED`, or `UNAVAILABLE`.

A visually complete configuration is not automatically Store-complete.

## 7. Same evaluator — same formula — twice

There is one governing dimensional Store evaluator for a Store revision.

**PASS A — Configure / live Store answer**

`Q_A = Σ Stock/Sourced Selling Price + [T_MACHINE_A(hr) × STORE_MACHINE_SELL_RATE]`

**PASS B — confirmed Store reconciliation**

`Q_B = Σ Stock/Sourced Selling Price + [T_MACHINE_B(hr) × STORE_MACHINE_SELL_RATE]`

PASS A and PASS B call the **same evaluator**, using the same governing formula and identified model/economic versions. For unchanged governing inputs: `Q_A = Q_B`.

If unchanged identified inputs produce different outputs: **FAIL CLOSED — STORE_CALCULATION_DIVERGENCE**.

A legitimate changed input creates a new identified version, a new Store answer, and a new confirmation as applicable. No silent reconciliation.

### Fresh evaluation on every Store request

Every explicit user action that requests or re-requests a Store answer is a **new Store evaluation request**.

- The Store must execute the governing evaluator again against its current Store state.
- A prior Store answer, receipt, result hash, displayed price, capability result, or successful request may remain history, but it may not authorize the new request.
- Each formal request carries a request identity and receives a new evaluation receipt.
- The receipt identifies the Store revision plus the current catalog, machine-envelope, travel-standard, and economics authority used for that request.
- If current Store price, material availability, capability, machine envelope, travel model, economics, refusal state, or any other governing authority differs from the answer last presented to the user, the application must surface that difference and require current user confirmation as applicable. It may not silently preserve the earlier result.
- `UNRESOLVED`, `REFUSED`, or `UNAVAILABLE` on the new evaluation blocks use of an earlier `SUPPORTABLE` answer.
- Repeated submission of an unchanged definition is allowed. Reuse of its earlier Store evaluation as though it were a fresh evaluation is not.

**Definition identity may be durable. Store validity is re-established per request.**

## 8. Travel record

Every complete dimensional Store answer retains at minimum:

- configuration ID/version;
- Store revision;
- Store offering IDs, quantities, extensions, sourced lines;
- machine-envelope and travel-model IDs/versions;
- Datum C establishment method;
- identified part/feature coordinates and operation plan;
- `T_REFERENCE`, `T_INDEX`, `T_SAW`, `T_DRILL/SPOT`, `T_MILL`, other declared time, `T_MACHINE`;
- Store economics/rate ID/version/basis;
- machine-service amount and complete `Q`;
- modeled/measured status;
- governing calculation-input hash;
- governing result hash;
- PASS A and PASS B calculation identities when both exist.

The calculation identity travels with the confirmed version through completion and the owner/Store record.

## 9. Authority / anti-shortcut invariant

No layer may create authority owned by another layer.

**Project/configuration owns:** project intent, finished part definition, owner choices, part-relative feature locations, required physical demand, configuration revision.

**Declared machine model owns:** machine references, admitted geometry, station/tool relationships, capability limits, modeled kinematic parameters, and transformation of admitted operations into modeled movement/time.

**Store owns:** offerings/SKUs, Store stock assertions, capability evaluation, refusals/unresolved decisions, Store material extensions, Store economics model/rate, calculation and issuance of Store `Q`, and Store reconciliation/completion answer.

**Application/configurator owns:** routing, interaction, definition entry, submission to Store, and presentation/preservation of returned Store answers.

> **If Store owns the answer, ASK STORE. DO NOT ANSWER FOR STORE.**

No application, UI, adapter, assistant, AI, code generator, test, project wrapper, or downstream consumer may invent, duplicate, substitute for, weaken, or independently implement Store-owned pricing, capability, refusal, stock-selection, machine-time economics, or completion logic.

A missing required fact is `UNRESOLVED`, `REFUSED`, or `UNAVAILABLE` according to the owning rule—not permission to guess.

Declared Stage-2 modeling is permitted only when the value is intentional, named/versioned, owned by the proper layer, visibly modeled/unmeasured, used by the governing evaluator, and replaceable by later evidence without rewriting historical results.

## 10. Regression / acceptance rule

Automated acceptance fails if:

- the rejected `$35 setup`, `$100/hour`, or `8-minute setup` placeholders return;
- machine work is required but a purported complete dimensional `Q` omits machine service;
- application/configurator code calculates Store `Q` or locally duplicates Store capability/refusal logic;
- a project-specific shortcut bypasses the governing evaluator;
- PASS A and PASS B use different economic mechanisms;
- a new Store request can reuse a prior Store answer or receipt without executing the governing evaluator again;
- a formal Store request does not carry a fresh evaluation receipt;
- current Store catalog, machine-envelope, travel-standard, or economics authority is absent from that receipt;
- unchanged governing inputs produce different result identities;
- an unresolved fact is silently filled;
- a modeled value loses its modeled/fixture identity;
- a test expectation is weakened merely to match incorrect implementation behavior.

A successful test run proves only the named acceptance criteria on the exact tested SHA.

## Governing invariant

> **No complete dimensional configuration receives a Store price until its physical demand passes through the declared Store capability, D-001 kinematic/travel model, cycle calculation, and Store economic rule.**
>
> **Project defines demand. Machine model determines modeled work. Store determines the Store answer and Q. Application routes and presents that answer. Missing authority fails closed.**

**DEFINITION → CAPABILITY → MOTION → TIME → PRICE**

**SAME RULE. SAME EVALUATOR. SAME IDENTIFIED INPUTS. SAME RESULT.**

**EVERY STORE REQUEST REEVALUATES CURRENT STORE STATE. PRIOR ANSWERS ARE HISTORY, NOT AUTHORITY FOR A NEW REQUEST.**

**No shortcuts. No surrogate Store. No silent fallback. No second pricing engine.**
