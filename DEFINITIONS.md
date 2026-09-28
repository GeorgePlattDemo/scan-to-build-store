# Store Terms

Yard, merchant, supplier and Store Zero words. **Store owns these.**

**Every other term** (common words, front-door and project language, wood and material, manufacturing and machine, software, shared job objects, doctrines, and the shared never-equates) **is defined once, in System's [Definitions](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md).** That page is the single authority for shared meaning and indexes this one. Store words must not redefine the job.

Add a term here only when it is a commerce or Store-specific word that could change what was supplied, priced, reserved or fulfilled.

---

## 1. Yard, Merchant, and Supplier Language

Terms used to translate between a customer requirement and existing commercial supply systems.

**Product** — Commercially recognizable good or service. A need does not have to begin as a product.

**Catalog item** — General product identity represented in a catalog. Not automatically a particular merchant's offering.

**Stock-keeping unit (SKU)** — Merchant- or channel-specific product identifier. Commercial identity, not material identity.

**Merchant** — Entity presenting an offering for commercial supply.

**Seller of record** — Accountable party to the applicable commercial transaction.

**Supplier** — Party supplying material or product into the commercial chain.

**Offering** — Material or product represented through a particular merchant, location, or channel under stated conditions.

**Inventory** — General commercial concept for goods held or represented for sale or use.

**Stock** — Physical material represented at a location or through a supply channel.

**Stock snapshot / InventoryAssertion** — Time-bounded assertion about quantity or availability associated with an offering.

**On hand** — Represented as physically present at the applicable location and time. Not necessarily reserved or usable for a particular job.

**Available** — Commercial status whose source and meaning must be known: local, supplier, special-order, reserved, or another defined basis.

**Reserved / allocated** — Quantity deliberately held for a particular customer, order, project, or commitment.

**Special order** — Commercial route for obtaining an item outside ordinary local on-hand stock.

**Lead time** — Expected elapsed time before fulfillment under stated assumptions.

**Price observation** — Price reported or observed from a particular source and time. Not automatically a binding quote.

**Estimate** — Calculated or informed expectation. Not automatically binding.

**Quote** — Commercial offer under stated scope, price, validity, terms, and responsible seller.

**Reservation** — Commercial commitment holding specified stock or capacity. Not authorization to manufacture.

**Order** — Commercial instruction or commitment to supply defined goods or services.

**Substitution** — Replacement of one specified material or product with another under an applicable substitution rule.

**Equivalent** — Meets a defined equivalence criterion. Not merely similar.

**Lot** — Identified production or supply grouping when relevant to condition, certification, traceability, or confirmation.

**Tally** — Lumber quantity or measurement record under the applicable commercial practice.

**Pickup** — Fulfillment by transfer of goods at a designated location.

**Delivery** — Fulfillment by transporting goods to a designated destination.

**Fulfillment** — Completion of the applicable physical/commercial supply path. Not necessarily fabrication.

**Service** — Bounded work supplied by a yard or another holder. Prefer the specific service name.

**Capability** — Declared ability to perform specified work within stated limits.

**Refusal boundary** — Condition under which a holder states that it will not accept or perform the requested work.

---

## 2. Store-Specific Terms

Terms used to model the Store without turning Store Zero assumptions into universal rules.

**Store Zero** — Deliberately fictional reference lumberyard used to make Store behavior testable and auditable.

**Store Zero fact** — Declared synthetic fact about Store Zero's assets, stock, supplier relationships, equipment, capability, or limitations.

**Fixture fact** — Controlled assumption used for testing. Not an observed industry fact.

**Store inquiry** — Structured question asking what a Store can truthfully report about material, offering, stock, supply route, fulfillment, or capability.

**Store response** — Structured answer containing applicable Store facts, limitations, freshness, provenance, and unresolved conditions.

**Store evaluation** — Comparison of a bounded requirement against applicable Store facts.

**Fulfillment node / node** — Bounded yard/store environment capable of reporting relevant material, stock, fulfillment, and capability information.

**Store accept** — Store-side determination that its represented facts support the applicable next governed step. Not machine authorization.

**Store defer** — Store-side result indicating that required Store information or capability is insufficient at present.

**Store refusal** — Store-side result indicating that the request falls outside a declared Store boundary.

**Special-order route** — Store-represented path to material or goods not satisfied through the applicable local-stock path.

**Machine capability reference** — Store-visible declaration or reference to machine or cell capability conforming to governed `MachineEnvelope` semantics. A Store may declare a machine-specific envelope instance but does not redefine those semantics or infer new capability from observed success. Not machine readiness or authorization.

---

## 3. Never Equate (commerce and Store)

The shared never-equates are in System's [Definitions](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md#10-never-equate).

**Catalog item ≠ offering**

**Offering ≠ stock**

**Stock ≠ reservation**

**On hand ≠ available for this project**

**Special-order listing ≠ confirmed supplier availability**

**Price observation ≠ quote**

**Estimate ≠ quote**

**Quote ≠ reservation**

**Board foot ≠ piece count**

**Store accept ≠ governed authorization**

**Fixture fact ≠ industry fact**

---

## 4. Maintenance

Add a term when:

- yard, merchant or supplier practice uses it differently from ordinary speech;
- misunderstanding it could change what was supplied, priced, reserved or fulfilled;
- Store Zero requires it to express a fixture honestly;
- or a Store interface exposes it.

Shared terms go in System's [Definitions](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md), not here.
