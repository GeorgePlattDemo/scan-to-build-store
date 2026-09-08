# Scan-to-Build Store

Private reference implementation for the Scan-to-Build store boundary.

The Store resolves governed project requirements against available materials, stock, machine capability, simulation, and fulfillment capability.

It sits between the **Scan-to-Build Governed Reference** and user-facing applications.

The Store does not redefine project authority, silently repair unresolved information, or allow machine capability to override governance.

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

### The Governed Reference owns

- canonical project and record semantics;
- authority and authorization rules;
- unresolved-condition handling;
- governed gates and refusal behavior;
- WorkPacket meaning;
- provenance and record integrity;
- simulation-versus-production authority boundaries.

The Store consumes those rules. It does not replace them.

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

An accepted project may proceed toward bounded planning or simulation only through the authority and integrity rules defined by the Governed Reference.

---

## Machine Capability

Machine implementation is modular.

The Store should be able to describe and evaluate machine capability without requiring every store to use the same physical equipment.

Initial development will use four capability levels:

### MCL-1 — Transmission Proof

The smallest complete machine path.

One governed instruction.  
One board.  
One established datum.  
One bounded operation.  
One observed result.

Its purpose is to prove transmission, interpretation, execution-boundary behavior, and outcome recording with the smallest practical machine system.

### MCL-2 — Minimum Useful Cell

The minimum bounded machine capability capable of supporting a viable initial project class or fulfillment offering.

This level is expected to contain the first meaningful multi-operation implementation.

### MCL-3 — Extended Capability

A broader capability envelope built from demonstrated needs and limitations discovered through MCL-1 and MCL-2.

Requirements may be defined before every implementation choice is fixed.

### MCL-4 — Frontier Capability

Long-range capability, advanced automation, and future machine concepts.

MCL-4 may guide architecture and research but must not create active implementation obligations merely because a concept is documented.

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
