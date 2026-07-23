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

Seal is a scheduling boundary, not a global barrier. After the seal record is durable, its worker releases the mutating lease and derives again. The cohort/epoch, not that worker, retains the lane's file/read/runtime/authority reservation until the companion join reconciles. The freed worker may claim another ready vertical listed in `epoch_candidates` only when it is compatible with every pending reservation. Thus a slow review lane blocks its join and downstream consumers, while disjoint cohorts and independent frontiers can continue. Adding an unlisted candidate requires the normal regraph barrier.

Existing in-flight parallel work may add its companion at the next safe boundary without interrupting an active review. New cohorts create it before release. Reconciliation remains central: workers return evidence candidates; one integrator updates product authority and operational state.

The contract remains installed after a join, but a single released lane may still execute serially without `reconcile_via`. Pending cohort scopes remain isolated across cohorts and from concurrent active outsiders. An active join is checked against foreign pending cohorts and active work; overlap with its own sealed inputs is the intended integration operation.

For deterministic overlap checks, parallel scopes use repo-relative POSIX paths, a terminal `/**` for recursive ownership, or `*`/`**` for intentionally global ownership. Root escapes, absolute paths, backslashes, and other glob syntax are rejected.

## Evidence

Start with Git, tests, runtime observations, and existing CI. Add structured review or release artifacts only when a real provenance or authority requirement exists.

## Optional runtime support

Durable goals, lifecycle hooks, schedulers, and outer supervisors may improve liveness or enforcement. They are not the memory or truth layer and are excluded from the default setup.

### Worker contract

When a goal runtime is present, its contract describes only the worker algorithm. Give every worker the same fenced text from [`starter/GOAL.md`](../starter/GOAL.md): reconstruct durable state, derive the frontier, validate one compatible ready candidate and its envelope/epoch, claim it atomically, re-read those bindings, execute and verify it, reconcile it, close the exact lease last, then derive again. The candidate may be a vertical or companion join. The lease is exclusive and bounded; the goal persists across leases. Mutable lane IDs, review rounds, pins, progress, recovery procedures, and epoch mechanics stay out of the worker prompt.

This is an intentional control boundary. A worker stops on a stale binding, collision, barrier, or missing authority. It does not reproduce release-owner, recovery-owner, or regraph behavior from natural-language instructions.

### Release and operator contract

The small goal is safe only when the surrounding system makes the correct path easiest: invalid candidates are absent from the frontier, every ready lease links one complete immutable release envelope, atomic claim has one winner, and reconciliation has one durable exact-close route. These are graph, ledger, release-process, and operator obligations.

N mutating workers require one atomic ledger even though a proven single-writer adoption does not. Initial activation and replacement share a clean barrier: pause or terminate every mutating worker, reconcile or withdraw every prior lease, seal, reservation, and join, then let one central owner publish an immutable run epoch. It binds graph/product base, execution-graph revision, explicit `epoch_candidates` including future-ready verticals and joins, canonical envelope hashes, exclusive workspaces, and compatibility proof for every admitted pair whose reservations may overlap. A real dependency or own lane-to-join edge proves non-overlap; current graph state decides readiness. These immutable fields are persisted before a lease becomes Ready. Atomic claim binds the unique runtime incarnation as actor/assignee; workers immediately re-read every pre-bound field. They must not assume claim-time metadata flags share the claim compare-and-swap unless the installed ledger proves it. Mismatch permits no mutation. The unchanged goals resume afterward.

Git-backed product truth and an external ledger cannot share a physical transaction. Reconciliation is therefore logically atomic and record-replayable: persist one reconciliation record with exact snapshots, commit product truth and evidence, then close the ledger with the same ID and commit reference. Resume replays incomplete records idempotently. Any mismatch blocks downstream work.

An operational lease ID is single-assignment to one work item—vertical or companion join—plus its kind, envelope hash, workspace, authority, applicable epoch, and pre-created authority-scope recovery barrier ID. Release owner pre-binds these before Ready; claim CAS binds a unique incarnation. For Beads, use `<owner>@<incarnation>` with `bd update <id> --claim --actor <unique-incarnation> --json`, then re-read. Resume also requires an inactive barrier. Handoff proves the prior incarnation stopped and no reconciliation is in flight, then exclusively acquires its workspace. Otherwise claim the barrier atomically; losers stop. Its owner freezes claims, stops writers, and first replays or dispositions incomplete records. Only if work remains does it import or disposition state, tombstone, and create a pre-bound lease plus successor barrier. Close the barrier last. Owner loss freezes scope for external principal recovery; never timeout-steal. Recovery is forbidden during live commit-to-close.

If these substrate guarantees do not exist, do not encode approximations into a larger goal. Run a bounded one-shot task, remain serial, or stop until the missing authority is supplied.
