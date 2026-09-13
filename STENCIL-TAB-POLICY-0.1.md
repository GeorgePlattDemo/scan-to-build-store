# S-001 Stencil Tab Policy V0

**Status:** REFERENCE planning policy  
**Policy id:** `S001-STENCIL-TAB-POLICY-V0`  
**Evidence class:** REFERENCE  
**Physical retention status:** NOT MEASURED

This policy gives Store Zero a deterministic answer to two different questions:

1. how many retained stencil attachment points should the current REFERENCE plan carry; and
2. where can candidate attachment points be placed around the bounded arched-aperture contour without pretending that unmeasured holding strength is known.

It is not a safety standard, a cutting-force model, or a proof that a physical sheet will remain restrained under an energized router.

## Commercial-practice basis

Commercial CAM software treats tabs as a normal retained-workpiece strategy and exposes the same variables this policy keeps separate.

- Autodesk Fusion 2D Contour Tabs reference: tabs can be positioned automatically or manually; automatic placement can be by distance or by number of tabs; width and height are explicit tab properties.  
  https://help.autodesk.com/cloudhelp/ENU/Fusion-CAM/files/MFG-REF-2D-CONTOUR-TABS.htm
- Vectric Toolpath Tabs: automatic placement can use a constant number or constant distance and can attempt to avoid corners and curved regions; manual add/delete/move remains available.  
  https://docs.vectric.com/docs/V12.5/VCarveDesktop/ENU/Help/form/Toolpath%20Tabs/

These are commercial-practice references, not prescriptive woodworking safety standards.

For machine safety context, ISO 19085-1:2021 is the published common-requirements standard for woodworking machinery. It addresses machine risk reduction; it does not supply a universal plywood tab-width or tab-spacing formula. A third edition is under development in 2026.  
https://www.iso.org/standard/77655.html

## V0 count rule

The current arched reference slice already used four requested tabs. V0 preserves that as the **reference base count**, not as an industry minimum.

A one-tab planning reserve is added:

```text
referenceBaseCount = 4
planningReserveTabs = 1
spacingRequiredCount =
    maxAllowedGap_in is known
      ? ceil(perimeter_in / maxAllowedGap_in)
      : 0

policyMinimum = max(referenceBaseCount, spacingRequiredCount)
policyTarget  = policyMinimum + planningReserveTabs
plannedCount  = max(userRequestedCount, policyTarget)
```

Today `maxAllowedGap_in` is deliberately null because no measured Store Zero / S-001 physical test has earned a maximum supported gap. Therefore the current reference case plans **five tabs** when the user requests four.

The extra tab is a conservative planning reserve only. Do not describe it as a validated safety factor.

## Perimeter rule

For the current `ARCHED_RECT` aperture:

```text
P = bottom + two straight sides + circular arc
P = C + 2H + Larc
Larc = 2R × asin(C / (2R))
```

For the reference aperture:

- chord `C = 36 in`
- straight height `H = 36 in`
- rise `12 in`
- radius `R = 19.5 in`
- arc length ≈ `45.864203 in`
- routed perimeter ≈ `153.864203 in`

## Placement rule

V0 uses `DISTRIBUTED_ARCLENGTH_TRANSITION_AVOIDANCE`.

1. Calculate the complete closed-contour perimeter.
2. Calculate the equal nominal arclength spacing for the planned count.
3. Treat the four geometry transitions as hard reference landmarks: bottom-left closure, bottom-right corner, right-side/arch transition, and arch/left-side transition.
4. Choose the equal-spacing phase that maximizes the nearest distance from those landmarks.
5. Emit candidate tab centers as contour arclength plus local `(x,y)` coordinates.
6. Keep the candidates machine-neutral. They are not toolpath points and contain no G-code.
7. A later user-facing step may mark a candidate region `NO TAB`; the planner must then re-solve rather than silently reducing the count.

V0 does not categorically ban an attachment point on the arch. Vectric's corner/curve avoidance is a useful commercial-practice guide, but this bounded aperture contains a long curved segment and a universal curve prohibition has not been justified.

## What green may mean

A future application indicator may turn green only for this narrow statement:

> **REFERENCE TAB PLAN SATISFIED** — the current contour has a complete Store-generated candidate plan under `S001-STENCIL-TAB-POLICY-V0`.

Green must not mean:

- physical holding force validated;
- machine safe to energize;
- production-ready;
- bridge width proven;
- maximum spacing proven;
- retained thickness proven.

Those remain separate machine evidence.

## Physical values not invented by V0

These fields are intentionally present but null until physical testing earns values:

- `maxAllowedGap_in`
- `minBridgeWidth_in`
- `minRemainingThickness_in`
- `cornerKeepout_in`
- `transitionKeepout_in`

A later measured policy can activate the spacing formula without changing the application/Store boundary.

## User role

The user should not have to guess structural tab design.

The intended interaction is:

```text
USER DEFINES GEOMETRY
        ↓
STORE PROPOSES REFERENCE TAB PLAN
        ↓
USER MAY VETO VISIBLE / UNWANTED TAB REGIONS
        ↓
STORE RE-SOLVES
        ↓
REFERENCE TAB PLAN SATISFIED / CANNOT SATISFY
```

The user supplies preference and acceptance of cleanup locations. Store owns the published planning rule. Physical machine evidence later determines whether the rule is strong enough to become a measured retention policy.

**NO BLOOD ON WOOD.**
