#!/usr/bin/env node
/**
 * Behavioural check for the theme system.
 *
 * The theme bootstrap is the only inline script the shell ships, it runs before
 * first paint, and it is the kind of code that fails silently: a wrong default,
 * a control that stops reflecting reality, or a stored preference that stops
 * being honoured all look fine in a screenshot. So it is asserted.
 *
 * Also asserts that the rendered page makes no third-party request, which is the
 * runtime counterpart of scripts/assert-shell-payload.mjs.
 *
 * Run: pnpm test:e2e
 */
import { chromium } from 'playwright';
import { withPreview, PREVIEW_URL } from './lib/preview-server.mjs';

const KEY = 'gp.theme';
const ROUTE = '/';

const failures = [];
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ` -> got ${JSON.stringify(actual)}`}`);
}

async function snapshot(page) {
  return page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    checked: document.querySelector('[data-theme-switch] input:checked')?.value ?? null,
    themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null,
    stored: (() => {
      try {
        return localStorage.getItem('gp.theme');
      } catch {
        return 'unavailable';
      }
    })(),
  }));
}

async function main() {
  const { baseUrl, stop } = await withPreview();
  const browser = await chromium.launch();
  const offsite = [];

  try {
    // --- 1. system preference decides when nothing is stored ---------------
    for (const [scheme, expected] of [
      ['light', 'atlas'],
      ['dark', 'tinta'],
    ]) {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      page.on('request', (request) => {
        const url = request.url();
        if (!url.startsWith(baseUrl) && !url.startsWith('data:') && !url.startsWith('blob:')) {
          offsite.push(url);
        }
      });
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

      await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });

      const initial = await snapshot(page);
      check(`${scheme}: default theme`, initial.theme, expected);
      check(`${scheme}: control reflects it`, initial.checked, expected);
      check(`${scheme}: nothing stored yet`, initial.stored, null);

      const swatch = await page.evaluate(
        (theme) => document.querySelector(`[data-theme-switch] input[value="${theme}"]`).dataset.swatch,
        expected,
      );
      check(`${scheme}: theme-color follows the theme`, initial.themeColor, swatch);

      // --- 2. an explicit choice wins over the system ---------------------
      await page.click('[data-theme-switch] input[value="phosphor"]');
      await page.waitForTimeout(120);
      const chosen = await snapshot(page);
      check(`${scheme}: click switches the theme`, chosen.theme, 'phosphor');
      check(`${scheme}: click persists`, chosen.stored, 'phosphor');

      const phosphorSwatch = await page.evaluate(
        () => document.querySelector('[data-theme-switch] input[value="phosphor"]').dataset.swatch,
      );
      check(`${scheme}: theme-color follows the choice`, chosen.themeColor, phosphorSwatch);

      // --- 3. the stored choice survives a reload, and outranks the system -
      await page.reload({ waitUntil: 'networkidle' });
      const reloaded = await snapshot(page);
      check(`${scheme}: stored theme survives reload`, reloaded.theme, 'phosphor');
      check(`${scheme}: control still reflects it`, reloaded.checked, 'phosphor');

      check(`${scheme}: no console errors`, errors, []);
      await context.close();
    }

    // --- 4. no third-party request at runtime -----------------------------
    check('no third-party requests', offsite, []);

    /*
     * The theme control has to be the topmost element at its own centre. Driving it
     * by clicking is an indirect test: it passed for a while only because the click
     * landed on the label text, and broke the moment the layout changed and the
     * centre moved onto the swatch. This asserts the property directly, at several
     * widths, so a change to the control's geometry cannot quietly reintroduce it.
     */
    for (const width of [1600, 1440, 1280, 900, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 800 } });
      const probe = await context.newPage();
      await probe.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });
      const reachable = await probe.evaluate(() => {
        const inputs = [...document.querySelectorAll('[data-theme-switch] input')];
        return inputs.map((input) => {
          const rect = input.getBoundingClientRect();
          const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return { value: input.value, hit: top === input };
        });
      });
      const blocked = reachable.filter((entry) => !entry.hit).map((entry) => entry.value);
      // verify-theme uses check(label, actual, expected); verify-layout uses check(ok, label, detail).
      check(`theme control is the topmost element at ${width}px`, blocked, []);
      await context.close();
    }

    // --- 5. the shell ships no external script ---------------------------
    const page = await browser.newPage();
    await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });
    const external = await page.evaluate(() =>
      [...document.querySelectorAll('script[src]')].map((el) => el.getAttribute('src')),
    );
    check('no external script on the document shell', external, []);
    await page.close();
  } finally {
    await browser.close();
    stop();
  }

  if (failures.length > 0) {
    console.error(`\nTheme verification failed (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`\nTheme verification passed against ${PREVIEW_URL}${ROUTE}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
