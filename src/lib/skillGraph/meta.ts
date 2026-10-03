/**
 * Skill-graph derivation rules: level (a documented bucketing of the authored
 * `weight`) and freshness (the most recent year a skill can be tied to, taken
 * from data the repository already contains).
 *
 * Provenance rule: nothing here invents a number. Level buckets the `weight`
 * field the graph already carries; freshness joins two existing signals —
 * `projects[].year` and the `end` of the education entry behind
 * `courses[].program` — and takes the maximum. When a node has neither signal
 * the answer is the explicit `unknown` state, not a guess: twelve skills
 * (nativo Spanish, C2 English, corporate tooling…) have no dated artifact
 * behind them, and reporting that honestly is the difference between a map
 * that can be audited and one that only looks precise.
 *
 * Pure by construction: no DOM, no `astro:content`, no clock, no I/O. Both the
 * Astro endpoint and `scripts/verify-skill-meta.mjs` (plain Node under
 * `--experimental-strip-types`) import this module, so the rules the site
 * publishes are exactly the rules the verifier pins.
 */

/** Documented bucketing of `weight` (0–1). Thresholds are named constants so the legend and the verifier quote the same numbers. */
export type Level = 'strong' | 'working' | 'basic';

/** Freshness states. `unknown` is a stated absence of evidence, never inferred. */
export type Freshness = 'current' | 'warming' | 'stale' | 'unknown';

export const LEVEL_THRESHOLDS = { strong: 0.85, working: 0.7 } as const;

/**
 * Freshness windows, in years back from the authored `asOf`. With `asOf`
 * 2026-10: current = 2025-2026, warming = 2023-2024, stale = 2022 or older.
 */
export const FRESHNESS_RULES = { currentWithinYears: 1, warmingWithinYears: 3 } as const;

export const levelOf = (weight: number): Level => {
  if (weight >= LEVEL_THRESHOLDS.strong) return 'strong';
  if (weight >= LEVEL_THRESHOLDS.working) return 'working';
  return 'basic';
};

/** `end` is `YYYY-MM` (or the literal `present`, which counts as the as-of year). */
export const endYearOf = (end: string, asOfYear: number): number =>
  end === 'present' ? asOfYear : Number(end.slice(0, 4));

export interface GraphNodeInput {
  id: string;
  weight: number;
  /** Optional in the authored JSON: absent means empty. */
  projects?: readonly string[];
  courses?: readonly { program: string }[];
}

export interface ProjectYear {
  slug: string;
  year: number;
}

export interface EducationPeriod {
  kind: string;
  start: string;
  end: string;
}

export interface MetaContext {
  /** `projects[].slug` -> `year`. Locale-independent frontmatter. */
  projectYears: Map<string, number>;
  /** `education.kind` -> entry. Only `degree` and `master` are joinable. */
  educationByKind: Map<string, EducationPeriod>;
  /** Year of the authored `asOf`; also what `end: 'present'` resolves to. */
  asOfYear: number;
}

/**
 * Latest year the node can be tied to. Project years come straight from
 * frontmatter; course years come from joining `course.program` to the education
 * entry of that kind. A dangling reference (a project slug or a program kind
 * with no collection entry) contributes nothing rather than throwing: the
 * schema does not cross-validate the join, and the verifier pins the real data
 * so a broken join fails there instead of silently at render time.
 */
export const lastActivityYear = (
  node: Pick<GraphNodeInput, 'projects' | 'courses'>,
  ctx: MetaContext,
): number | null => {
  const candidates: number[] = [];
  for (const projectSlug of node.projects ?? []) {
    const year = ctx.projectYears.get(projectSlug);
    if (year !== undefined) candidates.push(year);
  }
  for (const course of node.courses ?? []) {
    const entry = ctx.educationByKind.get(course.program);
    if (entry) candidates.push(endYearOf(entry.end, ctx.asOfYear));
  }
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
};

export const freshnessOf = (lastActivityYear: number | null, asOfYear: number): Freshness => {
  if (lastActivityYear === null) return 'unknown';
  if (lastActivityYear >= asOfYear - FRESHNESS_RULES.currentWithinYears) return 'current';
  if (lastActivityYear >= asOfYear - FRESHNESS_RULES.warmingWithinYears) return 'warming';
  return 'stale';
};

export interface SkillMetaEntry {
  level: Level;
  freshness: Freshness;
  lastActivityYear: number | null;
}

export interface SkillMeta {
  nodes: Record<string, SkillMetaEntry>;
  meta: {
    asOf: string;
    levelThresholds: typeof LEVEL_THRESHOLDS;
    freshnessRules: typeof FRESHNESS_RULES;
    counts: { level: Record<Level, number>; freshness: Record<Freshness, number> };
  };
}

/** `asOf` is `YYYY-MM`; only the year participates in the freshness windows. */
export const asOfYearOf = (asOf: string): number => Number(asOf.slice(0, 4));

/**
 * Per-node level/freshness plus a `meta` block that prints the rules and their
 * live counts next to the data, so a reader can audit the derivation without
 * reading this file. Deterministic: same input, same output, byte for byte.
 */
export const buildSkillMeta = ({
  graph,
  projects,
  education,
  asOf,
}: {
  graph: { nodes: readonly GraphNodeInput[] };
  projects: readonly ProjectYear[];
  education: readonly EducationPeriod[];
  asOf: string;
}): SkillMeta => {
  const ctx: MetaContext = {
    projectYears: new Map(projects.map(({ slug, year }) => [slug, year])),
    educationByKind: new Map(education.map((entry) => [entry.kind, entry])),
    asOfYear: asOfYearOf(asOf),
  };

  const nodes: Record<string, SkillMetaEntry> = {};
  const levelCounts: Record<Level, number> = { strong: 0, working: 0, basic: 0 };
  const freshnessCounts: Record<Freshness, number> = { current: 0, warming: 0, stale: 0, unknown: 0 };

  for (const node of graph.nodes) {
    const level = levelOf(node.weight);
    const activity = lastActivityYear(node, ctx);
    const freshness = freshnessOf(activity, ctx.asOfYear);
    nodes[node.id] = { level, freshness, lastActivityYear: activity };
    levelCounts[level] += 1;
    freshnessCounts[freshness] += 1;
  }

  return {
    nodes,
    meta: {
      asOf,
      levelThresholds: LEVEL_THRESHOLDS,
      freshnessRules: FRESHNESS_RULES,
      counts: { level: levelCounts, freshness: freshnessCounts },
    },
  };
};
