// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

/**
 * germanpadua.github.io — static site, deployed to GitHub Pages from `main`.
 * Base path stays empty because the marketing domain is the repository user site.
 */
export default defineConfig({
  site: 'https://germanpadua.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  /**
   * Fonts are fetched at build time and self-hosted, so the site makes no
   * third-party request at runtime and the payload guard stays meaningful.
   * Three faces carry the whole identity:
   *   --font-serif  display for the atlas themes (a maths paper, not a landing page)
   *   --font-sans   body everywhere, and display for nebula
   *   --font-mono   data, code, and display for phosphor
   */
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-serif',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      /*
       * Normal only. The italic face was a separate 64.5 KB file, downloaded on every
       * route for two small uses: a blockquote rule that no content triggers, and the
       * confidentiality note under a project plate. The note now reads as a quiet aside
       * with a rule and a muted colour, which costs nothing and reads better inside the
       * editorial layout than a slanted serif did.
       */
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['Georgia', 'serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.google(),
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  integrations: [
    /*
     * Preact, not React. The three interactive layers are self-contained and none
     * of them needs the React DOM runtime: React 19 ships a ~220 KB client chunk,
     * Preact the same JSX ergonomics for a few KB. The document shell stays at
     * zero external JavaScript either way, but the islands should not cost a
     * quarter of a megabyte on a recruiter's phone.
     */
    preact({ compat: false }),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-GB',
        },
      },
      /* Working routes, not content: they must never reach a crawler. */
      filter: (page) => !/\/(lab|og)\/?($|[?#])/.test(page),
    }),
  ],
  vite: {
    build: {
      // Keep the interactive islands as separate chunks so the document shell
      // stays JavaScript-free for readers who never touch terminal/graph/game.
      cssCodeSplit: true,
    },
  },
});
