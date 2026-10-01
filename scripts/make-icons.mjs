#!/usr/bin/env node
/**
 * Generate the raster icon set from the hand-written `public/favicon.svg`.
 *
 * The SVG is the single source of truth for the mark: edit it, re-run this, and
 * every PNG is back in sync. Rasterising goes through Chromium rather than an
 * image library, so the output uses the same renderer the site itself is tested
 * in — no native module, no separate SVG engine with its own quirks.
 *
 * Run: pnpm run icons
 */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const SVG_SOURCE = 'public/favicon.svg';

/**
 * `pad` insets the mark inside its canvas. Square icons look cramped when the
 * artwork touches the edge, and the maskable variant needs a generous safe zone
 * because Android crops it to a circle or a squircle.
 */
const TARGETS = [
  { file: 'public/apple-touch-icon.png', size: 180, pad: 0.12 },
  { file: 'public/icon-192.png', size: 192, pad: 0.12 },
  { file: 'public/icon-512.png', size: 512, pad: 0.24 },
];

const PLATE = /<rect[^>]*fill="(#[0-9a-fA-F]{3,8})"/;

/**
 * Rebuild the favicon at an inset scale: the plate stays full-bleed while the
 * mark is scaled about the centre, so padding never changes the corner radius.
 */
function padded(svg, pad) {
  const scale = 1 - pad * 2;
  const plate = svg.match(PLATE)?.[1] ?? '#0f1216';

  // Pull the drawing out of the source SVG and re-wrap it, rather than string
  // patching coordinates: the mark stays editable in one place.
  const drawing = svg
    .replace(/^[\s\S]*?<rect[^>]*\/>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${plate}" />
  <g transform="translate(16 16) scale(${scale}) translate(-16 -16)">
    ${drawing}
  </g>
</svg>`;
}

async function main() {
  const source = await readFile(SVG_SOURCE, 'utf8');
  const browser = await chromium.launch();
  const results = [];

  for (const { file, size, pad } of TARGETS) {
    const svg = padded(source, pad);
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.screenshot({ path: file, omitBackground: true });
    await page.close();

    results.push(`${file} (${size}x${size}, scale ${(1 - pad * 2).toFixed(2)})`);
  }

  await browser.close();

  await writeFile(
    'public/icons.manifest.json',
    `${JSON.stringify({ source: SVG_SOURCE, renderer: 'chromium', targets: TARGETS }, null, 2)}\n`,
  );

  for (const line of results) console.log(`wrote ${line}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
