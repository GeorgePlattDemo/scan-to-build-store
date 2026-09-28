# Agent instructions — scan-to-build-store

You are working in `GeorgePlattDemo/scan-to-build-store`: Store Zero's catalog, machine envelope, evaluators, modeled time, economics and refusals.

## Protected path: System → Railway → Store — do not touch

The live app in `scan-to-build-system` calls the hosted Store on Railway at one pinned Store commit (`fc3f555b8f1f329bcf2dd81fa26995230d12a527`). That path works. **Do not change it, re-point it, or redeploy it as part of any other task.**

- Committing to this repository does **not** move the pin. The System pin changes only when the owner deliberately changes it, in a change that does nothing else.
- Do not change Railway services, environment variables, or deployment settings.
- Do not edit System's `STORE_PIN`, `stb-store-runtime.json`, `Dockerfile.store-zero`, or the Store `ref:` in System's workflows from here.
- If a task seems to require any of this, stop and ask.

## Working rules

- Shared terms are defined once, in System's `docs/definitions/README.md`. `DEFINITIONS.md` here holds only yard, merchant and Store Zero terms.
- Store answers from its own declared facts. It never rewrites the customer's job to make it fit.
- Missing Store facts stay `UNRESOLVED`, `REFUSED` or `UNAVAILABLE`. No fallback prices, no invented capability.
- Run the tests before and after any change: `node --test *.test.mjs`.
- Stages 1–4 are defined in [`STB-STORE-CELL-STAGES-0.1.md`](STB-STORE-CELL-STAGES-0.1.md). Stage 2 must not describe itself as Stage 3.

**NO BLOOD ON WOOD.**
