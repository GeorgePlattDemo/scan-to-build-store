# Project 1 digital manufacturing trail

## D001 reference implementation and Store estimate reconciliation

3D Solutions LLC | Engineering review draft 0.2 | 3 October 2026

**Document identity:** D001 PROJECT1 DIGITAL TRAIL REVIEW 0.2

**Status:** reference engineering prepared for review; not adopted Store capability. Repository identities and the reproduced Store answer are fixed below. The accompanying derivation and virtual motion model were executed locally. TwinCAT source was generated but was not compiled or executed in TwinCAT. No machine was built or commissioned by this work.

## 1 Purpose and finding

This record follows one specified Project 1 revision from a user-defined component requirement through System derivation, Store material and capability evaluation, modeled machine work, Q, local coordinates, and controller-oriented commands. It provides enough numerical and machine-readable detail to inspect what each transformation preserves, what it adds, and where it must stop.

The strongest established result is reproducible: the identified System rule and pinned Store source regenerate the two parts, their feature locations, the selected material, the Store operation plan, and the exact Store calculation identities reported in the preceding draft. The Store returns a modeled budgetary total of $11.09. A separate command generator and virtual kinematic model carry those requirements into explicit axis and tool commands. The resulting record preserves source operation identities.

This is digital evidence of a bounded derivation. It is not proof that the proposed machine can execute the job as drawn. A geometric contact audit identifies one-roller states; the retained-face relationship after kerf removal and the saw downstroke geometry remain unresolved. Physical admission therefore returns BLOCKED and issues no motion.

The architectural proposition is that sufficiently defined demand can enter manufacturing earlier. A person states the desired part through permitted controls; known capability and material information can be brought into that interaction before material is committed. The downstream process receives identified requirements rather than an invitation to design the part again. This specimen tests that proposition without establishing a general economic benefit or universal manufacturing method.

**The user defines the part. System rules derive its requirements. Store facts resolve the material and proposed work. Identified local rules generate the commands. Local release and inspection remain separate acts.**

## 2 What it means for the user to create CAM

For this specimen, changing the permitted part length changes the derived angle and both spot locations. Those values feed the Store plan and the generated motion records. No downstream person re-enters the part length, places the spots by eye, or redraws the component to generate this reference sequence.

The precise claim is that **the user's definition supplies the controlling part requirements from which the bounded CAM sequence is generated**. The user does not supply every manufacturing fact. Stock dimensions, available tooling, station locations, feeds, axis signs, workholding, and calibration are separately identified Store or machine facts. A manufacturing rule may select a route or operation order while preserving the requested result; it may not quietly change that result to make the route possible.

For example, the user's 18-inch part requirement determines a 9-inch center feature under the identified System rule. The Store's 36-inch tooling station makes the nominal positioning target 36 minus 9, or +27 inches. Neither fact alone is a machine command. Their registered combination is.

This record does not demonstrate image-to-geometry inference, measurement verification, free-form design, or an AI making manufacturing decisions at Cycle Start. Project 1 uses a bounded, implemented rule. A later capture method must establish its own admissible definition before the same manufacturing boundary is invoked.

## 3 Sources identities and ownership

| Source | Exact revision or identifier | Use in this record |
| --- | --- | --- |
| System | 1cbee7dd91fa718ae077d0eafe58070d4853d141 | Current rule and canonical number implementation |
| Store consumed by this specimen | 9c62d9d6f7775deef83d47196d32c9b5174a352c | Catalog, envelope, travel rule, evaluator, economics |
| Store main reviewed | 82b6a1b0cc234b69e9afad145e1e2d9c4bc1e557 | Context only; does not replace the consumed pin |
| Program main reviewed | 641c0149909568abc3872c4b7c2fb45592006a68 | Ownership and research context |
| Source draft | D001 PROJECT1 REFERENCE IMPLEMENTATION Q 0.1 | Specified definition revision and preceding reference assumptions |
| New reference package | D001 REFERENCE REVIEW 0.2 | Local derivation, virtual commands, checks and review findings |

Seven downloaded source files were checked against their Git blob identities before execution. The accompanying source-identities.json records each repository revision, path, Git blob identity, and SHA-256 file digest. Sources are copied for this evidence package; neither repository code nor the operational Store pin was changed. [S1–S4]

**Program** owns the research question, rationale, findings, and adoption history. **System** owns the identified job's operational meaning and its derivation rules. **Store** owns its offerings, represented stock, capability, refusal, modeled work, timing, and economics. The **local machine implementation** owns the registered execution configuration, readiness checks, and resulting machine evidence.

The intended custody of this Store-specific specimen is Store reference engineering. That custody is a proposal, not an accomplished repository migration. Program's current authority register assigns local controller and postprocessor engineering to the machine-development program, and Store's current README directs unadmitted candidate engineering to Program. Those statements require an explicit ownership reconciliation before publication in Store. Reference custody, technical adoption, and physical release are distinct. [S4]

Every consequential value has an evidence class: SYSTEM RULE, PINNED STORE FACT, MANUFACTURER DATA, NEW REFERENCE SELECTION, MODELED ASSUMPTION, DERIVED VALUE, EXECUTED SOFTWARE RESULT, or UNRESOLVED. No measured fabrication value is introduced here. Manufacturer capability is not installed-machine performance.

## 4 Architectural provenance

The patent trail supplies context for the integration of customer design choices, pricing, generated instructions, local material processing, and identified components. It does not certify the present software or the proposed controller assembly. The following entries identify engineering correspondence to selected issued limitations; they do not determine legal scope or establish satisfaction of an entire claim. Dependent claims retain their dependencies.

| Issued source | Relevant subject | Correspondence and limit |
| --- | --- | --- |
| US 9,720,401 B2 claim 1 | Customer choices and generated fabrication instructions in a tandem system | This specimen follows the dimensional information path; it does not implement the complete claimed system |
| US 9,720,401 B2 claims 4 and 5 | Dimensional support, fence, servo manipulation, saw and tooling ways | D-001 references these functions; present hardware is a proposed realization |
| US 9,720,401 B2 claims 10 through 13 and 18 | Interface, estimate, acceptance, machining instructions and Store pricing | Definition and estimate are reproduced; order acceptance and machine transmission are not established |
| US 9,720,401 B2 claims 9 and 14 through 16 | Labels, assembly information and post-machining handling | Result and label requirements are specified; no fabricated or labeled component exists |
| US 10,768,609 B2 claims 1 and 3 | Customer project, estimated price and changed requirements | The bounded rule and fresh reevaluation correspond to these information functions |
| US 10,768,609 B2 claims 4 and 5 | Acceptance, material list, machining instructions and loading instructions | Material resolution and review commands exist; accepted production and physical loading are not proved |
| US 10,768,609 B2 claims 6 through 8 and 14 through 15 | Labels, assembly instructions, CAM and operator-directed loading | Reference record follows these subjects; full dependent-claim combinations are not demonstrated |
| US 10,768,609 B2 claim 12 | Estimate based on Store pricing database | Q is reproduced from the pinned modeled Store facts |

The checked claim passages appear in the issued patents' printed columns 41 through 46 for the first patent and 40 through 44 for the second. Figures 1 and 5 and their descriptions provide additional architectural context. A complete legal claim chart is outside this engineering record. [P1, P2]

Beckhoff CX5340, TwinCAT, EtherCAT, AX8000 drives, the selected motor families, the measuring-wheel encoder, the spindle, rack geometry, and the software offset method are present reference selections. This document does not attribute those particular selections to the patents.

## 5 Frozen Project 1 specimen

The source draft identifies definition SYO-USER1-XBRACE-0.1, revision SYO-USER1-XBRACE-0.1-v5, configuration SYO-USER1-XBRACE version 0.2, and rule user1.xbrace/0.1. The rewrite preserves those identifiers. It does not create a new customer confirmation or independently authenticate an archived confirmation event.

| Requirement or derived fact | Value | Basis |
| --- | --- | --- |
| Material demand | syp-treated board, nominal 2 by 4 | Specified specimen; material must be stated |
| Finished parts | PART-1 and PART-2, each 18.000 in | Specified length and two-part rule |
| Fixed horizontal span | 8.000 in | System rule |
| Miter angle magnitude | 26.387799961243 degrees | arcsin of 8 divided by 18 |
| Spot features | SPOT-1 and SPOT-2, each at 9.000 in | Length divided by two |
| Across-width location | Center of wide face | System feature rule |
| Ends and length datum | Parallel face miters; long-long outer edge | System rule |
| Defined workpiece requirement | 60.000 in | System rule; distinct from purchased parent |
| Reference method and counts | REFERENCE_CUT; three saw events; two spots | System rule and identified features |

The implemented length range is 16 through 18 inches in one-eighth-inch increments. Its 17 permitted settings were exercised in this package. Out-of-range and off-grid values are rejected. The 18-inch endpoint has configuration version 0.2; the definition revision v5 is a separate identity. [S1]

The Store inquiry carries materialDemand, identified parts and features, configuration identity, the defined workpiece length, required operations, cut plane, angle, and reference method. It carries no servo counts, rack pitch, PLC axis reference, or physical-release permission. definition-and-demand.json preserves that inquiry and qualifies the provenance of the stated confirmation.

## 6 Store resolution and reproduced answer

The owning Store evaluator examines matching offered material in ascending stock length and accepts the first complete candidate under its declared rules. For this material demand, the selected offering is STB-ZERO-PTAG-2X4-72-001: nominal treated 2 by 4, actual 1.500 by 3.500 inches, 72 inches long, with a $4.90 plausible list reference and a calculated $5.15 selling price. The list reference is a modeled price input, not a newly verified retail observation. Represented on-hand quantities are modeled Store state, not counted inventory. [S2, S3]

Under the Store's nominal 0.125-inch consumption allowance per saw event, two 18-inch parts and three allowances consume 36.375 inches. A hypothetical 60-inch workpiece leaves 23.625 inches, below the declared 24-inch retained-length threshold. The offered 72-inch parent leaves 35.625 inches. This calculation does not rewrite the desired parts.

The 60-inch check is a counterfactual length evaluation supplied for explanation. It is not a claim that the actual treated-material inquiry first encountered an offered 60-inch SKU. The reproduced candidate trace begins with the offered 72-inch parent. Geometric proof of actual roller contact is a separate issue addressed in section 9.

| Reproduced Store output | Value |
| --- | --- |
| Job disposition | SUPPORTABLE under the pinned Stage-2 model |
| Estimate class | BudgetaryEstimate |
| Material selling price | $5.15 |
| Modeled machine service | $5.94 |
| Q | $11.09 |
| Reported modeled job time | 85.5001 s, or 1.4250 min |
| Travel rule | STB-D001-DIMENSIONAL-TRAVEL-0.1 version 0.2.0 |
| Pricing engine | STB-STORE-ZERO-PRICE-1 version 0.3.0 |

Input hash: 30b6c02b11db30cf100be72ea4696c03b8ed7d2f217979c53cdae6ce73325e91

Result hash: de1e0e0bdf0f77a6c5ea205191765ba0b846472fc0813fe71d9ddf28fd176333

Both hashes match the preceding PDF. They identify this calculation under the governing inputs; they do not identify every later receipt or authorize fabrication. The reproduced formal request also carries an evaluation receipt, fixed request identity, represented evaluation time, demand hash, and Store authority. Its timestamp is a reproducibility input, not a representation that the public service was contacted at that time.

## 7 The derivation of Q

Store time is calculated from the declared motion and process model. X uses 8 in/s and 32 in/s squared; Y uses 4 in/s and 16 in/s squared. Stop-to-stop travel is triangular when distance is no greater than velocity squared divided by acceleration; otherwise it is trapezoidal. The corresponding times are twice the square root of distance divided by acceleration, or distance divided by velocity plus velocity divided by acceleration.

The saw model uses 20-inch diameter, 1,800 rpm, 80 teeth, 0.003 in/tooth, and a 0.5 finish factor. Modeled feed is 216 in/min. Each Store saw event includes its declared deploy and retract allowances. The spot model uses a 3/16-inch tool, 3,000 rpm, 0.008 in/rev, a 118-degree point, and 3/16-inch full-diameter depth after the point. Point length is approximately 0.056331 inch; total penetration is approximately 0.243831 inch. These are declared process assumptions, not a cutting trial or a tool manufacturer's approved treated-lumber recipe. [S2]

| Store occupied-time segment | Seconds reported by the evaluator |
| --- | --- |
| Load and seat | 36.0000 |
| Reference saw event | 3.0853 |
| Four X positioning moves | 12.2500 |
| Two subsequent saw events | 6.1706 |
| Two spot events including Store placement charges | 3.9942 |
| Release and label | 24.0000 |
| Total from internal precision | 85.5001 |

Displayed segment rounding can differ from rounding the internal total. Pricing uses internal calculations rather than a manual sum of rounded display values.

The pinned annual cost pool is already itemized. It is a declared Store scenario, not an independently obtained construction or operating quotation.

| Annual modeled cost category | USD |
| --- | --- |
| Operator burden | 50,000 |
| Capital recovery | 25,000 |
| Facility insurance and administration | 20,000 |
| Maintenance and tooling | 15,000 |
| Energy dust and information technology | 10,000 |
| Total | 120,000 |

At 600 forecast productive hours, modeled break-even cost is $200/h. With a 20 percent target gross margin, sell rate is 200 divided by 0.8, or $250/h. This is a margin calculation, distinct from the five percent material mark-on. Machine service is approximately 85.500065 divided by 3,600 times 250, rounded to $5.94. Q is $5.15 plus $5.94, or $11.09. There is no separate setup charge. [S2]

| Productive hours per year | Same-pool sell rate per hour | Service for this Store time |
| --- | --- | --- |
| 300 | $500.00 | $11.88 |
| 600 | $250.00 | $5.94 |
| 900 | $166.67 | $3.96 |
| 1,200 | $125.00 | $2.97 |

The sensitivity calculation changes only productive hours. It is not a revised Store answer. To establish reference-machine ownership economics independently, procurement, installation, depreciation or capital recovery, utilization, labor occupancy, maintenance, tooling, power, dust collection, and premises must be reconciled to these categories. Unknown prices remain unknown; the selected hardware does not itself substantiate the $25,000 capital-recovery allowance.

## 8 Manufacturing meaning and local coordinates

The component requirements are two identified parallel-ended miter parts with center spots. Their neutral manufacturing meaning consists of material identity, finished dimensions, feature identity and location, required operation, orientation, and dependency. Store resolution adds the selected parent and an evaluated route. Local lowering adds station coordinates, signs, tool geometry, motion limits, and command order.

manufacturing-requirements.json records the resolved material and component requirements without servo coordinates. This package uses the current Store operationPlan as its numerical route source. The neutral requirements record, local job, and motion IR are new review artifacts; the rewrite does not claim that a general machine-neutral compiler or these schemas already form an adopted repository interface. The Store operation plan already contains D-001 station-specific information.

| Reference | Nominal meaning |
| --- | --- |
| Datum A | Fixed fence, Y equals 0 |
| Datum B | Support plane, Z equals 0 |
| Datum C | Longitudinal workpiece origin established by a declared reference event |
| SAW-L | X equals 0; modeled miter station |
| SPOT-FACE-REF | X equals 36; wide-face spot station |
| R1 and R2 | X equals 24 and 48 respectively |
| M1 | New measuring-wheel selection at nominal X equals 30 |

For a feature at longitudinal workpiece coordinate x, nominal alignment is C equals station X minus x. Part 2's start is 18 plus 0.125, or 18.125 inches, under the current consumption convention. Its spot is therefore at workpiece coordinate 27.125 inches.

| Source requirement | Nominal local transform | Controller-oriented act |
| --- | --- | --- |
| Common miter magnitude | +26.387799961243 degrees in the virtual convention | Position A before saw events |
| Part 1 spot at 9.000 | 36 minus 9 equals C +27.000 | Move workpiece axis then verify position |
| Part 2 spot at 9.000 | 36 minus 27.125 equals C +8.875 | Move workpiece axis then verify position |
| Wide-face center | 3.5 divided by 2 equals Y +1.750 | Position Y |
| Spot depth | Top Z 1.500 minus 0.243831 equals Z 1.256169 | Approach plunge and retract |
| Part 1 cutoff | 0 minus 18 equals C -18.000 | Position then saw cycle |
| Part 2 cutoff after nominal rebase | C -18.000 | Position then saw cycle |

The digital forward check verifies that each nominal spot target plus its workpiece feature coordinate equals station X 36. The commanded angles and cutoff positions remain subject to the face and kerf conventions below. A positive angle in this virtual model does not establish the installed saw's signed angle or retained side.

## 9 Physical realization gaps exposed by the model

**Contact is not proved by remainder length.** At a nominal C position, the retained stock occupies the interval from C to C plus remaining length. A station lies over that interval only when its coordinate falls inside both limits. Point contact in this calculation is a screening test, not a complete roller engagement, pressure, or traction analysis.

| Operation state before cutoff consumption | C in | Remaining in | R1 | M1 | R2 |
| --- | --- | --- | --- | --- | --- |
| After reference allowance | 0.000 | 71.875 | Yes | Yes | Yes |
| Part 1 spot | +27.000 | 71.875 | No | Yes | Yes |
| Part 2 spot | +8.875 | 71.875 | Yes | Yes | Yes |
| Part 1 cutoff | -18.000 | 71.875 | Yes | Yes | Yes |
| Part 2 cutoff | -18.000 | 53.750 | Yes | Yes | No |

The current envelope leaves short-part operation on one roller unresolved. The current travel calculation's retained-length criterion does not establish two-roller contact at all these positions. A declared one-roller mode with adequate guidance and workholding, a different station arrangement, or a different valid sequence would require specific engineering and Store adoption. This draft selects none silently. [S2, S3]

**Kerf and rebasing need a physical face definition.** The current plan treats kerf as longitudinal consumption and resets nominal C to zero after a cutoff. If the finished component's cut face is at saw X zero and the retained face lies 0.125 inch beyond it, relabeling the axis does not move that retained face to zero. In that convention, a continuous master at -18 would require a new offset of -18.125 to represent the retained face at +0.125. Capturing -18 as zero would erase the separation in the bookkeeping. This conditional example identifies the missing registration rule; it does not adopt a corrected cut geometry.

Define the selected face, blade-normal kerf, its longitudinal projection, angle sign, pivot and blade offsets, and long-long datum together. A drawing and verified transform must reconcile them before the cutoff coordinates can be called physically complete. The initial reference cut also needs sufficient cleanup allowance for the incoming end geometry; one nominal kerf is not necessarily a complete miter cleanup allowance.

**Saw cutting span is not necessarily downstroke travel.** The inherited reference calculation uses 3.5 divided by cosine of the miter angle, approximately 3.907094 inches. That span may inform a cutting model, but a downstroke axis needs the actual blade sweep, arbor path, stock height, approach clearance, and required overtravel. No dimensioned assembly establishes that conversion here. The virtual S axis retains it only as a named benchmark assumption.

These findings limit physical realization, not the reproducibility of the Store calculation. A SUPPORTABLE answer under a declared Stage-2 model remains exactly that answer; it cannot become a physical release by omitting discovered uncertainties.

## 10 Commercial control and component reference

The control path uses ordinary industrial technology: IEC 61131-3 Structured Text, TwinCAT 3 PLC and NC point-to-point motion, the Tc2_MC2 library, EtherCAT, and AX8000 drives. Beckhoff documents PLCopen-compliant function blocks for this motion environment. No new servo-control language is required. [M1, M2, M10]

| Function | Selected commercial reference | Quantity or scope | Selection status |
| --- | --- | --- | --- |
| PLC and motion computer | Beckhoff CX5340-0195 | 1 | Manufacturer-listed Windows 10 IoT and TwinCAT runtime variant; licenses separate |
| PLC and NC software | TwinCAT TC1250 at platform level 50 | 1 license basis | PLC and NC PTP 10 reference; exact order code and build to freeze |
| Servo power | Beckhoff AX8620-0000-0000 | 1 | 20 A DC-link reference on three-phase supply; load analysis open |
| Servo channels | Beckhoff AX8206-0200-0000 | 4 dual-axis modules for full reference allocation | 6 A rated and 20 A peak per channel; Safe Motion variant |
| Feed motors | Beckhoff AM8042 E-winding family | 2 | 4.10 Nm standstill and 3.90 Nm rated class; exact shaft feedback and brake options to freeze |
| Tool and saw-position motors | Beckhoff AM8031 C-winding family | 6 for Y Z A-L S-L A-R S-R | Candidate class; gravity axes require brake and load review |
| Independent length feedback | SICK MWS120-12M3AC03600 | 1 | SSI measuring wheel; 200 mm circumference, 3,600 steps/rev |
| Encoder input | Beckhoff EL5001 | 1 plus pivot-feedback channels when specified | SSI interface; encoder format and wiring must match |
| Spot spindle | Nakanishi EMS-3060K code 7862 | 1 | Listed spindle; separate collet and motor cord required |
| Spot spindle controller | Nakanishi E3000 code 8422 | 1 candidate 200 V version | External control and monitoring available; interface and air service open |
| Saw motor | ABB Baldor EM3615T-G | 2 for full D-001 reference | Listed 5 HP three-phase motor; 1,755 rpm nameplate differs from modeled 1,800 rpm |
| Safety logic and I O | Beckhoff EL6910 EL1904 EL2904 | Channel count to determine | Commercial safety components; no validated safety project |
| Pneumatic supply isolation | Festo MS6-SV-1/2-E-10V24-SO-AG 548717 | 1 candidate | Manufacturer-listed exhaust and start-prevention functions |

The selected CX5340 is platform level 50 and includes its runtime without licenses. TC1250 supplies the PLC and NC PTP 10 reference; license platform and virtual-axis counting must be confirmed for the final project. Job 1 uses six physical motion axes plus one virtual master. The full eight-physical-axis reference has nine NC objects if the virtual master is counted. The two saw spindle motors are separate from the servo-axis channel allocation. [M1, M2, M10]

At a nominal four-inch feed roller, 480 in/min corresponds to approximately 38.20 rpm. The AM8042 E-winding rated torque gives about 76.8 N of ideal tangential force per roller at a two-inch radius, before transmission and traction losses. That establishes a commercial motor class for investigation; it does not size the feed system or prove one-roller control. Motor low-speed thermal duty, inertias, board forces, preload, bearings, and friction remain design inputs. [M4]

The prior rack example uses module 1.5 and a 20-tooth pinion, yielding approximately 94.2478 mm per revolution. A 150 mm sector radius yields 36 degrees per pinion revolution. These are mechanism assumptions, not purchased assemblies or checked axis sizing. Linear rails, racks, pinions, supports, arbor and spindle bearings, couplings, preload mechanisms, guards, stock supports, clamps, and collection provisions still need compatible mechanical selections.

The blade ordering code is unresolved. The preceding draft's listed blade had a wider kerf than the Store model. No compliant replacement was verified here. Supply circuits, disconnects, protection, contactors or drives for saw motors, terminals, cabling, enclosure cooling, motor cords, 24 V load budget, filters, air regulation, and extraction must also be specified. Their quantities and prices are not invented. This is a functional component register, not a procurement-ready complete BOM. [M3–M9]

## 11 Command generation and controller semantics

The executable reference path is:

**Specified definition → implemented System rule → bounded Store inquiry → pinned Store evaluator → identified Store operation plan → review local job → 45-command virtual IR → generated Structured Text data and reference interpreter.**

The generator verifies the demand hash, pinned Store identity, and reproduced result identity before lowering. Changed demand cannot reuse the preceding answer. The reference artifacts identify their units, version, Store source, and source operation. All physical-authority fields remain false.

Controller source uses MC_Power for axis readiness, MC_GearIn for master-slave coupling, MC_MoveAbsolute for point-to-point moves, and MC_Stop for the virtual abort path. The interpreter calls blocks cyclically, uses an explicit low Execute phase before a new move, latches command inputs, and waits for terminal outcomes. Angle completion is represented by completion of its positioning command; an installed implementation additionally needs a persistent, invalidatable pivot-angle validation and clamp state. A transient Done output is not a permanent permission. [M2]

The workpiece master remains continuous. Nominal local C is master position minus a software offset; a local target becomes offset plus target C. Neither operation needs to reset a servo encoder. The generated nominal rebase retains the Store plan's convention for comparison and is explicitly blocked from physical use pending the retained-face transform.

The complete generated data and interpreter source are included in the companion evidence package. The following is the essential command boundary; it is a source excerpt, not a separately compiled program:

```text
IF Command.Kind = 2 THEN
    Target := CZero + Command.Target;
END_IF;
AxisMove[Selected](Axis := Axes[Selected],
    Start := StartMove[Selected], Position := Target,
    Velocity := Command.Velocity,
    Acceleration := Command.Acceleration);
```

ReferenceIR is emitted as an array of typed command records. The table below lists its entire specimen sequence. X and Z coordinates are inches; A is degrees; delays are seconds. All saw S distances are virtual benchmark coordinates, not validated machine stroke settings.

| Sequence | Generated command | Target or meaning |
| --- | --- | --- |
| 1 | DELAY | Load and seat 36 s |
| 2 | MOVE A | +26.387799961243 |
| 3 and 4 | DELAY | Angle settle 0.100 s and clamp allowance 0.250 s |
| 5 through 10 | SET SAW then MOVE S then DELAY then SET SAW | On; S 1.500; S 5.407094 at process feed; S 0; 0.050 s; off |
| 11 | CAPTURE C | Nominal software offset; 0.010 s |
| 12 and 13 | MOVE C then VERIFY X | +27.000; validation allowance 0.050 s |
| 14 through 16 | MOVE Y then SET SPOT then DELAY | Y 1.750; spindle on; readiness allowance 0.500 s |
| 17 through 19 | MOVE Z | 1.500 approach; 1.256169 penetration; 1.750 retract |
| 20 and 21 | MOVE C then VERIFY X | +8.875; validation allowance 0.050 s |
| 22 through 24 | MOVE Z | 1.500; 1.256169; 1.750 |
| 25 and 26 | MOVE C then VERIFY X | -18.000; validation allowance 0.050 s |
| 27 through 32 | SET SAW then MOVE S then DELAY then SET SAW | Same saw expansion as 5 through 10 |
| 33 | CAPTURE C | Nominal rebase; 0.010 s |
| 34 and 35 | MOVE C then VERIFY X | -18.000; validation allowance 0.050 s |
| 36 through 41 | SET SAW then MOVE S then DELAY then SET SAW | Same saw expansion as 5 through 10 |
| 42 and 43 | CAPTURE C then SET SPOT | Nominal rebase 0.010 s; spindle off |
| 44 and 45 | DELAY then COMPLETE | Release and label 24 s; virtual result |

X uses 8 in/s and acceleration 32 in/s squared. Y uses 4 and 16. Virtual A uses 30 deg/s and acceleration 120 deg/s squared. Virtual S uses rapid velocity 6 in/s, process velocity 3.6 in/s, and acceleration 24 in/s squared. Z uses rapid velocity 2 in/s, process velocity 0.4 in/s, and acceleration 16 in/s squared. Rapid Z starts and ends at 1.750 inches. These conventions are emitted in motion-ir.json; the reader need not infer them from a picture.

The Structured Text interpreter is restricted by default-false virtual-project and identity inputs; its tool commands are diagnostic variables with no physical I/O mapping. It is not a machine safety controller. The Node model executes the IR; it does not execute this Structured Text or emulate EtherCAT, TwinCAT task scheduling, drive following error, or safety behavior. Vendor compilation, library compatibility, the virtual test project, timers, feedback linkage, coupling faults, and recovery lifecycle still require controller testing.

## 12 Executed digital evidence and timing reconciliation

The companion reproduce.mjs was executed using Node 24.19.0. The repository's documented Node 22 suite was not rerun as part of this reference package. Fourteen local proof checks passed, including exact source identity, endpoint derivation, the counterfactual retained-length refusal, all 17 admitted settings, forward nominal spot alignment, stale-answer rejection, altered-result rejection, modeled identity and position faults, contact-gap detection, the finite-kerf check, and blocked physical admission.

The virtual execution contains 45 records and 21 axis moves. It applies acceleration-limited stop-to-stop timing to each modeled move and retains source identities in virtual-trace.json. A tool-down X index is rejected by the model. Fault injections end the model before the following tool or index command; these checks do not validate physical stopping distance or the Structured Text runtime.

| Timing record | Seconds | Evidence meaning |
| --- | --- | --- |
| Pinned Store reported time | 85.5001 | Reproduced governing Store output |
| Preceding draft reference time | 86.419536 | Historical draft calculation |
| Current virtual benchmark | 86.469536 | Executed reference IR model with plunge acceleration |
| Current benchmark minus Store report | +0.969436 | Difference between related models |

The 0.050-second increase over the preceding reference calculation is two 0.025-second acceleration contributions on the spot process plunges. The current benchmark otherwise retains the prior reference assumptions. It includes one Y placement, angle motion and allowances, four X validation allowances, and nominal rebase bookkeeping. It inherits the Store's 60 seconds of load and release time, major travel limits, and process-feed inputs. Saw spindle-start timing is not separately modeled; readiness is assumed within the inherited sequence. PLC scan and communication latency are not included.

The proximity of these times establishes numerical reconciliation under shared assumptions. It does not independently validate the physical cell cycle. The saw stroke and contact gaps prevent calling this benchmark a physically feasible production schedule. At the same $250/h rate the virtual time gives about $6.00 service and $11.15 total; that is a reference economic comparison, not another Store Q.

## 13 Release inspection and the resulting record

An executable field system would admit a job only after checking definition revision, Store result, machine configuration, lowering version, released material, installed tooling, calibration identity, and local permissions. Hash equality detects a different calculation; it is not authentication, a signature, or a safety release. A changed requirement requires a new Store inquiry and new downstream artifacts.

An interruption that can invalidate stock position invalidates Datum C and dependent position permissions. A reset must not silently resume from the last software state. The recovery record must state the affected part, established material condition, renewed reference event, permitted restart point, and any material or time consequence. None of these permissions is issued by the current application.

| Commissioning or acceptance question | Evidence required | Consequence if unresolved |
| --- | --- | --- |
| Are the datums and station transforms correct | Dimensioned registration drawing and checked signed transforms including blade faces | No physical coordinate release |
| Is the stock controlled at every operation | Contact and clamp design followed by traction and workholding tests | No affected motion or tool permission |
| Does the selected tooling satisfy the modeled operation | Exact blade and bit data; measured kerf; speed and feed trials | Reevaluate capability time and material consumption |
| Does the controller execute the intended lifecycle | Frozen XAE runtime library versions; compile log; virtual-axis traces and fault tests | No controller readiness claim |
| Does the cell meet its safety requirements | Risk-derived safety functions and validated stopping holding isolation and restart behavior | No commissioned physical release |
| Do the parts conform | Inspection method and accepted tolerances for length angle spot location and depth | No conforming-part claim |
| Does the timing support the rate | Measured occupied-time study and reconciled ownership cost model | Retain declared reference economics |

Acceptance criteria need identified tolerances, instruments, uncertainty, sample conditions, and responsible approval. The System's decimals and the encoder's resolution are not manufacturing tolerances. Proposed tolerances may be modeled for development but must not be represented as accepted customer or commissioned capability facts.

The result record connects job and feature identities, Store pin and calculation identity, machine and calibration identities, lowering and controller-source identities, actual execution class, material parent and remainder, faults, inspection results, labels, and custody. This package provides modeled result and refusal records only. It contains no measured conformance or labeled physical output.

## 14 Review conclusion and adoption boundary

This specimen establishes that the stated Project 1 requirements can drive a reproducible Store evaluation and a generated controller-oriented reference sequence without a second design entry. The exact Store answer is reproduced; source and transformation records are inspectable; changed definitions and invalid identities are tested; the physical boundary remains closed.

The work is more specific than an architectural aspiration because its quantities, rule source, Store source, hashes, commands, computations, and failures can be rerun. Its defensibility depends on retaining the discovered limits. It does not establish a complete physical implementation, compiled controller, commissioned safety system, real inventory, binding quotation, or general market result.

The next digital closeout is a registered face and kerf model, a declared control solution for the one-roller states, verified saw stroke geometry, and a compiled virtual TwinCAT project exercising the same identified commands. Physical calibration, workholding, process, inspection, and safety tests follow under their own authority. A later adoption changes identified capability or economics deliberately; it does not rewrite the historical $11.09 result.

Within that boundary, the demand-as-architecture question is concrete: can the requested result remain controlling while each downstream owner contributes only the facts it owns? Project 1 supplies a reproducible specimen of that information discipline. Extending it requires a materially different job through the same boundary, with its own proof and refusals.

**NO BLOOD ON WOOD.**

## Appendix A Reproduction and evidence inventory

Extract D001_Project1_Evidence.zip and run the following from its root with Node 22 or later:

```text
node reproduce.mjs
```

The delivered run used Node 24.19.0. This command verifies the seven source blobs, reevaluates the Store, regenerates the local job and IR, executes the virtual model, and runs the fourteen reference checks. It writes generated artifacts in the extracted package. It never connects to a machine or the public Store service.

| Artifact | Purpose |
| --- | --- |
| source-identities.json | Exact repository source paths revisions and file identities |
| system-source and store-source | Seven original source bodies used by the reproduction |
| reproduce.mjs | Reference derivation generator model and executable checks |
| generated/definition-and-demand.json | Specified definition identity and full Store inquiry |
| generated/store-answer.json | Full reproduced Store answer and evaluation receipt |
| generated/manufacturing-requirements.json | Resolved material and component requirements without servo coordinates |
| generated/hypothetical-60-in-check.json | Qualified counterfactual refusal calculation |
| generated/local-job.json | Source-linked route contact audit and release blockers |
| generated/motion-ir.json | All 45 explicit virtual commands with units and sources |
| generated/Job1_Data.st | Generated Structured Text command records and identities |
| Controller_Reference.st | Uncompiled virtual-only interpreter using vendor primitives |
| generated/virtual-trace.json | All virtual events positions durations and source identities |
| generated/physical-admission.json | BLOCKED record with zero physical motion |
| generated/proof-results.json | Fourteen local checks and their stated scope |
| generated/review-summary.json | Store and virtual timings economics and comparisons |
| MANIFEST.json | SHA-256 identities of delivered evidence files |

The manuscript is included as document-source.md for machine reading. The Word document is the review presentation. Regeneration is local reference work; it is not a Store adoption or a physical release.

## Appendix B Sources

Repository references are immutable source identities. Manufacturer references were checked for this rewrite; their listings are specifications, not procurement quotations. P1 and P2 were checked against issued-patent PDF copies supplied in the user's files.

[S1] System rule at 1cbee7dd91fa718ae077d0eafe58070d4853d141: https://github.com/GeorgePlattDemo/scan-to-build-system/blob/1cbee7dd91fa718ae077d0eafe58070d4853d141/apps/stb/shared/user1-xbrace-rule.mjs

[S2] Store travel rule at 9c62d9d6f7775deef83d47196d32c9b5174a352c: https://github.com/GeorgePlattDemo/scan-to-build-store/blob/9c62d9d6f7775deef83d47196d32c9b5174a352c/d001-travel-standard.mjs

[S3] Store evaluator catalog pricing and D-001 envelope at the same pin: https://github.com/GeorgePlattDemo/scan-to-build-store/tree/9c62d9d6f7775deef83d47196d32c9b5174a352c

[S4] Program authority register: https://github.com/GeorgePlattDemo/3d-solutions-program/blob/641c0149909568abc3872c4b7c2fb45592006a68/governance/authority.md

[P1] US 9,720,401 B2, issued 1 August 2017, claims and Figures 1 and 5: https://patents.google.com/patent/US9720401B2/en

[P2] US 10,768,609 B2, issued 8 September 2020, claims and Figures 1 and 5: https://patents.google.com/patent/US10768609B2/en

[M1] Beckhoff CX5340 technical and ordering data: https://www.beckhoff.com/en-en/products/ipc/embedded-pcs/cx5300-intel-atom-r-x6/cx5340.html

[M2] Beckhoff Tc2_MC2 general rules; MC_MoveAbsolute; MC_GearIn; MC_Stop: https://infosys.beckhoff.com/content/1033/tcplclib_tc2_mc2/70043531.html ; https://infosys.beckhoff.com/content/1033/tcplclib_tc2_mc2/70094731.html ; https://infosys.beckhoff.com/content/1033/tcplclib_tc2_mc2/70123403.html ; https://infosys.beckhoff.com/content/1033/tcplclib_tc2_mc2/70108555.html

[M3] Beckhoff AX8620 and AX8206: https://www.beckhoff.com/en-us/products/motion/servo-drives/ax8000-multi-axis-servo-system/ax8620.html ; https://www.beckhoff.com/en-en/products/motion/servo-drives/ax8000-multi-axis-servo-system/ax8206.html

[M4] Beckhoff AM8042 E-winding and AM8031 C-winding data: https://www.beckhoff.com/en-za/products/motion/rotary-servomotors/am8000-servomotors/am8042-weyz.html ; https://www.beckhoff.com/ja-jp/products/motion/rotary-servomotors/am8000-servomotors/am8031-wcyz.html

[M5] SICK MWS120-12M3AC03600 manufacturer data sheet: https://www.sick.com/media/pdf/6/96/396/dataSheet_MWS120-12M3AC03600_p660396_en.pdf

[M6] Beckhoff EL5001 SSI interface: https://www.beckhoff.com/en-en/products/i-o/ethercat-terminals/el-ed5xxx-position-measurement/el5001.html

[M7] Nakanishi EMS-3060K and E3000 controller: https://en.nakanishi-spindle.com/product/ems-3060k/ ; https://en.nakanishi-spindle.com/product/e3000-controller/

[M8] ABB Baldor EM3615T-G manufacturer information packet: https://www.baldor.com/api/products/EM3615T-G/infopacket

[M9] Beckhoff TwinSAFE and Festo 548717: https://www.beckhoff.com/en-en/products/automation/twinsafe/twinsafe-hardware/el6910.html ; https://www.beckhoff.com/en-en/products/i-o/ethercat-terminals/elx9xx-twinsafe/tabular-product-overview/ ; https://ftp.festo.com/Public/PNEUMATIC/SOFTWARE_SERVICE/DataSheet/548717.html

[M10] Beckhoff TC1250 PLC and NC PTP 10: https://www.beckhoff.com/en-us/products/automation/twincat/tcxxxx-twincat-3-base/tc1250.html

## Appendix C Transaction and custody sequence

This appendix makes the information handoffs explicit. It distinguishes the executed specimen from the record requirements of a future operational transaction. H01 through H12 are review identifiers introduced here; they are not adopted repository event types. A specified field or gate is a review requirement unless the evidence column identifies its execution in this package.

A handoff is complete only when the receiving owner can identify the exact object received, check its admissibility, and record its disposition. Sending a value is insufficient. Receipt, acceptance of its meaning, and permission to act are separate events. A receiver must preserve refusal and uncertainty with the same identity discipline as a favorable answer.

| Handoff | Sender and receiver | Payload and receiving check |
| --- | --- | --- |
| H01 Source to definition | User to System | Source material and entered requirements; separate supplied observations from controlling confirmed facts |
| H02 Definition to derivation | System definition custody to System rule | Definition revision, configuration, rule and material demand; reject missing, out-of-range or off-grid controlling values |
| H03 Derivation to inquiry | System to Store | Identified parts, features and required operations; Store must receive requirements rather than implied machine permission |
| H04 Inquiry to evaluation | Store inquiry custody to pinned evaluator | Demand identity, catalog, capability and economics; evaluate the whole request under one exact Store version |
| H05 Answer to job custody | Store to System | Exact disposition, receipt, selected material, operation plan, time and Q; preserve the answer without local substitution |
| H06 Answer to customer decision | System to user | Same identified answer and its limits; distinguish choice, estimate and production permission |
| H07 Decision to order record | User to consequential record | Decision tied to definition and Store result; a changed requirement returns to fresh evaluation |
| H08 Order to local planning | Released transaction to local implementation | Selected material, requirements and identified route; bind lowering to registered machine facts |
| H09 Local planning to admission | Local planner to local release authority | Exact command artifact and configuration; check unresolved geometry, material, tooling and permission before motion |
| H10 Admission to execution | Local authority to controller | Permitted job and configuration; controller verifies readiness and invalidates dependent permissions on faults |
| H11 Execution to inspection | Controller and operator to inspection custody | Result, faults, consumed parent, retained stock and feature identities; inspect against the same definition revision |
| H12 Inspection to handoff | Inspection custody to customer record | Conformance disposition and component identities; distinguish completion from acceptance and preserve nonconformance |

**H01 and H02: establish meaning before evaluation.** The source PDF supplies the specimen revision. This package reproduces its implemented derivation; it does not authenticate a live user's confirmation. An operational record would retain the supplied source identity, the values actually confirmed, the confirmer's identity and event, and the controlling revision. Unconfirmed source measurements must not silently become approved dimensional facts. The numerical checks here establish the bounded rule's response to the specified values.

**H03 and H04: submit and evaluate one request.** The material demand and required features are carried together. A receiving Store must not infer an omitted material species or treat a missing feature as permission to omit it. The pinned evaluator supplies its own answer under its declared facts. The package's request time is a fixed reproduction input. It is not proof of a live inventory observation, remote submission, or a current commercial offer. The exact request and answer are retained in separate generated files.

**H05: preserve Store meaning on receipt.** The receiver checks that the answer belongs to the identified demand and Store pin. SUPPORTABLE means supportable under that Store model. It does not mean the local machine has been commissioned or that the customer has ordered. An incompatible or altered answer must not be displayed as the answer to this job. The local reproduction checks demand and result identities; it does not exercise every public application's custody, quarantine or refusal path. Those application properties need their own exact proof rows.

**H06 and H07: record the customer's call without creating machine authority.** An operational decision record would identify whether the customer accepted, declined, deferred or requested a revision, and which answer was presented. It would distinguish budgetary estimate from binding terms, and simulated acceptance from a real transaction. This package contains no real payment, reservation, order acceptance, allocation or customer decision event. A later revision must preserve the preceding answer as historical evidence and obtain a fresh evaluation for the revised demand.

**H08: lower without redesigning.** Local planning receives the two 18-inch parts and identified center features. It adds registered station locations, signs, tools and motion rules. The generated artifact must state which values it preserved and which local facts it introduced. Here, the manufacturing requirements, local job, IR and command data make that separation inspectable. Their schemas are review artifacts. An operational implementation would freeze and validate the adopted schema and generator version before using it as an interface.

**H09 and H10: admit separately from generating.** A generated command is a proposed act, not permission to perform it. Admission must bind the job to the actual machine configuration, material and tooling; verify the applicable releases; and reject unresolved prerequisites. This package records physical admission as BLOCKED. Its virtual interpreter has no mapped physical outputs. An installed controller would require commissioned readiness and safety behavior in addition to identity checking. None is supplied by a Store price or a hash.

**H11 and H12: close the requirement with evidence.** A controller's successful completion reports its program outcome. Inspection establishes whether the resulting part conforms to the identified requirement within accepted tolerances. An operational result must distinguish uninspected, conforming, nonconforming and dispositioned output. Labeling would connect the physical component to that result and its assembly destination. The present package has virtual completion and blocked physical admission only; it contains no measured component or physical customer handoff.

## Appendix D Complete virtual command ledger

This ledger expands every generated record in order. It is read with the units and dynamic limits in section 11. MOVE targets are absolute axis positions; MOVE_C targets are nominal local workpiece coordinates transformed through the software offset. DELAY values are seconds. SET values of 1 and 0 mean modeled on and off. CAPTURE_C is nominal offset bookkeeping. The complete machine-readable precision is retained in motion-ir.json.

Completion of each record precedes admission of the next record in the reference interpreter. That sequencing statement does not validate the underlying physical permission. In particular, the saw stroke and nominal face capture remain unresolved and physical admission remains closed. SET_SAW and SET_SPOT change diagnostic variables; they do not energize a tool.

| Record | Command and target | Source requirement or operation |
| --- | --- | --- |
| 01 | DELAY 36 | STORE_HANDLING_LOAD |
| 02 | MOVE A 26.387799961243 | DEFINITION_ANGLE |
| 03 | DELAY 0.1 | REFERENCE_ANGLE_SETTLE |
| 04 | DELAY 0.25 | REFERENCE_CLAMP |
| 05 | SET_SAW 1 | OP-REF-CUT |
| 06 | MOVE S 1.5 | OP-REF-CUT |
| 07 | MOVE S 5.40709413956 | OP-REF-CUT |
| 08 | MOVE S 0 | OP-REF-CUT |
| 09 | DELAY 0.05 | OP-REF-CUT |
| 10 | SET_SAW 0 | OP-REF-CUT |
| 11 | CAPTURE_C 0 | OP-REF-CUT |
| 12 | MOVE_C X 27 | OP-INDEX-2 |
| 13 | VERIFY_X 27 | OP-INDEX-2 |
| 14 | MOVE Y 1.75 | SPOT-1 |
| 15 | SET_SPOT 1 | SPOT-1 |
| 16 | DELAY 0.5 | SPOT-1 |
| 17 | MOVE Z 1.5 | SPOT-1 |
| 18 | MOVE Z 1.256169316966 | SPOT-1 |
| 19 | MOVE Z 1.75 | SPOT-1 |
| 20 | MOVE_C X 8.875 | OP-INDEX-4 |
| 21 | VERIFY_X 8.875 | OP-INDEX-4 |
| 22 | MOVE Z 1.5 | SPOT-2 |
| 23 | MOVE Z 1.256169316966 | SPOT-2 |
| 24 | MOVE Z 1.75 | SPOT-2 |
| 25 | MOVE_C X -18 | OP-INDEX-CUT-1 |
| 26 | VERIFY_X -18 | OP-INDEX-CUT-1 |
| 27 | SET_SAW 1 | OP-CUTOFF-1 |
| 28 | MOVE S 1.5 | OP-CUTOFF-1 |
| 29 | MOVE S 5.40709413956 | OP-CUTOFF-1 |
| 30 | MOVE S 0 | OP-CUTOFF-1 |
| 31 | DELAY 0.05 | OP-CUTOFF-1 |
| 32 | SET_SAW 0 | OP-CUTOFF-1 |
| 33 | CAPTURE_C 0 | OP-REBASE-C-1 |
| 34 | MOVE_C X -18 | OP-INDEX-CUT-2 |
| 35 | VERIFY_X -18 | OP-INDEX-CUT-2 |
| 36 | SET_SAW 1 | OP-CUTOFF-2 |
| 37 | MOVE S 1.5 | OP-CUTOFF-2 |
| 38 | MOVE S 5.40709413956 | OP-CUTOFF-2 |
| 39 | MOVE S 0 | OP-CUTOFF-2 |
| 40 | DELAY 0.05 | OP-CUTOFF-2 |
| 41 | SET_SAW 0 | OP-CUTOFF-2 |
| 42 | CAPTURE_C 0 | OP-REBASE-C-2 |
| 43 | SET_SPOT 0 | REFERENCE_END |
| 44 | DELAY 24 | STORE_HANDLING_RELEASE |
| 45 | COMPLETE 0 | REFERENCE_END |

**Records 01 through 11 establish the nominal reference.** Load and seating occupy a modeled 36 seconds. Angle positioning, settling and clamp allowance precede the reference saw expansion. The virtual S axis approaches, plunges and retracts. The modeled tool is switched off before the nominal offset is captured. The delay and capture values are modeled allowances; they are not sensed proof of clamp force, blade clearance or a retained-face datum.

**Records 12 through 24 create both spots before separation.** Each X target has its own verification record. Y is placed once and retained for the second spot. The spindle has one modeled startup allowance. Each spot has an approach, process plunge and retract. A proposed installed sequence would require valid position, workholding and spindle-ready conditions at each plunge. The reference model rejects an index when Z has not retracted; its fault check demonstrates the model's sequencing response, not a physical interlock.

**Records 25 through 42 separate the parts.** Each cutoff is preceded by an X index and verification. Each saw expansion repeats all six records; no repeated block is omitted from the ledger. The nominal offset is recaptured after each separation. This is where physical blade-face and retained-face registration must be resolved. The current convention is preserved to reconcile the Store plan, and is explicitly excluded from physical release.

**Records 43 through 45 close the virtual job.** The spot diagnostic is switched off, the modeled release-and-label allowance is applied, and COMPLETE is recorded. Completion produces no conformance finding, material label or customer receipt. Those require their own evidence and custody events.

## Appendix E Permission lifecycle and interruption record

The following lifecycle is specified for engineering review. It is not a claim that all states exist in the current public application or the uncompiled controller source. Its purpose is to make the acceptance work explicit before those transitions are implemented or adopted.

| Review state | Required evidence to leave the state | Invalidating event or stop consequence |
| --- | --- | --- |
| DEFINITION IDENTIFIED | Admissible controlling revision and rule | Requirement change creates a new revision |
| STORE ANSWER BOUND | Matching demand and exact Store result | Changed demand or mismatched answer prevents reuse |
| LOCAL ARTIFACT GENERATED | Source-linked commands and registered configuration | Changed station, tool or lowering version requires regeneration |
| PHYSICAL ADMISSION BLOCKED | All applicable engineering and release prerequisites closed | An unresolved prerequisite leaves motion forbidden |
| READY FOR PERMITTED RUN | Material, datum, tooling and permissions independently valid | Loss of any dependency revokes the affected permission |
| RUNNING | Each commanded operation completes under continuing conditions | Fault records stop disposition and affected requirements |
| RECOVERY REQUIRED | Known material condition and authorized restart point | Unknown stock position prevents automatic continuation |
| EXECUTION COMPLETE | Full terminal result and remaining material record | Completion alone does not declare part conformance |
| INSPECTION DISPOSITIONED | Accepted method and actual inspection findings | Nonconformance prevents a conforming-output claim |
| HANDOFF RECORDED | Identified components and customer custody event | Missing handoff evidence leaves custody open |

A permission must have an owner, scope, supporting evidence, validity condition and invalidation rule. These are operational properties, not just a Boolean. For example, a valid workpiece datum depends on the actual retained stock and its registered relationship to the measuring system. Losing that relationship invalidates derived position permissions even if the last displayed coordinate remains unchanged.

A reviewed interruption record would state the job, definition and Store identities; last completed command; active command; known axis and tool state; cause and time; affected features; material condition; and whether the datum remains valid. The restart record would identify the evidence used to restore reference, the commands permitted to repeat or skip, the approving authority, and any revised consumption or estimate. This package does not fabricate such a physical event.

The modeled position-fault case stops before the following process operation. The modeled retract-fault case stops before the following X index. The identity-fault case admits no virtual motion. These tests establish three specific model responses. They do not establish safety-rated stop categories, controller stopping distance, power-loss holding, pneumatic exhaust performance, recovery after a partially completed cut, or commissioned restart behavior.

An installed implementation needs explicit handling for each fault source, including encoder inconsistency, coupling failure, pivot validation loss, tool-ready loss, failed clamp confirmation, interrupted cut, extraction condition and communication failure where relevant to the design. Whether a fault requires controlled stopping, energy isolation, holding or another action must follow the machine's risk assessment and validated design. This record does not choose an unsupported universal stopping action.

## Appendix F Audit procedure and claim disposition

A reviewer can audit this package in the following order. Reproduction changes generated files in the extracted copy; preserve the delivered copy and its manifest first if a before-and-after comparison is required. No machine connection is involved.

| Audit action | Evidence to compare | What the comparison establishes |
| --- | --- | --- |
| Identify the delivered package | MANIFEST.json against delivered file bytes | Whether the received evidence files match this package |
| Identify original source bodies | source-identities.json and seven source files | Exact downloaded source bytes and their pinned provenance |
| Inspect the specimen | definition-and-demand.json against section 5 | Values and identities actually submitted to the evaluator |
| Reproduce the Store result | store-answer.json and generated hashes | Same bounded answer under the pinned model |
| Distinguish the length example | hypothetical-60-in-check.json and candidate trace | Counterfactual refusal versus actual offered-parent selection |
| Follow the requirements | manufacturing-requirements.json and local-job.json | Component meaning and the added local facts |
| Follow every command | motion-ir.json and Appendix D | Order, target, dynamics and originating operation |
| Inspect model execution | virtual-trace.json and review-summary.json | Nominal positions, modeled durations and reconciliation |
| Inspect refusals and faults | proof-results.json and physical-admission.json | Stated checks and the closed physical boundary |
| Inspect controller source | Job1_Data.st and Controller_Reference.st | Generated data and uncompiled vendor-oriented source |

A digest supports byte-level identity. It does not establish author identity, customer authentication, a trusted timestamp or approval. The included manifest is not a digital signature. An operational audit trail would additionally need its adopted authentication, event custody and retention controls. These controls must be demonstrated separately rather than inferred from a reproducible calculation.

| Claim | Present disposition | Evidence still required for a stronger claim |
| --- | --- | --- |
| The identified rule derives this specimen | EXECUTED | Independent reproduction can corroborate the same calculation |
| The pinned Store returns Q 11.09 | EXECUTED | A different pin or commercial offer requires its own evaluation |
| The definition drives the generated nominal commands | EXECUTED REFERENCE | Adopted generator and interface validation for operational use |
| The virtual model follows all 45 records | EXECUTED MODEL | Independent model review and controller-runtime execution |
| The selected commercial families can support investigation | MANUFACTURER DATA AND REFERENCE SELECTION | Complete compatible design, sizing and configuration |
| The supplied Structured Text runs in TwinCAT | NOT ESTABLISHED | Compile log, frozen libraries and virtual runtime traces |
| The physical machine can make conforming parts | NOT ESTABLISHED | Closed geometry, commissioned machine and inspected output |
| The information architecture improves commercial outcomes | NOT ESTABLISHED | Identified comparative operating and economic evidence |

The package supplies a reproducible digital specimen with inspectable transformations and explicit nonclaims. It leaves reviewers able to accept the established numerical path while withholding physical, runtime or commercial conclusions. That distinction is the basis for extending the evidence without weakening the historical record.
