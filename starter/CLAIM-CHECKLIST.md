# Claim Checklist

Use this before accepting a done criterion.

## Split when

- one part can pass while another independently fails;
- one test command contains assertions that can independently pass or fail;
- `and`, `with`, `including`, `all`, `every`, or `complete` hides multiple outcomes;
- the criterion crosses UI, API, data, runtime, security, or release boundaries;
- one probe cannot return one binary decision.

Stop splitting when another split adds no falsifying power.

## Keep

- a stable ID that is never reassigned;
- desired-state wording, not an implementation task;
- one named falsifying probe;
- explicit dependencies only when they affect reachability;
- evidence tied to an exact commit, artifact, runtime, or observation;
- at least one `Anti:` criterion for a critical failure boundary.

## Refine safely

- Preserve a split parent and add child IDs such as `C-7.1` and `C-7.2`.
- Preserve dropped IDs as tombstones with a decision reference.
- Reopen a verified criterion when new evidence invalidates it.
- Record why the desired state or graph changed.

## Do not confuse

- green tests with full product evidence;
- review findings with verified defects;
- activity with completion;
- uncertainty with zero progress;
- a generated graph view with a new source of truth.
