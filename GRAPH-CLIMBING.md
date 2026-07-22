# Graph Climbing

Engineering protocol: [mj-deving/graph-climbing](https://github.com/mj-deving/graph-climbing).

## 1. Thesis

Runtime loops; work forms a graph of prerequisites, branches, gates, reopens, and joins. Linear plans decay.

Graph Climbing ties work to claims and snapshot evidence. Model once; reschedule. Minimum:

```text
one product authority + existing tests and Git + one agent
```

Use native artifacts. Add orchestration only when needed. Rules prevent failures.

## 2. Vocabulary

- **claim graph**: product authority: atomic falsifiable claims plus dependencies.
- **claim frontier**: open claims with verified dependencies and no blocker or unknown.
- **active frontier**: executable selection set: claims without an Execution Graph, verticals with one.
- **vertical**: bounded unit over reachable claims.
- **Execution Graph / ledger**: optional state for runs, gates, ownership, debt, or workers; never product truth.
- **evidence**: observation tied to an exact code, artifact, dependency, or runtime snapshot.
- **climb**: one `derive → select → build → verify → reconcile` iteration.
- **Graph Climbing**: the complete protocol across repeated climbs.
- **reconcile**: write claim status, evidence, decisions, and operations to owning durable surfaces.

ISA, PRD, or native spec can implement the claim graph. Beads, GitHub Issues, or another tracker can implement the optional ledger. Goal runtimes may support liveness; none is required.

## 3. Kernel and authority

```text
claim graph + evidence + climber
                    + optional Execution Graph / ledger
```

Keep one authority per concern:

- product meaning and official progress belong to the claim graph;
- ownership, gates, and execution debt belong to at most one ledger;
- tests, reviews, Git, runtime observations, and releases supply evidence;
- the climber selects the next vertical but owns no hidden durable truth.

Brownfield adoption reuses authorities; generated views are not authorities.

## 4. Claim contract

Each leaf claim needs a stable ID, desired-state wording, status, dependencies, one falsifying probe, and snapshot-bound evidence when verified.

A claim is atomic when one probe yields one decision. Split independent failures. Preserve parents and dropped IDs; never reassign IDs.

Distinguish `verified`, `open`, `blocked`, `unknown`, and `dropped`; unknown means insufficient evidence or decision. Include a grounded `Anti:` claim.

Progress may fall. Only snapshot-verified accepted findings reopen or add claims; record rebuttal or deferral.

## 5. Frontier and verticals

Derive product reachability first:

```text
claim_frontier = open claims with all dependencies verified
```

Without an Execution Graph:

```text
frontier_kind = claim
active_frontier = claim_frontier
```

Choose a small, high-value vertical with bounded ownership. It may include dependent claims when one entry claim is reachable, every unfinished internal dependency is contained, and external dependencies are verified.

With an Execution Graph, derive executable verticals from claim reachability plus dependencies, gates, ownership, and scope:

```text
frontier_kind = vertical
active_frontier = executable verticals
```

Blocked work must not suppress reachable claims. Re-derive after evidence changes.

An edge is real only when downstream work consumes upstream data, an artifact, verified state, an authority decision, an external gate, or probe-required evidence. Written order alone is not a dependency. Reading a file another lane changes also creates an edge even when write scopes differ.

## 6. One climb

One climb is deliberately local:

1. **Derive** the claim frontier and, if present, the executable vertical frontier from current authorities and evidence.
2. **Select** one bounded vertical and name its claims, scope, owner, gates, and first falsifying probe.
3. **Build** freely inside that scope and the repository's safety boundaries.
4. **Verify** with claim-matched tests, runtime observations, review, and required release gates.
5. **Reconcile** status, snapshot evidence, decisions, invalidations, ownership, and debt into their owning surfaces.

Then derive again. Unreconciled results are candidates, not progress. A climb may close, reopen, or expose unknowns.

For a durable `/goal` runtime, give every worker the same task-free contract:

```text
Operate as one Graph Climbing worker. Reconstruct state at resume and reconciliation. Resolve `serial-no-ledger`, `serial-ledger`, or `N-worker-epoch`. Before Ready, the release owner pre-binds every ledger lease to one vertical, envelope hash, exclusive workspace, applicable epoch, and recovery barrier ID. Atomic claim binds only the unique runtime incarnation as actor/assignee; re-read every binding and assume no metadata CAS. Resume exact bindings; handoff proves the old incarnation stopped, no reconciliation is in flight, and exclusively acquires its workspace. Otherwise atomically claim the recovery barrier; losers stop. Its owner freezes claims, stops scope writers, then replays or dispositions incomplete records on active leases. Replay closes without replacement. Only if work remains may it resolve state, tombstone, and issue a pre-bound lease plus successor barrier; close the barrier last. Reconciliation owner writes truth in its authority workspace. Recovery is forbidden during live commit-to-close. A ledgerless single writer reconstructs from truth, Git, and evidence. Otherwise derive the frontier. With N writers, claim only from one immutable run epoch published after workers pause or terminate and every lease, seal, reservation, and join reconciles or withdraws. It binds graph revision and envelope hashes proven compatible for every pair whose reservations can overlap from claim through direct reconciliation or cohort join. Before and after claim verify the applicable epoch, hash, and inactive recovery barrier; mutate nothing on mismatch. Regraph behind the same barrier, then resume unchanged goals. Claim in ledger priority and stable-ID order. N-worker claim losers refresh; a serial race invalidates its profile. Execute and verify the envelope. Reconcile through a snapshot record; when ledger-backed it binds lease ID, hash, and applicable epoch, permits only the active current lease to commit idempotently, then closes that ID with reconciliation and commit references. Ledgerless reconciliation commits product truth and evidence from the record without a ledger. Tombstoned records are superseded. A cohort lane verifies no claim before its join. Claim a join only with integration and checkout authority. Release, derive, and continue. No ready work is not completion. Complete only when durable truth verifies all in-scope claims and joins; stop at unsafe authority, scope, base, gate, public-write, spend, or irreversible-action boundaries.
```

Before implementation, report:

```text
product_authority:
operational_ledger:
evidence_sources:
claim_frontier:
frontier_kind: claim|vertical
active_frontier:
selected_vertical:
first_probe:
unknowns:
```

## 7. Evidence and reconciliation

Evidence names its snapshot and observation. Match modality to claim; source inspection cannot prove runtime behavior.

Separate local verification of named claims at one snapshot from release certification, which also requires integration, provenance, and human gates.

Across boundaries, declare input authority, claim IDs, output snapshot, reconciliation destination, and provenance gaps. Workers return evidence candidates; they do not self-certify completion.

Reconciliation updates only owning surfaces: product truth in the claim graph, operational state in the ledger, observations in the evidence record, and temporary hints in current context. Stable history remains inspectable.

`completion_evidence` preserves a cohort's verified snapshot; later verified findings may reopen individual claims without rewriting historical lane completion.

## 8. Scaling and anti-patterns

Do not create a ledger for short serial work. Add an Execution Graph only for durable runs, gates, or multiple writers. Choose topology without changing the claim graph:

- **serial** for causal coupling or shared authority;
- **pipeline** when each item can advance independently;
- **fan-out/fan-in** for isolated lanes converging on one snapshot;
- **router** when validated output selects the next branch;
- **verifier fan-out** for independent read-only falsification of one snapshot.

Use a barrier only for a cross-set operation, shared release, or central reconciliation.

Every released N-way cohort needs explicit owners, compatible file/read/runtime/authority scopes, no unfinished inter-lane dependency, and one pre-created companion reconciliation vertical. Strict Work Graphs declare `topology_contract: cohort-v1`; each lane names `reconcile_via`, and the companion returns the exact set with `join_for`. A lane may become `sealed` after its own probe and review loop, but unlocks no ordinary successor. When all lanes seal, the companion runs combined probes and review, then atomically reconciles lane, join, claim, evidence, decision, and ledger state. Rejected work reactivates only affected lanes. Stay serial when coordination erases the gain.

Common failures:

- claim closure without claim-matched evidence;
- tracker as second product spec;
- unreplayable snapshot-free evidence;
- blocked work freezing independent work;
- parallel writers sharing file/runtime state;
- dependency edges that carry only written order;
- sealed work treated as verified before its join;
- cohorts released without a durable convergence point;
- review infrastructure recursively hardening itself;
- commit-per-climb, custom locking, or global ID machinery without an observed need.

DACS evidence: [field report](https://github.com/mj-deving/graph-climbing/blob/main/case-studies/dacs-agent-template.md). Separate final studies will follow.

## 9. First actions and falsification

Start now:

1. Inspect instructions, authorities, Git, evidence, pins.
2. Name authorities. Adopt an adequate product authority; create a native spec only when none exists.
3. Preserve intent, boundaries, claims, dependencies, probes, status, decisions, evidence. Keep unresolved semantics `unknown` outside the frontier.
4. Derive and report `claim_frontier`, `frontier_kind`, and `active_frontier`.
5. Select a bounded vertical and first falsifying probe. Add no ledger unless scaling conditions exist.
6. Climb, reconcile, and derive again while work remains.

Graph Climbing is failing when operators cannot reconstruct the frontier, claims close without matching evidence, review findings change truth without verification, spec and ledger compete, coordination costs more than parallel work returns, or an agent must remember state absent from durable artifacts. Track closure integrity, reopens, authority divergence, frontier latency, review yield, and governance overhead. Change only when justified.

## License

MIT
