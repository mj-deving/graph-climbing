# Graph Climbing terminology

Graph Climbing uses established names for established execution and verification mechanisms. Its own vocabulary is limited to the method's authority, frontier, evidence, and reconciliation profile. This page is a usage guide, not a claim that Graph Climbing coined the underlying computer-science terms.

## Execution topology

- **Workflow orchestration** describes systems that coordinate workflow steps and control flow. For a workflow graph, say **DAG workflow orchestration** only when the control or dependency graph is directed and acyclic. Do not use workflow orchestration as an umbrella for all parallel computing or graph processing. See [Apache Airflow DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) and the [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api).
- **Node** and **edge** are generic graph terms. Qualify the node type and edge meaning. In Graph Climbing, a claim is a product-truth node, while a vertical is an optional execution unit. Claim dependencies and execution edges are different authorities.
- A **router** or **routing function** is the mechanism that selects a branch. A **conditional edge** or **conditional branch** is the resulting graph structure. A product-specific example is an AWS Step Functions [Choice state](https://docs.aws.amazon.com/step-functions/latest/dg/state-choice.html).
- **Fan-out/fan-in** is the general split-and-converge shape. Use **scatter-gather** when one request is distributed to multiple recipients and their responses are aggregated. Use **fork-join** when a parent computation forks subtasks and later joins their completion or results. Use **MapReduce** only when map and reduce semantics actually apply. See [Scatter-Gather](https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html), Java's [ForkJoinTask](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ForkJoinTask.html), and the original [MapReduce paper](https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf).
- **Pipeline** means staged composition. Say **pipelined execution** or **pipeline parallelism** only when stages overlap across in-flight items. **Task parallelism** and **data parallelism** are separate dimensions and can be combined with a pipeline. A product API named `pipeline()` or `parallel()` does not establish a universal taxonomy. See [pipeline computing](https://en.wikipedia.org/wiki/Pipeline_%28computing%29) and the AWS Step Functions [Parallel state](https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html).
- A **cycle** is a topology property. A **super-step** is a synchronized execution round in Pregel-style bulk-synchronous graph processing. A controller that repeats until no new result appears is an **iterative loop with a no-change stopping heuristic**. Call it **fixed-point iteration** only when a defined transformation is repeatedly applied toward a fixed point under an appropriate convergence criterion. See the [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) and this [distributed graph-processing survey](https://ar5iv.labs.arxiv.org/html/1507.04405).
- A **barrier** synchronizes participants before a cross-set operation or shared release. It is not a synonym for every dependency or join. See [barrier synchronization](https://en.wikipedia.org/wiki/Barrier_%28computer_science%29).
- **Dynamic routing**, **imperative flow**, and **agent handoff** describe different mechanisms. Use handoff only when control transfers between agents. See [OpenAI Swarm handoffs](https://github.com/openai/swarm).

## Verification and refinement

- **Self-consistency** samples diverse reasoning paths and aggregates their answers. Independent review of one artifact is not self-consistency. See [Wang et al.](https://arxiv.org/abs/2203.11171).
- **Self-verification** is a broad same-system checking category. Weng et al.'s **backward self-verification** is the narrower candidate-answer method defined in their [paper](https://arxiv.org/abs/2212.09561).
- **Multi-agent debate** requires agents to exchange arguments over multiple rounds. Independent parallel reviews are not debate. See [Du et al.](https://arxiv.org/abs/2305.14325).
- **Mixture-of-Agents** is the layered architecture in which agents at each layer consume all outputs from the preceding layer. Generic verifier diversity is not Mixture-of-Agents. See [Wang et al.](https://arxiv.org/abs/2406.04692).
- **LLM-as-a-judge** means a language model evaluates an output. **Generator-verifier** means producer and evaluator roles are separated. **Best-of-N** means an evaluator ranks N candidates and the highest-ranked candidate is selected. These are independent dimensions. See [Zheng et al.](https://arxiv.org/abs/2306.05685) and [Cobbe et al.](https://arxiv.org/abs/2110.14168).
- **Self-Refine** uses the same language model as generator, feedback provider, and refiner across iterations. **Reflexion** uses linguistic feedback retained in episodic memory across trials. A generic review-and-repair loop is neither method unless those defining mechanics are present. See [Self-Refine](https://arxiv.org/abs/2303.17651) and [Reflexion](https://arxiv.org/abs/2303.11366).

Graph Climbing normally uses the generic terms **independent verification**, **verifier**, **verifier fan-out**, or **iterative refinement loop**. Use a named research method only when its defining mechanics are implemented.

## Graph Climbing profile vocabulary

These terms describe the method's own contract. They do not replace the established topology and verification terms above.

- **claim graph**: durable product authority containing atomic falsifiable claims and their real dependencies.
- **claim frontier**: open claims whose dependencies are verified and which are not blocked or unknown.
- **active frontier**: executable selection set; claims without an Execution Graph, verticals when one exists.
- **vertical**: bounded implementation unit over reachable claims, not a synonym for every workflow node.
- **Execution Graph**: optional persisted execution topology for verticals, dependencies, and gates. It does not define product truth.
- **operational ledger**: optional tracker for ownership, status, and execution debt. Use at most one; it does not replace the claim graph.
- **evidence**: snapshot-bound observation supporting or refuting a claim.
- **climb**: one `derive -> select -> build -> verify -> reconcile` iteration.
- **reconcile**: update each owning durable surface: product claims, operational state, evidence records, and decisions.

## Evidence boundary

The linked sources are primarily official documentation and primary research papers. The barrier and pipeline links are general reference sources used only to support established usage. This page does not establish scientific novelty for Graph Climbing; that would require a systematic related-work review and controlled evidence.
