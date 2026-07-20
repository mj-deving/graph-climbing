# Bootstrap

Use for greenfield scaffolding and brownfield adoption.

1. Read repository instructions, existing specs, tests, recent Git history, and the active tracker if present.
2. Name the current product authority, ledger, and evidence sources. Do not create an artifact for a concern that already has an adequate owner.
3. Preserve the human's stated intent. Distill a concise desired state rather than optimizing for the literal wording.
4. Record explicit out-of-scope and immovable constraints. Do not promote an inferred product decision into a boundary. Derive at least one testable `Anti:` criterion from grounded critical boundaries.
5. Draft stable criteria as desired states. Give independently failing observable behaviors separate criteria even when one broad test could inspect both. Apply the splitting test until each leaf has one binary falsifying probe; the mechanical checker does not prove semantic atomicity.
6. Derive bounded vertical slices. Each slice names `satisfies`, `depends_on`, ownership, allowed scope, and applicable external gates.
7. Use Git and existing tests as the initial evidence store. Add a ledger only for durable coordination, external gates, or concurrent writers.
8. Before linting, enumerate the independently observable outcomes in every claim and probe. Split whenever one can fail while another passes; one command or fixture does not make multiple outcomes atomic.
9. Run the checker when the reference `SPEC.md` format is used. Treat its pass as structural consistency only.
10. Report the authority map, active frontier, selected slice, first probe, and unknowns before building.

For an existing repo with no adequate authority, copy the skill's `assets/SPEC.md` to the repository root as `SPEC.md`, then replace every placeholder. Never overwrite an existing `SPEC.md`, ISA, PRD, design contract, or equivalent. When sources conflict, surface the conflict instead of silently choosing.

Ask at most three questions, and only when an answer would materially change the desired state, boundaries, claim semantics, or graph. In a non-interactive run, record such an item as `UNKNOWN` in Decisions, mark affected claims or slices `unknown`, and leave it outside the active frontier. Never turn the assumption itself into a durable product boundary. Continue on an implementation assumption only when changing it cannot alter externally observable behavior; otherwise keep it unknown. Never label an assumption harmless without applying that test.
