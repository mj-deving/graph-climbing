# Graph Climbing repository adapter

Use this checklist when a user asks to **adopt** or **bootstrap** Graph Climbing. It persists the resolved authority map in the repository's native agent instructions; it is not a second product specification or task ledger.

## Installation rule

1. Inspect the repository root, nearest instruction files, existing product authority, tracker, Git/evidence layout, and platform conventions.
2. Merge into the repository-root `AGENTS.md` rather than replacing it. If the root file is absent, create one concise root `AGENTS.md`; preserve nested `AGENTS.md` files as scoped overlays.
3. Update or create `CLAUDE.md` only when the repository already uses Claude Code or the user requests that surface. Keep shared rules consistent without duplicating long bodies.
4. Describe the intended instruction-file changes before writing. Preserve stricter existing rules and surface conflicts.
5. Keep the adapter stable and short enough for the target loader. Never copy current task IDs, active owners, mutable progress, PR matrices, dated hot context, or recovery procedures into it.
6. Audit-only use performs no writes.

## Required stable mappings

The installed instructions must name:

- `product_authority`: exact ISA, spec, PRD, or equivalent;
- `operational_ledger`: exact tracker, or `none — proven single writer only`;
- `evidence_sources`: Git plus named tests, runtime probes, reviews, or release artifacts;
- `graph_checker`: command/path when the reference checker applies;
- startup/resume commands that re-read those surfaces;
- claim/lease ownership and stop rules;
- verification and reconciliation destinations;
- public, live-spend, destructive, and irreversible approval boundaries.

State explicitly that chat, session transcripts, model memory, and hook summaries are reconstruction aids—not durable product or task truth.

## Beads specialization

When `.beads/` exists and no different tracker is authoritative, bind `operational_ledger` to **Beads**. Include the installed CLI's current forms of:

```bash
bd prime
bd ready --json
bd list --status=in_progress --json
bd show <id> --json
bd update <id> --claim --actor <unique-incarnation> --json
```

Require post-claim ownership read-back, at most one mutating lease, exact close-last after reconciliation, and an explicit companion join for released parallel cohorts. Do not make Beads mandatory in repositories that do not need a durable ledger.

## Freshness rule

Instruction files contain stable routing only. Current lanes, issue/PR state, SHAs, test totals, evidence snapshots, and next actions belong in the operational ledger, product authority, Git/evidence, or dated reports. Git history already preserves old doctrine; do not retain superseded hot-context blocks in the first-turn instruction budget.

After installation, report the files changed, resolved authority map, loader-size check, validation commands, and any unresolved conflict.
