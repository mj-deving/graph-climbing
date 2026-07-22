# Intent

> Reconcile two independently sealed product verticals.

# Desired State

Both changes become product truth only through one combined reconciliation vertical.

# Boundaries

## Out of Scope

- Automatic merging.

## Constraints

- Sealed lanes are evidence candidates, not verified predecessors.

# Done Criteria

### C-1: Parser accepts the new record form

- status: open
- depends_on: []
- probe: bun test test/parser.test.ts
- evidence: none
- invalidated_by: []

### C-2: Anti: Invalid records mutate no stored state

- status: open
- depends_on: []
- probe: bun test test/store.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-JOIN

### S-1: Implement parser compatibility

- status: sealed
- satisfies: [C-1]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-parser
- allowed_scope: [src/parser/**, test/parser.test.ts]
- runtime_scope: [tmp/parser-worker]
- external_gates: []

### S-2: Harden invalid-record storage

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-store
- allowed_scope: [src/store/**, test/store.test.ts]
- runtime_scope: [tmp/store-worker]
- external_gates: []

### S-JOIN: Integrate and reconcile the two-lane cohort

- status: planned
- satisfies: [C-1, C-2]
- depends_on: [S-1, S-2]
- join_for: [S-1, S-2]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []

# Decisions

- One companion join was created before either lane started.

# Verification

- Both lane seals are candidates until S-JOIN completes.
