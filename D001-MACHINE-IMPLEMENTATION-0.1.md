# D-001 machine implementation and capability alignment — 0.1

## Status and controlling sources

This is the Store-owned implementation register for the Stage-2 dimensional reference cell. It is executable metadata attached to `D001_STAGE2_ENVELOPE`, consumed by the existing travel model and included in the Store authority hashes. It is not a second Store evaluator or a machine controller.

Baseline: Store `1f9f1a217d91686ef21848508b20e605e7cc6bc1`.
Recovered five-tool source: `3e1f9f2c18668de86d92c6ccae7e79d3cadd35a1`, `D-001-FIVE-TOOL-REFERENCE-0.1.md` and `d001-five-tool.mjs` on `build/d001-five-tool-0.1`.
Recovered depth specification: `7303793620d0ceda509810a661d11e6c31c7d59f`, `d001-stage2-envelope.mjs` on `repair/fixed-spot-depth-0.1`.
Control research: System `ca1f6a5769440b0a6b6f66104a4b5d183e67c2f3` main at this review, `source-library/atlas-research/STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md`, `STB-ATLAS-06-IRON-0.1.md`, and `source-library/machine-cell/STB-CELL-0.1.md`.

Current owner direction establishes two manipulating rotors, two saws, three routers and two spotting stations as the proposed arrangement. The earlier five-tool branch establishes their roles. Neither source resolves every travel, cutter, clearance, timing or physical packaging question. Historical three-roller patent correspondence does not require adding a third roller to this Stage-2 proposal.

## Station inventory and existing executable functions

| Slot | Recovered role | Present implementation and remaining decision |
| --- | --- | --- |
| T1 | Center horizontal router; vertical positioning and in/out plunge | Edge/notch function identified. Numeric travel, cutting depth, cutter and occupied-cell sequence remain required. |
| T2 | Transverse router from below; across-stock travel and controlled depth | Earlier candidate described full-width dado/transverse groove, width ≤1 in and depth ≤0.375 in, within existing 12-in stock-width/1.5-in mill-thickness limits. These are candidate bounds, not an adopted complete travel or pricing path. |
| T3 | End router | `MILL_END` already has an 8-in reach and 0.5-in maximum depth. Equivalence between that function and T3's `ROUTED_END` language, cutter and full sequence remains to be declared. |
| T4 | Vertical face spot | Existing `SPOT-FACE-REF` is a modeled centered face spot at X=36. It has a legacy timing reference and does not fulfill the new depth-defined requirement. |
| T5 | Horizontal edge spot; height adjustment and plunge from behind the fence | Role recovered. Height range, station position, approach/clearance, tool geometry and modeled occupied time remain unresolved. The discussed approximately 2-in height is not adopted as a numeric maximum. |

`MILL_LONG` remains the existing longitudinal machining function at X=36. It is not silently assigned to T1 or T2: the recovered horizontal and below-stock tools have different orientations and the assignment needs an explicit decision. Existing Alcove longitudinal milling remains executable and priced through the existing evaluator.

The prior candidate staggered T1 and T2 by −3/+3 inches from the base center as a packaging assumption. This register preserves that history here, without changing the active X=36 function or inventing a proven physical layout. Co-located numerical tooling planes do not establish interference-free physical packaging.

The active envelope now owns the existing station X coordinates. The travel model reads those coordinates rather than keeping an independent copy. The 72-in saw spacing remains fixture geometry, not an instruction to shorten every purchased board before useful work.

## Spotting: preserve the distinction instead of hiding it

Two contracts must remain distinguishable while the missing tooling decision is resolved:

- The existing operation is `SPOT_ON_LOCATION/0.1`: a centered face spot with a 0.125-in **timing reference**, not a claimed finished depth. Its historical modeled prices remain tests of that legacy definition only.
- The requested operation is `SPOT_ON_LOCATION/0.2`: fixed 0.1875-in tool diameter and 0.1875-in full-diameter penetration measured from the entry surface along the tool axis. Total tip penetration additionally requires the selected tool's axial point length. Routine customer depth programming is not required.

The Store must own the selected tool geometry. The customer cannot supply a point angle to make a job pass. Until that Store fact exists, the depth-defined operation returns `SPOT_TOOL_POINT_GEOMETRY_REQUIRED` and cannot receive a complete Q from the old plunge time.

The actual Store request path now preserves and checks spot orientation, diameter and depth qualifiers on every part. An edge request cannot silently become a face operation. A different diameter or full-diameter depth is refused; the recognized but incomplete edge implementation is unresolved. Explicit transverse coordinates cannot be silently replaced with a center location.

**This change does not complete the requested fixed-depth spotting implementation or migrate existing app definitions to it.** The old unqualified job is retained as an identified legacy regression. Completion requires selecting the Store tool geometry, calculating the new travel/time, propagating the depth-defined contract through the real consumer, and verifying both face and edge behavior. Do not report the old job's Q as evidence of that completion.

## Positional sensing as a coordinating part of the cell

`positionCoordination` is a proposed implementation requirement, not installed sensing. Its role is to compare commanded movement with evidence about the wood and reference chain.

- Independent stock travel: evaluate a measuring-wheel encoder or noncontact surface-motion measurement. Motor encoder position alone does not prove stock position.
- Datum C: define the establishment and verification method; reference cut, mechanical reference and sensed face remain distinct methods.
- Seating/restraint: identify observations relevant to the actual workholding. Pressure alone does not establish that the board is correctly seated.
- Disagreement or lost reference: invalidate position and require a declared re-establishment procedure before geometry-dependent work can continue.
- Correction during cutting: not authorized by this reference model.

Sensor selection, allowable error, sampling behavior, calibration, contamination handling and fault response remain explicit open decisions. No synthetic sensor truth is added to the live Store request. The initial experiment should record independent observations and compare them with commanded movement and independent inspection of the resulting part.

Sensing is not presumed cheaper than mechanical precision. Compare the complete burden of integration, cleaning, calibration, maintenance and failed work. Sensing does not replace stiffness, restraint or a validated safety system.

## Coherent candidate control stack

The existing research identifies LinuxCNC with its RS274/NGC interpreter and HAL as an introductory local-control candidate, with Mesa-class motion/I/O hardware and suitably selected servo drives. This is a candidate stack, not an installed bill of materials. Axis count, I/O, drive interfaces, spindle control and sensor connections must be inventoried before a specific interface card is selected.

Responsibilities remain:

1. Project/app: identified part-relative definition and requested features.
2. Store: material resolution, capability/refusal, modeled operation travel/time and economics.
3. Machine site: registered translation/postprocessor, local references, tool configuration and permitted sequence.
4. Local controller: coordinated permitted motion and ordinary process observations.
5. Local operator and separately validated machine safety: physical start and permission to operate.

The Store emits no G-code, remote Cycle Start or physical authorization. Proposed sensors neither expand the capability envelope nor establish a safety rating.

## Completion decisions

The remaining owner/engineering decisions are specific:

1. Assign the existing longitudinal function to the intended physical router, or declare how the separate function is implemented. Confirm whether T3 is the existing bounded end-mill function.
2. Define the T1 and T2 tool/cutter, permissible work surfaces, numeric travel/depth and occupied sequence. Adopt or replace the earlier candidate dado limits deliberately.
3. Define T5 height range, entry side, station reference, clearance and fixed-depth tooling. Specify the selected face/edge spot tool or its governed point geometry.
4. Calculate new timing from those definitions through the current travel/economics model. No arbitrary setup charge, replacement hourly rate or copied historical cycle.
5. Extend actual project demand mapping only as needed, including physical component identity for Alcove spot locations; test real Store requests and confirmation reconciliation.
6. Promote an exact tested Store revision and update pinned runtime consumers explicitly. A branch commit is not public application adoption.

## Verification and continuation

Run `node --test *.test.mjs`. The additional tests exercise the actual exported Store evaluator, including defects on the second part so that inspecting only the first spot cannot satisfy acceptance. Preserve the existing Alcove, catalog-length selection, retained remainder, miter and economics regressions.

Before promoting new capability, add positive jobs supported by the adopted definition, missing-fact cases and requests just outside each adopted limit. Demonstrate that the targeted negative tests fail on the previous implementation. A test that only reads this register is not proof that the Store enforces it.
