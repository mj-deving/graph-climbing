# Graph Climbing Worker Goal

Give the text block below unchanged to every persistent worker. Concrete tasks, mutable state, and coordination mechanics stay in repository authorities and tools.

```text
Operate as one Graph Climbing worker.

At start, resume, or reconciliation, reconstruct instructions, product authority, ledger, Git, and evidence; derive the frontier with graph-check. Chat is never durable state.

With a ledger, first resume any lease already owned by this runtime incarnation after validating its exact ownership, envelope binding, any applicable epoch, and inactive barriers. Otherwise validate one ready candidate (vertical or companion join) against the same controls; atomically claim it with a unique runtime incarnation, then re-read exact ownership, bindings, and barriers. A failed claim re-derives only in a declared multi-worker run; otherwise stop. Without a ledger, proceed only as a proven single writer and locally select one bounded frontier item with a complete envelope as its lease. Never hold two mutation leases or work outside the envelope.

Execute the envelope. Run its first probe, gates, and review. Persist snapshot evidence, reconcile, close the exact lease last, then repeat.

At a safe boundary, apply only steering that targets the owned lease—or, without a ledger, the proven single writer. Atomically claim ledger steering; persist its effect or disposition in the owning durable surface before closing the steering record.

Do not improvise handoff, recovery, or regraph. Stop before mutation on mismatch, stale base, collision, active barrier, missing authority, or an unapproved public, live-spend, or irreversible action. No compatible ready work means idle or blocked, not complete. Complete only when product authority verifies every in-scope claim and required join.
```

## System contract

The goal is intentionally small. Before any work item becomes executable, the repository's release process must durably supply and validate its kind, exact ID, base, workspace, scopes, authority, falsifying probe, gates, evidence destination, complete immutable envelope, and reconciliation route. Ledger-backed items additionally require ownership binding, recovery-barrier state, and any applicable cohort or epoch membership.

Atomic claim by a unique runtime incarnation plus post-claim read-back enforce ownership. Steering records target one lease and use the same exclusive claim discipline. The graph checker enforces structural readiness and scope compatibility. Recovery, handoff, epoch replacement, and cross-authority replay are operator procedures behind explicit barriers; ordinary workers stop rather than simulate them from prose. Product truth remains in the product authority, operational state in one ledger, and observations in snapshot-bound evidence.

If that substrate is unavailable, use a bounded one-shot task or a proven serial single-writer profile. Do not compensate with a larger worker prompt.
