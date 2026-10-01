// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

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
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-GB',
        },
      },
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
