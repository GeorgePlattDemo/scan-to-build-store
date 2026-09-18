# D-001 Full-Length Edge-Milling Reference 0.3

**Identity:** `D001-BOARD-EDGE-MILL-REF-0.3`  
**Status:** REFERENCE / MODELED Store capability declaration; not commissioned physical capability  
**Owner:** Store Zero capability surface  
**Safety invariant:** **NO BLOOD ON WOOD**

## Purpose

This declaration removes the separate 60 in longitudinal-profile length cap from the specific Store Zero operation:

`MILL_EDGE_BOUNDED` — **Mill edge to finished width**

The operation may extend over the **full length of any parent board offered by the active Store material fixture**, subject to the retained machining limits below.

Adequate infeed/outfeed/material support is a Store handling responsibility. It is not a reason to shorten, refuse, or mark an otherwise supportable machining operation unresolved merely because the parent is long.

This is a Store/reference-model rule. It does not claim that a physical machine has been commissioned, proven safe, or accepted for production.

## Operation meaning

The operation is:

1. retain one parent board as one board;
2. retain the fence/reference edge;
3. hold the workpiece against the fence/support relationship through the cut;
4. remove material from the opposing longitudinal edge;
5. feed the board longitudinally in one direction through the bounded milling function;
6. finish at the project-required board width.

It is **not a rip-saw operation** and does not divide one parent board into multiple narrower boards.

## Length rule

There is **no separate fixed longitudinal edge-milling length maximum**.

For `MILL_EDGE_BOUNDED`:

`maximum cutting length = full offered parent length`

There is no separate operation-length limit and no unsupported-span cutoff used as a Store supportability gate.

If Store Zero offers a 72, 96, 120, 144, 168, 192 in or other parent length in the active fixture, the reference Store evaluation may carry the bounded edge-milling operation over that full offered length where the remaining machining/material rules fit.

Store Zero assumes the yard provides ordinary material support appropriate to the stock it offers. This is a handling assumption for the reference Store model, not a claim that a specific physical support system has been engineered or commissioned.

## Width / pass limits retained

This version retains the full-length / support rule from 0.2 and replaces the single fixed 48 in/min reference cutting feed with a declared chip-load-derived species feed for reference modeling.

The existing reference limits remain:

- maximum stock width: **12 in**;
- maximum total edge removal: **1.0 in**;
- mill depth per pass: **0.375 in**;
- spindle reference: **18,000 RPM**;
- cutter reference: **3/8 in, 2 cutting edges**;
- Select Pine / SOFT WOOD adjusted chip load: **0.00675 in/tooth** → **243 in/min** derived feed;
- Select Poplar / Select Red Oak / Select Cherry / HARD WOOD adjusted chip load: **0.00600 in/tooth** → **216 in/min** derived feed.

Where required edge removal is less than or equal to 0.375 in, the modeled operation may be one continuous full-length cutting pass.

Where a greater admitted removal is required, pass count remains governed by the existing 0.375 in depth-per-pass reference. Removing the 60 in cap does not remove the width/depth bounds.

The modeled feed relation is:

`feed_rate_ipm = chip_load_in_per_tooth × cutting_edges × spindle_rpm`

The current chip-load inputs are **DECLARED REFERENCE / UNMEASURED**. They are used to make species consequences and modeled cycle time explicit for Store economics. They are not commissioned feeds, spindle settings, cutter selections, or production instructions. Before physical use, the installed cutter, spindle, machine dynamics, workholding, finish requirement, dust/chip evacuation and local commissioning evidence control.

## Material-family applicability

For Store Zero reference evaluation, `MILL_EDGE_BOUNDED` is a material-family-neutral operation for the current **3/4 in solid-board offerings** in:

- Select Pine;
- Select Poplar;
- Select Red Oak;
- Select Cherry;

provided the requested parent/finished geometry fits this declaration and no more-specific material limitation is explicitly declared.

This does not make pricing evidence stronger than its source. In particular, existing Cherry pricing remains a derived fixture reference where Store Zero already labels it that way.

A material offering, stock quantity, price, and process capability remain separate Store answers.

## Workholding / physical implementation boundary

The reference Store assumes adequate material support is supplied for the full offered stock length. The eventual physical design must still provide and verify a means to preserve the workpiece reference through the longitudinal cut, such as an appropriate combination of:

- fence/support contact;
- multiple clamping/manipulating rollers or equivalent workholding;
- reference retention sensing;
- local stopping/interlocks;
- operator boundary controls.

This file does **not** select final roller count, clamp force, final production cutter, final spindle setting, sensing method, guarding, safety category, or acceptance tolerance.

Those are engineering and commissioning matters.

The reference model must not describe this operation as physically safe, commissioned, or production-ready merely because Store Zero can evaluate it.

## Reference cycle-time rule

For Store reference modeling only, a material line that requires `MILL_EDGE_BOUNDED` uses the declared feed for its material family.

```text
edge_milling_minutes
  = pass_count
  × finished_length_in
  × quantity
  / species_feed_ipm
```

Current reference families:

- Select Pine → SOFT WOOD → 243 in/min;
- Select Poplar → HARD WOOD → 216 in/min;
- Select Red Oak → HARD WOOD → 216 in/min;
- Select Cherry → HARD WOOD → 216 in/min.

This classification is intentionally coarse. Store Zero does not invent finer species-by-species production speeds until measured evidence exists.

## Store evaluation rule

For a project-required finished board width:

1. if an exact offered actual width exists, no edge milling is required;
2. otherwise choose a suitable wider parent in the same admitted material family;
3. calculate edge removal;
4. if edge removal exceeds 1.0 in, refuse the bounded operation;
5. if parent width exceeds 12 in, refuse the bounded operation;
6. do not reject or mark the machining operation unresolved solely because the parent length requires additional ordinary infeed/outfeed/material support;
7. otherwise `MILL_EDGE_BOUNDED` may be evaluated over the full offered parent length.

The Store must not rewrite the requested finished width to match an offered parent width.

## Authority

`SUPPORTABLE · REFERENCE` means only that the request fits this declared Store Zero reference rule.

It does not mean:

- material reserved;
- commercial order accepted;
- production released;
- machine ready;
- physical workpiece reference established;
- interlocks satisfied;
- Cycle Start permitted;
- part fabricated;
- part inspected.

**NO BLOOD ON WOOD.**
