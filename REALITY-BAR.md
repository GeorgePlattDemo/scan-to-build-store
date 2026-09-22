# Store Zero reality bar

A job may be simulated. It may not invent a complete price.

## Allowed facts

- External list observations in `store-zero-observations.json`
- Store Zero selling price from declared mark-on `SZ-MARK-ON-5`
- Declared D-001 envelope and modeled operation minutes (`CYCLE_MODEL.measured = false`)
- Fixture stock quantities, labeled as fixture

## Not facts

- Any undeclared setup charge
- Any undeclared machine-hour rate
- Any undeclared per-job setup time
- Any complete `cell_recovery` minted from unsupported assumptions
- Any billed `T_job_min` formed from undeclared setup

The rejected historical placeholder values are not retained as active engine constants. Regression tests may mutate the empty fields to arbitrary junk values solely to prove those values cannot affect Q.

## Required processing basis (absent)

Machine recovery is a declared cost pool divided by forecast productive machine hours, applied to modeled occupied time. Service policies stay separate so recovery is not double-counted.

Until that basis exists:

- status is `PARTIAL_BUDGETARY_ESTIMATE`
- `cell_recovery` is `null`
- `T_job_min` / `T_job_hr` are `null`
- `Q` is material + hardware only
- unresolved includes `PROCESSING_RATE_BASIS_REQUIRED` and `SETUP_TIME_BASIS_REQUIRED`

Do not substitute any convenient complete price. A plausible-looking number is still false authority if its basis is absent.

## Reality bar result

`auditRealityBar(estimate)` returns `PASS` when Q contains no invented processing dollars. It returns `FAIL` if `cell_recovery` or billed setup minutes are present.

Unobserved catalog list references are warnings, not a license to invent recovery.
