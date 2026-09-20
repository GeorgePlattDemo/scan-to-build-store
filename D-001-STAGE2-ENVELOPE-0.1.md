# D-001 Stage-2 MachineEnvelope — 0.4

Declared reference capability. **Not commissioned. Not Cycle Start. Not generic CNC.**

Every numeric limit is a Stage-2 fixture assumption. Purpose: `fit → operation → modeled minutes → Q`. These numbers do not pre-commit Stage-3 physical design.

Machine-readable copy: `d001-stage2-envelope.mjs` (`D001_STAGE2_ENVELOPE`).

CUT-001 remains a valid regression path. Later work must not break its information/authority boundary. Later work is not required to be a 2×4 square cut.

---

## What this machine is (memory vs fixture)

Three pictures exist. Do not smash them together.

**Patent / cell spine correspondence** (`STB-CELL-0.1`, U.S. 10,768,609 FIG. 5): table and fence on a central base; **three** commonly-controlled manipulating rollers from above; idlers in the table; **a sawing station at each end** (chop, miter-capable); clamp rollers to the fence; vertical and horizontal ways that can carry drill/router heads.

**Earlier working memory:** radial-arm on one end, chop/miter on the other, two symmetrical rotors in the center, routers not placed.

**This Stage-2 fixture now resolves the saw function:** both end stations are fixed-station commercial **downstroke** miter/crosscut heads in the 20 in blade class. The declared face-miter envelope is 0° through 45° left/right. The cutting-force intent is downward into the table and rearward toward the fence; positive hold-down and fence restraint are prerequisites before saw motion. Clamp actuation, clamp pressure, guarding design, stopping performance, and vendor/component selection remain Stage-3 work. Two named rollers and two named mill functions remain the bounded Stage-2 fixture so Store can refuse and price without inventing a commissioned machine.

```
Y = 0  fence
Z = 0  table
X     along the fence, infeed → outfeed

X=  0   SAW-L     20 in fixed-station DOWNSTROKE miter/crosscut
                  face miter 0→45° left/right
X= 24   R1        manipulating roller (above)
X= 36   MILL_LONG between the rollers, below/at the work
                  Y travel 0→14 in from fence
                  Z micro-adjust for groove / rabbet / backing
X= 48   R2        manipulating roller (above)
X= 72   SAW-R     20 in fixed-station DOWNSTROKE miter/crosscut
                  face miter 0→45° left/right
X= -6   MILL_END  outside roller interference

Y tool travel          14.000 in   (spindle reach)
max stock width        12.000 in   (what D-001 will accept)
FEED_X_MAX_LOADED      480 in/min  (index, already in the cycle model)
MILL_CUTTING_FEED       48 in/min
base length               72 in
infeed roller support     168 in / 14 ft
outfeed roller support    168 in / 14 ft
declared parent stock     ≤192 in / 16 ft
retained cutoff tail      ≥24 in from active saw plane
declared cutoff kerf       0.125 in

SAW-L / SAW-R blade class       20 in
saw stroke                      DOWNSTROKE
square-crosscut stock width     ≤ 12.000 in
face-miter stock width          ≤ 7.250 in
face-miter stock thickness      ≤ 3.500 in
declared face-miter range       -45°→+45°
bevel / compound axis           NOT DECLARED
```

The 7.25 in face-miter width remains narrower than the 12 in square-crosscut width. The miter window and the stock-presentation rule are separate: stock may fit the saw envelope but still be refused if its requested presentation is not declared.

The test-machine reference now declares 14 ft of roller support on both infeed and outfeed and admits the Store Zero dimensional-lumber catalog through 16 ft parent stock. This is a declared, unmeasured, uncommissioned test-machine assumption. It replaces the earlier 96 in placeholder; callers must not resurrect the old external-support refusal for current Store Zero parents.

The 24 in value is **not a minimum finished-part length**. It is the saw-plane-to-nearest-manipulating-rotor control distance. During sequential cutoff work, the retained driven parent after every production cut must remain at least 24 in. A short finished part is allowed when the retained parent remains under declared control.

14 in mill reach is not a 14 in board. Two inches stay unclaimed for tool body, guard, and fence relationship that Stage 3 must actually design.

**Named unresolved, not designed here:** third roller; a third vertical-way router/drill; drill diameter/location envelope; physical clamp actuation/pressure; guard/interlock architecture; stopping performance; final saw/vendor selection.

Off-the-shelf names on a drawing are **CANDIDATE labels only** until Stage 3 selects them: commercial chop-saw head, commercial router spindle, pneumatic roller. Do not freeze SKUs here.

---

## Store rule

Store Zero may offer many SKUs. D-001 accepts only the subset that fits this envelope **and** lists the required operation.

Geometry fit is necessary, not sufficient.

```
SKU offered
  → requested presentation is declared
  → presented width ≤ 12.000
  → presented thickness fits the op family
  → parent length ≤ 192
  → sequential cutoff plan preserves ≥24 in retained driven stock
  → feature Y ≤ 14
  → required op on the offering
  → SUPPORTABLE
else REFUSED or UNRESOLVED with a named physical reason
```

A pretty Q is not computed as a success path for a refused envelope.

### Workpiece presentation

Default dimensional-lumber presentation:

~~~text
WIDE FACE ON TABLE / BASE
NARROW EDGE TO FENCE
~~~

Nominal 2×4 is the only declared lumber member with the additional saw presentation:

~~~text
NARROW 1.5 in FACE ON TABLE / BASE
WIDE 3.5 in FACE TO FENCE
~~~

That 2×4 exception is declared for `CROSSCUT` and `MITER_LIMITED`. It does not create a saw-head bevel axis and does not authorize the same edge presentation for 2×6, 2×8, 2×10, 4×4, or 1× boards.

### Sequential cutoff control

Cutoff sequencing uses `D001-CUTOFF-HOLD-0.1`:

~~~text
retained driven stock after each production cutoff >= 24.000 in
declared kerf                                         =  0.125 in
~~~

For an angled-end sequence, the Store model counts an establishing saw cut on each parent plus one production cutoff per finished part. The sequencer returns the retained length after every cut. This is a material/capability proof, not controller output or Cycle Start.

A project must not pack short parts locally and then declare the result machine-capable. Store Zero owns this cutoff-containment answer.

---

## Operations (declared subset)

| Op | Declared | Refuse / unresolved |
|---|---|---|
| `CROSSCUT` | square cleanup + kept length on fixed downstroke saw | upstroke architecture; bevel/compound cut |
| `MITER_LIMITED` | single-plane **face miter**, 0° through 45° left/right; ≤7.25 in face width; ≤3.5 in thickness | >45°; bevel/compound cut; wider miter stock |
| `DRILL` | bounded holes | diameter/location envelope unresolved |
| `DADO` / `GROOVE` / `RABBET` | only if the offering lists them | not implied by mill existence |
| `MILL_LONGITUDINAL_PROFILE` | taper; groove/dado along length | any-path 2-axis; carving |
| `MILL_END_PROFILE` | end/foot taper; bounded notch/chamfer | beyond 8 in from the worked end |

Passes for a mill feature:

`passes = ceil(required_total_depth / 0.375)`

Exclusion concept: mill path must not claim the volume of R1, R2, SAW-L, SAW-R. Coordinates inside those names are not free.

---

## Picnic-leg economic proof

The legacy 28 in picnic-leg regression remains valid. Its 28 in part length is not the source of the cutoff-hold rule. The 24 in rule belongs to retained parent control during sequential cutoff work. Square Q vs tapered Q must still differ because mill minutes were added.

---

## Stage-3 not designed here

Physical support details; clamp actuation/pressure; guarding; access control; safety-rated controls; interlocks; stopping/restart; commissioning; measured feeds/cycle times; PL/SIL; blade/tooth/vendor selection. Stage 2 declares the **functional** downstroke/fence/clamp requirement only; it does not claim a physically validated saw installation.
