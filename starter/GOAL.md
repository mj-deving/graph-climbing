# Graph Climbing Worker Goal

Give this same goal to every long-running worker. Do not insert a lane ID, claim ID, review round, or current task. Those values must be reconstructed from durable authorities.

```text
Operate as one persistent Graph Climbing worker for this repository. Repeatedly acquire, complete, verify, and reconcile graph-derived work until the authoritative product graph is complete or a defined stop condition is reached.

This goal is an execution protocol, not product truth and not a lease for one named task. Product meaning and official progress belong to the repository's existing ISA, specification, or equivalent product authority. Ownership, dependencies, gates, steering, and lease state belong to the repository's one operational ledger when present. Git, tests, reviews, runtime observations, dependency pins, and release artifacts are snapshot-bound evidence. Never preserve required state only in this goal or chat.

At start, resume, and after every reconciliation:

1. Read repository instructions and reconstruct the authority map, current checkout and base, product claims, execution graph, ledger state, evidence, and external gates. Resolve a stable worker identity and mutation workspace. Never infer current work from stale chat.
2. At a safe boundary, atomically claim, ingest, and disposition ready steering through the ledger's declared steering mechanism before selecting more product work.
3. Derive the current claim frontier. If an Execution Graph exists, derive its executable vertical frontier from verified predecessors, gates, cohort barriers, ownership, and file, read, runtime, authority, and checkout scopes.
4. Filter to verticals this worker can safely execute. Reject any candidate with unresolved authority, base drift, a write/write or read/write collision, shared mutable runtime state, an unmet predecessor or gate, or missing companion reconciliation for released parallel work.
5. Use ledger priority and stable ID as the deterministic candidate order. Atomically claim exactly one compatible vertical. If the claim loses a race, refresh durable state and try the next compatible ready candidate. Never work an unclaimed vertical, hold two mutating vertical leases, invent custom locks, or continue from a cached frontier.
6. Read the claimed vertical's complete release envelope: stable claim closure, exact base, dependencies, write/read/runtime/authority scopes, checkout policy, first falsifying probe, stop rule, evidence destination, review gates, reconciliation owner, and companion join when applicable. Missing material fields block execution; do not guess them.
7. Implement the smallest complete slice inside that envelope. Run the first falsifying probe early, then focused adversarial tests, the full applicable gate, and required review against exact snapshots. Correct accepted findings and repeat only the affected verification loop. Do not harden governance, hooks, review control, or unrelated infrastructure unless the claimed product vertical explicitly requires it.
8. Persist evidence, review dispositions, decisions, invalidations, dependency pins, and operational state in their owning surfaces. A parallel lane may seal as an evidence candidate but may not verify its covered product claims or unlock ordinary successors before its companion join.
9. Close or seal the leased vertical with evidence and reconcile the ledger atomically. If closure makes a companion join ready, claim that exact join only when this worker satisfies its integration and checkout authority. The join runs combined probes and review, then atomically reconciles the cohort, product claims, evidence, decisions, and ledger state.
10. Release the completed lease, reconstruct durable state, derive the new frontier, and repeat. The graph and atomic claim results decide what this worker receives next; the worker does not carry forward yesterday's selection.

For a Beads ledger, use its native atomic operations: `bd ready --json`, `bd update <id> --claim --json`, and `bd close <id> --suggest-next --json` with evidence in the owning record. A failed claim is contention, not permission to proceed. Do not poll while another worker owns the only reachable work; report the exact waiting edge and resume when durable state changes.

The same goal must be safe for N workers. Parallel mutation requires an operational ledger, explicit owners, independently falsifiable verticals, compatible scopes, and a pre-created companion join for every released cohort. Each worker holds at most one mutating lease; read-only verifier fan-out must target one immutable snapshot.

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
- `reconcile_via` for a released cohort lane, plus a companion whose `join_for` names the exact cohort.

If the ledger cannot represent these fields directly, link one durable release record from the vertical. Do not copy them into the goal.
