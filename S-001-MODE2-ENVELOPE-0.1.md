# S-001 Mode-2 Stage-2 envelope 0.1

**Status:** REFERENCE capability declaration  
**Physical status:** NOT CLAIMED  
**Measured / commissioned:** false  
**Capability id:** `SHEET_MODE2_STENCIL_V1`  
**Envelope id:** `S001-MODE2-STENCIL-V1`

This file declares what Store Zero may evaluate. It is not a commissioned machine, a controller, or a Safety Speed modification procedure.

## Declared relationship

Preserve these distinctions. Do not flatten them into “CNC router.”

- the vertical tooling assembly remains at the machine centerline in X
- the tooling platform moves vertically / in Y
- the sheet itself moves along X
- X movement is provided by servo-controlled manipulating rollers associated with rotating yoke assemblies
- a router provides the cutting tool
- router depth is bounded in Z
- coordinated sheet-X and tool-Y movement permits straight and curvilinear two-dimensional profiles
- selected attachment points can remain so routed components stay in the parent sheet
- those points are later severed in a secondary operation

Mode 3 remains valid patent context and is outside this envelope.

## Stock / geometry consumed

Required for a complete evaluation:

- parent sheet offering (`form: sheet`, cell family `S-001`)
- `profileKind`: `STRAIGHT_RECT` or `CURVILINEAR_OUTLINE`
- finished blank length and width in inches
- integer `tabCount` ≥ 1
- bounded `routeDepthIn`

`CURVILINEAR_OUTLINE` by itself is retained demand, not reconstructable geometry. It remains `UNRESOLVED` under this parent envelope until a bounded child family supplies actual curve geometry. `SHEET_MODE2_ARCHED_APERTURE_V0` is the first such live family: chord + rise are canonical and radius is derived/checked.

Not consumed: room geometry, CAD kernels, splines, G-code, servo steps, controller packets.

## Outcomes

- `SUPPORTABLE` — current definition is inside this REFERENCE envelope
- `REFUSED` — form, ops, size, tabs, depth, or machine-local language fail
- `UNRESOLVED` — a required field is missing, or a generic curvilinear flag lacks reconstructable curve geometry

`SUPPORTABLE` is not an order, reservation, or fabrication authority.

## Neutral operations

```text
LOAD
SEAT
REGISTER
ROUTE_PROFILE
RETAIN_TABS
RELEASE
SECONDARY_SEPARATION
LABEL
```

`SECONDARY_SEPARATION` is not claimed automated.

## Budgetary Q

Material fixture price may be returned as `BUDGETARY_MATERIAL_ONLY`.

Process time and fabrication Q stay `UNRESOLVED`. Never call either a quote.

## Refuse list

- dimensional stock sent to this offering
- offering without `ROUTE_PROFILE` and `RETAIN_TABS`
- unsupported profile kind
- blank below 6 in or larger than the parent sheet
- tab count missing or < 1
- route depth above 0.75 in or above stock thickness
- spline / toolpath / G-code / controller fields
- treating this envelope as commissioned iron
