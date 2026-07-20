# Product Contract

## Desired outcome

Operators can inspect local artifact metadata without mutating artifacts or contacting a network service.

## Non-goals and constraints

- No network access, artifact writes, credential loading, or database.
- Bun runtime; JSON output remains stable for scripts.

## Requirements

### R-1: Help identifies inspect as the only command

- state: proven
- probe: `bun run src/cli.ts --help`
- evidence: release fixture `help-v1.txt`

### R-2: Inspect returns the artifact path and byte length

- state: open
- depends on: R-1
- probe: `bun test test/inspect.test.ts`

### R-3: Invalid paths return a structured not-found result

- state: open
- depends on: R-1
- probe: `bun test test/not-found.test.ts`

### R-4: Never modify the inspected artifact

- state: open
- depends on: R-1
- probe: `bun test test/read-only.test.ts`

## Delivery slices

- Baseline interface: R-1; proven.
- Local inspection: R-2 and R-4; ready after Baseline interface.
- Failure disposition: R-3; ready after Baseline interface and independent of Local inspection.

## Decisions

- `PRODUCT.md` is the product authority. Git is the evidence store. No task ledger is currently needed.
