#!/usr/bin/env node
/**
 * Visual capture for local verification.
 *
 * Boots `astro preview` against the built `dist/`, walks a route list at several
 * viewports, and writes PNGs plus one Web Vitals report to `.screenshots/`.
 *
 * Usage:
 *   node scripts/screenshot.mjs                      # default routes, 3 viewports
 *   node scripts/screenshot.mjs --routes /,/en/      # explicit routes
 *   node scripts/screenshot.mjs --url https://...    # capture an already-running site
 *   node scripts/screenshot.mjs --theme phosphor     # force a data-theme value
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT_DIR = '.screenshots';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

function parseArgs(argv) {
  const args = { routes: ['/'], viewports: ['desktop', 'mobile'], theme: null, url: null, full: true };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--routes' && value) {
      args.routes = value.split(',').map((r) => r.trim()).filter(Boolean);
      i += 1;
    } else if (flag === '--viewports' && value) {
      args.viewports = value.split(',').map((r) => r.trim());
      i += 1;
    } else if (flag === '--theme' && value) {
      args.theme = value;
      i += 1;
    } else if (flag === '--url' && value) {
      args.url = value.replace(/\/$/, '');
      i += 1;
    } else if (flag === '--viewport-only') {
      args.full = false;
    }
  }
  return args;
}

async function waitForServer(baseUrl, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startPreview() {
  // `detached` puts pnpm and the astro server it forks into their own process
  // group, so shutting down the preview cannot leave an orphan holding the
  // parent's event loop open.
  const child = spawn('pnpm', ['exec', 'astro', 'preview', '--port', '4321'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  child.unref();
  return child;
}

function stopPreview(child) {
  if (!child?.pid) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      /* already gone */
    }
  }
}

const slugify = (route) => (route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await mkdir(OUT_DIR, { recursive: true });

  let server = null;
  let baseUrl = args.url;
  if (!baseUrl) {
    server = startPreview();
    baseUrl = 'http://localhost:4321';
    const ready = await waitForServer(baseUrl);
    if (!ready) {
      stopPreview(server);
      throw new Error(`astro preview did not answer on ${baseUrl}`);
    }
  }

  const browser = await chromium.launch();
  const reports = [];

  for (const viewportName of args.viewports) {
    const viewport = VIEWPORTS[viewportName];
    if (!viewport) throw new Error(`unknown viewport "${viewportName}"`);
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      colorScheme: 'dark',
      reducedMotion: args.reducedMotion ? 'reduce' : 'no-preference',
    });

    for (const route of args.routes) {
      const page = await context.newPage();
      const url = `${baseUrl}${route}`;
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

      const response = await page.goto(url, { waitUntil: 'networkidle' });
      if (args.theme) {
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme;
        }, args.theme);
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(400);

      const file = path.join(OUT_DIR, `${slugify(route)}.${viewportName}${args.theme ? `.${args.theme}` : ''}.png`);
      await page.screenshot({ path: file, fullPage: args.full });

      const vitals = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const paints = performance.getEntriesByType('paint');
        const fcp = paints.find((p) => p.name === 'first-contentful-paint');
        return {
          ttfb: nav ? Math.round(nav.responseStart) : null,
          domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
          load: nav ? Math.round(nav.loadEventEnd) : null,
          firstContentfulPaint: fcp ? Math.round(fcp.startTime) : null,
        };
      });

      reports.push({
        route,
        viewport: viewportName,
        status: response?.status() ?? null,
        theme: args.theme ?? 'default',
        file,
        consoleErrors,
        vitals,
      });
      await page.close();
    }
    await context.close();
  }

  await browser.close();
  stopPreview(server);

  await writeFile(path.join(OUT_DIR, 'report.json'), `${JSON.stringify(reports, null, 2)}\n`);
  for (const report of reports) {
    const errs = report.consoleErrors.length ? ` errors=${report.consoleErrors.length}` : '';
    console.log(
      `${report.status} ${report.route} [${report.viewport}/${report.theme}] fcp=${report.vitals.firstContentfulPaint}ms load=${report.vitals.load}ms${errs}`,
    );
    if (report.consoleErrors.length) {
      for (const err of report.consoleErrors.slice(0, 5)) console.log(`   ! ${err}`);
    }
  }
  console.log(`\n${reports.length} captures written to ${OUT_DIR}/`);
  // The detached preview group is gone, but exit explicitly so a stray handle
  // can never turn a finished capture run into a hang.
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
