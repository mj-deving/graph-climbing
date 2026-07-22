# Spec and ledger options

Graph Climbing specifies functions, not a mandatory tool stack.

## Product authority

The product authority must preserve:

- human intent and desired state;
- boundaries and critical anti-claims;
- stable atomic done criteria;
- falsifying probes;
- dependencies and vertical slices;
- official status, decisions, invalidation, and evidence references.

The reference `SPEC.md` is sufficient. An ISA can provide a deeper version of the same contract. Other specification systems are usable when they preserve the functions above and remain the single authority for product meaning.

The default profile is claim-first. A `Done Criteria` section is enough for `graph-check` to derive:

```text
claim_frontier = open claims whose dependencies are verified
frontier_kind = claim
active_frontier = claim_frontier
```

In checker output, `blocked` also includes open nodes whose prerequisites are not yet verified; it is a derived bucket, not only the literal `blocked` status.

## Operational ledger

No ledger is needed for short serial work. Add one when ownership, debt, external gates, or dependencies must survive sessions or coordinate writers.

The ledger stores what is owed and who owns it. It does not duplicate the detailed product criteria. Beads, GitHub Issues, Linear, or an existing project tracker may serve this role.

## Optional Work Graph profile

Add a `Work Graph` only when a run is long, an external gate must survive context loss, or multiple workers need durable ownership. In this profile, `active_frontier` contains executable verticals and `frontier_kind` is `vertical`.

```markdown
# Work Graph

current_slice: S-2

### S-2: Reject malformed input

- status: active
- satisfies: [C-2, C-2.1]
- depends_on: [S-1]
- owner: worker-cli
- allowed_scope: [src/cli/**, test/cli/**]
- runtime_scope: [tmp/cli-worker]
- external_gates: []
```

A vertical may contain an internal chain of dependent claims when at least one entry claim is on the claim frontier and every unfinished internal dependency is included in that vertical. External claim dependencies must already be verified.

An execution edge is justified only when downstream work consumes upstream data, an artifact, verified product state, an authority decision, an external gate, or evidence required by its probe. Written order is not a dependency. A read of a file another lane changes creates an edge even when the write scopes differ.

## Select topology without changing truth

The claim graph remains invariant while execution may be serial, pipelined, routed, or fan-out/fan-in:

- use serial execution for causal coupling or shared authority;
- pipeline item-local stages when no stage needs the complete upstream set;
- use fan-out/fan-in for isolated product lanes converging on one snapshot;
- route only from validated observed output;
- run read-only verifier fan-out against one immutable snapshot.

A barrier is justified by a cross-set operation, combined authority decision, shared release, or central reconciliation. Deterministic flattening, filtering, and deduplication belong in code.

## N-way companion reconciliation

Parallel released verticals require explicit owners, disjoint file and runtime scopes, no unfinished dependency between lanes, and one pre-created companion reconciliation vertical. Owner identity and staggered activation do not remove the join requirement.

New graphs opt into mechanical enforcement with `topology_contract: cohort-v1` directly below `# Work Graph`. Existing graphs without it remain readable and receive a warning when several lanes appear released; migrate in-flight work at its next safe boundary.

`sealed` means a cohort lane has a clean reviewed evidence candidate but is not integrated product truth. It unlocks no ordinary successor. `join_for` marks the one reconciliation vertical covering the complete released set:

```markdown
topology_contract: cohort-v1
current_slice: S-JOIN

### S-2: Build one isolated lane

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-2
- allowed_scope: [src/two/**]
- runtime_scope: [tmp/two]
- external_gates: []

### S-JOIN: Integrate and reconcile the cohort

- status: planned
- satisfies: [C-2, C-3]
- depends_on: [S-2, S-3]
- join_for: [S-2, S-3]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []
```

The join rules are cardinality-independent:

- `join_for` contains at least two distinct existing non-join lanes and exactly equals `depends_on`;
- every non-dropped member names that join with `reconcile_via`, making independent cohorts durable and preventing status changes from redefining membership;
- `satisfies` exactly equals the union of cohort claims, never a superset;
- a lane belongs to one live join; independent release sets may have separate joins;
- no cohort lane has a direct or transitive unfinished dependency on another member;
- unfinished claim-graph dependencies between member lanes are equally invalid;
- the join enters the frontier only after every cohort lane is sealed;
- cohort completion is one atomic owning-surface update verifying lanes, join, and exactly the covered claims;
- verified lanes and their join share one snapshot-bound `completion_evidence`; later claim reopens retain new finding evidence without erasing that historical completion;
- a rejected candidate returns its lane to active and the join to planned while unaffected siblings remain sealed;
- withdrawal drops the old lane/join as history and pre-creates a replacement join; a remaining singleton reactivates and reconciles serially;
- cohort-dependent successors block on the join, not only a lane.

Existing in-flight parallel work may add its companion at the next safe boundary without interrupting an active review. New cohorts create it before release. Reconciliation remains central: workers return evidence candidates; one integrator updates product authority and operational state.

The contract remains installed after a join, but a single released lane may still execute serially without `reconcile_via`. Pending cohort scopes remain isolated across cohorts and from concurrent active outsiders. An active join is checked against foreign pending cohorts and active work; overlap with its own sealed inputs is the intended integration operation.

For deterministic overlap checks, parallel scopes use repo-relative POSIX paths, a terminal `/**` for recursive ownership, or `*`/`**` for intentionally global ownership. Root escapes, absolute paths, backslashes, and other glob syntax are rejected.

## Evidence

Start with Git, tests, runtime observations, and existing CI. Add structured review or release artifacts only when a real provenance or authority requirement exists.

## Optional runtime support

Durable goals, lifecycle hooks, schedulers, and outer supervisors may improve liveness or enforcement. They are not the memory or truth layer and are excluded from the default setup.

When a goal runtime is present, its contract should describe the worker algorithm rather than duplicate a current task. Give every worker the same [`starter/GOAL.md`](../starter/GOAL.md): reconstruct durable state, resume an existing owned lease or derive the admitted ready set, atomically lease one vertical, execute and reconcile it, release the lease, then derive again. The lease is exclusive and bounded; the goal persists across leases. Mutable lane IDs, review-round numbers, pins, and progress stay in the ISA/spec, ledger, Git, and evidence.

N mutating workers require one atomic ledger even though a proven single-writer adoption does not. Initial activation and replacement share a clean barrier: pause or terminate every mutating worker, reconcile or withdraw every prior lease, seal, reservation, and join, then let one central owner publish an immutable run epoch. It binds graph/product base, execution-graph revision, candidate IDs, canonical envelope hashes, and proof that every pair whose reservation lifetimes can overlap is compatible. A reservation runs from claim through direct reconciliation or cohort join. Workers verify epoch and hash immediately before and after claim; mismatch causes release without mutation. The unchanged goals resume afterward.

Git-backed product truth and an external ledger cannot share a physical transaction. Reconciliation is therefore logically atomic and crash-recoverable: persist one reconciliation record with exact snapshots, commit product truth and evidence, then close the ledger with the same ID and commit reference. Resume replays incomplete records idempotently. Any mismatch blocks downstream work.

An operational lease ID is single-assignment to one stable vertical and canonical release-envelope hash. Recovery first fences the old worker and resolves or invalidates every incomplete reconciliation record, then tombstones that lease ID and creates a new one. A reconciliation record may write product truth only while its bound lease remains active/current; tombstoned records become superseded. Exact-ID close happens last. This avoids stale replay mutating truth or closing a replacement without requiring a compare-and-swap feature the ledger may not provide.
