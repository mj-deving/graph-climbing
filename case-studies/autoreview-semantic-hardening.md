# From Vibe Coding to Hardened Software

Evidence scope: the bilateral Vet vertical from the active DACS Forge build, captured on 2026-07-20.

Vibe coding asks: Does it run?

Hardened engineering asks harder questions. Can the code accept evidence from the wrong authority? Can valid data be replayed across sessions? Can timestamps drift after restart? Can non-canonical JSON carry different signed meaning? Can a database migration bless an invalid state? Can a passing result bypass an unmet verification requirement?

The bilateral Vet implementation began as a functional product slice. Across 24 semantic review rounds, Autoreview produced 33 concrete findings:

- 32 accepted
- 23 P1
- 22 security-classified
- 16 corrective code commits
- final Codex Round 024 clean at `0.96` confidence

These were not formatting complaints. The findings forced the implementation to authenticate who produced Vet evidence, bind it to the correct listing, agreement, party, session, and lifecycle moment, reject replay and ambiguous authority, close privacy schemas, preserve canonical bytes, survive hostile resolvers, and fail closed during malformed database migrations.

The first clean Codex snapshot arrived in Round 019. Deeper findings still emerged. The targeted Fable pass in Round 020 exposed a privacy-schema gap. Later Codex rounds uncovered incomplete ClaimRequirement enforcement, unsigned verification claims, non-canonical resolver JSON, and a broken migration edge case. Each correction clarified the contract and exposed the next contradiction.

```text
plausible implementation
  -> adversarial counterexample
  -> correction
  -> sharper contract
  -> deeper counterexample
  -> hardened implementation
```

This is iterative semantic hardening. Vibe coding produces convincing behavior quickly. Autoreview attacks the gap between “the code runs” and “the code means exactly what it claims” under mutation, restart, ambiguity, hostile input, and adversarial composition.

That distinction matters in an agent-commerce protocol. The implementation governs signatures, identity, settlement evidence, delivery, reputation, and potentially money. A semantic ambiguity can become an authority bypass, false reputation signal, or invalid commercial outcome.

Autoreview does not replace tests, specifications, or independent conformance. It makes them more useful by generating snapshot-bound counterexamples. A reviewer finding has no authority by itself. The builder checks it against source and specification, records an explicit disposition, corrects accepted findings, reruns focused probes, and reviews the new snapshot again.

“One-shot production quality” therefore does not mean one model pass. The iterations happen inside the vertical before handoff. The downstream consumer receives a clean, evidence-bound snapshot rather than the first plausible draft.

The broader run also exposed the limit. Product-facing Autoreview remained load-bearing, but recursive review of newly invented review infrastructure consumed 28 commits without moving a DACS lifecycle claim. The team froze that governance expansion and preserved the product hardening loop.

The [DACS Forge Graph Climbing field report](dacs-agent-template.md) records that full steering and recovery path. The final Graph Climbing and DACS Forge engineering case studies will remain separate until the active build produces their complete evidence.
