# Graph Climbing

A compact protocol for long-running engineering. Give this file to a coding agent. Reference kit and evidence: [mj-deving/graph-climbing](https://github.com/mj-deving/graph-climbing).

## 1. Thesis

Runtime is a loop; work is a graph. Engineering has prerequisites, branches, gates, reopens, and joins; linear plans decay as evidence changes.

Graph Climbing ties bounded work to claims and snapshot evidence. Model once; schedule many ways. Minimal system:

```text
one product authority + existing tests and Git + one agent
```

Use repository-native artifacts. Do not install orchestration merely for this protocol. Every rule must prevent a failure.

## 2. Vocabulary

- **claim graph**: durable product authority: atomic falsifiable claims plus dependencies.
- **claim frontier**: open claims with verified dependencies and no blocker or unknown.
- **active frontier**: executable selection set: claims without an Execution Graph, verticals with one.
- **vertical**: bounded unit over reachable claims.
- **Execution Graph / ledger**: optional state for runs, gates, ownership, debt, or multiple workers. It does not define product truth.
- **evidence**: observation tied to an exact code, artifact, dependency, or runtime snapshot.
- **climb**: one `derive → select → build → verify → reconcile` iteration.
- **Graph Climbing**: the complete protocol across repeated climbs.
- **reconcile**: write claim status, evidence, decisions, and operational state back to their owning durable surfaces.

An ISA, PRD, or repository-native spec can implement the claim graph. Beads, GitHub Issues, or another tracker can implement the optional ledger. Goal runtimes and supervisors can support liveness; none is required.

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

Progress is non-monotonic. Only an accepted finding verified against its snapshot may reopen or add claims. Record rebuttal or deferral reasons.

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

A blocked claim or gate must not suppress reachable claims. Do not follow stale plans after evidence changes the graph.

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
Operate as one persistent Graph Climbing worker. Reconstruct durable state at resume and reconciliation. Resolve `serial-no-ledger`, `serial-ledger`, or `N-worker-epoch`. Before steering, resume a serial ledger lease by exact ID or an N-worker lease only when epoch and envelope hash match; foreign ownership needs authorized recovery. A ledgerless single writer reconstructs work from product truth, Git, and evidence. Lease-local steering cannot change its envelope. Otherwise derive the frontier. With N writers, claim only from one immutable run epoch published after prior workers pause or terminate and every lease, seal, reservation, and join reconciles or withdraws. It binds graph revision and canonical envelope hashes proven compatible for every pair whose reservations can overlap from claim through direct reconciliation or cohort join. Verify epoch and hash before and after atomic claim; mutate nothing on mismatch. Regraph behind the same barrier, then resume unchanged goals. Claim one candidate in ledger priority and stable-ID order; losers refresh. Execute and verify the envelope. Reconcile stores through one durable record: commit truth and evidence, then close the ledger with the same ID; replay incomplete records. A cohort lane verifies no claim before its join. Claim a join only with integration and checkout authority. Release, derive, and continue. No ready work is not completion. Complete only when durable truth verifies all in-scope claims and joins; stop at unsafe authority, scope, base, gate, public-write, spend, or irreversible-action boundaries.
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
- a tracker becoming a second product specification;
- snapshot-free evidence that cannot be replayed;
- blocked external work freezing independent local work;
- parallel writers sharing files or runtime state;
- dependency edges that carry only written order;
- sealed work treated as verified before its join;
- cohorts released without a durable convergence point;
- review infrastructure recursively hardening itself;
- commit-per-climb, custom locking, or global ID machinery without an observed need.

The DACS agent-template origin used ISA claims for truth, Beads for execution, and exact test/review snapshots for evidence. The active run has an [interim field report](https://github.com/mj-deving/graph-climbing/blob/main/case-studies/dacs-agent-template.md); final Graph Climbing and DACS Forge studies remain separate.

## 9. First actions and falsification

Start now:

1. Inspect instructions, product authority, tracker, Git, tests, evidence, and external pins.
2. Name the authority map. Adopt an adequate product authority; create a small repository-native spec only when none exists.
3. Preserve intent, boundaries, stable atomic claims, dependencies, probes, status, decisions, and evidence. Keep unresolved semantics `unknown` and outside the frontier.
4. Derive and report `claim_frontier`, `frontier_kind`, and `active_frontier`.
5. Select one bounded vertical and its first falsifying probe. Add no ledger unless the scaling conditions already exist.
6. Execute one climb, reconcile, derive again, and continue while reachable work remains.

Graph Climbing is failing when a fresh operator cannot reconstruct the frontier, claims close without matching evidence, review findings change truth without verification, spec and ledger compete, coordination costs more than parallel work returns, or a strong agent must remember state absent from durable artifacts. Track closure integrity, reopen rate, spec-ledger divergence, time to derive the next frontier, review yield, and governance overhead. Change the protocol only when those observations justify it.

## License

MIT
