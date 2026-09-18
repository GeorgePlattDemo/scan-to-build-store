# STB Store Zero — Window Seat Recovery Reference 0.1

Status: **DECLARED REFERENCE / UNMEASURED**

Identity: `STB-STORE-ZERO-WINDOW-SEAT-RECOVERY-0.1`

Applies only to the bounded project class:

`space_utilization.window_seat`

This reference economics model replaces the older `$35 setup + $100/hour` D-001 recovery formula **for the Window Seat demonstration only**. It does not silently change the economics of other Store Zero demonstrations.

It is a deterministic reference model, not a dealer quote, commissioned-cell rate, measured production standard, or seller-of-record commercial policy.

## 1. Purpose

The Window Seat should show why its reference selling basis changes.

The model separates:

1. mapped material;
2. fabrication / fulfillment recovery;
3. optional hardware;
4. unavailable or unresolved Store demand.

The recovery model must expose the operating basis rather than burying it inside an arbitrary machine-hour charge.

## 2. Reference machining relationship

Capability basis: `D001-BOARD-EDGE-MILL-REF-0.3`.

For longitudinal edge milling:

```text
feed_rate_ipm = chip_load_in_per_tooth × cutting_edges × spindle_rpm
```

Reference cutter / spindle inputs:

| Input | Pine | Poplar / Red Oak / Cherry | Basis |
|---|---:|---:|---|
| Cutter diameter | 0.375 in | 0.375 in | DECLARED REFERENCE |
| Cutting edges | 2 | 2 | DECLARED REFERENCE |
| Spindle speed | 18,000 RPM | 18,000 RPM | DECLARED REFERENCE |
| Chip-load class | SOFT WOOD | HARD WOOD | DECLARED REFERENCE |
| Adjusted chip load | 0.00675 IPT | 0.00600 IPT | DECLARED REFERENCE / UNMEASURED |
| Derived feed | 243 IPM | 216 IPM | CALCULATED |

The relationship follows the standard LMT Onsrud feed-rate equation. The chip-load values are conservative declared reference inputs after the 2×D depth adjustment used for this study. They are not commissioned machine settings and must be replaced by measured/accepted cell data before production use.

## 3. Cycle model

For each mapped material line requiring `MILL_EDGE_BOUNDED`:

```text
edge_milling_minutes
  = passes × finished_length_in × quantity / species_feed_ipm
```

For the default Window Seat definition:

```text
total longitudinal milling travel = 2,165.00 in

Pine:
  2,165.00 / 243 = 8.91 min edge milling

Poplar / Red Oak / Cherry:
  2,165.00 / 216 = 10.02 min edge milling
```

The recovery calculation uses unrounded modeled time internally. Displayed minutes are rounded for readability.

The current non-milling modeled time remains:

```text
8.00 min job preparation
+ parent_count × (
    0.60 min load / seat
  + 0.40 min release / label
  + 2 × 0.2548 min crosscut allowance
)
```

At the default 26 mapped parents:

```text
other modeled time = 47.25 min

Pine modeled cycle     = 47.25 + 8.91  = 56.16 min
Hardwood modeled cycle = 47.25 + 10.02 = 57.27 min
```

These times are `CALCULATED / MODELED`, not measured production time.

## 4. Recovery model

Default Pine fabrication / fulfillment recovery is deliberately anchored at **$425.00** and exposed as five components:

| Component | Pine baseline | Status |
|---|---:|---|
| Cell consumption / wear reserve | $60.00 | DECLARED REFERENCE / UNMEASURED |
| Material handling / fabrication | $110.00 | DECLARED REFERENCE / UNMEASURED |
| Inspect / label / bundle / stage | $75.00 | DECLARED REFERENCE / UNMEASURED |
| Facility / admin / rework reserve | $70.00 | DECLARED REFERENCE / UNMEASURED |
| Service / commercial reserve | $110.00 | DECLARED REFERENCE / UNMEASURED |
| **Pine baseline recovery** | **$425.00** | CALCULATED |

The four non-cell components sum to:

```text
fixed_reference_fulfillment = $365.00
```

The cell-consumption component responds to modeled cycle time and a declared species wear factor:

```text
cell_consumption
  = $60.00
  × (modeled_cycle_minutes / 56.159065)
  × species_wear_factor

fabrication_fulfillment_recovery
  = $365.00 + cell_consumption
```

Reference species wear factors:

| Species | Factor | Status |
|---|---:|---|
| Select Pine | 1.00 | DECLARED REFERENCE / UNMEASURED |
| Select Poplar | 1.05 | DECLARED REFERENCE / UNMEASURED |
| Select Cherry | 1.10 | DECLARED REFERENCE / UNMEASURED |
| Select Red Oak | 1.15 | DECLARED REFERENCE / UNMEASURED |

These factors are intentionally modest. They make species consequences visible without pretending the Store has measured cutter-life data by species.

Future evidence should replace these declared factors with measured cutter distance, blade cycles, spindle-on time, roller/drive use, energy and maintenance records.

## 5. Reference selling basis

```text
reference_selling_basis
  = mapped_material
  + fabrication_fulfillment_recovery
  + selected_hardware
```

There is no separate $35 setup charge and no $100/hour machine-rate term in this Window Seat model.

Default illustrative results:

| Species | Material | Modeled cycle | Recovery | Reference selling basis |
|---|---:|---:|---:|---:|
| Select Pine | $698.66 | 56.16 min | $425.00 | $1,123.66 |
| Select Poplar | $990.54 | 57.27 min | $429.25 | $1,419.79 |
| Select Red Oak | $1,129.94 | 57.27 min | $435.37 | $1,565.31 |
| Select Cherry | not mapped at required width | 57.27 min if mapped | $432.31 if mapped | NOT CALCULABLE FROM CURRENT OFFERING |

The material values above are fixture-dependent examples for the current default Window Seat definition and catalog state. They are not universal project constants.

## 6. Store-gap behavior

If a selected species has no offered parent capable of satisfying a required finished width:

- keep the customer material requirement;
- return the exact missing Store condition;
- do not synthesize a SKU;
- do not substitute another species;
- do not produce a complete reference selling basis.

For the current default Cherry definition:

```text
required finished board-run width = 7.00 in
widest offered Cherry parent      = 5.50 in

disposition = NOT OFFERED AT REQUIRED WIDTH
```

That is demand intelligence, not a project-definition failure.

## 7. Authority / evidence boundary

This model is for reference economics and evaluation only.

It does not establish:

- measured cycle time;
- commissioned cutter feed;
- measured cutter life;
- installed cell cost;
- actual maintenance cost;
- dealer labor burden;
- commercial margin policy;
- seller-of-record authority;
- production release;
- machine readiness;
- Cycle Start.

Promotion path for the provisional inputs remains:

```text
DECLARED REFERENCE
→ MODELED
→ BENCH-OBSERVED
→ MEASURED
→ COMMISSIONED
```

**NO BLOOD ON WOOD.**
