# Reconcile

Use at a meaningful boundary: completed vertical, accepted review finding, human steer, upstream drift, interrupted handoff, or release decision.

1. Re-read the product authority, relevant ledger item, current Git snapshot, and candidate evidence.
2. Treat worker output and review output as candidates, never completion authority.
3. Map each candidate to stable claim IDs. Abort on unknown or reassigned IDs.
4. Verify the evidence modality:
   - code or file claim → inspected diff or file;
   - behavior claim → focused runtime or test probe;
   - UI claim → rendered observation;
   - release claim → required integration, provenance, and authority gates.
5. Update each claim independently. Verified siblings may close while the containing slice remains incomplete or uncertain.
6. Reopen or add a claim only for a finding that was both accepted and verified against the relevant snapshot. Rebutted and deferred findings keep a reason. Progress may decrease.
7. Record decisions that change intent, boundaries, graph shape, or rejected approaches. Preserve tombstones and history.
8. Update the ledger only for operational status, ownership, blockers, debt, or gates. Do not copy the full product spec into it.
9. For a cohort, verify reciprocal `reconcile_via` / `join_for` membership and treat lane seals as evidence candidates. Run combined probes and review at the companion; publish lane, join, claim, and shared snapshot-bound `completion_evidence` as one atomic owning-surface update.
10. If combined evidence rejects one lane, return that lane to active and the join to planned; preserve unaffected sealed siblings. If membership changes, drop the old join and create a replacement before N>=2 work resumes; a singleton returns to serial execution.
11. Later accepted evidence may reopen a claim without rewriting the verified join or lane history; record the new finding evidence and create the next corrective vertical.
12. Re-run the checker and derive the claim frontier, frontier kind, and active frontier.
13. Report exact changes, probes, remaining unknowns, and the next product action.

Do not silently resolve structural conflicts. Do not block unrelated local product work on release-only or historical gates. Do not open a recursive review loop for governance infrastructure.
