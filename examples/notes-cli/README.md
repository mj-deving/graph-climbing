# Notes CLI example

Small serial example showing the reference `SPEC.md` format without ISA, Beads, hooks, or a goal runtime.

State:

- the baseline CLI contract is verified;
- the add-note vertical is the reachable current slice;
- listing remains blocked on that slice;
- cloud sync is explicitly outside the desired state.

Check it:

```bash
bun run graph-check examples/notes-cli/SPEC.md
```

Expected frontier: `S-2`.
