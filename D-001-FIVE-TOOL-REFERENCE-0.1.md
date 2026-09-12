# D-001 Five-Tool Reference 0.1

**Status:** REFERENCE Store capability candidate  
**Capability:** `D001_FEATURED_BOARD_V0`  
**Parent:** `D001-STAGE2-ENVELOPE-0.2`  
**Evidence:** REFERENCE  
**Physical status:** NOT CLAIMED

This page gives the dimensional Store a finite machine wall without turning D-001 into a universal CNC.

## Machine wall

D-001 is modeled with two fixed saw functions plus five operator-configured machining tools. A tool change is a setup/changeover event. Jobs may use only the declared homed configuration.

| Position | Reference role | Store meaning |
| --- | --- | --- |
| SAW-L / SAW-R | fixed saw functions | square end now; bounded miter remains unresolved until a numeric angle range is published |
| T1 | center horizontal router | edge/notch family retained as demand; physical/numeric envelope not yet published |
| T2 | transverse router from below | first live added family: full-width dado / transverse groove within inherited Stage-2 mill limits |
| T3 | end router | routed-end family retained as demand; envelope not yet published |
| T4 | vertical pilot drill | fixed 3/16 in face pilot; location is part-relative; starter depth is machine-configured and not user-selectable |
| T5 | horizontal pilot drill | fixed 3/16 in edge pilot; location is part-relative; starter depth is machine-configured and not user-selectable |

## Packaging assumption

The two center routers are provisionally staggered around the base centerline:

- T1 horizontal router: `-3.0 in`;
- T2 transverse router: `+3.0 in`.

Those values are `REFERENCE_PACKAGING_ASSUMPTION`, not final iron. Component bodies, rails, guarding, dust collection, travel, service access and roller interference must determine the final geometry.

Store never exposes those offsets as user design inputs.

## First added supported feature

`DADO` / `TRANSVERSE_GROOVE` uses the already-published Stage-2 mill numbers as a conservative V0 reference:

- board remains within the parent D-001 stock envelope;
- full-width transverse extent only;
- maximum feature width `1.0 in`;
- maximum V0 feature depth `0.375 in`;
- parent board width remains at or below the published `12 in` stock limit;
- parent board thickness remains at or below the published `1.5 in` mill limit.

The application supplies part-relative `x`, width and depth. Store does not emit station coordinates, feeds or controller code.

## Fixed pilot feature

Pilot diameter is exactly `3/16 in` (`0.1875 in`). The user does not choose a diameter.

- face pilot: part-relative X + offset from fence;
- edge pilot: part-relative X + optional height from table;
- physical starter depth is a machine-configuration value and is not yet published as a measured/commissioned result.

A request for another diameter is refused rather than silently widening the machine.

## Recognized but unresolved demand

These are deliberately represented so refusals/unresolved demand become data without becoming capability:

- `ANGLED_END_SINGLE_PLANE` — numeric miter range not yet published;
- `EDGE_NOTCH` — T1 travel/depth envelope not yet published;
- `ROUTED_END` — T3 end-router envelope not yet published.

The returned `capabilityGaps` record names the exact feature and reason.

## Neutral operations

Store may return part-relative neutral operations such as:

```text
LOAD
SEAT_REGISTER
INDEX_FINISHED_LENGTH
MILL_TRANSVERSE_DADO
PILOT_BORE
END_ANGLE
EDGE_NOTCH
ROUTED_END
LABEL
```

They are requirements, not controller programs.

No G-code, controller fields, tool numbers, station coordinates, feed rates, spindle RPM or Cycle Start are accepted as feature language.

## Economics

New five-tool process time is unresolved. The candidate estimator returns budgetary material only where price exists. It does not reuse the square-cut cycle model as if routing/drilling time were measured.

## Capability-gap data

A non-supportable feature is useful demand evidence. Preserve:

- feature family;
- requested part-relative dimensions;
- current Store/machine configuration identity;
- exact refusal/unresolved reason;
- recurrence and alternate fulfillment later, where known.

Repeated demand may justify engineering a wider envelope. It does not widen the current envelope automatically.

## Safety / authority

**NO BLOOD ON WOOD.**

This Store object does not establish installed hardware, machine readiness, tolerance, guarding adequacy, commissioning or fabrication authority. Local tool zero, `POSITION_VALID`, lowering, I/O and Cycle Start remain machine-site responsibilities.
