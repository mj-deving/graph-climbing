import { posix } from "node:path";

export type NodeKind = "claim" | "slice";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  line: number;
  fields: Record<string, string>;
}

export interface ParsedSpec {
  sections: Set<string>;
  claims: GraphNode[];
  slices: GraphNode[];
  currentSlice: string | null;
  issues: string[];
  warnings: string[];
}

export interface GraphReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  counts: {
    claims: number;
    verifiedClaims: number;
    slices: number;
    verifiedSlices: number;
  };
  claimFrontier: string[];
  frontierKind: "claim" | "vertical";
  activeFrontier: string[];
  blocked: string[];
  unknown: string[];
  currentSlice: string | null;
}

const requiredSections = [
  "Intent",
  "Desired State",
  "Boundaries",
  "Done Criteria",
];

const claimStatuses = new Set(["open", "verified", "blocked", "unknown", "dropped"]);
const sliceStatuses = new Set(["planned", "active", "verified", "blocked", "unknown", "dropped"]);
type Fence = { marker: "`" | "~"; length: number };

function openingFence(line: string): Fence | null {
  const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
  if (!match) return null;
  return { marker: match[1][0] as "`" | "~", length: match[1].length };
}

function closesFence(line: string, fence: Fence): boolean {
  return new RegExp(`^ {0,3}\\${fence.marker}{${fence.length},}[ \\t]*$`).test(line);
}

function clean(value: string): string {
  return value.trim().replace(/^`|`$/g, "");
}

export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  const normalized = clean(value);
  if (["", "[]", "none", "null"].includes(normalized.toLowerCase())) return [];
  const body = normalized.startsWith("[") && normalized.endsWith("]")
    ? normalized.slice(1, -1)
    : normalized;
  return body
    .split(",")
    .map((item) => clean(item))
    .filter(Boolean);
}

export function parseSpec(text: string): ParsedSpec {
  const sections = new Set<string>();
  const claims: GraphNode[] = [];
  const slices: GraphNode[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];
  let section = "";
  let current: GraphNode | null = null;
  let currentSlice: string | null = null;
  let currentSliceLine: number | null = null;
  let fence: Fence | null = null;

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (fence !== null) {
      if (closesFence(line, fence)) fence = null;
      continue;
    }
    const opened = openingFence(line);
    if (opened) {
      fence = opened;
      continue;
    }
    if (/^(?: {4}|\t)/.test(line)) continue;

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      const label = heading[2].trim();

      if (level <= 2) {
        if (/work graph/i.test(label) && label !== "Work Graph") {
          warnings.push(`possible_work_graph_heading at line ${index + 1}: ${label}`);
        }
        section = label;
        sections.add(label);
        current = null;
        continue;
      }

      if (level === 3 && section === "Done Criteria") {
        current = null;
        const match = label.match(/^(C-[A-Za-z0-9][A-Za-z0-9.-]*)\s*(?::|—)\s*(.+)$/);
        if (match) {
          current = {
            id: match[1],
            kind: "claim",
            title: match[2].trim(),
            line: index + 1,
            fields: {},
          };
          claims.push(current);
        } else issues.push(`unparseable_claim_heading at line ${index + 1}: ${label}`);
        continue;
      }

      if (level === 3 && section === "Work Graph") {
        current = null;
        const match = label.match(/^(S-[A-Za-z0-9][A-Za-z0-9.-]*)\s*(?::|—)\s*(.+)$/);
        if (match) {
          current = {
            id: match[1],
            kind: "slice",
            title: match[2].trim(),
            line: index + 1,
            fields: {},
          };
          slices.push(current);
        } else issues.push(`unparseable_slice_heading at line ${index + 1}: ${label}`);
        continue;
      }

      if (level === 3 && section !== "Work Graph" && /^S-[A-Za-z0-9][A-Za-z0-9.-]*\s*(?::|—)/.test(label)) {
        issues.push(`vertical_outside_work_graph at line ${index + 1}: ${label}`);
      }
    }

    if (section === "Work Graph") {
      const selected = line.match(/^current_slice:\s*(.+?)\s*$/);
      if (selected) {
        if (currentSliceLine !== null) {
          issues.push(`duplicate_current_slice at lines ${currentSliceLine} and ${index + 1}`);
        } else {
          currentSlice = clean(selected[1]);
          currentSliceLine = index + 1;
        }
      }
    } else if (/^current_slice:\s*(.+?)\s*$/.test(line)) {
      issues.push(`current_slice_outside_work_graph at line ${index + 1}`);
    }

    if (current) {
      const field = line.match(/^ {0,3}-\s+([a-z_]+):\s*(.*?)\s*$/);
      if (field) {
        if (Object.hasOwn(current.fields, field[1])) {
          issues.push(`${current.id}: duplicate_field ${field[1]} at line ${index + 1}`);
        } else current.fields[field[1]] = clean(field[2]);
      }
    }
  }

  if (fence !== null) issues.push("unclosed_code_fence");

  return { sections, claims, slices, currentSlice, issues, warnings };
}

function emptyValue(value: string | undefined): boolean {
  if (value === undefined) return true;
  return ["", "none", "null", "[]"].includes(clean(value).toLowerCase());
}

function findCycles(nodes: GraphNode[], dependencyField: string): string[][] {
  const ids = new Set(nodes.map((node) => node.id));
  const edges = new Map(
    nodes.map((node) => [
      node.id,
      parseList(node.fields[dependencyField]).filter((dependency) => ids.has(dependency)),
    ]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const cycles: string[][] = [];

  const visit = (id: string): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      cycles.push([...stack.slice(start), id]);
      return;
    }
    visiting.add(id);
    stack.push(id);
    for (const dependency of edges.get(id) ?? []) visit(dependency);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };

  for (const node of nodes) visit(node.id);
  return cycles;
}

function duplicateIds(nodes: GraphNode[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const node of nodes) {
    if (seen.has(node.id)) duplicates.add(node.id);
    seen.add(node.id);
  }
  return [...duplicates].sort();
}

type ScopePattern = { path: string; recursive: boolean };

function parseScopePattern(scope: string): ScopePattern | null {
  if (scope.includes("\\")) return null;
  if (/[?\[\]{}()!]/.test(scope)) return null;
  const global = scope === "*" || scope === "**";
  const recursive = global || scope.endsWith("/**");
  if (!global && scope.includes("*") && !recursive) return null;
  if (recursive && !global && scope.indexOf("*") !== scope.length - 2) return null;
  const prefix = global ? "." : scope.replace(/\/\*\*$/, "");
  const normalized = posix.normalize(prefix);
  if (posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../")) return null;
  return { path: normalized, recursive };
}

function scopesOverlap(left: string, right: string): boolean {
  const leftPattern = parseScopePattern(left);
  const rightPattern = parseScopePattern(right);
  if (!leftPattern || !rightPattern) return false;
  if (leftPattern.path === "." || rightPattern.path === ".") return true;
  if (leftPattern.path === rightPattern.path) return true;
  return (leftPattern.recursive && rightPattern.path.startsWith(`${leftPattern.path}/`)) ||
    (rightPattern.recursive && leftPattern.path.startsWith(`${rightPattern.path}/`));
}

export function checkParsedSpec(spec: ParsedSpec): GraphReport {
  const errors: string[] = [...spec.issues];
  const warnings: string[] = [...spec.warnings];

  for (const section of requiredSections) {
    if (!spec.sections.has(section)) errors.push(`missing_section: ${section}`);
  }

  for (const duplicate of duplicateIds(spec.claims)) errors.push(`duplicate_claim_id: ${duplicate}`);
  for (const duplicate of duplicateIds(spec.slices)) errors.push(`duplicate_slice_id: ${duplicate}`);

  const claimById = new Map(spec.claims.map((claim) => [claim.id, claim]));
  const sliceById = new Map(spec.slices.map((slice) => [slice.id, slice]));
  const hasWorkGraph = spec.sections.has("Work Graph");

  if (spec.claims.length === 0) errors.push("claims_missing: Done Criteria has no parseable C-* entries");
  if (hasWorkGraph && spec.slices.length === 0) errors.push("slices_missing: Work Graph has no parseable S-* entries");

  if (!spec.claims.some((claim) => /^Anti:/i.test(claim.title) && claim.fields.status?.toLowerCase() !== "dropped")) {
    errors.push("anti_claim_missing: add at least one critical Anti: criterion");
  }

  for (const claim of spec.claims) {
    for (const field of ["status", "depends_on", "probe", "evidence", "invalidated_by"]) {
      if (!Object.hasOwn(claim.fields, field)) {
        errors.push(`${claim.id}: required_field_missing ${field} at line ${claim.line}`);
      }
    }
    const status = claim.fields.status?.toLowerCase();
    if (!status || !claimStatuses.has(status)) {
      errors.push(`${claim.id}: invalid_or_missing_status at line ${claim.line}`);
    }
    if (status !== "dropped" && emptyValue(claim.fields.probe)) {
      errors.push(`${claim.id}: probe_missing at line ${claim.line}`);
    }
    if (status === "verified" && emptyValue(claim.fields.evidence)) {
      errors.push(`${claim.id}: verified_without_evidence at line ${claim.line}`);
    }
    for (const dependency of parseList(claim.fields.depends_on)) {
      if (!claimById.has(dependency)) errors.push(`${claim.id}: unknown_claim_dependency ${dependency}`);
      else {
        const dependencyStatus = claimById.get(dependency)?.fields.status?.toLowerCase();
        if (status !== "dropped" && dependencyStatus === "dropped") {
          errors.push(`${claim.id}: depends_on_dropped_claim ${dependency}`);
        }
        if (status === "verified" && dependencyStatus !== "verified") {
          errors.push(`${claim.id}: verified_with_unverified_dependency ${dependency}`);
        }
      }
    }
    for (const invalidator of parseList(claim.fields.invalidated_by)) {
      if (!claimById.has(invalidator)) errors.push(`${claim.id}: unknown_invalidator ${invalidator}`);
      else if (status === "verified" && claimById.get(invalidator)?.fields.status?.toLowerCase() === "verified") {
        errors.push(`${claim.id}: verified_but_invalidated_by ${invalidator}`);
      }
    }
    if (/\b(and|including|plus|as well as)\b/i.test(claim.title)) {
      warnings.push(`${claim.id}: possible_atomicity_violation "${claim.title}"`);
    }
    if (/\b(assert|expect|confirm|verify)\b.*\band\b/i.test(claim.fields.probe ?? "")) {
      warnings.push(`${claim.id}: possible_compound_probe "${claim.fields.probe}"`);
    }
  }

  for (const cycle of findCycles(spec.claims, "depends_on")) {
    errors.push(`claim_cycle: ${cycle.join(" -> ")}`);
  }

  for (const slice of spec.slices) {
    for (const field of ["status", "satisfies", "depends_on", "owner", "allowed_scope", "external_gates"]) {
      if (!Object.hasOwn(slice.fields, field)) {
        errors.push(`${slice.id}: required_field_missing ${field} at line ${slice.line}`);
      }
    }
    const status = slice.fields.status?.toLowerCase();
    if (!status || !sliceStatuses.has(status)) {
      errors.push(`${slice.id}: invalid_or_missing_status at line ${slice.line}`);
    }

    const satisfies = parseList(slice.fields.satisfies);
    if (satisfies.length === 0) errors.push(`${slice.id}: satisfies_missing at line ${slice.line}`);
    for (const claimId of satisfies) {
      if (!claimById.has(claimId)) errors.push(`${slice.id}: unknown_satisfied_claim ${claimId}`);
    }
    for (const dependency of parseList(slice.fields.depends_on)) {
      if (!sliceById.has(dependency)) errors.push(`${slice.id}: unknown_slice_dependency ${dependency}`);
      else if (status !== "dropped" && sliceById.get(dependency)?.fields.status?.toLowerCase() === "dropped") {
        errors.push(`${slice.id}: depends_on_dropped_slice ${dependency}`);
      }
    }

    if (status === "verified") {
      if (parseList(slice.fields.external_gates).length > 0) {
        errors.push(`${slice.id}: verified_with_external_gate`);
      }
      for (const dependency of parseList(slice.fields.depends_on)) {
        const predecessor = sliceById.get(dependency);
        if (predecessor && predecessor.fields.status?.toLowerCase() !== "verified") {
          errors.push(`${slice.id}: verified_with_unverified_predecessor ${dependency}`);
        }
      }
      for (const claimId of satisfies) {
        const claim = claimById.get(claimId);
        if (claim && claim.fields.status?.toLowerCase() !== "verified" && claim.fields.status?.toLowerCase() !== "dropped") {
          errors.push(`${slice.id}: verified_with_unverified_claim ${claimId}`);
        }
      }
    }
  }

  for (const cycle of findCycles(spec.slices, "depends_on")) {
    errors.push(`slice_cycle: ${cycle.join(" -> ")}`);
  }

  const ownedClaims = new Set(
    spec.slices
      .filter((slice) => slice.fields.status?.toLowerCase() !== "dropped")
      .flatMap((slice) => parseList(slice.fields.satisfies)),
  );
  if (hasWorkGraph) {
    for (const claim of spec.claims) {
      const status = claim.fields.status?.toLowerCase();
      if (!["verified", "dropped"].includes(status ?? "") && !ownedClaims.has(claim.id)) {
        errors.push(`${claim.id}: incomplete_claim_without_slice`);
      }
    }
  }

  const claimDependenciesVerified = (claim: GraphNode): boolean =>
    parseList(claim.fields.depends_on).every(
      (dependency) => claimById.get(dependency)?.fields.status?.toLowerCase() === "verified",
    );
  const claimFrontier = spec.claims
    .filter((claim) => claim.fields.status?.toLowerCase() === "open" && claimDependenciesVerified(claim))
    .map((claim) => claim.id)
    .sort();

  const predecessorVerified = (slice: GraphNode): boolean =>
    parseList(slice.fields.depends_on).every(
      (dependency) => sliceById.get(dependency)?.fields.status?.toLowerCase() === "verified",
    );
  const noExternalGates = (slice: GraphNode): boolean => parseList(slice.fields.external_gates).length === 0;
  const claimsInternallyClosed = (slice: GraphNode): boolean => {
    const owned = new Set(parseList(slice.fields.satisfies));
    return [...owned].every((claimId) => {
      const claim = claimById.get(claimId);
      const status = claim?.fields.status?.toLowerCase();
      if (!claim || !["open", "verified", "dropped"].includes(status ?? "")) return false;
      if (status === "dropped") return true;
      return parseList(claim.fields.depends_on).every((dependencyId) => {
        const dependency = claimById.get(dependencyId);
        const dependencyStatus = dependency?.fields.status?.toLowerCase();
        return dependencyStatus === "verified" ||
          (owned.has(dependencyId) && ["open", "verified"].includes(dependencyStatus ?? ""));
      });
    });
  };
  const hasReachableEntry = (slice: GraphNode): boolean => {
    const owned = new Set(parseList(slice.fields.satisfies));
    return [...owned].some((claimId) => {
      const claim = claimById.get(claimId);
      return claim?.fields.status?.toLowerCase() === "open" && claimDependenciesVerified(claim);
    });
  };
  const claimsReachable = (slice: GraphNode): boolean => {
    return claimsInternallyClosed(slice) && hasReachableEntry(slice);
  };
  const hasOpenClaim = (slice: GraphNode): boolean => parseList(slice.fields.satisfies).some(
    (claimId) => claimById.get(claimId)?.fields.status?.toLowerCase() === "open",
  );
  for (const slice of spec.slices.filter((item) => item.fields.status?.toLowerCase() === "planned")) {
    if (!hasOpenClaim(slice)) errors.push(`${slice.id}: planned_without_open_claim`);
  }
  const ready = spec.slices.filter(
    (slice) => slice.fields.status?.toLowerCase() === "planned" && predecessorVerified(slice) && noExternalGates(slice) && claimsReachable(slice) && hasOpenClaim(slice),
  );
  const active = spec.slices.filter((slice) => slice.fields.status?.toLowerCase() === "active");
  const reachableActive = active.filter(
    (slice) => predecessorVerified(slice) && noExternalGates(slice) && claimsReachable(slice) && hasOpenClaim(slice),
  );
  const activeFrontier = [...new Set([...reachableActive, ...ready].map((slice) => slice.id))].sort();

  for (const slice of active) {
    if (emptyValue(slice.fields.owner) || slice.fields.owner?.toLowerCase() === "none") {
      errors.push(`${slice.id}: active_without_owner`);
    }
    if (!predecessorVerified(slice)) {
      errors.push(`${slice.id}: active_with_unverified_predecessor`);
    }
    if (!noExternalGates(slice)) errors.push(`${slice.id}: active_with_external_gate`);
    if (!claimsReachable(slice) || !hasOpenClaim(slice)) errors.push(`${slice.id}: active_with_unreachable_claim`);
  }

  for (const slice of spec.slices.filter((item) => item.fields.status?.toLowerCase() === "blocked")) {
    if (predecessorVerified(slice) && noExternalGates(slice)) {
      warnings.push(`${slice.id}: blocked_without_visible_blocker`);
    }
  }

  for (let leftIndex = 0; leftIndex < active.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < active.length; rightIndex += 1) {
      const left = active[leftIndex];
      const right = active[rightIndex];
      const leftOwner = left.fields.owner ?? "";
      const rightOwner = right.fields.owner ?? "";
      if (emptyValue(leftOwner) || emptyValue(rightOwner) || leftOwner === rightOwner) continue;

      const leftFiles = parseList(left.fields.allowed_scope);
      const rightFiles = parseList(right.fields.allowed_scope);
      const leftRuntime = parseList(left.fields.runtime_scope);
      const rightRuntime = parseList(right.fields.runtime_scope);
      if (leftFiles.length === 0 || rightFiles.length === 0) {
        errors.push(`parallel_file_scope_missing: ${left.id} (${leftOwner}) and ${right.id} (${rightOwner})`);
      }
      if (leftRuntime.length === 0 || rightRuntime.length === 0) {
        errors.push(`parallel_runtime_scope_missing: ${left.id} (${leftOwner}) and ${right.id} (${rightOwner})`);
      }
      for (const scope of [...leftFiles, ...rightFiles, ...leftRuntime, ...rightRuntime]) {
        if (!parseScopePattern(scope)) {
          errors.push(`unsupported_parallel_scope_pattern: ${scope}; use an exact scope or a terminal /**`);
        }
      }
      for (const leftScope of leftFiles) {
        for (const rightScope of rightFiles) {
          if (scopesOverlap(leftScope, rightScope)) {
            errors.push(`parallel_file_scope_collision: ${left.id} (${leftOwner}) and ${right.id} (${rightOwner}) overlap ${leftScope} <> ${rightScope}`);
          }
        }
      }
      for (const leftScope of leftRuntime) {
        for (const rightScope of rightRuntime) {
          if (scopesOverlap(leftScope, rightScope)) {
            errors.push(`parallel_runtime_scope_collision: ${left.id} (${leftOwner}) and ${right.id} (${rightOwner}) overlap ${leftScope} <> ${rightScope}`);
          }
        }
      }
    }
  }

  if (hasWorkGraph && spec.currentSlice && !["none", "null"].includes(spec.currentSlice.toLowerCase())) {
    const selected = sliceById.get(spec.currentSlice);
    if (!selected) errors.push(`current_slice_unknown: ${spec.currentSlice}`);
    else if (!activeFrontier.includes(spec.currentSlice)) {
      errors.push(`current_slice_unreachable: ${spec.currentSlice}`);
    }
  } else if (hasWorkGraph && activeFrontier.length > 0) {
    warnings.push("current_slice_missing: select one active or ready slice before building");
  }

  const blockedVerticals = spec.slices
    .filter((slice) => {
      const status = slice.fields.status?.toLowerCase();
      return status === "blocked" ||
        (status === "planned" && (!predecessorVerified(slice) || !noExternalGates(slice) || !claimsInternallyClosed(slice)));
    })
    .map((slice) => slice.id)
    .sort();
  const unknownVerticals = spec.slices
    .filter((slice) => slice.fields.status?.toLowerCase() === "unknown")
    .map((slice) => slice.id)
    .sort();

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    counts: {
      claims: spec.claims.length,
      verifiedClaims: spec.claims.filter((claim) => claim.fields.status?.toLowerCase() === "verified").length,
      slices: spec.slices.length,
      verifiedSlices: spec.slices.filter((slice) => slice.fields.status?.toLowerCase() === "verified").length,
    },
    claimFrontier,
    frontierKind: hasWorkGraph ? "vertical" : "claim",
    activeFrontier: hasWorkGraph ? activeFrontier : claimFrontier,
    blocked: hasWorkGraph
      ? blockedVerticals
      : spec.claims
        .filter((claim) => claim.fields.status?.toLowerCase() === "blocked" ||
          (claim.fields.status?.toLowerCase() === "open" && !claimDependenciesVerified(claim)))
        .map((claim) => claim.id)
        .sort(),
    unknown: hasWorkGraph
      ? unknownVerticals
      : spec.claims
        .filter((claim) => claim.fields.status?.toLowerCase() === "unknown")
        .map((claim) => claim.id)
        .sort(),
    currentSlice: hasWorkGraph ? spec.currentSlice : null,
  };
}

export function checkSpec(text: string): GraphReport {
  const report = checkParsedSpec(parseSpec(text));
  const leakedMarkers: Array<{ line: number; value: string }> = [];
  let fence: Fence | null = null;
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (fence !== null) {
      if (closesFence(line, fence)) fence = null;
      continue;
    }
    const opened = openingFence(line);
    if (opened) {
      fence = opened;
      continue;
    }
    if (/^(?: {4}|\t)/.test(line)) continue;
    const value = line.trim();
    if (/^<\/?(?:content|artifact)>$/i.test(value)) leakedMarkers.push({ line: index + 1, value });
  }
  for (const marker of leakedMarkers) {
    report.errors.push(`unexpected_generation_marker at line ${marker.line}: ${marker.value}`);
  }
  report.valid = report.errors.length === 0;
  return report;
}

function printText(report: GraphReport, path: string): void {
  console.log(`spec: ${path}`);
  console.log(`graph: ${report.valid ? "valid" : "invalid"}`);
  console.log(`claims: ${report.counts.verifiedClaims}/${report.counts.claims} verified`);
  console.log(`slices: ${report.counts.verifiedSlices}/${report.counts.slices} verified`);
  console.log(`claim_frontier: [${report.claimFrontier.join(", ")}]`);
  console.log(`frontier_kind: ${report.frontierKind}`);
  console.log(`active_frontier: [${report.activeFrontier.join(", ")}]`);
  console.log(`blocked: [${report.blocked.join(", ")}]`);
  console.log(`unknown: [${report.unknown.join(", ")}]`);
  console.log(`current_slice: ${report.currentSlice ?? "none"}`);
  if (report.errors.length > 0) {
    console.log("errors:");
    for (const error of report.errors) console.log(`- ${error}`);
  }
  if (report.warnings.length > 0) {
    console.log("warnings:");
    for (const warning of report.warnings) console.log(`- ${warning}`);
  }
}

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const json = args.includes("--json");
  const path = args.find((arg) => !arg.startsWith("--")) ?? "SPEC.md";
  const file = Bun.file(path);
  if (!(await file.exists())) {
    console.error(`graph-check: file not found: ${path}`);
    process.exit(2);
  }
  const report = checkSpec(await file.text());
  if (json) console.log(JSON.stringify({ spec: path, ...report }, null, 2));
  else printText(report, path);
  process.exit(report.valid ? 0 : 1);
}
