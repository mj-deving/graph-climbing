# Intent

> Reconcile three independently sealed product verticals.

# Desired State

All three changes become product truth through one N-way reconciliation vertical.

# Boundaries

## Out of Scope

- Automatic publication.

## Constraints

- The cohort has one integration authority.

# Done Criteria

### C-1: Input normalization preserves canonical values

- status: open
- depends_on: []
- probe: bun test test/input.test.ts
- evidence: none
- invalidated_by: []

### C-2: Output encoding remains deterministic

- status: open
- depends_on: []
- probe: bun test test/output.test.ts
- evidence: none
- invalidated_by: []

### C-3: Anti: Diagnostics expose no secret values

- status: open
- depends_on: []
- probe: bun test test/diagnostics.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-JOIN

### S-1: Normalize bounded input

- status: sealed
- satisfies: [C-1]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-input
- allowed_scope: [src/input/**, test/input.test.ts]
- runtime_scope: [tmp/input-worker]
- external_gates: []

### S-2: Encode deterministic output

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-output
- allowed_scope: [src/output/**, test/output.test.ts]
- runtime_scope: [tmp/output-worker]
- external_gates: []

### S-3: Redact diagnostics

- status: sealed
- satisfies: [C-3]
- depends_on: []
- reconcile_via: S-JOIN
- owner: worker-diagnostics
- allowed_scope: [src/diagnostics/**, test/diagnostics.test.ts]
- runtime_scope: [tmp/diagnostics-worker]
- external_gates: []

### S-JOIN: Integrate and reconcile the three-lane cohort

- status: planned
- satisfies: [C-1, C-2, C-3]
- depends_on: [S-1, S-2, S-3]
- join_for: [S-1, S-2, S-3]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []

# Decisions

- One join covers the complete released set.

# Verification

- Every sealed lane remains unverified until the atomic cohort transition.
