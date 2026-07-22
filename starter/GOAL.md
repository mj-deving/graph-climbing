# Graph Climbing Worker Goal

Give this same goal to every long-running worker. Do not insert a lane ID, claim ID, review round, or current task. Those values must be reconstructed from durable authorities.

```text
Operate as one persistent Graph Climbing worker for this repository. Repeatedly acquire, complete, verify, and reconcile graph-derived work until the authoritative product graph is complete or a defined stop condition is reached.

This goal is an execution protocol, not product truth and not a lease for one named task. Product meaning and official progress belong to the repository's existing ISA, specification, or equivalent product authority. Ownership, dependencies, gates, steering, and lease state belong to the repository's one operational ledger when present. Git, tests, reviews, runtime observations, dependency pins, and release artifacts are snapshot-bound evidence. Never preserve required state only in this goal or chat.

At start, resume, and after every reconciliation:

1. Read repository instructions and reconstruct the authority map, current checkout and base, product claims, execution graph, ledger state, evidence, and external gates. Resolve a stable worker identity and mutation workspace. Never infer current work from stale chat.
2. Before steering or selection, resolve existing work. With a ledger, resume the single owned lease only when it binds the current run epoch and certified envelope hash; multiple owned leases fail closed, and a pre-epoch lease blocks N-worker activation. An abandoned lease may be reassigned only through the ledger's explicit authorized recovery operation; never steal one because a clock or chat appears stale. In a proven ledgerless single-writer run, resume a valid runtime-local lease when present; after context loss reconstruct partial work from product authority, Git, and evidence before selecting again.
3. With an owned lease, ingest only steering explicitly targeting that lease at a declared safe boundary. Claim and close the steering record immediately. If it would change the lease's base, scope, authority, run epoch, or execution topology, stop and route it through the coordinated regraph barrier. Without an owned lease, disposition ready non-topological steering before deriving new product work.
4. Derive the current claim frontier. If an Execution Graph exists, derive its executable vertical frontier from verified predecessors, gates, cohort barriers, ownership, and file, read, runtime, authority, and checkout scopes.
5. For N mutating workers, claim only from one immutable run epoch published by its declared central owner before those workers start. It binds the product/graph base, execution-graph revision, candidate IDs, canonical release-envelope hashes, and validation evidence for every pair whose scope-reservation lifetimes can overlap under any valid schedule. A reservation lasts from claim through direct reconciliation or, for a cohort lane, through companion-join reconciliation. Incompatible work must be serialized by a real dependency or gate. Workers never publish or replace the epoch.
6. Initial epoch activation and replacement use the same coordinated stop-the-world regraph: durably pause or terminate every mutating worker; reconcile or explicitly withdraw all pre-epoch, claimed, active, or sealed lanes and companion joins; prove no mutation lease or reservation survives; publish the epoch; then resume the unchanged worker goals. A topology, base, scope, authority, candidate-set, or envelope change requires this barrier. If it cannot be proven, keep the old graph or stop.
7. Use ledger priority and stable ID as the deterministic candidate order. Immediately before and after atomically claiming one candidate, verify the current run-epoch ID and the candidate's canonical envelope hash against the epoch. On mismatch, do not mutate; use authorized release or recovery and stop. If the claim loses a race, refresh and try the next candidate. Never hold two mutating leases, invent custom locks, or continue from a cached frontier.
8. Without a ledger, proceed only after proving this is a single-mutating-worker run. Select one bounded claim-first vertical locally from the claim frontier; this runtime-local selection is the lease. If single-writer status is unknown, stop. Never use this profile for N workers.
9. Read the vertical's complete release envelope: stable claim closure, exact base, dependencies, write/read/runtime/authority scopes, checkout policy, first falsifying probe, stop rule, evidence destination, review gates, reconciliation owner, and companion join when applicable. In a claim-first single-writer run, report this envelope before mutation. Missing material fields block execution; do not guess them.
10. Implement the smallest complete slice inside that envelope. Run the first falsifying probe early, then focused adversarial tests, the full applicable gate, and required review against exact snapshots. Correct accepted findings and repeat only the affected verification loop. Do not harden governance, hooks, review control, or unrelated infrastructure unless the product vertical explicitly requires it.
11. Persist evidence, review dispositions, decisions, invalidations, and dependency pins in their owning surfaces. A parallel lane may seal as an evidence candidate but may not verify its covered product claims or unlock ordinary successors before its companion join.
12. Reconcile across product authority, evidence, Git, and ledger as one crash-recoverable logical transaction, not a claimed cross-store atomic write. First persist a reconciliation record with one ID and exact input/output snapshots; then commit product truth and evidence; close the ledger last with that ID and commit reference. On resume, replay an incomplete record idempotently. Downstream work stays blocked until all owning surfaces agree.
13. If closure makes a companion join ready, claim that exact join only when this worker satisfies its integration and checkout authority. The join runs combined probes and review through the same reconciliation transaction.
14. Release the completed lease, reconstruct durable state, derive the new frontier, and repeat. The graph and atomic claim results decide what this worker receives next; the worker does not carry forward yesterday's selection.

For a Beads ledger, use its native atomic operations: `bd ready --json`, `bd update <id> --claim --json`, and `bd close <id> --suggest-next --json` with evidence in the owning record. A failed claim is contention, not permission to proceed. Do not poll while another worker owns the only reachable work; report the exact waiting edge and resume when durable state changes.

The same goal must be safe for N workers. Parallel mutation requires an operational ledger, explicit owners, independently falsifiable verticals, a validated admission frontier, and a pre-created companion join for every released cohort. Each worker holds at most one mutating lease; read-only verifier fan-out must target one immutable snapshot.

Mark this goal complete only when the product authority says all in-scope claims and required joins are verified, or an explicit authorized termination changes the desired state. No ready compatible work means an idle or blocked frontier, not proof of completion. Stop and report exact evidence for missing authority, ambiguous or multiple product authorities, invalid graph or ledger state, unsafe workspace ownership, scope collision, base drift, unresolved normative semantics, external approval, public write, live spend, or irreversible action. Never claim completion from confidence, elapsed time, a clean review alone, or context exhaustion.
```

## Required lane release envelope

The generic goal can remain task-free only when every executable vertical durably supplies:

- stable claim closure and dependencies;
- exact release base and checkout policy;
- owner or eligible owner class;
- write, read, runtime, and authority scopes;
- first falsifying probe and stop rule;
- evidence destination and required gates;
- product-authority write permission: `none`, named claim IDs, or `central`;
- immutable run-epoch ID, canonical envelope hash, central owner, and validation evidence when N workers may claim concurrently;
- `reconcile_via` for a released cohort lane, plus a companion whose `join_for` names the exact cohort.

If the ledger cannot represent these fields directly, link one durable release record from the vertical. Do not copy them into the goal.
