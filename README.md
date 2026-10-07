# Scan-to-Build Store

**Sell the wood. Supply the work that makes it useful.**

<a href="https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html"><kbd>▶ OPEN THE APP</kbd></a>

3D Solutions LLC · Greensboro, North Carolina

## From stock on the rack to a project someone can build

A customer needs two replacement braces, shelves for an opening, or a panel with an arch. The yard has material. The opportunity is to supply the cut, mill, and drill work that turns that material into useful components.

Scan-to-Build Store makes the yard’s side of that exchange explicit: **which material, which operations, how much modeled work, and what price?**

System carries the customer’s defined requirements. Store evaluates them against its own catalog, declared stock, equipment capability, timing, and economics. The answer tells the customer what this yard can provide and gives the yard an identified job to work from.

That is the proposed service: sell material together with the work a project requires, using the yard’s existing inventory, handling, customer relationships, and fulfillment knowledge. Bring the project information to wood already on the rack, and the yard could capture more of the value of making it useful. Whether the service earns its keep is a practical question for [Program research](https://github.com/GeorgePlattDemo/3d-solutions-program).

## Two material classes, useful work

Store Zero is the modeled reference yard used to develop and test this service. Its evaluators run today against declared material and capability facts.

| Class | Work represented here |
| --- | --- |
| **Dimensional — D-001** | Cut to length, bounded miters, declared milling profiles, and a defined 3/16-in spot/pilot operation. |
| **Sheet — S-001** | Bounded routed openings, retained tabs, supported center splits, and panel-saw crosscuts. |

The [D-001 envelope](D-001-STAGE2-ENVELOPE-0.1.md) and [S-001 envelope](S-001-STAGE2-ENVELOPE-0.1.md) give the exact accepted operations and geometry. The sheet plan keeps the routed center pieces attached by planned tabs for later separation.

**Cut, mill, and drill are operations with material, geometry, tooling, and time behind them.** The Store answer connects those facts to the requested result.

## One request, a yard’s answer

The evaluator follows the identified job through material selection, capability, modeled work, and economics. For dimensional work, the [travel standard](DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md) provides the governing completion rule. Multi-part and sheet requests have their own evaluators.

Every request receives a bounded outcome with its reasons:

- **`SUPPORTABLE`** — the declared material and capability can support the request.
- **`UNRESOLVED`** — a required fact is missing.
- **`REFUSED`** — the request falls outside the declared capability.
- **`UNAVAILABLE`** — the required supply is unavailable under the declared facts.

The yard keeps control of its own service. Another Store can use different suppliers, stock, equipment, pricing, and operating systems through the same bounded request-and-answer interface. The [Store membrane](STORE-ZERO.md) explains how outside demand calls selected services while the dealer retains its internal systems.

## The instructions are digital

The intended production chain carries the accepted definition into a registered local compiler. Software translates the part requirements, Store plan, machine geometry, tooling, and references into ordered machine instructions. **A person does not manually write a new machine program for each supported job.**

The operator’s role is concrete: verify the correct board or sheet, load and register it to the machine’s established references, check tooling and readiness, and follow the local operating procedure. The digital chain supplies the job instructions; local engineering establishes the machine and its dependable operating conditions.

The [**Project 1 digital manufacturing trail**](docs/project-1-digital-trail/D001_Project1_Review.md) lets you inspect that proposition for one specimen. One identified definition leads to a reproduced Store answer of **$11.09**, modeled work and time, local coordinates, and **45 generated virtual commands**, without a second design entry. Its evidence package includes a reproducible run, controller-oriented Structured Text, and fourteen local reference checks.

The record is a reference derivation: the controller source is uncompiled and physical admission remains blocked. Its [publication record](docs/project-1-digital-trail/README.md) preserves the exact artifacts, handoffs, and open engineering questions. Program owns broader controller and machine-development work; Store holds this specimen’s documentary record.

## Three connected homes

| Repository | Contribution |
| --- | --- |
| [**Program**](https://github.com/GeorgePlattDemo/3d-solutions-program) | Why a small local manufacturing service might be worth pursuing, and how to test its engineering and business case. |
| [**System**](https://github.com/GeorgePlattDemo/scan-to-build-system) | The customer’s project definition, application, shared job meaning, and consequential records. |
| **Store** | Its material, capability, modeled work, economics, and answers for that definition. |

The application consumes one exact Store version, owned by System’s [`STORE_PIN`](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/apps/stb/shared/contracts.mjs). Publishing a Store document does not move that runtime version.

## Explore the implementation

| Surface | What to inspect |
| --- | --- |
| [Catalog](store-zero-catalog.json) | Offerings, item identities, declared stock, and material prices. |
| [Pricing engine](store-zero-pricing-engine.mjs) | Material and modeled machine-work economics. |
| [Dimensional travel standard](d001-travel-standard.mjs) | Fit, travel, modeled work, and the dimensional completion calculation. |
| [Cut-package evaluator](cut-package-evaluator.mjs) · [Alcove evaluator](alcove-store-evaluator.mjs) | Multi-part dimensional requests. |
| [Sheet-package evaluator](sheet-package-evaluator.mjs) | Routed sheet work, tabs, and supported panel cuts. |
| [D-001 declarations](d001-stage2-envelope.mjs) · [S-001 declarations](s001-stage2-envelope.mjs) | Machine-readable capability facts. |

**Why so many files sit at the top level.** The evaluators above, their `*.test.mjs` tests, the Store Zero data (`store-zero-catalog.json`, the dated price and hardware CSV sheets, `store-zero-observations.json`) and the envelope and standard documents stay where they are on purpose: the application loads this Store at one exact version, by these exact paths. An earlier paper is parked in [`history/`](history/), the Project 1 record is in [`docs/`](docs/), and the surface for a later real Store in [`store-1/`](store-1/README.md).

Run the repository tests on Node 22:

```sh
node --test *.test.mjs
```

## Reference status and further reading

Store Zero uses declared reference stock, budgetary prices, and modeled machine time. Physical D-001/S-001 production is not commissioned; the demonstration does not transact real payment or issue a production release. The [stage guide](STB-STORE-CELL-STAGES-0.1.md) separates the software/reference work from physical commissioning.

- [**Store Zero**](STORE-ZERO.md) — the reference dealer and its service interface.
- [**Store Job 001**](STORE-JOB-001.md) — a modeled Store-side production narrative.
- [**Store 1**](store-1/README.md) — the surface for a later real Store implementation.
- [**System definitions**](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md) · [**Store terms**](DEFINITIONS.md) — shared job meaning and local yard vocabulary.
- [**Candidate machine engineering**](https://github.com/GeorgePlattDemo/3d-solutions-program/tree/main/research/machine-development) — the broader development work in Program.

**NO BLOOD ON WOOD.**

<sub>Publication grants no patent license. Maintainers: [AGENTS.md](AGENTS.md).</sub>
