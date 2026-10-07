# Scan-to-Build Store Asset-to-Implementation Map

## Purpose

The missing path is upstream.

This document models the integration between a governed project requirement and **Store Zero**, a fictional reference lumberyard whose assets, stock, supplier relationships, processing capability, and operating limits are explicitly declared for test purposes.

Store Zero exists to make the Store boundary concrete, testable, replaceable, and auditable.

**Nothing declared about Store Zero becomes a canonical Scan-to-Build Store requirement unless it is separately adopted by the controlling governed specification.**

The implementation question is therefore not how to redesign a lumberyard. It is:

> Given a sufficiently governed project requirement, how much can an existing yard already satisfy, what remains missing, and what is the smallest justified addition needed to close that gap?

---

## Problem

A typical lumberyard is already equipped to receive, source, sell, stage, process, and deliver wood once the requested product or service is sufficiently defined.

The upstream problem appears before that point.

A customer may have a dimensional requirement, project condition, desired object, drawing, scan, takeoff, or incomplete idea without yet having a SKU, bill of material, fabrication order, or conventional service request that the yard's existing systems can act on.

Scan-to-Build introduces a governed inbound path from that project requirement to the yard's existing commercial and productive assets.

The objective is not to replace the lumberyard. The objective is to expose what the yard already has, identify what the governed requirement still lacks, and add only the smallest justified information, process, or machine capability needed to produce an honest result.

---

## Store Zero

Store Zero is not a model of every lumberyard and is not a proposed commercial standard.

It is a controlled reference fixture.

Its declared facts may include:

- physical site and customer-facing operations;
- warehouse and staging space;
- bounded stock records;
- material offerings;
- supplier and special-order relationships;
- existing processing equipment;
- declared machine capability;
- operator actions;
- pickup and delivery options;
- service limits and refusal conditions.

Each declaration must be traceable to a Store Zero fixture or configuration record.

A Store Zero fact may support a test or derived result. It may not silently become a universal rule.

### Status distinction

| Example | Status |
|---|---|
| A Store must distinguish on-hand stock from supplier availability | Canonical rule |
| Store Zero declares 24 pieces of a bounded stock item on hand | Store Zero fixture fact |
| A governed job requires two matching pieces | Governed project fact |
| Store Zero can satisfy that quantity from current stock | Derived evaluation result |
| Store Zero has one crosscut station | Store Zero fixture fact |
| Therefore every Store must have a crosscut station | Invalid promotion |

---

## Typical Yard Assets and Scan-to-Build Integration

The following rows are reference assumptions to be tested and replaced where necessary. They describe common yard functions, not universal requirements.

| Typical yard asset | Existing function | Scan-to-Build introduces |
|---|---|---|
| Physical location | Established local commercial site | A destination for digitally resolved local project demand |
| Customer counter / sales operation | Staff, transactions, customer service, existing sales process | A resolved project result that can enter the existing sales process |
| Warehouse / staging space | Receiving, holding, staging, and handling material | Project-linked material allocation and bounded work staging |
| Stock inventory | Lumber, sheet goods, dimensions, grades, quantities, pricing | Structured stock matching against a governed project requirement |
| Supplier relationships | Distributors, mills, manufacturers, and special-order channels | Resolution beyond on-hand stock without treating remote supply as local inventory |
| Material knowledge | Practical knowledge of species, grades, substitutions, defects, and availability | Structured application of that knowledge while preserving unresolved conditions |
| Existing processing equipment | Some bounded cutting or material-preparation capability may already exist | Machine-readable capability declaration and, where justified, a governed instruction path |
| Labor | People already receive, move, inspect, cut, stage, load, and deliver material | Defined operator actions rather than an assumed new production workforce |
| Loading / pickup area | Existing physical handoff to customers and contractors | Handoff of project-linked material or bounded completed parts |
| Delivery capability | Existing local fulfillment route | Project-specific delivery as a continuation of existing fulfillment |
| POS / purchasing / accounting | Existing commercial systems | No initial replacement; Scan-to-Build returns a sufficiently resolved commercial requirement |
| Known service limits | Staff already know what the yard refuses, cannot source, or cannot process | Explicit defer, refer, or refuse results |
| Jobs that walk away | Unserved demand is encountered but usually not structured | Preserved reason for failure: material, capability, information, economics, or geography |

---

## The New Inbound Path

```text
PROJECT NEED
    ↓
GOVERNED PROJECT DEFINITION
    ↓
STORE ZERO EVALUATION
    ├── material offering match?
    ├── stock available?
    ├── supplier path available?
    ├── processing capability available?
    ├── required information resolved?
    └── fulfillment path available?
    ↓
BUY / MAKE / MODIFY / REFER / DEFER / REFUSE
```

The first Store implementation question is:

> **How much of this governed requirement can Store Zero satisfy using only its declared existing assets?**

Only the remaining gap becomes a candidate for new software, machine capability, labor, or outside fulfillment.

---

## Implementation Rule

For each required Store function:

1. identify the corresponding Store Zero asset or declared absence;
2. determine whether that existing asset already satisfies the requirement;
3. expose the asset through a bounded Store interface where necessary;
4. identify the remaining capability gap;
5. add only the smallest justified increment;
6. preserve the result and its basis;
7. keep Store Zero assumptions separate from canonical Store requirements.

The intended sequence is:

**declared existing asset → callable asset → identified gap → smallest addition → measured result**

This map is the basis for the Store roadmap. It does not itself activate machine capability, production authority, or universal lumberyard assumptions.
