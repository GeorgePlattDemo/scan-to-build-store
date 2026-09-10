# STB-CUT-001 — End-to-End Production Reference 0.1.1

**Purpose:** one complete Scan-to-Build reference chain from ordinary customer intent to one bounded local machine cycle and Store pickup staging.

**Reference job:** purchase one nominal 2×4×6 ft board through Store Zero, finish it to 60.000 in, label it, and stage it for pickup.

**Status:** implementation/reference contract. This is specific enough to build software and a controller simulation around. It is **not** a machine commissioning release, wiring diagram, certified safety design, or declaration that the reference machine has physically run.

**Invariant:** **NO BLOOD ON WOOD.**

---

# PART A — PLAIN ENGLISH: ONE COMPLETE CHAIN

## A1. Customer intent

The customer asks:

> One 2×4, six feet long as purchased from the Store, cut down to five feet, staged for pickup.

The application records:

- quantity: `1 ea`
- Store SKU: `STB-ZERO-SPF-2X4-72-001`
- nominal merchant size: `2 × 4 × 72 in`
- represented dressed size for this reference Store: `1.500 × 3.500 × 72.000 in`
- required finished kept length: `60.000 in`
- operation: `CROSSCUT_FINISHED_LENGTH`
- miter angle for CUT-001: `0.000 deg`
- fulfillment: `STAGED_PICKUP`

The customer does **not** provide machine coordinates, saw positions, encoder counts, or PLC instructions.

The customer defines the finished result.

## A2. Store SKU and stock identity

Reference Store SKU:

`STB-ZERO-SPF-2X4-72-001`

Reference Store description:

- SPF dimensional lumber
- nominal `2 × 4 × 72 in`
- represented dressed dimensions `1.500 × 3.500 × 72.000 in`
- quantity unit `ea`
- reference fixture class: kiln-dried, No. 2-or-better
- physical suitability still checked at load

This is a Store Zero SKU. It is not a borrowed retailer SKU.

One physical board receives a unique stock identity, for example:

`stock:STB-ZERO-SPF-2X4-72-001:000041`

The Store preserves:

`ON_HAND ≠ ALLOCATED ≠ PICKED ≠ LOADED ≠ CONSUMED ≠ FINISHED ≠ STAGED`

## A3. Governed production bridge

The current governed v0.2.x baseline remains historically intact. CUT-001 defines the first bounded production-reference path that must bind a `ProductionExecutionAuthorization` to the exact:

- packet identity/version
- Store order identity
- finished part requirement
- machine envelope/version
- equipment instance
- material confirmation
- operator/session
- controller policy
- satisfied prerequisites

A changed finished length, packet, envelope, equipment instance, stock item, stale authorization, or blocking unresolved condition requires reevaluation.

**Production authorization is not Cycle Start.**

It allows the exact job to be presented to the local cell. The local controller and safety system still own readiness, interlocks, workpiece position, and local Cycle Start.

## A4. Store reconciliation

Before the Store creates a startable cell job it checks:

1. SKU exists.
2. Suitable stock is represented on hand.
3. One physical stock item is allocated.
4. That exact item is picked.
5. Finished requirement is still `60.000 in`.
6. Required operation is square crosscut only.
7. D-001 CUT-001 capability supports the stock and operation.
8. Production authorization matches the current job, packet, stock, machine envelope, equipment, operator/session and controller policy.
9. Fulfillment is staged pickup.

If those facts do not reconcile, no startable cell job is created.

## A5. Store machine-neutral operation sequence

```text
LOAD_STOCK
ESTABLISH_WORKPIECE_REFERENCE
CROSSCUT_FINISHED_LENGTH 60.000 in ANGLE 0.000 deg
RELEASE
LABEL
STAGE_PICKUP
```

This carries **part truth**.

It does not carry saw X coordinates, servo counts, pressure setpoints, safety I/O, or controller task details.

---

# PART B — REFERENCE D-001 CUT-001 MACHINE

## B1. Fixed geometry

Machine X increases left to right.

```text
Base table length                         72.000 in

Left saw station SAW-L                   X = 12.000 in
Powered roller R1                        X = 24.000 in
Table center                             X = 36.000 in
Powered roller R2                        X = 48.000 in
Right saw station SAW-R                  X = 60.000 in
```

### SAW-R — right reference/trim station

- radial-arm-style controlled crosscut station
- mounted at the right side of the fixed base
- CUT-001 use: square cleanup/reference cut only
- no customer length is established from the rough merchant end
- no saw brand is selected in this reference
- traverse restraint, guarding, blade-force behavior, braking and safe return are commissioning-critical

### SAW-L — left finish/miter station

- controlled **downstroke** saw station
- swivel base supports a future bounded single-plane miter capability
- CUT-001 angle fixed at `0.000 deg`
- **no compound miter**
- no saw brand is selected in this reference

### Fence and support

- fixed fence = lateral working reference
- table/support plane = vertical working reference
- opposite-side idler rollers support low-friction longitudinal travel
- workholding always drives the stock **toward the fence**, never away from it

### Manipulating rollers

Two powered rollers:

- diameter: `5.000 in`
- centers: X=24.000 and X=48.000 in
- coordinated as one feed axis `FEED_X`
- textured resilient polymer/vinyl-like reference surface
- modeled normal force target: `50 lbf per roller`
- actual pressure-to-force mapping remains commissioning work
- no differential feed between R1 and R2 in CUT-001
- CUT-001 expresses feed motion in engineering units (`mm` / `in`). Roller diameter is machine configuration and shall not be used by the reference harness to invent motor counts, encoder scaling, gearbox ratios, or other uncommissioned axis conversions.

## B2. Deterministic lowering equation

Fixed saw spacing:

```text
60.000 - 12.000 = 48.000 in
```

Required finished piece:

```text
60.000 in
```

After SAW-R creates the fresh reference face, required feed index:

```text
INDEX_DISTANCE
= FINISHED_LENGTH - FIXED_SAW_SPACING
= 60.000 - 48.000
= 12.000 in
= 304.800 mm
```

After indexing +12.000 in:

- fresh reference face = X 72.000 in
- SAW-L remains fixed at X 12.000 in
- retained distance = `72.000 - 12.000 = 60.000 in`

No operator measures or marks the final cut.

---

# PART C — OFF-THE-SHELF CONTROL / POSITION REFERENCE STACK

These are **reference candidates**, not a purchase order.

**Reference component roles verified/retrieved: 2026-09-09. Reverify current manufacturer status, model numbers, interfaces, and suitability before procurement or commissioning.**

| Function | Reference product/family | Manufacturer | Native role |
| --- | --- | --- | --- |
| Industrial controller | C6015-0030 Industrial PC | Beckhoff | TwinCAT-capable IPC |
| PLC logic | TwinCAT 3 PLC | Beckhoff | IEC 61131-3 Structured Text |
| Feed-axis motion | TwinCAT 3 NC/PTP | Beckhoff | PLCopen-style motion blocks |
| Fieldbus | EtherCAT | Beckhoff / ETG ecosystem | Cyclic drive and I/O data |
| Servo drive / motor family | AX8000 + AM8000 family | Beckhoff | EtherCAT servo system; sizing TBD |
| Incremental encoder input if separate workpiece encoder is added | EL5151 | Beckhoff | 24 V HTL incremental encoder interface |
| Overhead stock/edge plausibility sensors | Q4X family | Banner Engineering | Laser distance/discrete/analog/IO-Link options |
| Roller pressure control | ITV2000-family IO-Link-compatible electro-pneumatic regulator | SMC | Command/monitor pneumatic pressure |
| IO-Link master | EL6224 | Beckhoff | EtherCAT ↔ IO-Link |
| Roller vertical actuator | ADN-family compact pneumatic cylinder | Festo | Roller down/up actuation |
| Safe digital inputs | EL1904 TwinSAFE | Beckhoff | Safe inputs over FSoE |
| Safe digital outputs | EL2904 TwinSAFE | Beckhoff | Safe outputs over FSoE |
| Safety logic | EL6910 TwinSAFE Logic | Beckhoff | Safety logic over FSoE |
| Guard locking reference | PSENmlock family | Pilz | Safe interlocking / guard locking |
| Store/cell information bridge | TF6100 TwinCAT OPC UA | Beckhoff | OPC UA client/server |

### Role discipline

- The feed servo encoder controls the commanded `FEED_X` axis.
- Banner Q4X sensors are **plausibility/presence checks**, not the authoritative dimensional definition.
- If a separate measuring-wheel encoder is later selected, it enters through the EL5151 and is a cross-check against commanded feed.
- SMC ITV pressure control is not proof of actual roller normal force; actual force must be validated physically.
- Standard PLC logic does not manufacture safe permissives.

---

# PART D — WHAT EACH LAYER ACTUALLY SPEAKS

## D1. Application / Store request — JSON

```json
{
  "requestId": "req:CUT001:000001",
  "projectClass": "CUT-TO-LENGTH",
  "quantity": 1,
  "unit": "ea",
  "storeSku": "STB-ZERO-SPF-2X4-72-001",
  "finished": {
    "length": 60.0,
    "unit": "in",
    "miterAngleDeg": 0.0
  },
  "fulfillment": "STAGED_PICKUP",
  "customerConfirmationRevision": "confirm:CUT001:r1"
}
```

## D2. Store inventory record — JSON

```json
{
  "storeId": "STORE-ZERO",
  "orderId": "order:CUT001:000001",
  "sku": "STB-ZERO-SPF-2X4-72-001",
  "stockItemId": "stock:STB-ZERO-SPF-2X4-72-001:000041",
  "state": "PICKED",
  "quantity": 1,
  "unit": "ea",
  "finishedLengthIn": 60.0,
  "fulfillment": "STAGED_PICKUP"
}
```

## D3. Production authorization — governed type

CUT-001 uses the existing governed `ProductionExecutionAuthorization` schema shape as the starting contract.

Illustrative binding:

```json
{
  "id": "auth:prod:CUT001:000001",
  "type": "ProductionExecutionAuthorization",
  "holder": "STORE-ZERO",
  "recordedAt": "2026-09-09T00:00:00Z",
  "version": "cut001-production-reference/0.1",
  "visibility": "commercial",
  "packetId": "packet:CUT001:000001",
  "packetVersion": "cut001/0.1",
  "machineEnvelopeId": "envelope:D001:CUT001",
  "machineEnvelopeVersion": "0.1",
  "equipmentInstanceId": "D001-REF-001",
  "materialConfirmationId": "material:stock:000041",
  "toolingSetupState": "CUT001-SQUARE-CROSSCUT-READY",
  "operatorId": "operator:local:001",
  "sessionId": "session:CUT001:000001",
  "prerequisitesSatisfied": [
    "STORE_RECONCILED",
    "STOCK_ALLOCATED",
    "STOCK_PICKED",
    "MACHINE_ENVELOPE_MATCH",
    "ANGLE_ZERO_ONLY",
    "LOCAL_OPERATOR_REQUIRED"
  ],
  "controllerPolicy": "CUT001-LOCAL-CYCLE-START-ONLY"
}
```

Implementation must validate the actual adopted governed schema, including its `status` object. Do not weaken the schema to make this example pass.

## D4. Store → cell bridge — OPC UA

Reference: Beckhoff TF6100.

Minimum semantic nodes:

```text
STB/Job/Id
STB/Job/OrderId
STB/Job/PacketId
STB/Job/AuthorizationId
STB/Job/StoreSku
STB/Job/StockItemId
STB/Job/FinishedLength_mm
STB/Job/MiterAngle_deg
STB/Job/CellConfigVersion
STB/Job/State

STB/Cell/EquipmentInstanceId
STB/Cell/EnvelopeId
STB/Cell/EnvelopeVersion
STB/Cell/ControllerProgramId
STB/Cell/ReadyForLocalStart

STB/Cycle/State
STB/Cycle/PositionValid
STB/Cycle/Result
STB/Cycle/FaultCode
```

OPC UA is not the real-time motion loop.

---

# PART E — LOCAL PLC / CONTROLLER CONTRACT

## E1. Controller language

Reference language:

**IEC 61131-3 Structured Text (ST)** in TwinCAT 3 PLC.

Motion:

TwinCAT NC/PTP with PLCopen-style motion blocks.

Safety:

TwinSAFE / FSoE.

## E2. Standard PLC-visible inputs

```text
bJobValidated
bCorrectStockAcknowledged
bRoller1Down
bRoller2Down
bStockPresent
bRightSawHome
bRightSawCycleComplete
bLeftSawHome
bLeftSawAtZeroAngle
bLeftSawCycleComplete
bFeedAxisFault
bEdgeCheck1
bEdgeCheck2
```

## E3. Safety-owned permissives exposed read-only

```text
bSafeCyclePermit
bSafeFeedPermit
bSafeRightSawPermit
bSafeLeftSawPermit
bSafeGuardUnlockPermit
```

The standard PLC cannot make these true.

## E4. Standard controller requests

```text
cmdRollersDown
cmdRollersUp
cmdRightSawCycleRequest
cmdLeftSawAngle_deg
cmdLeftSawCycleRequest
cmdLabelRequest
```

The saw interfaces remain bounded station requests. CUT-001 does **not** define raw blade-motor, brake, guard-bypass, or valve wiring.

---

# PART F — TWINCAT STRUCTURED TEXT REFERENCE

```iecst
TYPE E_CUT001_STATE :
(
    IDLE,
    WAIT_FOR_LOAD,
    LOWER_ROLLERS,
    VERIFY_SEATED,
    TRIM_AT_RIGHT,
    ESTABLISH_REFERENCE,
    INDEX_TO_FINISH,
    VERIFY_INDEX,
    FINISH_CUT_LEFT,
    RELEASE_WORKPIECE,
    COMPLETE,
    FAULT
);
END_TYPE
```

Geometry constants:

```iecst
VAR_GLOBAL CONSTANT
    X_SAW_LEFT_mm       : LREAL := 304.8;    // 12.000 in
    X_SAW_RIGHT_mm      : LREAL := 1524.0;   // 60.000 in
    FIXED_SPACING_mm    : LREAL := 1219.2;   // 48.000 in
    CUT001_LENGTH_mm    : LREAL := 1524.0;   // 60.000 in
    CUT001_INDEX_mm     : LREAL := 304.8;    // 12.000 in
END_VAR
```

Lowering check:

```iecst
rIndexRequired_mm :=
    stJob.FinishedLength_mm - (X_SAW_RIGHT_mm - X_SAW_LEFT_mm);

IF ABS(rIndexRequired_mm - CUT001_INDEX_mm) > cfg.GeometryAgreementLimit_mm THEN
    eState := FAULT;
    sFault := 'CELL_GEOMETRY_JOB_MISMATCH';
END_IF;
```

Bounded state-machine skeleton:

```iecst
CASE eState OF

IDLE:
    bPositionValid := FALSE;
    IF bJobValidated AND bSafeCyclePermit THEN
        eState := WAIT_FOR_LOAD;
    END_IF

WAIT_FOR_LOAD:
    IF bCorrectStockAcknowledged
       AND bStockPresent
       AND bRightSawHome
       AND bLeftSawHome
       AND bLeftSawAtZeroAngle
       AND bSafeCyclePermit THEN
        cmdRollersDown := TRUE;
        eState := LOWER_ROLLERS;
    END_IF

LOWER_ROLLERS:
    IF bRoller1Down AND bRoller2Down THEN
        eState := VERIFY_SEATED;
    END_IF

VERIFY_SEATED:
    IF NOT bStockPresent THEN
        eState := FAULT;
        sFault := 'STOCK_NOT_PRESENT';
    ELSIF bSafeRightSawPermit THEN
        cmdRightSawCycleRequest := TRUE;
        eState := TRIM_AT_RIGHT;
    END_IF

TRIM_AT_RIGHT:
    IF bRightSawCycleComplete AND bRightSawHome THEN
        cmdRightSawCycleRequest := FALSE;
        eState := ESTABLISH_REFERENCE;
    END_IF

ESTABLISH_REFERENCE:
    // SAW-R fresh face becomes longitudinal establishing feature.
    bPositionValid := TRUE;
    eState := INDEX_TO_FINISH;

INDEX_TO_FINISH:
    IF bPositionValid AND bSafeFeedPermit THEN
        fbMoveRelative(
            Axis := FeedAxis,
            Execute := TRUE,
            Distance := rIndexRequired_mm,
            Velocity := cfg.FeedVelocity_mm_s,
            Acceleration := cfg.FeedAcceleration_mm_s2,
            Deceleration := cfg.FeedDeceleration_mm_s2
        );

        IF fbMoveRelative.Done THEN
            fbMoveRelative(Execute := FALSE);
            eState := VERIFY_INDEX;
        ELSIF fbMoveRelative.Error THEN
            bPositionValid := FALSE;
            eState := FAULT;
            sFault := 'FEED_AXIS_MOVE_ERROR';
        END_IF
    END_IF

VERIFY_INDEX:
    IF NOT (bEdgeCheck1 AND bEdgeCheck2) THEN
        bPositionValid := FALSE;
        eState := FAULT;
        sFault := 'WORKPIECE_PLAUSIBILITY_CHECK_FAILED';

    ELSIF bSafeLeftSawPermit AND bLeftSawAtZeroAngle THEN
        cmdLeftSawAngle_deg := 0.0;
        cmdLeftSawCycleRequest := TRUE;
        eState := FINISH_CUT_LEFT;
    END_IF

FINISH_CUT_LEFT:
    IF bLeftSawCycleComplete AND bLeftSawHome THEN
        cmdLeftSawCycleRequest := FALSE;
        eState := RELEASE_WORKPIECE;
    END_IF

RELEASE_WORKPIECE:
    IF bSafeGuardUnlockPermit THEN
        cmdRollersDown := FALSE;
        cmdRollersUp := TRUE;
        IF NOT bRoller1Down AND NOT bRoller2Down THEN
            eState := COMPLETE;
        END_IF
    END_IF

COMPLETE:
    bCycleComplete := TRUE;
    bPositionValid := FALSE;

FAULT:
    cmdRightSawCycleRequest := FALSE;
    cmdLeftSawCycleRequest := FALSE;
    fbMoveRelative(Execute := FALSE);
    bPositionValid := FALSE;
    bCycleFault := TRUE;

END_CASE
```

`POSITION_VALID` becomes false whenever the commissioned machine declares that the physical reference chain has been lost.

---

# PART G — SAFETY COMMUNICATION BOUNDARY

Reference architecture:

```text
E-stop / guard / safety sensors
            ↓
     Beckhoff EL1904
            ↓
       FSoE / TwinSAFE
            ↓
     Beckhoff EL6910
            ↓
     Beckhoff EL2904
            ↓
 safe actuator / enable paths
```

Guard-locking reference: Pilz PSENmlock family.

The standard PLC may observe safe permissives. It may not generate them.

Exact PL/SIL target, stop category, saw stopping/braking function, safe standstill determination, guard-unlock timing, redundancy, diagnostic coverage, and saw-specific risk controls remain commissioning work.

---

# PART H — ROLLER PRESSURE / SMART FIELD I/O

Reference chain:

```text
TwinCAT / EtherCAT
      ↓
Beckhoff EL6224 IO-Link master
      ↓
IO-Link
      ↓
SMC ITV2000-family electro-pneumatic regulator
      ↓
pneumatic supply
      ↓
Festo ADN-family cylinders
      ↓
R1 / R2 normal force
```

Modeled target:

`50 lbf per powered roller`

No final pressure setpoint is claimed until actual cylinder size, linkage, losses, roller compliance, stock interaction, and required traction have been validated.

---

# PART I — LOCAL OPERATOR CYCLE

1. Cell displays the bound job and stock identity.
2. Operator brings the picked board to D-001.
3. Operator verifies stock identity and rejects visibly unsuitable material.
4. Board is placed on the support plane and pushed to the fixed fence.
5. Rough right end extends through SAW-R enough for the cleanup cut.
6. Guarded work zone is closed.
7. Local panel shows readiness.
8. Operator presses **local Ready / Cycle Start**.
9. Rollers descend and hold the board to fence/support.
10. SAW-R makes the cleanup/reference cut.
11. Fresh face establishes the longitudinal origin.
12. `POSITION_VALID = true`.
13. FEED_X indexes `304.800 mm`.
14. Overhead/plausibility sensors confirm expected stock position.
15. SAW-L remains at `0.000 deg` and makes the finish cut.
16. Saw returns home.
17. Safety system determines when guard release is permitted.
18. Rollers raise.
19. Operator removes the finished part.

No operator types `60.000 in` at the machine.

No operator marks a cut line.

No app or network command performs Cycle Start.

---

# PART J — CUT-001 REFERENCE LIFECYCLE

This lifecycle is **CUT-001 reference behavior only**. It is not a new universal governed lifecycle type.

```text
REQUESTED
→ RECONCILED
→ ALLOCATED
→ PICKED
→ AUTHORIZED
→ CELL_ACCEPTED
→ LOCAL_READY
→ RUNNING
→ COMPLETED
→ STAGED
```

Permitted side / terminal outcomes:

```text
REFUSED
DEFERRED
FAULTED
```

| Transition | Owner | Minimum condition |
| --- | --- | --- |
| `REQUESTED → RECONCILED` | Store | Request is readable; SKU, quantity, finished requirement, fulfillment and current Store facts reconcile sufficiently to continue |
| `RECONCILED → ALLOCATED` | Store | One suitable physical stock item is reserved to the order |
| `ALLOCATED → PICKED` | Store / local material handling | The allocated physical stock identity is actually picked for CUT-001 |
| `PICKED → AUTHORIZED` | Governed production-reference issuer | Exact packet/job, material confirmation, envelope, equipment, operator/session and prerequisites are bound by valid production authorization |
| `AUTHORIZED → CELL_ACCEPTED` | Cell intake | Authorization/job/configuration identities match the local cell contract; no remote motion occurs |
| `CELL_ACCEPTED → LOCAL_READY` | Local controller + safety system + operator | Correct job selected; correct stock acknowledged; local readiness and safety permissives exist |
| `LOCAL_READY → RUNNING` | Local operator | Local **Cycle Start** is pressed and accepted |
| `RUNNING → COMPLETED` | Local controller | Bounded CUT-001 sequence completes without fault and both saw stations return to required safe/home states |
| `COMPLETED → STAGED` | Store | Physical result is recorded, stock consumption is reconciled, finished part identity exists, label is recorded, and pickup staging is recorded |

Rules:

- Only the owning layer may create its transition.
- `AUTHORIZED` does not imply `LOCAL_READY`.
- Network presence never creates `RUNNING`.
- `FAULTED` during the referenced machine cycle clears `POSITION_VALID` when the fault can affect the workpiece reference chain.
- `REFUSED` means the current request is explicitly outside an applicable rule/capability/authority boundary.
- `DEFERRED` means required information, material, capability, authority, or local condition is not sufficient yet.
- A physical cut that occurred is never erased because a later Store closeout step failed.

---

# PART K — CUT-001 REFUSAL / FAULT CODES

These are **CUT-001 reference codes**, not a new project-wide taxonomy.

| Code | Owner / class | Meaning | Required next posture |
| --- | --- | --- | --- |
| `SKU_NOT_FOUND` | Store refusal | Requested Store SKU does not exist in the current offering table | Refuse or correct the request; no allocation |
| `STOCK_UNAVAILABLE` | Store defer | SKU exists but no suitable current stock is available | Defer; no cell job |
| `STOCK_ID_MISMATCH` | Local/Store refusal | Loaded physical stock identity does not match the picked/authorized item | No local start; reconcile stock |
| `AUTHORIZATION_MISMATCH` | Governed / cell refusal | Production authorization does not bind the current packet/job/material/equipment/session as required | No startable job; reevaluate |
| `AUTHORIZATION_STALE` | Governed / cell refusal | Authorization is expired, revoked, superseded, or otherwise not current | No startable job; reevaluate |
| `CELL_GEOMETRY_JOB_MISMATCH` | Cell fault/refusal | Job finished requirement does not reconcile with the commissioned CUT-001 lowering geometry | No motion; inspect job/configuration |
| `ANGLE_UNSUPPORTED` | Store/cell refusal | Requested miter angle is not `0.000 deg` in CUT-001 | Refuse this slice |
| `COMPOUND_MITER_UNSUPPORTED` | Store/cell refusal | Request requires compound miter capability | Refuse this slice |
| `SAFETY_NOT_READY` | Local defer | Safety-owned permissives required for the requested local action are absent | Remain stopped; resolve locally |
| `STOCK_NOT_PRESENT` | Local fault/defer | Workpiece presence required for the next state is not established | Remain stopped; reload/recheck |
| `ROLLER_HOLD_NOT_ESTABLISHED` | Local fault/defer | Required roller-down / seated state is not confirmed | No saw request |
| `RIGHT_SAW_NOT_READY` | Local fault/defer | SAW-R is not in the required safe/home condition | No trim request |
| `LEFT_SAW_NOT_READY` | Local fault/defer | SAW-L is not in the required safe/home / zero-angle condition | No finish cut |
| `FEED_AXIS_MOVE_ERROR` | Cell fault | Feed axis reports a motion error | `POSITION_VALID=false`; stop |
| `WORKPIECE_REFERENCE_LOST` | Cell fault | Commissioned reference-chain conditions no longer support claimed workpiece position | `POSITION_VALID=false`; stop |
| `WORKPIECE_PLAUSIBILITY_CHECK_FAILED` | Cell fault | Independent stock-position/presence checks disagree with expected state beyond the commissioned rule | `POSITION_VALID=false`; stop |
| `SAW_CYCLE_ABORTED` | Cell fault | A saw cycle aborts or fails to return to its required state | Stop; no automatic continuation |
| `STORE_CLOSEOUT_UNRESOLVED` | Store defer after physical result | Physical cycle completed but inventory/fulfillment closeout could not be completed | Preserve physical result; do not invent `STAGED` |

Each emitted refusal/fault record should carry at minimum:

```text
code
timestamp
job_id
state
owner
technical_reason
plain_language_reason
next_allowed_posture
```

No remediation hint may authorize an action that belongs to another layer.

---

# PART L — AUDIT EVENT TRACE

```text
ORDER_CAPTURED
STORE_RECONCILED
STOCK_ALLOCATED
STOCK_PICKED
PRODUCTION_AUTHORIZATION_BOUND
CELL_JOB_ACCEPTED
LOCAL_JOB_SELECTED
STOCK_LOADED
LOCAL_READY
LOCAL_CYCLE_START
ROLLERS_DOWN
STOCK_SEATED
RIGHT_TRIM_REQUESTED
RIGHT_TRIM_COMPLETE
FRESH_ORIGIN_ESTABLISHED
POSITION_VALID_TRUE
FEED_INDEX_REQUESTED_304.800_MM
FEED_INDEX_COMPLETE
WORKPIECE_PLAUSIBILITY_CHECK_PASS
LEFT_FINISH_CUT_REQUESTED_ANGLE_0
LEFT_FINISH_CUT_COMPLETE
CUT001_CYCLE_COMPLETE
SAFE_RELEASE_PERMITTED
ROLLERS_UP
PART_REMOVED
STOCK_CONSUMPTION_RECORDED
FINISHED_PART_RECORDED
LABEL_RECORDED
PART_STAGED_PICKUP
OUTCOME_RECORDED
```

Each event records the applicable:

- timestamp
- order/job identity
- packet/authorization identity
- equipment instance
- controller-program identity/version
- cell configuration version
- stock item identity
- human actor for human acts
- prior/new state
- result/fault details
- `job_payload_sha256`
- `production_authorization_sha256`
- `cell_configuration_sha256`
- `controller_program_sha256`

The four SHA-256 values are **content identity only**. They do not grant authority, establish safety, prove conformance, or replace the underlying signed/versioned records. They allow a later reviewer to answer exactly which job payload, authorization record, cell configuration, and controller program participated in the recorded cycle.

---

# PART M — STORE CLOSEOUT

Successful stock state:

```text
ON_HAND
→ ALLOCATED
→ PICKED
→ LOADED
→ CONSUMED
```

Create finished part identity:

`part:CUT001:000001`

Then:

`FINISHED → STAGED`

Fulfillment:

`STAGED_PICKUP`

Trim/cutoff and any usable remnant are recorded. They are not silently erased.

---

# PART N — REQUIRED NEGATIVE TESTS

| Test | Required result |
| --- | --- |
| No SKU | no allocation |
| No stock | unavailable/defer |
| Wrong physical stock | no local start |
| Authorization mismatch | no startable job |
| Equipment/envelope mismatch | no startable job |
| Stale/revoked authorization | no startable job |
| Miter angle nonzero | unsupported in CUT-001 |
| Compound miter request | unsupported |
| Safety not ready | local Cycle Start unavailable |
| Rollers not confirmed down | no trim |
| Right saw not home/safe | no trim |
| Feed-axis fault | `POSITION_VALID=false`; stop |
| Position plausibility check fails | `POSITION_VALID=false`; stop |
| Left saw not at zero angle | no finish cut |
| Saw cycle abort | no automatic continuation |
| Mode change during referenced cycle | `POSITION_VALID=false` |
| Network loss during local cycle | no remote takeover |
| Guard release before safety permit | guard remains locked |
| Physical cut succeeds but Store closeout fails | physical result preserved; Store staging remains unresolved |

---

# PART O — EXECUTABLE ACCEPTANCE HARNESS CONTRACT

CUT-001 is not complete when the Markdown reads correctly. The next software pass must produce one executable reference harness that runs the complete chain without external machine hardware.

## O1. One-command requirement

From a fresh checkout, one documented command shall execute the CUT-001 reference harness.

Recommended first implementation surface:

```text
python run_cut001_reference.py
```

The implementation may choose an equivalent single command only if the repository records it explicitly and requires no hidden local setup beyond the declared runtime/dependencies.

## O2. Happy-path evidence

One successful run shall produce machine-readable and human-readable evidence showing:

1. request captured;
2. Store reconciliation;
3. stock allocation;
4. stock pick;
5. production-authorization binding;
6. cell-job acceptance;
7. local-ready state;
8. simulated local Cycle Start;
9. CUT-001 state-machine transitions;
10. deterministic `304.800 mm` index calculation;
11. successful reference establishment;
12. successful plausibility/position check;
13. successful finish-cut state;
14. completed cycle;
15. Store stock consumption;
16. finished-part identity;
17. label record;
18. staged-pickup state;
19. final audit record;
20. all four SHA-256 identity fields.

## O3. Negative-path evidence

The same harness shall execute every negative case in Part N and prove the required refusal, defer, or fault behavior.

At minimum it must prove:

- no stock;
- wrong stock identity;
- stale/mismatched authorization;
- equipment/envelope mismatch;
- nonzero miter request;
- compound-miter request;
- safety-not-ready;
- feed-axis fault;
- lost/invalid workpiece reference;
- plausibility-check failure;
- saw-cycle abort;
- network loss during local cycle;
- premature guard-release request;
- Store closeout failure after a recorded physical result.

## O4. Determinism and exit behavior

The harness shall:

- use fixed fixture inputs unless the test explicitly varies them;
- compute expected values independently where practical;
- fail closed on unknown/missing required state;
- preserve prior events rather than rewriting history;
- emit a nonzero process exit code if any acceptance check fails;
- emit a concise final PASS/FAIL summary;
- require no browser, CAD package, Store server, OPC UA server, PLC, EtherCAT device, or physical saw for the reference run.

## O5. Boundary rule

The harness simulates owned external boundaries; it does **not** erase them.

A successful harness run shall not be described as:

- physical machine commissioning;
- production safety validation;
- a real saw cycle;
- final Store deployment;
- proof of cut tolerance.

Its purpose is to prove that the entire digital/control contract is internally executable and auditable before real hardware adapters replace the simulated boundaries.

---

# PART P — WHAT THIS MODULE PROVES

If CUT-001 passes, Scan-to-Build has one auditable chain where:

1. ordinary human intent becomes a bounded digital requirement;
2. a Store SKU and one physical board are resolved;
3. production authority is bound to the exact job;
4. Store emits a machine-neutral operation;
5. fixed machine geometry lowers that operation;
6. IEC 61131-3 Structured Text runs the local sequence;
7. EtherCAT carries normal control/motion data;
8. FSoE/TwinSAFE carries safety-domain communication;
9. IO-Link carries smart pneumatic/sensor communication where selected;
10. local Cycle Start remains local;
11. the machine creates a fresh physical reference;
12. one deterministic 12.000-in feed index produces the 60.000-in retained requirement;
13. physical and digital events are recorded;
14. Store stock is consumed and the finished part is staged for pickup.

The customer dimension survives from intent to finished requirement without being retyped beside the saw.

---

# PART Q — NOT YET CLAIMED

These remain physical engineering/commissioning facts, not theoretical architecture gaps:

- final radial-arm station mechanical design and guarding
- final downstroke swivel station design and angular range
- blade size, speed, braking and cut-force analysis
- exact servo motor/gearbox/shaft/coupling sizing
- roller tread, durometer, bearings and validated normal force
- final pressure setpoint for 50-lbf modeled force
- calibrated saw-plane locations and uncertainty
- actual acceptable feed/position disagreement
- actual cut tolerance
- safe stopping time
- risk assessment
- final PL/SIL/category
- guard-unlock safety function
- cabinet/protective-device/wiring design
- commissioning evidence

---

# PART R — REFERENCE SOURCES

Scan-to-Build internal basis:

- `scan-to-build-store/README.md`
- `scan-to-build-store/DEFINITIONS.md`
- `scan-to-build-store/STORE-JOB-001.md`
- governed reference `ProductionExecutionAuthorization` schema
- principle: **job carries part truth; machine carries cell truth**
- `POSITION_VALID` remains machine-local and is not authorization or conformance

Reference industrial stack:

- Beckhoff C6015-0030 Industrial PC
- Beckhoff TwinCAT 3 PLC / IEC 61131-3 Structured Text
- Beckhoff TwinCAT 3 NC/PTP
- Beckhoff TF6100 OPC UA
- Beckhoff EtherCAT
- Beckhoff EL5151 encoder interface
- Beckhoff EL6224 IO-Link master
- Beckhoff EL1904 / EL2904 / EL6910 TwinSAFE components
- Beckhoff AX8000 / AM8000 servo family
- Banner Q4X laser distance sensor family
- SMC ITV electro-pneumatic regulator family
- Festo ADN compact-cylinder family
- Pilz PSENmlock guard-locking family

---

# STOP

Do not add drilling, routing, sheet processing, project-class geometry, PDF parsing, laser capture, picnic-table miter logic, multi-Store routing, or remote Cycle Start to CUT-001.

First prove this one chain.

**NO BLOOD ON WOOD**
