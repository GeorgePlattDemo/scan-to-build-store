# Store Zero agent verification contract

This file governs AI-assisted changes and tests against Store Zero.

## 1. Test the real Store Zero

Do not invent, reconstruct, mock, summarize, approximate, or substitute a different Store Zero implementation unless the user explicitly requests a mock.

A project test must call the actual Store Zero code and data at the named repository, branch, and commit SHA.

## 2. No invented authority

A missing fact stays unresolved.

Do not invent prices, rates, setup time, stock, capabilities, machine time, geometry, availability, fulfillment state, or authority merely to make a project complete.

Modeled facts must be labeled modeled. Fixture facts must be labeled fixture. Observed facts must retain their observation source.

## 3. No self-authored pass criteria

Do not change expected values merely so a failing test becomes green.

A requirement change must be stated first, tied to an authoritative source or explicit user instruction, and reviewed as a requirement change rather than hidden inside a test edit.

## 4. Reality bar for money

Until processing economics are declared:

- Q may contain catalog material and hardware only.
- cell_recovery must be null.
- billed T_job_min and T_job_hr must be null.
- modeled operation minutes may remain visible as modeledOperationSubtotalMin.
- status must remain PARTIAL_BUDGETARY_ESTIMATE when processing dollars are unresolved.
- unresolved must identify the missing processing-rate and setup-time bases.

No job class receives an exception by inheritance.

## 5. A pass claim requires evidence from the same SHA

An agent may say PASS only when all of the following are true for the exact commit being reported:

1. repository is named;
2. branch is named;
3. commit SHA is named;
4. authoritative Store files actually used are named;
5. the real test command or GitHub Actions run is identified;
6. that run completed successfully on the same SHA;
7. no working-tree-only or earlier-commit result is presented as the current branch result.

If any item is missing, report NOT VERIFIED, not PASS.

## 6. Report actual outputs

For every project test, report:

- input demand;
- selected catalog offering(s);
- material facts and basis;
- requested operations;
- capability result and basis;
- modeled operation time and basis;
- unresolved facts;
- allowed subtotal;
- refused or unavailable conditions;
- exact tested SHA.

Do not replace actual Store output with a hand-calculated surrogate.

## 7. Failure is useful

If Store Zero cannot resolve a requested fact, preserve the failure. A truthful UNRESOLVED, REFUSED, or UNAVAILABLE result is a successful test of the system when that is what the facts require.

## 8. Preservation rule

Do not simplify, rebuild, replace, reroute, or delete working Store behavior to make a test easier. Make the smallest change required by the stated requirement and preserve unrelated behavior.

## Required instruction for outside agents

When another agent is asked to work on Store Zero, include:

> USE THE ACTUAL STORE ZERO AT THE NAMED REPOSITORY/BRANCH/SHA. DO NOT CREATE A SURROGATE STORE, MOCK ECONOMICS, OR SUBSTITUTE EXPECTED RESULTS. MISSING FACTS MUST REMAIN UNRESOLVED. YOU MAY CLAIM PASS ONLY FROM A COMPLETED TEST OR CI RUN ON THE SAME SHA YOU REPORT. IF YOU CANNOT VERIFY THAT, SAY NOT VERIFIED.
