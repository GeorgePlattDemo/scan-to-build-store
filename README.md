# Scan-to-Build Store

Private reference implementation for the Scan-to-Build store boundary.

The Store resolves identified project/job requirements against available materials, stock, machine capability, simulation, economics, and fulfillment capability.

It consumes the shared operational job meaning owned by **Scan-to-Build System** and returns Store-owned facts and answers to consuming applications.

The Store does not redefine the job, silently repair unresolved information, or allow machine capability or economics to override the upstream definition.

## Machine implementation and open capability decisions

Read [D-001 machine implementation](D001-MACHINE-IMPLEMENTATION-0.1.md) for the recovered three-router/two-spot inventory, its relationship to current executable functions, proposed positional sensing, and the remaining decisions before additional jobs can receive a complete Q. Machine-readable authority: `d001-machine-implementation.mjs`, attached to the active envelope and travel model. This register does not promote unimplemented stations into capability.

## Governing dimensional Store standard

For every **complete dimensional Store Q**, [`DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md`](DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md) controls the path from identified configuration → Store capability → modeled D-001 work → modeled occupied-cell time → Store economics → Q → confirmed reconciliation.

There is one governing dimensional Store evaluator. Configure may present the answer it returns; Configure may not reproduce Store pricing/capability logic. The confirmed Store reconciliation calls the same evaluator again. Missing authority fails closed.


---

## Purpose

This repository exists to answer a bounded operational question:

> Given a governed project requirement, what can this store actually provide, make, simulate, defer, or refuse?

The Store converts governed requirements into a store-specific answer without changing the meaning of the originating project.

Its job includes:

- material and offering resolution;
- local stock and availability;
- machine and process capability;
- project-to-capability evaluation;
- bounded translation into machine-neutral operations;
- simulation;
- fulfillment planning;
- execution-boundary definition;
- outcome reporting.

The Store is intended to support both a reference implementation and future independently implemented stores, yards, cells, machines, and fulfillment providers.

---

## Repository Boundary

### System owns shared operational meaning

- canonical shared job/project definitions and semantic boundaries;
- application/Store interface contracts;
- shared record and custody semantics;
- definition/readiness boundary meanings used to ask Store a bounded question;
- WorkPacket and other shared operational object meanings where currently admitted;
- simulation-versus-production distinctions carried by the application contract.

Canonical operational-definition navigation begins in `GeorgePlattDemo/scan-to-build-system/docs/definitions/README.md`, with executable contracts under `apps/stb/shared/`.

The Store consumes the identified job meaning. It does not replace or silently rewrite it.

### Program owns research and adoption records

`GeorgePlattDemo/3d-solutions-program` owns research, experiments, evidence, machine-development questions/findings, reviewed decisions/adoption records, partnerships/economic/business work, and migration/retirement records. A Program proposal does not expand Store capability until Store deliberately adopts and tests a versioned capability.

### The Store owns

- what materials or offerings are locally available;
- what stock is actually present or obtainable;
- what processes and machines are available;
- what those machines can and cannot perform;
- whether a governed requirement fits the declared store capability;
- translation from an accepted requirement into bounded machine operations;
- store-side simulation and fulfillment results.

### Applications own

- user entry and project journeys;
- presentation and interaction;
- capture and configuration workflows;
- resuming existing work;
- presenting Store results to the user.

Applications may ask the Store questions. They do not determine Store capability or issue Store authorization.

---

## Core Separation

The following concepts remain distinct:

**Project requirement** is not **material offering**.

**Material offering** is not **stock availability**.

**Stock availability** is not **machine capability**.

**Machine capability** is not **authorization**.

**Authorization** is not **physical execution**.

A valid Store implementation must preserve these distinctions.

---

## Store Evaluation

A Store receives a governed request and evaluates it against its declared resources and capabilities.

A Store may determine that work is:

- supportable;
- unsupported;
- unavailable;
- unresolved;
- deferred;
- refused.

A Store must not manufacture missing facts or convert uncertainty into acceptance.

An identified project may proceed toward bounded planning or simulation only through the applicable System operational contracts plus the Store-owned capability/refusal checks for the exact request.

---

## Machine Capability

Machine implementation is modular.

The Store should be able to describe and evaluate machine capability without requiring every store to use the same physical equipment.

### Fixed Tool Geometry

The reference cell uses a determinate known tool set — a small fixed group of saws, drills, mills, and routers. Tool positions, machine references, station locations, and controlled motion relationships are established as part of commissioning and held in the machine configuration.

The job supplies what the part is: finished dimensions, feature positions referenced to the part, required operations, and part identity. The machine configuration supplies where the tools are and how stock moves between them. The controller combines those two facts to position the work.

For the fixed-tool reference cell, there is no per-job tool-location map, no manual machine-offset setting at Cycle Start, and no programmer reconstructing the drawing beside the machine.

The machine-specific lowering logic still exists. It is established and validated as part of commissioning and configuration, then executes deterministically for accepted jobs rather than being manually authored again for each order.

This separation keeps the job portable: the part is not defined by one particular cell's station coordinates.

### Capability declaration

The Store uses the System-defined shared operational meaning of `MachineEnvelope` and owns the particular Store/machine capability instance it declares.

A Store may declare or reference a machine-specific capability representation conforming to that contract. It does not redefine the contract, silently extend an envelope because an operation once succeeded, or infer capability from observed behavior.

Capability remains distinct from readiness, authorization, and physical execution.

### Operating conditions

Three machine-side conditions remain separate:

**Local manual / jog operation** — an operator commands permitted machine motion through local controls. Servos may still perform the movement.

**Local automatic operation** — the cell executes an accepted machine program under local control.

**Network communication** — the network delivers a validated job and receives status.

> **Loss of network communication shall not affect real-time motion, interlocks, state management, or stopping. The network delivers a validated job and receives status.**

A change between manual and automatic operation is an explicit local machine event. Network presence is not motion authority.

### `POSITION_VALID`

The machine knows where the applicable workpiece reference is, or it knows that it does not.

`POSITION_VALID` is the machine-local condition that the workpiece reference required for the commanded motion has been established and remains valid under the declared machine conditions.

When `POSITION_VALID` is false, the machine must not execute a command whose geometry depends on known workpiece position. Position must be established again under the applicable machine procedure.

`POSITION_VALID` is not readiness, authorization, or proof that a finished part conforms.

### Capability progression

Initial development uses four capability levels:

### MCL-1 — Transmission Proof

The smallest complete machine path.

One governed instruction.  
One board.  
One established workpiece reference.  
One bounded operation.  
One observed result.

Its purpose is to prove transmission, interpretation, execution-boundary behavior, and outcome recording with the smallest practical machine system.

A useful comparison exists below MCL-1:

**Position-assisted operation** — controlled stock positioning with an operator completing the physical cut or operation through independently controlled equipment.

This is a comparison point, not an additional formal MCL.

### MCL-2 — Minimum Useful Cell

The minimum bounded machine capability capable of supporting a viable initial project class or fulfillment offering.

This level is expected to contain the first meaningful multi-operation implementation.

For the D-001 reference path, the number of times the workpiece must be released and re-referenced is a primary complexity and error driver. The preferred pattern is to establish the workpiece once and perform the required operations inside a maintained reference chain.

### MCL-3 — Extended Capability

A broader capability envelope built from demonstrated needs and limitations discovered through MCL-1 and MCL-2.

Requirements may be defined before every implementation choice is fixed.

### MCL-4 — Frontier Capability

Long-range capability, advanced automation, and future machine concepts.

MCL-4 may guide architecture and research but must not create active implementation obligations merely because a concept is documented.

An MCL label does not itself grant operations. Each implemented capability must explicitly declare the operations and limits it supports.

---

## Modularity

The Store should be designed so that individual implementations can be replaced or extended without redefining the complete system.

Expected separations include:

- governed request intake;
- material resolution;
- stock resolution;
- capability declaration;
- job evaluation;
- translation;
- machine adapter;
- simulation;
- execution boundary;
- outcome reporting.

A future lumberyard, machine builder, software developer, or fulfillment provider should be able to implement a conforming module without inheriting unrelated internal machinery.

---

## Development Rule

This repository begins clean intentionally.

Existing Scan-to-Build repositories, exploratory work, machine drafts, reference-node work, and prior design studies are **source material**, not automatically part of this implementation.

Prior work enters this repository only when it is deliberately adopted because the Store requires it.

Useful prior ideas may remain preserved elsewhere without becoming active Store architecture.

Planned concepts do not become requirements merely because they are documented.

---

## Initial Build Direction

The initial Store work should establish, in order:

1. the Store contract;
2. Store input and output objects;
3. capability and availability semantics;
4. bounded Store evaluation;
5. MCL-1;
6. simulation and outcome handling;
7. MCL-2 requirements and implementation.

Higher capability levels should grow from demonstrated requirements rather than anticipated complexity.

---

## Current Status

**Early private development.**

This repository is not a production lumberyard system, production machine controller, commerce service, or claim of production readiness.

The immediate goal is to establish a clean, testable, modular Store boundary capable of growing without weakening the Scan-to-Build governance model.
