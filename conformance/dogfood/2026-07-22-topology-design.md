# Topology-Invariant Graph Design Review Packet

Status: revised after Fable review, pre-implementation

## Review question

Does this design add the smallest semantics needed to preserve product truth and verification quality across serial, pipeline, and N-way fan-out/fan-in execution, while preventing a sealed parallel lane from being mistaken for integrated product progress?

## Inputs

- The existing layered claim-first Graph Climbing V2 contract.
- The observed DACS Forge two-lane pilot: one lane sealed before the other and therefore needed a durable integration/reconciliation successor.
- Codez Graph Engineering vocabulary: real edges carry data, artifacts, or required state; pipeline avoids unnecessary barriers; a verifier can guard an edge; worktrees isolate parallel writers.

Vendor-specific orchestration APIs are not part of this design.

## Proposed decision

Keep one invariant claim graph and derive the execution topology from its current frontier.

An edge is justified only when downstream work consumes upstream data, an artifact, verified product state, an authority decision, an external gate, or snapshot-bound evidence required by its probe. Written order alone is not a dependency.

At planning time:

1. derive reachable atomic claim closures;
2. merge closures that share dependencies, file/read scope, runtime state, authority, probe, or stop rule;
3. compare serial, pipeline, fan-out/fan-in, router, and read-only verifier shapes;
4. release only a proven-safe, value-positive set.

The permanent claim graph does not change when the execution topology changes.

## Proposed Work Graph delta

Add one opt-in Work Graph contract, one vertical status, and two reciprocal optional fields:

- `topology_contract: cohort-v1` enables strict cohort enforcement while legacy graphs remain readable;
- `status: sealed` means the lane has a clean reviewed evidence candidate but has not been centrally integrated or reconciled.
- `reconcile_via: S-JOIN` binds a cohort lane durably to its companion.
- `join_for: [S-1, S-2, ...]` marks a companion reconciliation vertical for one N-way cohort.

`sealed` is valid only for a lane covered by one live companion join. A serial vertical moves directly from `active` to `verified` in the same central reconciliation change that verifies its claims.

A companion reconciliation vertical:

- has at least two cohort lanes;
- lists the same lanes in `depends_on` and `join_for`;
- is named by every non-dropped cohort lane through `reconcile_via` and by no non-member;
- covers exactly the union of the cohort claims in `satisfies`, with no missing or additional claim;
- becomes ready only when every cohort lane is `sealed`;
- cannot name itself, another companion join, a missing lane, or the same lane twice.

A cohort lane:

- may seal while its claims remain open;
- cannot be published as verified while its companion join remains incomplete;
- never unlocks an ordinary successor while merely sealed.

Every release set of two or more product-mutating lanes that converges on one product snapshot must share exactly one pre-created companion join, regardless of owner identity or staggered activation. Reciprocal membership keeps the cohort stable when a lane blocks, gates, or returns to work and permits independent declared cohorts in the same Work Graph. A strict graph rejects a concurrently released outsider without reconciliation membership. The join is a bounded reconciliation vertical, so the public `frontier_kind: claim | vertical` interface remains unchanged.

## State transitions

```text
lane: planned -> active -> sealed -> verified
join: planned ----------------> active -> verified
                            all lanes sealed

rework: lane sealed -> active; join active -> planned
retire: lane or join -> dropped; replacement join is pre-created
```

The final cohort transition is one mandatory atomic owning-surface change: all cohort lanes move `sealed -> verified`, the join moves `active -> verified`, and exactly the covered claims become verified together. The checker validates published snapshots; no sequential intermediate state is valid or publishable.

When combined probes or review reject a candidate, the affected lane moves `sealed -> active`, an active join returns to `planned`, and unaffected siblings remain sealed. Accepted verified findings may reopen or add claims before the lane reseals.

When a lane is withdrawn, mark the lane and old join `dropped` as history. Before work resumes, create a replacement join covering the exact remaining release set. If fewer than two lanes remain, reactivate the surviving lane and reconcile it serially; a non-cohort lane cannot remain sealed.

## Topology rules

- Serial: use when dependencies or shared authority make isolation false or negative-value.
- Pipeline: use when each item can advance independently; do not persist a barrier merely because stages are named separately.
- Fan-out/fan-in: use for disjoint worker verticals that must converge on one product snapshot.
- Router: branch from validated observed output, not from hidden agent judgment.
- Verifier fan-out: run independent read-only falsifiers on one immutable snapshot; central disposition remains singular.

The durable Work Graph records dependency, ownership, and reconciliation boundaries. It does not record every transient pipeline item or runtime event.

## Quality invariants

- One product authority and stable claim IDs.
- One mutating owner per checkout and authority seam.
- Exact clean base for every released lane.
- Bounded file/read and runtime scopes.
- Snapshot-bound evidence.
- Per-lane build, probe, review, disposition, and correction loop.
- Combined probes and review at the join.
- Only accepted and verified findings may reopen claims.
- Progress may decrease.
- Sealed-but-unintegrated work is not a verified predecessor.

## Mechanical validation matrix

- Existing claim-only and serial Work Graph documents stay compatible.
- N=2, N=3, and N=4 cohorts pre-create one join; the checker derives that join into the active frontier only after every lane seals.
- An ordinary successor remains blocked by a sealed predecessor.
- A missing companion join invalidates a released parallel cohort.
- A join whose `join_for` differs from `depends_on` is invalid.
- A join whose `satisfies` differs from the exact cohort claim union is invalid.
- A lane cannot participate in two live companion joins.
- Parallel file and runtime collisions remain invalid.
- A verified lane with an unfinished join is invalid.
- A verified join with an unverified lane or claim is invalid.
- A sealed lane with no live companion join is invalid.
- A join with fewer than two distinct existing lanes is invalid.
- A join cannot contain itself or another join.
- Reciprocal membership cannot omit a lane, add a lane, or point at a missing/dropped/non-join target.
- Independent cohorts and unrelated serial work are not collapsed into one global release set.
- A cohort cannot contain direct or transitive unfinished dependencies between its lanes.
- A verified join requires every member lane and covered claim to be verified in the same published snapshot.
- An active join participates in scope-isolation checks against other active writers.
- A rejected join candidate can demote one lane and the join without unsealing unaffected siblings.
- A dropped lane requires the old join to drop and a replacement join to cover the remaining N-way set.
- Existing in-flight parallel work may add its companion join at the next safe boundary; new cohorts must pre-create it before release.
- Legacy graphs without `cohort-v1` remain compatible but cannot claim mechanically enforced companion joins.

## Rejected expansion

- No new global ID grammar.
- No lock service or scheduler.
- No mandatory execution graph for short serial work.
- No per-lane topology enum or scheduler state; the observed legacy/strict ambiguity is bounded by one versioned Work Graph contract.
- No model-specific workflow API in the protocol.
- No automatic merge, claim closure, or publication.

## Requested Fable disposition

Identify contradictions, invalid state transitions, compatibility breaks, under-specified N-way behavior, ways an invalid cohort could pass, and any rule that adds ceremony without preventing an observed failure. Prefer deletion or a smaller invariant over additional fields.

## Fable review disposition

Review command: `autoreview --mode local --engine claude --model claude-fable-5 --thinking max`

Executed model: `claude-fable-5`; reported cost: USD 1.769791.

All ten Fable findings were accepted:

- circular lane/join completion -> mandatory atomic cohort transition;
- missing rework/cancellation -> demotion plus existing `dropped` tombstone and replacement join;
- owner/timing loophole -> release-set trigger independent of owner and simultaneous activity;
- join claim superset -> exact union;
- ambiguous derive wording -> pre-created node, frontier-derived only after all lanes seal;
- unreachable `sealed or verified` branch -> sealed only;
- non-cohort sealed ambiguity -> sealed restricted to live cohort lanes;
- split cohort loophole -> exact reciprocal membership for every release set;
- in-flight compatibility gap -> next-safe-boundary migration rule;
- missing structural cases -> explicit N=1, duplicate, missing, self, and nested-join failures.

Fable did not initially require another persisted field. The implementation Autoreview then falsified that conclusion: status-derived global membership rejected independent cohorts and changed membership when a lane blocked. That concrete failure justified `reconcile_via` as the second optional field.

## Implementation Autoreview disposition

Review command: `autoreview --mode local --engine codex --model gpt-5.6-sol --thinking high`

The first implementation pass produced four P1 findings; all were accepted:

- a verified join could coexist with unverified lanes/claims -> enforce the inverse atomic invariant;
- global released-lane inference collapsed independent cohorts -> use reciprocal durable membership;
- dependent cohort lanes could form an unreachable join -> reject direct or transitive intra-cohort dependencies;
- active joins were omitted from collision checks -> include them against all concurrent active writers.

Regression cases cover each correction. Final review status is recorded after the clean rerun.

The second implementation pass produced three P1 findings; all were accepted:

- reciprocal fields could still be omitted entirely -> add the opt-in `cohort-v1` version boundary and reject undeclared released lanes under it;
- slice dependencies were checked but authoritative claim dependencies were not -> reject unfinished cross-lane paths in both graphs;
- pending sealed scopes were isolated only within their own cohort -> check them across cohorts and against active outsiders.

The third implementation pass produced three P1 findings and one P3 documentation mismatch; all were accepted:

- a covered claim could verify before its join -> reject partial product-truth publication;
- persistent strict mode rejected later serial work and singleton fallback -> require membership only when at least two lanes are concurrently released;
- active joins were not compared with foreign pending cohorts -> add the missing cross-set scope check;
- the missing-companion fixture described a dangling target while testing omission -> correct the fixture contract.

The fourth implementation pass produced one P1 compatibility finding; accepted:

- strict same-owner isolation had leaked into legacy graphs -> retain the historical same-owner serialization exemption outside `cohort-v1`, while strict cohorts remain owner-independent.

The fifth implementation pass produced one P1 reachability finding; accepted:

- owner-bound planned work was classified as released before its claim dependencies were reachable -> reuse the frontier's claim-reachability predicate for release inference.

The sixth implementation pass produced one P1 non-monotonicity finding; accepted:

- verified joins permanently coupled current claim status -> bind atomic completion to matching lane/join `completion_evidence`, then permit independently evidenced later claim reopens.

The seventh implementation pass was clean: no accepted or actionable findings; overall correctness `patch is correct`, confidence `0.93`.
