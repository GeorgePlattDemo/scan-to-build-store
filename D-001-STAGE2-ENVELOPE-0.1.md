# D-001 Stage-2 MachineEnvelope — 0.1

Declared reference capability for Stage 2. Commissioning facts remain unresolved. Not Cycle Start. Not generic 2-axis CNC. Not a physical validation record.

Stage 1 / CUT-001 remains in force:

- one parent stick
- origin / cleanup crosscut
- finished kept length
- optional drill
- label
- no upstroke saw
- no compound miter
- no remote Cycle Start
- no network safety loop

Stage 2 adds two bounded milling families. Project classes request **features**. Store resolves **neutral operations** against this envelope. The cell owns station geometry and later lowering. The project class does not name router coordinates.

```
part requirement
    → neutral operation
        → Store capability resolution
            → cell-specific lowering
```

---

## Supported Stage-2 operations

| Neutral operation | Declared subset | Explicitly unsupported / unresolved |
|---|---|---|
| `CROSSCUT` | square cleanup + kept-length cut | compound miter; upstroke |
| `MITER_LIMITED` | single-plane limited miter if already in the cell family | compound / compound-swivel as universal |
| `DRILL` | bounded holes referenced to the part | arbitrary hole maps beyond envelope |
| `DADO` / `GROOVE` / `RABBET` | only where the offering lists them | not implied by mill existence |
| `MILL_LONGITUDINAL_PROFILE` | straight longitudinal taper; bounded groove/dado along length | any-path 2-axis routing; 3-D carving; dovetail |
| `MILL_END_PROFILE` | end taper / foot taper; bounded end notch; bounded end chamfer | features beyond 8 in from the worked end |

Refuse when the offering does not list the op, when stock exceeds the fixture envelope, or when `POSITION_VALID` would be required and is false. Stage 2 does not simulate `POSITION_VALID` as a live machine state.

---

## MILL_LONGITUDINAL_PROFILE

**Role.** Bounded profile along dimensional stock while the stick remains in the fence / table / origin chain.

**Reference arrangement (assumption, not commissioned):** a below-workpiece mill near the central working region.

**Fixture envelope (SYNTHETIC / DECLARED_STAGE2_CAPABILITY)**

| Limit | Fixture value |
|---|---|
| Max profile length | 60 in cell span |
| Max depth per pass | 0.375 in |
| Max width of cut | 1.00 in |
| Stock thickness | 0.75–1.50 in |
| Stock width | 1.50–7.25 in |
| Modeled cutting feed | 48 in/min |

Do not treat these as measured feeds, forces, or guard performance.

**Modeled cycle add**

`T_mill_long = T_deploy + L_profile / v_mill + (passes-1)*T_repass + T_retract`

Defaults: deploy 0.10 min, v = 48 in/min, repass 0.08 min, retract 0.10 min.

---

## MILL_END_PROFILE

**Role.** Bounded end feature where square cut or limited miter is not enough.

**Reference arrangement (assumption, not commissioned):** an end mill outside the main manipulating-roller interference zone.

**Fixture envelope (SYNTHETIC / DECLARED_STAGE2_CAPABILITY)**

| Limit | Fixture value |
|---|---|
| Reach from worked end | 8 in |
| Max depth | 0.50 in |
| Stock thickness | 0.75–1.50 in |

**Modeled cycle add:** 0.35 min per declared end feature.

---

## Picnic Table leg — smallest Stage-2 economic proof

Not a Picnic Table project class. One fixture member:

- parent: `STB-ZERO-SPF-2X4-96-001`
- kept length: 28 in
- feature: longitudinal taper → `MILL_LONGITUDINAL_PROFILE`
- optional: one end profile → `MILL_END_PROFILE`

Compare square-cut-only cycle and Q against the same stick with the mill feature. Q must change because modeled mill time was added. That is the proof. Do not add Alcove features because a mill exists.

---

## Stage-3 items not designed here

Physical support, restraint, workholding, guarding, access control, safety-rated controls, interlocks, safe stopping and restart, commissioning, validation, measured feeds, PL/SIL, actuator and sensor selection.
