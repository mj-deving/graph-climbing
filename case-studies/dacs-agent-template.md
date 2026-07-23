# DACS Forge in progress: a Graph Climbing field report

Graph Climbing came out of a long-running build of DACS Forge, a forkable service template and conformance kit for DACS Agent Commerce.

Status: interim field report. Evidence capture through 2026-07-22. The build is still active.

This report records what the agents built, how we steered the run, where the control system went too far, and what the inner review loop did after we corrected it. It is not the final Graph Climbing case study, and it is not the DACS Forge engineering case study. DACS Forge is not released, canonically designated, or externally qualified.

## Two future case studies, one live source run

The finished run will support two different long-form accounts.

The final Graph Climbing case study will examine the work graph: claim selection, steering, review reopen, progress regression, governance failure, scope recovery, handoff, and the complete path from initial contract to final outcome.

The DACS Forge engineering case study will examine the product: protocol authority, canonical signed bytes, two-sided evidence, settlement and delivery invariants, hostile resolvers, migration and crash safety, concurrent execution, CLI and HTTP boundaries, container qualification, conformance, and release evidence. That build is an engineering showpiece in its own right and should not be reduced to a process example.

This document is the public field report available while both stories are still accumulating evidence. A shorter companion, [From Vibe Coding to Hardened Software](autoreview-semantic-hardening.md), isolates the inner Autoreview loop for reuse.

## The two nested loops

The outer loop managed product truth across a long run:

```text
claim graph
  -> active frontier
  -> bounded vertical
  -> build and verify
  -> evidence seal
  -> reconcile status, decisions, debt, and next frontier
```

The inner loop hardened each selected vertical:

```text
functional implementation
  -> focused and adversarial tests
  -> exact review snapshot
  -> autoreview finding
  -> source and specification check
  -> accept, reject, or defer
  -> correction and regression test
  -> re-review
  -> clean snapshot or remain open
```

This distinction matters. The outer graph prevented a long-running agent from losing the product definition. The inner Autoreview loop carried most of the semantic engineering work inside each vertical.

“One-shot production quality” does not mean one model pass. It means the iteration happens before handoff. A downstream consumer receives a sealed snapshot with pinned authority, tests, review dispositions, and explicit limits. The full product can remain incomplete while individual verticals are production-grade within their tested boundary.

## From a bounty line to a claim graph

The original task was a short bounty description: build a forkable canonical service template. The first specification expanded that into 160 falsifiable product claims covering listing, service execution, agreement, settlement, delivery, bilateral Vet evidence, DACS-5 bundles, restart behavior, HTTP access, container release, an exemplar, and adoption.

The source of product truth was a project ISA with stable claim IDs and explicit probes. Beads held durable debt, dependencies, and steering. Commits and review envelopes held execution evidence. DACS-Standard remained the normative authority; SDK and live Directory behavior were comparison evidence only.

The first verticals implemented Trust Core, Listing, Service Contract, Agreement, and fixture Settlement. The agent selected implementation order and local architecture, wrote adversarial tests, and corrected defects without waiting for step-by-step approval. It could not redefine protocol semantics, enable live spend, register publicly, or claim external qualification.

## The observability problem was real

The build made progress, but the private strategy ISA still showed `0/160`. Verified state lived across checkpoint plans, Bead notes, commits, and tests. A human audit asked for one current view of product truth and better review provenance.

Commit `8205be4` solved the central problem. It moved the canonical Root ISA into the build repository and reconciled progress to `46/160`. The agent could now resume from product claims and evidence instead of reconstructing state from chat or scattered plans.

The correct fix was small: keep the Root ISA current, persist review rounds, and reconcile after each vertical.

## The control system became the work

The agent interpreted the request more broadly. It built review-control, handoff, supervisor, and closure machinery, then reviewed that machinery recursively.

Between product checkpoint `8205be4` and governance freeze `a383e99`, the run produced:

- 28 commits without a new DACS lifecycle vertical
- 3,314 added lines of review-control and ISA code
- 18 semantic meta-review rounds
- 54 findings, including many valid local defects
- no movement in the active product frontier
- an outer persistent goal that consumed about 2.93 million reported tokens before manual pause

The agent was not idle and the reviewers were not fabricating every defect. The run was optimizing the wrong graph. A locally useful observability layer had become a product gate, and its own hardening generated more work for itself.

This was the clearest failure in the experiment. Evidence and review do not automatically preserve product direction. They preserve whichever definition of done currently has authority.

## Steering and scope recovery

The correction arrived as two bounded steering events.

`STEER-20260718-11` froze the experimental review-control expansion and removed it from the product path. `STEER-20260718-12` protected the product-facing Autoreview loop from the same cut. The five-percent governance budget applied only to new meta-control work, never to security, conformance, or product review.

Commit `f4d7be4` reconciled the correction. Five governance claims stayed readable as history but left the product denominator. The agent resumed the reachable product frontier without deleting the experiment or pretending it had been useful product progress.

The denominator changes are part of the provenance. The initial product contract had 160 claims. Review-control additions increased the ISA to 166. Freezing five governance claims left a 161-claim product denominator. Commit `26e88e0` later added four product release and evolution gates, ISC-60.1 through ISC-60.4, producing the current 165-claim denominator. None of those four claims became green merely because they were added.

This distinction became part of Graph Climbing:

- product review may continue until the current product snapshot is clean
- recursive review of the review system is optional governance work
- two governance-only cycles without a product-claim change trigger a principal checkpoint
- accepted review findings may reopen claims and reduce progress

## Making the inner loop auditable

The shared `autoreview` helper remained the review engine. It produced an isolated diff bundle, validated structured findings, scanned for secret-like content, and treated findings as advisory until checked against source and specification.

The build added a thin recorder, `tools/run-autoreview-round.ts`, rather than a second review authority. Before each run, it wrote an envelope containing:

- stable round and vertical IDs
- exact build HEAD and diff SHA-256
- pinned DACS `main` and `next` commits
- reviewer engine, model, and reasoning level
- review scope or prompt hash
- focused tests and reserved output paths

After the run, it retained the native human and structured outputs, their hash, and a terminal state of `clean`, `findings`, `tool-failed`, or `interrupted`. The builder later added each finding disposition and the correction commit.

Commit `d31e133` introduced the recorder, its test, and the first recovered envelopes. Commit `e76f768` corrected repo-owned outputs after a tool failure. Commit `b6ff5cb` sealed the Delivery Integrity product changes. The separate commit `761c9a9` then sealed their review evidence.

The shared helper was also hardened during this period. Commits `53e9209`, `bf91353`, and `9b16adc` tightened diff-hunk secret scanning, redaction-sentinel handling, and typed resolution references. One provenance gap remains: the product envelopes pin reviewer and model, but not the exact helper commit. Surrounding repository history can suggest which helper version was likely present, but it cannot prove which checkout or executable produced a round. We recorded that limit instead of building another blocking control plane.

## What Autoreview changed in the product

The bilateral Vet vertical is the densest example. It began as functional code and went through 24 semantic rounds:

- 33 findings
- 32 accepted
- 23 P1
- 22 security-classified
- 16 corrective code commits
- final Codex Round 024 clean at `0.96` confidence

The findings forced the implementation to authenticate Vet evidence authority, bind evidence to the correct listing, agreement, party, session, and lifecycle moment, reject replay, preserve canonical bytes, constrain privacy schemas, handle hostile resolvers, and fail closed during malformed database migrations.

Codex Round 019 was already clean. The one targeted Fable pass in Round 020 then found a privacy-schema gap. Later Codex rounds found incomplete ClaimRequirement enforcement, unsigned verification claims, non-canonical resolver JSON, and a broken migration edge case. “Clean” always meant clean for that reviewer and snapshot, not permanently correct.

The same loop continued after scope recovery:

- Doctor Core used 52 persisted rounds. Codex Round 050, Fable Round 051, and integrated Codex Round 052 were clean. Its seal passed 652 tests and 44,291 assertions.
- HTTP Readiness used eight rounds. Fable found an IPv6 edge case after the first Codex clean; the final Codex round was clean. Its seal passed 662 tests and 44,351 assertions.
- Restart Matrix used six rounds. Fable found two P3 defects after the first clean. The corrected seal passed 685 tests and 44,468 assertions.
- Concurrent Settlement used three rounds and two independent Bun workers. Codex and Fable finished clean. The reconciled gate passed 689 tests and 44,532 assertions.

The last reconciled product state before the first parallel pilot was `91/165`. Delivery Integrity, positive DACS-5 convergence, negative terminal bundles, bilateral Vet, Doctor Core, loopback readiness, restart boundaries, and concurrent settlement were sealed locally.

## The first parallel wave converged through one companion

The first released product cohort split two independent closures from common base `62b0e68`: Atomic write hardening and Directory compatibility. Each lane owned a separate workspace and mutation scope. Atomic sealed at `94730de`; Directory sealed at `bef1b96`. Neither seal changed product truth or unlocked ordinary successors.

One pre-created companion then integrated both candidates. The provenance-preserving merge `e5d4d49` produced combined snapshot `2763a71`. Focused Atomic and Directory probes passed, followed by the full repository gate: 768 tests and 51,216 assertions across 55 files, plus typecheck, build, frozen install, evidence validation, and specification completeness. Only that combined reconciliation moved product progress to `95/165`.

The next product-authority revision at `bc60dbc` preserved every stable claim ID and verified evidence while replacing nine broad milestone buckets with 37 atomic claim closures. Every one of the 165 product claims mapped exactly once. That graph exposed a releasable parallel width of two and created the next two lanes plus their companion before either worker started.

This pilot supports a bounded conclusion: isolated evidence candidates can progress concurrently while one companion owns combined verification and truth reconciliation. It does not establish mathematically maximal parallelism, lock-free live regraphing, or a completed DACS Forge release. The second cohort was still in progress at this report boundary.

## What the “95 percent” observation means

We cannot prove that 95 percent of all effort was Autoreview work. We did not measure comparable time, token, cost, or lines-of-code attribution across the run.

The commit sequence does support a narrower statement:

- DACS-5 convergence: 27 of 28 commits followed the first recorded review target, `96.4%`
- bilateral Vet: 19 of 20 commits followed the complete functional baseline, `95.0%`
- Doctor Core: 69 of 70 commits followed the first recorded review target, `98.6%`

Review-driven semantic hardening was the dominant implementation phase in these verticals. That is the defensible claim.

At the public evidence capture on 2026-07-21, the nine instrumented product areas contained 152 round envelopes and 404 findings. The builder had accepted or adopted 391, rejected eight with evidence, deferred one, and was still disposing four findings from the active round. Twenty-one rounds were clean. Ten tool failures remained visible instead of being rewritten as successful reviews.

## The open edge

The active frontier at capture time was Active-Write Interruption, covering crash safety and exhaustive SQLite mutation discovery. Round 017 reviewed commit `4dd3ea0` and returned four new P1 counterexamples. They concerned migration-write coverage, setup-PRAGMA call paths, computed destructuring, and Database receivers widened into less precise callable types.

The same snapshot had passed 741 tests and 47,406 assertions across 53 files, plus a 57-module build. It was still not sealed. Green tests did not override unresolved review findings. The working tree had already entered the next correction cycle.

That open edge belongs in the field report. Graph Climbing allows progress to fall, claims to reopen, and a nearly complete vertical to remain unfinished.

## What this field report establishes

The run supports four conclusions:

1. A durable claim graph can carry a complex build across long runs, interruptions, steering, and upstream drift.
2. A bounded product Autoreview loop can turn a plausible implementation into a much stronger semantic contract before handoff.
3. More governance is not monotonically safer. Review infrastructure can become the wrong active hill.
4. Human steering works best when it changes authority, scope, or falsifiers, then lets the inner product loop continue.

The report does not establish universal productivity gains, a complete DACS release, external conformance acceptance, protected API completion, container qualification, exemplar dogfood, canonical designation, or five qualifying forks.

Graph Climbing therefore keeps the claim graph permanent and the execution machinery proportional. A serial run can work directly from ready claims. Long runs, gates, or multiple workers may add an execution graph and ledger. Goal runtimes, hooks, supervisors, ISA, and Beads remain optional implementations.

The smallest useful operating rule survived both the product work and the governance failure:

> Guardrails must bound the work, not become the work.
