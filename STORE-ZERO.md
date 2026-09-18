# STORE ZERO — Canonical Reference Store

**Canonical document:** `STORE-ZERO.md`  
**Canonical consolidation:** `STORE-ZERO-CANONICAL-0.1`  
**Status:** REFERENCE / research fixture; not a live dealer, commercial promise, physical inventory record, production release, or commissioned machine declaration  
**Consolidation date:** 2026-09-17  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 0. Document identity and source state

This file is the human-readable and AI-readable semantic master for Store Zero. It consolidates the present Store definition, reference data, machine-capability declarations, economics, authority boundaries, research questions, patent lineage, worked paths, evidence status, and implementation references in one place.

The executable or machine-readable assets named here remain implementation assets. This file does not delete or supersede code, JSON fixtures, schemas, evaluators, tests, machine engineering documents, or issued patent sources.

### Repository state used for this consolidation

| Subject | Repository / source | Exact identity | Role here |
|---|---|---|---|
| Store current default branch | `GeorgePlattDemo/scan-to-build-store` | `3620b35369d70cf49733bbb0b62c0f3d9969b738` | current documentary Store baseline |
| System current default branch | `GeorgePlattDemo/scan-to-build-system` | `138d0c01b62193012e5c5c891723b7dd47407119` | current Store/machine/completion research context |
| Governed reference | `GeorgePlattDemo/scan-to-build-governed-reference` | `18949f163718a937f072f4be3a654bb303e53160` | project semantics, gates, provenance, simulation/production authority |
| Stage-2 Store Zero implementation | Store repository, path-specific pin | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | D-001 Stage-2 catalog, stock, economics, evaluator, tests |
| Published-job / S-001 proof | Store repository, path-specific pin | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | five-tool D-001 reference, S-001 Mode-2 reference, published job and tests |

### Important repository-state finding

The current Store default branch at the pin above contains the documentary Store files but does not contain the executable Stage-2 catalog/evaluator/test family that exists at the two path-specific Store pins. That is represented here as a provenance fact, not silently “repaired.”

Accordingly:

- current Store `main` is the documentary front door used by this consolidation;
- Stage-2 and published-job executable facts are incorporated only with their exact path-specific pins;
- this pass does not restore, copy, delete, or relocate those executable assets;
- no path-specific pin is promoted into a universal project constant.

### Reference clocks and engine identities

| Reference | Identity / value | Meaning |
|---|---|---|
| Catalog clock | `2026-09-10` | Store Zero fixture catalog state |
| Stock answer clock | `2026-09-10` | fixture-declared on-hand state; not a physical count |
| Pricing engine | `STB-STORE-ZERO-PRICE-1` v`0.2.2` | deterministic budgetary economics engine |
| Pricing engine clock | `2026-09-10` | reference engine state |
| Window Seat recovery model | `STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1` | class-scoped declared-reference fabrication / fulfillment recovery; supersedes the `$35 + $100/hour` recovery only for `space_utilization.window_seat` |
| D-001 cycle model | `STB-D001-CYCLE-MODEL-S2-0.1` | CALCULATED / MODELED; not measured; not commissioned |
| D-001 Stage-2 envelope | `D001-STAGE2-ENVELOPE-0.2` | reference Store evaluation envelope at Stage-2 pin |
| D-001 featured-board reference | `D001_FEATURED_BOARD_V0` | reference five-tool candidate at published-job pin |
| S-001 Mode-2 envelope | `S001-MODE2-STENCIL-V1` | reference sheet Mode-2 envelope; physical status not claimed |
| S-001 arched-aperture envelope | `S001-MODE2-ARCHED-APERTURE-V0` | centered arched-aperture reference; physical status not claimed |

Same request + same declared Store state + same implementation = same answer. If the declared state or implementation changes, the answer may change, and the retained record must identify what changed.

---

## 1. Store Zero in one page

**Store Zero is a declared reference lumberyard and the controlled answering surface for the Scan-to-Build research program.**

It exists because a governed project requirement needs something specific, deterministic, and inspectable to ask. Store Zero gives that requirement a bounded material, stock, capability, economics, and fulfillment context without pretending a real merchant or commissioned production cell already exists.

Its primary question is:

> Given this exact governed demand, what can this Store provide, source, process, make, partially complete, stage, fulfill, defer or refuse, and why?

Its second question is equally important:

> When Store Zero cannot satisfy a useful demand, what exactly is missing, what burden does that gap create, and what evidence would justify—or reject—the smallest capability increment?

Store Zero is therefore both:

1. a deterministic reference Store implementation; and
2. a controlled research instrument for evaluating the technical and economic value of additional local capability.

Store Zero is **not**:

- a real dealer;
- a seller of record;
- a commercial promise;
- live inventory;
- a production release;
- a commissioned physical cell;
- a fake retailer screenshot;
- a generic Store API abstraction;
- a universal model of every lumberyard;
- authority to move a machine;
- evidence that a modeled part was physically fabricated.

A failed answer is useful. `UNRESOLVED`, `REFUSED`, and `UNAVAILABLE` are research results when they identify the actual reason the path stops.

---

## 2. Central research loop

```text
REALISTIC PROJECT DEMAND
        ↓
STORE ZERO
        ↓
EXISTING STORE ASSETS
        ↓
MATERIAL / STOCK / SUPPLY
        ↓
CURRENT PROCESS + MACHINE CAPABILITY
        ↓
ECONOMIC + FULFILLMENT EVALUATION
        ↓
SUPPORTABLE
        → supported Store path

or

UNRESOLVED / REFUSED / UNAVAILABLE
        ↓
NAMED GAP
        ↓
FREQUENCY / CONSEQUENCE / HANDLING BURDEN
        ↓
CAPABILITY-INCREMENT CANDIDATE
        ↓
COST / COMPLEXITY / FOOTPRINT /
LABOR / SENSING / SAFETY / MAINTENANCE
        ↓
TEST / DEFER / OUTSOURCE / REJECT
        ↓
PHYSICAL EVIDENCE
        ↓
IF EARNED:
NEW VERSIONED STORE CAPABILITY
```

Store Zero does not autonomously design a machine. It preserves evidence about the missing Store function. Engineering decides whether a capability increment is justified.

Valid outcomes include use of the existing Store process, use of current declared capability, an explicitly admitted secondary operation, supplier/special order, outsourcing, a bounded test, modification, deferral, refusal, or a conclusion that a machine addition is economically unjustified.

Negative results are valid research results.

---

## 3. Research thesis

The research objective is not to replace a lumberyard with a universal CNC factory.

The objective is to test whether an ordinary independent lumberyard can be economically augmented by bounded local digital fabrication that uses, where applicable:

- the existing site, stock and supplier relationships;
- existing material handling, receiving and covered storage;
- existing staging, will-call, pickup and delivery paths;
- existing labor and operator roles;
- a familiar machine footprint;
- bounded additional machine capability;
- off-the-shelf components where practical;
- open or openly inspectable control technology where practical;
- simple local operator interaction;
- local machine authority;
- independent engineering and safety work.

The useful middle under study is between ordinary tape/pencil/manual processing and high-capability factory automation.

> make the material move rather than making every tool infinitely capable.

That is a research principle, not a commissioned-machine fact.

---

## 4. Existing Store baseline

Store Zero begins with an ordinary lumberyard operating model. The following are Store Zero fixture declarations used to create a coherent research context; they are not claims that every lumberyard has identical practices or assets.

Declared ordinary Store functions include pro/counter sales, product/catalog information, covered storage and yard storage, receiving, staging, will-call, loading and ordinary material handling, pickup, delivery as a modeled fulfillment path, an employee-operated square-crosscut baseline, supplier relationships, special-order handling, contractor/takeoff workflow, and ordinary human Store roles.

The physical comparison case for the present dimensional-machine research remains manual:

```text
board
  ↓
radial-arm saw
  ↓
eyes + tape measure + pencil + operator judgment
  ↓
manual positioning and cut
```

A Stage-2 D-001 fixture is not evidence that this physical comparison case has already been replaced.

Do not replace a useful existing Store asset merely because an automated method can be imagined. Start with the declared current asset, identify the real capability gap, add the smallest justified increment, and measure what changed.

---

## 5. Store sovereignty and Store membrane

> **Ask for the answer, not the database.**

A caller should ask bounded Store questions and receive bounded Store answers. Connected does not mean surrendered.

Store Zero may expose answers about offered material/product identity, availability and freshness, price/reference economics, declared processing capability, supportability/refusal, supplier/special-order path, fulfillment state, and relevant evidence/version identity.

That does not imply disclosure or transfer of every internal Store record, supplier term, customer/account detail, machine-local configuration, controller state, or operating credential.

The Store architecture distinguishes, as applicable, public/project information, account/commercial information, operational Store information, and machine-local information.

The application should receive what it needs to present a Store answer. It does not need the entire Store database. The Store should receive an unambiguous project demand. It does not need application UI state. The machine should receive an admitted machine-neutral work description plus local lowering context. It does not need permission to rewrite project truth.

---

## 6. Ownership and authority

### Governed layer owns

- canonical project/record semantics;
- unresolved/refusal behavior at the governed layer;
- gate meaning;
- authorization rules;
- WorkPacket meaning;
- provenance/integrity;
- simulation versus production authority.

The current governed reference is simulation-only and states that production authorization is not issuable.

### Store owns

- Store offerings;
- stock assertions;
- supplier/special-order path;
- process/machine capability declarations exposed at the Store boundary;
- project-to-capability evaluation;
- machine-neutral operation requirements;
- Store economics;
- Store fulfillment/completion relationships within Store authority.

### Application owns

- journeys;
- capture/configuration interaction;
- presentation;
- resume/continuity;
- presentation of Store answers.

The application does not decide that the Store supports a job merely because the UI can render it.

### Machine / cell owns

- installed physical mechanism;
- commissioned local geometry and station map;
- local lowering;
- controller program/state;
- work offsets and machine references;
- real-time motion;
- interlocks and stopping;
- local Cycle Start;
- machine-local workpiece reference validity;
- physical observations and cycle outcome.

### Never collapse

```text
project requirement
≠ material offering
≠ stock availability
≠ machine capability
≠ machine readiness
≠ authorization
≠ physical execution
```

Network presence is not motion authority. Store supportability is not Cycle Start. Machine readiness is not project authorization. A successful simulation is not a fabricated part.

---

## 7. Inbound Store demand

> **Project definition must make the question unambiguous. Store evaluation determines the answer.**

A consequential Store request should carry enough information to identify, as applicable:

- project/request identity and revision;
- part/component identity and quantity;
- finished geometry relevant to Store resolution;
- material requirement or provisional material identity;
- required operations;
- secondary-operation expectation where deliberately split;
- fulfillment requirement;
- unresolved conditions;
- provenance/currentness.

The application is not required to know Store-internal facts such as current SKU, stock quantity, supplier path, price, or actual supported machine envelope before asking. Those are Store answers.

Every consequential Store-relevant demand line must receive a disposition. Silence never means supported, priced, available, or authorized.

---

## 8. Material system

```text
Material requirement
→ MaterialClass / material identity
→ MaterialSpec / use-specific material requirement
→ form
→ Store offering
→ Store SKU
→ stock / supply answer
```

Material identity is not merchant identity. A `MaterialClass` or `MaterialSpec` is not a SKU. A SKU is a Store/channel offering identity.

Mapping a provisional or project material requirement to a Store SKU is an explicit Store-resolution act; it is not silent material substitution. If a material is provisional or unresolved, Store Zero must not fabricate confidence by selecting a merchant SKU anyway. A later mapping may create a new Store question or project revision where the changed identity is consequential.

---

## 9. Complete active Store Zero catalog

### 9.1 Catalog semantics

The active published-job catalog contains **92 offered fixture items** at catalog clock `2026-09-10`.

Common rules:

- `offered=true` means offered by the Store Zero fixture, not by a real dealer;
- unit is `ea` unless a packaged hardware unit applies;
- `list_reference` is observed or calculated as declared per item;
- selling price = `ROUND(list_reference × 1.05, 2)`;
- the 5% value is mark-on, not margin;
- `onHand` is fixture-declared stock, not a physical count;
- active fixture allocation is zero;
- a represented supplier path does not cure an on-hand shortage;
- D-001/S-001 operation declarations are reference capability facts only.

`L / S / O` below means list reference / Store Zero selling price / fixture on-hand quantity.

### 9.2 SPF construction dimensional lumber — 22 offerings

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-SPF-2X4-72-001` | 2×4×72 | 2.98 / 3.13 / 60 |
| `STB-ZERO-SPF-2X4-96-001` | 2×4×96 | 3.98 / 4.18 / 84 |
| `STB-ZERO-SPF-2X4-108-001` | 2×4×108 | 4.48 / 4.70 / 20 |
| `STB-ZERO-SPF-2X4-120-001` | 2×4×120 | 5.42 / 5.69 / 48 |
| `STB-ZERO-SPF-2X4-144-001` | 2×4×144 | 6.48 / 6.80 / 36 |
| `STB-ZERO-SPF-2X4-168-001` | 2×4×168 | 6.96 / 7.31 / 12 |
| `STB-ZERO-SPF-2X4-192-001` | 2×4×192 | 7.96 / 8.36 / 8 |
| `STB-ZERO-SPF-2X6-72-001` | 2×6×72 | 5.39 / 5.66 / 28 |
| `STB-ZERO-SPF-2X6-96-001` | 2×6×96 | 7.19 / 7.55 / 40 |
| `STB-ZERO-SPF-2X6-120-001` | 2×6×120 | 8.99 / 9.44 / 22 |
| `STB-ZERO-SPF-2X6-144-001` | 2×6×144 | 10.79 / 11.33 / 18 |
| `STB-ZERO-SPF-2X6-192-001` | 2×6×192 | 14.38 / 15.10 / 8 |
| `STB-ZERO-SPF-2X8-96-001` | 2×8×96 | 9.48 / 9.95 / 24 |
| `STB-ZERO-SPF-2X8-120-001` | 2×8×120 | 11.85 / 12.44 / 16 |
| `STB-ZERO-SPF-2X8-144-001` | 2×8×144 | 14.22 / 14.93 / 12 |
| `STB-ZERO-SPF-2X8-192-001` | 2×8×192 | 18.96 / 19.91 / 6 |
| `STB-ZERO-SPF-2X10-96-001` | 2×10×96 | 12.09 / 12.69 / 8 |
| `STB-ZERO-SPF-2X10-120-001` | 2×10×120 | 15.12 / 15.88 / 8 |
| `STB-ZERO-SPF-2X10-144-001` | 2×10×144 | 18.14 / 19.05 / 8 |
| `STB-ZERO-SPF-4X4-96-001` | 4×4×96 | 8.76 / 9.20 / 20 |
| `STB-ZERO-SPF-4X4-120-001` | 4×4×120 | 10.95 / 11.50 / 12 |
| `STB-ZERO-SPF-4X4-144-001` | 4×4×144 | 13.13 / 13.79 / 10 |

The 4×4 fixture is limited relative to the milling envelope; a Store offer does not imply every D-001 feature is supportable on the section.

### 9.3 Pine board offerings — 22 offerings

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-PINE-1X2-72-001` | 1×2×72 | 1.59 / 1.67 / 20 |
| `STB-ZERO-PINE-1X2-96-001` | 1×2×96 | 2.12 / 2.23 / 20 |
| `STB-ZERO-PINE-1X3-72-001` | 1×3×72 | 3.65 / 3.83 / 20 |
| `STB-ZERO-PINE-1X3-96-001` | 1×3×96 | 4.87 / 5.11 / 20 |
| `STB-ZERO-PINE-1X4-72-001` | 1×4×72 | 8.24 / 8.65 / 30 |
| `STB-ZERO-PINE-1X4-96-001` | 1×4×96 | 10.99 / 11.54 / 36 |
| `STB-ZERO-PINE-1X4-120-001` | 1×4×120 | 13.74 / 14.43 / 18 |
| `STB-ZERO-PINE-1X4-144-001` | 1×4×144 | 16.48 / 17.30 / 10 |
| `STB-ZERO-PINE-1X6-72-001` | 1×6×72 | 14.99 / 15.74 / 30 |
| `STB-ZERO-PINE-1X6-96-001` | 1×6×96 | 19.99 / 20.99 / 36 |
| `STB-ZERO-PINE-1X6-120-001` | 1×6×120 | 24.99 / 26.24 / 18 |
| `STB-ZERO-PINE-1X6-144-001` | 1×6×144 | 29.98 / 31.48 / 10 |
| `STB-ZERO-PINE-1X8-72-001` | 1×8×72 | 19.76 / 20.75 / 30 |
| `STB-ZERO-PINE-1X8-96-001` | 1×8×96 | 26.35 / 27.67 / 36 |
| `STB-ZERO-PINE-1X8-120-001` | 1×8×120 | 32.94 / 34.59 / 18 |
| `STB-ZERO-PINE-1X8-144-001` | 1×8×144 | 39.53 / 41.51 / 10 |
| `STB-ZERO-PINE-1X10-96-001` | 1×10×96 | 33.62 / 35.30 / 8 |
| `STB-ZERO-PINE-1X10-120-001` | 1×10×120 | 42.02 / 44.12 / 8 |
| `STB-ZERO-PINE-1X10-144-001` | 1×10×144 | 50.43 / 52.95 / 8 |
| `STB-ZERO-PINEQ-1X4-96-001` | quality pine 1×4×96 | 5.97 / 6.27 / 50 |
| `STB-ZERO-PINEQ-1X8-96-001` | quality pine 1×8×96 | 11.98 / 12.58 / 22 |
| `STB-ZERO-PINESTD-1X4-96-001` | standard/rustic pine 1×4×96 | 2.73 / 2.87 / 80 |

Select pine principally uses D-001 crosscut/miter/drill and, for applicable widths, bounded mill declarations. Narrow 1×2/1×3 and lower-grade lines have narrower declared processing. The standard/rustic line is not treated as equivalent to select pine merely because nominal dimensions match.

### 9.4 Poplar select — 12 offerings

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-POP-1X4-72-001` | 1×4×72 | 13.49 / 14.16 / 12 |
| `STB-ZERO-POP-1X4-96-001` | 1×4×96 | 17.99 / 18.89 / 16 |
| `STB-ZERO-POP-1X4-120-001` | 1×4×120 | 22.49 / 23.61 / 12 |
| `STB-ZERO-POP-1X4-144-001` | 1×4×144 | 26.98 / 28.33 / 12 |
| `STB-ZERO-POP-1X6-72-001` | 1×6×72 | 22.99 / 24.14 / 18 |
| `STB-ZERO-POP-1X6-96-001` | 1×6×96 | 30.65 / 32.18 / 12 |
| `STB-ZERO-POP-1X6-120-001` | 1×6×120 | 38.32 / 40.24 / 12 |
| `STB-ZERO-POP-1X6-144-001` | 1×6×144 | 45.98 / 48.28 / 12 |
| `STB-ZERO-POP-1X8-72-001` | 1×8×72 | 28.02 / 29.42 / 12 |
| `STB-ZERO-POP-1X8-96-001` | 1×8×96 | 37.36 / 39.23 / 12 |
| `STB-ZERO-POP-1X8-120-001` | 1×8×120 | 46.70 / 49.04 / 8 |
| `STB-ZERO-POP-1X8-144-001` | 1×8×144 | 56.04 / 58.84 / 12 |

### 9.5 Red oak select — 9 offerings

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-OAK-1X4-72-001` | 1×4×72 | 17.24 / 18.10 / 8 |
| `STB-ZERO-OAK-1X4-96-001` | 1×4×96 | 22.99 / 24.14 / 12 |
| `STB-ZERO-OAK-1X4-120-001` | 1×4×120 | 28.74 / 30.18 / 8 |
| `STB-ZERO-OAK-1X6-72-001` | 1×6×72 | 24.99 / 26.24 / 10 |
| `STB-ZERO-OAK-1X6-96-001` | 1×6×96 | 33.32 / 34.99 / 8 |
| `STB-ZERO-OAK-1X6-120-001` | 1×6×120 | 41.65 / 43.73 / 8 |
| `STB-ZERO-OAK-1X8-72-001` | 1×8×72 | 32.94 / 34.59 / 8 |
| `STB-ZERO-OAK-1X8-96-001` | 1×8×96 | 43.92 / 46.12 / 8 |
| `STB-ZERO-OAK-1X8-120-001` | 1×8×120 | 54.90 / 57.65 / 8 |

### 9.6 Cherry select — 4 offerings

These values are derived fixture references rather than direct observed cherry price pegs; do not present them as live cherry prices.

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-CHR-1X4-72-001` | 1×4×72 | 27.59 / 28.97 / 6 |
| `STB-ZERO-CHR-1X4-96-001` | 1×4×96 | 36.78 / 38.62 / 6 |
| `STB-ZERO-CHR-1X6-72-001` | 1×6×72 | 39.98 / 41.98 / 6 |
| `STB-ZERO-CHR-1X6-96-001` | 1×6×96 | 53.31 / 55.98 / 6 |

### 9.7 Sheet goods — 9 offerings

| Store SKU | Declared sheet | L / S / O ($ / $ / ea) | Reference operation note |
|---|---|---:|---|
| `STB-ZERO-PLY-025-48X48-001` | 1/4 in plywood, 48×48 | 8.07 / 8.47 / 10 | crosscut/rip fixture path |
| `STB-ZERO-PLY-025-48X96-001` | 1/4 in plywood, 48×96 | 13.91 / 14.61 / 14 | crosscut/rip/dado fixture path |
| `STB-ZERO-PLY-038-48X48-001` | 3/8 in plywood, 48×48 | 10.56 / 11.09 / 10 | crosscut/rip fixture path |
| `STB-ZERO-PLY-038-48X96-001` | 3/8 in fir ACX plywood, 48×96 | 18.21 / 19.12 / 14 | route-profile/tab reference operations |
| `STB-ZERO-PLY-050-48X96-001` | 1/2 in 4-ply sheathing plywood, 48×96 | 25.29 / 26.55 / 18 | canonical S-001 arched study material |
| `STB-ZERO-PLY-063-48X96-001` | 5/8 in fir BCX/sanded plywood, 48×96 | 47.89 / 50.28 / 12 | crosscut/rip/dado/groove/route/tab |
| `STB-ZERO-PLY-075-48X48-001` | 3/4 in plywood, 48×48 | 31.94 / 33.54 / 10 | crosscut/rip fixture path |
| `STB-ZERO-PLY-075-48X96-001` | 3/4 in fir ACX/sanded plywood, 48×96 | 55.07 / 57.82 / 14 | route-profile/tab reference operations |
| `STB-ZERO-OSB-075-48X96-001` | 3/4 in square-edge OSB, 48×96 | 27.10 / 28.46 / 20 | crosscut/rip only |

### 9.8 Hardware — 8 offerings

Hardware is sourced Store material, not fabricated merely because it appears in a Store job.

| Store SKU | Description | L / S / O ($ / $ / ea/package) |
|---|---|---:|
| `STB-ZERO-HW-SHELFPIN-5MM-12-001` | 5 mm shelf pins, 12 pack | 2.49 / 2.61 / 40 |
| `STB-ZERO-HW-SHELFPIN-5MM-100-001` | 5 mm shelf pins, 100 pack | 14.52 / 15.25 / 8 |
| `STB-ZERO-HW-SCREW-8X150-110-001` | #8 × 1-1/2 in screw pack, 110 | 14.29 / 15.00 / 20 |
| `STB-ZERO-HW-ALCOVE-PACK-001` | alcove hardware pack | 17.14 / 18.00 / 25 |
| `STB-ZERO-HW-PICNIC-BOLT-PACK-001` | picnic hardware bolt pack | 12.50 / 13.13 / 15 |
| `STB-ZERO-HW-HINGE-CONCEAL-2-001` | concealed hinge pair | 8.99 / 9.44 / 20 |
| `STB-ZERO-HW-SCREW-10X300-LB-001` | #10 × 3 in screw package | 11.98 / 12.58 / 12 |
| `STB-ZERO-HW-CARR-BOLT-516-4-001` | 5/16 × 4 in carriage-bolt package | 6.49 / 6.81 / 18 |

### 9.9 Pressure-treated SYP — 6 offerings

| Store SKU | Nominal size × length | L / S / O ($ / $ / ea) |
|---|---:|---:|
| `STB-ZERO-PT-2X4-96-001` | 2×4×96 | 4.58 / 4.81 / 30 |
| `STB-ZERO-PT-2X4-120-001` | 2×4×120 | 5.72 / 6.01 / 18 |
| `STB-ZERO-PT-2X4-144-001` | 2×4×144 | 6.87 / 7.21 / 12 |
| `STB-ZERO-PT-4X4-96-001` | 4×4×96 | 9.49 / 9.96 / 10 |
| `STB-ZERO-PT-4X4-120-001` | 4×4×120 | 11.86 / 12.45 / 10 |
| `STB-ZERO-PT-4X4-144-001` | 4×4×144 | 14.23 / 14.94 / 10 |

### 9.10 Catalog evidence limits

The compact canonical catalog reproduces the active offering set, Store SKU, material/form description sufficient to distinguish the offering, dimensional variant, reference price, calculated Store Zero selling price, fixture on-hand quantity, and broad processing-family meaning.

The machine-readable catalog remains controlling for exact per-line actual dimensions, assertion bases, observation IDs, supplier paths, source fields and limitations. Historical supported-operation arrays remain evidence of the pinned implementation state; they do not override a later deliberately versioned canonical capability declaration.

For `MILL_EDGE_BOUNDED`, the current canonical Store meaning is declared in `D001-BOARD-EDGE-MILL-REFERENCE-0.2.md` (`D001-BOARD-EDGE-MILL-REF-0.2`). That declaration removes the separate 60 in edge-milling length cap, removes unsupported parent span as a Store supportability gate, and admits the operation across the current 3/4 in Select Pine, Select Poplar, Select Red Oak and Select Cherry solid-board families, subject to its retained machining limits. Future adapters that claim the current canonical Store state must consume that declaration rather than silently reusing the older 60 in limit, the older 96 in unsupported-parent gate, or older per-line omission.

This is not a semantic escape hatch: this file contains enough data to understand the Store without hunting for the existence, price, stock quantity, material family, or broad processing family of any active offering.

---

## 10. Stock / availability fixture

```text
available = fixtureDeclaredOnHand - allocatedSimulated
```

The active fixture uses `allocated=0` on the represented catalog lines.

- `ON_HAND_SUFFICIENT` — fixture-available quantity >= requested quantity;
- `ON_HAND_SHORT` — some fixture quantity exists, but less than requested;
- `NOT_ON_HAND` — no fixture quantity is available for the line.

These do not prove a physical count, reservation, piece-by-piece quality, commercial commitment, machine readiness, or project authorization.

A synthetic supplier/special-order path does not convert `ON_HAND_SHORT` or `NOT_ON_HAND` into `SUPPORTABLE` in the Stage-2 evaluator.

---

## 11. Economics

### 11.1 Price rule

```text
sellingPrice = ROUND(list_reference × 1.05, 2)
```

The declared fixture rule is `SZ-MARK-ON-5`. It is a mark-on, not a real dealer margin claim.

### 11.2 Legacy / general D-001 modeled recovery

The historical/general reference engine declares:

- setup charge `$35.00`;
- modeled machine-hour recovery `$100.00/hour`;
- job setup `8.0 min`;
- load/seat allowance `0.6 min` per modeled stick cycle;
- release/label allowance `0.4 min` per modeled stick cycle;
- cycle model `STB-D001-CYCLE-MODEL-S2-0.1`;
- basis `CALCULATED`;
- measured `false`;
- commissioned `false`.

The engine also contains explicit saw/drill/mill timing assumptions tied to the Stage-2 envelope. They are model parameters, not measured production behavior.

```text
material = Σ fixture selling-price extensions
cell_recovery = setup_charge + machine_hour_rate × modeled_hours
Q = material + cell_recovery + hardware
```

`Q` / `BudgetaryEstimate` is not a commercial quote.

**Window Seat exception:** this recovery formula is **not controlling** for `space_utilization.window_seat` once the class-scoped model `STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1` is selected. The old `$35 + $100/hour` terms remain visible as historical/general Store evidence rather than being silently rewritten.

### 11.3 S-001 economics

The current S-001 Mode-2 and arched-aperture reference paths may return `BUDGETARY_MATERIAL_ONLY`. Process time and fabrication Q remain unresolved. The Store must not invent a process price because the material line can be priced.

Fixture prices are not live prices. Modeled cycle time is not measured machine time. A budgetary estimate is not seller-of-record commitment. A price does not authorize production.

### 11.4 Window Seat fabrication / fulfillment recovery

For `space_utilization.window_seat`, the active declared-reference economics model is:

`STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1`

Controlling file:

`STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1.md`

The model deliberately separates mapped material from fabrication / fulfillment recovery and optional hardware.

Longitudinal edge-milling feed is derived from:

```text
feed_rate_ipm = chip_load_in_per_tooth × cutting_edges × spindle_rpm
```

Current declared reference inputs use a 3/8-in two-flute cutter at 18,000 RPM:

- Select Pine / SOFT WOOD: adjusted chip load `0.00675 IPT` → `243 IPM`;
- Select Poplar / Red Oak / Cherry / HARD WOOD: adjusted chip load `0.00600 IPT` → `216 IPM`.

The values are declared reference / unmeasured, not commissioned feeds.

For the default Window Seat definition the reference recovery is:

```text
fixed_reference_fulfillment = $365.00

cell_consumption
  = $60.00
  × (modeled_cycle_minutes / 56.16)
  × species_wear_factor

fabrication_fulfillment_recovery
  = fixed_reference_fulfillment + cell_consumption

reference_selling_basis
  = mapped_material
  + fabrication_fulfillment_recovery
  + selected_hardware
```

Declared reference species wear factors:

- Select Pine `1.00`;
- Select Poplar `1.05`;
- Select Cherry `1.10`;
- Select Red Oak `1.15`.

The Pine default is therefore `$425.00` fabrication / fulfillment recovery. The old `$35 setup + $100/hour` recovery is not added to this class-scoped result.

The recovery components are shown separately:

- cell consumption / wear reserve;
- material handling / fabrication;
- inspect / label / bundle / stage;
- facility / admin / rework reserve;
- service / commercial reserve.

These are declared reference / unmeasured values. They are intended to be replaced by measured tooling, cycle, maintenance, handling and commercial evidence as the reference cell matures.

A Store assortment gap remains a valid answer. If a selected species has no suitable offered parent width, the Store must expose the missing offering rather than invent a SKU or silently substitute material. A complete reference selling basis is not returned for that unmapped material requirement.

---

## 12. Store dispositions and coverage rule

The Stage-2 aggregate Store job dispositions are:

- `SUPPORTABLE` — every consequential evaluated line has a recognized offering, resolvable price, declared capability for the request, and sufficient fixture-declared on-hand stock;
- `UNRESOLVED` — a required Store answer cannot be established from declared state, including missing/unresolved identity or evaluator-defined unresolved geometry/definition;
- `REFUSED` — the request exceeds the declared offering/capability/envelope rule;
- `UNAVAILABLE` — the offering exists and may otherwise be processable, but fixture-declared available stock is short or zero.

`SUPPORTABLE` does not mean authorized, machine-ready, commissioned, paid, reserved, or fabricated.

Every consequential Store-relevant demand line must receive a disposition. No omitted line may be interpreted as supported, priced, available, fulfilled, or authorized.

Protocol/implementation failure must remain distinguishable from a Store business disposition.

---

## 13. D-001 — dimensional machine

### 13.1 Evidence layers must stay separate

D-001 currently exists in several evidence layers that must not be collapsed:

1. **Patent correspondence** — issued dimensional-machine disclosure includes support/frame, table/support plane, fence, clamping, servo-controlled manipulating roller(s), longitudinal stock movement, sawing, and additional tooling-way functions.
2. **Stage-2 Store reference** — `D001-STAGE2-ENVELOPE-0.2` supplies deterministic fixture numbers for Store evaluation and economics.
3. **Published five-tool reference** — `D001_FEATURED_BOARD_V0` preserves a bounded two-saw/five-tool candidate and refuses unadmitted functions.
4. **Present machine-build research** — the actual physical comparison case remains manual radial-arm-saw work; the first physical experiment is a much smaller digital cut-to-length bridge.
5. **Present bounded implementation hypothesis for later capability research** — two manipulating rollers, two end saws, two 3/16-in pilot/spot functions, three bounded router/mill functions, local sensing/reference validation, local lowering, and local Cycle Start. This is research intent, not commissioned fact.

The fact that the patent discloses a broader exemplary machine, the Stage-2 fixture models one envelope, and the five-tool reference lists a bounded tool set does not make any of those descriptions installed hardware.

### 13.2 D-001 research purpose

D-001 tests whether useful digital processing can be packed into approximately the footprint and material-handling pattern of familiar lumberyard saw/infeed/outfeed equipment without turning the site into a general CNC factory.

The useful measure is capability per unit of footprint, handling, rereferencing, operator burden, maintenance and cost.

A fixed or bounded tool may be valuable because it eliminates another machine, another material transfer, another setup, another manual layout, another reference establishment, or another operator interpretation.

### 13.3 Present bounded physical hypothesis

The present bounded research concept includes:

- fixed support/table reference;
- fixed fence/reference;
- longitudinal workpiece motion;
- **two servo-controlled manipulating rollers** in the present bounded implementation hypothesis;
- two end saw stations;
- five additional bounded tool functions:
  - two fixed 3/16-in pilot/spotting drill functions;
  - two router/mill functions with the richer bounded positioning needed for useful top/side work;
  - one simpler bounded router/mill function intended for a narrow cleanup/end/side/taper operation where justified;
- local sensing/reference validation;
- machine-local lowering;
- local operator Ready/Cycle Start.

This hypothesis does **not** add an automatic tool changer, universal gantry, arbitrary general CNC, broad 5-axis function, invented travel, invented motor sizing, invented tool models, or invented safety category.

### 13.4 Reconciliation with the published five-tool reference

The published `D001_FEATURED_BOARD_V0` reference names five operator-configured machining tools in addition to the two saws:

- T1 center horizontal router — edge/notch family retained demand; detailed envelope unresolved;
- T2 transverse router from below — full-width dado/transverse-groove family inside inherited Stage-2 limits;
- T3 end router — routed-end family retained demand; detailed envelope unresolved;
- T4 vertical pilot drill — fixed 3/16-in face pilot;
- T5 horizontal pilot drill — fixed 3/16-in edge pilot.

The present consolidation does not silently rename that published reference. It records the current research interpretation that the three router-class functions should be evaluated as **two richer bounded positioning functions plus one simpler cleanup/taper-oriented function**. Exact mechanical assignment and final tool arrangement remain unresolved engineering. Until adopted in an owning capability source, that interpretation is a research hypothesis, not a wider Store evaluator.

### 13.5 Why the simpler third router/tool function exists

It is not justified merely as a speed optimization.

The research question is whether one narrow additional function can eliminate a material transfer, flip, manual layout or rereferencing event for a bounded feature such as end/side cleanup or controlled taper while remaining inside the compact processing footprint.

That is a topology/reference-preservation question as much as a cycle-time question. It must be evaluated by evidence, not assumed useful because a tool can be mounted.

### 13.6 Manipulating-roller reconciliation

The patent exemplary dimensional-machine description includes three commonly controlled manipulating rollers. The Stage-2 fixture and current bounded research hypothesis use two named manipulating rollers. The present machine-build program has not yet selected final roller count for a physical machine.

Therefore:

- patent three-roller disclosure = patent correspondence;
- Stage-2 two-roller model = reference implementation choice;
- present two-roller hypothesis = bounded research starting point;
- a third roller = capability-increment candidate, not current Store capability;
- physical roller count, pressure, sensing and slip behavior remain engineering/commissioning questions.

### 13.7 Stage-2 reference geometry and limits

The following are **reference fixture values**, useful for deterministic Store tests and economics. They are not measured or commissioned physical-machine values:

- fixed fence/table coordinate concept: X along fence, Y=0 at fence, Z=0 at support plane;
- named Stage-2 stations include two saws, two manipulating rollers and bounded mill stations;
- reference base length: 72 in;
- historical Stage-2 unsupported-parent reference: 96 in; current canonical Store evaluation does not use unsupported span as an operation-supportability limit — Store material handling/support is assumed for the full length of stock the Store offers;
- reference maximum stock width: 12 in;
- reference loaded X feed maximum: 480 in/min;
- reference mill cutting feed: 48 in/min;
- no separate longitudinal edge-milling length maximum for `MILL_EDGE_BOUNDED`; that operation may extend over the full offered parent length, per `D001-BOARD-EDGE-MILL-REF-0.2`;
- reference mill depth per pass: 0.375 in;
- reference longitudinal mill cut width maximum: 1.0 in;
- reference end-mill reach: 8 in;
- reference end-mill depth maximum: 0.5 in.

These numbers stay attached to the Stage-2 pin. They do not become a promise about the first physical bridge or a future commissioned D-001.

### 13.8 D-001 operation families

Current source families recognize or preserve demand for:

- square crosscut;
- bounded single-plane miter;
- 3/16-in pilot/spotting;
- dado;
- groove;
- rabbet;
- bounded longitudinal profile;
- bounded end profile;
- bounded taper/cleanup where later supported;
- label/identity;
- explicitly represented secondary completion.

### 13.8.1 Current bounded full-length edge-milling declaration

`D001-BOARD-EDGE-MILL-REF-0.2` is the current canonical Store Zero declaration for the specific operation `MILL_EDGE_BOUNDED` — **Mill edge to finished width**.

For that operation:

- one parent board remains one finished board;
- the fence/reference edge is retained;
- material is removed from the opposing longitudinal edge;
- the board is fed longitudinally in one direction;
- there is no separate 60 in cutting-length cap;
- cutting length may equal the full offered parent length;
- the existing 12 in maximum stock width, 1.0 in maximum total edge removal, 0.375 in mill depth per pass and 48 in/min reference cutting feed remain;
- adequate infeed/outfeed/material support is an ordinary Store handling responsibility for offered stock and does not make an otherwise supportable operation unresolved;
- current 3/4 in Select Pine, Select Poplar, Select Red Oak and Select Cherry solid-board offerings may use this reference operation where geometry otherwise fits and no more-specific limitation is declared.

This is a versioned reference/model capability declaration, not a commissioned-machine claim. The reference Store assumes adequate material support for the stock it offers. Physical workholding, fence retention, clamping/manipulating rollers or equivalent retention, sensing, guarding, interlocks and acceptance evidence remain engineering/commissioning responsibilities.

Do not widen those names into arbitrary machining. A nominal operation name still has to fit the active material, feature and envelope declaration.

The published five-tool reference explicitly refuses a pilot diameter other than 0.1875 in unless another admitted path exists. Miter numeric range remains unresolved where not explicitly published.

---

## 14. D-001 reference and sensing model

Three questions must remain separate:

```text
1. MACHINE / AXIS POSITION CONFIRMED
2. MACHINE REFERENCE ESTABLISHED
3. WORKPIECE REFERENCE ESTABLISHED AND RETAINED
```

A servo encoder can show that an axis or manipulating roller moved. It does not, by itself, prove that the wood moved identically.

> Motor position is not wood position.

The research problem includes whether ordinary, economical sensing and workholding can establish and retain the actual workpiece relationship required by the active operation.

### `POSITION_VALID`

`POSITION_VALID` is a **machine-local workpiece-reference validity condition**.

It is not authorization, full readiness, safety approval, Store supportability, or proof of finished-part conformance.

For Job 001’s dimensional operating narrative, length-dependent work uses the Store rule that the first cleanup cut establishes the longitudinal origin. Patent centering/jog remains patent correspondence, not a replacement Store rule.

Applicable invalidation classes include:

- loss of required fence/table/plate/contact relationship;
- workholding release;
- observed or estimated slip outside the admitted condition;
- axis/tool fault;
- incomplete cycle;
- abort;
- E-stop;
- mode change;
- operator declaration that stock moved or is no longer the seated workpiece.

Exact sensing architecture remains unresolved. This document does not choose an encoder arrangement, optical sensor, pressure threshold, probe, fieldbus, or slip-detection algorithm simply to complete a diagram.

### Machine-local control firewall

Keep separate:

- local manual/jog;
- local automatic execution;
- network communication.

Network may deliver a validated/lowered job identity and receive status. It is not the real-time motion loop and it does not own stopping. No remote Cycle Start is created here.

---

## 15. D-001 acceptance / physical evidence surface

A modeled/reference capability cannot be promoted by assertion. A physical program should be able to record, where applicable:

- commanded cut length and measured cut length;
- commanded pilot-hole position and measured position;
- workpiece-reference repeatability;
- commanded manipulating-roller displacement versus actual board displacement;
- bidirectional return behavior;
- commanded versus measured miter;
- commanded routed profile versus measured deviation;
- setup time;
- operator touches;
- cycle time;
- reference-loss events;
- recovery time;
- scrap/rework;
- calibration frequency;
- maintenance burden.

No acceptance tolerance is invented here. If an owning current source does not state the tolerance, the tolerance is **unresolved**.

The first physical dimensional research experiment is intentionally narrower than full D-001. It asks whether one digital finished-length requirement can become one measured cut-to-length result without the operator recreating the cut location with tape/pencil at the saw.

---

## 16. S-001 — sheet machine

### 16.1 Evidence status

The current S-001 paths are reference/model capability declarations. They are not a commissioned physical sheet machine.

Current identifiers:

- base Mode-2 capability: `SHEET_MODE2_STENCIL_V1`;
- base envelope: `S001-MODE2-STENCIL-V1`;
- arched-aperture child: `SHEET_MODE2_ARCHED_APERTURE_V0`;
- arched envelope: `S001-MODE2-ARCHED-APERTURE-V0`;
- evidence class: `REFERENCE`;
- physical status: `NOT_CLAIMED`;
- measured: `false`;
- commissioned: `false`.

### 16.2 Mode-2 relationship

The reference Mode-2 concept preserves:

- sheet material supplies one controlled material-motion axis;
- the tooling platform supplies the other working axis;
- the router has bounded depth engagement;
- coordinated sheet/tool motion permits bounded 2-D profile work;
- selected tabs/attach points retain material during primary routing;
- secondary separation may remain separate;
- this is not generic full-sheet CNC.

Current machine-neutral operation family:

```text
LOAD
SEAT / REGISTER
ROUTE_PROFILE
RETAIN_TABS
RELEASE
SECONDARY_SEPARATION
LABEL
```

No G-code, controller dialect, or remote Cycle Start belongs in the Store answer.

### 16.3 Parent sheet and working field

The canonical arched study uses:

- parent sheet: 48 × 96 in;
- first study SKU: `STB-ZERO-PLY-050-48X96-001`;
- reference material: nominal 1/2-in plywood fixture;
- centered software/reference work field: 48 × 36 in;
- reserved reference regions in the published proof: 24 in at each long end and 6 in at top/bottom around the centered field.

The centered 48 × 36 reference field must **not** be silently reinterpreted as commissioned whole-sheet edge-machining capability. The current physical engineering plan explicitly says the eventual physical usable field may be smaller after support, workholding, travel, tooling, guarding and control geometry are known.

### 16.4 Canonical arched-aperture proof geometry

The published reference proof includes:

- opening width: 36 in;
- straight-side height: 24 in;
- arch rise: 12 in;
- derived circular-segment radius: 19.5 in;
- total opening height: 36 in;
- retained tabs/attach points;
- downstream secondary separation.

The tab-policy reference uses four requested base tabs and plans five in the canonical test by adding one reserve tab. Physical retention status remains `NOT_MEASURED`.

This is a bounded reference geometry, not a generic free-form contour promise.

### 16.5 S-001 admitted/refused meanings

The base Mode-2 evaluator admits declared straight-rectangular or reconstructable curvilinear profile paths inside the reference envelope. A generic “curvilinear” request without sufficient reconstructable geometry may be `UNRESOLVED` rather than guessed.

The path refuses or stops on conditions such as unsupported material/form/thickness, unsupported profile/depth, geometry outside the admitted field, unestablished reference/workholding, unadmitted operation, or controller/live-motion material inserted where machine-neutral geometry belongs.

The current S-001 completion path does **not** admit sheet drilling in this round.

### 16.6 S-001 physical research questions

Physical engineering still must resolve, among other things:

- fixed-sheet/moving-tool versus one-axis sheet + one-axis tool motion split;
- exact support/backing geometry;
- workholding/yoke/carrier arrangement;
- bottom/reference support;
- spindle/router/cutter;
- usable travel after guards/tool/workholding clearances;
- sacrificial backing for through work;
- reference sensing and invalidation events;
- controller/drives/I/O;
- guards, interlocks, E-stop, restart and isolation;
- dust/chip control;
- measured geometric acceptance criteria;
- tab width/count/placement validated against actual material.

Unknown physical values stay unknown.

### 16.7 S-001 evidence target

A later physical experiment should preserve, at minimum, the project revision, actual material, machine/envelope version, reference/workholding establishment, local operator/local Cycle Start, completed profile without silent geometry change, measured opening geometry, observed tab condition, defects/deviations, actual secondary separation, label/identity, and outcome record.

Patent or reference correspondence never substitutes for that evidence.

---

## 17. Secondary operations and completion

> bounded machine contribution may be useful even when it does not complete every operation.

That principle does not permit an unsupported job to become supportable by after-the-fact wording.

### Current admitted residual classes

- D-001: `FINAL_DRILL_TO_DIAMETER` — only when the primary contribution is an explicitly admitted pilot and the larger finished requirement/residual is explicitly represented;
- S-001: `REMOVE_RETAINED_TABS` — for the admitted Mode-2 retained-tab path.

Example:

```text
FINISHED REQUIREMENT
3/8 in hole

PRIMARY MACHINE CONTRIBUTION
3/16 in pilot

RESIDUAL OPERATION
final drill to 3/8 in
```

The record must not say `hole complete` after the pilot.

S-001 drilling is not admitted in the current completion round. Sanding, countersink, edge treatment, finishing, assembly and other services are not implied merely because a completion layer exists.

A secondary operation appears only when the actual declared project/result produces a real residual operation.

### Store firewall

A Store result other than `SUPPORTABLE` does not become supportable because a secondary operation is conceivable.

Permitted: Store evaluates the admitted 3/16-in pilot contribution and a separate completion plan carries final drilling.

Not permitted: Store refuses a 3/8-in drill request and the application silently relabels the refused job `SUPPORTABLE` because a person could drill it later.

---

## 18. Resolution authority

Determinism does not remove human authority.

### Customer

May choose or decline an offered completion option. Does not change Store disposition, widen a machine envelope, waive a refusal, create yard capability, or authorize motion.

### Cell steward / delegated Store authority

May, within an already declared Store process, accept/reject a completion plan, accept/reject a declared yard secondary service, confirm secondary completion, record inspection, confirm identity labeling, stage, mark pickup-ready/delivery-arranged, prepare closeout record, record custody transfer, and close the Store-side project state.

This role does not override the governed layer, widen machine capability, bypass safety, or invent controller programs.

### Operator

May **STOP WORK** and **REPORT CONDITION**. An operator may physically perform prescribed work under an already accepted/released local process, but does not thereby gain authority to rewrite the job, change price, waive a gate, widen capability, promote inspection/staging/fulfillment state, or create production authorization.

> **An operator may stop or report. An operator may not promote state.**

### Machine-local authority

The commissioned machine/cell owns local readiness, active mode, local references, interlocks, stopping, local Cycle Start, and cycle outcome under the governing physical/safety system.

### Non-overridable boundaries

No Store/customer/steward/operator action may convert:

- missing production authority into production authority;
- false `POSITION_VALID` into true by administrative preference;
- a failed safety/interlock condition into permission to move;
- an uncommissioned function into commissioned capability;
- an unresolved material identity into a known material;
- a Store refusal into supportability without a new valid basis.

---

## 19. Fulfillment

Current modeled completion/fulfillment relationships may include:

- material only;
- Store-processed material;
- admitted secondary work or an accepted assignment of residual work;
- identity labels;
- staging;
- pickup ready;
- delivery arranged;
- closeout packet/record;
- custody transfer;
- owner/outcome record linkage.

A completed machine cycle is not automatically a completed customer handoff.

```text
PRIMARY MACHINE OUTCOME
        ↓
SELECTIVE SECONDARY OPERATIONS / ASSIGNMENTS
        ↓
INSPECTION / COMPLETION CHECK
        ↓
MANDATORY IDENTIFICATION / LABEL
        ↓
STAGED
        ↓
PICKUP_READY or DELIVERY_ARRANGED
        ↓
CLOSEOUT_RECORD_PREPARED
        ↓
CUSTODY TRANSFER
        ↓
CLOSED
```

Labels bind atoms back to the durable project record. A label is not proof that the part is conforming. Pickup/delivery are fulfillment states, not machine states.

No live payment, seller-of-record, carrier integration, reservation or commercial order authority is invented by this file.

---

## 20. Determinism and provenance

A Store Zero answer should retain, as applicable:

- request/project identity;
- revision;
- Store Zero document/state identity;
- catalog clock;
- stock clock;
- capability-envelope identity/version;
- economics engine identity/version;
- exact source commit and path-specific dependency pin;
- response digest where the implementation produces one.

```text
same request
+ same declared Store state
+ same implementation
= same answer
```

Changing stock, price, capability, implementation, material identity, or request revision may legitimately change the answer. The record must identify the changed basis rather than silently overwriting the earlier answer.

---

## 21. Change and promotion rule

A proposed capability does not become Store Zero capability merely because it was discussed, appears in a patent figure, appears in Atlas research, rendered in HTML, simulated successfully, or is theoretically supported by a controller.

Directional evidence ladder:

```text
DECLARED / REFERENCE
        ↓
MODELED
        ↓
BENCH-OBSERVED
        ↓
MEASURED
        ↓
COMMISSIONED
```

Use the owning source’s vocabulary where already defined. This is not a new runtime state machine.

A Store-visible capability change requires deliberate versioned Store promotion with appropriate evidence. Physical commissioning, production authorization and safety each require their own independent basis.

---

## 22. Capability-gap register

Store Zero should preserve unmet demand in a form that can support later research rather than returning an unexplained “no.”

### Required gap fields

For each material gap where evidence exists, retain:

```text
project class
part / feature
required operation
current Store disposition
current machine limitation
material limitation
handling limitation
secondary-operation option
supplier / outsourcing option
frequency / count, if measured
economic consequence, if measured
operator burden, if measured
reference transfer required
candidate smallest capability increment
evidence status
```

Do not invent population statistics. A structure may exist before frequency data exists.

### Current named research gaps

| Gap | Present evidence | Consequence / question | Candidate smallest increment | Frequency status |
|---|---|---|---|---|
| D-001 actual board reference retention | reference/model only | can commanded roller motion be trusted as actual stock displacement? | sensing/workholding method sufficient to prove `POSITION_VALID` | not yet measured |
| D-001 third manipulating roller | patent correspondence + current open question | does another contact/drive point materially improve retention, short-stock handling or recovery? | one additional manipulating roller if evidence earns it | not yet measured |
| D-001 simple cleanup/taper function | retained demand + current research hypothesis | can one bounded tool avoid transfer/flip/layout/rereference? | narrow router/mill function, not universal axis expansion | not yet measured |
| D-001 miter | disclosed/published family but numeric current physical range unresolved | when is bounded angle work worth carrying locally? | smallest declared miter actuation/range that answers real demand | not yet measured |
| D-001 full-length stock support | current canonical Store treats adequate support for offered stock as ordinary Store handling, not a machining-capability gate | what support/workholding is needed to retain the reference safely through the full offered length? | yard-appropriate infeed/outfeed/support and verified workpiece retention; exact physical arrangement remains engineering | not yet measured |
| D-001 first digital bridge | manual control case remains current physical truth | can one digital finished length become one measured cut without tape/pencil layout? | controlled positioning + one cut-to-length path | planned physical experiment |
| S-001 physical support/workholding | reference model only | can a sheet retain reference through the bounded profile? | smallest support/clamp/reference architecture | not yet measured |
| S-001 physical work field | software/reference field 48 × 36 | what usable field remains after real guards/tool/workholding geometry? | physical frame/travel sufficient for the first research part | not yet measured |
| S-001 tab retention | tab plan exists; physical retention `NOT_MEASURED` | do tabs safely retain the actual cutout in actual material? | measured tab policy before promotion | not yet measured |
| S-001 process economics | material Q known; process Q unresolved | does local routing create useful Store economics? | measured cycle + labor/secondary handling evidence | not yet measured |
| Store/main implementation locality | current main documentary; executable family at path pins | cold readers can miss the executable basis | canonical manifest + path-specific pins; no silent file restoration | documented in this file |

A gap may end in `TEST`, `DEFER`, `OUTSOURCE`, or `REJECT`. The register is not an automatic machine backlog.

---

## 23. Capability-increment evaluation

A candidate addition should be compared as an increment rather than celebrated as “more capability.”

Use, as applicable:

```text
capability increment
new neutral operations enabled
project classes recovered
material forms covered
manual setups eliminated
reference transfers eliminated
operator interpretation eliminated
handling reduction
refusal reduction
cycle-time effect

actuation delta
sensing delta
calibration delta
I/O / control delta
guarding delta
safety delta
dust / extraction delta
maintenance delta
capital cost
integration cost
footprint / interference cost

evidence status
decision: KEEP / TEST / DEFER / OUTSOURCE / REJECT
```

Candidate examples include a third manipulating roller, a second router orientation, the simpler cleanup/taper router, bounded miter actuation, external support, or additional sheet capability. None becomes Store capability simply by appearing in this comparison.

A useful increment should answer a real Store gap with less total handling, rereferencing, operator interpretation or refusal burden than the alternatives. It may still be rejected if safety, maintenance, footprint, capital, integration or low demand make the increment unjustified.

---

## 24. Patent lineage and correspondence

### 24.1 Primary source and discipline

Primary issued sources retained in the System repository:

- `docs/patents/source/US9720401B2.pdf` — U.S. Patent 9,720,401 B2;
- `docs/patents/source/US10768609B2.pdf` — U.S. Patent 10,768,609 B2.

Correspondence discipline:

- `docs/patents/PATENT-ALIGNMENT-GATE.md` at System pin `138d0c01b62193012e5c5c891723b7dd47407119`.

Permitted relationship labels:

- `CLAIM CORRESPONDENCE`;
- `SPECIFICATION CORRESPONDENCE`;
- `FIGURE CORRESPONDENCE`;
- `BOUNDED IMPLEMENTATION CHOICE`;
- `PROJECT EXTENSION`;
- `NO PATENT DEPENDENCY`.

The issued source controls patent wording. Secondary maps help navigation only.

### 24.2 Store/system correspondence table

| Current subject | Correspondence label | Issued-source relationship | Current implementation meaning |
|---|---|---|---|
| customer/project interaction → estimated price → fabrication instructions → components ready at a location | `CLAIM CORRESPONDENCE` | issued integrated-system/method claims describe customer project interaction, estimated pricing, machine instructions and local pickup-ready fabrication | current Store uses reference economics and bounded Store answers only; it does not claim a live seller/order flow |
| tandem sheet + dimensional machine relationship | `CLAIM CORRESPONDENCE` | issued claims expressly distinguish a sheet machine and a dimensional-stock machine within the integrated system | current D-001/S-001 are separated capability families; neither is thereby commissioned |
| S-001 support/backing/rollers/yokes/tooling-platform relationship | `CLAIM CORRESPONDENCE` + `FIGURE CORRESPONDENCE` | issued claims/specification describe support frame, backing plates, base rollers, clamping rollers, rotating yokes with servo-controlled manipulating rollers, guide rails and movable tooling platform | current Mode-2 reference is narrower and remains `REFERENCE / NOT_CLAIMED` physically |
| D-001 support surface/fence/clamp/manipulating roller/saw relationship | `CLAIM CORRESPONDENCE` + `FIGURE CORRESPONDENCE` | U.S. 9,720,401 B2 claim 4 describes frame/surface, fence, clamping roller, servo-controlled manipulating roller and sawing station; dependent material adds fixed ways | current reference/hypothesis uses a bounded subset and its own evidence status |
| secondary-operations station and labeling | `CLAIM CORRESPONDENCE` | issued dependent claims include secondary operations and labeling/assembly relationships | current completion layer admits only explicitly declared residual operations and operational identity labels |
| existing retail/manual machinery footprint and simple maintainable construction | `SPECIFICATION CORRESPONDENCE` | issued specification discusses retail-store deployment, existing legacy machinery space, simple/less-expensive maintainable construction and in-store staging | current machine research tests that economic/deployment premise rather than treating it as proved |
| present two-manipulating-roller D-001 reference | `BOUNDED IMPLEMENTATION CHOICE` | issued claims require at least one; exemplary description includes a broader roller arrangement | current two-roller Store reference is a narrowed research implementation, not a claim about required patent scope |
| first-cleanup-cut longitudinal origin | `BOUNDED IMPLEMENTATION CHOICE` | issued exemplary machine narrative also describes centering/jog reference approaches | current Job 001 Store narrative uses the cleanup-cut origin; sensing remains unresolved |
| controller-specific lowering at machine site | `BOUNDED IMPLEMENTATION CHOICE` | issued lineage includes generated/transmitted machining instructions | current architecture preserves instruction generation/transmission but moves controller-specific lowering downstream of Store/app boundaries |
| `POSITION_VALID`, Store membrane, governed gates, provenance, default-deny live motion | `PROJECT EXTENSION` / `NO PATENT DEPENDENCY` | current governance and machine-local validity architecture is not relied upon as patent disclosure | these are current engineering/governance controls and must stand on their own evidence |
| modern encoder/sensing choices | `PROJECT EXTENSION` / `BOUNDED IMPLEMENTATION CHOICE` | exact modern hardware is not inferred from older issued disclosure | later engineering may select sensing; this file does not invent it |

### 24.3 Patent firewall

Patent correspondence does not establish:

- installed hardware;
- commissioned capability;
- machine readiness;
- measured tolerance or repeatability;
- guarding adequacy;
- safety category / PL / SIL;
- regulatory compliance;
- production authorization.

This file makes no conclusion about infringement, validity, enforceability, claim scope, remaining term, or licensing outcome. It is a technical provenance/correspondence record, not a legal opinion.

---

## 25. Worked Store Zero requests

### 25.1 CUT-001 — simple dimensional board proof

**Demand.** One nominal 2×4×6 SPF parent board; finished kept length 60.000 in; square cut-to-length reference path; label/staged pickup relationship.

**Store resolution.** The active fixture maps this to `STB-ZERO-SPF-2X4-72-001`:

- fixture selling price: `$3.13`;
- fixture on hand: `60 ea`;
- required Store reference operation: `CROSSCUT`;
- D-001 reference family applies;
- stock answer for quantity 1: `ON_HAND_SUFFICIENT`;
- Stage-2 reference disposition: `SUPPORTABLE`.

**Reference sequence.** Seat/register the stock; first cleanup cut establishes the working longitudinal origin in the Job 001 operating rule; index to the finished requirement; square crosscut; release; label.

**Economics.** Applying the published Stage-2 cycle formula to the CUT-001 fixture gives approximately `9.518 min` modeled job time, about `$50.86` modeled cell recovery, and `Q ≈ $53.99` including the fixture material line. These are calculated reference values, not measured production time or a commercial quote.

**Meaning.** This is the smallest reference chain showing that a finished-length requirement can be translated to a bounded Store/machine-neutral demand. The current physical Machine Build 1 still has to earn the corresponding real measured result.

### 25.2 Alcove Insert — dimensional Store proof

The current Store Job 001 / pricing fixture carries the established pine alcove example with a 45.5-in opening width, 14-in configured depth, five shelves and a derived crosswise finished length of `43.875 in` for the shelf boards under the published fixture calculation.

**Store material lines.** The Stage-2 pricing/evaluation path uses:

- `STB-ZERO-PINE-1X6-72-001` — quantity 4; selling price `$15.74`; fixture on hand 30;
- `STB-ZERO-PINE-1X6-96-001` — quantity 10; selling price `$20.99`; fixture on hand 36;
- `STB-ZERO-HW-ALCOVE-PACK-001` — one hardware pack; selling price `$18.00`; fixture on hand 25.

The regression test establishes:

- catalog line material total: `$272.86`;
- hardware extension: `$18.00`;
- Store evaluation: `SUPPORTABLE`;
- stock basis: `SYNTHETIC_FIXTURE`.

Applying the published cycle formula gives a modeled dimensional cycle of approximately `29.134 min`, modeled cell recovery of about `$83.56`, and `Q ≈ $374.42` including material, hardware and modeled cell recovery. `Q` remains a budgetary reference, not a commercial quote.

**Boundary.** That Store answer does not establish site verification, structural adequacy, installation suitability, production authority, machine readiness, or physical fabrication. Those remain owned by their respective layers.

### 25.3 Window Seat — useful stop before Store promotion

The Window Seat is deliberately not presented here as a clean Store success path.

The current System source uses it to prove that ordinary project language can change the questions that must be answered. Once intended human seating is part of the candidate, additional governed questions become relevant, including seating load, span/deflection, substrate/anchorage, window operation/access and conditional human review.

The documented first governed fixture stops with `EGRESS_REVIEW_REQUIRED` when the configured seat envelope intersects the fixture-declared access zone. A later revised configuration does not erase that stop; affected gates rerun. The current source also preserves the separate seat-load/span/anchorage blocker before the PASS fixture can be treated as complete.

Therefore this canonical Store file does **not** invent a full Window Seat SKU list, structural answer, or `SUPPORTABLE` Store disposition for the complete project.

The correct chain is:

```text
owner intent / evidence
→ candidate seating configuration
→ governed questions and STOP where applicable
→ review / revised configuration
→ dependent gates rerun
→ only when the demand is stable enough:
   Store material / capability question
```

Historical dual-stream window-seat demonstrations remain useful donors. They do not become current production authority.

### 25.4 S-001 centered arched internal opening

**Demand.** One 48 × 96 nominal 1/2-in plywood fixture sheet with a centered bounded internal opening:

- opening width 36 in;
- straight-side height 24 in;
- arch rise 12 in;
- derived radius 19.5 in;
- total opening height 36 in;
- requested retained tabs 4;
- route depth 0.5 in.

**Store material.** `STB-ZERO-PLY-050-48X96-001`:

- list reference `$25.29`;
- fixture selling price `$26.55`;
- fixture on hand `18 ea`;
- observation identity `OBS-017` in the pinned fixture.

**Reference capability.** The published evaluator returns `SUPPORTABLE` for this exact reference request under `SHEET_MODE2_ARCHED_APERTURE_V0` and the centered `S001-CENTER-WORK-FIELD-V0`.

The tab policy plans 5 tabs from the 4-tab base request by adding one planning reserve. Physical retention remains `NOT_MEASURED`.

**Economics.** Current estimate status is `BUDGETARY_MATERIAL_ONLY`; `Q = $26.55`; `processQ_status = UNRESOLVED`.

**Physical meaning.** `SUPPORTABLE` is a Store reference result. The same returned object explicitly retains `REFERENCE`, `NOT_CLAIMED`, measured `false`, commissioned `false`, and non-claims including G-code and Cycle Start. It is not evidence of a built S-001.

---

## 26. Negative / refusal examples

A serious Store must be useful because it can say no precisely.

| Request / condition | Current result | Reason / meaning |
|---|---|---|
| SKU/material not represented | `UNRESOLVED` or no offering/refusal as defined by the evaluator path | material identity/offering must not be invented |
| offered SKU with insufficient fixture quantity | `UNAVAILABLE` | supplier path does not silently cure on-hand shortage |
| D-001 pilot diameter other than 0.1875 in where only fixed pilot is admitted | `REFUSED` | tool capability is bounded |
| D-001 requested operation outside material/envelope declaration | `REFUSED` | operation name alone is not enough |
| S-001 50-in centered aperture width in the 48-in horizontal reference field | `REFUSED` | `CENTER_WORK_FIELD_EXCEEDED` |
| S-001 25-in straight side + 12-in rise in 36-in vertical field | `REFUSED` | `CENTER_WORK_FIELD_EXCEEDED` |
| S-001 parent too small to contain declared centered field | `REFUSED` | `CENTER_WORK_FIELD_OUTSIDE_PARENT` |
| S-001 route depth 0.9 in in current reference | `REFUSED` | `ROUTE_DEPTH_EXCEEDS_REFERENCE_ENVELOPE` |
| S-001 tab count 0 | `REFUSED` | `STENCIL_TABS_REQUIRED` |
| G-code/controller language placed in Store-level S-001 request | `REFUSED` | `MACHINE_LOCAL_LANGUAGE_NOT_ACCEPTED` |
| exterior rating requested on the current 1/2-in plywood fixture without established rating | `UNRESOLVED` | `EXTERIOR_RATING_NOT_ESTABLISHED_BY_SKU` |
| dimensional 2×4 submitted to S-001 sheet path | `REFUSED` | `SHEET_MODE2_NOT_DIMENSIONAL` |
| OSB line without route-profile declaration submitted to arched S-001 path | `REFUSED` | material offering does not carry the required reference operation |
| window-seat configuration with unresolved access/load/span/anchorage conditions | upstream governed STOP / unresolved demand | do not manufacture a clean Store answer before the project question is ready |
| modeled capability requested as physical production because simulation passed | refused by authority boundary | simulation/reference evidence cannot promote itself to production |
| stale answer after request or Store state changed | reevaluate | provenance/version must identify the changed basis |

Silence is never the negative case. A consequential line is either answered, unresolved, refused, unavailable, or identified as an implementation/protocol failure outside the business disposition set.

---

## 27. Source contradictions and their disposition

This consolidation does not solve contradictions by selecting the most convenient sentence.

| ID | Source discrepancy | Canonical representation |
|---|---|---|
| C-01 | current Store `main` is documentary while the executable Stage-2/published-job family exists at older path-specific pins | preserve current `main` as documentary source and list executable assets with exact pins; do not restore/delete silently |
| C-02 | patent exemplary D-001 narrative includes three manipulating rollers; Stage-2/current bounded hypothesis uses two | patent = correspondence; two-roller Store model = bounded reference choice; third roller remains research candidate |
| C-03 | patent longitudinal reference narrative includes centering/jog; Job 001 uses first cleanup cut as longitudinal origin | current Store operating narrative uses Job 001 first-cut origin; patent approach remains correspondence; sensing unresolved |
| C-04 | older Cell material describes S-001 as not a live Store asset; later published-job pin contains explicit S-001 reference evaluators | later pinned reference implementation is acknowledged as Store reference evidence; physical status remains `NOT_CLAIMED` and no commissioning is inferred |
| C-05 | published five-tool D-001 names T1/T2/T3 router roles; current research intent describes two richer bounded routers plus one simpler cleanup/taper function | preserve published T1/T2/T3 reference names; record newer role interpretation as research hypothesis only; final physical arrangement unresolved |
| C-06 | Stage-2 D-001 contains exact fixture coordinates/travels/feeds while current machine program says physical machine is not established | exact Stage-2 numbers remain reference/model values attached to their pin; physical commissioning must measure its own values |
| C-07 | S-001 software reference uses a centered 48 × 36 field; physical engineering plan says usable field may shrink | 48 × 36 remains software/reference envelope only; actual physical field unresolved until engineering/commissioning |
| C-08 | historical Window Seat/Sarah material depicts a richer dual-stream fabrication story; current governed source is simulation-only | historical story remains donor/context; current path preserves STOP/review/revision and does not claim production execution |
| C-09 | patent architecture is broader than the current bounded research cell | patent correspondence is preserved; current implementation may intentionally narrow it and must label the narrowing |
| C-10 | price/material fixtures are concrete enough to look commercial | every price/stock/economic section retains fixture/budgetary/non-live status; no seller-of-record promise is created |

---

## 28. Consolidated unresolved register

Open questions are grouped by owner/type so they cannot disappear in prose.

### 28.1 Unresolved Store semantics / Store implementation

- long-term repository placement of the pinned executable Store assets relative to current documentary `main`;
- any Store-visible capability promotion after future physical evidence;
- real Store owner/delegation implementation beyond the modeled authority roles;
- live supplier/special-order semantics and service agreements;
- live inventory, reservation, seller-of-record, payment and carrier integration — all presently not implemented/claimed;
- actual yard secondary-service catalog, if one is later offered;
- future real Store freshness/expiration rules beyond fixture clocks.

### 28.2 Unresolved D-001 machine engineering

- exact physical frame/travel/geometry;
- actual manipulating-roller count and mechanism;
- workpiece slip/reference-retention sensing;
- whether a third manipulating roller is justified;
- exact miter range and actuation;
- exact pilot/drill envelope beyond the fixed 3/16-in reference functions;
- external support/overhang arrangement;
- final router/tool arrangement and which function carries cleanup/taper;
- exact tool/spindle/motor selections;
- local controller/drives/I/O/fieldbus;
- dust/extraction;
- guarding, restraint, stopping, reset and isolation engineering.

### 28.3 Unresolved S-001 machine engineering

- first physical frame/support architecture;
- final motion split between sheet and tooling;
- physical workholding/reference chain;
- physical Mode-2 registration;
- spindle/router/cutter;
- sacrificial backing;
- physical usable work field;
- depth-control/reference implementation;
- controller/drives/I/O;
- sensing and position invalidation;
- guards/interlocks/E-stop/restart/isolation;
- dust/chip management;
- tab policy validated against actual material.

### 28.4 Unresolved physical commissioning / measurement

- actual D-001 cut-length accuracy and repeatability;
- actual board displacement versus commanded roller displacement;
- actual pilot-position accuracy;
- actual miter/profile accuracy;
- actual S-001 opening/profile error;
- physical tab retention;
- measured cycle times;
- measured setup/operator touches/recovery burden;
- calibration frequency;
- maintenance burden;
- scrap/rework behavior;
- physical acceptance tolerances not already declared by an owning source;
- production eligibility;
- commissioned safety evidence.

### 28.5 Unresolved research choices

- which capability gaps occur frequently enough to justify local capital;
- whether the third roller creates enough value to keep/test;
- whether the simpler cleanup/taper function is worth the extra tooling/guarding/maintenance;
- whether bounded miter belongs in an early local cell or outside service;
- when supplier/special-order/secondary work is economically better than local automation;
- whether a two-machine dimensional/sheet research cell is justified by actual demand and evidence;
- what the smallest useful S-001 physical experiment should become after support/workholding/safety constraints are known.

Unknown tolerance = unresolved, not guessed. Unknown frequency = not yet measured, not estimated for appearance.

---

## 29. Implementation manifest

The canonical file is the semantic front door. Executable assets remain where they have actual implementation force.

### 29.1 Store current documentary baseline

| Canonical subject | Implementation/source asset | Identity / pin | Role / status |
|---|---|---|---|
| Store canonical definition | `STORE-ZERO.md` | `GeorgePlattDemo/scan-to-build-store` | branch `build/store-zero-canonical-0.1` | canonical semantic master created by this consolidation |
| translation baseline | `DEFINITIONS.md` | Store | `3620b35369d70cf49733bbb0b62c0f3d9969b738` | current documentary definitions |
| source/implementation navigation | `STORE-ASSET-TO-IMPLEMENTATION-MAP.md` | Store | same current Store pin | documentary source map |
| worked Store/Cell example | `STORE-JOB-001.md` | Store | same current Store pin | documentary worked Store/cell chain |

### 29.2 Pinned Store executable/reference family

| Canonical subject | Implementation/source asset | Exact Store pin | Role / status |
|---|---|---|---|
| active reference catalog | `store-zero-catalog.json` | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | 92-offering machine-readable fixture |
| price observations | `store-zero-observations.json` | same | fixture observation basis |
| Store economics | `store-zero-pricing-engine.mjs` | same | `STB-STORE-ZERO-PRICE-1` v0.2.2 + D-001 modeled cycle |
| Store question / dispositions | `store-zero-stage2-store.mjs` | same | callable deterministic Store evaluator |
| catalog/economics regression | `store-zero-stage2.test.mjs` | same | catalog count, price basis, Alcove evaluation regression |
| disposition regression | `store-zero-disposition.test.mjs` | same | Store disposition behavior |
| D-001 Stage-2 envelope prose | `D-001-STAGE2-ENVELOPE-0.1.md` | same | reference/model envelope document |
| D-001 Stage-2 evaluator | `d001-stage2-envelope.mjs` | same | machine-readable reference envelope |
| D-001 envelope regression | `d001-stage2-envelope.test.mjs` | same | deterministic envelope test |
| D-001 milling regression | `d-001-stage2-mill.test.mjs` | same | mill-envelope regression |
| D-001 five-tool prose | `D-001-FIVE-TOOL-REFERENCE-0.1.md` | same | published bounded reference candidate |
| D-001 five-tool evaluator | `d001-five-tool.mjs` | same | machine-readable five-tool reference |
| D-001 five-tool regression | `d001-five-tool.test.mjs` | same | refusal/supportability regression |
| S-001 Mode-2 prose | `S-001-MODE2-ENVELOPE-0.1.md` | same | reference Mode-2 envelope |
| S-001 Mode-2 evaluator | `s001-mode2-envelope.mjs` | same | machine-readable Mode-2 reference |
| S-001 Mode-2 regression | `s001-mode2-envelope.test.mjs` | same | support/refusal regression |
| S-001 arched prose | `S-001-MODE2-ARCHED-APERTURE-0.1.md` | same | centered arched reference |
| S-001 arched evaluator | `s001-mode2-arched.mjs` | same | curvilinear/field evaluator |
| S-001 arched regression | `s001-mode2-arched.test.mjs` | same | canonical arch + negative cases |
| curve math | `circular-segment.mjs` | same | bounded circular-segment derivation |
| stencil/tab policy prose | `STENCIL-TAB-POLICY-0.1.md` | same | reference retention policy |
| stencil/tab policy implementation | `stencil-tab-policy.mjs` | same | deterministic tab planning; physical retention not measured |
| Store/Cell evidence stages | `STB-STORE-CELL-STAGES-0.1.md` | same | reference evidence vocabulary |

The earlier Stage-2 pin `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` remains path-specific provenance for the Stage-2 D-001 foundation. The later `4402abeb...` pin is used above because it contains that foundation plus the published D-001/S-001 proof family. This does not make either pin a universal project constant.

### 29.3 System / governed sources materially used

| Subject | Source | Repository / pin | Role |
|---|---|---|---|
| Store boundary | `docs/store/CURRENT-STORE-FOUNDATION.md` | System `138d0c01...` | current authority/membrane/disposition summary |
| cell mechanics/control | `source-library/machine-cell/STB-CELL-0.1.md` | System `138d0c01...` | descriptive/candidate D-001/S-001 mechanics and source discrepancies |
| lowering boundary | `source-library/atlas-research/STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md` | System pin | donor/field survey; not adopted capability |
| bounded capability ladder | `source-library/atlas-research/STB-ATLAS-05-ENVELOPE-LADDER-0.1.md` | System pin | donor/field survey; not runtime state |
| controls/iron survey | `source-library/atlas-research/STB-ATLAS-06-IRON-0.1.md` | System pin | donor/field survey; not BOM/safety design |
| machine-source map | `docs/machine/POST-APP-MECHANICAL-SOURCE-MAP.md` | System pin | current source-admission map |
| physical research program | `work/machines/MACHINE-BUILD-PROGRAM-0.1.md` | System pin | manual control case + Build 1–4 research sequence |
| dimensional staging | `work/machines/staging/DIMENSIONAL-MACHINE-STAGING-0.1.md` | System pin | present physical truth and first bridge question |
| sheet physical plan | `work/machines/engineering/sheet/SHEET-MACHINE-BUILD-0.1.md` | System pin | first bounded S-001 physical candidate; no capability claimed |
| completion/secondary ops | `work/capability-bridge/COMPLETION-PATH-0.1.md` | System pin | residual-operation, steward/operator, label/stage/closeout boundaries |
| Window Seat edge case | `work/capability-bridge/WINDOW-SEAT-EDGE-CASE-JOURNEY-0.1.md` | System pin | STOP/review/revision example; no production claim |
| patent discipline | `docs/patents/PATENT-ALIGNMENT-GATE.md` | System pin | correspondence labels and patent firewall |
| issued patents | `docs/patents/source/US9720401B2.pdf`, `docs/patents/source/US10768609B2.pdf` | System pin | primary patent sources |
| governed authority | `README.md` + controlling governed documents | governed reference `18949f163718a937f072f4be3a654bb303e53160` | simulation-only/default-deny production boundary |

---

## 30. Canonical reading rules

A cold reader or AI given only this file should preserve the following rules before drawing any conclusion:

1. **Store Zero is a reference Store, not a real dealer.**
2. **Fixture stock is not live inventory.**
3. **Fixture price and Q are not commercial quotes.**
4. **A Store `SUPPORTABLE` answer is not production authorization.**
5. **D-001/S-001 reference envelopes are not commissioned machines.**
6. **Axis/servo position is not proof of workpiece position.**
7. **`POSITION_VALID` is local workpiece-reference validity, not a universal readiness flag.**
8. **Machine-neutral operations are not G-code/controller programs.**
9. **Secondary work does not rescue an unsupported Store result unless the split path was explicitly admitted.**
10. **Patent correspondence does not establish safety, commissioning or legal conclusions.**
11. **A historical demonstration does not become current authority because it is visually complete.**
12. **Unresolved is an acceptable result. Refusal is an acceptable result. Negative research evidence is evidence.**
13. **The smallest justified capability increment is preferred over silent conversion into generic CNC.**
14. **Physical evidence must be earned separately.**

---

## 31. Safety invariant

**NO BLOOD ON WOOD.**

Nothing in Store supportability, budgetary economics, patent correspondence, a WorkPacket, simulation, machine-neutral operations, a modeled envelope, a UI rendering, or this canonical file establishes safe physical operation or production readiness.

A future physical build must separately resolve competent mechanical, electrical, controls, guarding, interlock, stopping, workholding, sensing, dust/extraction, commissioning and risk-assessment requirements before powered production use.
