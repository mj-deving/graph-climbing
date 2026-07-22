# Graph Climbing

A compact protocol for long-running agentic engineering. Paste this file into a coding agent or point the agent at it. The reference kit, checker, examples, and origin evidence are at [mj-deving/graph-climbing](https://github.com/mj-deving/graph-climbing).

## 1. Thesis

The runtime is a loop; the work is a graph. Real engineering contains prerequisites, independent branches, external gates, reopened truths, and convergence points. A linear plan hides that shape and decays as evidence changes.

Graph Climbing gives an agent freedom inside bounded product work while keeping completion tied to durable claims and snapshot-bound evidence. Model truth once; schedule it many ways. The minimal system is:

```text
one product authority + existing tests and Git + one agent
```

Use repository-native artifacts. Do not install an orchestration platform merely to adopt this protocol. Every added rule must prevent an observed failure; otherwise remove it.

## 2. Vocabulary

- **claim graph**: durable product authority: atomic falsifiable claims plus dependencies.
- **claim frontier**: open claims with verified dependencies and no blocker or unknown.
- **active frontier**: executable selection set: claims without an Execution Graph, verticals with one.
- **vertical**: bounded implementation unit over reachable claims, persisted only when coordination warrants it.
- **Execution Graph / ledger**: optional operational state for long runs, gates, ownership, debt, or multiple workers. It does not define product truth.
- **evidence**: observation tied to an exact code, artifact, dependency, or runtime snapshot.
- **climb**: one `derive → select → build → verify → reconcile` iteration.
- **Graph Climbing**: the complete protocol across repeated climbs.
- **reconcile**: write claim status, evidence, decisions, and operational state back to their owning durable surfaces.

An Ideal State Artifact (ISA), PRD, or repository-native spec can implement the claim graph. Beads, GitHub Issues, or another tracker can implement the optional ledger. Goals, hooks, schedulers, and supervisors can support liveness or enforcement. None is a prerequisite.

## 3. Kernel and authority

```text
claim graph + evidence + climber
                    + optional Execution Graph / ledger
```

Keep one authority per concern:

- product meaning and official progress belong to the claim graph;
- ownership, gates, and execution debt belong to at most one ledger;
- tests, reviews, Git, runtime observations, and releases supply evidence;
- the climber selects the next vertical but owns no hidden durable truth.

Generated graphs and dashboards are reproducible views, never competing databases. Brownfield adoption finds existing authorities rather than creating a familiar-looking second spec.

## 4. Claim contract

Each leaf claim needs a stable ID, desired-state wording, status, dependencies, one named falsifying probe, and snapshot-bound evidence when verified.

```yaml
id: C-23.2
claim: Anonymous artifact access requires verified public authority.
status: open
depends_on: [C-17]
probe: bun test test/public-access.test.ts
evidence: none
```

A claim is atomic when one probe yields one product decision. Split when one part can pass while another fails independently. Preserve split parents and dropped IDs; never reassign an ID.

Use `verified`, `open`, `blocked`, `unknown`, and `dropped` distinctly. Unknown means insufficient evidence or decision. Include at least one grounded `Anti:` claim.

Progress is non-monotonic. Only a finding accepted and independently verified against the relevant snapshot may reopen or add claims. Record reasons for rebuttal or deferral.

## 5. Frontier and verticals

Derive product reachability first:

```text
claim_frontier = open claims with all dependencies verified
```

Without an Execution Graph:

```text
frontier_kind = claim
active_frontier = claim_frontier
```

Choose a small, high-value vertical with bounded ownership. It may include dependent claims when one entry claim is reachable, every unfinished internal dependency is contained, and external dependencies are verified.

With an Execution Graph, derive executable verticals from claim reachability plus dependencies, gates, ownership, and scope:

```text
frontier_kind = vertical
active_frontier = executable verticals
```

A blocked claim or release gate must not suppress unrelated reachable claims. Do not keep following yesterday's plan after evidence changes the graph.

An edge is real only when downstream work consumes upstream data, an artifact, verified state, an authority decision, an external gate, or probe-required evidence. Written order alone is not a dependency. Reading a file another lane changes also creates an edge even when write scopes differ.

## 6. One climb

One climb is deliberately local:

1. **Derive** the claim frontier and, if present, the executable vertical frontier from current authorities and evidence.
2. **Select** one bounded vertical and name its claims, scope, owner, gates, and first falsifying probe.
3. **Build** freely inside that scope and the repository's safety boundaries.
4. **Verify** with claim-matched tests, runtime observations, review, and required release gates.
5. **Reconcile** status, snapshot evidence, decisions, invalidations, ownership, and debt into their owning surfaces.

Then derive again. Unreconciled results are completion candidates, not official progress. A climb may close, reopen, or expose unknown claims; honest topology beats checkbox growth.

Before implementation, report:

```text
product_authority:
operational_ledger:
evidence_sources:
claim_frontier:
frontier_kind: claim|vertical
active_frontier:
selected_vertical:
first_probe:
unknowns:
```

## 7. Evidence and reconciliation

Evidence names what and where: snapshot, tests, runtime response, rendered UI, upstream pin, review disposition, or release artifact. Match modality to claim; source inspection cannot prove runtime behavior.

Separate local verification from certification:

```text
verified_local     named claims pass at the exact local snapshot
release_certified  integration, provenance, and human gates also pass
```

Across repository or artifact boundaries, declare the input authority, claim IDs, output snapshot, reconciliation destination, and provenance gaps. Workers and reviewers return evidence candidates; they do not self-certify completion.

Reconciliation updates only owning surfaces: product truth in the claim graph, operational state in the ledger, observations in the evidence record, and temporary hints in current context. Stable history remains inspectable.

`completion_evidence` preserves a cohort's verified snapshot; later verified findings may reopen individual claims without rewriting historical lane completion.

## 8. Scaling and anti-patterns

Do not create a ledger for short serial work. Add an Execution Graph only for durable runs, gates, or multiple writers. Choose topology without changing the claim graph:

- **serial** for causal coupling or shared authority;
- **pipeline** when each item can advance independently;
- **fan-out/fan-in** for isolated lanes converging on one snapshot;
- **router** when validated output selects the next branch;
- **verifier fan-out** for independent read-only falsification of one snapshot.

Use a barrier only for a cross-set operation, shared release, or central reconciliation. Deterministic flattening, filtering, or deduplication is code, not an agent job.

Every released N-way cohort needs explicit owners, disjoint file and runtime scopes, no unfinished dependency between lanes, and one pre-created companion reconciliation vertical. New strict Work Graphs declare `topology_contract: cohort-v1`; each lane names its companion with `reconcile_via`, and the companion names the exact set with `join_for`. A lane may become `sealed` after its own probe and Autoreview loop, but sealed work is only an evidence candidate: it unlocks no ordinary successor. When all lanes seal, the companion runs combined probes and review. It then atomically reconciles lane, join, claim, evidence, decision, and ledger state. A rejected candidate returns its lane to active work; unaffected siblings may stay sealed. Withdrawal drops the old join and creates a replacement. Stay serial when coordination cost erases the gain.

Common failures:

- claim closure without claim-matched evidence;
- a tracker becoming a second product specification;
- snapshot-free evidence that cannot be replayed;
- blocked external work freezing independent local work;
- parallel writers sharing files or runtime state;
- dependency edges that carry only written order;
- sealed work treated as verified before its join;
- cohorts released without a durable convergence point;
- review infrastructure recursively hardening itself;
- automatic continuation waking without new frontier work;
- commit-per-climb, custom locking, or global ID machinery without an observed need.

The originating DACS agent-template build used ISA claims for product truth, ISA features for product decomposition, Beads for smaller execution verticals, and exact test/review snapshots for evidence. It also exposed a costly governance detour. The active run is documented in an [interim field report](https://github.com/mj-deving/graph-climbing/blob/main/case-studies/dacs-agent-template.md); the final Graph Climbing and DACS Forge engineering case studies remain separate future artifacts.

## 9. First actions and falsification

Start now:

1. Inspect repository instructions, existing product authority, tracker, Git state, tests, evidence, and relevant external pins.
2. Name the authority map. Adopt an adequate existing product authority; create one small repository-native spec only when none exists.
3. Preserve human intent, boundaries, stable atomic claims, dependencies, probes, status, decisions, and evidence. Keep material unresolved semantics `unknown` and outside the frontier.
4. Derive and report `claim_frontier`, `frontier_kind`, and `active_frontier`.
5. Select one bounded vertical and its first falsifying probe. Add no ledger unless the scaling conditions already exist.
6. Execute one climb, reconcile durable truth, derive again, and continue while reachable work remains.

Graph Climbing is failing when a fresh operator cannot reconstruct the frontier, claims close without matching evidence, review findings change truth without verification, spec and ledger compete, coordination costs more than parallel work returns, or a strong agent must remember state absent from durable artifacts. Track closure integrity, reopen rate, spec-ledger divergence, time to derive the next frontier, review yield, and governance overhead. Change the protocol only when those observations justify it.

## License

MIT
