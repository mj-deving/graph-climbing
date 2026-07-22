# Expected behavior

The reference implementation is conformant when the following source-blind behaviors hold.

## Bootstrap

Given an unfamiliar repository and only the Graph Climbing protocol or skill, an agent:

- inspects existing authorities before creating files;
- creates at most one missing product authority;
- preserves the stated intent and writes a desired state;
- names boundaries and at least one `Anti:` criterion;
- produces stable criteria with one probe each;
- derives a claim frontier without requiring a Work Graph or ledger;
- maps bounded verticals to criteria and dependencies only when the scaled profile is justified;
- preserves material unspecified product semantics as `unknown` instead of inventing a boundary or default;
- reports the active frontier and first probe;
- does not add a runtime, hooks, dashboard, supervisor, or unnecessary ledger.

## Audit

Given a mechanically inconsistent reference `SPEC.md`, the checker returns non-zero and identifies the violated invariant. Given semantic ambiguity, the skill reports a divergence or unknown rather than claiming product correctness.

## Reconcile

Given candidate evidence for one criterion, the agent updates that criterion independently, preserves stable IDs, records the evidence snapshot, leaves unresolved siblings open, and derives the next frontier. Unknown IDs or structural conflicts stop automatic reconciliation.

An accepted review finding reopens or adds a claim only after the finding is verified against the relevant snapshot. The verified-claim count may decrease. A blocked or unknown claim does not remove independent reachable claims from the frontier.

## Scaling

Short serial adoption creates no execution ledger. Brownfield adoption preserves an adequate existing product authority. Order-only edges are removed. The claim graph stays invariant while execution may be serial, pipelined, routed, or fan-out/fan-in.

Under `topology_contract: cohort-v1`, every released N-way product cohort has one pre-created companion reconciliation vertical over the exact set, independent of owner identity or staggered activation. Each lane durably names it with `reconcile_via`; the join returns the exact membership with `join_for`, so independent cohorts remain separate. Lanes have no unfinished Work Graph or claim-graph dependency between them and retain isolated file/read and runtime scopes across pending cohorts. A sealed lane unlocks no ordinary successor. The join enters the frontier only after every lane seals, then combined probes and review precede one atomic reconciliation of lanes, join, claims, evidence, and ledger state. Rework can reactivate one lane without discarding unaffected seals; withdrawal replaces the old join or returns a singleton to serial reconciliation.

A covered claim cannot become verified before its live join. At completion, lanes and join share snapshot-bound `completion_evidence`. A later verified finding may reopen one claim with new evidence without rewriting historical execution completion. After a cohort verifies, one later released lane remains valid serial work under the persistent contract. An active join cannot overlap foreign pending cohort scopes.

## Durable goal workers

The same task-free goal can be given to N workers. At every start, resume, and post-reconciliation boundary, each worker reconstructs current authorities and first resumes its single owned lease before steering. Multiple owned leases fail closed; abandoned leases require explicit authorized recovery. Lease-local steering may not change its base, scope, authority, run epoch, or topology. When no lease is owned, ledger priority and stable ID determine candidate order and an exact atomic claim grants one mutating lease. Claim losers refresh. A worker never needs a new goal after sealing one vertical.

Before N-worker start, one central owner publishes an immutable run epoch containing the execution-graph revision, canonical envelope hashes, and proof that every pair that can become concurrent is compatible. Workers verify epoch and hash before and after claim; mismatch permits no mutation. Replacement requires all epoch workers durably paused or terminated plus every lane and join reconciled or withdrawn; the same goals then resume. Incompatible work receives a real dependency or gate. The goal owns no mutable task state. A sealed lane remains a candidate until its join. A proven single writer may select a claim-first vertical without a ledger; N workers may not.

Cross-store reconciliation persists one snapshot-bound record, commits product truth and evidence, then closes the ledger with the same ID and commit reference. Resume replays an incomplete record idempotently, and downstream work blocks until all owning surfaces agree. No ready compatible work is not product completion; all in-scope claims and joins must be durably verified.

## Falsifiers

The implementation fails this contract if it creates competing product authorities, closes claims without evidence, treats a seal or checker pass as product proof, lets a cohort successor bypass its join, splits one released set across joins, lets a worker act on a lost or stale lease, blocks unrelated local work on release-only gates, or grows governance infrastructure to supervise itself.
