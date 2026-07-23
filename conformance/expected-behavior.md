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

Under `topology_contract: cohort-v1`, every released N-way product cohort has one pre-created companion reconciliation vertical over the exact set, independent of owner identity or staggered activation. Each lane durably names it with `reconcile_via`; the join returns the exact membership with `join_for`, so independent cohorts remain separate. Lanes have no unfinished Work Graph or claim-graph dependency between them and retain isolated file/read and runtime scopes across pending cohorts. A durable seal releases the worker's mutating lease but not the cohort's reservation and unlocks no successor. That worker may claim another ready, epoch-admitted vertical compatible with every pending reservation. The join enters the frontier only after every lane seals, then combined probes and review precede one atomic reconciliation. Rework reactivates only affected lanes; withdrawal replaces the join or returns a singleton to serial reconciliation.

A covered claim cannot become verified before its live join. At completion, lanes and join share snapshot-bound `completion_evidence`. A later verified finding may reopen one claim with new evidence without rewriting historical execution completion. After a cohort verifies, one later released lane remains valid serial work under the persistent contract. An active join cannot overlap foreign pending cohort scopes.

## Durable goal workers

The installed worker text is identical, task-free, and below the native 4,000-character goal limit. It contains the repeated worker loop and stop boundaries, not a natural-language implementation of the control plane. A ledger worker reconstructs durable state, derives the frontier, validates one compatible ready candidate plus its envelope, any applicable epoch, and inactive barriers; claims at most one lease—vertical or companion join—with a unique runtime incarnation; then re-reads exact ownership, bindings, and barriers. A lost claim re-derives only in a declared multi-worker profile. A ledgerless worker proceeds only as a proven single writer and locally selects one bounded frontier item as its runtime lease. Both profiles execute and verify the envelope, reconcile, close any ledger lease last, persist steering at safe boundaries, and repeat.

System conformance does not depend on the prompt carrying operator rules. Before Ready, the release owner binds each lease ID to one work item—vertical or companion join—plus its kind, envelope hash, workspace, authority, applicable epoch, and one authority-scope recovery barrier ID. Atomic claim binds a unique incarnation. Resume requires exact bindings and an inactive barrier. Handoff proves the prior incarnation stopped, no reconciliation is in flight, then exclusively acquires its workspace. Otherwise the worker stops; an authorized operator may atomically claim the recovery barrier. Its owner freezes claims, stops writers, and first replays or dispositions incomplete records. Only if work remains does it import or disposition all state, tombstone, and issue a pre-bound lease plus successor barrier; close the barrier last. Owner loss is fail-stop: freeze scope for external principal recovery, never timeout-steal. Recovery is forbidden during live commit-to-close.

Before initial N-worker start or replacement, all mutating workers are durably paused or terminated and every prior lease, seal, reservation, and join is reconciled or withdrawn. One central owner then publishes an immutable run epoch containing graph revision, explicit `epoch_candidates` including future-ready verticals and joins, canonical envelope hashes, and compatibility proof for every admitted pair that may overlap. Real dependencies and own lane-to-join edges prove non-overlap; current graph state decides readiness. Workers verify epoch and hash before and after claim; mismatch permits no mutation. The same goals resume. A proven single writer may select claim-first work without a ledger; N workers may not.

Reconciliation persists one snapshot-bound record and commits product truth and evidence. A ledger-backed run additionally binds the exact active lease, envelope hash, and applicable epoch, then closes that ledger ID last with the reconciliation ID and commit reference. A ledgerless single writer completes from product truth, Git, evidence, and the record without inventing a lease. Resume replays an eligible incomplete record idempotently, and downstream work blocks until all owning surfaces agree. No ready compatible work is not product completion; all in-scope claims and joins must be durably verified.

## Falsifiers

The implementation fails this contract if it creates competing product authorities, closes claims without evidence, treats a seal or checker pass as product proof, lets a cohort successor bypass its join, splits one released set across joins, lets a worker act on a lost or stale lease, blocks unrelated local work on release-only gates, requires workers to simulate recovery or epoch control from prompt prose, or grows governance infrastructure to supervise itself.
