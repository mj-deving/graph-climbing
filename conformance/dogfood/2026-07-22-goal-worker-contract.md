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
- CAID identifies concurrent edits, dependencies, and integration as central multi-agent coding conflicts and uses centralized delegation, isolated workspaces, structured integration, and executable tests. Graph Climbing maps these to atomic ledger claims, release scopes, companion joins, and probes. Source: [Conflict-Aware Inter-Agent Delegation](https://arxiv.org/abs/2603.21489).
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

## Falsifiers

The design fails if a worker needs a task name from chat, starts work after losing a claim race, carries two mutating leases, selects from stale frontier state, bypasses a cohort join, edits outside its release envelope, treats no ready work as product completion, or requires a central actor to write a new goal after every vertical.
