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

Parallel active verticals require different explicit owners and disjoint file and runtime scopes. Reconciliation remains central: workers return evidence candidates; one integrator updates the product authority and operational ledger.

For deterministic overlap checks, parallel scopes use repo-relative POSIX names/paths, a terminal `/**` for recursive directory ownership, or `*`/`**` for intentionally global ownership. Root escapes, absolute paths, backslashes, and other glob syntax are rejected instead of being treated as proven isolation.

## Evidence

Start with Git, tests, runtime observations, and existing CI. Add structured review or release artifacts only when a real provenance or authority requirement exists.

## Optional runtime support

Durable goals, lifecycle hooks, schedulers, and outer supervisors may improve liveness or enforcement. They are not the memory or truth layer and are excluded from the default setup.
