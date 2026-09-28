# S-001 Stage-2 envelope — 0.1

Declared reference capability. **Not commissioned. Not Cycle Start. Not generic CNC.**

Every numeric limit is a Stage-2 fixture assumption. Purpose: `fit → operation → modeled minutes → Q` for sheet jobs. These numbers do not pre-commit the physical sheet machine.

Machine-readable copy: [`s001-stage2-envelope.mjs`](s001-stage2-envelope.mjs) (`S001_STAGE2_ENVELOPE`). Evaluator: [`sheet-package-evaluator.mjs`](sheet-package-evaluator.mjs) (`SHEET_PACKAGE_V1`, standard `STB-SHEET-PACKAGE-0.1`). Tab planning: [`STENCIL-TAB-POLICY-0.1.md`](STENCIL-TAB-POLICY-0.1.md).

Sheets never fall through D-001. D-001 refuses a sheet (`SHEET_NOT_D001`); S-001 refuses anything that is not a full sheet.

---

## Two stations

**S001-ROUTER — the Mode-2 sheet cell.** The relationship is the one the issued specification discloses, stated as a reference, not as commissioned hardware:

- the vertical tooling assembly stays at the machine centerline in X;
- the tooling platform moves in Y;
- the sheet itself moves along X under servo-driven manipulating rollers / rotating yokes;
- a router is the cutting tool, with bounded depth in Z;
- coordinated sheet-X and tool-Y make straight and curvilinear two-dimensional profiles;
- routed pieces stay attached by tabs; the owner separates them later.

**YARD-PANEL-SAW — the yard's vertical panel saw.** A yard operator crosscuts to a measured line. `CROSSCUT` and `RIP` were already declared on every Store Zero sheet offering; this envelope times and prices the crosscut. It runs **after** routing, so the sheet stays whole and referenced while it is routed.

## Declared limits

```
Parent sheet          48 × 96 in, 1/4 to 3/4 in thick
                      long axis = machine X, short axis = machine Y
Working field         centered 48 in (X) × 36 in (Y); the whole routed profile stays inside
                      (24 in of sheet outside each end, 6 in top and bottom). No edge routing.
Router                1/4 in tool, path centered on the defined line
                      one pass per 1/2 in of thickness, 60 in/min
                      10 s plunge/retract per path, 2 s per tab per pass
                      120 s load / seat / center reference, 60 s release / unload
                      smallest routed feature 6 in; smallest split piece 3 in wide
Panel saw             1/8 in kerf, 45 s set and align per cut, 150 in/min
                      smallest piece 6 in; cut line at least 1 in clear of anything routed
Label                 10 s per returned piece
Machine-hour basis    the one declared Store Zero rate (STB-D001-STORE-ECONOMICS-S2-0.1)
```

S-001 has no separate measured economics. It uses the same declared Stage-2 machine-hour rate as D-001.

## Features it answers

| Kind | What the definition states | Operation |
| --- | --- | --- |
| `ARCHED_APERTURE` | centered placement; width, straight-side height, arch rise; tabs and a requested tab count | `ROUTE_PROFILE` on S001-ROUTER |
| `STRAIGHT_SPLIT` | the aperture it sits in; the vertical centerline | `ROUTE_PROFILE` on S001-ROUTER |
| `CROSSCUT` | `LEFT` or `RIGHT` end; distance from that end | `CROSSCUT` on YARD-PANEL-SAW |

The arch is a circular segment: chord = opening width, rise = arch rise, radius derived as `chord² / (8 × rise) + rise / 2`. A rise over half the width is refused.

A split turns the retained center into two pieces. Each piece keeps at least two tabs; tabs on the split line count for neither piece, and missing tabs are added.

Every piece goes back to the owner: the end panels, the frame, and the retained center pieces on their tabs.

## Refused, unresolved, unavailable

**Refused** (with a named reason): sheet not 48 × 96; thickness outside 1/4–3/4 in; no matching sheet offered for every needed operation; opening outside the working field; arch rise over half the width; routed feature under 6 in; split piece under 3 in; split with no host opening; crosscut off the sheet, through or within 1 in of an opening, or leaving a piece under 6 in; feature kind not declared; machine-local language (spline, toolpath, G-code, controller, servo steps).

**Unresolved:** missing sizes, missing tab count, missing configuration identity, exterior rating requested on a sheet not sold as exterior.

**Unavailable:** the matching sheet is not on hand.

A refused, unresolved or unavailable job carries no Q.

## The canonical job

One `STB-ZERO-PLY-050-48X96-001` sheet (1/2 in sheathing). A 36 in wide opening, 24 in straight sides, 12 in rise (radius 19.5 in), four requested tabs; the center split down its vertical centerline; crosscuts 18 in from each end. The Store answers `SUPPORTABLE`: five planned tabs (two per center piece, one on the split line), router then panel saw, five pieces returned, material $26.55 plus modeled machine service. The exact figures are the Store's answer, recomputed on every request.

## Not claimed

Physical workholding or measured tab retention. A commissioned sheet cell. Measured feeds or cycle time. Cycle Start. An exterior rating the sheet is not sold with. A commercial quote.

Physical engineering for the sheet machine is candidate research in the 3D Solutions Program (`research/machine-development/staging/SHEET-MACHINE-STAGING-0.1.md`). Nothing in that research is Store capability until it is declared here, in code, with tests.

**NO BLOOD ON WOOD.**
