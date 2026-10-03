/**
 * Assembles the terminal's view of the site.
 *
 * The terminal reads the same collections the page does, so it cannot drift: if a
 * project's summary changes, both the card and `project <slug>` change with it. The
 * one thing it does not get is the prose bodies, which are far too large to ship to
 * an island and are not what a terminal is for.
 */
import {
  getEducation,
  getExperience,
  getHighlights,
  getProjects,
  getSite,
  getSkillGraph,
  projectPath,
  projectsIndexPath,
  skillMapPath,
  type MetricBasis,
} from './content';
import { identity, themeIds, type Locale } from '../i18n/ui';
import type { TerminalContent } from '../components/islands/terminal/commands';

export async function buildTerminalContent(locale: Locale): Promise<TerminalContent> {
  const [projects, experience, education, highlights, graph, site] = await Promise.all([
    getProjects(locale),
    getExperience(locale),
    getEducation(locale),
    getHighlights(locale),
    getSkillGraph(),
    getSite(locale),
  ]);

  return {
    identity: {
      name: identity.name,
      email: identity.email,
      github: identity.github,
      linkedin: identity.linkedin,
      location: identity.location[locale],
    },
    projects: projects.map((entry) => {
      const data = entry.data;
      return {
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        year: data.year,
        status: data.status,
        visibility: data.visibility,
        stack: [...data.stack],
        metrics: data.metrics.map((metric) => ({
          value: metric.value,
          label: metric.label,
          basis: metric.basis as MetricBasis,
        })),
        ...(data.links.repo ? { repo: data.links.repo } : {}),
        ...(data.links.demo ? { demo: data.links.demo } : {}),
        ...(data.team ? { team: data.team.name } : {}),
        path: projectPath(locale, data.slug),
      };
    }),
    experience: experience.map((entry) => ({
      title: entry.data.title,
      organisation: entry.data.organisation,
      period: entry.data.period,
      summary: entry.data.summary,
    })),
    education: education.map((entry) => ({
      title: entry.data.title,
      institution: entry.data.institution,
      period: entry.data.period,
      ...(entry.data.grade ? { grade: entry.data.grade } : {}),
    })),
    highlights: highlights.map((entry) => ({
      title: entry.data.title,
      issuer: entry.data.issuer,
      period: entry.data.period,
      ...(entry.data.headline ? { headline: entry.data.headline.value } : {}),
    })),
    interests: site.interests.map((group) => ({ group: group.group, items: [...group.items] })),
    skills: graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      area: node.area,
      weight: node.weight,
      note: node.note[locale],
    })),
    areas: graph.areas.map((area) => ({ id: area.id, label: area.label[locale] })),
    paths: {
      projects: projectsIndexPath(locale),
      skills: `${locale === 'es' ? '/' : '/en/'}#skills`,
      work: `${locale === 'es' ? '/' : '/en/'}#work`,
      education: `${locale === 'es' ? '/' : '/en/'}#education`,
      contact: `${locale === 'es' ? '/' : '/en/'}#contact`,
      playground: `${locale === 'es' ? '/' : '/en/'}#game`,
      map: skillMapPath(locale),
    },
    themes: [...themeIds],
    otherLocale: {
      code: locale === 'es' ? 'en' : 'es',
      href: locale === 'es' ? '/en/' : '/',
    },
    skillCount: graph.nodes.length,
    edgeCount: graph.edges.length,
  };
}
