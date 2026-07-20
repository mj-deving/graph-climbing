# Candidate evidence

Snapshot: commit `def456`

Probe: `bun test test/not-found.test.ts`

Observed result: exit 0; 3 tests passed, 0 failed. The CLI returned JSON `{ "status": "not_found" }` for a missing local path. No release or publication gate applies.
