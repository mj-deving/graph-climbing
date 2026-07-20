# Spec and ledger options

Graph Climbing specifies functions, not a mandatory tool stack.

## Product authority

The product authority must preserve:

- human intent and desired state;
- boundaries and critical anti-claims;
- stable atomic done criteria;
- falsifying probes;
- dependencies and vertical slices;
- official status, decisions, invalidation, and evidence references.

The reference `SPEC.md` is sufficient. An ISA can provide a deeper version of the same contract. Other specification systems are usable when they preserve the functions above and remain the single authority for product meaning.

## Operational ledger

No ledger is needed for short serial work. Add one when ownership, debt, external gates, or dependencies must survive sessions or coordinate writers.

The ledger stores what is owed and who owns it. It does not duplicate the detailed product criteria. Beads, GitHub Issues, Linear, or an existing project tracker may serve this role.

## Evidence

Start with Git, tests, runtime observations, and existing CI. Add structured review or release artifacts only when a real provenance or authority requirement exists.

## Optional runtime support

Durable goals, lifecycle hooks, schedulers, and outer supervisors may improve liveness or enforcement. They are not the memory or truth layer and are excluded from the default setup.
