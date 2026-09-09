# Store Job 001 — Alcove Insert, Cut Through Closeout

**Store Zero production cell:** dimensional machine `D-001`  
**Bounded class:** alcove insert  
**Scope:** one received order, one machine run, one staged package, one closeout

---

## The order handoff

This document begins at the **order handoff through the Store membrane**.

The project has already used the Store membrane upstream. Store capability and material paths were queried, the project was resolved sufficiently for the requested work, the holder chose to proceed, and the project entered the Store's commercial path.

The Store now has an order tied to a governed `WorkPacket`.

The WorkPacket carries the information required to understand the governed job, including:

- bounded project class;
- accepted controlling dimensions;
- configured part geometry;
- line drawings;
- material requirements;
- requested manufacturing operations;
- part identities;
- assembly relationships;
- unresolved conditions, if any.

The Store order adds the Store-selected offering / SKU mappings and commercial fulfillment lines needed to act on that WorkPacket.

The evidence behind the project values retains its own sources.

The Store does not recreate that evidence merely because the project has become an order.

For this job, no Store employee travels to the site to rediscover the alcove. No designer redraws the project. No estimator creates a second takeoff. No machine programmer stands beside D-001 and reconstructs the part from the drawing.

That work has already been resolved far enough upstream for the Store to act.

The Store now has four jobs:

**1. Reconcile the order with current Store facts.**

**2. Allocate suitable physical stock.**

**3. Translate the accepted part definition into machine-neutral operations that D-001 can accept.**

**4. Present a locally validated job for Cycle Start.**

That is the Store-side hinge from a resolved project to physical work.

---

# 1. Current Store Reconciliation

The Store does not re-measure the alcove.

It determines whether the order it received can still be fulfilled as represented.

For this configured project, relevant carried facts include:

| Project fact | Value |
|---|---:|
| Alcove height | 94½ in |
| Alcove width | 45½ in |
| Maximum depth | 18 in |
| Floor slope | 1.2° |
| Wall bow | ½ in |
| Configured unit height | 65 in |
| Configured depth | 14 in |
| Shelf quantity | 5 |
| Material family | Pine |
| Hardware | sourced component |

These are project facts.

They are not instructions for the operator to re-establish at D-001.

The Store checks that:

- the order and WorkPacket still identify the same bounded project;
- required controlling dimensions are present with units;
- required part geometry is present;
- required material lines remain mapped to Store offerings;
- the selected Store capability still supports the requested operations;
- current stock information is sufficient;
- required sourced components remain represented;
- no unresolved condition now blocks the requested Store work.

If information required for the requested operation is absent or contradictory, the job stops.

**Nothing is invented at the machine.**

---

## The controlling length

One example is the finished crosswise part length.

The project has already resolved:

```text
45.500   alcove clear width
 0.750   less left side
 0.750   less right side
 0.125   less fit allowance
───────
43.875   finished length
```

D-001 receives a requirement for a **43.875-inch finished kept part**.

It does not reconsider the alcove width.

It does not reconsider the fit allowance.

It does not add saw kerf to the customer's finished dimension.

Kerf, cutter location, and kept-face offset belong to the machine/process definition and material accounting.

The project defines the finished part.

The machine determines how its own physical tool geometry produces it.

---

# 2. Have the Wood

The Store checks the physical material behind the commercial representation.

Representative Store lines for this job include:

| Store line | Material | Represented quantity | Use |
|---|---|---:|---|
| `PNC-172` | Pine 1×6×72 | 4 | applicable dimensional components |
| `PNC-196` | Pine 1×6×96 | 10 | applicable dimensional components |
| — | hardware pack | 1 | sourced component |

The represented order quantity is not automatically machine consumption.

The Store preserves the distinction:

> **on hand ≠ allocated ≠ picked ≠ consumed ≠ staged**

Actual sticks are allocated to the ticket and moved to the D-001 pick cart.

Before a stick is accepted for machining, it must have:

- sufficient usable length;
- a usable reference face or edge;
- physical condition compatible with stable workholding and feed.

A stick may be rejected from the run for excessive bow, crook, cup, twist, severe wane, damage, or another condition that prevents the machine from maintaining its declared references.

The machine does not make unsuitable stock suitable by changing the customer's dimensions.

Unused full sticks remain stock.

Usable remainder may remain remnant.

Kerf and unusable cutoff become material loss according to Store practice.

Actual consumption follows the cut record.

---

# 3. D-001 Machine Capability

D-001 is the first synthetic automated machine capability added to the original Store Zero baseline.

The original Store Zero remains an ordinary lumberyard with its existing commercial systems and limited employee-operated material preparation.

D-001 is an added capability, not a rewritten history of what Store Zero already possessed.

---

## Fixed tool geometry

D-001 uses a determinate known tool set: a small fixed group of saw, drill, mill, and routing functions.

Machine references, station locations, tool locations, and controlled motion relationships are established as part of the machine configuration.

The **job supplies what the part is**:

- finished dimensions;
- part-relative feature locations;
- required operations;
- part identity.

The **machine configuration supplies how this cell is physically built**:

- where the stations are;
- where the applicable tools are;
- how its axes move;
- how part coordinates are transformed into machine movement.

The controller combines those facts to position the work.

No operator creates per-job tool offsets at the machine.

No programmer reconstructs the drawing beside D-001.

No per-job tool-location map is authored at Cycle Start.

The machine-specific lowering logic is established and validated as part of commissioning and configuration.

That lowering logic can then execute deterministically for accepted jobs rather than being manually authored again for each order.

This is the practical advantage of fixed tool geometry.

---

## Store capability and machine capability

The Store uses the governed meaning of `MachineEnvelope`.

A Store may declare or reference a machine-specific capability representation conforming to that contract.

It does not:

- redefine the governed meaning of `MachineEnvelope`;
- silently add capability because an operation once succeeded;
- infer a new envelope from observed behavior.

If the requested job requires an operation outside D-001's declared capability, the Store has an unsupported request.

It does not have permission to invent a new machine capability.

---

## From Store operation to machine program

The Store produces a bounded machine-neutral operation sequence.

For example:

```text
LOAD applicable stock
ESTABLISH workpiece reference
CROSSCUT finished kept length 43.875 in
MILL feature X if required
DRILL feature Y if required
RELEASE
LABEL part Z
```

That is not raw servo code.

At the machine site, the accepted machine-neutral sequence is lowered against the actual D-001 configuration into the controller-specific `machine program / cell program`.

The controller-specific representation is local to the machine implementation.

The Store remains able to preserve the relevant program identity, version, result, or record for traceability without treating controller instructions as the project definition.

---

# 4. Local Control

Three conditions remain separate.

## Local manual / jog operation

An operator commands permitted machine movement locally through the machine controls.

The servos may still perform the movement.

Manual does not mean physically pushing an automated axis by hand.

## Local automatic operation

D-001 executes an accepted machine program under local machine control.

## Network communication

The network delivers a validated job and receives status.

It is not part of the real-time motion-control loop.

> **Loss of network communication shall not affect real-time motion, interlocks, state management, or stopping.**

Local machine control remains responsible for the active physical cycle.

A change between manual and automatic operation is an explicit machine event.

A mode change does not silently preserve an automatic workpiece position merely because an operator believes nothing moved.

---

# 5. Workpiece Position

The machine either has a valid basis for workpiece position or it does not.

For this document, that condition is called:

`POSITION_VALID`

`POSITION_VALID` means that the workpiece reference required for the applicable commanded motion has been established and the D-001 position chain has not subsequently become invalid or uncertain.

It is not authorization.

It is not project acceptance.

It is a machine-local physical-state condition.

When `POSITION_VALID` is false, D-001 does not execute a command whose geometry depends on known workpiece position.

It may accept only the actions needed to:

- safely release the work;
- establish position again;
- or otherwise recover under the later machine specification.

The detailed sensing method, allowable position error, encoder strategy, slip detection, calibration procedure, and exact invalidation events belong in the later D-001 technical specification.

The rule here is simpler:

> **If D-001 can no longer support its claimed workpiece position, it stops relying on that position.**

---

# 6. Capability Progression

Machine Capability Level is a Scan-to-Build planning label, not an industrial standard and not a runtime state.

The existing Store progression remains:

**MCL-1 — Transmission Proof**  
One instruction, one board, one established workpiece reference, one bounded operation, one observed result.

**MCL-2 — Minimum Useful Cell**  
A bounded multi-operation capability capable of supporting a useful initial project or fulfillment path.

**MCL-3 — Extended Capability**  
Broader capability developed from demonstrated needs and limitations.

**MCL-4 — Frontier Capability**  
Long-range capability, advanced automation, and future machine concepts.

A useful comparison exists below MCL-1:

**Position-assisted operation** — controlled stock positioning with an operator completing the physical cut or operation through independently controlled equipment.

It is a comparison point, not an additional formal MCL in this document.

For D-001, one major complexity driver is **re-referencing**.

The fewer times a workpiece must be released, flipped, relocated, or established against another independent frame, the fewer opportunities exist for hidden positional error to enter the part.

D-001 therefore prefers:

> **establish the workpiece once and perform the required operations inside that maintained reference chain.**

This job exercises the minimum-useful-cell idea.

---

# 7. Translate the Job

The accepted line drawings describe the required components.

D-001 does not need a drawing of the alcove.

It needs an ordered operation sequence for each applicable piece of parent stock.

For every D-001 part, Store-side translation supplies as required:

- parent Store item;
- part identity;
- load orientation;
- part-relative finished dimensions;
- required manufacturing operations;
- feature locations;
- feature depths where applicable;
- label identity.

The translation does not invent machine coordinates.

For example:

> The job says a hole belongs at a defined location on the part.

D-001's configuration says:

> This machine must move the workpiece to this local position to put that feature under this drill.

Likewise:

> The job says the finished kept length is 43.875 inches.

The D-001 configuration says:

> This saw and its known kept-face relationship must be positioned so that the retained part is 43.875 inches long.

That separation is what makes the job definition portable.

The part is not defined by one particular saw's blade location.

---

# 8. Ready for Cycle Start

Before the first stick runs:

| Condition | State |
|---|---|
| Correct job active | yes |
| Required stock at D-001 | yes |
| Physical stock agrees with Store item | yes |
| Fence and support surface | clear |
| Saws | retracted |
| Mill / drill stations | clear |
| Workholding | open |
| Feed rollers | raised |
| Workpiece position | not yet established |

The machine presents the first required stock and part identity.

Example:

```text
LOAD PNC-196
PART <packet-defined part ID>
```

The operator loads the requested stock.

No finished length is typed in.

No hole position is entered.

No cut line is marked.

The operator places the stock in the declared load orientation and presses **Ready / Cycle Start**.

---

# 9. The Run — One Board

## Load

A selected PNC-196 stick is brought from the job pick cart to D-001.

The operator confirms that it is the requested Store item and that its physical condition is acceptable for the run.

The board is placed onto the machine support.

The required reference face or edge is placed against the fence.

A rough end extends far enough beyond the first-cut location to allow the machine to establish a clean origin face.

No tape layout is performed.

---

## Establish the lateral and vertical references

The lateral workholding closes and seats the board against the fixed fence.

That establishes the lateral working reference.

The powered feed / manipulating rollers descend onto the stock.

Their hold-down force seats the board onto the support plane while retaining the ability to drive the stock longitudinally.

The board is now held:

- laterally against the fence;
- vertically against the machine support;
- longitudinally under controlled feed.

The machine has established how the board is oriented.

It has not yet established a trustworthy longitudinal origin from the rough commercial end.

`POSITION_VALID` for commanded length-dependent movement is not yet established.

---

# 10. First Cut — Establish the Origin

The feed system positions the rough end at the infeed saw.

The saw performs a controlled cleanup cut.

The saw retracts.

The new machined end becomes the workpiece's longitudinal **origin face**.

The commercial factory end is no longer used as the length reference.

At this point the D-001 position chain has:

- a lateral reference from the fence;
- a vertical reference from the support plane;
- a longitudinal origin established by the fresh machined end.

When the applicable machine conditions confirm that this position chain is valid:

```text
POSITION_VALID = true
```

The rough piece of removed end stock is recorded as cutoff.

---

# 11. Servo Travel to the Finished Cut

The feed rollers rotate under servo control.

The board travels longitudinally while remaining held to its established lateral and vertical references.

The operator does not push it.

The machine program requests the finished retained geometry.

For this example:

```text
FINISHED KEPT LENGTH = 43.875 in
```

D-001's commissioned tool geometry determines the machine position necessary to make that retained dimension.

The job does not command:

```text
43.875 + blade kerf
```

because blade kerf is not part of the customer's finished length.

Kerf is accounted for by the machine/process model and later material accounting.

The feed decelerates and stops at the required machine position.

The outfeed saw performs the finished cut.

The saw retracts.

A finished-length component now exists.

---

# 12. Additional Operations

If the part definition requires another D-001 operation, the same workpiece is repositioned to the applicable fixed station while the declared reference chain remains valid.

For a mill feature:

```text
servo position
mill head position
spindle start
plunge / cut
retract
```

For a drilled feature:

```text
servo position
drill head position
spindle start
plunge
retract
```

The part definition supplies the required feature.

The machine configuration supplies the local transformation necessary to bring that feature to the applicable tool.

No operator measures the feature location.

No operator establishes a new tool offset for the job.

Where the machine cannot preserve the declared workpiece reference between operations, `POSITION_VALID` is cleared and position must be established again under the applicable machine procedure.

The detailed workholding sequence for each tool station belongs to the later D-001 specification.

---

# 13. Release and Label

When all required operations for that component are complete:

- active tools retract;
- feed motion stops;
- workholding releases as required;
- the completed component is removed.

Release ends the maintained workpiece-position chain unless the later machine specification explicitly establishes otherwise.

The machine or Store-side station presents the label for the completed part.

The label identifies at minimum the applicable:

- Store job;
- part identity;
- material line;
- relationship to the order.

The completed part moves to the job cart.

It does not return to general stock.

The next requested piece is loaded.

The sequence repeats.

---

# 14. The Operating Pattern

For each D-001 component, the top-level motion language is:

```text
LOAD
  ↓
SEAT TO MACHINE REFERENCES
  ↓
HOLD / FEED ENGAGE
  ↓
FIRST CUT ESTABLISHES LONGITUDINAL ORIGIN
  ↓
POSITION_VALID
  ↓
SERVO INDEX TO REQUIRED OPERATION
  ↓
CUT / MILL / DRILL AS CALLED
  ↓
REPOSITION WITHIN VALID REFERENCE CHAIN
  ↓
COMPLETE REQUIRED OPERATIONS
  ↓
RELEASE
  ↓
LABEL
  ↓
JOB CART
```

That is the central physical idea of D-001:

> **Establish the workpiece, move the workpiece under controlled motion through known processing stations, and release an identified component.**

---

# 15. Operator Role

For a normal D-001 job, the operator:

- retrieves the Store item named by the machine;
- confirms the physical stock matches the job;
- judges whether the stick is suitable to reference and run;
- loads it in the declared orientation;
- presses Ready / Cycle Start;
- observes the cycle;
- responds to abnormal conditions;
- clears cutoffs as required;
- removes the completed component;
- applies or confirms its label;
- places it on the correct job cart;
- loads the next requested stock.

The operator does not:

- recreate the project;
- re-measure the alcove;
- choose finished part dimensions;
- mark the cut length;
- lay out feature positions;
- create machine offsets;
- program the part at D-001;
- silently change the customer configuration.

The machine performs the repetitive positional work.

The operator retains the physical judgment required to handle real material and abnormal conditions.

---

# 16. When a Cycle Does Not Produce a Part

Motion occurring does not automatically mean a valid component was produced.

A cycle becomes suspect when the declared physical basis for the work is lost or a required operation does not complete as expected.

Examples include:

- loss of stable fence contact;
- loss of stable support;
- loss or uncertainty of the declared feed-position chain;
- tool or axis fault;
- incomplete saw cycle;
- failed mill or drill operation;
- machine interruption;
- physical damage that makes the part unacceptable.

If the machine can no longer support its claimed workpiece position:

```text
POSITION_VALID = false
```

The affected stock is not silently promoted to a completed part.

The result is handled according to the applicable Store/machine procedure:

- inspect and explicitly accept;
- recover from an established valid condition;
- re-run;
- or reject and replace.

A failed physical attempt does not become the requested component merely because the correct label exists.

---

# 17. End of D-001 Work

When all parts routed to D-001 for this order have completed their required operations, the Store reconciles the machine output against the WorkPacket.

Check:

- required D-001 parts completed;
- required labels present;
- parent stock actually consumed;
- full stock left unused;
- usable remnants;
- cutoff and scrap;
- rejected attempts;
- incomplete or rerun components.

Allocated stock is not automatically recorded as consumed stock.

The physical cut record controls actual consumption.

When the D-001 portion reconciles, its job cart moves to staging.

D-001 is finished with its work for this order.

The Store is not yet finished with the order.

---

# 18. Staging

Staging reunites every Store order line that must leave together.

That may include:

**D-001 fabricated components**

The labeled dimensional parts produced by this run.

**Other Store-fulfilled components**

Any required order lines fulfilled through another declared Store capability or supply path.

This document does not invent the fabrication method for a component that D-001 does not make.

**Sourced components**

Hardware, doors, fasteners, or other buy-outs carried on the order.

**Customer package**

- job identity;
- labeled components;
- assembly relationship information;
- pickup or delivery information.

The assembly information explains how the identified components relate.

It does not ask the customer to rediscover fabrication dimensions that were already resolved upstream.

If a required order line has not arrived or has not completed its Store path, the package may remain physically staged.

It is not yet complete.

> **Staged does not mean fulfilled.**

---

# 19. Closeout

Closeout is a final reconciliation of the physical package against the Store order and its associated WorkPacket.

| Check | Confirms |
|---|---|
| Job identity | The staged package belongs to the same order that entered this Store path |
| Project relationship | The order remains tied to the applicable WorkPacket |
| Material identity | Actual Store items used agree with the recorded material resolution |
| Part completion | All required fabricated components are present |
| Part identity | Completed components carry their intended labels |
| Machine history | Applicable D-001 cycles and outcomes are represented |
| Exceptions | Failed, rejected, or rerun attempts are accounted for |
| Stock balance | Consumed stock, unused stock, remnants, cutoff, and scrap reconcile |
| Other order lines | Sourced or separately fulfilled components are present or explicitly unresolved |
| Stage tally | The physical package agrees with the Store ticket |

When all requirements for the declared handoff are met, the order becomes:

```text
READY FOR PICKUP
```

or:

```text
READY FOR DELIVERY
```

When the package physically leaves through that declared handoff:

```text
FULFILLED
```

That closes this Store job.

---

# 20. What This Job Demonstrates

The order entered this portion of Store Zero as sufficiently resolved information.

The Store:

```text
received the order and WorkPacket
        ↓
reconciled current Store facts
        ↓
allocated suitable stock
        ↓
confirmed declared machine capability
        ↓
translated part requirements into machine-neutral operations
        ↓
lowered those operations against a known local machine
        ↓
presented a locally runnable job
        ↓
operator loaded the stock and pressed Cycle Start
        ↓
D-001 established the workpiece
        ↓
servo-controlled motion positioned it through fixed stations
        ↓
completed components were labeled
        ↓
parts moved to the job cart
        ↓
all order lines converged in staging
        ↓
the physical package reconciled to the order
        ↓
pickup or delivery occurred
        ↓
the Store marked the order fulfilled
```

The Store did not have to rediscover the project after receiving it.

The machine did not have to infer what the customer meant.

The operator did not have to turn a line drawing back into tape marks and machine offsets.

That is the useful connection between the Store membrane and D-001.

---

# 21. What This Document Does Not Specify

This document describes the Store path and the physical operating sequence at the level needed to understand one job.

It does not yet specify:

- controller register maps;
- servo drive configuration;
- exact fieldbus;
- encoder architecture;
- feed-slip sensing method;
- `POSITION_VALID` implementation logic;
- axis homing procedure;
- complete interlock matrix;
- pressure thresholds;
- saw, mill, or drill timing;
- feeds and speeds;
- calibration procedure;
- machine tolerance stack;
- detailed capability-envelope schema;
- postprocessor implementation;
- controller-specific program syntax;
- production authorization issuer;
- complete credential or audit-object model.

Those belong in the later detailed machine and execution specifications.

This document only needs to establish the path clearly enough that those later specifications have a real physical job to describe.

---

Store Zero is a synthetic reference environment.

D-001 is a synthetic reference machine.

This document does not claim that D-001 has been built, that production authority has been issued, or that physical production has occurred.

Its purpose is narrower:

> **show how one resolved Store order can become controlled machine work, labeled physical output, a staged package, and a closed Store record without requiring the project to be re-authored at the machine.**
