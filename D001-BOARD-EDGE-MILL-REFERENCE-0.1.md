# D-001 Full-Length Edge-Milling Reference 0.1

**Identity:** `D001-BOARD-EDGE-MILL-REF-0.1`  
**Status:** REFERENCE / MODELED Store capability declaration; not commissioned physical capability  
**Owner:** Store Zero capability surface  
**Safety invariant:** **NO BLOOD ON WOOD**

## Purpose

This declaration removes the separate 60 in longitudinal-profile length cap from the specific Store Zero operation:

`MILL_EDGE_BOUNDED` — **Mill edge to finished width**

The operation may extend over the **full length of any parent board admitted by the active Store material-handling/support envelope**.

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

`maximum cutting length = parent length admitted by the active stock-handling/support condition`

The current Store Zero reference still declares:

- maximum parent length without external support: **96 in**.

Therefore a 94 in board may be evaluated for full-length edge milling without failing a separate 60 in operation cap.

Parent lengths above 96 in require an explicitly declared support/handling condition before the Store may call that path supportable. This declaration does not invent such support.

## Width / pass limits retained

This change removes only the independent length cap.

The existing reference limits remain:

- maximum stock width: **12 in**;
- maximum total edge removal: **1.0 in**;
- mill depth per pass: **0.375 in**;
- reference cutting feed: **48 in/min**.

Where required edge removal is less than or equal to 0.375 in, the modeled operation may be one continuous full-length cutting pass.

Where a greater admitted removal is required, pass count remains governed by the existing 0.375 in depth-per-pass reference. Removing the 60 in cap does not remove the width/depth bounds.

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

The reference operation assumes the eventual physical design provides a verified means to preserve the workpiece reference through the longitudinal cut, such as an appropriate combination of:

- fence/support contact;
- multiple clamping/manipulating rollers or equivalent workholding;
- reference retention sensing;
- local stopping/interlocks;
- operator boundary controls.

This file does **not** select final roller count, clamp force, cutter, spindle, sensing method, guarding, safety category, or acceptance tolerance.

Those are engineering and commissioning matters.

The reference model must not describe this operation as physically safe, commissioned, or production-ready merely because Store Zero can evaluate it.

## Store evaluation rule

For a project-required finished board width:

1. if an exact offered actual width exists, no edge milling is required;
2. otherwise choose a suitable wider parent in the same admitted material family;
3. calculate edge removal;
4. if edge removal exceeds 1.0 in, refuse the bounded operation;
5. if parent width exceeds 12 in, refuse the bounded operation;
6. if parent length is not admitted by the active handling/support condition, return the appropriate unresolved/refused handling result;
7. otherwise `MILL_EDGE_BOUNDED` may be evaluated over the full admitted parent length.

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
