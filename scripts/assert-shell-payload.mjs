#!/usr/bin/env node
/**
 * Payload guard.
 *
 * The portfolio has three layers, and only the interactive ones may ship
 * JavaScript. This script reads the built `dist/`, and for every HTML route
 * asserts three things:
 *
 *   1. inline JavaScript stays within the route's declared budget
 *   2. every script the page loads is declared for that route
 *   3. no route loads a third-party script (fonts and everything else are
 *      self-hosted, so an off-site script is always a mistake)
 *
 * The budgets below are the contract. Adding an island means declaring its entry
 * script on the routes that host it, in the same commit. Adding a route means
 * declaring it. Growing a budget without a matching island is exactly the
 * regression this guard exists to catch.
 *
 * Note on the inline budget: it is not zero, and it cannot be. A theme system
 * that must not flash the wrong palette has to set its attribute before first
 * paint, which means a synchronous inline script. Everything else stays at zero.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';

/** Shell allowance: theme bootstrap only, with room to grow a little. */
const SHELL_INLINE = 2560;

/**
 * `scripts` lists the entry scripts a route may load, matched against the
 * `src` attribute. An empty array means "this route loads no JavaScript at all".
 */
const ROUTE_BUDGETS = [
  {
    pattern: /^\/$/,
    inline: SHELL_INLINE,
    scripts: [],
    reason: 'home (es): document shell plus theme bootstrap, no islands yet',
  },
  {
    pattern: /^\/en\/$/,
    inline: SHELL_INLINE,
    scripts: [],
    reason: 'home (en): document shell plus theme bootstrap, no islands yet',
  },
  {
    pattern: /^\/lab\/$/,
    inline: SHELL_INLINE,
    scripts: [],
    reason: 'design system harness, document only',
  },
  {
    pattern: /^\/og\/$/,
    inline: 0,
    scripts: [],
    reason: 'capture-only social card, plain document',
  },
  {
    pattern: /.*/,
    inline: SHELL_INLINE,
    scripts: [],
    reason: 'unclassified route inherits the shell allowance but no island scripts',
  },
];

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
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

const THIRD_PARTY_JS = [
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

async function sizeOfReferenced(src, htmlFile) {
  const target = src.startsWith('/')
    ? path.join(DIST, src)
    : path.resolve(path.dirname(htmlFile), src);
  try {
    const info = await stat(target);
    return info.isFile() ? info.size : 0;
  } catch {
    return 0;
  }
}

const failures = [];
const rows = [];

for (const file of await walkHtml(DIST)) {
  const route = routeOf(file);
  const html = await readFile(file, 'utf8');
  const budget = ROUTE_BUDGETS.find((entry) => entry.pattern.test(route));

  let inlineBytes = 0;
  let inlineCount = 0;
  const external = [];

  for (const match of html.matchAll(SCRIPT_TAG)) {
    const attrs = attrsOf(match[1]);
    if (DATA_SCRIPT_TYPES.has((attrs.type ?? '').toLowerCase())) continue;

    if (attrs.src) {
      external.push(attrs.src);
      continue;
    }

    inlineBytes += Buffer.byteLength(match[2] ?? '', 'utf8');
    inlineCount += 1;
  }

  if (inlineBytes > budget.inline) {
    failures.push(
      `${route}: ${inlineBytes} bytes of inline JavaScript exceeds the declared ${budget.inline} byte budget (${budget.reason})`,
    );
  }

  for (const src of external) {
    if (!LOCAL_SRC.test(src)) {
      failures.push(`${route}: loads a third-party script (${src}); self-host it or drop it`);
      continue;
    }
    if (THIRD_PARTY_JS.some((host) => src.includes(host))) {
      failures.push(`${route}: loads a bundled CDN script (${src}); vendor it instead`);
      continue;
    }
    if (!budget.scripts.some((allowed) => src.includes(allowed))) {
      failures.push(
        `${route}: loads ${src}, which is not declared for this route (${budget.reason}); declare it or remove it`,
      );
    }
  }

  let externalBytes = 0;
  for (const src of external) externalBytes += await sizeOfReferenced(src, file);

  rows.push({
    route,
    inlineCount,
    inlineBytes,
    inlineBudget: budget.inline,
    externalCount: external.length,
    externalBytes,
    totalBytes: inlineBytes + externalBytes,
  });
}

rows.sort((a, b) => a.route.localeCompare(b.route));
const pad = (value, width) => String(value).padStart(width);

console.log('route                                  inline  /budget  scripts  js total');
for (const row of rows) {
  console.log(
    `${row.route.padEnd(36)} ${pad(row.inlineBytes, 6)}  ${pad(row.inlineBudget, 7)}  ${pad(row.externalCount, 7)}  ${pad(row.totalBytes, 8)}`,
  );
}

if (failures.length > 0) {
  console.error('\nPayload guard failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `\nPayload guard passed: ${rows.length} route(s), no undeclared script, no third-party JavaScript.`,
);
