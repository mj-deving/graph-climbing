# Bootstrap

Use for greenfield scaffolding and brownfield adoption.

1. Read repository instructions, existing specs, tests, recent Git history, and the active tracker if present.
2. Name the current product authority, ledger, and evidence sources. Do not create an artifact for a concern that already has an adequate owner.
3. Preserve the human's stated intent. Distill a concise desired state rather than optimizing for the literal wording.
4. Record explicit out-of-scope and immovable constraints. Do not promote an inferred product decision into a boundary. Derive at least one testable `Anti:` criterion from grounded critical boundaries.
5. Draft stable criteria as desired states. Give independently failing observable behaviors separate criteria even when one broad test could inspect both. Apply the splitting test until each leaf has one binary falsifying probe; the mechanical checker does not prove semantic atomicity.
6. Derive the claim frontier from open claims whose dependencies are verified. Select one bounded vertical over reachable claims; it may remain a local execution choice.
7. Remove order-only edges. Keep a dependency only when downstream work consumes upstream data, an artifact, verified state, authority, a gate, or probe-required evidence.
8. Compare serial, pipeline, router, fan-out/fan-in, and read-only verifier shapes without changing claim truth. Persist only durable dependency and reconciliation boundaries.
9. Use Git and existing tests as the initial evidence store. Add a Work Graph or ledger only for long runs, durable coordination, external gates, or concurrent writers. In that scaled profile, each vertical names `satisfies`, `depends_on`, ownership, allowed file/read scope, runtime scope when parallel, and external gates. Bind each operational lease ID once to its stable vertical and canonical envelope hash; recovery tombstones that lease and creates a new ID.
10. Before releasing two or more product lanes, set `topology_contract: cohort-v1` and pre-create one companion reconciliation vertical. Give every lane its `reconcile_via` target and return the exact set through the join's `join_for`. Bind exact base, checkout policy, scopes, probes, stop rules, evidence destinations, product-authority write permission, and central owner. After every mutating worker is paused and all prior leases/reservations are reconciled or withdrawn, that owner publishes one immutable run epoch containing candidate IDs, canonical envelope hashes, graph/product base, and validation evidence for every pair whose reservation lifetimes can overlap. A cohort reservation lasts through its join.
11. Before linting, enumerate the independently observable outcomes in every claim and probe. Split whenever one can fail while another passes; one command or fixture does not make multiple outcomes atomic.
12. Run the checker when the reference `SPEC.md` format is used. Treat its pass as structural consistency only.
13. Report the authority map, claim frontier, frontier kind, active frontier, selected topology and vertical, first probe, and unknowns before building.

For an existing repo with no adequate authority, copy the skill's `assets/SPEC.md` to the repository root as `SPEC.md`, then replace every placeholder. Never overwrite an existing `SPEC.md`, ISA, PRD, design contract, or equivalent. When sources conflict, surface the conflict instead of silently choosing.

Ask at most three questions, and only when an answer would materially change the desired state, boundaries, claim semantics, or graph. In a non-interactive run, record such an item as `UNKNOWN` in Decisions, mark affected claims or slices `unknown`, and leave it outside the active frontier. Never turn the assumption itself into a durable product boundary. Continue on an implementation assumption only when changing it cannot alter externally observable behavior; otherwise keep it unknown. Never label an assumption harmless without applying that test.
