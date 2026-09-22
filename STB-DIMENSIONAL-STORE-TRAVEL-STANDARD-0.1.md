# STB DIMENSIONAL STORE TRAVEL STANDARD — 0.1

**Purpose:** One auditable governing rule connecting every complete dimensional configuration to Store validity, modeled machine work, Store economics, budgetary `Q`, confirmation, and completion.

**Status:** Stage-2 reference standard · simulation/model basis · not commissioned production data · no live-motion authority.

---

## 1. GOVERNING CHAIN

Every dimensional configuration shall travel through the same chain:

**DEFINITION → STORE CAPABILITY → MACHINE WORK → MODELED TIME → STORE PRICE → CONFIRMATION → STORE RECONCILIATION**

A configuration receives a Store value only when Store can resolve:

**defined part + identified stock/sourced items + required operations + declared machine capability + valid reference chain + modeled machine time + declared Store machine-service selling rate**

into one deterministic result.

### Governing price equation

**Q = Σ Stock/Sourced Selling Price + Machine Service Price**

where:

**Machine Service Price = T_MACHINE(hr) × STORE_MACHINE_SELL_RATE**

`STORE_MACHINE_SELL_RATE` shall be one declared, identified, versioned Store parameter incorporating the Store's chosen machine-cost recovery and earnings basis.

It shall not be silently replaced by:

- per-cut pricing;
- per-hole pricing;
- arbitrary setup charges;
- arbitrary hourly rates;
- project-name pricing;
- historical placeholders;
- local application estimates;
- undeclared fallback economics.

If any required pricing input is absent:

**NO COMPLETE Q.**

---

## 2. DIMENSIONAL MACHINE REFERENCE MODEL

### Datums

**Datum A — Fence**
Fixed machine reference. `Y = 0`.

**Datum B — Table / support plane**
Fixed machine reference. `Z = 0`.

A and B are established by the physical machine construction/configuration and its declared calibration state.

**Datum C — Longitudinal workpiece origin**
Dynamic for each loaded workpiece.

C may be established by a declared and valid reference method such as:

- cleanup/reference cut;
- mechanical stop/reference;
- sensed face;
- scanned/derived physical reference;
- another explicitly declared machine procedure.

The method used shall be identified in the job record.

### Position validity

After A, B, and C are established:

**`POSITION_VALID = true`**

If the machine can no longer support the claimed relationship among the workpiece and its governing references:

**`POSITION_VALID = false`**

No geometry-dependent operation may proceed while `POSITION_VALID = false`.

C must then be re-established by a declared procedure before dependent work continues.

---

## 3. CONFIGURATION → PHYSICAL DEMAND

Every configuration choice that changes the physical part shall resolve into explicit part-relative manufacturing demand before pricing.

Examples:

**shelf elevation → required spot/drill coordinates**

**finished length → crosscut requirement**

**miter selection → angle + cut plane**

**groove/rabbet/profile → path + depth + passes**

**quantity → repeated physical operations**

The project/configuration defines:

- what the part is;
- finished dimensions;
- feature locations;
- operation requirements;
- part identity.

The machine model defines:

- which admitted station/tool performs the operation;
- local station relationships;
- required machine movement;
- modeled timing.

**The project shall not contain machine coordinates.**

**Store shall not invent missing part geometry.**

---

## 4. VALID OPERATION SEQUENCE

Cut, drill, spot, mill, and other admitted operations need not occur in one universal order.

The machine planner may coordinate them in any valid sequence that preserves the workpiece reference chain and all required dependencies.

Every stationary processing operation follows the governing state:

**INDEX → STOP → HOLD / POSITION CONFIRMED → TOOL ENGAGE → PROCESS → TOOL RETRACT → NEXT INDEX**

Stock indexing and stationary-tool engagement shall not overlap unless a separately declared machine mode explicitly permits and governs that behavior.

Therefore either of these may be valid:

**REFERENCE → DRILL → INDEX → CUT → INDEX → DRILL → RELEASE**

or:

**REFERENCE → CUT → INDEX → DRILL → MILL → RELEASE**

The required result controls. The machine planner may reduce unnecessary travel but may not alter defined geometry or required operations.

---

## 5. MODELED MACHINE TIME

For every job:

**T_MACHINE = T_REFERENCE + ΣT_INDEX + ΣT_SAW + ΣT_DRILL/SPOT + ΣT_MILL + ΣT_OTHER_DECLARED_MACHINE_OPERATION**

Only declared machine operations belong in `T_MACHINE`.

Operator/customer handling time shall not be silently embedded in machine time. Any separately priced labor or service must be an explicit Store economic line.

### Servo/index calculation

Let:

`D` = move distance
`V` = declared loaded maximum velocity
`A` = declared acceleration/deceleration

For a move that reaches commanded maximum velocity:

**If `D ≥ V²/A`:**

**T_INDEX = 2(V/A) + (D − V²/A)/V**

For a short triangular move:

**If `D < V²/A`:**

**T_INDEX = 2√(D/A)**

### Tool-cycle calculation

Each tool cycle shall be derived from its declared parameters:

**T_TOOL = position/approach + engage/plunge + cutting/path time + retract**

Examples:

**Drill feed = RPM × feed per revolution**

**Drill cutting time = required plunge distance ÷ drill feed**

**Mill cutting time = toolpath length ÷ declared cutting feed × required passes**

**Saw time = declared approach/downstroke + cutting stroke + clear/retract**

No universal fixed cut or drill time may substitute for a defined model where sufficient parameters exist.

### Modeled values

Stage-2 may use modeled values for:

- station coordinates;
- speeds;
- accelerations;
- tool feeds;
- strokes;
- approach/retract distances;
- spindle behavior;
- fixture geometry;
- other required timing parameters.

Such values are legitimate only when explicitly identified as:

**`MODELED` / `DECLARED_FIXTURE` / equivalent**

and associated with a named/versioned machine or cycle model.

Measured Stage-3 evidence may later replace these values without changing this governing calculation method.

---

## 6. VALIDITY GATE BEFORE Q

A configuration receives a complete Store value only when ALL applicable conditions pass:

1. configuration version is complete and identified;
2. required material/Store offerings are identified;
3. quantities are resolved;
4. required sourced/hardware lines are represented;
5. every required physical feature has units and sufficient part-relative definition;
6. every required operation maps to declared dimensional-machine capability;
7. required A/B/C reference conditions can be satisfied;
8. operation sequencing preserves `POSITION_VALID`;
9. all required machine movement/time is calculable from the identified cycle model;
10. Store economic rule/rate is identified and versioned;
11. no required fact remains `UNRESOLVED`, `REFUSED`, or `UNAVAILABLE`.

If any required condition fails:

**NO COMPLETE Q.**

A visually complete configuration is not automatically a Store-complete configuration.

---

## 7. SAME EVALUATOR — SAME FORMULA — TWICE

There shall be **one governing Store evaluator** for the applicable Store revision.

There shall not be separate Configure pricing logic and Store completion pricing logic.

### PASS A — CONFIGURE / LIVE STORE ANSWER

For identified configuration version `V`:

**Q_A = Σ Stock/Sourced Selling Price + [T_MACHINE_A(hr) × STORE_MACHINE_SELL_RATE]**

Store returns:

- selected Store offerings;
- quantities/extensions;
- capability result;
- required operation sequence;
- modeled time breakdown;
- machine/cycle model identity;
- Store economic-rule identity;
- `Q_A`;
- unresolved/refusal information;
- governing input/result identities.

Configure may present this Store result.

Configure does not calculate it independently.

### PASS B — CONFIRMED STORE RECONCILIATION

When that exact configuration is confirmed and submitted:

**Q_B = Σ Stock/Sourced Selling Price + [T_MACHINE_B(hr) × STORE_MACHINE_SELL_RATE]**

PASS B shall use:

- the same governing evaluator;
- the same formula;
- the same applicable machine model;
- the same economic mechanism;
- the confirmed identified inputs.

For unchanged identified inputs:

**Q_A = Q_B**

If unchanged inputs produce a different result:

**FAIL CLOSED — STORE CALCULATION DIVERGENCE**

If a legitimate input changed, Store shall:

1. identify the changed fact;
2. create/use the appropriate new version;
3. recalculate;
4. return the changed result;
5. require the revised result to be presented/accepted as appropriate.

No silent reconciliation is permitted.

---

## 8. TRAVEL RECORD

Every priced dimensional job shall carry an auditable travel record containing at minimum:

- project/configuration ID + version;
- Store revision;
- material/Store offering IDs;
- quantities + material extensions;
- sourced/hardware lines;
- machine-envelope ID/version;
- cycle-model ID/version;
- Datum C establishment method;
- required part-relative feature coordinates;
- required operations;
- ordered modeled operation sequence;
- `T_REFERENCE`;
- `T_INDEX`;
- `T_SAW`;
- `T_DRILL/SPOT`;
- `T_MILL`;
- other declared machine time;
- `T_MACHINE`;
- Store machine-service-rate ID/version/basis;
- machine service price;
- complete `Q`;
- model status: modeled/measured;
- complete calculation-input identity/hash;
- result identity/hash;
- PASS A result;
- PASS B result.

The record travels with the confirmed job through Store fulfillment and becomes part of the Store/owner outcome record.

---

## 9. AUTHORITY / ANTI-SHORTCUT INVARIANT

No layer may create authority owned by another layer.

### Project / Configuration owns

- project intent;
- finished part definition;
- owner-selected dimensions/options;
- part-relative feature locations;
- required physical demand;
- configuration identity/revision.

### Declared Machine Model owns

- machine references;
- admitted machine geometry;
- station/tool relationships;
- capability limits;
- modeled kinematic parameters;
- transformation of admitted operations into modeled movement/time.

### Store owns

- offerings/SKUs;
- Store stock/availability assertions;
- Store capability evaluation;
- Store refusals/unresolved decisions;
- material selling-price extensions;
- Store economic rule;
- machine-service selling rate;
- calculation and issuance of Store `Q`;
- Store reconciliation/completion answer.

### Application owns

- routing;
- interaction;
- presentation;
- configuration entry;
- submission of questions to Store;
- presentation/preservation of Store answers.

**If Store owns the answer, ASK STORE. DO NOT ANSWER FOR STORE.**

---

## 10. PROHIBITED SHORTCUTS

No application, UI, adapter, assistant, AI, code generator, test, project wrapper, or downstream consumer may:

- invent a Store rule;
- locally duplicate Store pricing;
- locally duplicate Store capability logic;
- locally duplicate Store refusal logic;
- silently substitute an old Store rule;
- manufacture missing Store facts;
- insert an arbitrary fallback value;
- promote historical fixture data to current authority;
- invent operation timing;
- invent setup charges;
- invent machine rates;
- use project-specific pricing shortcuts;
- convert an unresolved fact into a pass;
- weaken an acceptance test so broken behavior appears correct;
- create a surrogate/mock Store and represent its answer as Store Zero;
- locally pre-compute Store Q and merely present it as a Store answer.

If a required authoritative fact is missing, the legitimate result is:

**`UNRESOLVED`**, **`REFUSED`**, or **`UNAVAILABLE`**

according to the owning rule.

It is not permission to invent a value.

---

## 11. DECLARED MODELING IS NOT INVENTION

A modeled Stage-2 parameter is permitted when and only when it is:

1. intentionally declared;
2. named and versioned;
3. assigned to the correct owning authority;
4. labeled modeled/fixture rather than measured;
5. used by the one governing evaluator;
6. applied consistently to all applicable jobs;
7. replaceable by later evidence without silently changing historical results.

**Declared simulation is permitted. Hidden guessing is prohibited.**

---

## 12. REGRESSION / ACCEPTANCE RULE

Automated acceptance shall fail if:

- rejected historical setup/rate constants reappear without deliberate re-adoption;
- machine work is required but complete Q contains only materials;
- machine-service price is omitted from a purported complete dimensional Q;
- application code calculates Store Q locally;
- Store capability/refusal rules are replicated in application code;
- project-name logic determines economic treatment;
- PASS A and PASS B use different evaluators or economic mechanisms;
- unchanged identified inputs produce different results;
- an unresolved fact is silently filled;
- a modeled value loses its modeled/fixture identity;
- a test expectation is changed merely to match incorrect implementation behavior.

A passing test means only:

**the named acceptance criteria passed on the tested repository/branch/SHA.**

It does not authorize changing the governing requirement after the fact.

---

# GOVERNING INVARIANT

> **No complete dimensional configuration receives a Store price until its physical demand passes through the declared Store capability, dimensional-machine kinematic model, cycle calculation, and Store economic rule.**
>
> **Project defines the demand.**
>
> **The machine model determines modeled machine work.**
>
> **Store determines the Store answer and Q.**
>
> **The application routes and presents the answer.**
>
> **The same evaluator calculates it twice.**
>
> **Missing authority fails closed.**

### **DEFINITION → CAPABILITY → MOTION → TIME → PRICE**

### **SAME RULE. SAME EVALUATOR. SAME IDENTIFIED INPUTS. SAME RESULT.**

**No shortcuts. No surrogate Store. No silent fallback. No second pricing engine.**