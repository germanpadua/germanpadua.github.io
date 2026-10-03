#!/usr/bin/env node
/**
 * Behavioural checks for the hydrated islands.
 *
 * An island that renders but does not respond is the failure mode that a screenshot
 * cannot catch: the canvas paints once, looks right, and the pointer does nothing.
 * These checks drive each island the way a person would.
 *
 * Run: pnpm test:islands
 */
import { chromium } from 'playwright';
import { withPreview } from './lib/preview-server.mjs';

const failures = [];
const check = (ok, label, detail = '') => {
  if (ok) {
    console.log(`ok   ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

/** Wait until Astro has hydrated the island and removed the `ssr` marker. */
async function waitForHydration(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const island = document.querySelector(sel);
      return Boolean(island) && !island.hasAttribute('ssr');
    },
    selector,
    { timeout: 15_000 },
  );
}

async function checkSkillGraph(page, baseUrl, browser) {
  // The map route hosts the graph island since skills-map-v3 WU-C1; the home
  // section renders a static preview, and WU-C2 rebuilt the island as a radial
  // map with a HUD. The checks below keep every pre-existing guarantee and add
  // the HUD, legend, search, layers and scroll behaviour on top.
  await page.goto(`${baseUrl}/mapa/`, { waitUntil: 'networkidle' });
  await page.locator('astro-island[component-url*="SkillGraph"]').scrollIntoViewIfNeeded();
  await waitForHydration(page, 'astro-island[component-url*="SkillGraph"]');
  const canvas = page.locator('.graph__canvas');
  await canvas.waitFor();
  const picker = page.locator('.graph__picker select');
  check(await picker.locator('option').count() === 94, 'skills: every graph node can be selected accessibly');
  check(await canvas.evaluate(el => el.width > 0 && el.height > 0), 'skills: graph canvas is drawn');
  await picker.selectOption('python');
  check((await page.locator('.graph__detail-title').textContent()) === 'Python', 'skills: selection updates the detail');
  check(await canvas.getAttribute('data-selected') === 'python', 'skills: the graph reflects the selected node');
  const links = await page.locator('.graph__detail a').evaluateAll(els => els.map(e => e.getAttribute('href')));
  check(links.length > 0 && links.every(href => href.startsWith('/proyectos/')), 'skills: evidence links to actual project cases');

  // WU-C2: level and freshness travel as text, straight from the derivation.
  // Python is weight 0.98 (strong) with 2025 project years (current).
  check((await page.locator('[data-detail="level"]').textContent()) === 'Sólido', 'skills: the detail shows the level as text');
  check((await page.locator('[data-detail="freshness"]').textContent()) === 'Al día', 'skills: the detail shows freshness as text');
  check(await page.locator('[data-detail="year"]').count() === 1, 'skills: the detail shows the last activity year');

  // WU-C2: the legend lists every area, every level, and only the freshness
  // states the data actually has (current 47, warming 34, unknown 12, stale 0).
  await page.locator('.graph__dockLegend').click();
  const legend = page.locator('.graph__panel--legend');
  await legend.waitFor();
  check(await legend.locator('[data-legend="area"]').count() === 5, 'skills: the legend lists the five areas');
  check(await legend.locator('[data-legend="level"]').count() === 3, 'skills: the legend lists the three levels');
  check(await legend.locator('[data-legend="freshness"]').count() === 3, 'skills: the legend lists only the freshness states present in the data');
  const legendText = await legend.textContent();
  check(legendText.includes('Antiguo') === false, 'skills: the legend omits the empty stale state');
  check(legendText.includes('2026-10'), 'skills: the legend shows the last-reviewed date');
  check(legendText.includes('sólido ≥ 0,85'), 'skills: the legend states the level rule');
  await page.keyboard.press('Escape');
  check(await legend.count() === 0, 'skills: Escape closes the legend panel');

  // WU-C2: search filters and selects through the same selection path.
  await page.locator('.graph__dockSearch').click();
  const searchInput = page.locator('.graph__searchInput');
  await searchInput.fill('pytorch');
  await page.keyboard.press('Enter');
  check(await canvas.getAttribute('data-selected') === 'pytorch', 'skills: search finds and selects a node');
  await page.locator('.graph__searchClear').click();
  await page.keyboard.press('Escape');

  // WU-C2: a layer toggle is reflected on the wrapper's data-layers list.
  const wrapper = page.locator('.graph');
  const layersBefore = await wrapper.getAttribute('data-layers');
  await page.locator('.graph__dockLayers').click();
  await page.locator('.graph__layer', { hasText: 'Relaciones' }).locator('input').uncheck();
  const layersAfter = await wrapper.getAttribute('data-layers');
  check(
    layersBefore.includes('lines') && !layersAfter.split(' ').includes('lines'),
    'skills: a layer toggle updates the wrapper data-layers',
    `${layersBefore} -> ${layersAfter}`,
  );
  await page.locator('.graph__layer', { hasText: 'Relaciones' }).locator('input').check();
  await page.keyboard.press('Escape');

  await picker.focus();
  await page.keyboard.press('p');
  await page.keyboard.press('Enter');
  check(await picker.evaluate(el => document.activeElement === el), 'skills: picker works with keyboard focus');
  await picker.selectOption('analysis');
  check((await page.locator('.graph__coursework').textContent()).includes('Cálculo I'), 'skills: degree coursework supports the new academic nodes');
  await picker.selectOption('spark');
  check((await page.locator('.graph__coursework').textContent()).includes('Big Data II'), 'skills: master coursework supports academic tools');
  const math = page.locator('.graph__area').filter({ hasText: 'Matemáticas' }).locator('input');
  await math.uncheck();
  check(!(await math.isChecked()), 'skills: an area can be filtered');
  await page.locator('.graph__reset').click();
  check(await math.isChecked(), 'skills: showing all restores the area');

  // WU-C2 mobile: the stage keeps its comfortable width inside a horizontally
  // scrollable container, so the radial geometry never compresses to overlap.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mobilePage = await mobile.newPage();
  const mobileErrors = [];
  mobilePage.on('pageerror', (error) => mobileErrors.push(error.message));
  await mobilePage.goto(`${baseUrl}/mapa/`, { waitUntil: 'networkidle' });
  await mobilePage.locator('astro-island[component-url*="SkillGraph"]').scrollIntoViewIfNeeded();
  await waitForHydration(mobilePage, 'astro-island[component-url*="SkillGraph"]');
  const scrollContainer = mobilePage.locator('.graph__scroll');
  await scrollContainer.waitFor();
  const scrollMetrics = await scrollContainer.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollLeft: el.scrollLeft,
  }));
  check(scrollMetrics.scrollWidth > scrollMetrics.clientWidth, 'skills (390px): the stage container scrolls horizontally', JSON.stringify(scrollMetrics));
  const canvasWidth = await mobilePage.locator('.graph__canvas').evaluate((el) => el.getBoundingClientRect().width);
  check(canvasWidth >= 700, 'skills (390px): the canvas keeps its minimum width', `${canvasWidth}px`);
  await scrollContainer.evaluate((el) => { el.scrollLeft = 150; });
  check(await scrollContainer.evaluate((el) => el.scrollLeft > 0), 'skills (390px): the container pans the map into view');
  check(mobileErrors.length === 0, 'skills (390px): no page error on mobile', mobileErrors.slice(0, 2).join(' | '));
  await mobile.close();
}

async function checkTerminal(page, baseUrl) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('[data-terminal-open]').click();
  check(await page.locator('#terminal-mode').evaluate(d => d.open), 'terminal: navigation opens the modal');

  const island = 'astro-island[component-url*="Terminal"]';
  await waitForHydration(page, island);

  const input = page.locator('#terminal-input');
  await input.waitFor({ state: 'visible' });
  // The terminal is disabled until its data arrives; typing into it before then is
  // exactly the race a reader would hit.
  await page.waitForFunction(() => {
    const el = document.querySelector('#terminal-input');
    return el instanceof HTMLInputElement && !el.disabled;
  }, undefined, { timeout: 15_000 });

  const output = () => page.locator('.terminal__output').innerText();
  const type = async (command) => {
    await input.fill(command);
    await input.press('Enter');
    await page.waitForTimeout(150);
  };

  check((await output()).includes('help'), 'terminal: banner invites the reader to type help');

  await type('help');
  const help = await output();
  check(help.includes('projects') && help.includes('neofetch'), 'terminal: help lists the commands');

  await type('projects');
  const projects = await output();
  check(projects.includes('15 proyectos'), 'terminal: projects reports the count', (projects.match(/\d+ proyectos/) ?? [''])[0]);
  check(projects.includes('telemetry-sentinel'), 'terminal: projects lists slugs');

  await type('project telemetry-sentinel');
  const detail = await output();
  check(detail.includes('Telemetry Sentinel'), 'terminal: project shows the title');
  check(detail.includes('Fórmula 1'), 'terminal: project explains its purpose');

  await type('project actas-visitas-obras');
  check((await output()).includes('borrador'), 'terminal: private project describes its workflow');

  await type('thereisnosuchcommand');
  check((await output()).includes('no existe'), 'terminal: unknown command reports an error');

  await type('beskar');
  check((await output()).includes('camino'), 'terminal: an easter egg answers');

  // Tab completion of a command name.
  await input.fill('whoam');
  await input.press('Tab');
  await page.waitForTimeout(100);
  check((await input.inputValue()) === 'whoami ', 'terminal: tab completes a command', await input.inputValue());

  // History recall with the arrow keys.
  await input.fill('');
  await input.press('ArrowUp');
  await page.waitForTimeout(80);
  check((await input.inputValue()).length > 0, 'terminal: arrow up recalls history', await input.inputValue());

  // The theme command must drive the real control, not set the attribute itself.
  await type('theme phosphor');
  await page.waitForTimeout(250);
  const themeState = await page.evaluate(() => ({
    root: document.documentElement.getAttribute('data-theme'),
    checked: document.querySelector('[data-theme-switch] input:checked')?.value ?? null,
    stored: localStorage.getItem('gp.theme'),
  }));
  check(themeState.root === 'phosphor', 'terminal: theme command switches the theme', themeState.root ?? 'null');
  check(
    themeState.checked === 'phosphor' && themeState.stored === 'phosphor',
    'terminal: theme command goes through the real switch and persists',
    `checked=${themeState.checked} stored=${themeState.stored}`,
  );
  await type('theme atlas');

  // An invalid argument must not silently do nothing.
  await type('theme nope');
  check((await output()).includes('No existe el tema'), 'terminal: an unknown theme is rejected');

  await type('clear');
  const afterClear = await output();
  check(afterClear.trim().length === 0, 'terminal: clear empties the screen', `${afterClear.trim().length} chars`);
  await page.keyboard.press('Escape');
  check(!(await page.locator('#terminal-mode').evaluate(d => d.open)), 'terminal: Escape closes the dialog');
  check(await page.locator('[data-terminal-open]').evaluate(b => b === document.activeElement), 'terminal: focus returns to the opening button');
}

async function checkThesis(page, baseUrl) {
  await page.goto(`${baseUrl}/proyectos/pseudo-riemannian-gnn/`, { waitUntil: 'networkidle' });
  await page.locator('astro-island[component-url*="ThesisExplorer"]').scrollIntoViewIfNeeded();
  await page.locator('#thesis-dataset').waitFor();
  check(await page.locator('#thesis-dataset option').count() === 5, 'thesis: five saved datasets can be explored');
  check((await page.locator('.thesis-explorer__views').textContent()).includes('91.99%'), 'thesis: Photo shows the saved score');
  await page.locator('#thesis-dataset').selectOption('4');
  check((await page.locator('.thesis-explorer__views').textContent()).includes('77.82%'), 'thesis: selecting Airport updates the comparison');
}

async function checkGame(page, baseUrl, browser) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('.game__canvas').scrollIntoViewIfNeeded();

  const island = 'astro-island[component-url*="F1Game"]';
  await waitForHydration(page, island);

  const canvas = page.locator('.game__canvas');
  await canvas.waitFor({ state: 'visible' });
  await page.waitForTimeout(400);

  /**
   * A fingerprint of the canvas, dense enough to notice the car moving.
   *
   * A sparse sample does not work here: the car covers about 200 pixels out of half a
   * million, so a stride of a few hundred bytes has roughly even odds of missing it
   * entirely and the assertion becomes a coin flip.
   */
  const checksum = () =>
    page.evaluate(() => {
      const el = document.querySelector('.game__canvas');
      const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
      let hash = 2166136261;
      for (let i = 0; i < data.length; i += 4) {
        hash ^= data[i] + data[i + 1] * 3 + data[i + 2] * 7 + data[i + 3] * 11;
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return hash;
    });

  const painted = await page.evaluate(() => {
    const el = document.querySelector('.game__canvas');
    const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 20) opaque += 1;
    return opaque;
  });
  check(painted > 5000, 'game: the circuit is drawn', `${painted} px`);

  const start = page.locator('.game__overlay button');
  check((await start.count()) === 1, 'game: the start control is present');
  check((await start.textContent())?.length > 2, 'game: the start control is labelled', await start.textContent());

  await start.click();
  /*
   * Wait for the countdown element to disappear, not for the overlay.
   *
   * The countdown is a DOM element now, and during it there is no overlay — so waiting
   * for "no overlay" returned immediately and every subsequent assertion ran while the
   * car was still stationary. That is what made four checks fail for a single reason.
   */
  const countingDown = await page.locator('.game__countdown').count();
  check(countingDown === 1, 'game: the countdown is announced in the DOM', `${countingDown} element(s)`);
  await page.waitForFunction(() => document.querySelector('.game__countdown') === null, undefined, {
    timeout: 10_000,
  });
  check((await page.locator('.game__overlay').count()) === 0, 'game: the countdown ends and the run starts');

  const before = await checksum();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(700);
  const after = await checksum();
  const speed = await page.locator('.game__stat').nth(4).locator('.game__stat-value').textContent();
  check(before !== after, 'game: the canvas animates while driving');
  check(Number(speed) > 0, 'game: holding the throttle builds speed', `speed=${speed}`);

  // Steering has to change where the car points, not just move it sideways.
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.up('ArrowUp');
  const afterSteer = await checksum();
  check(afterSteer !== after, 'game: steering changes the picture');

  // Pausing on blur. A race that keeps timing in a hidden tab is not winnable.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(200);
  const pausedOverlay = await page.locator('.game__overlay').count();
  check(pausedOverlay === 1, 'game: leaving the window pauses the run', `${pausedOverlay} overlay(s)`);
  const pausedChecksum = await checksum();
  await page.waitForTimeout(400);
  check((await checksum()) === pausedChecksum, 'game: a paused run is frozen');
  await page.locator('.game__overlay button').click();
  await page.waitForTimeout(300);
  check((await page.locator('.game__overlay').count()) === 0, 'game: resuming clears the overlay');

  /*
   * The touch pads exist for touch and are hidden for a fine pointer. Both halves are
   * asserted, because a stray visible pad on desktop is the kind of thing that only
   * shows up in a screenshot nobody takes.
   */
  const desktopPads = await page.locator('.game__touch').isVisible();
  check(!desktopPads, 'game: touch pads are hidden with a mouse');

  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await touchPage.locator('.game__canvas').scrollIntoViewIfNeeded();
  await touchPage.waitForFunction(
    () => !document.querySelector('astro-island[component-url*="F1Game"]')?.hasAttribute('ssr'),
    undefined,
    { timeout: 15_000 },
  );
  const touchPads = await touchPage.locator('.game__touch').isVisible();
  check(touchPads, 'game: touch pads are visible on a touch device');

  await touchPage.locator('.game__overlay button').click();
  await touchPage.waitForFunction(() => document.querySelector('.game__countdown') === null, undefined, {
    timeout: 10_000,
  });
  const thumb = touchPage.locator('.game__pad--wide').last();
  const padBox = await thumb.boundingBox();
  await touchPage.mouse.move(padBox.x + padBox.width / 2, padBox.y + padBox.height / 2);
  await touchPage.mouse.down();
  await touchPage.waitForTimeout(600);
  const touchSpeed = await touchPage.locator('.game__stat').nth(4).locator('.game__stat-value').textContent();
  await touchPage.mouse.up();
  check(Number(touchSpeed) > 0, 'game: the throttle pad drives the car', `speed=${touchSpeed}`);
  await touchPage.locator('.game__actions button').first().click();
  check(await touchPage.locator('.game__countdown').isVisible(), 'game: mobile restart starts a new countdown');
  check(Number(await touchPage.locator('.game__stat-value').last().textContent()) === 0, 'game: mobile restart resets speed');
  await touchContext.close();
}

async function main() {
  const { baseUrl, stop } = await withPreview();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await checkSkillGraph(page, baseUrl, browser);
    await checkTerminal(page, baseUrl);
    await checkThesis(page, baseUrl);
    await checkGame(page, baseUrl, browser);
    check(errors.length === 0, 'islands: no console or page error', errors.slice(0, 3).join(' | '));
  } finally {
    await browser.close();
    stop();
  }

  if (failures.length > 0) {
    console.error(`\nIsland verification failed (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log('\nIsland verification passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
