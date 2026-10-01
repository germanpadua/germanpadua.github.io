#!/usr/bin/env node
/**
 * Render `public/og-default.png` from the `/og/` route.
 *
 * The social card is a real page so it uses the site's actual fonts and tokens,
 * and this script only has to point a 1200x630 browser window at it. Run it after
 * a build; the PNG is committed and then copied by the next build.
 *
 * Run: pnpm run og-image
 */
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { withPreview } from './lib/preview-server.mjs';

const ROUTE = '/og/';
const OUTPUT = 'public/og-default.png';
const VIEWPORT = { width: 1200, height: 630 };

async function main() {
  const { baseUrl, stop } = await withPreview();
  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      colorScheme: 'light',
    });

    const response = await page.goto(`${baseUrl}${ROUTE}`, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      throw new Error(`${ROUTE} answered ${response?.status() ?? 'nothing'}`);
    }

    // Fonts must be laid out before capture or the card renders in a fallback.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const box = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    if (box.width > VIEWPORT.width || box.height > VIEWPORT.height) {
      throw new Error(
        `the OG card overflows its viewport: ${box.width}x${box.height} vs ${VIEWPORT.width}x${VIEWPORT.height}`,
      );
    }

    const buffer = await page.screenshot({ type: 'png' });
    await writeFile(OUTPUT, buffer);
    console.log(`wrote ${OUTPUT} (${VIEWPORT.width}x${VIEWPORT.height}, ${buffer.length} bytes)`);
  } finally {
    if (browser) await browser.close();
    stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
