# Intent

> Reconcile four independently sealed product verticals.

# Desired State

All four changes become product truth through one N-way reconciliation vertical.

# Boundaries

## Out of Scope

- Background integration.

## Constraints

- Every worker uses isolated files and runtime state.

# Done Criteria

### C-1: Request parsing accepts the canonical shape

- status: open
- depends_on: []
- probe: bun test test/request.test.ts
- evidence: none
- invalidated_by: []

### C-2: Response encoding remains canonical

- status: open
- depends_on: []
- probe: bun test test/response.test.ts
- evidence: none
- invalidated_by: []

### C-3: Recovery retains the last valid state

- status: open
- depends_on: []
- probe: bun test test/recovery.test.ts
- evidence: none
- invalidated_by: []

### C-4: Anti: Logging persists no credential material

- status: open
- depends_on: []
- probe: bun test test/logging.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-JOIN

### S-1: Implement canonical request parsing

- status: sealed
- satisfies: [C-1]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-request
- allowed_scope: [src/request/**, test/request.test.ts]
- runtime_scope: [tmp/request-worker]
- external_gates: []

### S-2: Implement canonical response encoding

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-response
- allowed_scope: [src/response/**, test/response.test.ts]
- runtime_scope: [tmp/response-worker]
- external_gates: []

### S-3: Prove recovery behavior

- status: sealed
- satisfies: [C-3]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-recovery
- allowed_scope: [src/recovery/**, test/recovery.test.ts]
- runtime_scope: [tmp/recovery-worker]
- external_gates: []

### S-4: Harden log redaction

- status: sealed
- satisfies: [C-4]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-logging
- allowed_scope: [src/logging/**, test/logging.test.ts]
- runtime_scope: [tmp/logging-worker]
- external_gates: []

### S-JOIN: Integrate and reconcile the four-lane cohort

- status: planned
- satisfies: [C-1, C-2, C-3, C-4]
- depends_on: [S-1, S-2, S-3, S-4]
- join_for: [S-1, S-2, S-3, S-4]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []

# Decisions

- Cardinality changes no join rule; N=4 uses the same exact-set contract as N=2.

# Verification

- The join is the only executable frontier after every lane seals.
