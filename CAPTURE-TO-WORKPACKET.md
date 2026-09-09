# Scan-to-Build

## Capture-to-WorkPacket Boundary

### Dimensional Intake and Reconciliation Baseline

Remote fabrication moves important fit decisions upstream.

When work is cut away from the place where it must fit, a dimensional mistake that a local carpenter might discover before cutting can instead become a manufactured mistake.

Scan-to-Build therefore treats capture as **evidence**, not automatic authority.

Its job is to preserve customer intent, accept dimensional evidence from multiple legitimate sources, reconcile that evidence without silently changing it, and produce a sufficiently resolved project definition that a receiving Store can evaluate before material is committed.

The objective is not zero measurement error.

The objective is to prevent unresolved or misunderstood dimensional error from silently surviving into irreversible work.

---

# 1. Responsibility Boundary

This boundary is intentionally simple.

## Scan-to-Build is responsible for

**Customer intent entered through the Scan-to-Build interface** — What the holder says they want, select, accept, reject, or change.

**Faithful preservation** — Values and declarations supplied to the system remain attributable to their source.

**Translation** — Accepted project information may be converted into bounded project, material, part, process, and later machine requirements without silently changing its meaning.

**Reconciliation** — Conflicting or differently sourced observations are presented and resolved explicitly rather than overwritten.

**Provenance** — The system preserves where consequential information came from.

**Completeness checks** — A project class may require specific dimensions or observations before proceeding.

**Refusal and deferral** — Missing, contradictory, insufficient, or unresolved information may stop the downstream path.

## Scan-to-Build is not the measuring instrument

Scan-to-Build does not manufacture:

- phone LiDAR sensors;
- laser distance meters;
- tape measures;
- professional laser scanners;
- digital templating systems;
- cameras;
- surveying equipment.

It does not become responsible for the physical accuracy of an external instrument merely because it accepts the instrument's output.

## Scan-to-Build may accept a measurement without claiming to have measured anything

A dimensional value may arrive from:

- owner entry;
- contractor entry;
- tape measurement;
- handheld laser;
- phone spatial capture;
- imported drawing;
- professional scanner;
- digital templating equipment;
- other appropriately identified evidence.

The measurement claim remains attributable to the source that produced or supplied it.

Scan-to-Build owns the **faithfulness of its later handling of that information**.

The governed reference already prohibits software or a model from originating a measurement, converting inference into observation, silently filling a required field, or erasing provenance.

---

# 2. The Actual Scan-to-Build Path

The name begins with **Scan**.

That does not mean one scan directly creates machine instructions.

The intended chain is:

```text
NEED / INTENT
      ↓
CAPTURE
      ↓
OBSERVATIONS
      ↓
EDITABLE PROJECT REPRESENTATION
      ↓
DIMENSIONAL RECONCILIATION
      ↓
ACCEPTED CONTROLLING INFORMATION
      ↓
BOUNDED PROJECT CONFIGURATION
      ↓
DERIVED PART / MATERIAL REQUIREMENTS
      ↓
CREDIBLE WORKPACKET
      ↓
STORE EVALUATION
      ↓
PROCESS / MACHINE TRANSLATION
      ↓
LOCAL VALIDATION
      ↓
SIMULATED OR LATER AUTHORIZED EXECUTION
```

A scan is one possible way to start.

The downstream chain is what makes the result usable.

---

# 3. Capture Is Modular

A project shall not depend on one capture technology unless that project class specifically requires it.

The governed architecture already preserves manual, drawing-based, and spatial-capture paths and states that inability to use LiDAR or provide a machine-readable document must not automatically disqualify an otherwise resolvable inquiry.

The current governed baseline also explicitly does not require a commercial scanner or production-grade LiDAR accuracy.

The relevant question is therefore not:

> Was this captured with LiDAR?

It is:

> **What observation is being relied upon, what produced it, and is it sufficient for the downstream use being requested?**

---

# 4. Clean Dimensional Information

The system does not need impressive numbers.

It needs **clean dimensional information**.

A clean dimensional input is a dimensional claim whose essential meaning is known.

At minimum, a consequential dimension should answer:

**What feature?** — What physical thing or relationship is being measured?

**What value?** — The numerical result.

**What unit?** — Inch, millimeter, degree, or another defined unit.

**What source?** — Person, drawing, device, capture artifact, or professional system.

**What method?** — Tape, laser distance, LiDAR-derived geometry, digital templating, etc.

**What status?** — Supplied, observed, reconciled, verified where applicable, unresolved, or another governed state.

**What context?** — Which project/site/version does it describe?

**Is it sufficient for this use?** — The answer depends on what downstream act the dimension will control.

A number with many decimal places is not automatically clean.

`46.2500 in`

without a known feature, source, or method may be less useful than:

`46 1/4 in — clear opening between finished left and right faces — handheld laser observation`.

---

# 5. False Precision

Digital tools can make uncertain geometry appear more authoritative than it is.

A software-generated dimension such as:

`46.0837 in`

may simply be the mathematical output of an approximate spatial model.

More decimal places do not establish greater physical accuracy.

Scan-to-Build shall preserve enough information to distinguish:

- measured precision;
- reported precision;
- derived precision;
- and display precision.

The system should not imply more certainty than the source evidence supports.

---

# 6. Dimension Roles

Not every project dimension carries the same consequence.

## Context dimension

Helps describe or orient the project.

Example:

`approximate room height`.

Useful for visualization or early feasibility.

## Candidate dimension

Observation that may become controlling but has not yet been accepted for that purpose.

Example:

`phone-derived clear opening width`.

## Controlling dimension

Dimension accepted as controlling a particular project requirement, fit, part, or calculation.

Example:

`accepted finished opening width used to derive shelf length`.

## Derived dimension

Calculated from controlling inputs and explicit project rules.

Example:

`finished shelf blank length`.

## Inspection dimension

Dimension observed after fabrication or another process to determine whether the produced result corresponds to its requirement.

These roles must not silently collapse.

A spatial scan may provide a candidate dimension.

The machine should ultimately operate from governed derived requirements.

---

# 7. Reconciliation

Multiple observations of the same feature are normal.

Reconciliation means preserving those observations and deliberately determining how they affect the project.

Example:

```text
FEATURE
clear opening width

OBSERVATIONS
46.08 in — phone spatial capture
46.24 in — handheld laser observation
46.25 in — repeated handheld laser observation
46.00 in — supplied historical drawing

RECONCILIATION
historical drawing retained as supplied evidence
phone result retained as spatial/context evidence
laser observations retained as direct dimensional evidence
controlling project value selected under applicable procedure
```

The system does not automatically:

- average the values;
- select the most precise-looking value;
- select the newest value;
- select the most expensive instrument;
- erase the losing observations;
- or silently change the project.

Reconciliation produces an inspectable chain from evidence to controlling information.

---

# 8. Source Prestige Does Not Create Authority

Instrument class is evidence.

It is not authority by itself.

A professional scanner may produce far stronger dimensional evidence than a phone.

A laser may produce stronger evidence for one distance than a room scan.

A tape measure may be the simplest and most reliable way to establish another feature.

A professionally produced drawing may still describe a design rather than the actual field condition.

The governing question remains fit for purpose.

The existing contractor boundary already states that instrument class does not close a gate by itself and that field measurements remain supplied until the applicable capture procedure is recorded.

---

# 9. Error Sources

No single sensor specification describes the complete risk of dimensional failure.

| Error source | Example | Typical control |
|---|---|---|
| Sensor error | Range measurement varies from actual distance | Appropriate instrument and known limitations |
| Range effect | Error increases with distance | Shorter observations / suitable equipment |
| Surface effect | Glass, mirror, dark or reflective surface | Alternate viewpoint or measurement method |
| Occlusion | Furniture hides a controlling corner | Additional capture or direct measurement |
| Lighting / tracking | Mobile spatial tracking degrades | Better conditions / repeat capture |
| Motion / drift | Mobile scan accumulates positional error | Shorter capture, overlap, closure check |
| Registration | Separate scan positions align poorly | Registration control / known references |
| Feature interpretation | Software measures trim instead of substrate | Human identification of controlling surface |
| Semantic recognition | Window, wall, beam, opening misclassified | Review and edit |
| Human positioning | Laser referenced against wrong surface | Defined measurement procedure |
| Human reading | Tape misread | Repeat or alternate observation |
| Transcription | 46.25 entered as 42.65 | Direct transfer / review |
| Unit | mm interpreted as in | Explicit unit |
| Conversion | Premature or inconsistent rounding | Controlled conversion |
| Site change | Trim or flooring changes after measurement | Freshness / recapture |
| Design allowance | Correct site value, wrong fit allowance | Explicit configuration rule |
| Manufacturing variation | Tool or setup differs from planned result | Machine/process envelope |
| Material movement | Wood changes dimension with moisture | Material/process allowance |
| Installation condition | Opening is out of square or bowed | Multi-feature capture / installation strategy |

Even professional systems require quality control. FARO, for example, documents comparing scanner results against known references and checking registration rather than assuming scanner output is correct solely because it came from professional equipment.

---

# 10. Current Technology Landscape

This register is informative.

Brand names demonstrate real current paths.

They are not Scan-to-Build dependencies, endorsements, certifications, or required integrations.

## A. Phone-native spatial capture

### Apple RoomPlan

Uses camera and LiDAR-supported Apple devices to produce parametric representations of rooms and structures.

Apple exposes captured room components and dimensions as editable parametric data and supports USD representations.

**Useful for** — Room topology, openings, spatial context, editable starting geometry.

**Limit** — Not presented by Apple as fabrication metrology.

**Scan-to-Build position** — Strong front-door spatial capture candidate.

---

### Polycam

Phone/tablet spatial capture with editable floorplans and outputs including DXF, PDF, SVG, point clouds, and structured floorplan formats. Polycam currently states approximately ±0.5-inch tolerance for standard interior floorplan captures and explicitly provides review/edit before export.

Its own current as-built guidance recommends laser verification for dimensions driving critical design decisions.

**Useful for** — Rapid as-built context, editable geometry, CAD handoff.

**Limit** — Standard floorplan tolerance is too broad for many close-fit fabrication decisions.

**Scan-to-Build position** — Capture/template seed; critical dimensions may require stronger evidence.

---

### Canvas

Phone/tablet LiDAR capture converted to professional CAD/BIM deliverables.

Canvas states that most dimensions are typically within roughly 1–2% of manually verified values under recommended capture conditions. It recommends manually verifying dimensions that require tighter tolerances.

Canvas also supports supplied manual dimensions replacing particular scan-derived dimensions rather than globally rescaling the entire model.

**Useful for** — Design-ready as-built model, early planning, CAD conversion.

**Limit** — Not a universal tight-tolerance fabrication source.

**Scan-to-Build position** — Excellent example of scan + critical-dimension reconciliation.

---

### magicplan

Mobile room capture and editable floorplan system.

Its scan accuracy depends on environmental and user factors. It supports manual editing and direct Bluetooth measurement entry from compatible laser instruments.

**Useful for** — Consumer/trade editable room representation.

**Limit** — Camera/spatial capture does not itself establish every controlling dimension.

**Scan-to-Build position** — Particularly strong model for phone-first + laser-confirmed capture.

---

# 11. Direct Digital Measurement Tools

## Bosch MeasureOn + GLM laser meters

Bosch MeasureOn links compatible Bluetooth laser distance meters to digital sketches, photos, measurement lists, and floorplan documentation. Values can be inserted directly from the measuring device rather than copied by hand.

**Useful for** — Reducing transcription error while retaining simple field measurement.

**Limit** — Geometry remains dependent on which feature the person chooses to measure.

**Scan-to-Build position** — Strong manual/laser evidence path.

---

## Leica DISTO + DISTO Plan

Leica DISTO Plan allows measurements from Bluetooth-connected laser instruments to be assigned to sketches and photographs. P2P-capable setups can collect 2D/3D coordinates and export DXF/DWG for CAD workflows.

**Useful for** — Precise direct measurement tied to an editable digital representation.

**Limit** — Still requires deliberate selection of correct measuring points/features.

**Scan-to-Build position** — Strong bridge between ordinary site measurement and structured geometry.

---

## Moasure

Inertial measurement device that captures linear, perimeter, elevation, area, volume and 3D site information. Current published linear error for Moasure 2 PRO is ±0.3%, with technique explicitly identified as important to result quality.

**Useful for** — Larger irregular site geometry and terrain.

**Limit** — Not primarily close-tolerance cabinetry/millwork metrology.

**Scan-to-Build position** — Legitimate evidence source for applicable project classes.

---

# 12. Professional Reality Capture

## Leica BLK360

Professional imaging laser scanner.

Leica currently publishes 3D point accuracy of approximately 4 mm at 10 m and supports point-cloud workflows into CAD/BIM systems.

**Useful for** — High-quality existing-condition capture and complex geometry.

**Limit** — A point cloud still does not determine project intent, controlling surfaces, allowances, or manufacturing strategy.

---

## FARO Focus

Professional terrestrial laser-scanning family for accurate 3D reality capture.

FARO's own procedures emphasize accuracy verification, known references, registration quality, environmental considerations, and calibration/certification.

**Useful for** — Professional survey/as-built datasets.

**Limit** — High-quality geometry still requires semantic/project interpretation.

---

## Trimble X9

Professional terrestrial laser scanner.

Trimble publishes 3D point accuracy of approximately 2.3 mm at 10 m and 3.0 mm at 20 m for the current X9 specification.

**Useful for** — Survey-grade existing-condition capture and registered point clouds.

**Limit** — Does not itself decide which dimensions should control a fabricated object.

---

## Matterport Pro3

LiDAR-based digital-twin/reality-capture platform.

Matterport publishes approximately 20 mm accuracy at 10 m for Pro3.

**Useful for** — Documentation, visualization, remote inspection, broad spatial context.

**Limit** — Generally not appropriate as the only evidence for close-tolerance fitted fabrication.

---

# 13. Professional Digital Templating

These systems demonstrate that a legitimate site-measurement-to-fabrication chain already exists.

## Leica 3D Disto

Precision point-measurement system used for as-built geometry and digital templating.

**Useful for** — Direct measured geometry, difficult openings, fabrication-oriented capture.

**Scan-to-Build significance** — Demonstrates that site measurement can move digitally toward CAD/manufacturing without relying on generic room scanning.

---

## Prodim Proliner

Digital templating system used in industries including furniture, doors, windows, countertops, and related fitted products.

Current Proliner V8 documentation publishes approximately 0.6 mm precision and supports on-device editing, production-oriented software, and DXF output.

**Useful for** — Fabrication-oriented templates and complex fitted geometry.

**Limit** — Specialized professional workflow and equipment.

**Scan-to-Build significance** — Strong proof of a legitimate measured-geometry → editable digital template → production-preparation path.

---

## Laser Products Industries LT-2D3D

Professional digital laser templating system.

Laser Products currently publishes 1/16-inch accuracy up to 200 feet and markets the system specifically around reducing rework through precise templating.

**Useful for** — Field templating and fabrication-oriented geometry.

**Limit** — Specialized equipment and workflow.

**Scan-to-Build significance** — Demonstrates a direct commercial precedent for remote measured geometry feeding downstream fabrication preparation.

---

# 14. Technology Classes

The technology names will change.

The classes are more durable.

**Phone spatial capture** — RoomPlan, Polycam, Canvas, magicplan and successors.

**Phone photogrammetry** — Image-derived spatial geometry.

**Hand-entered measurement** — Tape, rule, level, square, caliper, etc.

**Bluetooth direct measurement** — Laser or digital tape values transferred directly into software.

**Point-to-point laser measurement** — Deliberate measurement of selected features/coordinates.

**Inertial spatial measurement** — Devices such as Moasure.

**Professional terrestrial laser scanning** — FARO, Leica BLK, Trimble and similar systems.

**Professional digital templating** — Proliner, LT-2D3D, 3D Disto and similar systems.

**Drawing-derived evidence** — PDF, DXF, DWG, BIM, shop drawing, architect drawing or other supplied documentation.

**Professionally verified field record** — Measurements or geometry supplied by a responsible professional under an identified process.

Scan-to-Build should integrate at the **class boundary first**, not hard-code itself to a vendor.

---

# 15. Phone-First Path

The broad consumer path is:

```text
PHONE CAPTURE
      ↓
EDITABLE PROJECT TEMPLATE
      ↓
SYSTEM IDENTIFIES REQUIRED FEATURES
      ↓
USER REVIEWS DIMENSIONS
      ↓
CRITICAL DIMENSIONS MAY BE
CONFIRMED / REPLACED / ADDED
WITH TAPE OR LASER
      ↓
CONFLICTS RECONCILED
      ↓
CONTROLLING INFORMATION ACCEPTED
```

The phone is used for what it already does well:

- topology;
- spatial relationships;
- visualization;
- approximate geometry;
- identification of openings and surfaces;
- reducing blank-page data entry.

It is not asked to pretend to be something it is not.

---

# 16. Trade / Professional Path

A professional path may instead begin with:

```text
LASER / DIGITAL TEMPLATE /
PROFESSIONAL SCANNER / DRAWING
      ↓
STRUCTURED DIMENSIONAL EVIDENCE
      ↓
EDITABLE PROJECT REPRESENTATION
      ↓
RECONCILIATION
      ↓
CONTROLLING INFORMATION
```

This path may require fewer secondary checks because the source evidence is stronger.

It does not bypass:

- project intent;
- configuration;
- provenance;
- unresolved conditions;
- Store acceptance;
- or later machine authority.

---

# 17. Bounded Project Library

Scan-to-Build may maintain a library of bounded project templates.

The library provides a head start.

It does not provide live site truth.

A project template may contain:

**Project class** — What bounded type of project it represents.

**Required features** — Which physical features must be known.

**Required observations** — Which dimensions or site conditions must be supplied.

**Dimension roles** — Which inputs are context versus potentially controlling.

**Configuration choices** — What the holder may select.

**Relationships** — How accepted inputs derive part geometry.

**Material form expectations** — Sheet, dimensional, hardware, or other applicable forms.

**Manufacturing scope** — The kinds of bounded operations the project class may eventually require.

**Early manufacturability questions** — Conditions that can refuse or defer the project before unnecessary detail is created.

**Machine-movement scope** — The bounded physical operation family contemplated by the class.

A template shall not contain:

- the customer's actual opening width;
- assumed live site values;
- invented observations;
- automatically verified dimensions;
- hidden corrections;
- current Store inventory;
- machine authorization.

The template knows **what must be known**.

The holder's evidence supplies **what is true or claimed for this project**.

This distinction prevents a template from becoming a disguised source of fabricated site facts.

---

# 18. Example: Constrained-Space Shelving Template

The template may know that the project requires:

```text
opening width
usable height
usable depth
left/right boundary condition
top/bottom boundary condition
out-of-square condition where relevant
shelf quantity
shelf depth preference
material form
support strategy
clearance / allowance rule
```

The template may know that shelf length is derived from accepted geometry and applicable fit/allowance rules.

It does **not** know:

```text
opening width = 46.25 in
height = 88 in
depth = 11.5 in
```

until those values arrive through the actual project record.

The template therefore helps the system ask the right questions without answering those questions itself.

---

# 19. Dimensional Sufficiency Is Service-Specific

A Store should not ask:

> Is this entire project accurate?

It should ask:

> **Is the dimensional evidence sufficient for the Store service being requested?**

Examples:

## Material sale only

Site geometry may be largely irrelevant.

The Store may only need:

- material identity/form;
- quantity;
- commercial information.

## Cut-to-declared-length service

The Store may need:

- clearly identified requested finished length;
- unit;
- material;
- quantity;
- applicable cut allowance;
- source/acceptance of the cut dimension.

It may not need the complete room model.

## Fitted shelf fabrication

The Store may need:

- controlling opening geometry;
- fit allowance;
- material;
- applicable site-condition information;
- stronger dimensional reconciliation.

## Complete fitted assembly

The Store may require substantially richer evidence because more interfaces must fit remotely.

The more dimensional liability the Store accepts, the more resolved the dimensional evidence must become.

---

# 20. Reconciliation Checkpoints

These are architectural checkpoints, not newly activated canonical gate identifiers.

## Capture exists

Enough evidence exists to begin defining the relevant physical condition.

## Feature identity is known

The system knows what physical surfaces or points the dimension refers to.

## Unit is explicit

No consequential bare numeric dimensions.

## Coverage is sufficient

Required project features have observations or explicit unresolved conditions.

## Internal geometry is plausible

Known observations do not create unexplained geometric contradictions.

## Conflicts are reconciled

Different observations of a controlling feature have not been silently collapsed.

## Evidence is sufficient for the intended use

The source and quality of evidence match the consequence of the downstream operation.

## Holder accepts the project definition

The person controlling the project accepts the presented intent/configuration and applicable controlling information.

## Store accepts dimensional intake

The Store determines that the packet contains enough dimensional information for the service it is being asked to perform.

## Machine-local conditions remain valid

Later execution still depends on actual material, machine, tooling, setup, local authority, and current conditions.

These checkpoints reduce the probability that dimensional error reaches physical work.

They do not claim to eliminate error.

---

# 21. Store Right to Refuse Dimensional Intake

A Store must be able to refuse or defer work when the dimensional burden exceeds the evidence supplied.

Examples:

**Undefined feature** — The number exists, but it is unclear which surfaces it describes.

**Missing unit** — The numerical value is incomplete.

**Missing controlling dimension** — Required feature was never measured.

**Conflicting evidence** — Two consequential measurements disagree and no reconciliation exists.

**Evidence insufficient for tolerance** — Source is appropriate for planning but not for the requested fitted fabrication.

**Stale site condition** — Relevant physical condition may have changed.

**Template mismatch** — Project falls outside the bounded class.

**Unresolved site geometry** — Fit cannot be determined responsibly.

Refusal protects both the customer and the Store.

---

# 22. WorkPacket Intake

The purpose of this boundary is to make a credible WorkPacket possible.

A credible packet should let the receiving Store understand:

- what the holder wants;
- what project class is being used;
- which dimensional information controls the requested work;
- where that information came from;
- what was derived from it;
- what remains unresolved;
- what material requirements follow;
- what manufacturing scope is requested;
- what the packet does **not** claim.

A WorkPacket still does not authorize machine motion.

The Store evaluates it.

---

# 23. What Scan-to-Build Owns Downstream

Once accepted controlling information enters the Scan-to-Build transformation chain, Scan-to-Build is responsible for preserving mathematical and semantic fidelity.

If an accepted value is:

`44.750 in`

and the applicable rule subtracts:

`0.125 in`

the derived result must be mathematically faithful to those inputs and the declared rule.

If units are converted, the conversion must be controlled.

If geometry is transformed between coordinate systems, the transformation must be identified.

If a later machine representation is generated, it must remain traceable to the controlling project requirement.

That is different from claiming that the original `44.750 in` observation was physically correct.

---

# 24. What Scan-to-Build Does Not Own Downstream

This boundary does not establish:

- structural adequacy;
- building-code compliance;
- accuracy of third-party measurement hardware;
- calibration of third-party instruments;
- truth of a user-supplied dimension solely because it was entered;
- future site conditions;
- Store inventory;
- machine calibration;
- production readiness;
- operator competence;
- installation success.

Those responsibilities remain with their applicable actors and systems.

---

# 25. The Store/App Shared Contract

The App and Store see opposite sides of the same dimensional boundary.

## App view

> Help the holder create, inspect, reconcile, and accept enough physical information to describe the project responsibly.

## Store view

> Determine whether the supplied project information is sufficient for the Store service being requested.

The shared contract is:

```text
APP
collects supplied dimensional evidence and presents reconciliation
        ↓
GOVERNED PROJECT RECORD
preserves meaning and provenance
        ↓
STORE
evaluates sufficiency for requested work
```

Neither side invents missing physical truth.

---

# 26. Current Opportunity

The capture market is rapidly improving.

That is favorable to Scan-to-Build.

It means Scan-to-Build does not need to become a scanner company.

Consumer devices can increasingly provide useful spatial context.

Bluetooth laser tools can provide precise direct dimensions with reduced transcription.

Professional systems can already produce high-quality point clouds and fabrication-oriented digital templates.

Scan-to-Build can capitalize on all of them by owning the layer they do not universally solve:

> **the governed promotion of differently sourced physical evidence into a bounded project definition suitable for commercial and manufacturing action.**

Better sensors strengthen this architecture.

They do not obsolete it.

---

# 27. Baseline Rule

The baseline rule is:

> **Scan-to-Build captures customer intent directly. It accepts physical measurements and spatial evidence from identified external sources. It preserves and reconciles those inputs, determines whether the information is sufficient for the requested project path, and faithfully translates accepted information downstream. It does not silently turn an external measurement, scan, drawing, inference, or template value into physical truth.**

And the practical sequence is:

```text
CAPTURE WHAT CAN BE CAPTURED
        ↓
IDENTIFY WHAT ACTUALLY CONTROLS THE JOB
        ↓
MEASURE OR CONFIRM WHAT NEEDS STRONGER EVIDENCE
        ↓
RECONCILE
        ↓
ACCEPT
        ↓
DERIVE
        ↓
SEND A CREDIBLE WORKPACKET
        ↓
LET THE STORE DECIDE WHETHER IT IS GOOD ENOUGH
FOR THE WORK BEING REQUESTED
```

That is the on-ramp from **Scan** to **Build**.
