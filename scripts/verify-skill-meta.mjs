#!/usr/bin/env node
/**
 * Derivation tests for the skill map: level buckets, freshness windows and the
 * joins that feed them. The numbers below are the contract from the feature
 * document — if the real counts drift, the fix is a re-review of the content
 * (bump `asOf` and re-derive), never loosening these expectations: a mismatch
 * means the rules or the data reading are wrong, and this script must say so.
 *
 * Everything is computed from the repository's own data — graph.json plus the
 * real frontmatter of the projects and education collections. No invented
 * numbers anywhere.
 *
 * Run with type stripping so the TypeScript module loads directly:
 *   pnpm test:skills
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSkillMeta,
  freshnessOf,
  levelOf,
  FRESHNESS_RULES,
  LEVEL_THRESHOLDS,
} from '../src/lib/skillGraph/meta.ts';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, '..', 'src', 'content');

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) console.log(`ok   ${label}`);
  else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

/* --------------------------------------------------- frontmatter (no deps) */

const frontmatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
};

const field = (fm, key) => {
  const match = fm.match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'm'));
  return match ? match[1].trim() : undefined;
};

// Project `slug` and `year` are locale-independent, so only the Spanish files
// are read: the English twins carry the same values and would double count.
const projects = readdirSync(join(contentDir, 'projects'))
  .filter((name) => name.endsWith('.es.md'))
  .map((name) => {
    const fm = frontmatter(readFileSync(join(contentDir, 'projects', name), 'utf8'));
    return { slug: field(fm, 'slug'), year: Number(field(fm, 'year')) };
  });

// Education dates are also locale-independent; keyed by kind, and only the
// `degree` / `master` kinds participate in the join.
const education = readdirSync(join(contentDir, 'education'))
  .filter((name) => name.endsWith('.md'))
  .map((name) => {
    const fm = frontmatter(readFileSync(join(contentDir, 'education', name), 'utf8'));
    return { kind: field(fm, 'kind'), start: field(fm, 'start'), end: field(fm, 'end') };
  });

/* ------------------------------------------------------------- real counts */

const graphFile = JSON.parse(readFileSync(join(contentDir, 'skills', 'graph.json'), 'utf8'));
const [graph] = graphFile;
const asOfYear = Number(graph.asOf.slice(0, 4));

const { nodes, meta } = buildSkillMeta({ graph, projects, education, asOf: graph.asOf });

check(
  LEVEL_THRESHOLDS.strong === 0.85 && LEVEL_THRESHOLDS.working === 0.7,
  'rules: level thresholds are the named constants',
  JSON.stringify(LEVEL_THRESHOLDS),
);
check(
  FRESHNESS_RULES.currentWithinYears === 1 && FRESHNESS_RULES.warmingWithinYears === 3,
  'rules: freshness windows are the named constants',
  JSON.stringify(FRESHNESS_RULES),
);

check(
  graph.nodes.length === 93,
  'graph: 93 nodes',
  `found ${graph.nodes.length}`,
);
check(
  nodes && Object.keys(nodes).length === 93,
  'meta: one entry per node',
  `found ${nodes ? Object.keys(nodes).length : 'undefined'}`,
);

const expectedLevel = { strong: 26, working: 23, basic: 44 };
for (const level of ['strong', 'working', 'basic']) {
  check(
    meta.counts.level[level] === expectedLevel[level],
    `counts: level ${level} = ${expectedLevel[level]}`,
    `found ${meta.counts.level[level]}`,
  );
}

const expectedFreshness = { current: 47, warming: 34, stale: 0, unknown: 12 };
for (const freshness of ['current', 'warming', 'stale', 'unknown']) {
  check(
    meta.counts.freshness[freshness] === expectedFreshness[freshness],
    `counts: freshness ${freshness} = ${expectedFreshness[freshness]}`,
    `found ${meta.counts.freshness[freshness]}`,
  );
}

check(meta.asOf === graph.asOf, 'meta: asOf round-trips from graph.json', meta.asOf);

/* -------------------------------------------------------- rule boundaries */

const levelCases = [
  [1, 'strong'],
  [0.85, 'strong'],
  [0.8499, 'working'],
  [0.7, 'working'],
  [0.6999, 'basic'],
  [0, 'basic'],
];
for (const [weight, expected] of levelCases) {
  check(levelOf(weight) === expected, `levelOf(${weight}) -> ${expected}`, levelOf(weight));
}

// asOf 2026-10 -> asOfYear 2026: current reaches one year back, warming three.
const freshnessCases = [
  [2026, 'current'],
  [2025, 'current'],
  [2024, 'warming'],
  [2023, 'warming'],
  [2022, 'stale'],
  [1999, 'stale'],
  [null, 'unknown'],
];
for (const [year, expected] of freshnessCases) {
  check(
    freshnessOf(year, asOfYear) === expected,
    `freshnessOf(${year}, ${asOfYear}) -> ${expected}`,
    freshnessOf(year, asOfYear),
  );
}

/* --------------------------------------------------------------- the joins */

const degreeNode = { id: 'join-degree', weight: 0.5, projects: [], courses: [{ title: 'x', program: 'degree' }] };
const degreeMeta = buildSkillMeta({ graph: { nodes: [degreeNode] }, projects, education, asOf: graph.asOf });
check(
  degreeMeta.nodes['join-degree'].lastActivityYear === 2024,
  'join: a degree-only course ends in 2024',
  String(degreeMeta.nodes['join-degree'].lastActivityYear),
);

const masterNode = { id: 'join-master', weight: 0.5, projects: [], courses: [{ title: 'x', program: 'master' }] };
const masterMeta = buildSkillMeta({ graph: { nodes: [masterNode] }, projects, education, asOf: graph.asOf });
check(
  masterMeta.nodes['join-master'].lastActivityYear === 2025,
  'join: a master-only course ends in 2025',
  String(masterMeta.nodes['join-master'].lastActivityYear),
);

const orphanNode = { id: 'join-orphan', weight: 0.5, projects: [], courses: [] };
const orphanMeta = buildSkillMeta({ graph: { nodes: [orphanNode] }, projects, education, asOf: graph.asOf });
check(
  orphanMeta.nodes['join-orphan'].lastActivityYear === null,
  'join: no signal -> lastActivityYear is null',
  String(orphanMeta.nodes['join-orphan'].lastActivityYear),
);
check(
  orphanMeta.nodes['join-orphan'].freshness === 'unknown',
  'join: no signal -> freshness is unknown, never a guess',
  orphanMeta.nodes['join-orphan'].freshness,
);

// Projects win when they are newer than the coursework behind the node.
const mixedNode = { id: 'join-mixed', weight: 0.5, projects: ['telemetry-sentinel'], courses: [{ title: 'x', program: 'degree' }] };
const mixedMeta = buildSkillMeta({ graph: { nodes: [mixedNode] }, projects, education, asOf: graph.asOf });
check(
  mixedMeta.nodes['join-mixed'].lastActivityYear === 2026,
  'join: max(project year, course year)',
  String(mixedMeta.nodes['join-mixed'].lastActivityYear),
);

/* -------------------------------------------------------------- determinism */

const first = buildSkillMeta({ graph, projects, education, asOf: graph.asOf });
const second = buildSkillMeta({ graph, projects, education, asOf: graph.asOf });
check(
  JSON.stringify(first) === JSON.stringify(second),
  'determinism: two runs on the same input are identical',
);

/* ------------------------------------------------------------------- report */

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('\nAll skill-meta derivation checks passed.');
