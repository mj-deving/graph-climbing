---
name: graph-climbing
description: "Bootstrap, audit, and reconcile durable work graphs for long-running engineering. Use when adopting Graph Climbing in a repository, turning an existing spec into stable done criteria and vertical slices, determining active/ready/blocked work, checking claim/evidence divergence, planning safe parallel lanes, or reconciling completed work back into the authoritative spec without adding an orchestration platform."
---

# Graph Climbing

Operate on the repository's durable product authority, optional execution ledger, and observed evidence. Hold no private state. Build no control plane.

## Route

- Bootstrap or adopt a work graph: read `references/bootstrap.md`.
- Audit correctness, frontier, blockers, or parallelism: read `references/audit.md`, then run `scripts/graph-check.ts` when the spec follows the reference format.
- Reconcile a completed slice, finding, steer, or drift event: read `references/reconcile.md`.
- Install one task-free contract into a durable goal runtime or N workers: use `assets/GOAL.md` verbatim; keep concrete work in the graph and ledger.

## Invariants

- Keep one product authority for intent, desired state, boundaries, done criteria, decisions, and official progress.
- Keep at most one operational ledger for ownership, debt, dependencies, and external gates.
- Treat tests, Git, runtime probes, reviews, and release artifacts as evidence, not competing authorities.
- Preserve stable claim IDs. Split with child IDs; retain dropped IDs as tombstones.
- Require one falsifying probe per leaf claim and claim-matched evidence before verification.
- Derive the claim frontier from open claims with verified dependencies. Without an execution graph, it is the active frontier.
- Treat a Work Graph as an optional scaled profile. With one, the active frontier contains executable verticals rather than claims.
- Treat review as a falsifier. Only an accepted finding verified against the relevant snapshot may reopen or add a claim.
- Keep uncertainty separate from verified completion.
- Treat an edge as real only when downstream work consumes upstream data, an artifact, verified state, authority, a gate, or probe-required evidence. Written order alone is not an edge.
- Keep the claim graph invariant while selecting serial, pipeline, router, fan-out/fan-in, or verifier execution topology.
- Prefer one bounded vertical. Parallelize only with explicit owners and proven dependency, file/read, runtime, and authority isolation.
- For every released N-way product cohort, opt into `topology_contract: cohort-v1` and pre-create one companion reconciliation vertical. Each lane names it with `reconcile_via`; its `join_for` returns the exact set. A sealed lane is an evidence candidate, never a verified predecessor.
- Run the inner probe/Autoreview loop per lane and combined probes/review at the companion join. Reconcile cohort completion atomically.
- When a goal runtime is used, give every worker the same persistent worker contract. Each worker atomically leases at most one compatible mutating vertical, reconciles it, then re-derives and competes for the next graph-ready lease. The goal names no current task.
- Resolve `serial-no-ledger`, `serial-ledger`, or `N-worker-epoch` before work. Every ledger lease ID is single-assignment to one vertical and envelope hash. Only the declared reconciliation owner writes product truth in an exclusive authority workspace; recovery is forbidden during commit-to-close and otherwise requires a stopped-writer barrier for that scope. Recovery resolves incomplete records, tombstones the old lease, then creates a new ID.

## Boundaries

- Do not require ISA, Beads, a goal runtime, hooks, dashboards, or continuous supervision. When several mutating workers run, require one atomic operational ledger even though its implementation remains optional.
- Do not overwrite an existing specification during bootstrap.
- Do not turn a task ledger into a second product specification.
- Do not automatically close claims, execute irreversible actions, publish, or repair audit findings.
- Do not recursively harden governance or this skill during product work.

## Output

Use terse fields:

```text
mode: bootstrap|audit|reconcile
product_authority:
operational_ledger:
evidence_sources:
claim_frontier:
frontier_kind: claim|vertical
active_frontier:
divergences:
unknowns:
next_product_action:
```

In audit mode, make no writes. In bootstrap and reconcile modes, describe the owning-surface changes before applying them and report exact files and evidence afterward.
