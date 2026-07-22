# Goal worker contract design — 2026-07-22

## Question

Can one task-free `/goal` contract be given unchanged to N Graph Climbing workers so each safely continues useful work from the ISA/spec, execution ledger, Git checkout, and evidence alone?

## Authority boundary

- Product authority: existing ISA/spec; owns product meaning and verified progress.
- Operational ledger: owns dependencies, priority, steering, gates, leases, and joins.
- Evidence: exact Git, test, review, dependency, runtime, and release snapshots.
- Goal: stateless worker algorithm; owns no current task or product truth.

## Hypotheses tried

1. **Whole-product mission:** rejected. A sentence such as “continue until the product is done” does not define safe selection, ownership, collision, join, or evidence behavior.
2. **One goal per vertical:** rejected. It makes a goal an exclusive lane lease, requires an external actor to formulate the next prompt, and does not let the same unchanged contract drive N workers forward.
3. **Persistent worker protocol with transient leases:** accepted. Every worker receives the same goal. Each iteration reconstructs durable state, atomically claims at most one compatible vertical, seals and reconciles it, then derives again. Exclusivity belongs to the lease, not the goal.

## Research disposition

- OpenAI's long-running Codex guidance treats durable work as state outside the chat and asks goals to state behavior, constraints, review criteria, and a testable definition of done. The contract therefore reconstructs state and defines gates instead of embedding a mutable task. Source: [Codex-maxxing for long-running work](https://cdn.openai.com/pdf/8a9f00cf-d379-4e20-b06f-dd7ba5196a11/OAI_WhitePaper_Codex-maxxing26.pdf).
- OpenAI describes worktrees as isolated copies that reduce conflicts between simultaneous agents. The release envelope therefore names checkout policy and mutation authority. Source: [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/).
- Anthropic reports that multi-agent systems need explicit objectives, boundaries, outputs, and coordination; vague delegation causes duplicated or missing work. The graph supplies those specifics per leased vertical, while the goal stays identical. Source: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system).
- *Effective Strategies for Asynchronous Software Engineering Agents* identifies concurrent edits, dependencies, and integration as central multi-agent coding conflicts and proposes Centralized Asynchronous Isolated Delegation (CAID), structured integration, and executable tests. Graph Climbing maps these to atomic ledger claims, release scopes, companion joins, and probes. Source: [Effective Strategies for Asynchronous Software Engineering Agents](https://arxiv.org/abs/2603.21489).
- Runtime-Structured Task Decomposition argues that a monolithic prompt is brittle and that decomposition needs executable control logic and schema validation. The goal therefore defines a repeated state transition; the graph supplies the mutable task data. Source: [Runtime-Structured Task Decomposition](https://arxiv.org/abs/2605.15425).

These sources support the control requirements, not the claim that this exact contract is generally optimal.

## Source-blind cases

### N workers, several ready lanes

Expected: every worker derives the same ordered candidate set. One wins the first exact atomic claim; losers refresh and try later compatible candidates. No worker holds more than one mutating lease.

### Resume after context loss

Expected: worker identity, checkout, claimed lease, base, scopes, current evidence, and gates are reconstructed from durable surfaces. A review round mentioned only in chat is ignored.

### Two lanes appear disjoint but one reads the other's write scope

Expected: release is blocked as a read/write collision or modeled as a dependency. Different filenames alone do not prove independence.

### Lane seals before its sibling

Expected: lane records a snapshot-bound evidence candidate. Covered claims remain unverified and ordinary successors remain blocked. The worker derives other compatible work or waits; it does not bypass the join.

### Last cohort lane seals

Expected: the companion join becomes ready. A worker claims it only if its release envelope grants integration and checkout authority. Combined probes and review precede atomic product reconciliation.

### No ready compatible work while other leases remain active

Expected: worker reports the exact waiting edges and yields. It does not mark the goal complete, poll continuously, or invent work.

### Product graph complete

Expected: after reconstruction, every in-scope claim and required join is verified. All workers may independently conclude the persistent goal is complete from the same durable state.

## Autoreview Round 001

Snapshot: commit `a9a741a`.

Accepted findings:

- Per-Bead compare-and-swap did not reserve scopes across distinct claims. Correction: N-worker release now requires a validated, immutable admission frontier pairwise compatible with all active leases; incompatible work is serialized before claiming.
- Resume did not prefer a lease already owned by the same worker and did not define abandoned ownership. Correction: resume-first, fail on multiple leases, and explicit authorized recovery without time-based stealing.
- “Atomic” cross-store reconciliation was not implementable across Git-backed product truth and the Beads ledger. Correction: one durable reconciliation ID, product/evidence commit first, ledger close last, idempotent replay, and downstream blocking until agreement.
- The unconditional ledger claim excluded short single-writer adoption. Correction: a proven single writer may form one runtime-local claim-first lease; unknown writer cardinality fails closed.

No custom locking protocol was added. Atomic issue claims prevent duplicate ownership; pre-release graph validation prevents distinct claimed lanes from colliding.

## Autoreview Round 002

Snapshot: commit `3c2b10e`.

Accepted findings:

- Separately published admission sets still had a cross-record time-of-check/time-of-use race. Correction: one declared central owner publishes one current admission epoch; replacement requires the prior epoch to be quiescent; candidates bind immutable envelope hashes; workers verify the epoch before and after claim and mutate nothing on mismatch.
- Steering preceded the owned-lease check. Correction: lease reconstruction now comes first. While a lease exists, only lease-local steering may be ingested, and it may not alter base, scope, authority, or admission epoch.

Scope disposition: both findings affect the same goal/ledger owner boundary and require no new runtime, lock service, or product contract. The second correction cycle therefore remained in scope.

## Autoreview Round 003

Snapshot: commit `3a6f720`.

Accepted findings:

- A central owner could still publish a replacement from a stale quiescence observation after an old-epoch worker had claimed and passed its checks. A conditionally atomic epoch/lease transition would solve this but would introduce the custom coordination layer the simplicity gate rejects. Correction: the N-worker run epoch is static for the run. Replacement is a coordinated stop-the-world regraph after every epoch worker is durably paused or terminated and all lanes, seals, and joins are reconciled or withdrawn. The identical worker goals resume afterward.
- Workers checked only epoch identity, not the certified release envelope. Correction: every candidate binds a canonical envelope hash; workers compare both epoch and hash immediately before and after claim and mutate nothing on mismatch.

Design boundary: N-way autonomous progress is supported within one admitted execution graph. Live graph remodeling is not lock-free; it is an explicit rare barrier. This preserves the requested same-goal worker model without claiming an unavailable multi-record transaction.

## Autoreview Round 004

Snapshot: commit `1aa2845`.

Accepted findings:

- First activation did not account for active or abandoned leases predating the epoch. Correction: first activation and replacement use the same clean barrier; every pre-epoch lease, seal, reservation, and join must be reconciled or explicitly withdrawn before publication. A resumed lease must match the current epoch and certified envelope hash.
- “Can become simultaneously executable” excluded candidates that become ready at different times while an earlier lease or seal still reserves scope. Correction: epoch validation covers every pair whose reservation lifetimes can overlap under any valid schedule. Reservation lasts from claim through direct reconciliation or, for cohort lanes, through companion-join reconciliation.

## Autoreview Round 005

Snapshot: commit `0cfaa97`.

Accepted findings:

- The compact Gist ambiguously allowed old leases or seals to be merely paused. Correction: workers pause or terminate; every prior lease, seal, reservation, and join must reconcile or withdraw before epoch publication.
- Epoch/hash resume was accidentally unconditional and broke the supported ledgerless single-writer profile. Correction: the check applies to ledger leases. A proven single writer may resume its runtime-local lease or reconstruct partial work from product authority, Git, and evidence after context loss.

## Fable Pass 001

Snapshot: commit `71ca745`; engine `claude-fable-5`; one full branch-bundle pass.

Accepted findings:

- The Round 005 correction still required epoch/hash binding for a single writer using a ledger, although epochs existed only in the N-worker profile. Correction: the contract now resolves three profiles explicitly. `serial-ledger` resumes and claims exact IDs without an epoch; only `N-worker-epoch` requires epoch/hash binding.
- arXiv `2603.21489` was cited under an incorrect title and CAID expansion. Correction: the provenance now uses the paper's actual title, *Effective Strategies for Asynchronous Software Engineering Agents*, and expands CAID as Centralized Asynchronous Isolated Delegation.

## Post-Fable Codex Round 001

Snapshot: commit `1dd63e9`.

Accepted findings:

- The serial-ledger profile had dropped envelope-integrity validation together with the unnecessary epoch. Correction: every ledger lease binds and verifies a canonical envelope hash; only N-worker leases additionally bind a run epoch.
- The serial-ledger path treated a lost claim race like normal N-worker contention. Correction: a race disproves single-writer status and fails closed for profile reclassification; only N-worker claim losers refresh and try another candidate.

## Post-Fable Codex Round 002

Snapshot: commit `b8cbed5`.

Accepted finding:

- Claim/resume bound the envelope hash, but close still targeted only the stable ledger ID, allowing stale replay after recovery. Live `bd close --help` exposes no hash compare-and-swap. Correction: operational lease IDs are single-assignment to one stable vertical plus envelope hash. Recovery fences the old worker, tombstones the old lease ID, and creates a new lease ID. Reconciliation binds `{lease_id, vertical_id, envelope_hash, epoch}` and closes that exact ID last, so an old replay cannot close the replacement.

## Post-Fable Codex Round 003

Snapshot: commit `f9176a9`.

Accepted finding:

- A tombstoned old lease could no longer close its replacement, but its incomplete reconciliation record could still write stale product truth before the close step. Correction: recovery must resolve or invalidate every incomplete record before tombstoning and replacement. Commit requires the bound lease to remain active/current; tombstoned records are dispositioned as superseded and never replayed into product truth.

## Post-Fable Codex Round 004

Snapshot: commit `1e05be4`.

Accepted finding:

- An active/current check still raced with recovery because ledger and Git lack one transaction. Correction: official product truth has one declared reconciliation owner and exclusive authority workspace. Recovery/reassignment is forbidden during its commit-to-close critical section. Otherwise recovery durably stops every writer for that authority scope, freezes claims, inspects Git and incomplete records, then tombstones/reissues and resumes. A failed reconciliation enters that barrier rather than racing a live commit.

## Post-Fable Codex Round 005

Snapshot: commit `0d9adcb`.

Accepted finding:

- The critical-section rewrite accidentally dropped the explicit idempotency requirement for active-record replay. Correction: product truth/evidence application and active-lease replay are idempotent; tombstoned records remain superseded.

## Post-Fable Codex Round 006

Snapshot: commit `8f1d6fe`.

Accepted findings:

- The conformance summary said “active record” instead of requiring its bound lease to remain active/current.
- The same summary omitted tombstone-old/create-new after recovery while the canonical Goal retained it.

Correction: the conformance wording now mirrors both lease-state conditions exactly.

## Falsifiers

The design fails if a worker needs a task name from chat, starts work after losing a claim race, carries two mutating leases, selects from stale frontier state, bypasses a cohort join, edits outside its release envelope, treats no ready work as product completion, or requires a central actor to write a new goal after every vertical.
