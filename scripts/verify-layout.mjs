#!/usr/bin/env node
/**
 * Layout and content assertions across viewports.
 *
 * Written because a real bug shipped past a visual review: with seven section
 * links plus a labelled theme control in the bar, the brand overlapped the links
 * at 1440px. A screenshot looked "mostly fine" at thumbnail scale. This measures.
 *
 * Two families of check:
 *   1. geometry  — horizontal overflow, and horizontal collisions between the
 *                  siblings inside a flex row
 *   2. content   — the sections actually rendered the collections
 *
 * Run: pnpm test:layout
 */
import { chromium } from 'playwright';
import { withPreview } from './lib/preview-server.mjs';

const VIEWPORTS = [
  { name: 'desktop-xl', width: 1600, height: 900 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

/** Pairs that must never overlap, with the container they sit in. */
const NO_OVERLAP = [
  { label: 'nav brand vs links', container: '.nav__inner', a: '.nav__brand', b: '.nav__links' },
  { label: 'nav links vs tools', container: '.nav__inner', a: '.nav__links', b: '.nav__tools' },
  { label: 'nav brand vs tools', container: '.nav__inner', a: '.nav__brand', b: '.nav__tools' },
];

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) {
    console.log(`ok   ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

async function geometry(page, viewport) {
  const result = await page.evaluate((pairs) => {
    const out = { overflow: null, overlaps: [] };
    const root = document.documentElement;
    out.overflow = { scroll: root.scrollWidth, client: root.clientWidth };

    for (const pair of pairs) {
      const a = document.querySelector(pair.a);
      const b = document.querySelector(pair.b);
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      // Elements hidden by a media query report a zero box; that is not a collision.
      if (ra.width === 0 || rb.width === 0) continue;
      const overlaps =
        ra.left < rb.right - 1 && rb.left < ra.right - 1 && ra.top < rb.bottom - 1 && rb.top < ra.bottom - 1;
      if (overlaps) {
        out.overlaps.push({
          label: pair.label,
          a: { l: Math.round(ra.left), r: Math.round(ra.right) },
          b: { l: Math.round(rb.left), r: Math.round(rb.right) },
        });
      }
    }
    return out;
  }, NO_OVERLAP);

  check(
    result.overflow.scroll <= result.overflow.client + 1,
    `${viewport.name} (${viewport.width}px): no horizontal overflow`,
    `scrollWidth ${result.overflow.scroll} vs clientWidth ${result.overflow.client}`,
  );

  for (const pair of NO_OVERLAP) {
    const hit = result.overlaps.find((entry) => entry.label === pair.label);
    check(!hit, `${viewport.name} (${viewport.width}px): ${pair.label}`, hit ? JSON.stringify(hit) : '');
  }
}

async function content(page, locale, label) {
  const stats = await page.evaluate(() => ({
    plates: document.querySelectorAll('#projects .plate').length,
    cards: document.querySelectorAll('#projects .project-card').length,
    highlights: document.querySelectorAll('#highlights .highlight').length,
    roles: document.querySelectorAll('#work .role').length,
    degrees: document.querySelectorAll('#education .degree').length,
    credentials: document.querySelectorAll('#education .credential').length,
    areas: document.querySelectorAll('#skills .area').length,
    interests: document.querySelectorAll('#off-clock .interest').length,
    // A metric marked as a goal must not render with the "is a result" styling.
    softMetrics: document.querySelectorAll('.metric--soft').length,
  }));

  check(stats.plates === 7, `${label}: 7 featured project plates`, `got ${stats.plates}`);
  check(stats.cards === 8, `${label}: 8 supporting project cards`, `got ${stats.cards}`);
  check(stats.highlights === 3, `${label}: 3 highlight cards`, `got ${stats.highlights}`);
  check(stats.roles === 3, `${label}: 3 experience roles`, `got ${stats.roles}`);
  check(stats.degrees === 2, `${label}: 2 degrees`, `got ${stats.degrees}`);
  check(stats.credentials === 5, `${label}: 5 certifications and languages`, `got ${stats.credentials}`);
  check(stats.areas === 5, `${label}: 5 skill areas`, `got ${stats.areas}`);
  check(stats.interests === 5, `${label}: 5 interest groups`, `got ${stats.interests}`);
  check(stats.softMetrics >= 2, `${label}: goal metrics styled as goals`, `got ${stats.softMetrics}`);
}

async function caseStudy(page, baseUrl) {
  await page.goto(`${baseUrl}/proyectos/telemetry-sentinel/`, { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    metrics: document.querySelectorAll('.case__metric-list li').length,
    limits: document.querySelectorAll('.case__limits li').length,
    // The schema forbids a repository link on a case study: it would 404.
    /*
     * Scoped to the case study article, not the whole page: the footer links to
     * GitHub as a contact channel, which is not a repository link for the project
     * and is not what this assertion is about.
     */
    externalRepoLinks: [
      ...document.querySelectorAll('article.case a[href*="github.com"]'),
    ].map((a) => a.href),
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null,
    hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang),
  }));

  check(data.h1 === 'Telemetry Sentinel', 'case study: title rendered', String(data.h1));
  check(data.metrics === 5, 'case study: all metrics rendered', `got ${data.metrics}`);
  check(data.limits >= 5, 'case study: limits block rendered', `got ${data.limits}`);
  check(
    data.externalRepoLinks.length === 0,
    'case study: no repository link on a private project',
    JSON.stringify(data.externalRepoLinks),
  );
  check(
    data.canonical === 'https://germanpadua.github.io/proyectos/telemetry-sentinel/',
    'case study: canonical url',
    String(data.canonical),
  );
  check(data.hreflang.includes('es') && data.hreflang.includes('en') && data.hreflang.includes('x-default'), 'case study: hreflang set', JSON.stringify(data.hreflang));
}

async function main() {
  const { baseUrl, stop } = await withPreview();
  const browser = await chromium.launch();

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: 'light',
      });
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);
      await geometry(page, viewport);
      await page.close();
    }

    const esPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await esPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await content(esPage, 'es', 'es home');

    const enPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await enPage.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
    await content(enPage, 'en', 'en home');

    await caseStudy(esPage, baseUrl);
  } finally {
    await browser.close();
    stop();
  }

  if (failures.length > 0) {
    console.error(`\nLayout verification failed (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('\nLayout verification passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
