# Audit

Audit read-only. Stop when each reported divergence has an exact source anchor.

1. Read the product authority completely.
2. Read the operational ledger only where it affects active work, dependencies, ownership, or gates.
3. Inspect Git state, named tests, evidence artifacts, and relevant external pins.
4. Run `bun <skill-dir>/scripts/graph-check.ts <spec-path> --json` when the reference format is used.
5. Derive the claim frontier first. Report `frontier_kind: claim` without a Work Graph and `frontier_kind: vertical` with one; then derive `active`, `ready`, `blocked`, `verified`, and `unknown` work from the owning sources.
6. Check semantic quality the script cannot decide:
   - intent and boundary coverage;
   - atomicity and hard-to-vary claim wording;
   - whether each probe can falsify its claim; enumerate the probe's assertions and split the claim when any assertion can fail independently, even if one command runs them together;
   - evidence modality and snapshot sufficiency;
   - slice verticality and dependency truth;
   - whether every dependency carries data, an artifact, verified state, authority, a gate, or probe-required evidence rather than written order;
   - safe ownership plus disjoint file/read, runtime, and authority scope for parallel writers;
   - `topology_contract: cohort-v1` on new parallel graphs and one pre-created companion join over every released N-way set, with exact reciprocal `reconcile_via` / `join_for` membership;
   - sealed lanes remaining outside verified predecessor state and isolated from all concurrent pending work;
   - cohort successors blocking on the join and atomic combined reconciliation;
   - spec/ledger/evidence divergence;
   - governance work displacing an available product frontier.
7. Propose the smallest correction on the owning surface. Do not apply it in audit mode.

Treat a mechanically valid graph as internally consistent, not product-correct. Product truth comes from claim probes. If no divergence exists, say so and stop.
