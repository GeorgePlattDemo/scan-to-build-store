# S-001 Mode-2 arched aperture envelope V0

**Status:** first published curvilinear Store Zero study envelope  
**Capability id:** `SHEET_MODE2_ARCHED_APERTURE_V0`  
**Envelope id:** `S001-MODE2-ARCHED-APERTURE-V0`  
**Parent offering:** `SHEET_MODE2_STENCIL_V1`  
**Evidence class:** REFERENCE  
**Physical status:** NOT CLAIMED

This is not the entire Mode-2 disclosure. It is the first live Store family where CURVILINEAR is a reconstructable circular segment.

## Geometry consumed

Canonical pair: chord + rise. Radius is derived as

`R = chord² / (8 × rise) + rise / 2`

Reference study geometry:

- outer `STRAIGHT_RECT` 48 in × 72 in
- interior `ARCHED_RECT` width 36 in, straight height 36 in
- circular segment chord 36 in, rise 12 in, derived radius 19.5 in

A supplied radius that contradicts chord + rise is refused.

## Process

`MODE2_STENCIL_ROUTE` with `STENCIL_TABS`. Selected perimeter regions remain attached. Secondary separation is operator or later.

Tab planning is now owned by [`STENCIL-TAB-POLICY-0.1.md`](STENCIL-TAB-POLICY-0.1.md) / `S001-STENCIL-TAB-POLICY-V0`.

For the current reference aperture:

- routed perimeter ≈ `153.864203 in`
- current reference base count = `4`
- conservative planning reserve = `+1`
- current Store plan when four are requested = `5` candidate tab centers
- placement method = `DISTRIBUTED_ARCLENGTH_TRANSITION_AVOIDANCE`

The extra tab is a planning reserve, not a validated safety factor. Bridge width, maximum proven gap, retained thickness, and physical holding performance remain `NOT_MEASURED` and are not invented here.

## Stock

First study SKU: `STB-ZERO-PLY-050-48X96-001`  
1/2 in × 48 × 96 4-ply sheathing. OBS-017 list reference $25.29 + 5% fixture mark-on = $26.55 budgetary material price.

Do not interpret 4-ply sheathing as exterior-rated plywood. If exterior rating is requested: UNRESOLVED.

## Refuse / unresolved

Refuse: dimensional stock, missing required ops, aperture outside outer panel, contradictory curve, machine-local language, depth above envelope.  
Unresolved: missing curve numbers, missing units at the wire, missing requested tab count, unsupported exterior rating.

A complete REFERENCE tab plan is not physical workholding evidence and does not authorize machine operation.
