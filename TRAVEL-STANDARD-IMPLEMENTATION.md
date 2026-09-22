# Travel Standard implementation status

The user-supplied `STB-DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md` is copied without alteration and controls conflicting prior instructions.

## Enforced in this candidate

- No active default setup charge, hourly rate, or eight-minute setup; no project-name pricing exception.
- Missing complete machine-time/rate authority returns Q=null. Material subtotal is separately named.
- Store-owned trapezoidal/triangular index and declared tool-cycle calculations.
- Reference establishment, position loss, stationary hold/retract and no engaged-tool indexing checks.
- Required-operation coverage, material/feature/model/rate identification, and complete-Q gate.
- Same evaluator for live result and reconciliation; changed input and changed result have separate errors.
- Unchanged user document and standing development instructions.

## Current actual D-001 input gaps: not a completed pricing repair

The current envelope declares the fence/table, station positions and loaded maximum velocity. This candidate does NOT have an adopted acceleration/deceleration value, a fully specified datum-C establishment procedure with modeled duration, a complete ordered kinematic plan with all feature coordinates and tool motion parameters, or an adopted machine-service selling rate. The current spot tool also lacks point geometry.

`current-dimensional-travel.mjs` records these missing facts. It does not silently invent them or treat the prior coarse cycle estimate as T_MACHINE. Current live User 1 cannot issue a complete Q. The synthetic declared model in the arithmetic test is test-only and is not evidence that the production model is complete.

Historical native Alcove/Window Seat displays must not be represented as current Travel-Standard Q. Full migration of their physical feature demand and native reference economics requires Store-owned model reconciliation. Preservation of historical content is not an exception to the new current-Q gate.

## Requirement-driven test changes

The supplied standard sections 1, 5, 6 and 12 replace the former assertions that Q equaled material plus rejected recovery or could be a material subtotal. Q is now null without complete evidence. Milling's old operation-time comparison is retained as historical timing, not billed machine time. Arithmetic tests independently specify 12 seconds and $0.20 service for an explicitly test-only model; they do not establish a production rate.

This candidate is not promoted. CI configuration does not itself prove that GitHub branch protection requires it. A passing arithmetic or contract check is not proof of complete application coverage.
