# Expected behavior

The reference implementation is conformant when the following source-blind behaviors hold.

## Bootstrap

Given an unfamiliar repository and only the Graph Climbing protocol or skill, an agent:

- inspects existing authorities before creating files;
- creates at most one missing product authority;
- preserves the stated intent and writes a desired state;
- names boundaries and at least one `Anti:` criterion;
- produces stable criteria with one probe each;
- maps bounded vertical slices to criteria and dependencies;
- preserves material unspecified product semantics as `unknown` instead of inventing a boundary or default;
- reports the active frontier and first probe;
- does not add a runtime, hooks, dashboard, supervisor, or unnecessary ledger.

## Audit

Given a mechanically inconsistent reference `SPEC.md`, the checker returns non-zero and identifies the violated invariant. Given semantic ambiguity, the skill reports a divergence or unknown rather than claiming product correctness.

## Reconcile

Given candidate evidence for one criterion, the agent updates that criterion independently, preserves stable IDs, records the evidence snapshot, leaves unresolved siblings open, and derives the next frontier. Unknown IDs or structural conflicts stop automatic reconciliation.

## Falsifiers

The implementation fails this contract if it creates competing product authorities, closes claims without evidence, treats the checker's pass as product proof, blocks unrelated local work on release-only gates, or grows governance infrastructure to supervise itself.
