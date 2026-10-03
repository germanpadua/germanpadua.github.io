import type { APIRoute } from 'astro';
import { getSkillGraph, getProjects, getEducation, projectPath } from '../../../lib/content';
import { buildSkillMeta } from '../../../lib/skillGraph/meta';
import { locales, type Locale } from '../../../i18n/ui';
import { skillLabel } from '../../../lib/skillLabels';

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
  const [projects, education] = await Promise.all([getProjects(locale), getEducation(locale)]);
  /*
   * Level and freshness are derived once, at build time, from the collections
   * the repository already has — never in the browser, and never with invented
   * data. `asOf` is the authored review date in graph.json; the derived counts
   * travel next to the nodes so the legend can print the rules it applies.
   */
  const meta = buildSkillMeta({
    graph,
    projects: projects.map(({ data }) => ({ slug: data.slug, year: data.year })),
    education: education.map(({ data }) => ({ kind: data.kind, start: data.start, end: data.end })),
    asOf: graph.asOf,
  });
  const payload = {
    projectIndex: Object.fromEntries(projects.map(({ data }) => [data.slug, { title: data.title, path: projectPath(locale, data.slug) }])),
    areas: graph.areas.map((area) => ({
      id: area.id,
      label: area.label[locale],
      blurb: area.blurb[locale],
    })),
    nodes: graph.nodes.map((node) => {
      // buildSkillMeta iterates the same node list, so a miss here would mean a
      // graph that changed under us; fail the build instead of emitting a node
      // whose level nobody derived.
      const derived = meta.nodes[node.id];
      if (!derived) {
        throw new Error(`skill graph node "${node.id}" has no derived meta`);
      }
      return {
        id: node.id,
        label: skillLabel(node.label, locale),
        area: node.area,
        weight: node.weight,
        note: node.note[locale],
        projects: [...node.projects],
        courses: node.courses,
        level: derived.level,
        freshness: derived.freshness,
        lastActivityYear: derived.lastActivityYear,
      };
    }),
    edges: graph.edges.map((edge) => ({ from: edge.from, to: edge.to, kind: edge.kind })),
    meta: meta.meta,
  };
  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
