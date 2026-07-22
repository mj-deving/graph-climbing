# Intent

> Demonstrate that a cohort successor cannot depend on a lane alone.

# Desired State

The checker requires the successor to block on central reconciliation.

# Boundaries

## Out of Scope

- Automatic dependency repair.

## Constraints

- Sealed evidence is not verified product truth.

# Done Criteria

### C-1: First cohort behavior exists

- status: open
- depends_on: []
- probe: bun test test/one.test.ts
- evidence: none
- invalidated_by: []

### C-2: Anti: Second cohort behavior corrupts no state

- status: open
- depends_on: []
- probe: bun test test/two.test.ts
- evidence: none
- invalidated_by: []

### C-3: Successor consumes reconciled cohort output

- status: open
- depends_on: [C-1, C-2]
- probe: bun test test/next.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-JOIN

### S-1: Build the first cohort behavior

- status: sealed
- satisfies: [C-1]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-one
- allowed_scope: [src/one/**]
- runtime_scope: [tmp/one-worker]
- external_gates: []

### S-2: Build the second cohort behavior

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-two
- allowed_scope: [src/two/**]
- runtime_scope: [tmp/two-worker]
- external_gates: []

### S-JOIN: Reconcile the cohort

- status: planned
- satisfies: [C-1, C-2]
- depends_on: [S-1, S-2]
- join_for: [S-1, S-2]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []

### S-NEXT: Consume the first lane prematurely

- status: planned
- satisfies: [C-3]
- depends_on: [S-1]
- owner: none
- allowed_scope: [src/next/**]
- runtime_scope: [tmp/next-worker]
- external_gates: []

# Decisions

- This fixture intentionally bypasses S-JOIN.

# Verification

- Expected checker error: cohort_successor_bypasses_join.
