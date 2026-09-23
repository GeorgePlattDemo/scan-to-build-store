# Machine alignment verification

Baseline: `1f9f1a217d91686ef21848508b20e605e7cc6bc1`.

- Baseline `node --test *.test.mjs`: six existing test files passed.
- Candidate `node --test *.test.mjs`: all sixteen reported tests/file suites passed (six existing files and ten added behavioral tests).
- Added tests executed unchanged against an isolated archive of the baseline: eight targeted behavioral cases failed because the baseline accepted requests whose explicit qualifiers were unsupported or treated missing angle values as zero. One additional failure was the expected envelope-version assertion. The 45/46-degree boundary test already passed on the baseline.
- Candidate preserves existing User 1 legacy-centered-spot modeled Q, three cuts and 27.625-in remainder. This is **not** evidence for the requested depth-defined spot contract.
- Existing Alcove cut/mill and catalog-resolution tests remain unchanged and pass.
- New checks exercise `evaluateDimensionalTravelJob`, `evaluateDimensionalStoreRequest` and `capabilityAnswer`. They do not mock or copy the Store evaluator.
- Station identity and proposed sensing/control metadata are included in current machine/travel authority hashes. Existing station coordinates are read from the envelope by the travel model.

Coverage limits: no browser/runtime consumer repin, deployment, physical machine test, or commissioned sensing test. No claim of GitHub Actions success or required branch protection is made. The new tests prove the reported request checks, not complete T1–T5 machining or pricing.

Pending capability decisions and continuation instructions are in `D001-MACHINE-IMPLEMENTATION-0.1.md` and `AGENTS.md`.
