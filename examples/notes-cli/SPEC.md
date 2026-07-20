# Intent

> Build a local notes CLI that remains understandable and safe under malformed input.

# Desired State

Users can add and list plain-text notes from a predictable local file. Malformed commands fail clearly without mutating stored notes.

# Boundaries

## Out of Scope

- Cloud synchronization, accounts, sharing, and rich-text editing.

## Constraints

- Bun runtime with no production dependencies.
- Notes remain readable as newline-delimited JSON.

# Done Criteria

### C-1: The CLI exposes an add command

- status: verified
- depends_on: []
- probe: bun run src/cli.ts --help
- evidence: fixture: documented baseline help output
- invalidated_by: []

### C-1.1: The CLI exposes a list command

- status: verified
- depends_on: []
- probe: bun run src/cli.ts --help
- evidence: fixture: documented baseline help output
- invalidated_by: []

### C-2: Add persists one valid note

- status: open
- depends_on: [C-1]
- probe: bun test test/add-note.test.ts
- evidence: none
- invalidated_by: []

### C-3: List returns persisted notes in insertion order

- status: open
- depends_on: [C-2]
- probe: bun test test/list-notes.test.ts
- evidence: none
- invalidated_by: []

### C-4: Anti: Malformed add input changes no stored bytes

- status: open
- depends_on: [C-1]
- probe: bun test test/invalid-add.test.ts
- evidence: none
- invalidated_by: []

# Work Graph

current_slice: S-2

### S-1: Establish the CLI contract

- status: verified
- satisfies: [C-1, C-1.1]
- depends_on: []
- owner: integrator
- allowed_scope: [src/cli.ts, README.md]
- external_gates: []

### S-2: Add one note safely

- status: planned
- satisfies: [C-2, C-4]
- depends_on: [S-1]
- owner: none
- allowed_scope: [src/cli.ts, src/store.ts, test/add-note.test.ts, test/invalid-add.test.ts]
- external_gates: []

### S-3: List persisted notes

- status: planned
- satisfies: [C-3]
- depends_on: [S-2]
- owner: none
- allowed_scope: [src/cli.ts, src/store.ts, test/list-notes.test.ts]
- external_gates: []

# Decisions

- 2026-07-20: Keep the example serial; overlapping store ownership makes a second writer costlier than the expected gain.

# Verification

- C-1: Fixture inspection establishes the baseline interface used by this planning example.
