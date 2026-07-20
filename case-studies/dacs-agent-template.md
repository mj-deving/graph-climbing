# DACS agent template: origin case

Graph Climbing was distilled from a long-running build of a forkable canonical service template for DACS Agent Commerce.

This is an evidence-bounded excerpt, not a release claim or retrospective hero story.

## Product shape

The build combined:

- a moving upstream protocol specification;
- 161 product claims in a long-lived project ISA;
- a dependency-aware Beads ledger;
- fixture-first buyer, seller, and orchestrator lifecycle work;
- adversarial protocol tests;
- repeated product-facing Codex reviews;
- selected cross-vendor review;
- upstream pin and drift checks.

One sealed delivery-integrity checkpoint reported 461 passing tests, 43,345 assertions, 36 built modules, focused 66/66 verification, clean Codex review round 009, one Fable pass, and clean Opus round 010. Product and evidence seals landed separately as commits `b6ff5cb` and `761c9a9`. Earlier review rounds lacked complete native provenance, and that gap remained explicit rather than reconstructed as certainty.

## Failure in the control layer

The build also produced the strongest negative evidence for the protocol.

An external request for better review observability was expanded into review-control, cold-handoff, and outer-verification gates. Between product checkpoint `8205be4` and governance freeze `a383e99`, the run produced:

- 28 commits without a new DACS lifecycle vertical;
- 3,314 added lines of review-control and ISA code;
- 18 semantic review rounds and 54 findings;
- unchanged product progress during the detour;
- an outer persistent goal that consumed roughly 2.93 million tokens before manual pause.

The findings were often technically real. The optimization target was wrong: governance hardening had become the active hill. A human event check interrupted the loop, froze the experimental control layer, restored product work, and kept product-facing autoreview load-bearing.

## Lessons carried into Graph Climbing

- Durable product truth matters more than chat continuity.
- Evidence-based completion can still optimize the wrong definition of done.
- Product review and recursive governance review are different cost categories.
- Outer supervision should normally be human-triggered or event-driven.
- A task ledger should preserve debt and coordination, not become a second specification.
- Handoff should emerge from clean spec, ledger, Git, and evidence surfaces.
- Guardrails must bound the work, not become the work.

The case shows survivability under long runs, interruption, review findings, and upstream drift. It does not yet establish universal productivity gains. The public protocol therefore keeps ISA, Beads, goal runtimes, hooks, and outer supervisors optional.
