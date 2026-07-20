# Graph Climbing

A small protocol for long-running agentic engineering.

This is an idea file designed to be pasted into a coding agent. The agent instantiates the protocol with the repository's native artifacts and the human's intent.

Reference implementation, starter spec, checker, skill, examples, and evidence: [mj-deving/graph-climbing](https://github.com/mj-deving/graph-climbing).

The agent gets wide freedom over implementation. Completion stays tied to a durable definition of done and inspectable evidence.

## The problem

An engineering agent may run the same loop for hours:

```text
inspect → plan → build → test → review → repeat
```

The runtime is a loop. The work is a graph.

Real projects contain prerequisites, independent branches, external gates, reopened claims, and convergence points. A linear plan hides that shape and grows stale as the agent learns.

Graph Climbing keeps the graph durable and the execution local:

```text
derive the reachable frontier
→ choose one bounded vertical
→ build it
→ verify it against named claims
→ reconcile durable state
→ derive the frontier again
```

## The kernel

```text
claim graph + optional execution ledger + evidence store + climber
```

- The claim graph says what must be true.
- The execution ledger says what is ready, owned, blocked, or deferred.
- The evidence store records what happened at an exact snapshot.
- The climber selects and executes one reachable vertical.

Use the repository's existing files and tools. Do not build a platform to adopt this protocol.

The default setup is enough for most work:

```text
one durable spec + existing tests and Git + one agent
```

Add a separate ledger only when work survives multiple sessions, depends on external gates, or has concurrent writers.

Keep one authority per concern: one product authority for meaning and done, at most one operational ledger for execution state, and one active traversal policy for choosing the next slice. Evidence stores and generated views inform those authorities; they do not compete with them.

## Bootstrap

Inspect before creating anything. Adopt an existing durable spec when it can express the contract below. Otherwise create one small repository-native Markdown file with:

- the human intent and desired state;
- explicit out-of-scope and constraints;
- stable, atomic done criteria, including falsifiable boundaries against critical failures;
- dependencies and one named falsifying probe per criterion;
- criterion status and evidence references;
- vertical slices that name which criteria they satisfy;
- decisions that change the graph or meaning of done.

Use existing tests and Git as the initial evidence store. For short serial work, keep current execution state in the spec. Add at most one separate ledger only when coordination must survive sessions, external gates, or concurrent writers.

Before building, report the authority map, active frontier, selected vertical, and first falsifying probe. If these cannot be stated honestly, clarify or inspect further instead of manufacturing structure.

Do not promote an unresolved product assumption into Out of Scope or Constraints. Ask when it materially changes behavior. If interaction is unavailable, persist it as an unknown and keep affected work outside the reachable frontier.

## Desired state and done criteria

The desired state describes the reality the work should produce. The done criteria are the binary claims that prove it.

```yaml
id: C-23.2
claim: Anonymous artifact access requires verified public authority.
status: open
probe: bun test test/public-access.test.ts
depends_on: [C-17]
evidence: none
```

Stable IDs matter more than numbering order. A claim may be refined, split, reopened, invalidated, or dropped. Its history must remain traceable.

Write each claim as a desired state. A claim is atomic only when no part can pass while another independently fails. Split conjunctions, cross-domain outcomes, and `all`, `every`, or `complete` language until one probe yields one decision; stop when further splitting adds no falsifying power.

The mechanical graph checker cannot prove semantic atomicity. Passing lint never replaces the independent-failure test.

```text
too broad: malformed input exits non-zero and leaves stored bytes unchanged
split:     C-7 malformed input exits non-zero
           C-8 malformed input leaves stored bytes unchanged
```

## Ledger contract

The ledger is optional. It holds execution state, not product meaning.

```yaml
id: TASK-123
scope: one coherent vertical
claims: [C-23, C-23.1, C-23.2]
status: ready
owner: none
depends_on: [TASK-122]
allowed_paths: [src/http/**, test/http/**]
done_when: named probes, review, commit, reconciliation
```

For short serial work, one `current_slice` field in the spec is enough.

## Evidence contract

Useful evidence includes commits and diffs, focused and full tests, runtime probes, review findings and dispositions, upstream pins, and release artifacts.

A checked claim without adequate evidence is not done. Passing evidence that has not been reconciled into the claim graph is a completion candidate, not official progress.

Keep local verification separate from release authority:

```text
verified_local     named claims pass against the exact local snapshot
release_certified  required integration, provenance, and human gates also pass
```

When work crosses an artifact boundary, declare the input authority, which claims the output supports, where it will be reconciled, and what remains provenance. The output stays a completion candidate until reconciled.

Treat review as a falsifier, not a completion authority. Verify every finding. Accepted findings reopen or add claims; rebutted or deferred findings retain a reason. Repeat only while accepted actionable findings remain inside the current product scope.

## Work graph

Derive these states from durable sources:

```text
verified  claims closed with sufficient evidence
active    currently owned implementation exists
ready     incomplete, prerequisites complete, no applicable gate
blocked   prerequisite or external gate unresolved
unknown   evidence insufficient for an honest classification
```

```text
active_frontier = active nodes
                + ready nodes whose predecessors are verified
```

Completion and uncertainty are different questions. A slice can remain incomplete while some claims are already verified. Close those claims; keep unresolved work explicit as open, blocked, or unknown. Never infer confidence from checkbox count alone.

The graph is a view. Do not create a second hand-maintained database or dashboard.

## Frontier protocol

At every meaningful boundary:

1. Read the claim graph, ledger, Git state, evidence, and relevant external pins.
2. Derive active, ready, blocked, and unknown work.
3. Select the smallest high-value vertical on the reachable frontier.
4. Claim it atomically when more than one writer exists.
5. Build freely inside the stated scope and safety boundaries.
6. Run claim-matched tests, reviews, and runtime probes.
7. Reconcile claims, decisions, evidence, and ledger state.
8. Derive the frontier again.

Do not follow yesterday's plan after new evidence changes the graph.

## One climb

```text
initial:
  C-1 verified  project builds at commit abc123
  C-2 ready     reject anonymous artifact access; depends on C-1
  C-3 blocked   publish release; depends on C-2 plus human approval
  C-4 ready     redact secrets from logs; depends on C-1

active_frontier = [C-2, C-4]
select C-2 → implement → run its named probe → review → commit def456
reconcile C-2 as verified with evidence at def456
derive again: C-4 remains ready; C-3 remains blocked until approval
```

The slice produced official progress without pretending the release was complete. A second worker could take C-4 only if ownership and files were isolated; otherwise the same climber takes it next.

## Selection policy

Prefer work that unlocks downstream nodes, reduces product or safety uncertainty, fits one evidence-bearing vertical, has bounded ownership, and costs less to coordinate than it returns.

Checked-box count is not the objective. Reliable movement of the reachable frontier is.

## Parallelism

Start a second writing worker only when both slices are ready now, neither depends on the other's unfinished result, files and runtime state can be isolated, each worker owns one explicit task, and one integrator owns reconciliation of the master claim graph.

If setup and merge cost approach serial execution cost, stay serial.

## Human steering

The human supplies intent, priorities, new evidence, stop decisions, and authority for irreversible actions. The human does not need to inspect every tool call.

Persist steering at the narrowest authoritative surface:

```text
product meaning changed       → claim graph
priority or blocker changed   → execution ledger
new observation               → evidence store
temporary implementation hint → current context
```

Prefer review at events such as a vertical seal, material finding, upstream drift, or public action. Continuous outer-agent supervision can cost as much as another worker while adding little product progress.

## Failure modes

- Checkbox closure without claim-matched evidence.
- A task tracker that silently becomes a second product spec.
- A dashboard that drifts from its source files.
- Review infrastructure that starts reviewing and hardening itself.
- Parallel workers without isolated ownership.
- External gates that block unrelated local work.
- Automatic continuation that wakes without new work.

Guardrails should bound product work. They should not become the product.

## Optional upgrades

Add only after an observed need:

- a durable goal for unattended continuation;
- hooks for deterministic reminders or hard boundaries;
- a dependency-aware ledger for long or concurrent work;
- an on-demand outer review for distance and course correction;
- required CI, branch protection, or human approval for release authority.

None belongs in the base protocol.

## Copy-paste prompt

```text
Adopt Graph Climbing for this repository.

Use existing repository artifacts. Do not install or build an orchestration platform.

First perform a read-only audit:
1. Find the durable source that defines the desired state and done criteria.
2. Identify stable completion claims, probes, dependencies, and current status.
3. Find the current task or debt ledger, if one exists.
4. Inspect Git state, tests, review evidence, and relevant external pins.
5. Derive the active frontier: active and genuinely ready work only.
6. Distinguish verified completion from unreconciled evidence candidates.
7. Report current, next, and next-plus-one work.
8. Report parallel lanes only when dependencies and file ownership make them safe.

Then select one bounded product vertical. Execute autonomously until its evidence-based definition of done is met. Reconcile the durable source and ledger at the boundary, derive the frontier again, and continue.

Never maintain a second authority for the same concern. Never add continuous supervision, hooks, goals, or governance machinery without an observed failure that justifies it. Start parallel workers only under the Parallelism conditions.
```

## Evidence so far

The originating case is a forkable agent-service template with 161 product claims, moving upstream specifications, adversarial protocol tests, repeated code review, and a dependency ledger.

The useful result was not uninterrupted autonomy. The build exposed two opposite failure modes:

- The agent could hold scattered context together while the durable spec lagged behind.
- A later attempt to harden observability grew into a self-blocking governance loop.

The correction kept product review and evidence-based closure, restored one current product graph, and made outer supervision event-driven.

One case does not establish a universal productivity gain. It does show that a durable claim graph can survive long runs, context loss, upstream drift, review findings, interruption, and resumed execution without requiring permanent supervision.

## Falsification

Graph Climbing is failing if teams repeatedly cannot reconstruct the current frontier, close claims without matching evidence, spend more on coordination than the parallel work saves, or need a strong agent to remember state missing from durable artifacts.

Track claim coverage, closure integrity, reopen rate, spec-ledger divergence, time to derive the next frontier, review yield, and governance overhead.

## License

MIT
