# S-001 Mode-2 arched aperture envelope V0

**Status:** first published curvilinear Store Zero study envelope  
**Capability id:** `SHEET_MODE2_ARCHED_APERTURE_V0`  
**Envelope id:** `S001-MODE2-ARCHED-APERTURE-V0`  
**Parent offering:** `SHEET_MODE2_STENCIL_V1`  
**Evidence class:** REFERENCE  
**Physical status:** NOT CLAIMED

This is not the entire Mode-2 disclosure. It is the first live Store family where CURVILINEAR is a reconstructable circular segment.

## Canonical parent and working field

The canonical project uses the full `48 × 96 in` sheet with the long axis treated as machine horizontal and the short axis as machine vertical.

The published arched family is deliberately narrower than the parent sheet:

- centered working field id: `S001-CENTER-WORK-FIELD-V0`;
- horizontal working span: `48 in` centered within the 96 in parent axis;
- vertical working span: `36 in` centered within the 48 in parent axis;
- whole routed profile must remain inside that field;
- work outside that centered field is refused rather than treated as an edge-routing capability.

On the canonical 48 × 96 sheet, that reserves:

- `24 in` of parent sheet on each horizontal end outside the working field;
- `6 in` of parent sheet at top and bottom outside the working field.

This is an intentional bounded reference envelope, not a claim that the underlying machine concept can never reach other locations.

## Geometry consumed

Canonical pair: chord + rise. Radius is derived as

`R = chord² / (8 × rise) + rise / 2`

Canonical project geometry:

- outer `STRAIGHT_RECT` 48 in × 96 in sheet;
- centered working field 48 in horizontal × 36 in vertical;
- interior `ARCHED_RECT` width 36 in, straight height 24 in;
- circular segment chord 36 in, rise 12 in, derived radius 19.5 in;
- total opening height 36 in;
- opening lies entirely inside the centered working field.

Within the working field the canonical opening leaves 6 in on each horizontal side and reaches the vertical field boundary. Relative to the full sheet it remains 30 in from each long-axis sheet end and 6 in from the top/bottom sheet edges.

A supplied radius that contradicts chord + rise is refused.

## Process

`MODE2_STENCIL_ROUTE` with `STENCIL_TABS`. Selected perimeter regions remain attached. Secondary separation is operator or later.

Tab planning is owned by [`STENCIL-TAB-POLICY-0.1.md`](STENCIL-TAB-POLICY-0.1.md) / `S001-STENCIL-TAB-POLICY-V0`.

For the canonical reference aperture:

- routed perimeter ≈ `129.864203 in`;
- current reference base count = `4`;
- conservative planning reserve = `+1`;
- current Store plan when four are requested = `5` candidate tab centers;
- placement method = `DISTRIBUTED_ARCLENGTH_TRANSITION_AVOIDANCE`.

The extra tab is a planning reserve, not a validated safety factor. Bridge width, maximum proven gap, retained thickness, and physical holding performance remain `NOT_MEASURED` and are not invented here.

## Stock

First study SKU: `STB-ZERO-PLY-050-48X96-001`  
1/2 in × 48 × 96 4-ply sheathing. OBS-017 list reference $25.29 + 5% fixture mark-on = $26.55 budgetary material price.

Do not interpret 4-ply sheathing as exterior-rated plywood. If exterior rating is requested: UNRESOLVED.

## Refuse / unresolved

Refuse includes: dimensional stock, missing required ops, parent too small to contain the centered working field, profile outside the centered 48 × 36 working field, aperture outside the outer panel, contradictory curve, machine-local language, and depth above envelope.  
Unresolved includes: missing curve numbers, missing units at the wire, missing requested tab count, and unsupported exterior rating.

A complete REFERENCE tab plan is not physical workholding evidence and does not authorize machine operation.
