# Intent

> Demonstrate that a released parallel cohort cannot omit reconciliation.

# Desired State

The checker rejects both released lanes because strict cohort metadata and its companion join are omitted.

# Boundaries

## Out of Scope

- Repairing the graph automatically.

## Constraints

- Parallel release requires durable convergence.

# Done Criteria

### C-1: First independent behavior exists

- status: open
- depends_on: []
- probe: bun test test/one.test.ts
- evidence: none
- invalidated_by: []

### C-2: Anti: Second behavior corrupts no first result

- status: open
- depends_on: []
- probe: bun test test/two.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-1

### S-1: Build the first behavior

- status: active
- satisfies: [C-1]
- depends_on: []
- owner: worker-one
- allowed_scope: [src/one/**]
- runtime_scope: [tmp/one-worker]
- external_gates: []

### S-2: Build the second behavior

- status: active
- satisfies: [C-2]
- depends_on: []
- owner: worker-two
- allowed_scope: [src/two/**]
- runtime_scope: [tmp/two-worker]
- external_gates: []

# Decisions

- Both released lanes intentionally omit `reconcile_via` and the pre-created companion join.

# Verification

- Expected checker error: released_lane_without_reconcile_via.
