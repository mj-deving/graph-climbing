# Graph Climbing

A compact protocol for long-running agentic engineering. Paste this file into a coding agent or point the agent at it. The reference kit, checker, examples, and origin evidence are at [mj-deving/graph-climbing](https://github.com/mj-deving/graph-climbing).

## 1. Thesis

The runtime is a loop; the work is a graph. Real engineering contains prerequisites, independent branches, external gates, reopened truths, and convergence points. A linear plan hides that shape and decays as evidence changes.

Graph Climbing gives an agent wide freedom inside one bounded unit of product work while keeping completion tied to durable claims and snapshot-bound evidence. The minimal system is:

```text
one product authority + existing tests and Git + one agent
```

Use repository-native artifacts. Do not install an orchestration platform merely to adopt this protocol. Every added rule must prevent an observed failure; otherwise remove it.

## 2. Vocabulary

- **claim graph**: the durable product authority. Its nodes are atomic, falsifiable statements of product truth; its edges are claim dependencies.
- **claim frontier**: open claims whose dependencies are verified and which are not blocked or unknown.
- **active frontier**: the actual executable selection set. Without an Execution Graph it equals the claim frontier; with one it contains executable verticals.
- **vertical**: one bounded implementation unit over reachable claims. It is a local execution choice unless coordination makes it worth persisting.
- **Execution Graph / ledger**: optional operational state for long runs, gates, ownership, debt, or multiple workers. It does not define product truth.
- **evidence**: an observation tied to an exact code, artifact, dependency, or runtime snapshot.
- **climb**: one `derive → select → build → verify → reconcile` iteration.
- **Graph Climbing**: the complete protocol across repeated climbs.
- **reconcile**: write claim status, evidence, decisions, and operational state back to their owning durable surfaces.

An Ideal State Artifact (ISA), PRD, or repository-native spec can implement the claim graph. Beads, GitHub Issues, or another tracker can implement the optional ledger. Goals, hooks, schedulers, and supervisors can support liveness or enforcement. None is a prerequisite.

Terminology boundary: Graph Climbing names its authority, frontier, evidence, and reconciliation profile. Use mechanism-specific established terms for execution and verification. A router or routing function selects a conditional branch. Fan-out/fan-in is the general shape; use scatter-gather only when one request is distributed and responses are aggregated, and fork-join when a parent computation forks subtasks and later joins them. Pipeline means staged composition; say pipelined execution only when stages overlap. Independent verifier fan-out is not automatically self-consistency, multi-agent debate, Mixture-of-Agents, Reflexion, or Self-Refine. See the [terminology and source map](https://github.com/mj-deving/graph-climbing/blob/main/docs/terminology.md).

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

Generated graphs and dashboards are views. They must be reproducible from the authorities, never maintained as competing databases. Brownfield adoption starts by finding existing authorities; do not create a second product spec because its format is unfamiliar.

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

A claim is atomic when one probe yields one product decision. Split it when one part can pass while another independently fails, especially across UI, API, persistence, security, or release boundaries. Preserve split parents and dropped IDs as history; never reassign an ID.

Use `verified`, `open`, `blocked`, `unknown`, and `dropped` distinctly. Unknown means the evidence or product decision is insufficient; it is not zero progress. A verified sibling may remain closed while another sibling is blocked. Include at least one `Anti:` claim for a grounded critical failure.

Progress is not monotonic. New evidence may reopen a verified claim. Review alone is not enough: only a finding that is accepted and independently verified against the relevant snapshot may reopen or add claims. Retain a reason for rebutted or deferred findings.

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

Choose a small, high-value vertical over that set. Prefer work that unlocks downstream claims, reduces product or safety uncertainty, fits one evidence-bearing change, and has bounded ownership. A vertical may include several dependent claims when at least one entry claim is reachable and every unfinished internal dependency is contained in the same vertical. External dependencies must already be verified.

With an Execution Graph, derive executable verticals from claim reachability plus vertical dependencies, gates, ownership, and scope:

```text
frontier_kind = vertical
active_frontier = executable verticals
```

A blocked claim or release gate must not suppress unrelated reachable claims. Do not keep following yesterday's plan after evidence changes the graph.

## 6. One climb

One climb is deliberately local:

1. **Derive** the claim frontier and, if present, the executable vertical frontier from current authorities and evidence.
2. **Select** one bounded vertical and name its claims, scope, owner, gates, and first falsifying probe.
3. **Build** freely inside that scope and the repository's safety boundaries.
4. **Verify** with claim-matched tests, runtime observations, review, and required release gates.
5. **Reconcile** status, snapshot evidence, decisions, invalidations, ownership, and debt into their owning surfaces.

Then derive again. A build or test result that has not been reconciled is a completion candidate, not official progress. A climb may close one claim, reopen another, expose an unknown, or leave the verified count lower than before; honest topology beats checkbox growth.

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

Evidence must name what was observed and where: commit or diff, focused and full tests, runtime response, rendered UI, upstream pin, review finding and disposition, or release artifact. Match modality to claim. A source inspection cannot prove runtime behavior; a local test cannot grant release authority.

Separate local verification from certification:

```text
verified_local     named claims pass at the exact local snapshot
release_certified  integration, provenance, and human gates also pass
```

When work crosses a repository or artifact boundary, declare the input authority, supported claim IDs, output snapshot, reconciliation destination, and remaining provenance gaps. Workers and reviewers return evidence candidates. The integrator verifies and reconciles them; they do not self-certify completion.

Reconciliation updates only owning surfaces: product truth in the claim graph, operational state in the ledger, observations in the evidence record, and temporary hints in current context. Stable history remains inspectable.

## 8. Scaling and anti-patterns

Do not create a ledger for a short serial adoption. Add an Execution Graph only when state must survive long runs, external gates, or multiple writers. Parallel workers require separate reachable verticals, explicit owners, disjoint file and runtime scopes, no unfinished dependency between them, and one central reconciliation owner. Stay serial when isolation and merge cost approach the value of parallel execution.

Common failures:

- claim closure without claim-matched evidence;
- a tracker becoming a second product specification;
- snapshot-free evidence that cannot be replayed;
- blocked external work freezing independent local work;
- parallel writers sharing files or runtime state;
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
