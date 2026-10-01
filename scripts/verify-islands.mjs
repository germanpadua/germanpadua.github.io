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

/**
 * Locate every node disc on the canvas by flood-filling saturated pixels.
 *
 * Used for two assertions that a screenshot cannot make: that the number of discs
 * matches the number of nodes (a soft force layout can leave two nodes on top of each
 * other, which looks like one node and makes one of them unclickable), and that
 * filtering does not move the nodes that remain.
 */
async function discCentroids(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.graph__canvas');
    const { width, height } = el;
    const data = el.getContext('2d').getImageData(0, 0, width, height).data;
    const seen = new Uint8Array(width * height);
    const isNode = (x, y) => {
      const i = (y * width + x) * 4;
      return (
        data[i + 3] > 200 &&
        Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 40
      );
    };
    const blobs = [];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (seen[y * width + x] || !isNode(x, y)) continue;
        const stack = [[x, y]];
        let sx = 0;
        let sy = 0;
        let count = 0;
        while (stack.length && count < 5000) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
          const key = cy * width + cx;
          if (seen[key] || !isNode(cx, cy)) continue;
          seen[key] = 1;
          sx += cx;
          sy += cy;
          count += 1;
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        if (count > 20) blobs.push({ x: sx / count, y: sy / count, area: count });
      }
    }
    return blobs;
  });
}

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

async function checkSkillGraph(page, baseUrl) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

  const island = 'astro-island[component-url*="SkillGraph"]';
  /*
   * Scroll the island itself into view, not its section. The section is taller than
   * the viewport, so `scrollIntoViewIfNeeded` on it leaves the island below the fold
   * and `client:visible` never fires — which looks exactly like broken hydration.
   */
  await page.locator('.graph__canvas').scrollIntoViewIfNeeded();
  await waitForHydration(page, island);

  const canvas = page.locator('.graph__canvas');
  await canvas.waitFor({ state: 'visible' });
  // The layout settles over a few hundred frames; give it time to finish.
  await page.waitForTimeout(1400);

  // 1. The canvas actually drew something. A blank canvas means the simulation ran
  //    without rendering, which a screenshot taken too early would also show.
  const painted = await page.evaluate(() => {
    const el = document.querySelector('.graph__canvas');
    const context = el.getContext('2d');
    const { width, height } = el;
    const data = context.getImageData(0, 0, width, height).data;
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 20) opaque += 1;
    }
    return { opaque, total: data.length / 4, ratio: opaque / (data.length / 4) };
  });
  check(painted.opaque > 2000, 'graph: canvas painted nodes and edges', `opaque=${painted.opaque}`);
  check(painted.ratio < 0.8, 'graph: canvas is not a filled block', `ratio=${painted.ratio.toFixed(3)}`);

  // 2. Clicking a node selects it and fills the detail panel.
  //
  //    The candidate points are found by scanning the canvas for a saturated pixel
  //    with a saturated neighbourhood, which is the interior of a node disc rather
  //    than an antialiased edge, and then several candidates are tried. A single
  //    sampled pixel proved too fragile: it can sit on a rim and miss the hit test.
  const candidates = await page.evaluate(() => {
    const el = document.querySelector('.graph__canvas');
    const { width, height } = el;
    const data = el.getContext('2d').getImageData(0, 0, width, height).data;
    const saturated = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return false;
      const i = (y * width + x) * 4;
      return (
        data[i + 3] > 200 && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 40
      );
    };
    const rect = el.getBoundingClientRect();
    const sx = el.width / rect.width;
    const sy = el.height / rect.height;
    const found = [];
    for (let y = 6; y < height - 6; y += 4) {
      for (let x = 6; x < width - 6; x += 4) {
        if (!saturated(x, y)) continue;
        const interior = [-3, 0, 3].every((dy) => [-3, 0, 3].every((dx) => saturated(x + dx, y + dy)));
        if (interior) found.push({ x: rect.left + x / sx, y: rect.top + y / sy });
      }
    }
    return found;
  });
  check(candidates.length > 0, 'graph: found node interiors to click', `candidates=${candidates.length}`);

  let opened = false;
  let clickedTitle = '';
  for (const point of candidates.filter((_, index) => index % 7 === 0).slice(0, 12)) {
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(120);
    if ((await page.locator('.graph__detail-title').count()) === 1) {
      opened = true;
      clickedTitle = (await page.locator('.graph__detail-title').textContent())?.trim() ?? '';
      break;
    }
  }
  check(opened, 'graph: clicking a node opens its detail panel');
  check(clickedTitle.length > 1, 'graph: the detail panel names the skill', clickedTitle);

  // 3. Area filters are real controls, and disabling one removes that area's colour
  //    from the canvas. Counting painted pixels would not work: hiding nodes triggers
  //    a new layout, so the survivors spread out and cover *more* pixels than before.
  const toggles = page.locator('.graph__area input');
  const toggleCount = await toggles.count();
  check(toggleCount === 5, 'graph: five area filters', `got ${toggleCount}`);

  const countByArea = async () =>
    page.evaluate(() => {
      const hex = (token) => {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
        const m = raw.replace('#', '');
        return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
      };
      const targets = ['--node-math', '--node-cs', '--node-ds', '--node-tools', '--node-lang'].map(hex);
      const el = document.querySelector('.graph__canvas');
      const { width, height } = el;
      const data = el.getContext('2d').getImageData(0, 0, width, height).data;
      const counts = targets.map(() => 0);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue;
        for (let t = 0; t < targets.length; t += 1) {
          const [r, g, b] = targets[t];
          if (Math.abs(data[i] - r) < 12 && Math.abs(data[i + 1] - g) < 12 && Math.abs(data[i + 2] - b) < 12) counts[t] += 1;
        }
      }
      return counts;
    });

  // Clear the selection first: a selected node dims everything not connected to it,
  // and a dimmed circle no longer matches its token colour, so measuring with a
  // selection active reads as "this area paints nothing".
  const corner = await page.evaluate(() => {
    const rect = document.querySelector('.graph__canvas').getBoundingClientRect();
    // Nodes are clamped to a 26px margin, so the very corner is always empty.
    return { x: rect.left + 4, y: rect.top + 4 };
  });
  await page.mouse.move(corner.x, corner.y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(200);

  const before = await countByArea();

  /*
   * Every node must be its own disc. Merged discs mean two nodes are drawn on top of
   * each other: one is invisible and only one of the pair can be clicked.
   */
  const discs = await discCentroids(page);
  // The node count comes from the same endpoint the island reads, so the comparison is
  // against the real data rather than a number written into the test.
  const graphData = await (await fetch(`${baseUrl}/data/es/skills.json`)).json();
  check(
    discs.length === graphData.nodes.length,
    'graph: no two nodes are drawn on top of each other',
    `${discs.length} discs for ${graphData.nodes.length} nodes`,
  );

  const positionsBefore = discs.map((disc) => `${Math.round(disc.x)},${Math.round(disc.y)}`);
  await toggles.nth(4).click();
  await page.waitForTimeout(700);
  const after = await countByArea();
  const discsAfter = await discCentroids(page);
  const kept = discsAfter.filter((disc) =>
    positionsBefore.includes(`${Math.round(disc.x)},${Math.round(disc.y)}`),
  );
  check(
    kept.length === discsAfter.length,
    'graph: hiding an area does not move the nodes that remain',
    `${kept.length} of ${discsAfter.length} stayed put`,
  );
  check(before[4] > 0, 'graph: the language area paints its own colour', `${before[4]} px`);
  check(
    after[4] === 0,
    'graph: disabling an area removes its colour from the canvas',
    `${before[4]} -> ${after[4]} px`,
  );
  check(
    before.slice(0, 4).every((count) => count > 0) && after.slice(0, 4).every((count) => count > 0),
    'graph: the other areas are untouched by the filter',
    `${JSON.stringify(before)} -> ${JSON.stringify(after)}`,
  );

  // 4. One control whose label says what pressing it will do. It used to read
  //    "re-layout" while actually clearing the filters.
  const reset = page.locator('.graph__reset');
  check((await reset.count()) === 1, 'graph: reset control present');
  const withFilters = (await reset.textContent())?.trim() ?? '';
  await reset.click();
  await page.waitForTimeout(400);
  const afterShowAll = (await reset.textContent())?.trim() ?? '';
  check(withFilters === 'Mostrar todas', 'graph: with filters active the control offers to show all', withFilters);
  check(afterShowAll !== withFilters, 'graph: clearing the filters changes the label back', afterShowAll);
  check((await discCentroids(page)).length > discsAfter.length, 'graph: showing all restores the hidden nodes');

  const positionsBeforeSeed = (await discCentroids(page)).map((disc) => `${Math.round(disc.x)},${Math.round(disc.y)}`);
  await reset.click();
  await page.waitForTimeout(2200);
  const positionsAfterSeed = (await discCentroids(page)).map((disc) => `${Math.round(disc.x)},${Math.round(disc.y)}`);
  check(
    positionsAfterSeed.filter((position) => positionsBeforeSeed.includes(position)).length !== positionsAfterSeed.length,
    'graph: re-layout moves the nodes',
    `${positionsAfterSeed.length} discs`,
  );

  await reset.focus();
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('graph__reset'));
  check(Boolean(focused), 'graph: reset control is reachable by keyboard');

  /* The canvas must not swallow a vertical scroll gesture. */
  const touchAction = await page.evaluate(
    () => getComputedStyle(document.querySelector('.graph__canvas')).touchAction,
  );
  check(touchAction.includes('pan-y'), 'graph: the canvas allows vertical panning', touchAction);

  // 5. Selecting a node announces it, so the canvas is not a black hole for a
  //    screen reader even though it cannot be explored by keyboard.
  const live = await page.locator('.graph [role="status"]').textContent();
  check((live ?? '').length > 0, 'graph: live region carries an announcement', (live ?? '').slice(0, 60));
}

async function checkTerminal(page, baseUrl) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('#terminal').scrollIntoViewIfNeeded();

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
  check(detail.includes('Monza') || detail.includes('recall') || detail.includes('1.00'), 'terminal: project shows metrics');

  await type('project actas-visitas-obras');
  const gate = await output();
  check(gate.includes('objetivo'), 'terminal: a goal metric is marked as a goal in the terminal too');

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
  await thumb.dispatchEvent('pointerdown', { pointerType: 'touch' });
  await touchPage.waitForTimeout(600);
  const touchSpeed = await touchPage.locator('.game__stat').nth(4).locator('.game__stat-value').textContent();
  await thumb.dispatchEvent('pointerup', { pointerType: 'touch' });
  check(Number(touchSpeed) > 0, 'game: the throttle pad drives the car', `speed=${touchSpeed}`);
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

    await checkSkillGraph(page, baseUrl);
    await checkTerminal(page, baseUrl);
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
