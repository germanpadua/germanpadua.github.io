import type { APIRoute } from 'astro';
import { getSkillGraph } from '../../../lib/content';
import { locales, type Locale } from '../../../i18n/ui';

/*
 * The skill graph, one locale at a time. Same reasoning as the terminal endpoint:
 * 28 KB of node and edge data was being serialised into the home page's HTML, and
 * the graph itself is only fetched when a reader scrolls to it.
 */
export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = async ({ params }) => {
  const locale = (params.locale ?? 'es') as Locale;
  const graph = await getSkillGraph();
  const payload = {
    areas: graph.areas.map((area) => ({
      id: area.id,
      label: area.label[locale],
      blurb: area.blurb[locale],
    })),
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      area: node.area,
      weight: node.weight,
      note: node.note[locale],
      projects: [...node.projects],
    })),
    edges: graph.edges.map((edge) => ({ from: edge.from, to: edge.to, kind: edge.kind })),
  };
  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
