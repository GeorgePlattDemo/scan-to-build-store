# Scan-to-Build Store

**The yard's answer: yes, no, or not yet — and why.**

<a href="https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html"><kbd>▶ OPEN THE APP</kbd></a> &nbsp;<sub>Pick any project. This Store answers it.</sub>

3D Solutions LLC · Greensboro, North Carolina

---

## A yard already does most of this

Every paint counter takes ordinary stock and a chosen formula and hands back a finish you can repeat. Every cut desk takes a board and a length and hands back a piece. People trust those because they're local, bounded and predictable.

This repository asks for the same thing in three dimensions: ordinary lumber, changed only when a clearly defined job and a declared machine justify it.

A yard already has most of what that takes — stock, suppliers, forklifts, saws, people who know wood, customers who trust them. What it rarely gets is a job that arrives already defined. Usually it gets a conversation: *"I need shelves in this opening. Can you get the wood? Can you cut any of it here?"*

The Store is how a yard answers a defined job instead. It keeps its own systems, suppliers, margins, people, equipment and the right to say no. It exposes answers, not its database.

## Store Zero: a yard you can test against

Store Zero is a fictional lumberyard, specified in enough detail to answer real questions:

- **183 offerings** — 137 boards, 9 sheet goods, 37 hardware items — priced at a declared 5% mark-on over reference list prices — some observed at retail, the rest calculated or declared, and every one labeled with its basis.
- **Declared stock** for each item, so a job can come back short.
- **Two declared stations for two kinds of stock**, each with limits it will actually enforce: D-001 for boards, and S-001 (a sheet router cell plus the yard panel saw) for full 48 × 96 in sheets.
- **Four honest answers**: *supportable*, *unresolved*, *refused* or *unavailable*, each with its reason.

Ask the same question twice against the same version and you get the same answer. Change something — the stock, a price, the job — and the answer changes, and the record says what moved.

## The X-brace, from the yard's side

A customer's app sends a job: two 16-inch parts with 30° ends and a center spot, on a 60-inch 2×4.

The Store checks that it carries that board and has enough on hand. It checks that the saws can make 30° cuts, that the spot drill can reach, and that the machine can grip the board through every cut — the two rollers need at least 24 inches of board between them. It works out how long the machine would take, prices the wood and the machine time together, and answers: *supportable*, about 27⅝ inches left over, here's the budgetary price.

Make the parts too long for that board and the answer becomes *refused* — with the reason: the last cut would leave too little board for the two rollers to hold. The Store never quietly changes the job to make it fit.

## The machine

The reference cell, D-001, is modeled on the dimensional machine the patents disclose: a table and fence, servo-driven rollers that move the board from above, clamps that hold it to the fence, and a saw at each end, with room on the machine for drill and router heads.

D-001 as declared for Stage 2 (the machine-readable copy is [`d001-stage2-envelope.mjs`](d001-stage2-envelope.mjs)):

- **2 rollers** (R1, R2) move and hold the board
- **2 saws**, one at each end — SAW-L does miters from 0° to 45°, SAW-R cuts square
- **2 named mill functions** — a longitudinal mill between the rollers (`MILL_LONG`, which also edge-mills a board to a finished width) and an end mill (`MILL_END`)
- **1 spot operation** — a fixed 3/16 in spot/pilot at a defined location

The patents disclose more than this (a third roller, a third vertical-way router or drill, external infeed and outfeed support). Those stay **unresolved**: they are candidate research in the [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program), not Store Zero capability. See [D-001 envelope](D-001-STAGE2-ENVELOPE-0.1.md): three pictures exist, and they are not smashed together.

The tools stay in fixed, known positions, set once when the machine is commissioned. The job says what the part is — lengths, angles, where the features go. The machine's own setup says where its tools are. The controller puts those together. Nobody programs each order by hand at the machine, and nobody reconstructs the drawing at the saw.

It's designed around things you can order: open-source motion control ([LinuxCNC](https://linuxcnc.org/)), a commercial motion board, standard G-code, commercial saw heads and router spindles. Nothing exotic.

## Sheets: S-001

Boards and sheets never share a machine. D-001 refuses a sheet outright; a sheet job goes to S-001.

S-001 as declared for Stage 2 (the machine-readable copy is [`s001-stage2-envelope.mjs`](s001-stage2-envelope.mjs)):

- **The sheet cell** holds a full 48 × 96 in sheet on rollers and moves it past a router that stays at the machine's centerline. It routes straight and curved profiles inside one centered 48 × 36 in working field, and leaves the routed pieces attached by tabs for the owner to separate.
- **The yard panel saw** makes straight full-width crosscuts after routing, at least 1 in clear of anything routed.

A playhouse window is the first job it answers: one 1/2 in sheet, a centered arched opening, the center split in two for shutters, and a crosscut 18 in from each end. The Store picks the sheet, plans the tabs, times the router and the saw from newly adopted Stage-2 reference assumptions (modeled, not measured), prices it with the same declared Store Zero machine-hour rate D-001 uses, and returns every piece. Make the opening too tall for the field and the answer is *refused* — with the reason. See [S-001 envelope](S-001-STAGE2-ENVELOPE-0.1.md).

## The stages

| Stage | What it is | Where it stands |
| --- | --- | --- |
| **1 — One board** | One roller moves one board between two fixed saws and cuts it to a defined length. The test is whether the job reaches the saw without being redrawn — not whether a saw can cut wood. | Works in software |
| **2 — Store Zero and the reference cells** | The fictional yard above and the D-001 and S-001 designs, answering real project requests with prices and refusals. | Works in software; machine time is modeled |
| **3 — Physical cell** | A real build: guarding, safety-rated controls, measured cycles. Measured minutes start replacing modeled ones. | Next |
| **4 — Evidence-informed system** | Demand, refusals, measured cycles, material behavior and economics decide what the mature yard and cell should become. The patents' full machine is the upper bound being tested — the data may justify some of it, all of it, or none. | Not predetermined |

A real yard doesn't have to look like Store Zero. It only has to answer the same questions its own way.

## What's in this repository

Store Zero runs. The evaluators, catalog and tests live at the top level:

| File | What it does |
| --- | --- |
| [`store-zero-catalog.json`](store-zero-catalog.json) | The 183 offerings, prices and declared stock |
| [`store-zero-pricing-engine.mjs`](store-zero-pricing-engine.mjs) | Material, machine time and the budgetary price |
| [`d001-stage2-envelope.mjs`](d001-stage2-envelope.mjs) | What the machine will and won't accept |
| [`d001-travel-standard.mjs`](d001-travel-standard.mjs) | The one rule every board job goes through: fit, machine work, time, price |
| [`cut-package-evaluator.mjs`](cut-package-evaluator.mjs) · [`alcove-store-evaluator.mjs`](alcove-store-evaluator.mjs) | Answers for multi-part jobs and fitted inserts |
| [`s001-stage2-envelope.mjs`](s001-stage2-envelope.mjs) · [`sheet-package-evaluator.mjs`](sheet-package-evaluator.mjs) | What the sheet cell and panel saw accept, and the answer for a sheet job |

Run the tests (tested on Node 22):

```sh
node --test *.test.mjs
```

The same Store runs hosted, and the app calls it live at one pinned version: `STORE_PIN` in System's [`apps/stb/shared/contracts.mjs`](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/apps/stb/shared/contracts.mjs). A new commit here does not move that pin.

## Where the support lives

| If you want to know… | Read | Why it's the evidence |
| --- | --- | --- |
| What is Store Zero, exactly? | [Store Zero](STORE-ZERO.md) | The yard, what it keeps private, what it exposes |
| What does the machine accept and refuse? | [D-001 envelope](D-001-STAGE2-ENVELOPE-0.1.md) · [S-001 envelope](S-001-STAGE2-ENVELOPE-0.1.md) | Station layout, limits, what's still unresolved |
| How does a job become a price? | [Travel standard](DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md) | Fit, machine work, time and price, in one rule |
| What does each stage prove? | [Stages](STB-STORE-CELL-STAGES-0.1.md) | What each stage may and may not claim |
| What does one order look like, cut to closeout? | [Store Job 001](STORE-JOB-001.md) | One alcove insert through the yard |
| What would a real yard need to add? | [Asset-to-implementation map](STORE-ASSET-TO-IMPLEMENTATION-MAP.md) | Existing assets first, smallest addition second |
| What comes after Store Zero? | [Store 1](store-1/README.md) | The build surface for the first real Store adapter |
| What do the words mean? | [Definitions](https://github.com/GeorgePlattDemo/scan-to-build-system/blob/main/docs/definitions/README.md) · [Store terms](DEFINITIONS.md) | One authority for shared meaning, in System; Store keeps its commerce words |

The bigger question lives in the [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program). The customer's side lives in the [Scan-to-Build System](https://github.com/GeorgePlattDemo/scan-to-build-system).

## The fine print

Store Zero is fictional. Its stock is declared, not counted. Its prices are budgetary estimates, not quotes. Machine times are modeled. No machine has been commissioned. Publication here grants no patent license.

**NO BLOOD ON WOOD.**
