# Start Graph Climbing

Give this file and the repository's current sources to a coding agent.

```text
Adopt Graph Climbing in this repository.

Inspect before creating anything. Prefer an existing durable product specification when it can represent human intent, desired state, boundaries, stable done criteria, dependencies, falsifying probes, decisions, and evidence. Do not create a competing specification.

If no adequate authority exists, instantiate starter/SPEC.md as SPEC.md. Preserve the user's stated intent. Fill only meaningful sections; remove placeholder comments. Split independently failing behaviors until each criterion has one binary falsifying probe. Include at least one grounded critical Anti criterion.

Do not turn an unresolved product assumption into Out of Scope or a Constraint. Ask when it materially changes semantics. If interaction is unavailable, record `UNKNOWN` in Decisions and keep affected work outside the active frontier.

Use Git and existing tests as the initial evidence store. Start claim-first: derive the claim frontier directly from open criteria whose dependencies are verified. Add a Work Graph and at most one operational ledger only when work must survive long runs, external gates, or concurrent writers.

Before implementation, report:
- product authority;
- operational ledger, if any;
- evidence sources;
- claim frontier;
- frontier kind (`claim` or `vertical`);
- active frontier;
- selected claim or bounded vertical;
- first falsifying probe;
- unknowns that prevent an honest classification.

Do not add a runtime, scheduler, dashboard, continuous supervisor, hooks, or a second source of truth. Then execute one bounded product vertical, verify it, reconcile status, evidence, decisions, and operational state into their owning surfaces, and derive the frontier again.
```
