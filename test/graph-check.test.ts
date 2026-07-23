import { describe, expect, test } from "bun:test";
import { checkSpec, parseList } from "../skills/graph-climbing/scripts/graph-check";

const base = `
# Intent
> Build the smallest useful notes CLI.
# Desired State
Users can save and read local notes.
# Boundaries
## Out of Scope
- Sync.
## Constraints
- Local files only.
# Done Criteria
### C-1: Notes are stored locally
- status: verified
- depends_on: []
- probe: bun test test/add.test.ts
- evidence: commit:abc123
- invalidated_by: []
### C-2: Anti: Invalid input creates no note
- status: open
- depends_on: [C-1]
- probe: bun test test/invalid.test.ts
- evidence: none
- invalidated_by: []
# Work Graph
current_slice: S-2
### S-1: Store one note
- status: verified
- satisfies: [C-1]
- depends_on: []
- owner: none
- allowed_scope: [src/store.ts]
- external_gates: []
### S-2: Reject invalid input
- status: planned
- satisfies: [C-2]
- depends_on: [S-1]
- owner: none
- allowed_scope: [src/cli.ts]
- external_gates: []
`;

const claimOnly = `
# Intent
> Build the smallest useful notes CLI.
# Desired State
Users can save local notes safely.
# Boundaries
## Out of Scope
- Sync.
## Constraints
- Local files only.
# Done Criteria
### C-1: Notes are stored locally
- status: verified
- depends_on: []
- probe: bun test test/add.test.ts
- evidence: commit:abc123
- invalidated_by: []
### C-2: Anti: Invalid input creates no note
- status: open
- depends_on: [C-1]
- probe: bun test test/invalid.test.ts
- evidence: none
- invalidated_by: []
# Decisions
- Keep this short serial adoption claim-first.
# Verification
- C-1: commit:abc123
`;

async function topologyFixture(name: string): Promise<string> {
  return Bun.file(new URL(`../conformance/fixtures/topology/${name}.md`, import.meta.url)).text();
}

describe("parseList", () => {
  test("parses bracket lists and empty values", () => {
    expect(parseList("[C-1, C-2]")).toEqual(["C-1", "C-2"]);
    expect(parseList("[]")).toEqual([]);
    expect(parseList("none")).toEqual([]);
  });
});

test("starter distribution matches the skill asset", async () => {
  const starter = await Bun.file(new URL("../starter/SPEC.md", import.meta.url)).text();
  const asset = await Bun.file(new URL("../skills/graph-climbing/assets/SPEC.md", import.meta.url)).text();
  expect(starter).toBe(asset);
});

test("goal distribution matches the skill asset", async () => {
  const starter = await Bun.file(new URL("../starter/GOAL.md", import.meta.url)).text();
  const asset = await Bun.file(new URL("../skills/graph-climbing/assets/GOAL.md", import.meta.url)).text();
  expect(starter).toBe(asset);
});

test("repository adapter distribution stays identical and stable", async () => {
  const starter = await Bun.file(new URL("../starter/AGENT-ROUTER.md", import.meta.url)).text();
  const asset = await Bun.file(new URL("../skills/graph-climbing/assets/AGENT-ROUTER.md", import.meta.url)).text();
  const protocol = await Bun.file(new URL("../GRAPH-CLIMBING.md", import.meta.url)).text();
  expect(starter).toBe(asset);
  expect(starter).toContain("product_authority");
  expect(starter).toContain("operational_ledger");
  expect(starter).toContain("When `.beads/` exists");
  expect(starter).toContain("chat, session transcripts, model memory, and hook summaries");
  expect(starter).not.toMatch(/\bDACS-standard-|\b[CS]-\d+/);
  expect(protocol).toContain("persist that resolved map in the repository's native agent instructions");
  expect(protocol).toContain("Audit-only use writes nothing");
});

test("worker runtime stays task-free and below the native goal limit", async () => {
  const goal = await Bun.file(new URL("../starter/GOAL.md", import.meta.url)).text();
  const runtime = goal.match(/```text\n([\s\S]*?)\n```/)?.[1];
  const protocol = await Bun.file(new URL("../GRAPH-CLIMBING.md", import.meta.url)).text();
  expect(runtime).toBeDefined();
  expect(runtime!.length).toBeLessThan(4_000);
  expect(protocol).toContain(`\`\`\`text\n${runtime}\n\`\`\``);
  expect(runtime).toContain("derive the frontier from product authority with its repository-bound checker or adapter");
  expect(runtime).toContain("Use graph-check only when it explicitly recognizes the authority format");
  expect(runtime).toContain("vertical or companion join");
  expect(runtime).toContain("first resume any lease already owned by this runtime incarnation");
  expect(runtime).toContain("any applicable epoch");
  expect(runtime).toContain("unique runtime incarnation");
  expect(runtime).toContain("re-read exact ownership, bindings, and barriers");
  expect(runtime).toContain("inactive barriers");
  expect(runtime).toContain("A failed claim re-derives only in a declared multi-worker run");
  expect(runtime).toContain("locally select one bounded frontier item with a complete envelope as its lease");
  expect(runtime).toContain("At a safe boundary, apply only steering that targets the owned lease");
  expect(runtime).toContain("Atomically claim ledger steering");
  expect(runtime).toContain("before closing the steering record");
  expect(runtime).not.toMatch(/\bDACS-standard-|\b[CS]-\d+/);
  expect(runtime).not.toContain("bd update");
  expect(runtime).not.toContain("recovery barrier ID");
});

describe("graph-check", () => {
  test("derives a valid frontier", () => {
    const report = checkSpec(base);
    expect(report.valid).toBe(true);
    expect(report.claimFrontier).toEqual(["C-2"]);
    expect(report.frontierKind).toBe("vertical");
    expect(report.activeFrontier).toEqual(["S-2"]);
    expect(report.blocked).toEqual([]);
  });

  test("derives a claim frontier without an execution graph", () => {
    const report = checkSpec(claimOnly);
    expect(report.valid).toBe(true);
    expect(report.counts.slices).toBe(0);
    expect(report.claimFrontier).toEqual(["C-2"]);
    expect(report.frontierKind).toBe("claim");
    expect(report.activeFrontier).toEqual(["C-2"]);
    expect(report.currentSlice).toBeNull();
  });

  test("warns when execution markers sit outside an exact Work Graph section", () => {
    const mislabeled = base.replace("# Work Graph", "# Work Graph — execution");
    const report = checkSpec(mislabeled);
    expect(report.valid).toBe(false);
    expect(report.frontierKind).toBe("claim");
    expect(report.warnings.some((warning) => warning.startsWith("possible_work_graph_heading"))).toBe(true);
    expect(report.errors.some((error) => error.startsWith("current_slice_outside_work_graph"))).toBe(true);
    expect(report.errors.some((error) => error.startsWith("vertical_outside_work_graph"))).toBe(true);
  });

  test("keeps an independent claim reachable when another claim is blocked", () => {
    const independent = claimOnly.replace(
      "# Decisions",
      `### C-3: A release is approved
- status: blocked
- depends_on: []
- probe: gh release view
- evidence: none
- invalidated_by: []
# Decisions`,
    );
    const report = checkSpec(independent);
    expect(report.activeFrontier).toEqual(["C-2"]);
    expect(report.blocked).toEqual(["C-3"]);
  });

  test("keeps an independent vertical reachable when another vertical has an external gate", () => {
    const gated = base
      .replace("current_slice: S-2", "current_slice: S-3")
      .replace(
        "# Work Graph",
        `### C-3: Local diagnostics are available
- status: open
- depends_on: [C-1]
- probe: bun test test/diagnostics.test.ts
- evidence: none
- invalidated_by: []
# Work Graph`,
      )
      .replace(
        "allowed_scope: [src/cli.ts]\n- external_gates: []",
        "allowed_scope: [src/cli.ts]\n- external_gates: [release approval]",
      )
      .replace(
        "### S-2: Reject invalid input",
        `### S-3: Add local diagnostics
- status: planned
- satisfies: [C-3]
- depends_on: [S-1]
- owner: none
- allowed_scope: [src/diagnostics.ts]
- external_gates: []
### S-2: Reject invalid input`,
      );
    const report = checkSpec(gated);
    expect(report.activeFrontier).toEqual(["S-3"]);
    expect(report.blocked).toEqual(["S-2"]);
  });

  test("allows accepted review evidence to reopen a claim and reduce progress", () => {
    const before = checkSpec(claimOnly.replace(
      "status: open\n- depends_on: [C-1]",
      "status: verified\n- depends_on: [C-1]",
    ).replace("evidence: none", "evidence: commit:def456"));
    const after = checkSpec(claimOnly
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: accepted-and-verified-review-finding:F-7@def456"));
    expect(before.counts.verifiedClaims).toBe(2);
    expect(after.valid).toBe(true);
    expect(after.counts.verifiedClaims).toBe(0);
    expect(after.activeFrontier).toEqual(["C-1"]);
    expect(after.blocked).toEqual(["C-2"]);
  });

  test("allows a vertical to contain an internally closed claim chain", () => {
    const chained = base
      .replace(
        "# Work Graph",
        `### C-3: Invalid input reports a stable error
- status: open
- depends_on: [C-2]
- probe: bun test test/invalid-message.test.ts
- evidence: none
- invalidated_by: []
# Work Graph`,
      )
      .replace("satisfies: [C-2]", "satisfies: [C-2, C-3]");
    const report = checkSpec(chained);
    expect(report.valid).toBe(true);
    expect(report.claimFrontier).toEqual(["C-2"]);
    expect(report.activeFrontier).toEqual(["S-2"]);
  });

  test("rejects verified claims without evidence", () => {
    const report = checkSpec(base.replace("evidence: commit:abc123", "evidence: none"));
    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.startsWith("C-1: verified_without_evidence"))).toBe(true);
  });

  test("rejects unknown dependencies", () => {
    const report = checkSpec(base.replace("depends_on: [C-1]", "depends_on: [C-404]"));
    expect(report.errors).toContain("C-2: unknown_claim_dependency C-404");
  });

  test("rejects dependency cycles", () => {
    const cyclic = base
      .replace("depends_on: []\n- probe: bun test test/add.test.ts", "depends_on: [C-2]\n- probe: bun test test/add.test.ts");
    const report = checkSpec(cyclic);
    expect(report.errors.some((error) => error.startsWith("claim_cycle:"))).toBe(true);
  });

  test("keeps semantically suspicious atomicity as a warning", () => {
    const report = checkSpec(base.replace("Notes are stored locally", "Notes are stored and indexed locally"));
    expect(report.valid).toBe(true);
    expect(report.warnings.some((warning) => warning.includes("possible_atomicity_violation"))).toBe(true);
  });

  test("warns when one probe asserts independently failing outcomes", () => {
    const report = checkSpec(
      base.replace(
        "probe: bun test test/add.test.ts",
        "probe: run command and assert exit 0 and output file exists",
      ),
    );
    expect(report.valid).toBe(true);
    expect(report.warnings.some((warning) => warning.includes("possible_compound_probe"))).toBe(true);
  });

  test("rejects leaked generation wrapper markers", () => {
    const report = checkSpec(`${base}\n</content>\n`);
    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.includes("unexpected_generation_marker"))).toBe(true);
  });

  test("allows generation-marker examples inside code blocks", () => {
    const fenced = checkSpec(`${base}\n\`\`\`xml\n<artifact>\n\`\`\`\n`);
    const indented = checkSpec(`${base}\n    <content>\n`);
    expect(fenced.valid).toBe(true);
    expect(indented.valid).toBe(true);
  });

  test("allows no current slice after complete verification", () => {
    const complete = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace("status: open\n- depends_on: [C-1]", "status: verified\n- depends_on: [C-1]")
      .replace("evidence: none", "evidence: commit:def456")
      .replace("status: planned\n- satisfies: [C-2]", "status: verified\n- satisfies: [C-2]");
    const report = checkSpec(complete);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual([]);
    expect(report.warnings).not.toContain("current_slice_missing: select one active or ready slice before building");
  });

  test("keeps slices with unknown claims outside the frontier", () => {
    const unknown = base.replace(
      "status: open\n- depends_on: [C-1]",
      "status: unknown\n- depends_on: [C-1]",
    );
    const report = checkSpec(unknown);
    expect(report.activeFrontier).toEqual([]);
    expect(report.blocked).toContain("S-2");
    expect(report.errors).toContain("current_slice_unreachable: S-2");
  });

  test("rejects omitted required graph fields", () => {
    const report = checkSpec(base.replace("- owner: none\n", ""));
    expect(report.errors.some((error) => error.includes("required_field_missing owner"))).toBe(true);
  });

  test("rejects verified slices with unfinished predecessors", () => {
    const inconsistent = base
      .replace("status: verified\n- satisfies: [C-1]", "status: planned\n- satisfies: [C-1]")
      .replace("status: open\n- depends_on: [C-1]", "status: verified\n- depends_on: [C-1]")
      .replace("evidence: none", "evidence: commit:def456")
      .replace("status: planned\n- satisfies: [C-2]", "status: verified\n- satisfies: [C-2]");
    const report = checkSpec(inconsistent);
    expect(report.errors).toContain("S-2: verified_with_unverified_predecessor S-1");
  });

  test("rejects incomplete claims with no owning slice", () => {
    const orphan = base.replace(
      "# Work Graph",
      `### C-3: Orphaned behavior exists
- status: open
- depends_on: []
- probe: bun test test/orphan.test.ts
- evidence: none
- invalidated_by: []
# Work Graph`,
    );
    const report = checkSpec(orphan);
    expect(report.errors).toContain("C-3: incomplete_claim_without_slice");
  });

  test("does not let dropped slices own incomplete claims", () => {
    const droppedOwner = base.replace(
      "status: planned\n- satisfies: [C-2]",
      "status: dropped\n- satisfies: [C-2]",
    );
    const report = checkSpec(droppedOwner);
    expect(report.errors).toContain("C-2: incomplete_claim_without_slice");
  });

  test("requires a live Anti criterion", () => {
    const droppedAnti = base.replace(
      "status: open\n- depends_on: [C-1]",
      "status: dropped\n- depends_on: [C-1]",
    );
    const report = checkSpec(droppedAnti);
    expect(report.errors).toContain("anti_claim_missing: add at least one critical Anti: criterion");
  });

  test("rejects stale planned slices whose claims are complete", () => {
    const stale = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace("status: open\n- depends_on: [C-1]", "status: verified\n- depends_on: [C-1]")
      .replace("evidence: none", "evidence: commit:def456");
    const report = checkSpec(stale);
    expect(report.errors).toContain("S-2: planned_without_open_claim");
    expect(report.blocked).not.toContain("S-2");
  });

  test("rejects malformed graph headings without overwriting prior nodes", () => {
    const malformed = base.replace(
      "# Work Graph",
      "### malformed claim heading\n- status: verified\n# Work Graph",
    );
    const report = checkSpec(malformed);
    expect(report.errors.some((error) => error.includes("unparseable_claim_heading"))).toBe(true);
  });

  test("ignores graph-shaped examples inside fenced code", () => {
    const fenced = `${base}
\`\`\`markdown
# Done Criteria
### C-99: Phantom claim
- status: open
\`\`\`
`;
    const report = checkSpec(fenced);
    expect(report.counts.claims).toBe(2);
    expect(report.errors).not.toContain("C-99: incomplete_claim_without_slice");
  });

  test("does not close a four-character fence with a shorter or annotated run", () => {
    const fenced = base +
      "\n````markdown\n```\n``` not-a-close\n# Done Criteria\n### C-99: Phantom claim\n- status: open\n````\n";
    const report = checkSpec(fenced);
    expect(report.counts.claims).toBe(2);
    expect(report.errors).not.toContain("C-99: incomplete_claim_without_slice");
  });

  test("ignores indented code instead of accepting it as node metadata", () => {
    const indented = base.replace("- status: open\n", "    - status: open\n");
    const report = checkSpec(indented);
    expect(report.errors.some((error) => error.includes("C-2: required_field_missing status"))).toBe(true);
  });

  test("rejects unclosed fences and duplicate current-slice selectors", () => {
    expect(checkSpec(`${base}\n\`\`\`markdown\n`).errors).toContain("unclosed_code_fence");
    const duplicate = base.replace("current_slice: S-2", "current_slice: S-2\ncurrent_slice: S-1");
    expect(duplicate).toContain("current_slice: S-1");
    expect(checkSpec(duplicate).errors.some((error) => error.startsWith("duplicate_current_slice"))).toBe(true);
  });

  test("rejects duplicate node fields", () => {
    const duplicate = base.replace(
      "status: open\n- depends_on: [C-1]",
      "status: open\n- status: verified\n- depends_on: [C-1]",
    );
    const report = checkSpec(duplicate);
    expect(report.errors.some((error) => error.includes("C-2: duplicate_field status"))).toBe(true);
  });

  test("rejects unknown invalidation references", () => {
    const report = checkSpec(base.replace("invalidated_by: []", "invalidated_by: [C-404]"));
    expect(report.errors).toContain("C-1: unknown_invalidator C-404");
  });

  test("rejects verified claims whose declared invalidator is verified", () => {
    const invalidated = base
      .replace("invalidated_by: []", "invalidated_by: [C-2]")
      .replace("status: open\n- depends_on: [C-1]", "status: verified\n- depends_on: [C-1]")
      .replace("evidence: none", "evidence: commit:def456");
    const report = checkSpec(invalidated);
    expect(report.errors).toContain("C-1: verified_but_invalidated_by C-2");
  });

  test("rejects verified claims with unfinished prerequisites", () => {
    const inconsistent = base
      .replace(
        "depends_on: []\n- probe: bun test test/add.test.ts",
        "depends_on: [C-2]\n- probe: bun test test/add.test.ts",
      )
      .replace(
        "depends_on: [C-1]\n- probe: bun test test/invalid.test.ts",
        "depends_on: []\n- probe: bun test test/invalid.test.ts",
      );
    const report = checkSpec(inconsistent);
    expect(report.errors).toContain("C-1: verified_with_unverified_dependency C-2");
  });

  test("rejects non-dropped claims that depend on dropped tombstones", () => {
    const impossible = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace("status: verified\n- depends_on: []", "status: dropped\n- depends_on: []")
      .replace("status: verified\n- satisfies: [C-1]", "status: dropped\n- satisfies: [C-1]")
      .replace("satisfies: [C-2]", "satisfies: [C-1, C-2]")
      .replace("depends_on: [S-1]", "depends_on: []");
    const report = checkSpec(impossible);
    expect(report.errors).toContain("C-2: depends_on_dropped_claim C-1");
    expect(report.activeFrontier).toEqual([]);
  });

  test("does not let dropped claim history block a live co-owned claim", () => {
    const tombstone = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("status: open\n- depends_on: [C-1]", "status: dropped\n- depends_on: [C-1]")
      .replace("status: verified\n- satisfies: [C-1]", "status: planned\n- satisfies: [C-1, C-2]")
      .replace("status: planned\n- satisfies: [C-2]", "status: dropped\n- satisfies: [C-2]");
    const report = checkSpec(tombstone);
    expect(report.errors).not.toContain("S-1: active_with_unreachable_claim");
    expect(report.activeFrontier).toEqual(["S-1"]);
  });

  test("rejects verified slices with unresolved external gates", () => {
    const gated = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace("status: open\n- depends_on: [C-1]", "status: verified\n- depends_on: [C-1]")
      .replace("evidence: none", "evidence: commit:def456")
      .replace("status: planned\n- satisfies: [C-2]", "status: verified\n- satisfies: [C-2]")
      .replace(
        "allowed_scope: [src/cli.ts]\n- external_gates: []",
        "allowed_scope: [src/cli.ts]\n- external_gates: [human approval]",
      );
    const report = checkSpec(gated);
    expect(report.errors).toContain("S-2: verified_with_external_gate");
  });

  test("rejects non-dropped slices that depend on dropped slices", () => {
    const deadEnd = base.replace(
      "status: verified\n- satisfies: [C-1]",
      "status: dropped\n- satisfies: [C-1]",
    );
    const report = checkSpec(deadEnd);
    expect(report.errors).toContain("S-2: depends_on_dropped_slice S-1");
  });

  test("rejects active slices without an owner", () => {
    const unowned = base.replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]");
    const report = checkSpec(unowned);
    expect(report.errors).toContain("S-2: active_without_owner");
  });

  test("rejects exact scope collisions between distinct active owners once", () => {
    const collision = base
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("depends_on: [C-1]\n- probe: bun test test/invalid.test.ts", "depends_on: []\n- probe: bun test test/invalid.test.ts")
      .replace("status: verified\n- satisfies: [C-1]", "status: active\n- satisfies: [C-1]")
      .replace("owner: none\n- allowed_scope: [src/store.ts]", "owner: worker-1\n- allowed_scope: [src/shared.ts]")
      .replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]")
      .replace("depends_on: [S-1]", "depends_on: []")
      .replace("owner: none\n- allowed_scope: [src/cli.ts]", "owner: worker-2\n- allowed_scope: [src/shared.ts]");
    const report = checkSpec(collision);
    expect(report.errors.filter((error) => error.includes("scope_collision"))).toEqual([
      "parallel_file_scope_collision: S-1 (worker-1) and S-2 (worker-2) overlap src/shared.ts <> src/shared.ts",
    ]);
  });

  test("does not emit parallel scope diagnostics for an unowned active vertical", () => {
    const unowned = base
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("depends_on: [C-1]\n- probe: bun test test/invalid.test.ts", "depends_on: []\n- probe: bun test test/invalid.test.ts")
      .replace("status: verified\n- satisfies: [C-1]", "status: active\n- satisfies: [C-1]")
      .replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]")
      .replace("depends_on: [S-1]", "depends_on: []")
      .replace("owner: none\n- allowed_scope: [src/cli.ts]", "owner: worker-2\n- allowed_scope: [src/cli.ts]");
    const report = checkSpec(unowned);
    expect(report.errors).toContain("S-1: active_without_owner");
    expect(report.errors.some((error) => error.startsWith("parallel_"))).toBe(false);
  });

  test("preserves legacy same-owner active-slice serialization", () => {
    const legacy = base
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("depends_on: [C-1]\n- probe: bun test test/invalid.test.ts", "depends_on: []\n- probe: bun test test/invalid.test.ts")
      .replace("status: verified\n- satisfies: [C-1]", "status: active\n- satisfies: [C-1]")
      .replace("owner: none\n- allowed_scope: [src/store.ts]", "owner: one-worker\n- allowed_scope: [src/shared.ts]")
      .replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]")
      .replace("depends_on: [S-1]", "depends_on: []")
      .replace("owner: none\n- allowed_scope: [src/cli.ts]", "owner: one-worker\n- allowed_scope: [src/shared.ts]");
    const report = checkSpec(legacy);
    expect(report.errors.some((error) => error.startsWith("parallel_"))).toBe(false);
    expect(report.warnings).toContain("legacy_parallel_release_without_topology_contract: cohort join not enforced");
  });

  test("allows parallel verticals only with disjoint file and runtime scopes", () => {
    const parallel = base
      .replace("# Work Graph\ncurrent_slice: S-2", "# Work Graph\ntopology_contract: cohort-v1\ncurrent_slice: S-2")
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("depends_on: [C-1]\n- probe: bun test test/invalid.test.ts", "depends_on: []\n- probe: bun test test/invalid.test.ts")
      .replace("status: verified\n- satisfies: [C-1]", "status: active\n- satisfies: [C-1]")
      .replace(
        "owner: none\n- allowed_scope: [src/store.ts]\n- external_gates: []",
        "reconcile_via: S-JOIN\n- owner: worker-1\n- allowed_scope: [src/store/**]\n- runtime_scope: [tmp/store-1]\n- external_gates: []",
      )
      .replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]")
      .replace("depends_on: [S-1]", "depends_on: []")
      .replace(
        "owner: none\n- allowed_scope: [src/cli.ts]\n- external_gates: []",
        "reconcile_via: S-JOIN\n- owner: worker-2\n- allowed_scope: [src/cli/**]\n- runtime_scope: [tmp/cli-2]\n- external_gates: []",
      ) + `
### S-JOIN: Integrate both active lanes
- status: planned
- satisfies: [C-1, C-2]
- depends_on: [S-1, S-2]
- join_for: [S-1, S-2]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration]
- external_gates: []
`;
    const disjoint = checkSpec(parallel);
    expect(disjoint.valid).toBe(true);
    expect(disjoint.activeFrontier).toEqual(["S-1", "S-2"]);

    const collision = checkSpec(parallel.replace("tmp/cli-2", "tmp/store-1"));
    expect(collision.errors.some((error) => error.startsWith("parallel_runtime_scope_collision:"))).toBe(true);

    const unsupported = checkSpec(parallel.replace("src/cli/**", "src/plugin-*"));
    expect(unsupported.errors).toContain(
      "unsupported_parallel_scope_pattern: src/plugin-*; use an exact scope or a terminal /**",
    );

    const normalizedCollision = checkSpec(parallel.replace("src/cli/**", "src/store/../store/session/**"));
    expect(normalizedCollision.errors.some((error) => error.startsWith("parallel_file_scope_collision:"))).toBe(true);

    for (const escaping of ["../**", "/src/**", "src\\**", "src/plugin-?/**", "src/[ab]/**", "src/{ab}/**"]) {
      const escaped = checkSpec(parallel.replace("src/cli/**", escaping));
      expect(escaped.errors).toContain(
        `unsupported_parallel_scope_pattern: ${escaping}; use an exact scope or a terminal /**`,
      );
    }

    const exactAncestor = checkSpec(parallel
      .replace("src/store/**", "src/pkg")
      .replace("src/cli/**", "src/pkg/file.ts"));
    expect(exactAncestor.valid).toBe(true);
  });

  test("keeps verticals with blocked or unknown owned claims out of the frontier", () => {
    for (const status of ["blocked", "unknown"]) {
      const unavailable = base.replace(
        "status: open\n- depends_on: [C-1]",
        `status: ${status}\n- depends_on: [C-1]`,
      );
      const report = checkSpec(unavailable);
      expect(report.activeFrontier).toEqual([]);
      expect(report.blocked).toEqual(["S-2"]);
    }
  });

  test("does not schedule claims whose external claim dependency is open", () => {
    const dependent = base
      .replace("current_slice: S-2", "current_slice: none")
      .replace(
        "# Work Graph",
        `### C-3: A downstream behavior exists
- status: open
- depends_on: [C-2]
- probe: bun test test/downstream.test.ts
- evidence: none
- invalidated_by: []
# Work Graph`,
      )
      .replace(
        "### S-2: Reject invalid input",
        `### S-3: Build downstream behavior
- status: planned
- satisfies: [C-3]
- depends_on: [S-1]
- owner: none
- allowed_scope: [src/downstream.ts]
- external_gates: []
### S-2: Reject invalid input`,
      );
    const report = checkSpec(dependent);
    expect(report.activeFrontier).toEqual(["S-2"]);
    expect(report.blocked).toContain("S-3");
  });

  for (const [name, lanes] of [["n2-sealed-join-ready", 2], ["n3-sealed-join-ready", 3], ["n4-sealed-join-ready", 4]] as const) {
    test(`derives one ready companion join for N=${lanes}`, async () => {
      const report = checkSpec(await topologyFixture(name));
      expect(report.valid).toBe(true);
      expect(report.activeFrontier).toEqual(["S-JOIN"]);
      expect(report.blocked).toEqual([]);
    });
  }

  test("rejects a released parallel cohort without a companion join", async () => {
    const source = await topologyFixture("missing-companion-join");
    const report = checkSpec(source);
    expect(report.valid).toBe(false);
    expect(report.errors).toContain("S-1: released_lane_without_reconcile_via");
    expect(report.errors).toContain("S-2: released_lane_without_reconcile_via");

    const sameOwner = checkSpec(source.replace("owner: worker-two", "owner: worker-one"));
    expect(sameOwner.errors).toContain("S-1: released_lane_without_reconcile_via");

    const staggered = checkSpec(source.replace("### S-1: Build the first behavior\n\n- status: active", "### S-1: Build the first behavior\n\n- status: sealed"));
    expect(staggered.errors).toContain("S-1: released_lane_without_reconcile_via");
  });

  test("rejects a successor that bypasses central cohort reconciliation", async () => {
    const report = checkSpec(await topologyFixture("successor-bypasses-join"));
    expect(report.valid).toBe(false);
    expect(report.errors).toContain("S-NEXT: cohort_successor_bypasses_join S-JOIN");
    expect(report.activeFrontier).toEqual(["S-JOIN"]);
  });

  test("allows one rejected lane to re-enter active work while siblings remain sealed", async () => {
    const rework = (await topologyFixture("n2-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: S-1")
      .replace("### S-1: Implement parser compatibility\n\n- status: sealed", "### S-1: Implement parser compatibility\n\n- status: active");
    const report = checkSpec(rework);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-1"]);
    expect(report.blocked).toEqual(["S-JOIN"]);
  });

  test("allows the companion join to activate only after every lane seals", async () => {
    const source = await topologyFixture("n2-sealed-join-ready");
    const activeJoin = source
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: active")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]");
    const report = checkSpec(activeJoin);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-JOIN"]);

    const premature = checkSpec(activeJoin.replace(
      "### S-1: Implement parser compatibility\n\n- status: sealed",
      "### S-1: Implement parser compatibility\n\n- status: active",
    ));
    expect(premature.errors).toContain("S-JOIN: active_before_all_cohort_lanes_sealed");
  });

  test("accepts the atomic final snapshot for lanes, join, and claims", async () => {
    const completed = (await topologyFixture("n2-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: none")
      .replaceAll("- status: open", "- status: verified")
      .replaceAll("- evidence: none", "- evidence: commit:cohort-seal")
      .replaceAll("- status: sealed", "- status: verified")
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: verified")
      .replaceAll("- status: verified\n- satisfies:", "- status: verified\n- completion_evidence: commit:cohort-seal\n- satisfies:")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]");
    const report = checkSpec(completed);
    expect(report.valid).toBe(true);
    expect(report.counts.verifiedClaims).toBe(2);
    expect(report.activeFrontier).toEqual([]);

    const mismatched = checkSpec(completed.replace(
      "completion_evidence: commit:cohort-seal",
      "completion_evidence: commit:different-lane-snapshot",
    ));
    expect(mismatched.errors).toContain("S-1: completion_evidence_must_match S-JOIN");
  });

  test("allows serial work after a cohort-v1 join has completed", async () => {
    const completed = (await topologyFixture("n2-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: S-3")
      .replaceAll("- status: open", "- status: verified")
      .replaceAll("- evidence: none", "- evidence: commit:cohort-seal")
      .replaceAll("- status: sealed", "- status: verified")
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: verified")
      .replaceAll("- status: verified\n- satisfies:", "- status: verified\n- completion_evidence: commit:cohort-seal\n- satisfies:")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]")
      .replace(
        "# Work Graph",
        `### C-3: Later serial report exists

- status: open
- depends_on: []
- probe: bun test test/report.test.ts
- evidence: none
- invalidated_by: []

# Work Graph`,
      )
      .replace(
        "# Decisions",
        `### S-3: Build the later serial report

- status: active
- satisfies: [C-3]
- depends_on: []
- owner: report-worker
- allowed_scope: [src/report/**]
- runtime_scope: [tmp/report-worker]
- external_gates: []

# Decisions`,
      );
    const report = checkSpec(completed);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-3"]);

    const claimOrdered = completed
      .replace(
        "# Work Graph",
        `### C-4: Report summary follows the serial report

- status: open
- depends_on: [C-3]
- probe: bun test test/summary.test.ts
- evidence: none
- invalidated_by: []

# Work Graph`,
      )
      .replace(
        "# Decisions",
        `### S-4: Build the later report summary

- status: planned
- satisfies: [C-4]
- depends_on: []
- owner: report-worker
- allowed_scope: [src/summary/**]
- runtime_scope: [tmp/summary-worker]
- external_gates: []

# Decisions`,
      );
    const orderedReport = checkSpec(claimOrdered);
    expect(orderedReport.valid).toBe(true);
    expect(orderedReport.errors).not.toContain("S-4: released_lane_without_reconcile_via");
    expect(orderedReport.blocked).toContain("S-4");
  });

  test("rejects a verified join while any lane or covered claim is unverified", async () => {
    const premature = (await topologyFixture("n2-sealed-join-ready"))
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: verified")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]");
    const report = checkSpec(premature);
    expect(report.errors).toContain("S-JOIN: verified_without_completion_evidence");
    expect(report.errors).toContain("S-JOIN: verified_with_unverified_cohort_lane S-1");
    expect(report.errors).toContain("S-JOIN: verified_with_unverified_cohort_lane S-2");
    expect(report.errors).toContain("C-1: reopened_after_join_without_new_evidence S-JOIN");
    expect(report.errors).toContain("C-2: reopened_after_join_without_new_evidence S-JOIN");
  });

  test("allows one claim to reopen after snapshot-bound cohort completion", async () => {
    const reopened = (await topologyFixture("n2-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: S-REOPEN")
      .replaceAll("- status: open", "- status: verified")
      .replaceAll("- evidence: none", "- evidence: commit:cohort-seal")
      .replaceAll("- status: sealed", "- status: verified")
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: verified")
      .replaceAll("- status: verified\n- satisfies:", "- status: verified\n- completion_evidence: commit:cohort-seal\n- satisfies:")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]")
      .replace("### C-1: Parser accepts the new record form\n\n- status: verified", "### C-1: Parser accepts the new record form\n\n- status: open")
      .replace("- evidence: commit:cohort-seal", "- evidence: accepted-and-verified-review-finding:F-1@later")
      .replace(
        "# Decisions",
        `### S-REOPEN: Correct the reopened parser claim

- status: planned
- satisfies: [C-1]
- depends_on: [S-JOIN]
- owner: none
- allowed_scope: [src/parser/**]
- runtime_scope: [tmp/parser-reopen]
- external_gates: []

# Decisions`,
      );
    const report = checkSpec(reopened);
    expect(report.valid).toBe(true);
    expect(report.counts.verifiedClaims).toBe(1);
    expect(report.activeFrontier).toEqual(["S-REOPEN"]);
  });

  test("rejects a covered claim verified before its companion join", async () => {
    const partial = (await topologyFixture("n2-sealed-join-ready"))
      .replace("### C-1: Parser accepts the new record form\n\n- status: open", "### C-1: Parser accepts the new record form\n\n- status: verified")
      .replace("- evidence: none", "- evidence: commit:premature-claim");
    expect(checkSpec(partial).errors).toContain("C-1: verified_before_companion_join S-JOIN");
  });

  test("rejects unfinished dependencies between lanes in one cohort", async () => {
    const dependent = (await topologyFixture("n2-sealed-join-ready"))
      .replace("### S-2: Harden invalid-record storage\n\n- status: sealed\n- satisfies: [C-2]\n- depends_on: []", "### S-2: Harden invalid-record storage\n\n- status: sealed\n- satisfies: [C-2]\n- depends_on: [S-1]");
    expect(checkSpec(dependent).errors).toContain("S-2: unfinished_dependency_within_cohort S-1");

    const claimDependent = (await topologyFixture("n2-sealed-join-ready"))
      .replace("### C-2: Anti: Invalid records mutate no stored state\n\n- status: open\n- depends_on: []", "### C-2: Anti: Invalid records mutate no stored state\n\n- status: open\n- depends_on: [C-1]");
    expect(checkSpec(claimDependent).errors).toContain("S-2: unfinished_claim_dependency_within_cohort C-1");
  });

  test("keeps independent declared cohorts separate and rejects an undeclared active outsider", async () => {
    const source = await topologyFixture("n4-sealed-join-ready");
    const twoCohorts = source
      .replaceAll("- reconcile_via: S-JOIN", "- reconcile_via: S-JOIN-A")
      .replace("current_slice: S-JOIN", "current_slice: S-JOIN-A")
      .replace("### S-JOIN: Integrate and reconcile the four-lane cohort", "### S-JOIN-A: Reconcile the first cohort")
      .replace("- satisfies: [C-1, C-2, C-3, C-4]\n- depends_on: [S-1, S-2, S-3, S-4]\n- join_for: [S-1, S-2, S-3, S-4]", "- satisfies: [C-1, C-2]\n- depends_on: [S-1, S-2]\n- join_for: [S-1, S-2]")
      .replace("### S-3: Prove recovery behavior\n\n- status: sealed\n- satisfies: [C-3]\n- depends_on: []\n- reconcile_via: S-JOIN-A", "### S-3: Prove recovery behavior\n\n- status: sealed\n- satisfies: [C-3]\n- depends_on: []\n- reconcile_via: S-JOIN-B")
      .replace("### S-4: Harden log redaction\n\n- status: sealed\n- satisfies: [C-4]\n- depends_on: []\n- reconcile_via: S-JOIN-A", "### S-4: Harden log redaction\n\n- status: sealed\n- satisfies: [C-4]\n- depends_on: []\n- reconcile_via: S-JOIN-B")
      .replace(
        "# Decisions",
        `### S-JOIN-B: Reconcile the second cohort

- status: planned
- satisfies: [C-3, C-4]
- depends_on: [S-3, S-4]
- join_for: [S-3, S-4]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration-b]
- external_gates: []

# Decisions`,
      );
    const cohortReport = checkSpec(twoCohorts);
    expect(cohortReport.valid).toBe(true);
    expect(cohortReport.activeFrontier).toEqual(["S-JOIN-A", "S-JOIN-B"]);

    const activeFirstJoin = twoCohorts
      .replace("### S-JOIN-A: Reconcile the first cohort\n\n- status: planned", "### S-JOIN-A: Reconcile the first cohort\n\n- status: active")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator-a\n- allowed_scope: [*]");
    expect(checkSpec(activeFirstJoin).errors.some(
      (error) => error.startsWith("parallel_file_scope_collision: S-JOIN-A") && error.includes("S-3"),
    )).toBe(true);

    const withSerial = (await topologyFixture("n2-sealed-join-ready"))
      .replace(
        "# Work Graph",
        `### C-3: Independent serial report exists

- status: open
- depends_on: []
- probe: bun test test/report.test.ts
- evidence: none
- invalidated_by: []

# Work Graph`,
      )
      .replace(
        "# Decisions",
        `### S-3: Build an unrelated serial report

- status: active
- satisfies: [C-3]
- depends_on: []
- owner: report-worker
- allowed_scope: [src/report/**]
- runtime_scope: [tmp/report-worker]
- external_gates: []

# Decisions`,
      );
    const serialReport = checkSpec(withSerial);
    expect(serialReport.valid).toBe(false);
    expect(serialReport.errors).toContain("S-3: released_lane_without_reconcile_via");
    expect(serialReport.activeFrontier).toEqual(["S-3", "S-JOIN"]);
  });

  test("keeps admitted disjoint work claimable while one cohort lane is a straggler", async () => {
    const source = await topologyFixture("n3-straggler-work-stealing");
    const report = checkSpec(source);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-3", "S-4", "S-5"]);

    const overlapping = checkSpec(source.replace("- allowed_scope: [src/d/**]", "- allowed_scope: [src/a/**]"));
    expect(overlapping.errors.some(
      (error) => error.startsWith("parallel_file_scope_collision: S-1") && error.includes("S-4"),
    )).toBe(true);

    const foreignJoinOverlap = checkSpec(source.replace(
      "- allowed_scope: [src/d/**, src/e/**]\n- runtime_scope: [tmp/join-b]",
      "- allowed_scope: [src/a/**]\n- runtime_scope: [tmp/join-b]",
    ));
    expect(foreignJoinOverlap.errors.some(
      (error) => error.startsWith("parallel_file_scope_collision: S-1") && error.includes("S-JOIN-B"),
    )).toBe(true);

    const unadmitted = checkSpec(source.replace(", S-4, S-5", ", S-5"));
    expect(unadmitted.errors).toContain("S-4: executable_or_reserved_but_not_epoch_admitted");

    const malformedAdmission = checkSpec(source.replace(
      "S-JOIN-B]",
      "S-JOIN-B, S-4, S-404]",
    ));
    expect(malformedAdmission.errors).toContain("duplicate_epoch_candidate: S-4");
    expect(malformedAdmission.errors).toContain("unknown_epoch_candidate: S-404");

    const orderedOverlap = checkSpec(source
      .replace("- allowed_scope: [src/d/**]", "- allowed_scope: [src/a/**]")
      .replace("### S-4: Build independent lane D\n\n- status: planned\n- satisfies: [C-4]\n- depends_on: []", "### S-4: Build independent lane D\n\n- status: planned\n- satisfies: [C-4]\n- depends_on: [S-JOIN-A]"));
    expect(orderedOverlap.valid).toBe(true);
    expect(orderedOverlap.activeFrontier).toEqual(["S-3", "S-5"]);
  });

  test("keeps sealed cohort scopes isolated from concurrent outsiders", async () => {
    const overlapping = (await topologyFixture("n2-sealed-join-ready"))
      .replace(
        "# Work Graph",
        `### C-3: Concurrent parser report exists

- status: open
- depends_on: []
- probe: bun test test/report.test.ts
- evidence: none
- invalidated_by: []

# Work Graph`,
      )
      .replace(
        "# Decisions",
        `### S-3: Mutate a sealed parser scope

- status: active
- satisfies: [C-3]
- depends_on: []
- owner: report-worker
- allowed_scope: [src/parser/**]
- runtime_scope: [tmp/report-worker]
- external_gates: []

# Decisions`,
      );
    const report = checkSpec(overlapping);
    expect(report.errors).toContain("S-3: released_lane_without_reconcile_via");
    expect(report.errors.some((error) => error.startsWith("parallel_file_scope_collision: S-1"))).toBe(true);
  });

  test("checks an active companion join against other active writers", async () => {
    const concurrent = (await topologyFixture("n2-sealed-join-ready"))
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: active")
      .replace("- owner: none\n- allowed_scope: [*]", "- owner: integrator\n- allowed_scope: [*]")
      .replace(
        "# Work Graph",
        `### C-3: Independent report exists

- status: open
- depends_on: []
- probe: bun test test/report.test.ts
- evidence: none
- invalidated_by: []

# Work Graph`,
      )
      .replace(
        "# Decisions",
        `### S-3: Build a concurrent report

- status: active
- satisfies: [C-3]
- depends_on: []
- owner: report-worker
- allowed_scope: [src/report/**]
- runtime_scope: [tmp/report-worker]
- external_gates: []

# Decisions`,
      );
    const report = checkSpec(concurrent);
    expect(report.errors.some((error) => error.startsWith("parallel_file_scope_collision: S-JOIN"))).toBe(true);
  });

  test("rejects a verified cohort lane while its companion join is unfinished", async () => {
    const premature = (await topologyFixture("n2-sealed-join-ready"))
      .replaceAll("- status: open", "- status: verified")
      .replaceAll("- evidence: none", "- evidence: commit:premature")
      .replaceAll("- status: sealed", "- status: verified");
    const report = checkSpec(premature);
    expect(report.errors).toContain("S-1: verified_before_companion_join");
    expect(report.errors).toContain("S-2: verified_before_companion_join");
  });

  test("rejects degenerate, mismatched, and claim-superset joins", async () => {
    const source = await topologyFixture("n2-sealed-join-ready");
    const n1 = checkSpec(source
      .replace("- depends_on: [S-1, S-2]\n- join_for: [S-1, S-2]", "- depends_on: [S-1]\n- join_for: [S-1]")
      .replace("- satisfies: [C-1, C-2]", "- satisfies: [C-1]"));
    expect(n1.errors).toContain("S-JOIN: companion_join_requires_at_least_two_lanes");

    const mismatch = checkSpec(source.replace("- join_for: [S-1, S-2]", "- join_for: [S-2, S-1, S-1]"));
    expect(mismatch.errors).toContain("S-JOIN: duplicate_join_lane S-1");

    const unequal = checkSpec(source.replace("- join_for: [S-1, S-2]", "- join_for: [S-1, S-404]"));
    expect(unequal.errors).toContain("S-JOIN: join_for_must_equal_depends_on");

    const self = checkSpec(source.replace("- join_for: [S-1, S-2]", "- join_for: [S-1, S-JOIN]"));
    expect(self.errors).toContain("S-JOIN: companion_join_cannot_include_itself");

    const superset = checkSpec(source.replace("- satisfies: [C-1, C-2]", "- satisfies: [C-1, C-2, C-404]"));
    expect(superset.errors).toContain("S-JOIN: join_satisfies_must_equal_cohort_claim_union");
  });

  test("rejects nested companion joins", async () => {
    const nested = (await topologyFixture("n2-sealed-join-ready")).replace(
      "# Decisions",
      `### S-NEST: Invalid nested reconciliation

- status: planned
- satisfies: [C-1, C-2]
- depends_on: [S-JOIN, S-2]
- join_for: [S-JOIN, S-2]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/nested]
- external_gates: []

# Decisions`,
    );
    const report = checkSpec(nested);
    expect(report.errors).toContain("S-NEST: nested_companion_join S-JOIN");
  });

  test("checks scope isolation even when cohort lanes share one owner", async () => {
    const source = (await topologyFixture("n2-sealed-join-ready"))
      .replace("owner: worker-store", "owner: worker-parser");
    expect(checkSpec(source).valid).toBe(true);

    const collision = checkSpec(source.replace("src/store/**", "src/parser/**"));
    expect(collision.errors.some((error) => error.startsWith("parallel_file_scope_collision:"))).toBe(true);
  });

  test("allows a dropped lane and join to be replaced by a smaller live cohort", async () => {
    const rescope = (await topologyFixture("n3-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: S-JOIN2")
      .replaceAll("- reconcile_via: S-JOIN", "- reconcile_via: S-JOIN2")
      .replace("### C-2: Output encoding remains deterministic", "### C-2: Anti: Output encoding becomes non-deterministic")
      .replace("### C-3: Anti: Diagnostics expose no secret values\n\n- status: open", "### C-3: Anti: Diagnostics expose no secret values\n\n- status: dropped")
      .replace("### S-3: Redact diagnostics\n\n- status: sealed", "### S-3: Redact diagnostics\n\n- status: dropped")
      .replace("### S-JOIN: Integrate and reconcile the three-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the three-lane cohort\n\n- status: dropped")
      .replace(
        "# Decisions",
        `### S-JOIN2: Reconcile the remaining two-lane cohort

- status: planned
- satisfies: [C-1, C-2]
- depends_on: [S-1, S-2]
- join_for: [S-1, S-2]
- owner: none
- allowed_scope: [*]
- runtime_scope: [tmp/integration-2]
- external_gates: []

# Decisions`,
      );
    const report = checkSpec(rescope);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-JOIN2"]);
  });

  test("returns a remaining singleton to serial execution after withdrawal", async () => {
    const singleton = (await topologyFixture("n2-sealed-join-ready"))
      .replace("current_slice: S-JOIN", "current_slice: S-1")
      .replace("### S-1: Implement parser compatibility\n\n- status: sealed", "### S-1: Implement parser compatibility\n\n- status: active")
      .replace("- satisfies: [C-1]\n- depends_on: []\n- reconcile_via: S-JOIN", "- satisfies: [C-1, C-2]\n- depends_on: []\n- reconcile_via: S-JOIN")
      .replace("- reconcile_via: S-JOIN\n- owner: worker-parser", "- owner: worker-parser")
      .replace("### S-2: Harden invalid-record storage\n\n- status: sealed", "### S-2: Harden invalid-record storage\n\n- status: dropped")
      .replace("### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: planned", "### S-JOIN: Integrate and reconcile the two-lane cohort\n\n- status: dropped");
    const report = checkSpec(singleton);
    expect(report.valid).toBe(true);
    expect(report.activeFrontier).toEqual(["S-1"]);
  });
});
