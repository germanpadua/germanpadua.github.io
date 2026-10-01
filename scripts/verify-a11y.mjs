#!/usr/bin/env node
/**
 * Accessibility and structure audit.
 *
 * Runs axe-core against every route in every theme, then checks the things axe cannot:
 * that the page has one h1 and an ordered heading tree, that keyboard focus is visible
 * and the skip link works, that reduced motion leaves the content visible rather than
 * hidden behind an animation that never runs, and that touch targets clear the WCAG 2.2
 * minimum.
 *
 * The theme loop matters: contrast is per theme, so a palette that fails only in
 * `nebula` has to fail here rather than in a reader's browser.
 *
 * Run: pnpm test:a11y
 */
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { withPreview } from './lib/preview-server.mjs';

const ROUTES = [
  { path: '/', label: 'home (es)' },
  { path: '/en/', label: 'home (en)' },
  { path: '/proyectos/', label: 'projects index (es)' },
  { path: '/proyectos/telemetry-sentinel/', label: 'case study (es)' },
  { path: '/proyectos/actas-visitas-obras/', label: 'case study with limits (es)' },
  { path: '/en/projects/hackspain-prosper/', label: 'case study (en)' },
  { path: '/404.html', label: 'not found' },
];

const THEMES = ['atlas', 'tinta', 'phosphor', 'nebula'];

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) console.log(`ok   ${label}`);
  else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const AXE_SOURCE = await readFile('node_modules/axe-core/axe.min.js', 'utf8');

async function runAxe(page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      // The graph canvas is decorative: its content is the list below it, and the canvas
      // carries its own description. axe has nothing to say about a canvas either way.
      rules: { 'color-contrast': { enabled: true } },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
      count: violation.nodes.length,
    }));
  });
}

async function checkStructure(page, route) {
  const structure = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((el) => ({
      level: Number(el.tagName[1]),
      text: (el.textContent ?? '').trim().slice(0, 40),
    }));
    const images = [...document.querySelectorAll('img')].map((img) => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      loading: img.getAttribute('loading'),
    }));
    const links = [...document.querySelectorAll('a')];
    const skip = document.querySelector('.skip-link');
    return {
      lang: document.documentElement.lang,
      title: document.title,
      h1Count: headings.filter((heading) => heading.level === 1).length,
      headings,
      images,
      mainCount: document.querySelectorAll('main').length,
      navLabels: [...document.querySelectorAll('nav')].map((nav) => nav.getAttribute('aria-label')),
      namelessLinks: links
        .filter((link) => !(link.textContent ?? '').trim() && !link.getAttribute('aria-label') && !link.querySelector('img[alt]'))
        .map((link) => link.getAttribute('href')),
      hasSkipLink: Boolean(skip),
      duplicateIds: (() => {
        const seen = new Set();
        const dupes = new Set();
        for (const el of document.querySelectorAll('[id]')) {
          if (seen.has(el.id)) dupes.add(el.id);
          seen.add(el.id);
        }
        return [...dupes];
      })(),
      smallTargets: (() => {
        // WCAG 2.2 target size (minimum): 24x24 CSS px, with inline links exempt.
        const out = [];
        for (const el of document.querySelectorAll('button, a, input, select, textarea, [role="button"]')) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (el.closest('p, li, .case__prose, .terminal__line, .graph__notes')) continue;
          if (rect.width < 24 || rect.height < 24) {
            out.push(`${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ')[0]}` : ''} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
          }
        }
        return [...new Set(out)];
      })(),
    };
  });

  check(structure.h1Count === 1, `${route.label}: exactly one h1`, `found ${structure.h1Count}`);
  check(structure.mainCount === 1, `${route.label}: exactly one main landmark`, `found ${structure.mainCount}`);
  check(Boolean(structure.lang), `${route.label}: the document declares a language`, structure.lang);
  check(structure.title.length > 5, `${route.label}: a descriptive title`, structure.title);
  check(structure.duplicateIds.length === 0, `${route.label}: no duplicate ids`, structure.duplicateIds.join(', '));
  check(structure.namelessLinks.length === 0, `${route.label}: every link has an accessible name`, structure.namelessLinks.join(', '));

  const skipped = structure.headings.filter((heading, index) => {
    const previous = structure.headings[index - 1];
    return previous ? heading.level > previous.level + 1 : false;
  });
  check(skipped.length === 0, `${route.label}: no heading level is skipped`, skipped.map((h) => h.text).join(' | '));

  const badImages = structure.images.filter((image) => image.alt === null || image.alt === undefined);
  check(badImages.length === 0, `${route.label}: every image has an alt attribute`, badImages.map((i) => i.src).join(', '));

  const unsized = structure.images.filter((image) => !image.width || !image.height);
  check(unsized.length === 0, `${route.label}: images declare their dimensions`, unsized.map((i) => i.src).join(', '));

  return structure;
}

async function checkKeyboard(page) {
  await page.goto(`${page.__base}/`, { waitUntil: 'networkidle' });

  // The skip link must be the first stop and must become visible when focused.
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => {
    const el = document.activeElement;
    const rect = el.getBoundingClientRect();
    return { text: (el.textContent ?? '').trim(), hasFocus: el !== document.body, visible: rect.width > 0 && rect.top >= -1 };
  });
  check(first.text.toLowerCase().includes('saltar'), 'keyboard: the first stop is the skip link', first.text);
  check(first.visible, 'keyboard: the skip link becomes visible on focus');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const afterSkip = await page.evaluate(() => document.activeElement?.id ?? document.activeElement?.tagName ?? '');
  check(afterSkip === 'main', 'keyboard: the skip link moves focus to the content', afterSkip);

  // Every stop must be a real control with a visible focus ring, and Tab must not leave
  // the page. Twenty stops is enough to walk the header and the first sections.
  const stops = [];
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const styles = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const outline = styles.outlineStyle !== 'none' && parseFloat(styles.outlineWidth) > 0;
      const shadow = styles.boxShadow !== 'none';
      return {
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className.split(' ')[0] : '',
        outline,
        shadow,
        width: Math.round(rect.width),
      };
    });
    if (stop === null) break;
    stops.push(stop);
  }
  check(stops.length >= 12, 'keyboard: the page is reachable by tab', `${stops.length} stops`);
  const withoutRing = stops.filter((stop) => !stop.outline && !stop.shadow && stop.width > 0);
  check(
    withoutRing.length === 0,
    'keyboard: every focus stop shows a focus indicator',
    withoutRing.map((stop) => `${stop.tag}.${stop.className}`).join(', '),
  );
}

async function checkReducedMotion(browser, baseUrl) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  /*
   * The reveal animation exists only inside `animation-timeline: view()`. If it were
   * written the other way round — hidden by default, revealed by an observer — a reader
   * with reduced motion, or with the feature unsupported, would see an empty page. This
   * asserts they do not.
   */
  const hidden = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.reveal')) {
      const styles = getComputedStyle(el);
      if (parseFloat(styles.opacity) < 0.9) {
        out.push(`${el.className.split(' ')[0]} opacity=${styles.opacity}`);
      }
    }
    return out;
  });
  check(hidden.length === 0, 'reduced motion: every revealed element is visible', hidden.join(', '));
  await context.close();
}

async function main() {
  const { baseUrl, stop } = await withPreview();
  const browser = await chromium.launch();
  const homePage = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  homePage.__base = baseUrl;

  try {
    /* axe, per route and per theme. */
    for (const route of ROUTES) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 900 },
          colorScheme: theme === 'atlas' ? 'light' : 'dark',
        });
        const page = await context.newPage();
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
        await page.evaluate((name) => document.documentElement.setAttribute('data-theme', name), theme);
        await page.waitForTimeout(120);

        const violations = await runAxe(page);
        const label = `axe ${route.label} [${theme}]`;
        check(
          violations.length === 0,
          label,
          violations.map((v) => `${v.id}(${v.impact}, ${v.count}): ${v.nodes.join(' / ')}`).join(' | '),
        );
        await context.close();
      }
    }

    /* Structure, once per route in the default theme. */
    for (const route of ROUTES) {
      await homePage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      const structure = await checkStructure(homePage, route);
      if (route.path === '/') {
        check(structure.hasSkipLink, 'home: the skip link exists');
        check(structure.smallTargets.length === 0, 'home: touch targets clear 24x24', structure.smallTargets.join(', '));
      }
    }

    await checkKeyboard(homePage);
    await checkReducedMotion(browser, baseUrl);
  } finally {
    await browser.close();
    stop();
  }

  if (failures.length > 0) {
    console.error(`\nAccessibility audit failed (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('\nAccessibility audit passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
