import type { APIRoute } from 'astro';
import { buildTerminalContent } from '../../../lib/terminalContent';
import { locales, type Locale } from '../../../i18n/ui';

/*
 * The terminal's snapshot of the site, served as one small JSON file per locale.
 *
 * It lives here rather than in island props because Astro serialises props into the
 * HTML: the two islands together added 71 KB of attribute payload to the home page,
 * which every reader, crawler and no-JavaScript visitor paid for. As an endpoint it
 * is fetched once, only by readers who actually load the island, and it is cacheable.
 */
export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params }) => {
  const locale = (params.locale ?? 'es') as Locale;
  const content = await buildTerminalContent(locale);
  return new Response(JSON.stringify(content), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
