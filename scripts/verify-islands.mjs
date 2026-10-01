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
  await toggles.nth(4).click();
  await page.waitForTimeout(1600);
  const after = await countByArea();
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

  // 4. The reset control exists and is reachable by keyboard.
  const reset = page.locator('.graph__reset');
  check((await reset.count()) === 1, 'graph: reset control present');
  await reset.focus();
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('graph__reset'));
  check(Boolean(focused), 'graph: reset control is reachable by keyboard');

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
