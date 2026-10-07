# Agent instructions — scan-to-build-store

You are working in `GeorgePlattDemo/scan-to-build-store`: Store Zero's catalog, machine envelope, evaluators, modeled time, economics and refusals.

## Protected path: System → Railway → Store — do not touch

The live app in `scan-to-build-system` calls the hosted Store on Railway at one pinned Store commit. The pin lives in exactly one place, `STORE_PIN` in System's `apps/stb/shared/contracts.mjs`; it is not restated here, so it cannot go stale here. That path works. **Do not change it, re-point it, or redeploy it as part of any other task.**

- Committing to this repository does **not** move the pin. The System pin changes only when the owner deliberately changes it, in a change that does nothing else.
- Do not change Railway services, environment variables, or deployment settings.
- Do not edit System's `STORE_PIN`, `stb-store-runtime.json`, `Dockerfile.store-zero`, or the Store `ref:` in System's workflows from here.
- If a task seems to require any of this, stop and ask.

## Working rules

- Shared terms are defined once, in System's `docs/definitions/README.md`. `docs/DEFINITIONS.md` here holds only yard, merchant and Store Zero terms.
- Store answers from its own declared facts. It never rewrites the customer's job to make it fit.
- Missing Store facts stay `UNRESOLVED`, `REFUSED` or `UNAVAILABLE`. No fallback prices, no invented capability.
- Run the tests before and after any change: `node --test tests/evaluators/*.test.mjs tests/engine/*.test.mjs`.
- Stages 1–4 are defined in [`STB-STORE-CELL-STAGES-0.1.md`](docs/standards/STB-STORE-CELL-STAGES-0.1.md). Stage 2 must not describe itself as Stage 3.
- Store capability is what the code declares (`src/envelopes/d001-stage2-envelope.mjs`, `src/envelopes/s001-stage2-envelope.mjs`). Candidate machine research lives in Program and is not described here as Store fact. The owner-authorized exception is documentary custody of the exact Project 1 reference record in `docs/project-1-digital-trail/`; its controller source and mechanical assumptions remain reference engineering, not admitted capability. Preserve those accepted artifacts and their identities; later technical work requires a new revision.

**NO BLOOD ON WOOD.**
