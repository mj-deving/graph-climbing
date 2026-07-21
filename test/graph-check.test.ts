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

  test("allows parallel verticals only with disjoint file and runtime scopes", () => {
    const parallel = base
      .replace("status: verified\n- depends_on: []", "status: open\n- depends_on: []")
      .replace("evidence: commit:abc123", "evidence: none")
      .replace("depends_on: [C-1]\n- probe: bun test test/invalid.test.ts", "depends_on: []\n- probe: bun test test/invalid.test.ts")
      .replace("status: verified\n- satisfies: [C-1]", "status: active\n- satisfies: [C-1]")
      .replace(
        "owner: none\n- allowed_scope: [src/store.ts]\n- external_gates: []",
        "owner: worker-1\n- allowed_scope: [src/store/**]\n- runtime_scope: [tmp/store-1]\n- external_gates: []",
      )
      .replace("status: planned\n- satisfies: [C-2]", "status: active\n- satisfies: [C-2]")
      .replace("depends_on: [S-1]", "depends_on: []")
      .replace(
        "owner: none\n- allowed_scope: [src/cli.ts]\n- external_gates: []",
        "owner: worker-2\n- allowed_scope: [src/cli/**]\n- runtime_scope: [tmp/cli-2]\n- external_gates: []",
      );
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
});
