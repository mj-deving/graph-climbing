# Audit

Audit read-only. Stop when each reported divergence has an exact source anchor.

1. Read the product authority completely.
2. Read the operational ledger only where it affects active work, dependencies, ownership, or gates.
3. Inspect Git state, named tests, evidence artifacts, and relevant external pins.
4. Run `bun <skill-dir>/scripts/graph-check.ts <spec-path> --json` when the reference format is used.
5. Derive `active`, `ready`, `blocked`, `verified`, and `unknown` work from the sources.
6. Check semantic quality the script cannot decide:
   - intent and boundary coverage;
   - atomicity and hard-to-vary claim wording;
   - whether each probe can falsify its claim; enumerate the probe's assertions and split the claim when any assertion can fail independently, even if one command runs them together;
   - evidence modality and snapshot sufficiency;
   - slice verticality and dependency truth;
   - safe ownership and parallel isolation;
   - spec/ledger/evidence divergence;
   - governance work displacing an available product frontier.
7. Propose the smallest correction on the owning surface. Do not apply it in audit mode.

Treat a mechanically valid graph as internally consistent, not product-correct. Product truth comes from claim probes. If no divergence exists, say so and stop.
