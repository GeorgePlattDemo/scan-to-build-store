# Store Zero

## Reference Lumberyard and Store Membrane

Store Zero is the fictional lumber and building-materials dealer used to develop, test, and audit the Scan-to-Build Store.

It is intentionally ordinary.

Store Zero already sells material, receives trucks, maintains stock, buys from suppliers, serves homeowners and contractors, prepares orders, stages pickups, delivers to jobsites, handles special orders, and performs limited material-processing services.

Scan-to-Build does not replace those functions.

It adds a bounded path by which an incomplete but governed project requirement can ask those existing systems and people useful questions before the requirement has already been reduced to a conventional SKU, takeoff, quote, or order.

The principal architectural boundary is the **Store membrane**.

> **The Store membrane allows outside demand to call selected Store capabilities without giving the outside world possession of the Store.**

Publicly callable does not mean publicly visible.

Connected does not mean surrendered.

---

# 1. Status of Store Zero

Store Zero is a controlled reference fixture.

Its physical assets, software systems, stock, supplier relationships, employees, commercial practices, machine capabilities, and limitations are fictional declarations created to make the Scan-to-Build Store concrete and testable.

They shall be treated as Store Zero facts, not lumberyard-industry facts.

A different lumberyard may:

- use different software;
- expose different information;
- stock different products;
- use different suppliers;
- provide different services;
- own different equipment;
- organize employees differently;
- accept different work;
- refuse different work.

A conforming future Store does not have to look like Store Zero.

Store Zero exists so the first implementation has something specific to integrate with.

---

# 2. The Operating Problem

A functioning lumberyard can usually act efficiently once the customer request has been translated into language its existing systems recognize.

Examples include:

- SKU;
- item;
- quantity;
- unit of measure;
- material list;
- takeoff;
- quote;
- sales order;
- special order;
- purchase order;
- pick ticket;
- delivery.

The difficult interval is earlier.

A person may instead begin with:

> I need shelves in this opening.

> I have a drawing.

> I measured this space.

> Can this be made from something you carry?

> Can you get the material?

> Can you cut any of it here?

> Is there another local path if you cannot?

That information represents demand, but it is not yet an ordinary lumberyard transaction.

The Store problem is therefore not primarily an inventory problem, machine problem, or e-commerce problem.

It is a **translation and controlled-access problem**.

```text
INCOMPLETE PROJECT REQUIREMENT
             |
             v
     GOVERNED DEFINITION
             |
             v
       STORE MEMBRANE
             |
             v
 EXISTING STORE SYSTEMS
 material / stock / supply /
 capability / commerce /
 fulfillment
             |
             v
       BOUNDED ANSWER
```

---

# 3. Store Sovereignty

Store Zero owns and controls its operational information.

That includes its:

- inventory system;
- supplier relationships;
- purchase history;
- costs;
- margins;
- customer accounts;
- pricing rules;
- reservations;
- employee information;
- warehouse operations;
- equipment;
- machine controls;
- maintenance information;
- commercial decisions.

Scan-to-Build does not require ownership of those systems or unrestricted access to their contents.

It requires sufficiently reliable answers to bounded questions.

The preferred principle is:

> **Ask for the answer, not the database.**

For example, Scan-to-Build may need to know whether Store Zero has enough suitable stock for a project.

It does not automatically need to know:

- every item in the warehouse;
- every rack location;
- Store Zero's acquisition cost;
- reorder levels;
- competing customer orders;
- margin;
- shrink adjustments;
- supplier contract terms.

The Store may answer:

> Matching material is represented.

> It is on hand.

> Current represented quantity is sufficient for this request.

> This answer is current through the stated freshness limit.

That can be sufficient.

The internal facts used to produce the answer remain under Store Zero's control.

---

# 4. Store Zero — Physical Baseline

Store Zero is modeled as one independent LBM branch serving both professional contractors and ordinary retail customers.

These are fixture declarations, not universal yard requirements.

| Store Zero asset | Existing purpose | Relevance to Scan-to-Build |
|---|---|---|
| Customer counter / pro desk | Product inquiry, quotes, orders, contractor service | Existing commercial point where a resolved project can become business |
| Retail/catalog area | Presents stocked and orderable products | Existing product-facing public interface |
| Covered warehouse | Receives and stores weather-sensitive material | Physical source for applicable stock |
| Lumber yard | Stores and handles bulk/long material | Existing dimensional-material infrastructure |
| Receiving area | Reconciles incoming material against purchase orders | Existing point where supplier facts become local stock facts |
| Staging area | Holds picked orders before pickup or delivery | Existing project/order convergence point |
| Will-call / pickup path | Customer pickup of prepared material | Existing local fulfillment path |
| Loading area | Loads customer and delivery vehicles | Existing material handoff |
| Material-handling equipment | Moves units, bundles, pallets, and pieces | Existing labor/productivity infrastructure |
| Delivery capability | Moves orders to customer/jobsite | Existing fulfillment network |
| Limited cut service | Performs bounded material preparation | First existing productive capability to evaluate before new machinery |
| Supplier network | Sources stock and non-stock material | Extends Store capability beyond what is physically on hand |
| Special-order relationships | Obtains products outside normal stock | Existing route for project requirements that exceed local inventory |

Store Zero does **not** begin with a Scan-to-Build automated fabrication cell.

That absence is intentional.

The first machine question remains:

> What can Store Zero already do, and what is the smallest additional capability justified by the work it cannot presently serve?

---

# 5. Store Zero — People and Operating Roles

Store Zero already contains human capability that shall not disappear merely because software is added.

| Role | Existing responsibility |
|---|---|
| Counter / inside sales | Customer inquiry, item selection, quotes, orders |
| Contractor / project sales | Larger jobs, takeoffs, account pricing, staged requirements |
| Buyer / purchasing | Supplier relationships, purchase orders, replenishment, special orders |
| Receiving | Confirms incoming material against expected receipts |
| Yard / warehouse staff | Put-away, stock movement, picking, staging, loading |
| Material-service operator | Performs permitted existing cutting/material-preparation work |
| Dispatcher | Organizes truck runs and delivery sequence |
| Driver | Delivers material and records delivery result |
| Accounts receivable / credit | Customer accounts, invoices, payment, credit terms |
| Store manager | Local operational and commercial authority |

Scan-to-Build may make portions of those responsibilities more callable.

It does not silently transfer their authority to software.

---

# 6. Current Store Zero Systems

Store Zero is modeled with the system classes commonly found in current LBM operations.

The names below are Store Zero fixture labels, not proposed Scan-to-Build canonical object names.

## S0-ERP — Dealer ERP / POS

The Store's principal commercial system of record.

It represents functions such as:

- item/SKU master;
- units of measure;
- locations;
- inventory;
- purchasing;
- receiving;
- vendor records;
- quotes;
- sales orders;
- special orders;
- customer accounts;
- account pricing;
- invoices;
- accounts receivable;
- accounts payable;
- transaction history.

This is the system used at the counter.

Scan-to-Build does not replace it.

---

## S0-YARD — Yard / Warehouse Operations

The operational layer used to move material through the branch.

Typical functions include:

- receiving;
- barcode scanning;
- inventory counts;
- tally entry;
- put-away;
- stock location;
- picking;
- pick tickets;
- staging;
- loading;
- quantity reconciliation.

A yard may implement these functions inside its ERP, a warehouse-management system, mobile applications, paper processes, or some combination.

Store Zero models the functions rather than depending on one vendor architecture.

---

## S0-SUPPLY — Supplier / Purchasing Connections

Store Zero already has electronic and human connections to suppliers.

These may include:

- vendor catalogs;
- electronic data interchange;
- buying-group connections;
- supplier portals;
- emailed or phoned orders;
- price files;
- purchase orders;
- purchase-order acknowledgments;
- advance ship notices;
- invoices;
- availability inquiries;
- special-order workflows.

The supplier connection is already a membrane.

The supplier does not hand Store Zero its entire company.

It answers agreed commercial questions and exchanges agreed transaction documents.

Scan-to-Build should learn from that pattern.

---

## S0-PORTAL — Customer / Contractor Digital Access

Store Zero has a product-centric digital channel representing some combination of:

- product catalog;
- product search;
- customer account;
- customer-specific pricing;
- quote access;
- ordering;
- order history;
- invoices;
- payment;
- pickup;
- delivery;
- order status.

The important limitation is that this interface generally begins with **products and transactions**.

It is good at:

> Find this item.

> Check my price.

> Reorder this product.

> Accept this quote.

> Deliver this order.

It is not designed primarily for:

> Here is an opening in my house. What useful path can this yard offer?

That is the new upstream connection.

---

## S0-TAKEOFF — Contractor Project / Estimating Path

Store Zero can accept sufficiently developed contractor information such as:

- plans;
- drawings;
- material lists;
- takeoffs;
- project phases;
- job names;
- quantities.

The result may become:

```text
PLAN
  ↓
TAKEOFF
  ↓
MATERIAL LIST
  ↓
QUOTE
  ↓
SALES ORDER
  ↓
PICK / DELIVERY
```

This is an important neighboring capability.

It proves that yards already translate project information into commerce.

Scan-to-Build begins one step earlier when the requirement is not yet a conventional takeoff.

---

## S0-DISPATCH — Delivery and Proof of Fulfillment

Once an order exists, Store Zero can prepare material for delivery through functions such as:

- pick;
- stage;
- load;
- manifest;
- route;
- delivery sequence;
- delivery status;
- signature;
- photograph;
- timestamp;
- proof of delivery.

This is another existing boundary between Store data and the outside world.

A driver does not need the Store's entire ERP.

The driver needs the information required to make the assigned delivery.

That same principle informs the Store membrane.

---

# 7. Existing Industry Transaction Chain

A normal stocked-material transaction may already look roughly like:

```text
CUSTOMER REQUEST
      ↓
COUNTER / PORTAL
      ↓
QUOTE
      ↓
SALES ORDER
      ↓
PICK TICKET
      ↓
PICK / STAGE
      ↓
WILL-CALL
    or
DELIVERY MANIFEST
      ↓
HANDOFF
      ↓
PROOF OF DELIVERY
      ↓
INVOICE / ACCOUNT RECORD
```

A non-stock requirement may instead create:

```text
CUSTOMER REQUEST
      ↓
QUOTE / SPECIAL ORDER
      ↓
PURCHASE ORDER
      ↓
SUPPLIER ACKNOWLEDGMENT
      ↓
SHIPMENT / RECEIVING
      ↓
LOCAL STOCK OR DIRECT FULFILLMENT
      ↓
CUSTOMER ORDER
```

A contractor project may begin:

```text
PLANS
  ↓
TAKEOFF
  ↓
JOB MATERIAL LIST
  ↓
QUOTE
  ↓
ORDER
  ↓
STAGED DELIVERIES
```

Scan-to-Build adds another entrance:

```text
HUMAN NEED
   ↓
SITE / REQUIREMENT EVIDENCE
   ↓
GOVERNED PROJECT DEFINITION
   ↓
STORE MEMBRANE
   ↓
EXISTING MATERIAL / STOCK /
SUPPLY / CAPABILITY SYSTEMS
   ↓
BOUNDED STORE ANSWER
```

It does not need to replace what happens after the request becomes conventional.

---

# 8. The Store Membrane

The Store membrane is the controlled boundary between Store Zero's internal operating reality and an external caller.

It is not necessarily one API.

It is an architectural rule governing what may cross the boundary.

The membrane may eventually be implemented through:

- API;
- dealer-system adapter;
- EDI;
- event feed;
- scheduled export;
- vendor-supported connector;
- scoped database view;
- file exchange;
- staff-confirmed response;
- or another bounded mechanism.

The Store membrane has four jobs:

### Receive a bounded question

The outside caller specifies what it needs to know.

### Consult authoritative Store sources

The Store decides which internal source is responsible for the answer.

### Project only the needed answer

Internal operational detail does not automatically leave the Store.

### Preserve source and freshness

The receiving system can determine what the answer represents and when it ceases to be usable.

---

# 9. The Membrane Is a Projection Boundary

The same internal Store fact may be projected differently depending on the caller.

Example: inventory.

The ERP may internally contain:

```text
SKU
exact quantity
warehouse
rack
unit cost
average cost
supplier
open PO
customer allocations
reorder point
last count
adjustments
margin
```

An anonymous project inquiry may receive only:

```text
material match: YES
local stock state: ON_HAND
requested quantity: SUFFICIENT
freshness: CURRENT
```

An authenticated customer account may additionally receive:

```text
customer price
orderable quantity
pickup option
delivery option
```

Store personnel may see the full internal record.

The underlying inventory did not change.

Only the **projection through the membrane** changed.

---

# 10. Publicly Callable ≠ Publicly Visible

Store Zero may permit the public to ask a question without publishing the data used to answer it.

For example:

> Can Store Zero presently satisfy a requirement for three panel blanks of the declared material class and dimensions?

The Store may return:

**YES — represented from current local stock**

without publishing:

> There are exactly 31 sheets in rack P-17, average cost $37.42, 12 allocated to Contractor X, next PO arriving Thursday.

This distinction is central.

Scan-to-Build needs useful access.

It does not need surveillance access.

---

# 11. Membrane Access Classes

Store Zero uses different information boundaries for different actors.

| Access class | Typical caller | Permitted scope |
|---|---|---|
| Public | Anonymous visitor | General offerings, services, bounded capability, public inquiry results |
| Project-scoped | Governed project holder | Answers relevant to the submitted requirement |
| Account-scoped | Store customer / contractor account | Account pricing, quotes, orders, delivery, invoices as permitted by existing Store systems |
| Store operational | Authorized Store staff | Internal systems appropriate to role |
| Supplier/trading partner | Supplier or buying network | Agreed catalog, purchase, shipment, invoice, and related transactions |
| Machine-local | Authorized Store/machine-side system | Only information required for bounded machine evaluation or later physical execution |

These classes describe the boundary.

They do not create authentication or authorization implementations by themselves.

---

# 12. What Scan-to-Build Needs From Stock

Scan-to-Build does **not** require blanket access to all Store Zero inventory.

The first useful stock interface should answer a requirement rather than expose an inventory dump.

For a requested material line, useful answers may include:

**Material match** — Does represented stock correspond to the requested material identity/form?

**Dimension match** — Does usable represented stock meet the dimensional requirement?

**Quantity sufficiency** — Is represented quantity sufficient for the requested quantity?

**Location/channel** — Is the answer local stock, another branch, supplier, or special order?

**Freshness** — When was the answer established and when should it no longer be relied upon?

**Limitations** — What does this stock answer not prove?

Exact quantity may be exposed when Store Zero chooses to expose it.

It is not required merely to answer whether the current request is supportable.

---

# 13. What Must Remain Distinct in Stock

The following states shall not collapse:

```text
CATALOGED
    ≠
OFFERED
    ≠
ON HAND
    ≠
SUFFICIENT FOR REQUEST
    ≠
ALLOCATED
    ≠
RESERVED
    ≠
PICKED
    ≠
STAGED
    ≠
LOADED
    ≠
DELIVERED
```

A Store interface that reduces those states to one boolean named `available` loses consequential information.

---

# 14. Supplier and Special-Order Membrane

Store Zero's supplier network is one of its most valuable existing assets.

Scan-to-Build should make that capability callable without requiring disclosure of the underlying commercial relationship.

The Store may know internally:

- supplier identity;
- supplier account;
- negotiated cost;
- buying-group terms;
- freight terms;
- rebate structure;
- purchase minimums;
- lead times;
- cancellation rules;
- return rules.

The project may need only:

> Matching material is not presently represented from local stock.

> A special-order route is represented.

> Supplier confirmation is required.

> Expected lead-time information is available / unavailable.

> Customer price requires a Store quote.

The relationship remains Store Zero's.

The **ability to use the relationship** becomes callable.

---

# 15. Existing EDI Pattern

Store Zero's supplier systems provide a useful precedent for the Scan-to-Build membrane.

Trading partners already exchange bounded documents rather than exposing entire internal systems.

Common supply-chain messages include the equivalents of:

```text
PRODUCT / CATALOG DATA
        ↓
PURCHASE ORDER
        ↓
PURCHASE ORDER ACKNOWLEDGMENT
        ↓
SHIP NOTICE / MANIFEST
        ↓
RECEIPT
        ↓
INVOICE
        ↓
PAYMENT / REMITTANCE
```

The lesson for Scan-to-Build is architectural:

> **Share the transaction or answer required by the relationship, not the entire source system.**

---

# 16. Price and Commercial Sovereignty

Store Zero retains authority over:

- cost;
- margin;
- customer-specific pricing;
- contract pricing;
- discounts;
- credit;
- quote validity;
- taxes;
- payment;
- commercial terms.

Scan-to-Build may carry or present a merchant-generated price or quote.

It shall not infer one from private cost information.

The following remain distinct:

```text
PRICE OBSERVATION
    ≠
CUSTOMER PRICE
    ≠
ESTIMATE
    ≠
QUOTE
    ≠
ORDER
    ≠
PAYMENT
```

The Store membrane may expose different commercial information to different customer/account classes.

---

# 17. Capability Membrane

Physical capability follows the same sovereignty pattern as stock.

Store Zero may internally know:

- exact machine;
- manufacturer;
- model;
- maintenance condition;
- workholding;
- tooling;
- calibration;
- operator schedule;
- guarding;
- controller;
- machine coordinates;
- internal operating procedure.

The outside project does not automatically need those details.

It may need:

> Material family supported.

> Square crosscut represented.

> Maximum usable stock envelope.

> Operator required.

> Current readiness requires Store confirmation.

> These refusal conditions apply.

A **capability projection** is not a machine-control interface.

---

# 18. Store Zero Existing Processing Baseline

Store Zero declares one existing bounded employee-operated material-preparation capability.

Its initial purpose is to represent the kind of light processing already found in many building-material operations without declaring a future Scan-to-Build machine design.

Baseline declaration:

**Service family** — employee-operated material preparation.

**Represented operation** — bounded square crosscut.

**Material family** — dimensional stock within later-declared limits.

**Operator** — required.

**Automation** — none assumed.

**Remote motion** — absent.

**Production API** — absent.

**Machine-specific geometry** — not yet declared.

**Readiness** — Store-controlled.

This declaration allows the first Store analysis to ask:

> Can the project be fulfilled using a resolved packet plus processing Store Zero already performs?

Only demonstrated gaps justify an additional machine capability.

---

# 19. What Scan-to-Build Adds

Store Zero already has systems for conventional commerce.

Scan-to-Build adds the missing upstream connection.

| Existing Store capability | Scan-to-Build addition |
|---|---|
| Product catalog | Project requirement can exist before product selection |
| SKU/item master | Governed material requirement can be matched to merchant products |
| Inventory | Project-specific bounded stock inquiry |
| Supplier catalogs | Project-specific special-order inquiry |
| Counter sales | New inbound project channel |
| Takeoff | Earlier requirement formation before conventional takeoff |
| Quote | Resolved requirement can later request merchant quote |
| Cut service | Capability becomes explicitly queryable |
| Yard knowledge | Refusal conditions can be made visible |
| Delivery | Fulfillment option can be attached to the resolved path |
| Historical failed inquiries | Refusal/defer reasons can be preserved rather than disappearing |

---

# 20. What Scan-to-Build Does Not Add at Baseline

Store Zero does not initially add:

- a replacement ERP;
- replacement POS;
- replacement WMS;
- replacement accounting;
- replacement customer-credit system;
- new payment system;
- universal inventory database;
- public view of internal inventory;
- public supplier contracts;
- public Store costs or margins;
- unrestricted CAD service;
- unrestricted custom manufacturing;
- live machine control;
- production authorization;
- automated stock reservation;
- automated purchasing;
- automatic material substitution.

Those functions may later connect where justified.

They are not prerequisites for proving the Store boundary.

---

# 21. Store Membrane Integration Modes

A future real yard shall not be disqualified merely because it lacks a modern REST API.

The Store membrane should be capable of adapting to several implementation modes.

## Native API

Preferred when the dealer system exposes a supported bounded interface.

Useful for:

- catalog;
- stock inquiry;
- customer account;
- quote/order status;
- other current data.

## EDI

Natural fit for established supplier and trading-partner transactions.

Useful for:

- catalog/item data;
- purchase orders;
- acknowledgments;
- shipment notices;
- invoices;
- remittance.

## Supported connector

Vendor or third-party integration layer between Store systems and outside applications.

## Controlled export/import

CSV, JSON, or another file representation where no live interface is required.

The export must preserve source and freshness.

## Staff-confirmed adapter

A human Store participant supplies or confirms the answer.

This is a legitimate implementation path.

Manual does not mean invalid.

## Fixture adapter

Synthetic Store Zero data used for deterministic testing.

No fixture result is represented as live Store data.

---

# 22. Direct Database Access Is Not the Architecture

A direct database connection may occasionally be technically possible.

It is not the assumed Scan-to-Build integration model.

Direct coupling risks:

- exposing irrelevant information;
- bypassing Store business rules;
- coupling Scan-to-Build to one vendor schema;
- weakening Store control;
- making system upgrades fragile;
- confusing internal state with externally authorized facts.

The preferred boundary is a Store-controlled projection or adapter.

---

# 23. Freshness

Some Store facts change slowly.

Others change by the minute.

Examples:

**Material definition** — relatively stable.

**Store service declaration** — moderately stable.

**Machine capability envelope** — stable until equipment/configuration changes.

**Supplier route** — may change.

**Price** — may change quickly.

**On-hand quantity** — may change immediately after a sale, pick, receipt, adjustment, or reservation.

Therefore a Store answer must carry enough temporal context for a receiving system to know whether it may still be relied upon.

A stale answer does not silently become current because no newer answer is available.

---

# 24. Write Authority

The initial Store membrane should be primarily **read/query oriented**.

Scan-to-Build may ask:

- what material is represented;
- what stock state is represented;
- what supplier route exists;
- what service/capability exists;
- what fulfillment paths are represented.

It does not initially:

- change inventory;
- reserve stock;
- create purchase orders;
- alter customer accounts;
- modify Store pricing;
- allocate trucks;
- issue machine commands.

Those are later integrations that must earn explicit authority.

---

# 25. The Public Inbound Path

The Store membrane should eventually support useful anonymous or low-identity inquiry.

A person should be able to discover whether a relevant path appears to exist without first becoming:

- a sales lead;
- a contractor account;
- a purchase order;
- or a fully specified customer.

Example:

```text
"I need shelves that fit this opening."
          ↓
bounded project definition
          ↓
Store Zero inquiry
          ↓
material class represented?
stock route represented?
special-order route represented?
processing capability represented?
          ↓
useful answer
```

Only when the person chooses to proceed does the process need to cross into the applicable commercial/account path.

This preserves the distinction between **demand formation** and **customer acquisition**.

---

# 26. Existing Product Portal vs Scan-to-Build Door

Store Zero's conventional digital portal begins approximately here:

```text
KNOW PRODUCT
    ↓
SEARCH
    ↓
PRICE
    ↓
CART / QUOTE
    ↓
ORDER
```

Scan-to-Build begins earlier:

```text
KNOW NEED
    ↓
DESCRIBE / CAPTURE
    ↓
RESOLVE REQUIREMENT
    ↓
ASK STORE WHAT IS POSSIBLE
    ↓
THEN, IF APPROPRIATE:
PRODUCT / QUOTE / MAKE / REFER / DEFER / REFUSE
```

The two channels should converge rather than compete.

---

# 27. The Membrane Between Project and Commerce

The governed project remains upstream of Store commerce.

A project may exist before:

- Store selection;
- product selection;
- SKU selection;
- price;
- quote;
- reservation;
- order.

Once the Store has returned a usable answer, the project may deliberately enter the yard's existing commercial workflow.

```text
GOVERNED PROJECT
       ↓
STORE MEMBRANE
       ↓
MATERIAL / CAPABILITY MATCH
       ↓
OWNER CHOICE
       ↓
EXISTING STORE COMMERCE
QUOTE → ORDER → PICK → FULFILL
```

The Store does not own the project merely because the project queried it.

---

# 28. The Membrane Between Store and Machine

The machine boundary is narrower still.

A future machine-side component should receive only the information necessary to evaluate or perform its bounded responsibility.

It does not need:

- customer credit;
- Store margin;
- unrelated project history;
- unrelated inventory;
- supplier negotiations;
- marketing information.

Conceptually:

```text
GOVERNED WORK REQUIREMENT
          +
STORE MATERIAL / STOCK SELECTION
          +
DECLARED MACHINE CAPABILITY
          ↓
BOUNDED MACHINE-SIDE EVALUATION
```

Machine capability does not override Store, owner, or governed authority.

---

# 29. Store Zero Information Classes

Store Zero information is divided conceptually into five exposure classes.

| Class | Example | Default posture |
|---|---|---|
| Public | Store services, public product information | May be exposed |
| Project-scoped | Material/capability answer for one requirement | Expose only to applicable project interaction |
| Account/commercial | Contract pricing, quote, invoice, account information | Authenticated Store relationship |
| Operational | Exact inventory details, purchase state, internal allocations, staff workflow | Store internal |
| Sensitive/control | Credentials, private contracts, detailed machine controls, security data | Do not expose through public Store interface |

An implementation may refine these classes later.

---

# 30. Store Zero Asset-to-Membrane Map

| Internal asset | Holder | What Scan-to-Build may need | What may remain private |
|---|---|---|---|
| Item master | Store | Material/product match | Full internal taxonomy |
| SKU | Store/merchant | Merchant product identity | Internal merchandising notes |
| Inventory | Store | On-hand/sufficiency/freshness | Full counts if unnecessary, rack data, costs |
| Supplier catalog | Supplier/Store | Special-order match | Negotiated supplier relationship |
| Purchase system | Store | Whether supply route exists | Cost, PO history, purchasing strategy |
| Pricing | Store | Applicable customer-facing price when offered | Cost and margin |
| Contractor account | Store/customer | Applicable quote/order relationship | Other projects, credit history |
| Cut service | Store | Declared operation/envelope/refusal | Internal procedures not needed by caller |
| Machine | Store | Capability projection | Controller internals and maintenance detail |
| Staff knowledge | Responsible employee | Confirmed capability/refusal/exception | Unrelated employee information |
| Dispatch | Store | Available fulfillment mode/status | Fleet operations not relevant to project |
| Delivery record | Store | Project delivery result | Other customer routes |
| Refusal history | Store/project | Relevant refusal and reason | Unrelated customer information |

---

# 31. First Store Zero Questions

Before implementing a project fixture, Store Zero should be able to answer these questions about itself:

**Material** — What material classes/forms does Store Zero represent?

**On hand** — Which relevant offerings have current local stock evidence?

**Supplier** — What can Store Zero obtain through existing special-order channels?

**Commercial** — What information can be exposed publicly, project-scoped, or only after a customer/account relationship exists?

**Capability** — What bounded processing does Store Zero already perform?

**People** — Which acts still require Store personnel?

**Fulfillment** — What can be picked up, delivered, referred, or otherwise fulfilled?

**Refusal** — What will Store Zero not do?

**Freshness** — Which answers require current confirmation?

**Authority** — Who inside Store Zero owns each answer?

If Store Zero cannot answer one of those questions, the absence itself is a useful implementation finding.

---

# 32. First Project After the Store Baseline

The first project brought to Store Zero should remain the constrained-space shelving case.

The private implementation does not require a fictional customer character.

The useful spine is:

```text
EXISTING CONSTRAINED SPACE
          ↓
RECORDED SITE EVIDENCE
          ↓
OWNER REQUIREMENTS / PREFERENCES
          ↓
BOUNDED SHELF CONFIGURATION
          ↓
MATERIAL REQUIREMENT
          ↓
STORE ZERO MEMBRANE
          ↓
LOCAL STOCK?
SUPPLIER PATH?
EXISTING CUT SERVICE?
ADDITIONAL MACHINE CAPABILITY?
          ↓
RESULT
```

The Store Zero file does not define the final shelf fixture.

That fixture is a later artifact.

Its job will be to exercise the Store Zero model established here.

---

# 33. Audit Requirement

A reviewer examining a Store Zero result should be able to determine:

- what came from the project;
- what came from Store Zero;
- what came from a supplier;
- which Store system or person supplied the answer;
- whether the answer was synthetic, observed, calculated, or otherwise represented;
- when the answer was current;
- which information remained private;
- what was unresolved;
- why the Store accepted, deferred, or refused the inquiry;
- whether any new capability was actually required.

The reviewer should not need access to Store Zero's fictional internal database to understand the decision.

That is one of the purposes of the membrane.

---

# 34. Contributor Requirement

A future contributor may replace a Store Zero subsystem without redefining Scan-to-Build.

Examples:

- replace the synthetic ERP adapter with BisTrack;
- replace it with Spruce;
- replace it with Frameworks;
- replace it with Agility;
- connect a different dealer-management system;
- use an EDI provider;
- use a vendor catalog;
- use a file export;
- use a manual staff-confirmation path.

The implementation may change.

The Store question should remain understandable.

---

# 35. Real-World System Families Informing Store Zero

The Store Zero model is informed by current LBM software and integration patterns.

Examples include:

**Dealer ERP / POS** — purpose-built systems combining sales, inventory, purchasing, customer accounts, accounting, and related dealer operations.

**Warehouse / yard tools** — mobile receiving, barcode scanning, counts, tallies, put-away, picking, staging, and loading.

**Supplier EDI / catalogs** — digital product data, price files, purchase orders, acknowledgments, shipment notices, invoices, and related trading-partner documents.

**Product information management (PIM)** — curated product/catalog information suitable for publishing through multiple digital channels.

**E-commerce / contractor portals** — catalog, account pricing, quotes, orders, invoices, payment, will-call, delivery, and account history.

**Takeoff / estimating systems** — translation from plans and project documents into material quantities, quote lines, and orders.

**Dispatch / proof-of-delivery systems** — route planning, manifests, delivery status, signatures, photographs, and delivery records.

**In-house production modules** — millwork, remanufacturing, cut optimization, production scheduling, or other dealer-specific value-added work.

These system families are reference context.

Store Zero does not depend on any specific vendor.

---

# 36. Design Principle

Store Zero should become more digitally callable without becoming less independent.

Its systems remain its systems.

Its relationships remain its relationships.

Its machines remain its machines.

Its employees retain their roles.

Its private commercial information remains private unless the Store deliberately exposes it.

Scan-to-Build contributes a new way for useful demand to arrive.

The membrane is successful when a project can receive an honest answer from the Store while the Store retains control of the systems and assets that produced that answer.

---

# 37. Baseline

Store Zero therefore begins as:

> **A fictional but realistic independent lumber and building-materials yard with ordinary commercial systems, local stock, supplier relationships, contractor and retail channels, limited existing processing, pickup and delivery capability, and a controlled digital membrane through which Scan-to-Build may ask bounded questions without taking ownership of Store operations.**

The first implementation objective is not to automate Store Zero.

It is to make Store Zero **truthfully callable**.

From that baseline:

**map the existing asset  
→ declare its holder  
→ define what may cross the membrane  
→ ask the bounded question  
→ preserve the answer and its limits  
→ expose the actual gap  
→ add only what the gap justifies.**
