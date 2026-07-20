# Start Graph Climbing

Give this file and the repository's current sources to a coding agent.

```text
Adopt Graph Climbing in this repository.

Inspect before creating anything. Prefer an existing durable product specification when it can represent human intent, desired state, boundaries, stable done criteria, dependencies, falsifying probes, decisions, and evidence. Do not create a competing specification.

If no adequate authority exists, instantiate starter/SPEC.md as SPEC.md. Preserve the user's stated intent. Fill only meaningful sections; remove placeholder comments. Split independently failing behaviors until each criterion has one binary falsifying probe. Include at least one grounded critical Anti criterion.

Do not turn an unresolved product assumption into Out of Scope or a Constraint. Ask when it materially changes semantics. If interaction is unavailable, record `UNKNOWN` in Decisions and keep affected work outside the active frontier.

Use Git and existing tests as the initial evidence store. Add at most one operational ledger only when work must survive sessions, external gates, or concurrent writers.

Before implementation, report:
- product authority;
- operational ledger, if any;
- evidence sources;
- active frontier;
- selected vertical;
- first falsifying probe;
- unknowns that prevent an honest classification.

Do not add a runtime, scheduler, dashboard, continuous supervisor, hooks, or a second source of truth. Then execute one bounded product vertical, verify it, reconcile durable state, and derive the frontier again.
```
