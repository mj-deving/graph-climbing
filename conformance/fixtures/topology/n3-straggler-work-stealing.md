# Intent

> Keep independent work moving while one lane in a three-way cohort remains under review.

# Desired State

Two sealed lanes release their workers without releasing their reservations; a disjoint second cohort remains claimable.

# Boundaries

## Out of Scope

- Bypassing either companion join.

## Constraints

- Sealed scopes remain reserved through their join.

# Done Criteria

### C-1: Fast output A is ready for integration

- status: open
- depends_on: []
- probe: bun test test/a.test.ts
- evidence: none
- invalidated_by: []

### C-2: Fast output B is ready for integration

- status: open
- depends_on: []
- probe: bun test test/b.test.ts
- evidence: none
- invalidated_by: []

### C-3: Slow output C survives adversarial review

- status: open
- depends_on: []
- probe: bun test test/c.test.ts
- evidence: none
- invalidated_by: []

### C-4: Independent output D is produced

- status: open
- depends_on: []
- probe: bun test test/d.test.ts
- evidence: none
- invalidated_by: []

### C-5: Anti: Independent lane E mutates no reserved scope

- status: open
- depends_on: []
- probe: bun test test/e.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

topology_contract: cohort-v1
current_slice: S-3

### S-1: Seal fast lane A

- status: sealed
- satisfies: [C-1]
- depends_on: []
- reconcile_via: S-JOIN-A
- owner: worker-a
- allowed_scope: [src/a/**]
- runtime_scope: [tmp/a]
- external_gates: []

### S-2: Seal fast lane B

- status: sealed
- satisfies: [C-2]
- depends_on: []
- reconcile_via: S-JOIN-A
- owner: worker-b
- allowed_scope: [src/b/**]
- runtime_scope: [tmp/b]
- external_gates: []

### S-3: Continue slow lane C

- status: active
- satisfies: [C-3]
- depends_on: []
- reconcile_via: S-JOIN-A
- owner: worker-c
- allowed_scope: [src/c/**]
- runtime_scope: [tmp/c]
- external_gates: []

### S-JOIN-A: Reconcile the straggler cohort

- status: planned
- satisfies: [C-1, C-2, C-3]
- depends_on: [S-1, S-2, S-3]
- join_for: [S-1, S-2, S-3]
- owner: none
- allowed_scope: [src/a/**, src/b/**, src/c/**]
- runtime_scope: [tmp/join-a]
- external_gates: []

### S-4: Build independent lane D

- status: planned
- satisfies: [C-4]
- depends_on: []
- reconcile_via: S-JOIN-B
- owner: none
- allowed_scope: [src/d/**]
- runtime_scope: [tmp/d]
- external_gates: []

### S-5: Build independent lane E

- status: planned
- satisfies: [C-5]
- depends_on: []
- reconcile_via: S-JOIN-B
- owner: none
- allowed_scope: [src/e/**]
- runtime_scope: [tmp/e]
- external_gates: []

### S-JOIN-B: Reconcile the independent cohort

- status: planned
- satisfies: [C-4, C-5]
- depends_on: [S-4, S-5]
- join_for: [S-4, S-5]
- owner: none
- allowed_scope: [src/d/**, src/e/**]
- runtime_scope: [tmp/join-b]
- external_gates: []

# Decisions

- Sealed workers may claim S-4 and S-5; S-JOIN-A still waits for S-3.

# Verification

- The active frontier contains S-3, S-4, and S-5 but not either join.
