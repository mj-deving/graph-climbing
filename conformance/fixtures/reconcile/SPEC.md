# Intent

> Build a local checksum CLI with explicit failure behavior.

# Desired State

Operators can calculate a SHA-256 checksum for one local file and receive a stable not-found disposition without network or file mutation.

# Boundaries

## Out of Scope

- Recursive directories and remote URLs.

## Constraints

- Bun runtime and read-only file access.

# Done Criteria

### C-1: One local file returns its SHA-256 digest

- status: verified
- depends_on: []
- probe: bun test test/checksum.test.ts
- evidence: commit:abc123; 4/4 focused assertions pass
- invalidated_by: []

### C-2: Missing files return a not-found disposition

- status: open
- depends_on: [C-1]
- probe: bun test test/not-found.test.ts
- evidence: none
- invalidated_by: []

### C-3: Anti: Checksum execution changes no input bytes

- status: verified
- depends_on: []
- probe: bun test test/read-only.test.ts
- evidence: commit:abc123; before-and-after bytes match
- invalidated_by: []

# Work Graph

current_slice: S-2

### S-1: Calculate one checksum safely

- status: verified
- satisfies: [C-1, C-3]
- depends_on: []
- owner: integrator
- allowed_scope: [src/checksum.ts, test/checksum.test.ts, test/read-only.test.ts]
- external_gates: []

### S-2: Return a stable missing-file disposition

- status: active
- satisfies: [C-2]
- depends_on: [S-1]
- owner: worker-1
- allowed_scope: [src/cli.ts, test/not-found.test.ts]
- external_gates: []

# Decisions

- 2026-07-20: Keep missing-file behavior in its own vertical because its outcome can fail independently.

# Verification

- C-1: commit `abc123`; focused checksum probe passed 4/4 assertions.
- C-3: commit `abc123`; before-and-after byte comparison matched.
