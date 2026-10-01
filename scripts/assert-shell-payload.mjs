#!/usr/bin/env node
/**
 * Payload guard: the portfolio shell must stay readable and fast for a recruiter
 * who only scrolls. Every interactive feature (terminal, skill graph, F1 game) is
 * an Astro island, so its JavaScript must appear on the routes that host it and
 * nowhere else.
 *
 * This script reads the built `dist/` and asserts, per HTML route:
 *   - inline JavaScript stays under INLINE_JS_BUDGET bytes
 *   - every external module script is declared in ROUTE_BUDGETS
 *   - the total JavaScript a page pulls (inline + referenced local files) stays
 *     under the route's budget
 *
 * Update ROUTE_BUDGETS in the same commit that adds an island. Growing a budget
 * without a matching island is exactly the regression this guard exists for.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';

/** Inline scripts (theme bootstrap, JSON-LD bootstrap) may never exceed this. */
const INLINE_JS_BUDGET = 2048;

/**
 * Per-route allowance for JavaScript the page loads over the network.
 * `null` means "no external module scripts allowed at all".
 * Keys are route patterns; the first match wins, `*` is the fallback.
 */
const ROUTE_BUDGETS = [
  { pattern: /^\/$/, external: null, reason: 'document shell only' },
  { pattern: /^\/en\/$/, external: null, reason: 'document shell only' },
  { pattern: /.*/, external: null, reason: 'not yet classified' },
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
  let target;
  if (src.startsWith('/')) target = path.join(DIST, src);
  else target = path.resolve(path.dirname(htmlFile), src);
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
  const externalLocal = [];

  for (const match of html.matchAll(SCRIPT_TAG)) {
    const attrs = attrsOf(match[1]);
    const body = match[2] ?? '';
    const type = (attrs.type ?? '').toLowerCase();
    if (DATA_SCRIPT_TYPES.has(type)) continue;
    if (attrs.src) {
      if (!LOCAL_SRC.test(attrs.src)) {
        failures.push(`${route}: loads a third-party script (${attrs.src}); self-host it or drop it`);
        continue;
      }
      externalLocal.push(attrs.src);
      continue;
    }
    inlineBytes += Buffer.byteLength(body, 'utf8');
    inlineCount += 1;
  }

  if (inlineBytes > INLINE_JS_BUDGET) {
    failures.push(
      `${route}: ${inlineBytes} bytes of inline JavaScript exceeds the ${INLINE_JS_BUDGET} byte budget`,
    );
  }

  if (budget.external === null && externalLocal.length > 0) {
    failures.push(
      `${route}: loads ${externalLocal.length} script(s) [${externalLocal.join(', ')}] but its budget expects none (${budget.reason})`,
    );
  }

  let externalBytes = 0;
  for (const src of externalLocal) externalBytes += await sizeOfReferenced(src, file);

  rows.push({
    route,
    inlineCount,
    inlineBytes,
    externalCount: externalLocal.length,
    externalBytes,
    totalBytes: inlineBytes + externalBytes,
  });
}

rows.sort((a, b) => b.totalBytes - a.totalBytes);
const pad = (value, width) => String(value).padStart(width);

console.log('route                            inline  ext  total');
for (const row of rows) {
  console.log(
    `${row.route.padEnd(32)} ${pad(row.inlineBytes, 6)} ${pad(row.externalCount, 4)} ${pad(row.totalBytes, 6)}`,
  );
}

if (failures.length > 0) {
  console.error('\nPayload guard failed:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `\nPayload guard passed: ${rows.length} route(s), inline JavaScript under ${INLINE_JS_BUDGET} bytes, no undeclared island payload.`,
);
