# D-001 SPOT_ON_LOCATION Operation — 0.2

Status: **BOUNDED MACHINE-NEUTRAL OPERATION · DEPTH-DEFINED · TOOL-POINT GEOMETRY UNRESOLVED**

Operation contract: `SPOT_ON_LOCATION/0.2`

## Meaning

The customer selects the bounded spot operation and supplies/derives its location. Routine depth programming is not a customer input.

- Tool diameter: **0.1875 in**
- Full-diameter penetration: **0.1875 in below the entry surface**
- Depth reference: `ENTRY_SURFACE_ALONG_DRILL_AXIS`
- Total tip penetration: `0.1875 in + axial point length`
- Selected tool definition: `D001-SPOT-3_16-TOOL-0.2`
- Point angle / axial point length: currently unresolved in the tool definition
- Physical execution authority: `false`

The 0.1875-in depth is the cylindrical/full-diameter penetration, **not** tip-only penetration.

## Not the same operation

- A non-cutting layout mark does not remove material.
- `SPOT_ON_LOCATION/0.2` removes material to the fixed full-diameter penetration above.
- A generic pilot hole remains a different operation family.
- A finished drilled hole remains a different operation family.

An imported instruction such as "mark center" must not be upgraded to this operation. A generic pilot-hole instruction does not inherit this contract automatically.

## Current blocking tooling fact

Until the selected tool's point geometry is declared, total tip penetration is unresolved and the Store capability response must retain `SPOT_TOOL_POINT_GEOMETRY_REQUIRED`.

**NO BLOOD ON WOOD.**
