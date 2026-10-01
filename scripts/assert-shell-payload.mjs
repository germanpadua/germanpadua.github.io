#!/usr/bin/env node
/**
 * Payload guard.
 *
 * The site has three layers, and only the interactive one may ship JavaScript. This
 * script reads the built `dist/` and asserts, per route:
 *
 *   1. inline JavaScript stays within the route's declared budget
 *   2. every script the page loads is declared for that route
 *   3. no route loads a third-party script
 *   4. the total JavaScript the page pulls stays within a declared ceiling
 *
 * "Loads" includes island payload that never appears as a `<script src>`: Astro
 * hydrates with an inline bootstrap and then `import()`s the component from
 * `component-url` and the renderer from `renderer-url`. An earlier version of this
 * guard only looked at `<script>` tags, so it reported zero for a page that was in
 * fact shipping four kilobytes of island machinery and would have shipped the
 * whole Preact runtime without a word.
 *
 * The budgets below are the contract. Adding an island means declaring its entry
 * chunk on the routes that host it, in the same commit. Adding a route means
 * declaring it. Growing a budget without a matching island is exactly the
 * regression this guard exists to catch.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';

/** The theme bootstrap, which is the only script the document shell itself needs. */
const SHELL_INLINE = 2030;
/** A route that hosts no island has no reason to exceed the shell plus slack. */
const SHELL_ROUTE_INLINE = 2600;

/**
 * `scripts` lists substrings that must match each loaded script URL. An empty array
 * means "this route loads no JavaScript at all".
 */
const ROUTE_BUDGETS = [
  {
    pattern: /^\/$/,
    inlineMax: 9200,
    // Three islands measured at 68,030 bytes; the ceiling sits just above so the next
    // addition fails here instead of being noticed by a reader on a slow connection.
    totalMax: 72000,
    scripts: ['_astro/SkillGraph.', '_astro/Terminal.', '_astro/F1Game.', '_astro/client.'],
    reason: 'home (es): shell plus the skill graph, terminal and racing game islands',
  },
  {
    pattern: /^\/en\/$/,
    inlineMax: 9200,
    totalMax: 72000,
    scripts: ['_astro/SkillGraph.', '_astro/Terminal.', '_astro/F1Game.', '_astro/client.'],
    reason: 'home (en): shell plus the skill graph, terminal and racing game islands',
  },
  {
    pattern: /^\/lab\/$/,
    inlineMax: SHELL_ROUTE_INLINE,
    totalMax: SHELL_ROUTE_INLINE,
    scripts: [],
    reason: 'design system harness, document only',
  },
  {
    pattern: /^\/og\/$/,
    inlineMax: 0,
    totalMax: 0,
    scripts: [],
    reason: 'capture-only social card, plain document',
  },
  {
    pattern: /.*/,
    inlineMax: SHELL_ROUTE_INLINE,
    totalMax: SHELL_ROUTE_INLINE,
    scripts: [],
    reason: 'shell-only route: no island is declared for it',
  },
];

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const ISLAND_TAG = /<astro-island\b([^>]*)>/gi;
const ATTR = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
const LOCAL_SRC = /^(\/|\.{0,2}\/)/;

/** Inline blocks that carry data rather than executable code. Not counted. */
const DATA_SCRIPT_TYPES = new Set([
  'application/ld+json',
  'application/json',
  'text/template',
  'importmap',
  'speculationrules',
]);

const THIRD_PARTY = [
  'googletagmanager.com',
  'google-analytics.com',
  'clarity.ms',
  'hotjar.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'bootstrapcdn.com',
];

function attrsOf(raw) {
  const attrs = {};
  for (const match of raw.matchAll(ATTR)) attrs[match[1].toLowerCase()] = match[2];
  return attrs;
}

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtml(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function routeOf(file) {
  const rel = `/${path.relative(DIST, file).split(path.sep).join('/')}`;
  return rel.replace(/\/index\.html$/, '/').replace(/^\/index\.html$/, '/');
}

async function sizeOf(src, htmlFile) {
  const target = src.startsWith('/') ? path.join(DIST, src) : path.resolve(path.dirname(htmlFile), src);
  try {
    const info = await stat(target);
    return info.isFile() ? { size: info.size, file: target } : { size: 0, file: null };
  } catch {
    return { size: 0, file: null };
  }
}

/**
 * A chunk's real cost includes everything it imports. The island entry point is a
 * thin module that pulls in Preact, signals and the hooks runtime, so counting only
 * the files named in the HTML understated the payload by roughly forty per cent.
 */
const SIBLING_IMPORT = /['"]\.\/([\w.-]+\.js)['"]/g;

async function closureSize(entryUrl, htmlFile, seen) {
  const { size, file } = await sizeOf(entryUrl, htmlFile);
  if (!file) return 0;
  let total = size;
  const body = await readFile(file, 'utf8');
  const dir = path.dirname(entryUrl);
  for (const match of body.matchAll(SIBLING_IMPORT)) {
    const sibling = `${dir}/${match[1]}`.replace(/\/+/g, '/');
    if (seen.has(sibling)) continue;
    seen.add(sibling);
    total += await closureSize(sibling, htmlFile, seen);
  }
  return total;
}

async function dataPayloadBytes(dir) {
  let total = 0;
  try {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) total += await dataPayloadBytes(full);
      else total += (await stat(full)).size;
    }
  } catch {
    return 0;
  }
  return total;
}

const failures = [];
const rows = [];

for (const file of await walkHtml(DIST)) {
  const route = routeOf(file);
  const html = await readFile(file, 'utf8');
  const budget = ROUTE_BUDGETS.find((entry) => entry.pattern.test(route));

  let inlineBytes = 0;
  const loaded = [];

  for (const match of html.matchAll(SCRIPT_TAG)) {
    const attrs = attrsOf(match[1]);
    if (DATA_SCRIPT_TYPES.has((attrs.type ?? '').toLowerCase())) continue;
    if (attrs.src) loaded.push(attrs.src);
    else inlineBytes += Buffer.byteLength(match[2] ?? '', 'utf8');
  }

  // Island payload: the component and the renderer are fetched by dynamic import
  // from attributes, so they never show up as a script tag.
  let islands = 0;
  for (const match of html.matchAll(ISLAND_TAG)) {
    const attrs = attrsOf(match[1]);
    islands += 1;
    for (const key of ['component-url', 'renderer-url']) {
      if (attrs[key]) loaded.push(attrs[key]);
    }
  }

  if (inlineBytes > budget.inlineMax) {
    failures.push(
      `${route}: ${inlineBytes} bytes of inline JavaScript exceeds the declared ${budget.inlineMax} (${budget.reason})`,
    );
  }

  let externalBytes = 0;
  const counted = new Set();
  for (const src of loaded) {
    if (!LOCAL_SRC.test(src)) {
      failures.push(`${route}: loads a third-party script (${src}); self-host it or drop it`);
      continue;
    }
    if (THIRD_PARTY.some((host) => src.includes(host))) {
      failures.push(`${route}: loads a bundled CDN script (${src}); vendor it instead`);
      continue;
    }
    if (!budget.scripts.some((allowed) => src.includes(allowed))) {
      failures.push(
        `${route}: loads ${src}, which is not declared for this route (${budget.reason}); declare it or remove it`,
      );
    }
    externalBytes += await closureSize(src, file, counted);
  }

  const total = inlineBytes + externalBytes;
  if (total > budget.totalMax) {
    failures.push(
      `${route}: ${total} bytes of JavaScript in total exceeds the declared ${budget.totalMax} (${budget.reason})`,
    );
  }

  rows.push({ route, islands, inlineBytes, inlineMax: budget.inlineMax, externalBytes, total, totalMax: budget.totalMax });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
const pad = (value, width) => String(value).padStart(width);

console.log('route                                   islands   inline  /max    island-js    total  /max');
for (const row of rows) {
  console.log(
    `${row.route.padEnd(38)} ${pad(row.islands, 7)} ${pad(row.inlineBytes, 8)} ${pad(row.inlineMax, 6)} ${pad(row.externalBytes, 11)} ${pad(row.total, 8)} ${pad(row.totalMax, 6)}`,
  );
}

if (failures.length > 0) {
  console.error('\nPayload guard failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

const heaviest = rows.reduce((worst, row) => (row.total > worst.total ? row : worst), rows[0] ?? { route: '-', total: 0 });
const dataBytes = await dataPayloadBytes(path.join(DIST, 'data'));
console.log(
  `\nPayload guard passed: ${rows.length} route(s), no undeclared or third-party script. Heaviest route ${heaviest.route} at ${heaviest.total} bytes. Fetched data payload ${dataBytes} bytes (islands only, in /data/).`,
);
